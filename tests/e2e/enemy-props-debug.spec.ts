import { test, expect } from '@playwright/test'

test('敌人属性调试', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(3000)

  // 检查第一个敌人的属性
  const enemyProps = await page.evaluate(() => {
    const game = (window as any).game
    const scene = game.scene.getScene('GameScene')
    const enemies = scene.enemies.children.entries

    if (enemies.length > 0) {
      const enemy = enemies[0]
      return {
        constructor: enemy.constructor.name,
        hasMaxHp: 'maxHp' in enemy,
        maxHpValue: enemy.maxHp,
        hasCurrentHp: 'currentHp' in enemy,
        currentHpValue: enemy.currentHp,
        hasHealth: 'health' in enemy,
        healthValue: enemy.health,
        allProps: Object.getOwnPropertyNames(enemy)
      }
    }
    return null
  })

  console.log('敌人属性详情:', JSON.stringify(enemyProps, null, 2))
})
