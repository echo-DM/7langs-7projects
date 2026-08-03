# AgentExpect 技术设计

## 项目定位

AgentExpect 是一个使用 Ruby 编写、面向 LLM 应用和 AI Agent 的行为测试框架。它使用
RSpec 风格的 DSL 描述测试场景，通过命令行、HTTP 或 Ruby 对象调用被测 Agent，并对
Agent 的最终回答和工具调用记录进行断言。

一句话概括：

> AgentExpect 是 Agent 版本的 RSpec：向 Agent 发送问题，取得回答和工具调用记录，
> 然后判断这些可观察行为是否符合预期。

框架测试的是 Agent 的外部行为，而不是模型是否“聪明”，也不检查模型内部的思维过程。

## 项目边界

AgentExpect 负责：

- 使用 Ruby DSL 定义测试场景；
- 调用本地或远程 Agent；
- 把不同 Agent 的执行结果转换成统一结构；
- 检查最终回答、结构化输出和工具调用；
- 输出适合本地开发和 CI 使用的测试报告。

AgentExpect 不负责：

- 构建或编排 Agent；
- 管理 Prompt 和数据集；
- 实现 LangGraph、CrewAI 或其他 Agent Framework；
- 记录生产环境的完整 Trace；
- 提供 Web Dashboard；
- 训练、微调或优化模型；
- 收集模型隐藏的思维链；
- 自动支持所有模型厂商和 Agent Framework。

第一版的核心边界是：

> 一个 Ruby DSL 测试运行器，通过命令行或 HTTP 调用任意语言实现的 Agent，并对 Agent
> 返回的统一 JSON 结果进行断言。

## 整体架构

完整执行流程由五个部分组成：

```text
┌─────────────────────────────┐
│ 1. Ruby 测试文件            │
│                             │
│ ask "订单 123 能退款吗？"   │
│ expect_answer ...           │
│ expect_tool ...             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 2. AgentExpect Runner       │
│                             │
│ 读取测试用例                │
│ 调用 Agent                  │
│ 执行断言                    │
└──────────────┬──────────────┘
               │ HTTP、命令行或 Ruby 调用
               ▼
┌─────────────────────────────┐
│ 3. Agent Driver             │
│                             │
│ 把统一请求转换成            │
│ LangGraph/CrewAI/其他调用   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 4. 被测试的 Agent           │
│                             │
│ LLM                         │
│ 工具调用                    │
│ 最终回答                    │
└──────────────┬──────────────┘
               │ Driver 整理执行结果
               ▼
┌─────────────────────────────┐
│ 5. 统一 JSON 结果           │
│                             │
│ answer                      │
│ tool_calls                  │
│ usage / latency             │
└──────────────┬──────────────┘
               │
               ▼
        AgentExpect 判断
          通过或失败
```

最核心的数据流是：

```text
Ruby DSL
   ↓
AgentExpect Runner
   ↓
Connector
   ↓
Agent Driver（必要时）
   ↓
任意语言编写的 Agent
   ↓
统一 JSON Result
   ↓
Matchers
   ↓
测试报告
```

## 框架内部组成

```text
agent-expect
├── DSL
│   ├── describe_agent
│   ├── case
│   ├── ask
│   └── expect_*
│
├── Runner
│   ├── 加载测试
│   ├── 调用 Agent
│   ├── 执行 Matchers
│   └── 汇总结果
│
├── Connectors
│   ├── CommandConnector
│   ├── HttpConnector
│   └── RubyCallableConnector
│
├── Protocol
│   ├── AgentRequest
│   ├── AgentResult
│   └── ToolCall
│
├── Matchers
│   ├── AnswerMatcher
│   ├── JsonSchemaMatcher
│   └── ToolCallMatcher
│
└── Reporters
    ├── TerminalReporter
    └── JsonReporter
```

## Connector 和 Driver 的区别

这是整个架构中最容易混淆的地方。

### Connector

Connector 是 AgentExpect 内部的组件，解决的问题是：

> 如何把测试请求发送给 Agent？

