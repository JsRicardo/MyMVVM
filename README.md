# MVVM框架源码解析

在学习react 和 vue 这种 **MVVM** 框架的使用之后，是时候来尝试着学习MVVM框架的源码了。
项目链接 [简易版mvvm框架源码](https://github.com/JsRicardo/MyMVVM)

mvvm框架的核心就是虚拟节点，数据双向绑定...

先来一段简单的代码
```js
new Rue({
    el: 'app',
    data: {
        content: 'ricardo',
        desc: '很帅',
        dec: {
            x: 1,
            y: 2
        },
        list: [{
            name: 'ee',
            age: 13
        }]
    }
})
```
这是一段简单的VUE类型代码，一个挂载节点，一个data数据对象。那么MVVM框架又是怎么把这些代码转换成网页（dom），实现数据双向绑定的呢？

# 思路

- 要想让数据和dom之间双向绑定，必然要建立某种联系（废话嘛...），VUE中有个很经典的概念虚拟节点树，将dom节点和数据添加映射，实现双向绑定。

- 但是怎么监听数据的改变，实现改变页面数据呢？ 众所周知，对象的属性改变，外部是感知不到的。这里就用到了代理，（*目前版本的VUE还是defineProperty，最新版本的VUE已经换成了proxy。*）所以还需要一个代理。

- 得到这些数据，映射之后，当然就是渲染页面了。

所以路线大概是这样的： 将data对象传递给VUE，VUE将对象代理了，将dom节点也给获取到，生成一个虚拟的dom节点树，将dom节点钟带有模板语法的地方和数据进行双向映射，渲染页面...

接下来就动手写代码

# 编码
## webpack配置
工欲善其事必先利其器，配置好环境之后才能更好的编码嘛，这里只用到了webpack的热更新，模板html文件，babel-loader而已（babel我配置了stage0，因为需要用到静态方法和静态属性）。代码就不贴了，很简单，有兴趣可以去我的[github]((https://github.com/JsRicardo/MyMVVM))看源码

- 目录结构
```
├─public
    └─index.html // 模板页
├─src
    ├─core // 项目主文件夹
        ├─instance // Rue父类，创建方法
        ├─proxy // 代理数据
        ├─render // 渲染方法
        ├─grammar // 自定义语法
        ├─util // 工具类
        ├─vdom // 生成虚拟节点树
        └─index.js // 导出Rue类
    └─index.js // 主文件
├─.babelrc
├─.gitignor
├─.package.json
├─README.md
└─webpack.config.js
```
接下来就是见证奇迹的时刻，经过一系列编码后，页面实现了！！！
![Rue实现效果](https://user-gold-cdn.xitu.io/2019/12/18/16f189a76e0ae2c4?w=423&h=533&f=jpeg&s=11396)

## 编码实现顺序
### 一、Rue类
要想实现new Rue 首先要有一个Rue类，他接收一个对象，里面有el,data...等，并对这些数据进行处理。在instance中建立一个Rue.js文件。

我希望这个Rue类在被new的时候，有一个方法可以进行一系列的初始化，所以有了一个```_init```方法，将options传给他处理。

还要有一个```_render```方法，在初始化完了之后，调用```_render```就能渲染数据
```js
export class Rue extends InitMixin {
    constructor(options) {
        super()
        this._init(options)
        this._render()
    }
}
```

为了代码的好看，结构清晰，Rue只做调用方法，那么初始化数据在哪里做呢？新建一个InitMixin文件，在这里来做数据处理，方法实现。

InitMixin需要做的事情就是构造一些方法，让Rue在new的时候可以直接使用。
-  _init需要做的事情就是初始化代理data中的数据， 初始化ele并且挂载， 初始化...
-  _render则是提供渲染方法
```js
export class InitMixin {
    constructor() {
        this._uid = 0
        this._isRue = true
        this._data = null
        this._vnode = null
    }

    _init(options) {
        this._uid++ // rueId 防止重复
        this._isRue = true // 是否是Rue对象
        // 1.初始化data 代理
        if (options && options.data) {
            this._data = ConstructProxy.proxy(this, options.data, '')
        }
        // 2.初始化el并挂载
        if (options && options.el) {
            let rootDom = document.getElementById(options.el)
            Mount.mount(this, rootDom)
        }
        // 3.初始化created
        // 4.初始化methods
        // 5.初始化computed 
    }
    
    _render() {
        Render.renderNode(this, this._vnode)
    }
}
```
### 二、代理数据（proxy）

有了Rue之后，能够接收到传入的值了，接下来进行代理数据

- 代理数据又分为代理对象，和代理数组
- 这里的代理只需要用到```defineProperty```，并且进行递归就行了（因为会有对象套对象的情况）
- 代理数组时这里只代理了数组的几个方法。
- 代理数组的方法时需要代理的其实就是方法的Value => ```push:function(){}```
- **注意：** 因为对象可能有多层，所以需要一个命名空间```namespace```来存储这个值，以便后面取值的时候，可以知道需要取得是哪个对象下的哪一个值。例如```obj.a``` ```obj.b```
 
```js
export class ConstructProxy {
    static arrayProto = Array.prototype
    /**
     * 代理方法
     * @param vm Rue对象
     * @param obj 需要代理的对象
     * @param namespace 命名空间 表示当前修改的是哪个属性
     */
    static proxy(vm, obj, namespace) {}
    /**
     * 代理数组
     * @param arr 需要代理的数组
     * @param vm Rue对象
     * @param namespace 命名空间
     */
    static proxyArray(arr, vm, namespace) {
        // 将数组当做一个 k-v结构来进行代理
        let proxyObject = {
            eleType: 'Array',
            toString: () => {
                let res = ''
                arr.forEach(it => {
                    res += it + ', '
                })
                return res.substring(0, res.length - 2)
            },
            push() {},
        }
        this.proxyArrayFunc.call(vm, proxyObject, 'push', namespace, vm)
        arr.__proto__ = proxyObject
        return arr
    }
    /**
     * 代理数组的方法
     * @param obj 数组对象
     * @param func 方法
     * @param namespace 命名空间 
     * @param vm Rue对象
     */
    static proxyArrayFunc(obj, func) {
        Object.defineProperty(obj, func, {
            enumerable: true,
            configurable: true,
            // 方法其实也是k-v结构  push: function()
            value: (...args) => {
                let original = this.arrayProto[func]
                const result = original.apply(this, args)
                return result
            }
        })
    }

    /**
     * 代理对象
     * @param obj 需要代理的对象
     * @param vm Rue对象
     * @param namespace 命名空间 表示当前修改的是哪个属性
     */
    static proxyObject(obj, vm, namespace) {}
    /**
     * 获取当前的命名空间
     * @param nowNamespce 当前的命名空间
     * @param nowProp 当前要修改的属性
     */
    static getNameSpace(nowNamespce, nowProp) {}
}
```

### 三、构建虚拟节点树（VDOM）

虚拟节点树VDOM 是MVVM框架中非常重要的一个概念，正是因为这个东西，让我们不再直接的操作DOM元素，大大的提升了性能。

- 虚拟节点树，其实就是将dom结构，用一颗树的结构存起来。
- **注意：** 换行也是一个节点，文字是文字节点
- 需要操作的就是文字节点的模板字符串

先构建一个节点对象
```js
/**
 * 虚拟节点类
 * 和真实节点相互对应
 */
export class VNode {
    constructor(
        tag, // 标签名称： DIV SPAN #TEXT
        ele, // 对应的真实节点
        children, // 子节点
        text, // 当前节点的文本
        data, // VNodeData 保留字段
        parent, // 父级节点
        nodeType, // 节点类型
    ) {
        this.tag = tag
        this.ele = ele
        this.children = children
        this.text = text
        this.data = data
        this.parent = parent
        this.nodeType = nodeType
        this.env = {} // 当前节点的环境变量 v-for等时  这个节点在什么环境下
        this.instructions = null // 存放指令 v-for v-if...
        this.template = [] // 当前节点涉及的模板
    }
}
```

现在有了节点对象了，接下来根据dom树，把这些一个一个的VNODE组成一颗VDOM就行了

```js
export class Mount {
    /**
     * 允许不传el，创建完Rue之后，进行手动挂载
     * @param {*} Rue Rue对象
     */
    static inintMount(Rue) {
        Rue.prototype.$mount = (el) => {
            let rootDom = document.getElementById(el)
            this.mount(Rue, rootDom)
        }
    }
    /**
     * 挂载节点
     * @param {*} vm 
     * @param {*} ele 
     */
    static mount(vm, ele) {
        // 挂载节点
        vm._vnode = this.constructVNode(vm, ele, null)
        // 进行预备渲染 建立渲染索引 模板和vnode的双向索引
        RenderTool.prepareRender(vm, vm._vnode)
    }
    /**
     * 构建虚拟节点树
     * @param {*} vm 
     * @param {*} ele dom节点
     * @param {*} parent 父节点
     */
    static constructVNode(vm, ele, parent) {
        // 创建节点
        vnode = new VNode(tag, ele, children, text, data, parent, nodeType)
        let childs = vnode.ele.childNodes
        // 深度优先遍历 创建节点
        // ...
        return vnode
    }
    /**
     * 获取文本节点的文本
     * @param {*} ele dom节点 
     */
    static getNodeText(ele) {
        if (ele.nodeType === 3) {
            return ele.nodeValue
        }
        return ''
    }
}
```

### 四、渲染（render）

有了虚拟节点树，有了数据，接下来就是渲染了？NO，我们需要先创建一个虚拟节点树和数据的双向映射，便于以后做双向数据绑定。

先来一个工具类, 在render文件夹建立一个RenderTool类
```js
export class RenderTool {
    static vnode2Template = new Map()
    static template2VNode = new Map()
    /**
     * 预备渲染
     * @param {*} vm Rue对象
     * @param {*} vnode 虚拟节点
     */
    static prepareRender(vm, vnode) {
        if (vnode === null) return
        if (vnode.nodeType === 3) {
            // 文本节点 分析文本节点的内容，是否有模板字符串 {{}}
            this.analysisTemplateString(vnode)
        }
        if (vnode.nodeType === 1) {
            // 标签节点，检查子节点
            for (let i = 0, len = vnode.children.length; i < len; i++) {
                // 遍历根节点
                this.prepareRender(vm, vnode.children[i])
            }
        }
    }
    /**
     * 检查文本节点中是否存在模版字符串,建立映射
     * @param {*} str 文本节点内容
     */
    static analysisTemplateString(vnode) {}
    /**
     * 建立模板到节点的映射
     * 通过模板 找到那些节点用到了这个模板
     * @param {*} template 
     * @param {*} vnode 
     */
    static setTemplate2VNode(template, vnode) {}
    /**
     * 建立节点到模板的映射
     * 通过节点 找到这个节点下有哪些模版
     * @param {*} template 
     * @param {*} vnode 
     */
    static setVNode2Template(template, vnode) {}

    static getTemplateText(template) {
        // 截掉模板字符串的花括号
        return template.substring(2, template.length - 2)
    }
    /**
     * 获取模板字符串在data或者env中的值
     * @param {*} objs [data, vnode.env]
     * @param {*} target 目标值
     */
    static getTemplateValue(objs, target) {}
    
    static getObjValue(obj, target) { // data.content }
}
```

万事俱备，接下来就来进行第一次渲染吧！

在render文件夹下建立Render类，负责渲染的工作
- 渲染就是根据之前建立的数据到节点的映射，去替换虚拟节点树中的nodeVlue

```js
export class Render {
    /**
     * 渲染节点
     * @param {*} vm Rue对象
     * @param {*} vnode 虚拟节点树
     */
    static renderNode(vm, vnode) {
        if (vnode.nodeType === 3) {
            // 如果是一个文本节点 就渲染文本节点
            // ...
        } else {
            // 如果不是文本节点就遍历子节点
            for (let i = 0, len = vnode.children.length; i < len; i++) {
                this.renderNode(vm, vnode.children[i])
            }
        }
    }
}
```

### 五、修改数据之后，自动渲染

想要修改数据之后，页面能够跟着自动渲染，数据和页面必然要联系起来，而且要能监听数据的改变，这也是为什么前面要将模板和数据做双向映射，并且要代理数据的原因。

OK，现在有了代理之后的数据，也有了```template2VNode```这个映射，修改数据之后，自动渲染就只需要在调用对象的```set```方法时，找到修改的属性对应的虚拟节点，更新虚拟节点的值就可以了。

先在Render类中添加一个template寻找vnode的方法
```js
export class Render {
    /**
     * 渲染节点
     * @param {*} vm Rue对象
     * @param {*} vnode 虚拟节点树
     */
    static renderNode(vm, vnode) {}
    /**
     * 根据数据渲染节点
     * @param {*} vm rue对象
     * @param {*} data 要渲染的数据
     */
    static dataRender(vm, data) {
        // 根据映射  找到使用这个模板的所有虚拟节点
        const vnodes = RenderTool.template2VNode.get(data)
        if (vnodes !== undefined) {
            for (let i = 0, len = vnodes.length; i < len; i++) {
                // 渲染
                this.renderNode(vm, vnodes[i])
            }
        }
    }
}
```
有了这个方法之后只需要在代理对象的set方法里面轻轻的调用```Render.dataRender```即可实现改变数据，刷新页面数据。

![实时刷新数据](https://wx2.sinaimg.cn/mw690/005QwFx4gy1ga20549asoj30lh0b2t8s.jpg)

## 标签上属性解析

标签上的属性就是诸如 v-model v-for v-bind... 之类的东西，那么他们应该在哪里处理呢？

之前有Mount类里面有一个方法```constructVNode```，在这里，处理了虚拟节点树的构建，这里也能拿到原生的dom节点，所以我决定在这里处理节点上面的属性

- 在Mount类中新增一个静态方法 ```analysisAttr```，用以分析节点上面的属性，在```constructVNode```第一行调用这个方法。

```js
    /**
     * 构建虚拟节点树
     * @param {*} vm 
     * @param {*} ele dom节点
     * @param {*} parent 父节点
     */
    static constructVNode(vm, ele, parent) {
        this.analysisAttr(vm, ele, parent) // 挂载之前就需要分析标签上面的属性
        // 创建节点
        // 深度优先遍历 创建子节点
    }
    /**
     * 分析标签节点的属性 v-model v-for...
     * @param {*} vm Rue对象
     * @param {*} ele 节点
     * @param {*} parant 父节点
     */
    static analysisAttr(vm, ele, parant) {
        if (ele.nodeType === 1) {
            // 标签节点才需要进行属性分析
            let attrs = ele.getAttributeNames();
            if (attrs.indexOf('v-model') !== -1) {
                // 如果有v-model就执行vmodel双向数据绑定
                Grammar.vmodel(vm, ele, ele.getAttribute('v-model'))
            }
        }
    }
```
OK, ```analysisAttr```就是用来处理节点上面的自定义指令的方法（自定义方法称为grammar，放在grammar文件夹下）

接下来，就需要一个Grammar类用来处理自定义指令方法，那就新建一个Gramma类。

### v-model

v-model在vue中就是用来实现双向数据绑定的一个指令。他要做的事情就是将可改变值的元素和data中的某一个值进行绑定，改变其中一个，另一个也跟着改变。

有了之前数据渲染了方法，已经处理了首次数据渲染，数据改变渲染节点，这里就只需要处理文本输入时，改变数据了。

那么方法就是：在触发元素的onchange事件时，动态改变元素和data中的值。

这里为了方便新建一个util文件夹，导出一个Tool工具类，用于设置对象的值，还有获取对象的值。简单的递归就行。

```js
export class Tool{
    /**
     * 获取对象的某个值
     * @param {*} obj 对象
     * @param {*} target 想要获取的目标属性 data.content
     */
    static getObjValue(obj, target) {}
    /**
     * 设置对象的某个值
     * @param {*} obj 对象
     * @param {*} target 想要设置的目标属性 data.content
     * @param {*} value 设置的值
     */
    static setObjValue(obj, target, value) {}
}
```
实现Grammar类

```js
/**
 * 规定语法类
 */
export class Grammar{
    /**
     * v-model双向数据绑定
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} data 
     */
    static vmodel (vm, ele, data) {
        // 设置元素的初始值
        ele.value = Tool.getObjValue(vm, data)
        ele.onchange = e => {
            // 元素值改变之后需要进行双向改变
            Tool.setObjValue(vm._data, data, ele.value)
        }
    }
}
```

OK，改造一下模板网页

```html
<div id='app'>
    <div>{{content}}, {{desc.x}}</div>
    <div>{{desc.y}}</div>
    <span>粉丝：{{fans}}</span>
    <hr>
    <input type="text" v-model='fans' />
</div>
```

接下来就是见证奇迹的时刻！

首次渲染成功！
![首次渲染](https://wx2.sinaimg.cn/mw690/005QwFx4gy1ga25hexy6tj30gb09n0sp.jpg)

input框中输入数据，双向绑定成功！
![双向绑定](https://wx4.sinaimg.cn/mw690/005QwFx4gy1ga25hf0invj30e20ardfq.jpg)

### v-bind

TO BE CONTIBUE