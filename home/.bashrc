# ~/.bashrc — Pi dotfiles managed
# ============================================================
# Source secrets from ~/.dotfiles.env (NOT in git, template at .env.example)
if [ -f ~/.dotfiles.env ]; then
    . ~/.dotfiles.env
fi

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History
HISTCONTROL=ignoreboth
shopt -s histappend
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s checkwinsize

# Lesspipe
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Prompt
if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Bash completion
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# ===== PATH =====
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.pi/agent/scaffolding:$PATH"
export PATH="$HOME/.local/usr/bin:$PATH"

# ===== Terminal =====
export TERMINFO_DIRS="$HOME/.local/usr/share/terminfo:/usr/share/terminfo"

# ===== Tools =====
# zoxide (smart cd)
eval "$(zoxide init bash)"

# ===== Pi Agent =====
# pi-grill: 启动 Pi 的 grill-me 模式
alias pi-grill='pi --append-system-prompt ~/.pi/agent/prompts/grill-me.md'

# Dotfiles CLI (after stow)
alias dot='~/.dotfiles/dot'

# Disable tmux auto-attach (using WezTerm mux)
# To use tmux: tmux new -s main
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

[ ! -f "$HOME/.x-cmd.root/X" ] || . "$HOME/.x-cmd.root/X" # boot up x-cmd.
export PATH="$HOME/.local/bin:$PATH"

# OpenCLI 配置
export OPENCLI_BROWSER_COMMAND_TIMEOUT=90
export OPENCLI_BROWSER_CONNECT_TIMEOUT=15

# OpenCLI daemon 自启
opencli daemon status &>/dev/null || opencli daemon start &>/dev/null &

# API Keys（从 .env 加载，不提交到 git）
if [ -f "$HOME/.env" ]; then
  set -a; source "$HOME/.env"; set +a
fi

# WezTerm IME cursor fix
export PI_HARDWARE_CURSOR=1