第一版提供三种通用 Connector：

- `RubyCallableConnector`：调用 Ruby 对象、Proc 或 Lambda；
- `CommandConnector`：运行任意语言的本地命令；
- `HttpConnector`：调用远程 HTTP Agent。

### Driver

Driver 是靠近被测 Agent 的一小段转换代码，解决的问题是：

> 如何调用特定 Agent Framework，并从它的状态中提取回答和工具调用？

例如：

```text
langgraph_driver.py
crewai_driver.py
custom_agent_driver.ts
```

两者的关系是：

```text
AgentExpect Connector
        ↓
    Agent Driver
        ↓
   具体 Agent Framework
```

并不是每个 Agent Framework 都必须由 AgentExpect 官方实现 Adapter。如果不同 Agent 已经
提供相同的 HTTP JSON 接口，它们可以直接复用同一个 `HttpConnector`。只有框架的调用方式
或结果结构特殊时，用户才需要编写一层很薄的 Driver。

## 统一执行协议

语言无关的关键不是支持大量 SDK，而是定义简单、稳定的 JSON 协议。

### 请求

最小请求只需要测试输入：

```json
{
  "protocol_version": "1.0",
  "run_id": "run-123",
  "input": "订单 123 可以退款吗？"
}
```

以后可以扩展为消息列表：

```json
{
  "protocol_version": "1.0",
  "run_id": "run-123",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "订单 123 可以退款吗？"
      }
    ]
  }
}
```

### 结果

```json
{
  "protocol_version": "1.0",
  "run_id": "run-123",
  "status": "completed",
  "answer": "订单 123 已超过退款期限，暂时无法退款。",
  "tool_calls": [
    {
      "name": "refund_lookup",
      "arguments": {
        "order_id": "123"
      },
      "status": "succeeded"
    }
  ],
  "citations": [
    {
      "id": "refund-policy",
      "location": "section-3"
    }
  ],
  "usage": {
    "input_tokens": 180,
    "output_tokens": 32,
    "cost": 0.0024
  },
  "latency_ms": 842,
  "metadata": {
    "model": "configured-model",
    "agent": "refund-assistant"
  }
}
```

第一版可以只要求 `answer` 和 `tool_calls`，其余字段保持可选。

## 三种调用方式

### Ruby Callable

Ruby 中可以约定被测对象实现 `call`：

```ruby
class RefundAgent
  def call(question)
    {
      answer: "订单已超过退款期限。",
      tool_calls: []
    }
  end
end
```

测试中使用：

```ruby
describe_agent "refund assistant" do
  subject RefundAgent.new
end
```

也可以传入 Block：

```ruby
subject do |question|
  RefundAgent.call(question)
end
```

### Command

Runner 启动一个子进程，通过标准输入传入请求 JSON，通过标准输出读取结果 JSON：

```ruby
subject command: ["python", "langgraph_driver.py"]
```

也可以调用其他语言：

```ruby
subject command: ["node", "driver.mjs"]
subject command: ["go", "run", "./cmd/driver"]
subject command: ["cargo", "run", "--bin", "driver"]
```

协议约定：

- `stdin` 接收运行请求 JSON；
- `stdout` 只输出最终结果 JSON；
- `stderr` 输出 Agent 日志；
- 退出码 `0` 表示正常执行；
- 非零退出码表示 Agent 执行错误。

### HTTP

对于已经部署的 Agent：

```ruby
subject http: {
  url: "http://localhost:8000/test/invoke",
  headers: {
    "Authorization" => "Bearer test-token"
  }
}
```

只要多个 Agent 遵守相同的请求和响应格式，就可以共享同一个 `HttpConnector`，不需要为
LangGraph、CrewAI 或自研框架分别实现 Ruby Adapter。

## 测试 DSL 示例

```ruby
describe_agent "refund assistant" do
  subject command: ["python", "langgraph_driver.py"]

  case "expired refund" do
    ask "订单 123 可以退款吗？"

    expect_answer.to mention("超过退款期限")

    expect_tool(:refund_lookup).to_be_called_with(
      order_id: "123"
    )

    expect_tool(:issue_refund).not_to_be_called
  end
end
```

