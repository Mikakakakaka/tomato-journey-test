# GitHub Pages 关联番茄游戏文件夹 - 设置说明

## 重要：Pages 只能从这两个位置选一个

GitHub Pages **不能**随意选“某个子文件夹”，只能选：

- **根目录 `/ (root)`**：发布你仓库**根目录**下的网站文件  
- **`/docs` 文件夹**：发布仓库里 **`docs`** 文件夹下的网站文件  

所以“关联”番茄游戏 = **让游戏文件落在上面其中一个位置**，再在设置里选对应选项。

---

## 推荐做法：让游戏就在仓库根目录

这样设置最简单，一步到位。

### 1. 仓库里应该是这样的结构（根目录就是游戏）

在 GitHub 上打开你的仓库，根目录直接就是这些：

```
你的仓库名/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── gravity.js
    ├── game.js
    ├── chapter1.js
    ├── chapter2.js
    └── chapter3.js
```

也就是：**不要**再有一层 `tomato-journey` 文件夹，而是把 `index.html`、`css`、`js` 直接放在仓库根目录。

### 2. 如果现在根目录是「番茄游戏在一个子文件夹里」

例如你现在是这样：

```
你的仓库名/
├── tomato-journey/    ← 游戏在这个里面
│   ├── index.html
│   ├── css/
│   └── js/
└── README.md
```

有两种做法：

**做法 A（推荐）**：把游戏文件**移到根目录**

- 把 `tomato-journey` 里面的 `index.html`、`css` 文件夹、`js` 文件夹都**拖到仓库根目录**（和 README 同级）。
- 可以删掉空的 `tomato-journey` 文件夹。
- 这样根目录就是“游戏网站”，直接按下面第 3 步选「根目录」即可。

**做法 B**：用 `docs` 文件夹

- 在仓库里新建一个名为 **`docs`** 的文件夹（名字必须是 `docs`）。
- 把游戏的 **全部文件**（index.html、css、js）都放进 `docs` 里。
- 在 Pages 设置里选「从分支部署」，**文件夹选 `/docs`**（见下面第 3 步）。

---

## 3. 在仓库里开启 Pages 并“关联”位置

1. 打开你的 **GitHub 仓库**页面。
2. 点顶部的 **Settings（设置）**。
3. 左侧菜单里找到 **Pages**，点进去。
4. 在 **Build and deployment** 下面：
   - **Source** 选：**Deploy from a branch**（从分支部署）。
   - **Branch** 选：`main`（或你实际用的默认分支，如 `master`）。
   - **Folder** 选：
     - 若游戏在**根目录** → 选 **/ (root)**  
     - 若游戏在 **docs** 里 → 选 **/docs**
5. 点 **Save** 保存。

过一两分钟，GitHub 会给你一个地址，一般是：

`https://你的用户名.github.io/你的仓库名/`

**重要**：如果游戏在根目录，访问地址就是：  
`https://你的用户名.github.io/你的仓库名/`  
（末尾的 `/` 会自动打开 `index.html`）

如果游戏在 `docs` 里，地址同样是：  
`https://你的用户名.github.io/你的仓库名/`  
（因为 Pages 会把选中的文件夹当作网站根目录）

---

## 4. 用手机打开

在手机浏览器里输入上面的地址，用 **https** 打开，就可以玩番茄游戏，重力感应也会正常工作。

---

## 小结

- “关联文件夹” = 在 Pages 里选 **/ (root)** 或 **/docs**，没有“选 tomato-journey 这个文件夹”的选项。
- 所以要么把游戏文件放在**仓库根目录**并选 **/ (root)**，要么把游戏文件全部放进 **docs** 并选 **/docs**。
- 推荐：把 `index.html`、`css`、`js` 直接放在仓库根目录，然后 Pages 选 **Deploy from a branch → main → / (root)** 即可。
