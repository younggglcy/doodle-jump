import Phaser from "phaser"

// TODO: 帮助页面，待完成
// 需要写一些游戏规则、玩法之类？
export default class HelpScene extends Phaser.Scene {
    constructor() {
        super('help')
    }

    init() {

    }

    preload() {

    }

    create() {
        this.add.text(50, 400, '作者很懒，没有写帮助页面，你自己琢磨着玩')
        const helpBtn = this.add.text(50, 500, '点我返回').setInteractive({
            useHandCursor: true
        })

        helpBtn.on('pointerdown', () => {
            this.scene.start('menu')
        })
    }

    update(time: number, delta: number): void {
        
    }
}