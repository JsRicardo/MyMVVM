import { IOption } from "../../types/option"

export class InitMixin {
    private uid: number = 0
    private isRue: boolean = true

    protected init(options: IOption){
        
        this.uid++ // rueId
        this.isRue = true // 是否是Rue对象
        // 1.初始化data
        // 2.初始化created
        // 3.初始化methods
        // 4.初始化computed
        // 5.初始化el并挂载
    }
}