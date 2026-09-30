# 233 立体图标

基于 233 SVG 标志制作的可旋转 GLB 模型及鼠标跟随预览。正面使用原 SVG 的橙色渐变与白色字形；侧面与倒角使用同色系反光，字形下方没有投影。

## 文件

- [`assets/233-icon-3d.glb`](assets/233-icon-3d.glb)：3D 模型，可导入 Three.js、Blender 等支持 glTF 2.0 的工具。
- [`assets/233-icon-mouse-preview.html`](assets/233-icon-mouse-preview.html)：包含模型和运行代码的单文件预览。下载后在浏览器打开，移动鼠标查看转向。
- [`assets/233-icon-preview.png`](assets/233-icon-preview.png)：静态预览图。
- [`src/`](src/)：SVG 路径、模型生成脚本和预览源码。

## 重新生成

需要 Node.js 18 或更新版本：

```bash
npm ci
npm run build
```

脚本会重新生成 `assets/233-icon-3d.glb` 和 `assets/233-icon-mouse-preview.html`。鼠标跟随逻辑在 `src/viewer-source.js`；GLB 本身只保存模型与材质。
