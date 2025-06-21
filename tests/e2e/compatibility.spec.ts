import { test, expect, devices } from '@playwright/test';
import { GameTestHelper } from './utils/test-helpers';

/**
 * 兼容性测试套件
 * 等价类：不同浏览器、不同设备、不同屏幕尺寸
 */
test.describe('兼容性等价类测试', () => {
  let helper: GameTestHelper;
  let errorMonitoring: { consoleErrors: string[], pageErrors: string[] };

  test.beforeEach(async ({ page }) => {
    helper = new GameTestHelper(page);
    errorMonitoring = helper.setupErrorMonitoring();
  });

  test.afterEach(async () => {
    await helper.checkErrorState(errorMonitoring.consoleErrors, errorMonitoring.pageErrors);
  });

  test('桌面设备等价类测试', async ({ page }) => {
    // 桌面设备视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 测试鼠标控制
    await helper.testPlayerMovement(canvas, 0.3, 0.3);
    await helper.testPlayerMovement(canvas, 0.7, 0.7);
    
    // 测试边界点击
    await helper.testBoundaryClicks(canvas);
    
    console.log('✓ 桌面设备兼容性测试完成');
  });

  test('平板设备等价类测试', async ({ page }) => {
    // 平板设备视口 (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 模拟触屏操作
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    await helper.testRapidClicks(canvas, 5);
    
    console.log('✓ 平板设备兼容性测试完成');
  });

  test('小屏手机等价类测试', async ({ page }) => {
    // 小屏手机视口 (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 在小屏幕上测试精确点击
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    
    // 测试小屏幕边界
    const boundaries = [
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.9 },
      { x: 0.5, y: 0.1 },
      { x: 0.5, y: 0.9 }
    ];
    
    for (const boundary of boundaries) {
      await helper.testPlayerMovement(canvas, boundary.x, boundary.y);
    }
    
    console.log('✓ 小屏手机兼容性测试完成');
  });

  test('大屏手机等价类测试', async ({ page }) => {
    // 大屏手机视口 (iPhone Plus)
    await page.setViewportSize({ width: 414, height: 736 });
    await page.goto('/');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 测试完整的游戏流程
    await helper.testGameStability(10000);
    
    console.log('✓ 大屏手机兼容性测试完成');
  });

  test('屏幕方向切换等价类测试', async ({ page }) => {
    await page.goto('/');
    
    // 竖屏模式
    await page.setViewportSize({ width: 414, height: 736 });
    let canvas = await helper.verifyGameInitialization();
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    
    console.log('✓ 竖屏模式测试完成');
    
    // 横屏模式  
    await page.setViewportSize({ width: 736, height: 414 });
    await page.waitForTimeout(1000);
    
    canvas = helper.getPage().locator('canvas');
    await expect(canvas).toBeVisible();
    
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    
    console.log('✓ 横屏模式测试完成');
  });

  test('不同分辨率等价类测试', async ({ page }) => {
    const resolutions = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 375, height: 667, name: 'iPhone 6/7/8' },
      { width: 414, height: 736, name: 'iPhone Plus' },
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad 横屏' }
    ];
    
    for (const resolution of resolutions) {
      console.log(`测试分辨率: ${resolution.name} (${resolution.width}x${resolution.height})`);
      
      await page.setViewportSize(resolution);
      await page.goto('/');
      
      const canvas = await helper.verifyGameInitialization();
      
      // 基本功能测试
      await helper.testPlayerMovement(canvas, 0.5, 0.5);
      await helper.testPlayerMovement(canvas, 0.3, 0.7);
      
      // 检查画布适配
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
      
      // 确保画布不超出视口
      expect(box!.width).toBeLessThanOrEqual(resolution.width + 10); // 允许少量误差
      expect(box!.height).toBeLessThanOrEqual(resolution.height + 10);
    }
    
    console.log('✓ 分辨率兼容性测试完成');
  });

  test('触摸设备特性等价类测试', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 414, height: 736 });
    await page.goto('/');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 模拟触摸手势
    const box = await canvas.boundingBox();
    if (!box) throw new Error('未获取到canvas的boundingBox');
    
    // 单点触摸
    await page.touchscreen.tap(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.waitForTimeout(500);
    
    // 连续触摸
    const touchPoints = [
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.2 },
      { x: 0.8, y: 0.8 },
      { x: 0.2, y: 0.8 }
    ];
    
    for (const point of touchPoints) {
      await page.touchscreen.tap(
        box.x + box.width * point.x,
        box.y + box.height * point.y
      );
      await page.waitForTimeout(300);
    }
    
    console.log('✓ 触摸设备特性测试完成');
  });
});
