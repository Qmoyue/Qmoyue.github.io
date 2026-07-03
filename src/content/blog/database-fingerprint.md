---
title: "数据库识别"
description: "数据库指纹识别总结，整理 SQL 注入场景下判断数据库类型的常用方法。"
pubDate: "2026-03-26"
updatedDate: "2026-03-26"
tags: ["数据库", "SQL", "Web安全"]
cover: auto
coverAlt: "数据库识别 的文章封面"
draft: false
---
## SQL注入如何判断数据库

### 1.根据前端语言判断

**asp / asp.net** : SQL Server
**PHP** :  MySQL / PostgreSQL
**java** : MySQL / PostgreSQL / Oracle

### 2.默认端口

**MySQL** : 3306
**PostgreSQL** : 5432
**SQL Server** : 1433
**Oracle** : 1521

### 3.字符串拼接

`'a' + 'b' = 'ab'` : SQL Server / MySQL
`'a' || 'b' = 'ab'` : PostgreSQL / Oracle
`CONCAT()` : MySQL / PostgreSQL / Oracle

### 4.注释符识别

`#` : MySQL
`-- ` : 通用

### 5.语法

`LIMIT 1` : MySQL / PostgreSQL
`TOP` : SQL Server
`ROWNUM` : Oracle

### 6.长度函数

`LEN()` : SQL Server
`LENGTH()` : MySQL / PostgreSQL / Oracle

### 7.版本函数

`version()`
`@@version`

### 8.元数据表

`information_schema.tables` :  MySQL / PostgreSQL
`pg_catalog.pg_tables` : PostgreSQL
`sysobjects` : SQL Server
`sys.user_tables` : Oracle

### 9.睡眠函数

`pg_sleep()` : PostgreSQL (`PG_SLEEP(5)` 、 `GENERATE_SERIES(1,1000000)`)
`sleep()` : MySQL (`SLEEP(5)` 、 `BENCHMARK(1000000,ENCODE('QWE','ASD'))`)
`WAITFOR` : SQL Server (`WAITFOR DELAY '0:0:5'`)

### 补充

**Oracle**不支持多行查询，`;`会报错
**MySQL**: `substring()` 和 `substr()`
**SQL Server**: `substring()`
**Oracle**: `substr()`