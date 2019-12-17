import { InitMixin } from './init'
import { IOption } from '../../types/option'

export class Rue extends InitMixin {
    constructor(options: IOption) {
        super()
        this.init(options)
    }
}

