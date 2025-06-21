# 测试环境配置更新说明

## 更新内容

### 1. 环境变量配置
创建了三个环境配置文件：
- `.env` - 开发环境默认配置
- `.env.test` - 测试环境配置 
- `.env.production` - 生产环境配置

### 2. Playwright配置改进
- 添加了 `dotenv` 支持，自动加载环境变量
- 启用了 `webServer` 配置，自动启动开发服务器
- 配置了正确的 `baseURL` 从环境变量读取
- 设置了合适的端口和超时时间

### 3. 测试文件统一更新
- 移除了所有硬编码的URL（如 `http://localhost:3001/heavy-machine-gun/`）
- 所有 `page.goto()` 调用现在使用相对路径 `'/'`
- 移除了重复的 BASE_URL 常量定义
- 通过批量脚本更新了 30+ 个测试文件

## 环境变量说明

### BASE_URL
- **用途**: 测试中访问应用的基础URL
- **默认值**: `http://localhost:3000/heavy-machine-gun/`
- **可覆盖**: 通过环境变量或命令行设置

### DEV_SERVER_PORT  
- **用途**: 开发服务器端口
- **默认值**: `3000`
- **说明**: 与 Vite 配置保持一致

### DEV_SERVER_URL
- **用途**: 开发服务器完整URL
- **默认值**: `http://localhost:3000`
- **说明**: Playwright webServer 用于检测服务器启动

## 使用方法

### 1. 本地开发测试
```bash
# 直接运行测试（会自动启动开发服务器）
npm run test

# 或者使用 playwright 命令
npx playwright test
```

### 2. 自定义环境
```bash
# 使用不同的端口
BASE_URL=http://localhost:8080/heavy-machine-gun/ npx playwright test

# 使用不同的服务器
BASE_URL=https://staging.example.com/heavy-machine-gun/ npx playwright test
```

### 3. CI/CD 环境
在 CI 环境中，可以设置环境变量：
```yaml
env:
  BASE_URL: https://preview.example.com/heavy-machine-gun/
  CI: true
```

## 技术细节

### 自动服务器启动
Playwright 现在会：
1. 检查服务器是否已运行在指定端口
2. 如果没有运行，自动执行 `npm run dev` 启动
3. 等待服务器响应后开始执行测试
4. 测试完成后保持服务器运行（本地开发）

### 路径解析
- 所有测试中的 `page.goto('/')` 会自动解析为 `baseURL + '/'`
- 例如：`'/'` → `http://localhost:3000/heavy-machine-gun/`

### 兼容性
- 向后兼容：现有测试无需修改（除了URL部分）
- 向前兼容：支持未来的部署环境变更
- 跨平台：Windows、macOS、Linux 均支持

## 益处

1. **统一配置**: 所有URL配置集中管理
2. **环境隔离**: 开发、测试、生产环境独立配置  
3. **自动化**: 无需手动启动开发服务器
4. **灵活性**: 支持不同端口和域名
5. **可维护性**: 减少硬编码，便于维护

## 注意事项

1. 确保 `.env` 文件不要提交到版本控制（已添加到 .gitignore）
2. 生产环境部署时需要正确设置 BASE_URL
3. 如果修改了 Vite 端口，同时更新环境变量文件
4. CI 环境可能需要额外的网络配置