这段测试表达三个要求：

1. 回答必须提到退款期限；
2. Agent 必须查询订单；
3. Agent 不能执行退款。

## LangGraph 完整示例

假设被测 Agent 使用 Python 和 LangGraph 编写。

### 第一步：AgentExpect 发送请求

Runner 执行：

```bash
python langgraph_driver.py
```

并通过标准输入发送：

```json
{
  "protocol_version": "1.0",
  "run_id": "run-123",
  "input": "订单 123 可以退款吗？"
}
```

### 第二步：Driver 调用 LangGraph

伪代码：

```python
request = read_json_from_stdin()

final_state = graph.invoke({
    "messages": [
        {
            "role": "user",
            "content": request["input"]
        }
    ]
})

result = {
    "protocol_version": "1.0",
    "run_id": request["run_id"],
    "status": "completed",
    "answer": extract_final_answer(final_state),
    "tool_calls": extract_tool_calls(final_state)
}

print_json(result)
```

Driver 只负责两件事：

- 把统一请求转换成 LangGraph 的调用参数；
- 把 LangGraph 最终状态转换成统一结果。

### 第三步：LangGraph 执行 Agent

```text
用户问题
   ↓
LLM 判断需要查询订单
   ↓
调用 refund_lookup(order_id: "123")
   ↓
工具返回 eligible: false
   ↓
LLM 生成最终回答
```

### 第四步：Driver 返回结果

```json
{
  "protocol_version": "1.0",
  "run_id": "run-123",
  "status": "completed",
  "answer": "订单 123 已超过退款期限，暂时无法退款。",
  "tool_calls": [
    {
      "name": "refund_lookup",
      "arguments": {
        "order_id": "123"
      },
      "status": "succeeded"
    }
  ]
}
```

### 第五步：AgentExpect 执行断言

```text
回答是否包含“超过退款期限”？
    → 是

是否调用 refund_lookup？
    → 是

order_id 是否等于 "123"？
    → 是

是否调用 issue_refund？
    → 否
```

最终报告：

```text
Refund assistant

  ✓ expired refund

1 case, 1 passed
```

## 工具调用的设计

### 第一版：由 Agent Driver 上报

第一版不实现复杂的工具拦截系统。Driver 从 Agent Framework 的最终状态、消息历史或回调中
提取工具调用，然后放入统一结果：

```json
{
  "answer": "订单已超过退款期限。",
  "tool_calls": [
    {
      "name": "refund_lookup",
      "arguments": {
        "order_id": "123"
      },
      "status": "succeeded"
    }
  ]
}
```

框架提供以下断言：

```ruby
expect_tool(:refund_lookup).to_be_called
expect_tool(:refund_lookup).not_to_be_called

expect_tool(:refund_lookup).to_be_called_with(
  order_id: "123"
)
```

这种方式简单，足以完成学习项目，但工具记录由 Agent 自己上报，因此不适合安全审计。

### 后续版本：Tool Gateway

如果以后需要独立验证工具是否真的执行，可以让 Agent 的工具调用经过 AgentExpect 提供的
Tool Gateway：

```text
Agent
  ↓ 调用工具
Tool Gateway
  ├── 验证参数
  ├── 记录调用
  ├── 返回 Stub 结果
  └── 模拟失败或延迟
```

测试可以声明模拟工具：

```ruby
tool :refund_lookup do
  returns(
    eligible: false,
    reason: "expired"
  )
end
```

Tool Gateway 可以区分不同阶段：

```text
tool.requested
tool.dispatched
tool.succeeded
tool.failed
```

并支持更精确的断言：

```ruby
expect_tool(:refund_lookup).to be_requested
expect_tool(:refund_lookup).to succeed
expect_tool(:issue_refund).not_to be_dispatched
```

Tool Gateway 是后续增强，不属于第一版 MVP。

### 可观察性的物理边界

如果一个黑盒 Agent：

