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