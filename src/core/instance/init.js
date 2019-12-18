import { ConstructProxy } from '../proxy'
import { Mount } from '../vdom/mount.js'

// mvvm框架初始化方法
export class InitMixin {
   constructor () {
    this._uid = 0
    this._isRue = true
    this._data = null
   }

    init(options){
        this._uid++ // rueId 防止重复
        this._isRue = true // 是否是Rue对象
        // 1.初始化data 代理
        if (options && options.data) {
            this._data = ConstructProxy.proxy(this, options.data, '')
        }
        // 2.初始化el并挂载
        if (options && options.el){
            let rootDom = document.getElementById(options.el)
            Mount.mount(this, rootDom)
        }
        // 3.初始化created
        // 4.初始化methods
        // 5.初始化computed 
    }
}