- 不允许替换工具；
- 不提供工具执行回调；
- 不提供执行 Trace；
- 只返回最终文本；

那么 AgentExpect 只能测试最终回答，无法可靠判断工具是否真正执行。

> 没有可观察接口，就不可能从最终文本可靠推断工具是否执行。

## 核心 Matchers

### 回答断言

```ruby
expect_answer.to eq("...")
expect_answer.to include("30 天")
expect_answer.to match(/退款/)
expect_answer.to match_schema(schema)
```

### 工具调用断言

```ruby
expect_tool(:refund_lookup).to_be_called
expect_tool(:refund_lookup).not_to_be_called

expect_tool(:refund_lookup).to_be_called_with(
  order_id: "123"
)
```

### 资源断言

当结果提供对应数据时，可以支持：

```ruby
expect_latency.to be_under(2.seconds)
expect_tokens.to be_under(1_000)
expect_cost.to be_under(0.01)
```

### LLM Judge

为了体现 AI 测试与普通字符串测试的区别，后续可以加入一个可插拔的 LLM Judge：

```ruby
expect_answer.to satisfy_criterion(
  "明确说明退款期限，但不能承诺一定可以退款"
)
```

Judge 应返回结构化结果：

```json
{
  "passed": false,
  "score": 0.42,
  "reason": "回答承诺一定可以退款，与规则冲突"
}
```

Judge 由用户配置，不应绑定某个模型厂商。

## Runner 和报告

Runner 负责：

- 加载测试文件；
- 按顺序执行测试场景；
- 调用 Connector；
- 区分测试失败和 Agent 执行错误；
- 记录耗时和用量；
- 汇总 Matcher 结果；
- 将结果交给 Reporter；
- 返回适合 CI 使用的进程退出码。

终端报告示例：

```text
Refund assistant

  ✓ valid refund
  ✗ expired refund
    Expected answer not to claim:
      "一定可以退款"
    Actual:
      "可以，一定能为您退款"

2 cases, 1 passed, 1 failed
```

全部通过时返回退出码 `0`，失败或执行错误时返回非零退出码。

## MVP 范围

第一版实现：

- Ruby DSL：`describe_agent`、`case`、`ask` 和 `expect_*`；
- `RubyCallableConnector`；
- `CommandConnector`；
- `HttpConnector`；
- 版本化 JSON 请求和结果协议；
- 回答字符串断言；
- JSON Schema 断言；
- 工具名称和参数断言；
- 清晰的失败信息；
- 终端报告；
- JSON 报告；
- 正确的 CI 退出码；
- 一个 Python LangGraph Driver 示例。

第一版不实现：

- Tool Gateway；
- 多轮对话；
- 多 Agent 工作流测试；
- Web UI；
- 生产 Trace 平台；
- 分布式并行执行；
- 大量 Agent Framework 官方 Adapter；
- 自动 Prompt 优化；
- 真实危险工具的自动执行。

## 推荐的实现顺序

1. 定义 `AgentRequest`、`AgentResult` 和 `ToolCall`；
2. 实现 Ruby Callable 调用和最小 DSL；
3. 实现回答 Matcher 和终端报告；
4. 实现 Command Connector 和 JSON 协议；
5. 编写 LangGraph Driver 示例；
6. 实现工具名称和参数 Matcher；
7. 实现 HTTP Connector；
8. 增加 JSON Schema Matcher 和 JSON 报告；
9. 增加可插拔 LLM Judge；
10. 根据真实需求决定是否实现 Tool Gateway。

## 最终总结

AgentExpect 不需要理解 LangGraph、CrewAI 或其他框架的内部实现。它只需要完成下面这条
链路：

```text
测试 DSL
   ↓
调用 Agent
   ↓
Agent 返回统一 JSON
   ↓
检查回答和工具调用
   ↓
输出测试结果
```

语言无关的关键是统一协议，而不是为每一种语言和框架编写复杂集成。对于特殊框架，用户
只需要提供一层很薄的 Driver，把框架自己的输入和状态转换成 AgentExpect 的标准请求与
结果格式。
