import {
    VNode
} from "../vdom/VNode";
import { Tool } from "../util/Tool";

export class GrammarTool {
    /**
     * 生成循环体的虚拟模板节点
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} parent 
     * @param {*} vForText vofr指令
     */
    static vForInit(vm, ele, parent, vForText) {
        // 构建虚拟模板节点li 此时形参data就应该存的是循环的list，方便后面的数据处理
        const strArr = this.getInstruction(vForText)
        const data = strArr[strArr.length - 1]
        const vNode = new VNode(ele.nodeName, ele, [], '', data, parent, 0)
        // 生成了虚拟模板节点之后，需要删除原本的模板节点
        parent.ele.removeChild(ele)
        // 当把这个节点删除之后，dom也会顺带的删除一个文本节点，最后就剩一个文本节点
        // 此时应新增一个无意义的文本节点
        parent.ele.appendChild(document.createTextNode(''))

        // 分析vfor指令需要做什么
        this.analysisInstructions(vm, ele, parent, strArr)

        return vNode
    }
    /**
     * 分析指令
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} parent 
     * @param {*} instructions 指令内容
     */
    static analysisInstructions(vm, ele, parent, instructions) {
        const data = instructions[instructions.length - 1] // 取出循环的数据
        let vmData = Tool.getObjValue(vm._data, data)
        if (!vmData) throw new Error(`error: ${data} is undefine`)
       
        // 创建标签
        for(let i = 0, len = vmData.length; i < len; i++){
            const tempDom = document.createElement(ele.nodeName)
            tempDom.innerHTML = ele.innerHTML
            // 获取这个dom的环境变量
            const env = this.analysisKV(instructions, vmData[i], i)
            tempDom.setAttribute('env', JSON.stringify(env))
            // 挂载到父节点下，以便后面解析dom生成vDom
            parent.ele.appendChild(tempDom)
        }
    }
    /**
     * 解析指令语法
     * @param {*} text 指令内容 
     */
    static getInstruction (text) {
        // (item, index) in list
        // 定义vfor指令只能这样写
        // 解析vfor的指令，这里就简单粗暴的解析一下，不按编译原理去解析了
        const strArr = text.trim().split(' ') 
        strArr[0] = strArr[0].replace('(', '').replace(',', '')
        strArr[1] = strArr[1].replace(')', '')
        return strArr
    }
    /**
     * 组装dom节点的局部变量
     * @param {*} key 
     * @param {*} data 
     * @param {*} index 
     */
    static analysisKV(key, data, index) {
        let obj = {}
        obj[key[0]] = data
        obj[key[1]] = index
        return obj
    }
}