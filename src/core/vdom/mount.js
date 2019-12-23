import {
    VNode
} from './VNode'
import {
    RenderTool
} from '../render/RenderTool'

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
        
        let vnode
        let children = []
        let text = this.getNodeText(ele)
        let data = null
        let nodeType = ele.nodeType
        let tag = ele.nodeName
        // 创建节点
        vnode = new VNode(tag, ele, children, text, data, parent, nodeType)

        let childs = vnode.ele.childNodes

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