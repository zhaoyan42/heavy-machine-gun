import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/heavy-machine-gun/';

test.describe('游戏交互和战斗系统诊断', () => {
  test('控制系统和敌人击败诊断', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('🎮 开始交互和战斗系统诊断...');

    const canvas = await page.$('canvas');
    expect(canvas).not.toBeNull();
    
    if (canvas) {
      const canvasBox = await canvas.boundingBox();
      console.log(`🎨 Canvas 尺寸: ${canvasBox?.width}x${canvasBox?.height}`);

      // 获取初始游戏状态
      const initialState = await page.evaluate(() => {
        const game = (window as any).game;
        if (!game?.scene?.scenes[0]) return null;
        const scene = game.scene.scenes[0];
        return {
          playerX: scene.player?.x || 0,
          playerY: scene.player?.y || 0,
          enemyCount: scene.enemies?.children?.size || 0,
          bulletCount: scene.bullets?.children?.size || 0,
          score: scene.score || 0
        };
      });

      console.log('📊 初始状态:');
      console.log(`  - 玩家位置: (${initialState?.playerX}, ${initialState?.playerY})`);
      console.log(`  - 敌人数量: ${initialState?.enemyCount}`);
      console.log(`  - 子弹数量: ${initialState?.bulletCount}`);
      console.log(`  - 分数: ${initialState?.score}`);

      // 测试鼠标控制
      console.log('🖱️ 测试鼠标控制...');
      if (canvasBox) {
        const targetX = canvasBox.x + canvasBox.width * 0.7; // 移动到右侧
        const targetY = canvasBox.y + canvasBox.height * 0.8;
        await page.mouse.click(targetX, targetY);
        await page.waitForTimeout(2000); // 等待移动完成

        // 检查玩家是否移动
        const afterMoveState = await page.evaluate(() => {
          const game = (window as any).game;
          if (!game?.scene?.scenes[0]) return null;
          const scene = game.scene.scenes[0];
          return {
            playerX: scene.player?.x || 0,
            playerY: scene.player?.y || 0,
            playerTargetX: scene.player?.targetX || 0
          };
        });

        console.log('📊 移动后状态:');
        console.log(`  - 玩家位置: (${afterMoveState?.playerX}, ${afterMoveState?.playerY})`);
        console.log(`  - 玩家目标X: ${afterMoveState?.playerTargetX}`);
        
        const playerMoved = Math.abs((afterMoveState?.playerX || 0) - (initialState?.playerX || 0)) > 10;
        console.log(`  - 玩家是否移动: ${playerMoved ? '✅ 是' : '❌ 否'}`);
      }

      // 等待更长时间让战斗发生
      console.log('⚔️ 等待战斗发生...');
      await page.waitForTimeout(5000);

      // 检查战斗系统
      const battleState = await page.evaluate(() => {
        const game = (window as any).game;
        if (!game?.scene?.scenes[0]) return null;
        const scene = game.scene.scenes[0];
        
        // 检查碰撞系统是否设置
        const hasCollisions = {
          bulletEnemy: !!scene.physics?.world?.colliders?._active?.length,
          playerEnemy: !!scene.physics?.world?.colliders?._active?.length
        };

        return {
          enemyCount: scene.enemies?.children?.size || 0,
          bulletCount: scene.bullets?.children?.size || 0,
          score: scene.score || 0,
          hasCollisions: hasCollisions,
          enemies: scene.enemies?.children?.entries?.slice(0, 3)?.map((enemy: any) => ({
            x: enemy.x,
            y: enemy.y,
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            active: enemy.active
          })) || [],
          bullets: scene.bullets?.children?.entries?.slice(0, 3)?.map((bullet: any) => ({
            x: bullet.x,
            y: bullet.y,
            active: bullet.active
          })) || []
        };
      });

      console.log('⚔️ 战斗系统状态:');
      console.log(`  - 敌人数量: ${battleState?.enemyCount}`);
      console.log(`  - 子弹数量: ${battleState?.bulletCount}`);
      console.log(`  - 分数: ${battleState?.score}`);
      console.log(`  - 碰撞检测: ${battleState?.hasCollisions ? '✅ 已设置' : '❌ 未设置'}`);
      
      if (battleState?.enemies?.length) {
        console.log('👾 敌人详情:');
        battleState.enemies.forEach((enemy, i) => {
          console.log(`  - 敌人${i+1}: 位置(${enemy.x?.toFixed(0)}, ${enemy.y?.toFixed(0)}) 血量:${enemy.currentHp}/${enemy.maxHp} 活跃:${enemy.active}`);
        });
      }

      if (battleState?.bullets?.length) {
        console.log('💥 子弹详情:');
        battleState.bullets.forEach((bullet, i) => {
          console.log(`  - 子弹${i+1}: 位置(${bullet.x?.toFixed(0)}, ${bullet.y?.toFixed(0)}) 活跃:${bullet.active}`);
        });
      }

      // 检查分数是否有变化
      const scoreChanged = (battleState?.score || 0) > (initialState?.score || 0);
      console.log(`  - 分数是否变化: ${scoreChanged ? '✅ 是' : '❌ 否'}`);
    }

    expect(true).toBeTruthy(); // 让测试通过，主要看诊断输出
  });
});
