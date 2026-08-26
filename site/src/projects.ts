export type ProjectStatus = 'completed' | 'in-progress' | 'planned';

export interface Project {
  readonly id: string;
  readonly order: string;
  readonly language: string;
  readonly shortLanguage: string;
  readonly title: string;
  readonly dayRange: string;
  readonly challenge: string;
  readonly description: string;
  readonly focus: readonly string[];
  readonly status: ProjectStatus;
  readonly accent: string;
  readonly repository?: string;
}

export const projects: readonly Project[] = [
  {
    id: 'typescript',
    order: '01',
    language: 'TypeScript',
    shortLanguage: 'TS',
    title: 'TokenLens',
    dayRange: 'Day 01–04',
    challenge: '把不可见的 Token 消耗变成浏览器内可观察、可比较的工程数据。',
    description:
      '在浏览器本地拆解文本的 Token、字节与上下文预算，让模型看见的内容变得可观察。',
    focus: ['React', 'Web Worker', 'WASM'],
    status: 'completed',
    accent: '#61efff',
    repository: 'https://github.com/echo-DM/tokenLens',
  },
  {
    id: 'ruby',
    order: '02',
    language: 'Ruby',
    shortLanguage: 'RB',
    title: 'AgentExpect',
    dayRange: 'Day 05–08',
    challenge: '为概率性输出设计一套可读、可扩展、能进入 CI 的测试语言。',
    description:
      '用简洁、可扩展的 DSL 描述大模型评估规则，为不确定系统建立确定性的测试接口。',
    focus: ['DSL', 'Matcher', 'CI'],
    status: 'completed',
    accent: '#ff5e7d',
    repository: 'https://github.com/echo-DM/agent-expect',
  },
  {
    id: 'python',
    order: '03',
    language: 'Python',
    shortLanguage: 'PY',
    title: '开源项目维护 Agent',
    dayRange: 'Day 09–12',
    challenge: '让 Agent 从理解 Issue 走到提交一份人类可以审查的改动。',
    description:
      '从 GitHub Issue 出发理解代码库、规划修改、完成实现，并整理为可审查的 Pull Request。',
    focus: ['Agent', 'Tool Use', 'GitHub'],
    status: 'planned',
    accent: '#ffe66d',
  },
  {
    id: 'haskell',
    order: '04',
    language: 'Haskell',
    shortLanguage: 'HS',
    title: 'Agent 工作流验证器',
    dayRange: 'Day 13–16',
    challenge: '在执行发生之前，用类型系统排除不安全的 Agent 工作流。',
    description:
      '通过类型与状态机，在 Agent 运行前检查工作流是否安全、完整，并阻止非法状态迁移。',
    focus: ['GADT', 'State Machine', 'Safety'],
    status: 'planned',
    accent: '#c9a7ff',
  },
  {
    id: 'rust',
    order: '05',
    language: 'Rust',
    shortLanguage: 'RS',
    title: '本地模型自动路由器',
    dayRange: 'Day 17–20',
    challenge: '依据成本、延迟、隐私与能力，把任务送往最合适的模型。',
    description:
      '综合任务难度、延迟、成本、隐私与硬件条件，在本地和远程模型之间自动选择。',
    focus: ['Tokio', 'Routing', 'Benchmark'],
    status: 'planned',
    accent: '#ff9a62',
  },
  {
    id: 'go',
    order: '06',
    language: 'Go',
    shortLanguage: 'GO',
    title: '持久化 Agent Worker',
    dayRange: 'Day 21–24',
    challenge: '让长时间运行的 Agent 任务可以中断、恢复，并安全地重试。',
    description:
      '以检查点、重试与幂等机制守护长时间任务，让 Worker 崩溃后仍能从正确位置恢复。',
    focus: ['Goroutine', 'Checkpoint', 'Recovery'],
    status: 'planned',
    accent: '#5fe6b9',
  },
  {
    id: 'zig',
    order: '07',
    language: 'Zig',
    shortLanguage: 'ZG',
    title: '极简大模型推理引擎',
    dayRange: 'Day 25–30',
    challenge: '从零串起权重、Tokenizer、Attention 与采样的完整推理路径。',
    description:
      '从权重加载、Tokenizer 与 Attention 走到采样，理解模型如何生成下一个 Token。',
    focus: ['Memory', 'SIMD', 'Inference'],
    status: 'planned',
    accent: '#ffcf70',
  },
] as const;
