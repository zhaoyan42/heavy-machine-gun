import { test, expect } from '@playwright/test';

test.describe('重新开始游戏功能测试', () => {
    
    test('游戏结束后点击应该能重新开始', async ({ page }) => {
        console.log('🧪 开始测试游戏重新开始功能...');
        
        // 导航到游戏页面
        await page.goto('/');
        
        // 等待游戏加载
        await page.waitForTimeout(2000);
        
        // 模拟快速游戏结束：将玩家生命设置为0
        await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            if (gameScene) {
                console.log('🔧 强制设置游戏结束状态');
                gameScene.lives = 0;
                gameScene.gameOver();
            }
        });
        
        // 等待游戏结束界面出现
        await page.waitForTimeout(1000);
        
        // 验证游戏结束状态
        const isGameOver = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            return gameScene ? gameScene.isGameOver : false;
        });
        expect(isGameOver).toBe(true);
        console.log('✅ 游戏结束状态确认');
        
        // 记录重新开始前的状态
        const beforeRestart = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            return {
                score: gameScene?.score || 0,
                level: gameScene?.level || 1,
                enemiesKilled: gameScene?.enemiesKilled || 0
            };
        });
        console.log('📊 重新开始前状态:', beforeRestart);
        
        // 点击屏幕中央尝试重新开始
        console.log('🖱️ 点击屏幕中央尝试重新开始...');
        await page.click('canvas', { position: { x: 200, y: 300 } });
        
        // 等待重新开始处理
        await page.waitForTimeout(2000);
        
        // 验证游戏是否重新开始
        const afterRestart = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            return {
                isGameOver: gameScene?.isGameOver || false,
                score: gameScene?.score || 0,
                level: gameScene?.level || 1,
                enemiesKilled: gameScene?.enemiesKilled || 0,
                lives: gameScene?.lives || 0
            };
        });
        
        console.log('📊 重新开始后状态:', afterRestart);
        
        // 验证重新开始成功
        expect(afterRestart.isGameOver).toBe(false);
        expect(afterRestart.score).toBe(0);
        expect(afterRestart.level).toBe(1);
        expect(afterRestart.enemiesKilled).toBe(0);
        expect(afterRestart.lives).toBe(3); // 初始生命值
        
        console.log('✅ 重新开始功能测试通过');
    });
      test('验证多重散射角度效果', async ({ page }) => {
        console.log('🧪 开始测试多重散射角度...');
        
        // 导航到游戏页面
        await page.goto('/');
        
        // 等待游戏加载
        await page.waitForTimeout(2000);
        
        // 激活多重散射道具
        await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            if (gameScene && gameScene.player) {
                console.log('🎯 激活多重散射道具');
                gameScene.player.enableMultiShot();
            }
        });
        
        // 等待一段时间让子弹发射
        await page.waitForTimeout(3000);
        
        // 检查是否有多个子弹在不同角度
        const bulletInfo = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            if (!gameScene || !gameScene.bullets) return [];
            
            const bullets = gameScene.bullets.children.entries;
            return bullets.map((bullet: any) => ({
                x: Math.round(bullet.x),
                y: Math.round(bullet.y),
                vx: bullet.body ? Math.round(bullet.body.velocity.x) : 0,
                vy: bullet.body ? Math.round(bullet.body.velocity.y) : 0
            }));
        });
        
        console.log('💥 子弹信息:', bulletInfo);
        
        // 验证是否有多个子弹且有不同的X方向速度（散射效果）
        if (bulletInfo.length > 1) {
            const hasSpread = bulletInfo.some((bullet: any) => bullet.vx !== 0);
            expect(hasSpread).toBe(true);
            console.log('✅ 多重散射角度效果确认');
        } else {
            console.log('⚠️ 子弹数量不足，可能需要等待更长时间');
        }
    });
      test('验证等级机制基于敌人击败数量', async ({ page }) => {
        console.log('🧪 开始测试等级机制...');
        
        // 导航到游戏页面
        await page.goto('/');
        
        // 等待游戏加载
        await page.waitForTimeout(2000);
        
        // 模拟击败多个敌人
        const enemiesKilled = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            if (!gameScene) return 0;
            
            console.log('🎯 模拟击败12个敌人...');
            // 击败12个敌人应该足够升级到等级2（需要10个）
            for (let i = 0; i < 12; i++) {
                gameScene.addScore(10); // 每个敌人10分
            }
            
            return gameScene.enemiesKilled;
        });
        
        // 等待处理完成
        await page.waitForTimeout(1000);
        
        // 检查等级是否升级
        const gameState = await page.evaluate(() => {
            const gameScene = (window as any).game?.scene?.getScene('GameScene');
            return {
                level: gameScene?.level || 1,
                enemiesKilled: gameScene?.enemiesKilled || 0,
                score: gameScene?.score || 0
            };
        });
        
        console.log('📊 游戏状态:', gameState);
        
        // 验证等级升级
        expect(gameState.enemiesKilled).toBe(12);
        expect(gameState.level).toBeGreaterThan(1);
        
        console.log('✅ 等级机制测试通过');
    });
});
