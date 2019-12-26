import {
    Tool
} from "../util/Tool";
import {
    GrammarTool
} from "./GrammarTool";
import {
    VNode
} from "../vdom/VNode";
/**
 * 规定语法类
 */
export class Grammar {
    /**
     * v-model双向数据绑定
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} data 
     */
    static vmodel(vm, ele, data) {
        // 设置元素的初始值
        // ele.value = Tool.getObjValue(vm, data)
        ele.onchange = e => {
            // 元素值改变之后需要进行双向改变
            Tool.setObjValue(vm._data, data, ele.value)
        }
    }
    /**
     * 生成循环体的虚拟模板节点
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} parent 
     * @param {*} vForText vofr指令
     */
    static vFor(vm, ele, parent, vForText) {
        // 构建虚拟模板节点li 此时形参data就应该存的是循环的list，方便后面的数据处理
        const strArr = GrammarTool.getInstruction(vForText)
        const data = strArr[strArr.length - 1]
        const vNode = new VNode(ele.nodeName, ele, [], '', data, parent, 0)
        vNode.instructions = vForText;
        // 生成了虚拟模板节点之后，需要删除原本的模板节点
        parent.ele.removeChild(ele)
        // 当把这个节点删除之后，dom也会顺带的删除一个文本节点，最后就剩一个文本节点
        // 此时应新增一个无意义的文本节点
        parent.ele.appendChild(document.createTextNode(''))

        // 分析vfor指令需要做什么
        const result = GrammarTool.analysisInstructions(vm, ele, parent, strArr)

        return vNode
    }
}