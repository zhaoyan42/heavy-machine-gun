#!/usr/bin/env sh

# 发生错误时中止脚本
set -e

# 构建项目
npm run build

# 进入构建输出目录
cd dist

# 添加.nojekyll文件（防止GitHub Pages忽略以_开头的文件）
touch .nojekyll

# 如果是发布到自定义域名
# echo 'your-domain.com' > CNAME

git init
git checkout -b main
git add -A
git commit -m 'deploy'

# 如果要部署到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:zhaoyan42/heavy-machine-gun.git main:gh-pages

cd -
