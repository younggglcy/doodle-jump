import Phaser from "phaser"
import skyUrl from '../assets/bac.png'
import cloudUrl from '../assets/cloud.png'
import cloud1Url from '../assets/cloud1.png'
import cloud2Url from '../assets/cloud2.png'
import cloud3Url from '../assets/cloud3.png'
import markUrl from '../assets/mark.png'
import { register } from '../../api/user'
import { setAlert } from "../utils/helper"

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

        const mark = this.add.image(210, 375, 'mark')
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
        this.add.image(0, 0, 'sky').setDisplayOrigin(0).setDisplaySize(421, 750)

        this.add.image(210, 600, 'cloud').setDisplaySize(421, 250)
        this.add.image(400, 400, 'cloud1').setDisplaySize(300, 108)
        this.add.image(-15, 280, 'cloud2').setDisplaySize(300, 108)
        this.add.image(460, 95, 'cloud3').setDisplaySize(300, 108)
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

            const localUsername = localStorage.getItem('username')
            const token = localStorage.getItem('token')

            if (!!localUsername && token) {
                this.hidInputContainer()
                this.scene.start('game')
            } else {
                localStorage.setItem('username', inputValue)
                register(inputValue).then((res) => {
                    console.log('register OK', res)

                    const { token } = res as unknown as { token: string }
                    localStorage.setItem('token', token)
                    localStorage.setItem('timestamp', Date.now().toString())

                    this.hidInputContainer()
                    this.scene.start('game')
                }).catch(() => {
                    setAlert('该用户名已经被注册过了！')
                })
            }
    }

}