import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 414,  // iPhone 6/7/8 Plus宽度，适合竖屏
    height: 736, // iPhone 6/7/8 Plus高度
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 568
        },
        max: {
            width: 414,
            height: 736
        }
    },
    scene: [GameScene]
}

// 创建游戏实例
const game = new Phaser.Game(config)

// 导出游戏实例（供调试使用）
window.game = game

console.log('🎮 重机枪游戏启动成功！')
console.log('📱 支持触屏和鼠标操作')
console.log('🎯 用鼠标/触屏控制玩家左右移动，自动射击')
