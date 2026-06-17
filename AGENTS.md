# DOTFILES

WSL2 dev env via GNU Stow. Bash + tmux + Pi Agent + CLI tools.

## Agent 行为指南

**真相来源**：所有配置以 JSON 文件为准，非 AGENTS.md 中的副本。

| 配置 | 真相源 |
|------|--------|
| Provider/Model | `home/.pi/agent/settings.json` (defaultProvider/defaultModel) |
| Provider 列表 | `home/.pi/agent/models.json` |
| Pi packages | `home/.pi/agent/settings.json` → `packages[]` |
| API keys | `~/.dotfiles.env` (gitignored, 从 `.env.example` 模板创建) |

**Stow 布局**：`home/` 镜像 `~/`，stow 创建符号链接。编辑 `home/.bashrc`，不是 `~/.bashrc`（直接编辑会被 stow 覆盖）。

**Pi extensions**：TypeScript，`export default function(pi: ExtensionAPI)`。

**运行时文件**：sessions、tmp、run-history 完全 gitignored。

**package 来源的 skill**：由 pi 从 settings.json `packages[]` 安装，不在 dotfiles 中。
