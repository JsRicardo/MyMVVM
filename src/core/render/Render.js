import { RenderTool } from "./RenderTool"

export class Render {
    /**
     * 渲染节点
     * @param {*} vm Rue对象
     * @param {*} vnode 虚拟节点树
     */
    static renderNode(vm, vnode) {
        if (vnode.nodeType === 3) {
            // 如果是一个文本节点 就渲染文本节点

            // 获取到模板字符串数组
            const templates = RenderTool.vnode2Template.get(vnode)
            if (templates !== undefined) {
                let  result = vnode.text

                for(let i = 0, len = templates.length; i < len; i++){
                    // 获取到每一模板字符串在data中对应的值
                    let templateValue = RenderTool.getTemplateValue([vm._data, vnode.env], templates[i]) // 传数组的原因是当前节点的data可能来自Rue对象data中，也可能来自父级节点V-FOR
                    if (templateValue) {
                        // 有值就替换vdom中的模板字符串
                        result = result.replace(`{{${templates[i]}}}`, templateValue)
                    }
                }
                vnode.ele.nodeValue = result
            }
        } else {
            // 如果不是文本节点就遍历子节点
            for (let i = 0, len = vnode.children.length; i < len; i++) {
                this.renderNode(vm, vnode.children[i])
            }
        }
    }
}