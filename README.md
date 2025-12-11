# STR Form Builder

Electron 打包仓库，用于构建 STR Form Editor 的跨平台安装包。

## 说明

此仓库仅包含：
- 编译后的前端产物 (`dist/`)
- 编译后的 Electron 主进程 (`dist-electron/`)
- Electron 打包配置

源代码位于私有仓库中。

## 构建产物

- **Windows**: `.exe` 安装包 + `.zip` 便携版
- **macOS**: `.dmg` 镜像 + `.zip` 压缩包（Universal Binary，支持 Intel 和 Apple Silicon）

## 自动构建

推送版本标签时自动触发 GitHub Actions 构建：

```bash
git tag v1.0.0
git push origin v1.0.0
```

构建完成后，安装包会自动发布到 [Releases](../../releases) 页面。

## 手动构建

```bash
# 安装依赖
npm install

# 构建 Windows
npm run build:win

# 构建 macOS (Universal)
npm run build:mac

# 构建所有平台
npm run build:all
```

## 许可证

MIT
