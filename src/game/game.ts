import Phaser from "phaser"

import GameScene from "./scenes/GameScene"
import MenuScene from "./scenes/MenuScene"

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    physics: {
        // default: 'arcade',
        default: 'matter',
        arcade: {
            gravity: {
                y: 500
            },
            debug: false
        },
        matter: {
            gravity: {
                x: 0,
                y: 1.2,
            },
            "plugins.attractors": true,
            debug: true,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 421,
        height: 750,
        parent: 'game'
    },
    backgroundColor: '#46a6ce',
    scene: [MenuScene, GameScene]
}

export { config }