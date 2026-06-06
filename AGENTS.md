# DOTFILES

WSL2 dev env via GNU Stow. Bash + tmux + Pi Agent + CLI tools.

## STRUCTURE

```
.dotfiles/
├── dot                 # CLI: init/update/stow/doctor (bash)
├── home/               # Stowed to ~
│   ├── .bashrc         # Shell config (sources ~/.dotfiles.env)
│   ├── .profile        # Login shell
│   ├── .gitconfig      # Git defaults
│   ├── .tmux.conf      # tmux (prefix C-a, vim nav, extended-keys)
│   ├── .npmrc          # npm mirror (npmmirror.com)
│   └── .pi/            # Pi Agent workspace
│       ├── agent/
│       │   ├── settings.json     # Provider/model/packages/subagents
│       │   ├── models.json       # 4 providers (deepseek/siliconflow/opencode-zen/openrouter)
│       │   ├── keybindings.json  # Custom keybindings
│       │   ├── extensions/       # Custom extensions
│       │   │   ├── cli-anything/ # Ise's CLI toolbox
│       │   │   ├── dirty-repo-guard/
│       │   │   ├── fork/
│       │   │   ├── protected-paths.ts
│       │   │   └── rtk-proxy.ts
│       │   └── prompts/          # Custom system prompts
│       └── web-search*.json.example
├── modules/            # Git submodules
│   └── pi-llm-wiki/    # LLM-Wiki extension (linked to ~/pi-llm-wiki)
├── packages/
│   └── apt-bundle      # apt package list
└── .env.example        # API key template
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Change Pi provider/model | `home/.pi/agent/settings.json` → `defaultProvider`/`defaultModel` |
| Add LLM provider | `home/.pi/agent/models.json` → `providers` |
| Add pi package | `home/.pi/agent/settings.json` → `packages[]` |
| Create custom extension | `home/.pi/agent/extensions/<name>.ts` |
| Shell alias | `home/.bashrc` |
| tmux binding | `home/.tmux.conf` |
| Add apt package | `packages/apt-bundle` |
| API keys (not in git) | `~/.dotfiles.env` (template: `.env.example`) |
| pi-llm-wiki development | `modules/pi-llm-wiki/` (submodule, linked to `~/pi-llm-wiki`) |

## DAILY WORKFLOW

```bash
# After using Pi and making config changes:
dot status     # Check what's drifted
dot sync       # Pull new extensions into dotfiles
git add -A && git commit -m "chore: sync config changes"
git push

# If you made changes to pi-llm-wiki:
cd ~/pi-llm-wiki
git add -A && git commit -m "feat: ..."
git push
cd ~/dotfiles
git add modules/pi-llm-wiki && git commit -m "chore: bump pi-llm-wiki"
git push
```

Auto-sync: `settings.json` is symlinked → `pi install` writes directly to dotfiles.
New extensions created at `~/.pi/agent/extensions/` → `dot sync` moves them in.

## CONVENTIONS

- Stow layout: `home/` mirrors `~`, stow creates symlinks
- API keys: `~/.dotfiles.env` (gitignored), sourced by `.bashrc` and `.profile`
- Pi models: all use `$ENV_VAR` for API keys — no secrets in config files
- Pi extensions: TypeScript, `export default function(pi: ExtensionAPI)`
- Pi skills: installed by pi from settings.json `packages[]`, not in dotfiles
- Sensitive pi config (web-search, webdav): `.example` templates in repo
- Runtime state (sessions, tmp, run-history): completely gitignored
- Agent runtime files (safe-guard, manifest): gitignored — auto-generated

## ANTI-PATTERNS

- Edit `~/.bashrc` directly (changes lost on stow — edit `home/.bashrc`)
- Commit API keys (use `~/.dotfiles.env` and `.example` templates)
- Commit web-search.json with real keys (use `.example`)
- Include `node_modules/` in extensions
- Include pi-installed skills in dotfiles (they're re-installed by `pi install --all`)
- Hardcode `~` or `/home/wtown` paths (use `$HOME` or `$DOTFILES_DIR`)
- Create extensions directly in `~/.pi/agent/extensions/` (they'll be detected by `dot status` but not in dotfiles until `dot sync`)
- Forget to commit submodule pointer after pi-llm-wiki changes

## KEY CONFIGS

| Config | Setting | Notes |
|--------|---------|-------|
| Pi default | deepseek/deepseek-v4-pro | 1M context, $DEEPSEEK_API_KEY |
| Pi mirror | siliconflow/Step-3.5-Flash | 编码特化 196B MoE, 国内低延迟 |
| Subagents | Step-3.5-Flash (worker/planner) | 便宜快速；reviewer/oracle 用 V3.2 |
| Pi fork | Step-3.5-Flash, minimal thinking | 子 fork 轻量配置 |
| tmux prefix | `C-a` | 比默认 C-b 好按 |
| tmux keys | `h/j/k/l` pane nav, `d`/`D` split | Vim 风格 |
| tmux extended-keys | `on` + `csi-u` | Pi Agent 需要区分 Ctrl/Shift/Alt |
| npm | npmmirror.com | 国内镜像 |
| git | autocrlf=input, push.default=current | WSL2 适配 |
| WebDAV | 坚果云 | 设置密码在 `PI_WEBDAV_PASSWORD` |

## PROVIDERS

| Provider | API | Models | Key |
|----------|-----|--------|-----|
| deepseek | api.deepseek.com | V4 Pro, V4 Flash | `$DEEPSEEK_API_KEY` |
| siliconflow | api.siliconflow.cn/v1 | DS V4/V3.2/R1, Step-3.5, Qwen | `$SILICONFLOW_API_KEY` |
| opencode-zen | opencode.ai/zen/v1 | DS V4 Flash, Nemotron, MiMo (免费) | `$OPENCODE_ZEN_API_KEY` |
| openrouter | openrouter.ai | Free models only | `$OPENROUTER_API_KEY` |

## PI PACKAGES

| Package | Source | Provides |
|---------|--------|----------|
| pi-context | npm | Context management strategies |
| pi-extension-settings | npm | TUI config UI |
| pi-skills | git:badlogic | vscode, github, browser-tools etc |
| pi-ask-user | npm | Decision handshake |
| my-pi-extensions | npm:@ineersa | focus-cursor, custom-footer |
| pi-subagents | npm | Subagent orchestration |
| pi-mcp-adapter | npm | MCP gateway |
| pi-web-access | npm | web_search + librarian skill |
| pi-observational-memory | npm | Compaction + recall |
| planning-with-files | npm:@tomxprime | File-based planning |
| obsidian-wiki | git:Ar9av | Obsidian knowledge integration |
| pi-webdav-sync | npm | Config sync via WebDAV |
| pi-load-skill | npm | Dynamic skill loading |
| pi-handoff | npm:@ssweens | Session handoff |
| pi-model-router | npm | Model routing |

## BOOTSTRAP (new machine)

```bash
# Prerequisites: git, curl, node (via nvm or apt)
git clone --recurse-submodules https://github.com/wtown/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
cp .env.example ~/.dotfiles.env && vim ~/.dotfiles.env
./dot init
source ~/.bashrc
```

## NOTES

- `dot init` installs apt packages, stows configs, installs pi + packages
- `dot update` pulls latest + apt upgrade + re-stow + pi update packages
- `dot doctor` checks all tools, configs, and symlinks
- `pi-llm-wiki` at `~/pi-llm-wiki` is a separate repo (add as git submodule if desired)
- tmux auto-attach disabled — using WezTerm mux for native session persistence
- `~/.pi/agent/safe-guard.json` is runtime generated, not in dotfiles
