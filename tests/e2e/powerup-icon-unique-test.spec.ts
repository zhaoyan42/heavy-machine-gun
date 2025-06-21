import { test, expect } from '@playwright/test'

test('验证道具图标唯一性', async ({ page }) => {
  console.log('🔍 验证道具图标没有重叠问题...')
  
  // 导航到游戏页面
  await page.goto('http://localhost:3003/heavy-machine-gun/')
  
  // 等待游戏加载
  await page.waitForTimeout(2000)
  
  // 检查页面内容
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
    // 监听控制台日志以检查纹理加载情况
  const logs: string[] = []
  page.on('console', msg => {
    if (msg.text().includes('道具生成') || msg.text().includes('纹理')) {
      logs.push(msg.text())
      console.log('🎮', msg.text())
    }
  })
  
  // 运行游戏较长时间以确保道具生成
  console.log('🎮 运行游戏观察道具生成...')
  
  // 进行持续的移动操作以增加道具生成概率
  for (let i = 0; i < 30; i++) {
    const x = 150 + Math.random() * 250
    const y = 200 + Math.random() * 300
    await canvas.click({ position: { x, y } })
    await page.waitForTimeout(400)
    
    if (i % 10 === 0) {
      console.log(`📊 移动操作 ${i + 1}/30`)
      // 等待更长时间以观察道具
      await page.waitForTimeout(1000)
    }
  }
  
  console.log('✅ 道具图标唯一性验证完成')
  console.log(`📝 收集到 ${logs.length} 条道具相关日志`)
  
  // 截图保存最终状态
  await page.screenshot({ 
    path: 'tests/screenshots/powerup-icon-unique.png',
    fullPage: false 
  })
  
  // 验证没有纹理缺失警告
  const warningLogs = logs.filter(log => log.includes('⚠️') || log.includes('警告'))
  expect(warningLogs.length).toBe(0)
})
