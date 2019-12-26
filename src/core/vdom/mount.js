import {
    VNode
} from './VNode'
import {
    RenderTool
} from '../render/RenderTool'
import {
    Tool
} from '../util/Tool'
import {
    Grammar
} from '../grammar/Grammar'


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
        // 挂载前先分析可能生成新节点的属性
        let vnode = this.analysisAttr(vm, ele, parent)

        if (!vnode) {
            // 如果没有需要生成新节点的标签
            let children = []
            let text = this.getNodeText(ele)
            let data = null
            let nodeType = ele.nodeType
            let tag = ele.nodeName
            // 创建节点
            vnode = new VNode(tag, ele, children, text, data, parent, nodeType)

            if (nodeType === 1 && ele.getAttribute('env')) {
                // env 是当前标签的环境变量
                // 如果标签是一个元素标签，并且标签上还有env这个属性，则需要解析这个属性
                // 合并环境变量  比如v-for 嵌套 v-for
                vnode.env = Tool.mergeObject(vnode.env, JSON.parse(ele.getAttribute('env')))
            } else {
                vnode.env = Tool.mergeObject(vnode.env, parent ? parent.env : {});
            }

        }

        let childs = vnode.nodeType === 0 ? vnode.parent.ele.childNodes : vnode.ele.childNodes

        // 深度优先遍历 创建子节点
        for (let i = 0, len = childs.length; i < len; i++) {
            let childNodes = this.constructVNode(vm, childs[i], vnode)

            if (childNodes instanceof VNode) {
                // 返回单一节点时
                vnode.children.push(childNodes)
            } else {
                // 返回节点数组时（如v-for）
                vnode.children = vnode.children.concat(childNodes);
            }
        }
        return vnode
    }
    /**
     * @param {*} vm 
     * @param {*} ele 
     * @param {*} parent 
     */
    static analysisAttr(vm, ele, parent) {
        if (ele.nodeType == 1) {
            let attrNames = ele.getAttributeNames();
            if (attrNames.indexOf("v-for") !== -1) {
                const vForText = ele.getAttribute('v-for')
                // 处理vfor指令 返回vfor指令生成的节点
                return Grammar.vFor(vm, ele, parent, vForText)
            }
        }
    }
    /**
     * 节点变化后重新构建，如改变vfor数组重新生成新的节点
     * @param {*} vm 
     * @param {*} template 
     */
    static reBuild(vm, template) {
        // 找到需要重新构建的虚拟节点（虚拟模板节点li）
        let vNodes = RenderTool.template2VNode.get(template);
        vNodes && vNodes.forEach(item => {
            // 找到li的父级节点，清空子节点
            item.parent.ele.innerHTML = ''
            // 再把虚拟模板节点li放回去,变成最开始的模板形态
            item.parent.ele.appendChild(item.ele)
            // 重新构建需要改变的这一部分节点，不用全量重新构建
            const result = this.constructVNode(vm, item.ele, item.parent)
            item.parent.children = [result]
            // 清空索引
            RenderTool.template2VNode.clear()
            RenderTool.vnode2Template.clear()
            // 重新构建索引，不会影响dom节点
            RenderTool.prepareRender(vm, vm._vnode)
        })
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