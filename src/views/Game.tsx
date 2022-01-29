import { config } from '../game/game'
import { useEffect } from 'react'
import '../styles/game.css'

const Game = () => {

    useEffect(() => {
        const timestamp = localStorage.getItem('timestamp')
        if (!!timestamp && Date.now() - Number(timestamp) > 2 * 60 * 60 * 1000) {
            localStorage.removeItem('timestamp')
            localStorage.removeItem('username')
            localStorage.removeItem('token')
            localStorage.removeItem('points')
        }
        const game = new Phaser.Game(config)
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