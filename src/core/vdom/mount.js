import {
    VNode
} from './VNode'
import {
    RenderTool
} from '../render/RenderTool'
import {
    GrammarTool
} from "../grammar/GrammarTool"


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

            if (nodeType === 1) {
                const env = ele.getAttribute('env')
                if (env) {
                    // env 是当前标签的环境变量
                    // 如果标签是一个元素标签，并且标签上还有env这个属性，则需要解析这个属性
                    // 合并环境变量  比如v-for 嵌套 v-for
                    vnode.env = this.mergeEnv(vnode.env, JSON.parse(env))
                } else {
                    vnode.env = this.mergeEnv(vnode.env, parent ? parent.env : {});
                }
            }
        }

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
                return GrammarTool.vForInit(vm, ele, parent, vForText);
            }
        }
    }
    /**
     * 合并环境变量
     * @param {*} curEnv 
     * @param {*} targetEnv 
     */
    static mergeEnv(curEnv, targetEnv) {
        console.log(curEnv, targetEnv)
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