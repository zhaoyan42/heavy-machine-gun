import { test, expect } from '@playwright/test';

test('游戏启动调试', async ({ page }) => {
  // 收集所有控制台输出
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // 收集错误
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // 等待5秒让游戏完全加载

  console.log('=== 控制台输出 ===');
  consoleMessages.forEach(msg => console.log(msg));

  console.log('=== 页面错误 ===');
  errors.forEach(error => console.log(error));

  // 检查游戏状态
  const gameState = await page.evaluate(() => {
    const game = (window as any).game;
    if (!game) return { error: 'No game instance' };

    return {
      hasScenes: game.scene?.scenes?.length || 0,
      activeScenes: game.scene?.scenes?.map((scene: any) => ({
        key: scene.scene.key,
        isActive: scene.scene.isActive()
      })) || [],
      gameRunning: game.isRunning || false
    };
  });

  console.log('=== 游戏状态 ===');
  console.log(JSON.stringify(gameState, null, 2));

  expect(true).toBeTruthy(); // 让测试通过，我们主要看输出
});
