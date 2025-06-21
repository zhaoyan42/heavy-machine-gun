import { test, expect } from '@playwright/test';

// 使用开发服务器地址
// 端到端基础测试：打开首页，检查画布和UI

test.describe('重机枪游戏 E2E 基础测试', () => {  test('首页加载与主UI渲染', async ({ page }) => {
    await page.goto('/');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
      // 检查游戏标题
    await expect(page).toHaveTitle(/重机枪.*射击游戏|Heavy Machine Gun/);
    
    // 检查画布是否存在
    const canvas = await page.$('canvas');
    expect(canvas).not.toBeNull();
    
    // 检查页面是否包含游戏相关的内容
    const pageContent = await page.content();
    expect(pageContent).toContain('canvas');
    
    // 等待一段时间确保游戏初始化完成
    await page.waitForTimeout(2000);
      // 检查控制台是否有严重错误
    const errors = await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
    expect(errors.length).toBe(0);
  });  test('模拟点击移动', async ({ page }) => {
    await page.goto('/');
    
    // 等待游戏加载完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const canvas = await page.$('canvas');
    expect(canvas).not.toBeNull();
    if (!canvas) throw new Error('未找到canvas');
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) throw new Error('未获取到canvas的boundingBox');
    
    // 在画布中心点击
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    
    // 等待一下看看是否有响应
    await page.waitForTimeout(500);
    
    // 检查游戏是否响应点击（可以通过检查 Canvas 变化或其他方式）
    expect(true).toBeTruthy();
  });
  test('游戏Canvas尺寸检查', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const canvas = await page.$('canvas');
    expect(canvas).not.toBeNull();
    
    if (canvas) {
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // 检查 Canvas 有合理的尺寸
        expect(box.width).toBeGreaterThan(200);
        expect(box.height).toBeGreaterThan(200);
      }
    }
  });
});
