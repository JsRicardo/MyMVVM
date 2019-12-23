export class Tool {
    /**
     * 获取对象的某个值
     * @param {*} obj 对象
     * @param {*} target 想要获取的目标属性 data.content
     */
    static getObjValue(obj, target) {
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
    /**
     * 设置对象的某个值
     * @param {*} obj 对象
     * @param {*} target 想要设置的目标属性 data.content
     * @param {*} value 设置的值
     */
    static setObjValue(obj, target, value) {
        if (!obj) return
        let nameList = target.split('.')
        let temp = obj
        // 对对象自顶向下寻找,需要找到目标属性的上一层属性，所以需要 -1
        for (let i = 0, len = nameList.length - 1; i < len; i++) {
            if (temp[nameList[i]]) {
                temp = temp[nameList[i]]
            } else {
                return
            }
        }
        if (temp[nameList[nameList.length - 1]]) {
            temp[nameList[nameList.length - 1]] = value
        }
    }
    static mixinString () {
        return (function () {
            String.prototype.startWith = function (str) {
                if (str == null || str == "" || this.length == 0 || str.length > this.length)
                    return false;
                if (this.substr(0, str.length) == str)
                    return true;
                else
                    return false;
            }
            String.prototype.endWith = function (str) {
                if (str == null || str == "" || this.length == 0 || str.length > this.length)
                    return false;
                if (this.substring(this.length - str.length) == str)
                    return true;
                else
                    return false;
            }
        })()
    }
}
