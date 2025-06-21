import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/heavy-machine-gun/';

test.describe('重机枪游戏详细诊断', () => {
  test('游戏完整功能诊断', async ({ page }) => {
    // 监听控制台错误
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 监听网络错误
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(BASE_URL);
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 给游戏足够时间初始化

    console.log('🎮 开始游戏诊断...');

    // 1. 检查页面基本状态
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 2. 检查 Canvas 
    const canvas = await page.$('canvas');
    expect(canvas).not.toBeNull();
    
    if (canvas) {
      const canvasBox = await canvas.boundingBox();
      console.log(`🎨 Canvas 尺寸: ${canvasBox?.width}x${canvasBox?.height}`);
        // 3. 检查 Phaser 游戏实例
      const gameStatus = await page.evaluate(() => {
        return {
          hasPhaser: typeof (window as any).Phaser !== 'undefined',
          hasGame: typeof (window as any).game !== 'undefined',
          gameRunning: (window as any).game?.scene?.isActive?.('GameScene') || false,
          canvasContext: !!document.querySelector('canvas')?.getContext('webgl2') || !!document.querySelector('canvas')?.getContext('webgl')
        };
      });
      
      console.log('🎮 游戏状态:');
      console.log(`  - Phaser 加载: ${gameStatus.hasPhaser}`);
      console.log(`  - 游戏实例: ${gameStatus.hasGame}`);
      console.log(`  - 场景运行: ${gameStatus.gameRunning}`);
      console.log(`  - WebGL 支持: ${gameStatus.canvasContext}`);      // 4. 测试交互
      console.log('🖱️ 测试鼠标交互...');
      if (canvasBox) {
        await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
        await page.waitForTimeout(1000);
      }

      // 5. 检查游戏元素
      const gameElements = await page.evaluate(() => {
        const game = (window as any).game;
        if (!game || !game.scene || !game.scene.scenes[0]) return null;
        
        const scene = game.scene.scenes[0];
        return {
          hasPlayer: !!scene.player,
          bulletCount: scene.bullets?.children?.size || 0,
          enemyCount: scene.enemies?.children?.size || 0,
          score: scene.score || 0
        };
      });

      if (gameElements) {
        console.log('🎯 游戏元素状态:');
        console.log(`  - 玩家存在: ${gameElements.hasPlayer}`);
        console.log(`  - 子弹数量: ${gameElements.bulletCount}`);
        console.log(`  - 敌人数量: ${gameElements.enemyCount}`);
        console.log(`  - 当前分数: ${gameElements.score}`);
      }
    }

    // 6. 报告错误
    if (consoleErrors.length > 0) {
      console.log('❌ 控制台错误:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ 无控制台错误');
    }

    if (networkErrors.length > 0) {
      console.log('🌐 网络错误:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ 无网络错误');
    }

    // 断言测试
    expect(consoleErrors.length).toBe(0);
    expect(networkErrors.length).toBe(0);
    expect(canvas).not.toBeNull();
  });
});
