import { ConstructProxy } from './proxy.js'

// mvvm框架初始化方法
export class InitMixin {
   constructor () {
    this.uid = 0
    this.isRue = true
    this.data = null
   }

    init(options){
        this.uid++ // rueId 防止重复
        this.isRue = true // 是否是Rue对象
        // 1.初始化data 代理
        if (options && options.data) {
            this.data = ConstructProxy.proxy(this, options.data, '')
        }
        // 2.初始化created
        // 3.初始化methods
        // 4.初始化computed
        // 5.初始化el并挂载
    }
}