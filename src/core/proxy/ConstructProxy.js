import { Render } from "../render/Render"

/**
 * 数据代理类
 */
export class ConstructProxy {
    static arrayProto = Array.prototype
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
                // 数组的每一项都需要代理 递归
                proxyObj[i] = this.proxy(vm, obj[i], namespace)
            }
            // 代理这整个数组
            proxyObj = this.proxyArray(obj, vm, namespace)
        } else if (obj instanceof Object) { // 判断这个对象是不是对象
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
            // 方法其实也是k-v结构  push: function()
            value: (...args) => {
                let original = this.arrayProto[func]
                const result = original.apply(this, args)
                // 数组调用了方法也需要重新渲染
                Render.dataRender(vm, this.getNameSpace(namespace, ''))
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
            Object.defineProperty(proxyObj, key, {
                configurable: true,
                get: () => obj[key],
                set: (value) => {
                    obj[key] = value
                    // 数据修改之后 重新渲染节点
                    Render.dataRender(vm, this.getNameSpace(namespace, key))
                }
            })
            // 代理到vm上 让Rue对象可以直接调用
            Object.defineProperty(vm, key, {
                configurable: true,
                get: () => obj[key],
                set: (value) => {
                    obj[key] = value
                    // 数据修改之后 重新渲染节点
                    Render.dataRender(vm, this.getNameSpace(namespace, key))
                }
            })
            // 如果对象的属性是对象，递归深层代理
            if (obj[key] instanceof Object) {
                proxyObj[key] = this.proxy(vm, obj[key], this.getNameSpace(namespace, key))
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
        if (!nowNamespce) {
            return nowProp
        } else if (!nowProp) {
            return nowNamespce
        } else {
            return nowNamespce + '.' + nowProp
        }
    }
}