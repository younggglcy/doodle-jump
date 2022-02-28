import Phaser from "phaser"
import skyUrl from '../assets/bac.png'
import cloudUrl from '../assets/cloud.png'
import cloud1Url from '../assets/cloud1.png'
import cloud2Url from '../assets/cloud2.png'
import cloud3Url from '../assets/cloud3.png'
import markUrl from '../assets/mark.png'
import { register } from '../../api/user'
import { setAlert } from "../utils/helper"
import { WIDTH, HEIGHT } from '../utils/constants'

// 游戏的菜单栏
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu')
    }

    init() {

    }

    preload() {
        this.load.image('sky', skyUrl)
        this.load.image('cloud', cloudUrl)
        this.load.image('cloud1', cloud1Url)
        this.load.image('cloud2', cloud2Url)
        this.load.image('cloud3', cloud3Url)
        this.load.image('mark', markUrl)
    }

    create() {
        this.createBackground()

        this.add.text(10, 15, 'powered by Uni Team')
        this.add.text(70, 180, 'Doodle Jump', {
            // fontFamily: 'STHeiti',
            fontFamily: 'Microsoft YaHei',
            fontSize: '40px'
        })

        const mark = this.add.image(WIDTH / 2, HEIGHT / 2, 'mark')
        .setDepth(5)
        .setDisplaySize(180, 150)
        .setInteractive({
            useHandCursor: true
        } as Phaser.Types.Input.InputConfiguration)
        
        mark.on('pointerover', () => {
            mark.setDisplaySize(198, 165)
        })

        mark.on('pointerout', () => {
            mark.setDisplaySize(180, 150)
        })

        mark.on('pointerdown', () => {
            this.gameStart()
        })
    
        // 意思是展示Game.tsx下的usernameInputContainer
        this.setDOMUsername()

    }

    createBackground() {
        this.add.image(0, 0, 'sky').setDisplayOrigin(0).setDisplaySize(WIDTH, HEIGHT)

        this.add.image(0, 600 / 750 * HEIGHT, 'cloud').setDisplaySize(WIDTH, 250 / 750 * HEIGHT).setDisplayOrigin(0)
        this.add.image(400 / 421 * WIDTH, 400 / 750 * HEIGHT, 'cloud1').setDisplaySize(300 / 421 * WIDTH, 108 / 750 * HEIGHT)
        this.add.image(-15 / 421 * WIDTH, 280 / 750 * HEIGHT, 'cloud2').setDisplaySize(300 / 421 * WIDTH, 108 / 750 * HEIGHT)
        this.add.image(460 / 421 * WIDTH, 95 / 750 * HEIGHT, 'cloud3').setDisplaySize(300 / 421 * WIDTH, 108 / 750 * HEIGHT)
    }

    update(time: number, delta: number): void {
        
    }

    setDOMUsername = () => {
        const username = localStorage.getItem('username')
        const usernameInputContainer = document.getElementById('usernameInputContainer')
        const usernameInput = document.getElementById('usernameInput') as HTMLInputElement

        usernameInputContainer!.style.display = 'flex'

        if (username) {
            usernameInput.value = username
        }
    }

    hidInputContainer() {
        const usernameInputContainer = document.getElementById('usernameInputContainer')
        usernameInputContainer!.style.display = 'none'
    }

    gameStart() {
        const usernameInput = document.getElementById('usernameInput') as HTMLInputElement
        const inputValue = usernameInput!.value

        if (usernameInput && !inputValue) {
            setAlert('请先输入用户名')
            return 
        }

        localStorage.setItem('username', inputValue)
        register(inputValue).then((res) => {
            console.log('register OK', res)

            const { token } = res as unknown as { token: string }
            localStorage.setItem('token', token)

            this.hidInputContainer()
            this.scene.start('game')
        }).catch((err) => {
            console.log(err)
            setAlert('该用户名已经被注册过了！')
        })
        
    }

}