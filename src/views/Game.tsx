import { config } from '../game/game'
import { useEffect } from 'react'
import { message } from 'antd'
import '../styles/game.css'

const Game = () => {

    useEffect(() => {
        const game = new Phaser.Game(config)
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && /safari/i.test(navigator.userAgent)) {
            message.warning('IOS用户建议尝试更换浏览器游玩')
        }
        return () => {
            game && game.destroy(true)
            console.log('game is destroyed')
        }
    }, [])

    return (
        <>
            <div id='game' />        
            {/** 用做输入名字 */}
            <div id='usernameInputContainer'>
                <input type='text' id='usernameInput' pattern='[A-Za-z0-9]+' placeholder='请输入一个昵称' />
            </div>
            {/** Alert */}
            <div className='alert' id='alertBox' />
            <button id='ios' className='IOSBtn'>IOS用户点我申请陀螺仪权限</button>
        </>
    )
}

export default Game