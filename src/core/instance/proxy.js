export class ConstructProxy {
    constructor () {
        this.arrayProto = Array.prototype
    }
    /**
     * 代理方法
     * @param vm Rue对象
     * @param obj 需要代理的对象
     * @param namespace 命名空间 表示当前修改的是哪个属性
     */
    static proxy(vm, obj, namespace) {
        let proxyObj = null
        if (obj instanceof Array) { // 判断这个对象是不是数组
            const len = obj.length
            proxyObj = new Array(len)
            for (let i = 0; i < len; i++) {
                proxyObj[i] = this.proxy(vm, obj[i], namespace)
            }
            proxyObj = this.proxyArray(obj, vm, namespace)
        } else if (obj instanceof Object) {
            proxyObj = this.proxyObject(obj, vm, namespace)
        } else {
            throw new Error('error: 错误的类型---' + obj + ', 应为对象或者数组')
        }
        return proxyObj
    }
    /**
     * 代理数组
     * @param arr 需要代理的数组
     * @param vm Rue对象
     * @param namespace 命名空间
     */
    static proxyArray(arr, vm, namespace) {
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
            pop() {},
            shift() {},
            unshift() {}
        }
        this.proxyArrayFunc.call(vm, proxyObject, 'push', namespace, vm)
        this.proxyArrayFunc.call(vm, proxyObject, 'pop', namespace, vm)
        this.proxyArrayFunc.call(vm, proxyObject, 'shift', namespace, vm)
        this.proxyArrayFunc.call(vm, proxyObject, 'unshift', namespace, vm)
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
    static proxyArrayFunc(obj, func, namespace, vm) {
        Object.defineProperty(obj, func, {
            enumerable: true,
            configurable: true,
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
    static proxyObject(obj, vm, namespace) {
        let proxyObj = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                Object.defineProperty(proxyObj, key, {
                    configurable: true,
                    get() {
                        return obj[key]
                    },
                    set: (value) => {
                        obj[key] = value
                    }
                })
                // 代理到vm上 让Rue对象可以直接调用
                Object.defineProperty(vm, key, {
                    configurable: true,
                    get() {
                        return vm[key]
                    },
                    set: (value) => {
                        vm[key] = value
                    }
                })
                // 如果对象的属性是对象，递归深层代理
                if (obj[key] instanceof Object) {
                    proxyObj[key] = this.proxy(vm, obj[key], this.getNameSpace(namespace, key))
                }
            }
        }
        return proxyObj
    }
    /**
     * 获取当前的命名空间
     * @param nowNamespce 当前的命名空间
     * @param nowProp 当前要修改的属性
     */
    static getNameSpace(nowNamespce, nowProp) {
        if (nowNamespce == '') {
            return nowProp
        } else if (nowProp == '') {
            return nowNamespce
        } else {
            return nowNamespce + '.' + nowProp
        }
    }
}