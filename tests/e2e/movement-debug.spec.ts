import { test, expect } from '@playwright/test'

test.describe('玩家移动调试', () => {
  test('详细诊断玩家移动逻辑', async ({ page }) => {
    // 启动游戏
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(3000)

    // 检查游戏状态
    const gameState = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return { error: 'Canvas未找到' }

      const game = window.game
      if (!game) return { error: 'Game实例未找到' }

      const scene = game.scene.getScene('GameScene')
      if (!scene) return { error: 'GameScene未找到' }

      const player = scene.player
      if (!player) return { error: 'Player未找到' }

      return {
        playerX: player.x,
        playerY: player.y,
        targetX: player.targetX,
        cursors: scene.cursors ? {
          left: scene.cursors.left ? scene.cursors.left.isDown : 'null',
          right: scene.cursors.right ? scene.cursors.right.isDown : 'null'
        } : null,
        speed: player.speed
      }
    })

    console.log('🎮 初始游戏状态:', JSON.stringify(gameState, null, 2))

    // 点击移动
    await page.click('canvas', { position: { x: 300, y: 400 } })
    await page.waitForTimeout(1000)

    // 检查移动后状态
    const afterMoveState = await page.evaluate(() => {
      const game = window.game
      const scene = game.scene.getScene('GameScene')
      const player = scene.player

      return {
        playerX: player.x,
        playerY: player.y,
        targetX: player.targetX,
        cursors: scene.cursors ? {
          left: scene.cursors.left ? scene.cursors.left.isDown : 'null',
          right: scene.cursors.right ? scene.cursors.right.isDown : 'null'
        } : null,
        movement: {
          distance: player.targetX - player.x,
          shouldMove: Math.abs(player.targetX - player.x) > 5
        }
      }
    })

    console.log('🚀 移动后状态:', JSON.stringify(afterMoveState, null, 2))

    // 手动调用一次handleMovement看看
    const manualMoveResult = await page.evaluate(() => {
      const game = window.game
      const scene = game.scene.getScene('GameScene')
      const player = scene.player
      
      const beforeX = player.x
      player.handleMovement()
      const afterX = player.x
      
      return {
        beforeX,
        afterX,
        moved: beforeX !== afterX,
        distance: player.targetX - beforeX,
        inElseBranch: !scene.cursors.left.isDown && !scene.cursors.right.isDown
      }
    })

    console.log('🔧 手动移动测试:', JSON.stringify(manualMoveResult, null, 2))
  })
})
