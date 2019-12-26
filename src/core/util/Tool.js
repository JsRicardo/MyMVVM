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
    /**
     * 深克隆，经过代理的对象不能用JSON来进行深克隆
     * @param {*} object 需要克隆的对象
     */
    static deepClone(object){
        if (object instanceof Array) {
            const cloneArr = new Array(object.length)
            object.forEach((item,index) => {
                cloneArr[index] = this.deepClone(item)
            })
            return cloneArr
        } else if (object instanceof Object) {
            const cloneObj = {}
            const keys = Object.getOwnPropertyNames(object)
            keys.forEach(key => {
                cloneObj[key] = this.deepClone(object[key])
            })
            return cloneObj
        } else {
            return object
        }
    }
    /**
     * 合并对象
     * @param {*} obj1 
     * @param {*} obj2 
     */
    static mergeObject(obj1, obj2) {
        if (Object.keys(obj1).length === 0) return this.deepClone(obj2)
        if (Object.keys(obj2).length === 0) return this.deepClone(obj1)
        const result = {}

        const obj1Attrs = Object.getOwnPropertyNames(obj1)
        obj1Attrs.forEach(item => {
            result[item] = obj1[item]
        })

        const obj2Attrs = Object.getOwnPropertyNames(obj2)
        obj2Attrs.forEach(item => {
            result[item] = obj2[item]
        })

        return result
    }
    /**
     * 给String原型上添加starWith和endWith方法
     */
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
