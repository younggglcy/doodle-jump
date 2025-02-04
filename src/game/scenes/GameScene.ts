import Phaser from "phaser"
import backgroundUrl from '../assets/bac.png'
import cloudUrl from '../assets/cloud.png'
import fishUrl from '../assets/fish.png'
import feimaUrl from '../assets/fi.png'
import platformUrl from '../assets/platform.png'
import obstacleUrl from '../assets/nanguatou.png'
import { updateMark } from '../../api/user'
import { PBEvent } from '../utils/observer'
import { EventUtil } from '../utils/event'
import { setAlert } from "../utils/helper"
import { WIDTH, HEIGHT } from '../utils/constants'

declare var DeviceOrientationEvent: {
    prototype: DeviceOrientationEvent;
    new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
    requestPermission: () => Promise<any>
}

const PLAYERBIT = 0x0001
const PLATFORMBIT = 0X0002
const OBSTACLEBIT = 0x0003

let IsFrameRateSixty: any = null
let highestPlat: Phaser.Physics.Matter.Image | null = null 

// 越往上，y值越小
export default class GameScene extends Phaser.Scene {

    player: Phaser.Physics.Matter.Image | undefined
    isGameOver = false
    background: Phaser.GameObjects.TileSprite | undefined
    isJump = false
    points: Phaser.GameObjects.Text | undefined
    scroll = 0
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
    plats: Array<Phaser.Physics.Matter.Image>
    obstacle: Phaser.Physics.Matter.Image | undefined | null
    /** 控制这是第几个障碍物
     *  逻辑十分狗屎，有待优化
     */
    obstacleIdx = 1
    fishes: Array<Phaser.GameObjects.Image>
    fishEatenNums: number
    platsObserver: PBEvent
    hardFactor = 1
    clouds: Phaser.GameObjects.Image[]

    constructor() {
        super('game')
        this.player = undefined
        this.background = undefined
        this.points = undefined
        this.cursors = undefined
        this.plats = []
        this.obstacle = undefined
        this.fishes = []
        this.fishEatenNums = 0
        this.clouds = []
        this.platsObserver = new PBEvent()
        this.platsObserver.listen('platAddAgain', (newPlat: any) => {
            if (!highestPlat) {
                highestPlat = this.plats[0]
                for (let i = 1; i < this.plats.length; ++i) {
                    if (this.plats[i].y < highestPlat.y) highestPlat = this.plats[i]
                }
            }
            while (this.isPlatformOverLap(highestPlat, newPlat) || highestPlat.y - newPlat.y > 200 / 750 * HEIGHT) {
                newPlat.setPosition(
                    Phaser.Math.Between(0, WIDTH),
                    Phaser.Math.Between(highestPlat.y - 180 / 750 * HEIGHT, highestPlat.y - highestPlat.height - 15)
                )
            }
            
            highestPlat = newPlat
        })
        this.platsObserver.listen('checkPlatsValid', () => {
            for (let i = 0; i < this.plats.length - 1; ) {
                // console.log(this.plats)
                while ( this.isPlatformOverLap(this.plats[i], this.plats[i + 1]) ) {
                    // 不行，重新生成
                    this.plats[i + 1].setX(Phaser.Math.Between(0, WIDTH))
                    this.plats[i + 1].setY(Phaser.Math.Between(this.plats[i].y - 180 / 750 * HEIGHT, this.plats[i].y - this.plats[i].height - 15 ))
                    continue
                }
                // console.log('OK')
                // 跑到这里说明可以
                i++
            }
        })
    }

    init() {

    }

    preload() {
        this.load.image('platform', platformUrl)
        this.load.image('obstacle', obstacleUrl)
        this.load.image('background', backgroundUrl)
        this.load.image('cloud', cloudUrl)
        this.load.image('fish', fishUrl)
        this.load.spritesheet('feima', feimaUrl, {
            frameWidth: 310,
            frameHeight: 249
        })
    }

