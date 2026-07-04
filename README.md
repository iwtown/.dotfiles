# Dotfiles

WSL2 开发环境一键配置。基于 GNU Stow 的 dotfiles 管理 + Pi Agent 完整配置。

## 快速开始

```bash
# 1. 克隆仓库（含 submodule）
git clone --recurse-submodules https://github.com/iwtown/dotfiles.git ~/.dotfiles
cd ~/.dotfiles

# 2. 编辑环境变量（API key）
cp .env.example ~/.dotfiles.env
vim ~/.dotfiles.env   # 填入你的 API key

# 3. 一键安装
./dot init

# 4. 重载 shell
source ~/.bashrc
```

## 日常同步

```bash
dot status     # 查看配置变更 + 扩展漂移
dot sync       # 将新扩展迁移到 dotfiles
git commit -m "chore: sync" && git push
```

> **自动同步**：`settings.json` 是 symlink，Pi 的 `pi install` 操作直接写入 dotfiles 仓库，`dot status` 即可看到变化。
>
> **pi-llm-wiki**：作为 git submodule 集成在 `modules/pi-llm-wiki/`，自动 symlink 到 `~/pi-llm-wiki`。在其目录内正常开发、commit、push，然后在 dotfiles 内 `git add modules/pi-llm-wiki && git commit` 锁定版本。

## 包含内容

### Shell & 终端

| 工具 | 用途 |
|------|------|
| **bash** | Shell 配置（`.bashrc` / `.profile`） |
| **tmux** | 终端复用器（prefix `C-a`，vim 风格导航） |
| **zoxide** | 智能跳转（`z <dir>`） |
| **fzf** | 模糊搜索 |

### CLI 工具箱

| 工具 | 替代 | 用途 |
|------|------|------|
| `rg` | grep | 代码搜索 |
| `fd` | find | 文件查找 |
| `bat` | cat | 语法高亮查看 |
| `eza` | ls | 现代化 ls |
| `delta` | diff | 语法高亮 diff |
| `jq` / `yq` | — | JSON/YAML 处理 |
| `duf` | df | 磁盘使用 |
| `tldr` | man | 命令速查 |

### Pi Agent

- **4 个 LLM Provider**：DeepSeek / SiliconFlow（国内镜像）/ OpenRouter / OpenCode Zen
- **Subagents**：worker/planner/scout 用 Step-3.5-Flash，reviewer/oracle 用 V3.2
- **扩展**：rtk-proxy、protected-paths、cli-anything、dirty-repo-guard、fork
- **Pi Packages**：20+ 包（context、subagents、web-access、planning-with-files 等）
- **Skills**：obsidian、commit、github、find-skills、vscode 等

## 目录结构

```
~/.dotfiles/
├── dot                     # CLI 管理工具
├── .env.example            # 环境变量模板
├── AGENTS.md               # AI 助手指令
├── README.md               # 本文件
├── home/                   # Stowed to ~
│   ├── .bashrc
│   ├── .profile
│   ├── .gitconfig
│   ├── .tmux.conf
│   ├── .npmrc
│   └── .pi/
│       ├── web-search*.json.example
│       └── agent/
│           ├── settings.json       # Pi 主配置
│           ├── models.json         # Provider/模型定义
│           ├── keybindings.json    # 快捷键
│           ├── auth.json.example
│           ├── settings.webdav.json.example
│           ├── AGENTS.md
│           ├── prompts/
│           └── extensions/         # 自定义扩展
├── packages/
│   └── apt-bundle           # apt 包列表
└── modules/                 # Git submodules
    └── pi-llm-wiki/         # LLM-Wiki 扩展（独立开发，symlink 到 ~/pi-llm-wiki）
```

## `dot` CLI

```bash
dot init       # 完整安装（apt + stow + pi + packages）
dot update     # 拉取最新 + submodule + apt upgrade + 重装
dot stow       # 仅重新创建符号链接
dot status     # 查看 git 变更 + 扩展漂移
dot sync       # 将新扩展同步到 dotfiles
dot doctor     # 健康检查
dot secrets    # 从模板设置敏感配置
dot link       # 全局安装 dot 命令
```

## 换电脑恢复

```bash
git clone --recurse-submodules https://github.com/iwtown/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
# 编辑 ~/.dotfiles.env 填入 key
./dot init
source ~/.bashrc
```

## 敏感信息

- API key 存储在 `~/.dotfiles.env`（不纳入版本控制）
- Pi 搜索 API key 在 `~/.pi/web-search*.json`（从 `.example` 模板复制）
- `.gitignore` 阻止所有敏感文件提交

## Pi Agent 配置参考

### settings.json 选择器语法

`home/.pi/agent/settings.json` 使用 `+`/`-` 前缀精细控制包内的扩展和技能：

```json
{
  "source": "npm:@ineersa/my-pi-extensions",
  "extensions": [
    "+extensions/focus-cursor.ts",    // 只开启 focus-cursor
    "-extensions/custom-footer.ts",   // 排除 custom-footer
    "-skills/book2skill/SKILL.md"     // 排除 book2skill 技能
  ]
}
```

| 前缀 | 含义 | 示例 |
|------|------|------|
| `+` | 只开启此项（白名单） | `+extensions/focus-cursor.ts` |
| `-` | 排除此项（黑名单） | `-extensions/custom-footer.ts` |
| 无前缀 | 全部开启（默认） | `"extensions/cli-anything"` |

选择器路径相对于包的根目录。此语法由 Pi 原生支持，详见 Pi SDK 文档。

## 灵感

借鉴 [dmmulroy/.dotfiles](https://github.com/dmmulroy/.dotfiles) 的 Stow + CLI 模式。
