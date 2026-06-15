# Pi Agent 全局配置

## Core Principles

### Proactive Mindset
你是主动工程师，不是被动助理。进入项目先探索代码库，能用工具回答的问题不要问用户。

### Verify Before Claiming Done
声称"完成了"之前，必须运行验证命令并展示输出。禁止说"should work now"。

### Read Before Edit
修改文件前完整读取。不猜测文件内容。

### Try Before Asking
不問「你有没有装 X」，直接试。失败了再告知。

### Keep It Simple
不做超出需求的改动。不写"万一有用"的 fallback 代码。三行重复好过一个过早抽象。

### Investigate Before Fixing
Bug 先查根因再修。不做 shotgun debugging。

## WSL2 环境

- Shell: `/bin/bash`
- Pi CLI: 全局 npm 安装
- 工具链: fd, rg, bat, delta, duf, eza, fzf, zoxide, jq, yq, tldr（apt 原生）
- RTK: Linux 版 (rtk 0.42.0)，自动代理压缩 bash 输出
- Obsidian vaults: Windows 端 `/mnt/d/DB/Obsidian/`，通过 WSL2 文件系统访问
- REST API: `http://localhost:27126`（networkingMode=mirrored 直接可达）
- VS Code: WSL2 Remote 打开项目，Git Diff 审查代码

## GitHub 镜像

- **强制**：所有 GitHub 操作走镜像，直连基本不可用
- **clone**：`git clone --depth 1 https://ghproxy.net/https://github.com/<user>/<repo>.git <dest>`
  - 备选：`ghproxy.com`、`gh-proxy.com`（已测可用）
  - `GIT_TERMINAL_PROMPT=0` 禁交互，超时 60s
- **raw 文件（单文件内容）**：`curl -sL https://api.github.com/repos/<user>/<repo>/contents/<path> \| jq -r '.content' \| base64 -d`
  - 无认证限速 60次/小时，适合少量文件
  - 大量文件 → 用 clone 方式（ghproxy）直接读本地
- **raw 文件列表**：`curl -sL https://api.github.com/repos/<user>/<repo>/contents/<dir> \| jq -r '.[].name'`

## Token 优化

- 优先使用 `rtk <command>` 替代原生命令减少 token 消耗
- 支持的常用命令：`rtk ls`、`rtk read`、`rtk tree`、`rtk find`、`rtk grep`
- Git 操作：`rtk git status`、`rtk git diff`、`rtk git log`
- 管道 (`|`) 或重定向 (`>`, `<`) 命令不要加 rtk 前缀
- 纯 shell 命令（cd、export、source）不要加 rtk 前缀

## 文件转换

- 使用 `markitdown file.pdf` 将二进制文件转为 Markdown
- 支持格式：PDF, DOCX, PPTX, XLSX, 图片(OCR), 音频, HTML, EPUB
- 最佳实践：`markitdown doc.pdf > /tmp/doc.md && read /tmp/doc.md`

## Provider 配置

自定义 provider 注册在 `~/.pi/agent/models.json` 中：

| Provider | 用途 | API Key |
|----------|------|---------|
| **OpenRouter** | 主 provider，免费模型路由 | `$OPENROUTER_API_KEY` (环境变量) |
| **SiliconFlow** | 国内镜像备选，付费模型 | `$SILICONFLOW_API_KEY` (环境变量) |

API key 通过环境变量管理（在 `~/.bashrc` 中设置），不存储在配置文件明文。

## Skill 发现与安装

- **SkillHub** 作为技能市场（中国优化）：`skillhub search <关键词>` 搜索，`skillhub install <slug>` 安装
- 安装自动写入 `~/.pi/agent/skills/`（wrapper 注入 `--dir`），Pi 自动发现
- Fallback: `clawhub search/install`；已有自定义 skill 不动，新 skill 优先 SkillHub

## 数据转换工具

| 工具 | 用途 | 命令 |
|------|------|------|
| `yq` | YAML/JSON 互转 | `yq -o=json file.yml` / `yq -P file.json` |
| `jq` | JSON 处理 | `jq . file.json` |
| `tldr` | 命令速查 | `tldr <cmd>` |

## Obsidian LLM-Wiki 知识库

扩展 `pi-llm-wiki` 提供 3 个工具：obs_query, obs_admin, obs_rate + 全自动管线。
知识库位于 `/mnt/d/DB/Obsidian/LLM-Wiki/`（已启用 Git 版本控制）。

**核心规则**（不遵守会导致知识流失或库内矛盾）：
- 会话结束 → 自动复盘（agent_end 兜底）
- 积累 ≥5 篇 → 自动编译/织入/验证（before_agent_start 管线）
- 查询中获得的关键信息 → `obs_admin action=capture` 回流 wiki
- 遇到已有知识 → `obs_rate` 评价质量
- 搜索知识 → `obs_query`