    create() {
        this.player = this.createPlayer()
        this.background = this.createBackground()
        this.createPlatforms(15)
        
        this.createFishes(2)

        this.points = this.add.text(0, this.cameras.main.scrollY, '0 points', {
            align: 'center'
        })
        this.cursors = this.input.keyboard.createCursorKeys()

        this.matter.world.on(
            'collisionstart', 
            (
                e: Phaser.Physics.Matter.Events.CollisionStartEvent,
                bodyA: MatterJS.BodyType,
                bodyB: MatterJS.BodyType,
            ) => {
            if (bodyB.label === 'obstacle') {
                this.startGameOver()
            } else if (bodyB.label === 'platform') {
                this.isJump = true
                // console.log(bodyB)
            }
        })

        this.obstacle = null
        this.createClouds()
        // this.plats.forEach(plat => console.log(plat.y))
    }

    update(time: number, delta: number) {
        // console.log(delta)
        if (IsFrameRateSixty === null) {
            if (delta >= 30) {
                IsFrameRateSixty = false
            } else {
                IsFrameRateSixty = true
            }
        }
        if (!this.isGameOver) {
            if (this.points) {
                const score = this.getPointsScore()

                if (
                    !!score && 
                    !this.obstacle && 
                    score > 500 * (this.obstacleIdx - 1) + 100
                ) {
                    this.obstacle = this.createObstacles()
                }

                this.points.text = this.player!.y > 0 
                    ? `${this.fishEatenNums * 10} points`
                    : `${Math.trunc(-this.player!.y * 0.03) + this.fishEatenNums * 10} points`
            
                this.points.y = this.cameras.main.scrollY
            }

            this.updateHeight()

            this.setMaxSpeed()
            
            if (this.cursors!.right.isDown) {
                this.player?.thrust(0.05)
            } else if (this.cursors!.left.isDown) {
                this.player?.thrustBack(0.05)
            }

            if (this.isJump) {
                this.player?.thrustLeft(1.5)
                this.isJump = false
                this.player?.setFrame(1)
            } else {
                this.player?.setFrame(0)
            }

            const score = this.getPointsScore()
            if (score > 500 * this.hardFactor && this.plats.length >= 7) {
                this.hardFactor++
                this.plats[this.plats.length - 1].destroy()
                this.plats.length--
                this.plats[this.plats.length - 1].destroy()
                this.plats.length--
            }

            this.inspectWorldview()
        }
    }

    createPlatforms(platformsNum: number) {
        // 根据上一个平台的y值，生成一个平台
        const createPlat = (lasty?: number) => {
            const plat = this.matter.add.image(
                lasty !== undefined && 
                lasty <= HEIGHT && 
                lasty >= 400 / 750 * HEIGHT 
                    ? WIDTH / 2 - 20
                    : Phaser.Math.Between(0, WIDTH), // 尽量在中下方区域把平台至于肥马屁股底下
                lasty !== undefined ? Phaser.Math.Between(lasty + 30, lasty + 180 / 750 * HEIGHT) : -50,
                'platform',
                undefined,
                {
                    isStatic: true,
                    collisionFilter: {
                        category: PLATFORMBIT,
                    },
                    label: 'platform'
                }
            )

            return plat
        }
        for (let i = 0; i < platformsNum; ++i) {
            if (i === 0) this.plats.push(createPlat())
            else this.plats.push(createPlat(this.plats[i - 1].y))
            // this.plats.push(createPlat())
        }
        highestPlat = this.plats[0]
        // console.log(this.plats.length)
        // console.log(this.plats.forEach(p => console.log(p.y)))
        this.platsObserver.trigger('checkPlatsValid')
    }

    isPlatformOverLap = (a: Phaser.Physics.Matter.Image, b: Phaser.Physics.Matter.Image) => {
        if (
            Math.abs(a.x - b.x) <= a.width && 
            Math.abs(a.y - b.y) <= a.height
        ) {
            return true
        }
        return false
    }

