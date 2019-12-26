import {
    Tool
} from "../util/Tool";

export class GrammarTool {
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

        const result = []
        // 创建标签
        for (let i = 0, len = vmData.length; i < len; i++) {
            const tempDom = document.createElement(ele.nodeName)
            tempDom.innerHTML = ele.innerHTML
            // 获取这个dom的环境变量
            const env = this.analysisKV(instructions, vmData[i], i)
            tempDom.setAttribute('env', JSON.stringify(env))
            // 挂载到父节点下，以便后面解析dom生成vDom
            parent.ele.appendChild(tempDom)
            result.push(tempDom)
        }
        return result
    }
    /**
     * 解析指令语法
     * @param {*} text 指令内容 
     */
    static getInstruction(text) {
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