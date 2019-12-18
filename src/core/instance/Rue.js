import { InitMixin } from './InitMixin.js'

export class Rue extends InitMixin {
    constructor(options) {
        super()
        this._init(options)
        this._render()
    }
}