    createPlayer() {
        const player = this.matter.add.image(WIDTH / 2, 0, 'feima', 0).setDepth(10)
        player.setDisplaySize(56 / 421 * WIDTH, 40 / 750 * HEIGHT)
        player.setRectangle(56 / 421 * WIDTH, 40 / 750 * HEIGHT, {
            mass: 30,
            frictionAir: 0.01,
            collisionFilter: {
                mask: PLAYERBIT
            },
            render: {
                "sprite.xOffset": -0.15
            },
            label: 'player'
        })

        player.setFixedRotation()

        if (window.DeviceOrientationEvent) {
            const orientationCb = (e: DeviceOrientationEvent) => {
                if (e.gamma! < -3) {
                    player.setVelocityX(e.gamma! * 0.3)
                }
                if (e.gamma! > 3) {
                    player.setVelocityX(e.gamma! * 0.3)
                }
            }
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
            // console.log(navigator.userAgent)
            // if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            if (isIOS && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // IOS
                const IOSBtn = document.getElementById('ios') as HTMLButtonElement
                // console.log('IOSBtn', IOSBtn)
                IOSBtn.style.display = 'block'
                this.scene.pause('game')
                const that = this
                IOSBtn.onclick = function() {
                    // console.log('clicked!!')
                    // https://www.w3.org/TR/orientation-event/#deviceorientation
                    DeviceOrientationEvent.requestPermission()
                    .then((permissionState: 'granted' | 'denied' | 'default') => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', orientationCb, true)
                        } else {
                            // handle denied
                            setAlert('denied!')
                        }
                    })
                    .then(() =>{ 
                        that.scene.start('game')
                        IOSBtn.style.display = 'none'
                    })
                    .catch((err: any) => {
                        console.log(err)
                    })
                }
            } else {
                window.addEventListener('deviceorientation', orientationCb, true)
            }
        } else {
            const gameElement = document.getElementById('game')
            if (gameElement) {
                EventUtil.listenTouchDirection(gameElement, true, {
                    leftCallback(x: number) {
                        player.setVelocityX(x * 0.1)
                    },
                    rightCallback(x: number) {
                        player.setVelocityX(-x * 0.1)
                    }
                })
            }
        }

        return player
    }

    createObstacles() {
        const obstacle = this.matter.add.image( 
            Math.round(Math.random() * 300 / 421 * WIDTH) + 50 / 421 * WIDTH, 
            -Math.round(Math.random() * 120 / 750 * HEIGHT) - 500 / 750 * HEIGHT + this.cameras.main.scrollY, 
            'obstacle',
            undefined,
            {
                isStatic: true,
                collisionFilter: {
                    category: OBSTACLEBIT,
                },
                label: 'obstacle'
            }
        )

        obstacle.setDisplaySize(70, 70)
        
        return obstacle
    }

    createBackground() {
        const bg = this.add.tileSprite(400, 300, 1920, 1080, 'background').setScrollFactor(0, 0)
        return bg
    }

    createClouds() {
        const cloud1 = this.add.image(400 / 421 * WIDTH, 400 / 750 * HEIGHT, 'cloud1').setDisplaySize(300, 108)
        const cloud2 = this.add.image(-(15 / 421 * WIDTH), 280 / 750 * HEIGHT, 'cloud2').setDisplaySize(300, 108)
        const cloud3 = this.add.image(460 / 421 * WIDTH, 95 / 750 * HEIGHT, 'cloud3').setDisplaySize(300, 108)
        this.clouds = [cloud1, cloud2, cloud3]
    }

    createFishes(nums: number) {
        const createFish = () => {
            const fish = this.add.image(
                Phaser.Math.Between(0, WIDTH),
                Phaser.Math.Between(0, HEIGHT) - 500,
                'fish',
            )
            fish.displayWidth = 49
            fish.displayHeight = 27
            fish.setDepth(5)

            return fish
        }
        for (let i = 1; i <= nums; ++i) {
            this.fishes.push(createFish())
        }
    }

    updateHeight() {
        const gameObjectCanvasY = this.player!.y - this.cameras.main.scrollY * this.player!.scrollFactorY

        if (gameObjectCanvasY < 350 / 750 * HEIGHT) {
            if (!!IsFrameRateSixty) {
                this.background!.tilePositionY += 6
                this.scroll -= 6
            } else {
                this.background!.tilePositionY += 12
                this.scroll -= 12
            }
            this.cameras.main.setScroll(0, this.scroll)
        }
    }

    setMaxSpeed() {
        const maxSpeed = 15
        if (this.player!.body.velocity.x > maxSpeed) {
            this.player!.setVelocityX(maxSpeed)
        }
        if (this.player!.body.velocity.x < -maxSpeed) {
            this.player!.setVelocityX(-maxSpeed)
        }
    }

    inspectWorldview() {
        const chooseJumpablePlatforms = () => {
            this.plats.forEach(plat => {
                if (this.player!.y + 22 < plat.y) {
                    plat.setCollisionCategory(PLAYERBIT)
                } else {
                    plat.setCollisionCategory(PLATFORMBIT)
                }

                if (plat.y > this.cameras.main.worldView.y + HEIGHT) {
                    // console.log('111', this.cameras.main.scrollY)
                    // console.log(plat.y)
                    plat.setPosition(
                        Phaser.Math.Between(0, WIDTH),
                        Phaser.Math.Between(this.cameras.main.scrollY - 250, this.cameras.main.scrollY)
                    )
                    // this.plats.push(this.plats.shift()!)
                    plat.setCollisionCategory(PLATFORMBIT)
                    this.platsObserver.trigger('platAddAgain', plat)
                }
            })
            
        }

        const warpPlayer = () => {
            if (this.player!.x < 0) {
                this.player!.x = WIDTH
            }
            if (this.player!.x > WIDTH) {
                this.player!.x = 0
            }
        }

        const checkObstacle = () => {
            if (!!this.obstacle && this.obstacle.y > this.cameras.main.worldView.y + 750) {
                this.obstacle!.destroy()
                this.obstacle = null
                this.obstacleIdx++
            }
        }

        const checkFish = () => {
            this.fishes.forEach(fish => {
                if (
                    fish.y > this.cameras.main.worldView.y + HEIGHT ||
                    (Math.abs(fish.y - this.player!.y) <= 24 &&
                    Math.abs(fish.x - this.player!.x) <= 24)
                ) {
                    // console.log(fish.x, fish.y)
                    // console.log(this.player!.x, this.player!.y)
                    fish.setPosition(
                        Phaser.Math.Between(0, WIDTH),
                        Phaser.Math.Between(this.cameras.main.scrollY - 300, this.cameras.main.scrollY)
                    )
                    this.fishEatenNums++
                }
            })
        }

        const checkClouds = () => {
            this.clouds.forEach(cloud => {
                if (cloud.y > this.cameras.main.worldView.y + 1300) {
                    cloud.setY(this.cameras.main.scrollY - 400)
                }
            })
        }

        if (this.cameras.main.worldView.width > 0) {
            chooseJumpablePlatforms()
            warpPlayer()
            checkObstacle()
            checkFish()
            checkClouds()

            if (this.player!.y > this.cameras.main.worldView.y + HEIGHT * 770 / 750) {
                this.startGameOver()
            }
        }
    }

    getPointsScore() {
        return parseInt(this.points!.text)
    }

    startGameOver() {
        this.isGameOver = true

        const historyPoints = Number(localStorage.getItem('points'))
        const currentPoints = this.getPointsScore()
        if (
            !!historyPoints && historyPoints < currentPoints ||
            !historyPoints
        ) {
            updateMark(currentPoints).then((res: any) => {
                console.log('updateMark OK', res)
                localStorage.setItem('points', currentPoints.toString())
            }).then(() => {
                this.scene.stop('game')
                window.location.href='/gameover'
            })
        } else {
            this.scene.stop('game')
            window.location.href='/gameover'
        }
    }

}
