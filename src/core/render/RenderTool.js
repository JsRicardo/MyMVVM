export class RenderTool {
    static vnode2Template = new Map()
    static template2VNode = new Map()
    /**
     * 预备渲染
     * @param {*} vm Rue对象
     * @param {*} vnode 虚拟节点
     */
    static prepareRender(vm, vnode) {
        if (vnode === null) return
        if (vnode.nodeType === 3) {
            // 文本节点 分析文本节点的内容，是否有模板字符串 {{}}
            this.analysisTemplateString(vnode)
        }
        if (vnode.nodeType === 1) {
            // 标签节点，检查子节点
            for (let i = 0, len = vnode.children.length; i < len; i++) {
                // 遍历根节点
                this.prepareRender(vm, vnode.children[i])
            }
        }
    }
    /**
     * 检查文本节点中是否存在模版字符串,建立映射
     * @param {*} str 文本节点内容
     */
    static analysisTemplateString(vnode) {
        const reg = /{{[a-zA-Z0-9_.]+}}/g
        const temStrList = vnode.text.match(reg)
        if (temStrList) { // 有可能不存在template
            for (let i = 0, len = temStrList.length; i < len; i++) {
                this.setTemplate2VNode(temStrList[i], vnode)
                this.setVNode2Template(temStrList[i], vnode)
            }
        }
    }
    /**
     * 建立模板到节点的映射
     * 通过模板 找到那些节点用到了这个模板
     * @param {*} template 
     * @param {*} vnode 
     */
    static setTemplate2VNode(template, vnode) {
        const tempText = this.getTemplateText(template)
        const vnodeMap = this.template2VNode.get(tempText)

        if (vnodeMap !== undefined) {
            // 如果这个模版字符串已经建立了映射，说明这个模板字符串在多个地方使用
            vnodeMap.push(vnode)
        } else {
            // 没找到就建立映射
            this.template2VNode.set(tempText, [vnode])
        }
    }
    /**
     * 建立节点到模板的映射
     * 通过节点 找到这个节点下有哪些模版
     * @param {*} template 
     * @param {*} vnode 
     */
    static setVNode2Template(template, vnode) {
        const tempText = this.getTemplateText(template)
        const templateMap = this.vnode2Template.get(vnode)

        if (templateMap !== undefined) {
            // 代表当前虚拟节点下应用多个变量，存在多个模板字符串
            templateMap.push(tempText)
        } else {
            this.vnode2Template.set(vnode, [tempText])
        }
    }

    static getTemplateText(template) {
        // 截掉模板字符串的花括号
        return template.substring(2, template.length - 2)
    }
    /**
     * 获取模板字符串在data或者env中的值
     * @param {*} objs [data, vnode.env]
     * @param {*} target 目标值
     */
    static getTemplateValue(objs, target) {
        for (let i = 0, len = objs.length; i < len; i++) {
            let temp = this.getObjValue(objs[i], target)
            if (temp) {
                return temp
            }
        }
        return null
    }

    static getObjValue(obj, target) { // data.content
        if (!obj) return
        let nameList = target.split('.')
        let temp = obj
        // 对对象自顶向下寻找
        for (let i = 0, len = nameList.length; i < len; i++) {
            if (temp[nameList[i]]) {
                temp = temp[nameList[i]]
            } else {
                return undefined
            }
        }
        return temp
    }
}