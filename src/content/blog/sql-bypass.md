---
title: "SQL绕过"
description: "SQL 注入绕过技巧总结，整理过滤场景、绕过思路和常见 payload 变形。"
pubDate: "2026-03-26"
updatedDate: "2026-03-26"
tags: ["SQL", "绕过", "Web安全"]
cover: auto
coverAlt: "SQL绕过 的文章封面"
draft: false
---
## SQL注入绕过技巧

- 各种编码绕过：如 URL 编码，Unicode 编码，base64，hex 编码以及双重编码等
- 字母大小写绕过：对关键函数名大小写混用，可以绕过只过滤全小写 / 全大写
- 空格过滤绕过：用空白字符替换空格、用 `+` 替换空格、用注释符 `/**/` 替换空格
- 双写关键字绕过：可以绕过只对关键字过滤一次的情况
- 内联注释绕过：MySQL 扩展了注释，在 `/**/` 中如果插入 `!` ，则里面的语句会被执行 ( `/*!50001sleep(3)*/` )
- GET/POST 绕过：更换请求方式，绕过只针对一种请求方式过滤的情况
- 复参数绕过：对一个参数多次赋值，可能会出现前后端处理不一致的情况 ( `?id=1&id=2 and sleep(3)` )
- 添加 `%` ：如 `se%lect` ，可能会被还原为 `select`
- `00` 截断： `?a=1%00&id=1 and sleep(3)`
- 用转义字符防御时，如果遇到数据库的列名或是表名本身就带着特殊字符，应该怎么做----------列名、表名使用反引号

- 报错注入原理:人为制造一些错误条件，使得查询结果能够出现在报错信息中
- 异或注入(联合注入： union被过滤,报错注入：and、or、updatexml被过滤,盲注: and or 被过滤,可以拿0去和其他的异或，和布尔盲注差不多)
- 无列名注入(把联合查询的语句当成表明)
- if被过滤(使用case或者elt)
- infomation_schema被过滤（高版本sql有mysql.innodb_table_stats和sys.schema_auto_increment_columns）