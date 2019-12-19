import { Tool } from "../util/Tool";

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