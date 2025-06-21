import { test, expect } from '@playwright/test'

test('鼠标移动调试', async ({ page }) => {
  // 监听控制台消息
  const consoleMessages: string[] = []
  page.on('console', (msg) => {
    if (msg.text().includes('🖱️') || msg.text().includes('🎯')) {
      consoleMessages.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForTimeout(3000)

  const canvas = await page.$('canvas')
  if (canvas) {
    const canvasBox = await canvas.boundingBox()
    
    console.log('准备测试鼠标移动...')
    
    if (canvasBox) {
      // 移动鼠标到canvas内部
      await page.mouse.move(canvasBox.x + 150, canvasBox.y + 350)
      await page.waitForTimeout(1000)
      
      console.log('控制台消息:', consoleMessages)
      
      // 检查是否有事件被触发
      const hasMouseEvents = consoleMessages.some(msg => msg.includes('🖱️'))
      console.log('是否检测到鼠标移动事件:', hasMouseEvents)
    }
  }
})
