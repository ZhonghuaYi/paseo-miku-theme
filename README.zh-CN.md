<div align="center">

# Paseo 初音未来主题

一套为 [Paseo](https://github.com/getpaseo/paseo) 制作的精致初音未来风格亮色与暗色主题，
包含无损插画壁纸和经过范围控制的磨砂界面。

[English](./README.md) · **简体中文**

</div>

> [!NOTE]
> 这是非官方粉丝作品，与 Crypton Future Media, Inc. 无关联，也未获得其背书。
> 初音未来及相关标识的权利归各自权利人所有。

## 预览

| Miku Future Light | Miku Future Dark |
| --- | --- |
| ![Miku Future Light 壁纸](./miku-future/assets/miku-future-light-background.png) | ![Miku Future Dark 壁纸](./miku-future/assets/miku-future-dark-background.png) |

## 功能特点

- 提供两套完整 Paseo 配色：**Miku Future Light** 和 **Miku Future Dark**；
- 插件内嵌原始无损 PNG，并在运行时生成短 `Blob URL`，既保留每一个源文件字节，
  又不会触发 Chromium 的 data URL 长度限制；
- 对话历史与 composer 共用一张连续壁纸；
- 你的历史消息气泡和 composer 输入卡片采用克制的半透明磨砂效果，并使用 `18px`
  背景模糊；AI 回复仍保持轻量、清晰；
- Markdown 预览与代码界面继承同一张壁纸，并叠加统一的可读性色膜；
- Git diff 使用很淡且不可交互的壁纸纹理，避免降低代码文字清晰度；
- 不使用从左到右的渐变遮罩，整张图片采用一致的色膜；
- 菜单、设置、终端、侧边栏和其他无关工作区域保留 Paseo 原有的不透明材质；
- 窗口宽度低于 `721px`，或切换到非 Miku 主题时，壁纸增强会自动关闭。

## 可读性

基础主题配色均达到 WCAG AA 普通文字对比度要求：

| 主题 | 正文 / 背景 | 次要文字 / 背景 | 按钮文字 / 主操作色 |
| --- | ---: | ---: | ---: |
| Light | `12.31:1` | `4.89:1` | `4.69:1` |
| Dark | `16.37:1` | `8.35:1` | `8.45:1` |

显示壁纸的区域还会在基础配色上叠加统一的亮色或暗色色膜。

## 平台支持

Paseo 官方 `addTheme` API 只接受颜色，不接受背景图片。因此，本插件将插画作为渐进增强：

| 平台 | 主题配色 | 插画壁纸 |
| --- | :---: | :---: |
| Paseo Desktop / Electron | 支持 | 支持 |
| Paseo Web | 支持 | 支持 |
| iOS / Android | 支持 | 不支持 |

如果未来 Paseo 的 DOM 结构发生变化，即使壁纸增强暂时无法应用，官方配色主题仍可正常工作。

## 安装

需要 Paseo `v0.5.0` 或更高版本。请先在 Paseo 中打开 **Settings → Plugins**，启用
**Enable plugins**。

随后克隆仓库并安装其中的插件目录：

```bash
git clone https://github.com/ZhonghuaYi/paseo-miku-theme.git
cd paseo-miku-theme
paseo plugin install "$(pwd)/miku-future"
paseo plugin ls
```

前往 **Settings → Appearance → Theme**，选择 **Miku Future Light** 或
**Miku Future Dark**。

## 更新

```bash
git pull
paseo plugin reload miku-future
```

如果使用远程 daemon，请在 Paseo 命令后添加 `--host <url>`。

## 开发

可发布插件位于 [`miku-future/`](./miku-future)：

- `index.ts` 定义两套 Paseo 官方配色主题；
- `background.client.ts` 负责应用和清理 Web / Electron 壁纸增强；
- `assets/` 只包含运行时实际使用的两张无损 PNG；
- `background-data.client.ts` 由这两张 PNG 自动生成。

更换任意 PNG 后，请重新生成客户端内嵌数据并重载插件：

```bash
node miku-future/scripts/embed-backgrounds.mjs
paseo plugin reload miku-future
```

## 卸载

```bash
paseo plugin remove miku-future
```

## README 语言

GitHub 目前不能根据访客的界面语言自动切换仓库 README。请使用页面顶部的语言链接，
在完整英文版与简体中文版之间切换。
