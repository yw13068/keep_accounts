# 留白记账 · Ink & Balance — 前端原型规格

> 基于 PRD V1.0.1 实现的水墨风记账 App 原型，使用纯 HTML + CSS，无构建依赖。

---

## 目录结构

```
web/
├── index.html              # 入口页（重定向到 landing.html）
├── pages/                  # 页面
│   ├── landing.html        # 落地页（品牌介绍 + CTA）
│   ├── login.html          # 登录
│   ├── register.html       # 注册
│   ├── forgot.html         # 找回密码（功能开发中）
│   ├── home.html           # 首页（账单明细）
│   ├── stats.html          # 统计
│   ├── budget.html         # 预算
│   ├── profile.html        # 我的
│   ├── account.html        # 账本管理
│   └── add-record.html     # 记一笔（抽屉浮层）
├── styles/                 # 共享样式
│   └── base.css           # CSS 变量、设计 Token、全局样式
├── assets/                 # 共享资源
│   └── icons/             # SVG 图标
├── reference/              # 参考资料（Stitch 导出物）
│   ├── _1 ~ _10/          # 各屏幕的 Stitch 原型文件
│   └── ink_balance/        # 设计系统文档
└── SPEC.md                 # 本文件
```

---

## 页面与 PRD Tab 对应关系

| Tab | 页面 | 说明 |
|-----|------|------|
| — | `landing.html` | 未登录入口，品牌页 |
| — | `login.html` / `register.html` / `forgot.html` | 认证流程 |
| 首页 | `home.html` | 账单明细 + 月度结余 + FAB |
| 统计 | `stats.html` | 环形图 + 支出排行 |
| 预算 | `budget.html` | 预算进度 + 分类预算列表 |
| 我的 | `profile.html` | 用户信息、设置入口、退出登录 |
| 浮层 | `add-record.html` | 记一笔抽屉（通过 FAB 触发） |

---

## 导航关系

```
index.html
  └── landing.html
        ├── login.html
        │     └── home.html（登录成功后）
        │           ├── stats.html
        │           ├── budget.html
        │           ├── profile.html
        │           │     └── login.html（退出登录）
        │           └── add-record.html（FAB 抽屉）
        └── register.html
              └── home.html（注册成功后自动登录）
```

**底部导航（home / stats / budget / profile 共享）：**

| 图标 | 路由 | 说明 |
|------|------|------|
| 首页 | `home.html` | 账单列表、月度结余 |
| 统计 | `stats.html` | 环形图、支出排行、月度趋势 |
| 预算 | `budget.html` | 预算进度、分类预算 |
| 我的 | `profile.html` | 用户信息、设置、退出登录 |

---

## 设计 Token

### 色彩

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-ink` | `#1A1A1A` | 墨色主文字 |
| `--color-pale-ink` | `#6B6B6B` | 淡墨次级文字 |
| `--color-paper` | `#F5F0E8` | 宣纸白背景 |
| `--color-card` | `#FAF7F2` | 素白卡片 |
| `--color-ink-wash` | `#D4CCBC` | 水墨灰分割线 |
| `--color-cinnabar` | `#C0392B` | 朱砂红（支出） |
| `--color-pine` | `#2E7D5E` | 松绿（收入） |
| `--color-slate` | `#2B6CB0` | 石青（交互主色） |
| `--color-ochre` | `#B7610A` | 赭石（预警） |

### 字体

| 用途 | 字体 | 字号 |
|------|------|------|
| 大标题 | Noto Serif SC Bold | 28px |
| 模块标题 | Noto Serif SC SemiBold | 20px |
| 正文 | Noto Serif SC Regular | 16px |
| 辅助文字 | Noto Serif SC Regular | 13px |
| 角标 | Hanken Grotesk Bold | 11px (letter-spacing: 0.1em) |
| 金额数字 | Hanken Grotesk SemiBold | 32-56px |

### 圆角

| 组件 | 圆角 |
|------|------|
| 卡片 | 8px |
| 主按钮 | 4px |
| 底部抽屉顶部 | 32px |
| 输入框底线 | 无（仅下边框） |

### 阴影

| 组件 | 阴影 |
|------|------|
| 卡片 | `0 4px 20px rgba(26,26,26,0.04)` |
| 底部导航 | `0 -2px 5px rgba(26,26,26,0.05)` |
| FAB | `0 10px 15px -3px rgba(0,0,0,0.1)` |

---

## 技术说明

- **CSS 变量**：所有颜色/字体/圆角/阴影定义为 CSS 自定义属性，在 `styles/base.css` 中集中管理
- **无构建依赖**：纯 HTML + CSS，可直接在浏览器中打开
- **路由**：纯前端路由，所有页面为独立 HTML 文件，通过 `<a href>` 跳转
- **状态**：localStorage 模拟登录态（token / userInfo）
- **图标**：SVG 内联嵌入 HTML

---

## 快速预览

直接在浏览器中打开 `index.html` 或 `pages/landing.html` 即可查看原型。

**推荐游览器**：Chrome 90+、Safari 15+、Firefox 90+

---

*基于 PRD V1.0.1 · 2026-07-31*
