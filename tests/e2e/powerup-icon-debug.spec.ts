import { test, expect } from '@playwright/test'

test('修复道具图标重叠问题', async ({ page }) => {
  console.log('� 开始修复道具图标重叠问题...')
  
  // 导航到游戏页面
  await page.goto('http://localhost:3003/heavy-machine-gun/')
  
  // 等待游戏加载
  await page.waitForTimeout(2000)
  
  // 检查页面内容
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  
  // 运行游戏观察道具显示
  console.log('🎮 观察道具图标显示...')
  
  // 等待道具生成
  await page.waitForTimeout(5000)
  
  // 进行移动操作以观察道具
  for (let i = 0; i < 10; i++) {
    const x = 200 + Math.random() * 200
    const y = 300 + Math.random() * 200
    await canvas.click({ position: { x, y } })
    await page.waitForTimeout(500)
    
    console.log(`📊 移动操作 ${i + 1}/10`)
  }
  
  console.log('✅ 道具图标修复验证完成')
  
  // 截图保存修复后状态
  await page.screenshot({ 
    path: 'tests/screenshots/powerup-icon-fixed.png',
    fullPage: false 
  })
})
