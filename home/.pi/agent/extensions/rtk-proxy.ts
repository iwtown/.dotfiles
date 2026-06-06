import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

/**
 * RTK Proxy Extension
 * 方案 A + 方案 B 组合：
 *   A - 注入 RTK + MarkItDown 使用指令到系统提示词
 *   B - 自动拦截 bash 命令加上 rtk 前缀
 */

// RTK 支持的命令前缀列表（与 rtk --help 同步）
const RTK_COMMANDS = new Set([
  // 文件操作
  "ls", "tree", "read", "find", "grep", "wc",
  // 版本控制
  "git", "gh", "glab", "gt",
  // 包管理
  "npm", "npx", "pnpm", "cargo", "pip", "go",
  // 测试
  "test", "pytest", "vitest", "jest", "playwright",
  // 构建/检查
  "tsc", "lint", "prettier", "format", "ruff", "mypy",
  "rubocop",
  "prisma", "next", "dotnet", "gradlew", "golangci-lint",
  // Ruby
  "rake", "rubocop", "rspec",
  // 容器/云
  "docker", "kubectl", "aws",
  // 数据库
  "psql",
  // 通用工具
  "diff", "log", "curl", "wget",
  // rtk 原生包装器
  "err", "smart", "summary", "json", "deps", "env",
]);

/** 判断是否需要被 rtk 包装 */
function shouldWrap(command: string): boolean {
  const trimmed = command.trim();

  // 已含 rtk 前缀则跳过
  if (/^rtk(\s|$)/.test(trimmed)) return false;

  // 含管道或重定向的复杂命令跳过
  if (/[|<>]/.test(trimmed)) return false;

  // 取命令的第一个词
  const firstWord = trimmed.split(/\s+/)[0];

  if (RTK_COMMANDS.has(firstWord)) return true;

  // 特殊处理 cd 开头的复合命令 (cd x && git status)
  // 对每个 && / || 分段检查
  const segments = trimmed.split(/\s*[;&|]{2}\s*/);
  if (segments.length > 1) {
    // 只要有一个分段值得包装，就包装整个命令
    return segments.some((seg) => {
      const segFirst = seg.trim().split(/\s+/)[0];
      return RTK_COMMANDS.has(segFirst);
    });
  }

  return false;
}

/** 包装命令：在每个分段前加 rtk 前缀 */
function wrapCommand(command: string): string {
  const trimmed = command.trim();

  // 检查是否为复合命令（&& / || / ;）
  const separatorMatch = trimmed.match(/^(.+?)(\s*[;&|]{2}\s*)(.+)$/);
  if (separatorMatch) {
    const [, first, sep, rest] = separatorMatch;
    return `${wrapCommand(first)}${sep}${wrapCommand(rest)}`;
  }

  // 单条命令直接加前缀
  return `rtk ${trimmed}`;
}

export default function (pi: ExtensionAPI) {
  // ===== 方案 A: 注入 RTK + MarkItDown 使用指令 =====
  pi.on("before_agent_start", async (event, _ctx) => {
    return {
      systemPrompt:
        event.systemPrompt +
        `
## Token 优化指令 (RTK)

为了节省 LLM 上下文 token，执行 bash 命令时请遵循以下规则：

1. **优先使用 \`rtk <command>\`** 代替原生命令，减少输出 token 消耗
2. 支持的命令分类（自动附加 \`rtk\` 前缀）：
   - 文件: \`ls\`, \`read\`, \`tree\`, \`find\`, \`grep\`, \`wc\`, \`diff\`, \`log\`
   - 版本控制: \`git\`, \`gh\`, \`glab\`, \`gt\`
   - 包管理: \`npm\`, \`npx\`, \`pnpm\`, \`cargo\`, \`pip\`, \`go\`
   - 测试: \`test\`, \`pytest\`, \`vitest\`, \`jest\`, \`playwright\`, \`rake\`, \`rspec\`
   - 构建/检查: \`tsc\`, \`lint\`, \`prettier\`, \`format\`, \`ruff\`, \`mypy\`, \`rubocop\`, \`next\`, \`prisma\`, \`dotnet\`, \`gradlew\`, \`golangci-lint\`
   - 容器/云: \`docker\`, \`kubectl\`, \`aws\`
   - 数据库: \`psql\`
   - 网络/通用: \`curl\`, \`wget\`, \`json\`, \`deps\`, \`env\`, \`err\`, \`smart\`, \`summary\`
3. 不要用于含管道 (\`|\`) 或重定向 (\`>\`, \`<\`) 的命令
4. RTK 会自动过滤压缩输出（ANSI 剥离、构建/测试聚合、源码过滤等），可节省 60-90% token
5. \`rtk gain\` 查看 token 节省统计

## 文件转换工具 (MarkItDown)

\`markitdown\` 可将二进制文件转为 Markdown 供 LLM 读取：

- 支持格式: PDF, DOCX, PPTX, XLSX, 图片(OCR), 音频(转录), HTML, EPUB, ZIP, YouTube 字幕
- 用法: \`markitdown file.pdf\` (输出到 stdout) 或 \`markitdown file.pptx -o output.md\`
- 最佳实践: 先转换到临时文件再用 \`read\` 读取: \`markitdown doc.pdf > /tmp/doc.md && read /tmp/doc.md\`
- 对于 URL 文件可用: \`markitdown "https://..."\``,
    };
  });

  // ===== 方案 B: 自动拦截 bash 命令加 rtk 前缀 =====
  pi.on("tool_call", async (event, _ctx) => {
    if (isToolCallEventType("bash", event)) {
      const cmd = event.input.command?.trim();
      if (!cmd) return;

      // 跳过已含 rtk 的命令以及 cd/pushd/popd 等纯 shell 命令
      if (/^(cd|pushd|popd|exit|export|source|alias|unset)\b/.test(cmd)) return;

      if (shouldWrap(cmd)) {
        const wrapped = wrapCommand(cmd);
        event.input.command = wrapped;
      }
    }
  });
}
