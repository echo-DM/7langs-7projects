# Project candidates

## 1. TypeScript

浏览器端 Token 分析器

输入一段文本，在本地完成 Token 编码，并把模型看到的内容逐层展示出来：

文本
  ↓
Unicode 字符与 UTF-8 字节
  ↓
Token
  ↓
Token ID
  ↓
上下文窗口占用

支持：

Token 数量、ID 和原始字节展示
Token 与原文字形的高亮对应
字符数、字节数和 Token 数对比
中文、Emoji、代码和不可见字符分析
自定义上下文预算与超限提示
完整 Token ID 序列复制
大文本输入限制与性能基准
全部在浏览器本地运行，不上传用户文本

使用 React 构建交互界面，通过 Web Worker 在后台执行 WASM Tokenizer，避免大段文本分析
阻塞主线程。主线程与 Worker 之间使用可辨识联合类型定义消息协议，并通过 `requestId`
丢弃过期结果，防止快速输入时旧任务覆盖新任务。

分析结果使用 Typed Array 和 transferable buffer 传递，减少跨线程复制。展示层需要正确
处理 Unicode grapheme、UTF-8 字节边界，以及单个 Token 无法独立解码的情况。

这个项目本质上是：

把语言模型不可见的 Token 化过程，变成可观察、可解释、可度量的浏览器工具。

重点训练：

TypeScript 严格类型
可辨识联合类型
结构类型与依赖注入
React 异步状态管理
Web Worker 消息协议
WASM 集成
Typed Array 与 transferable buffer
Unicode 和 UTF-8
防抖、任务取消与竞态处理
浏览器性能分析

难度：3/5
开源潜力：高

## 2. Ruby
LLM 测试 DSL

做一个类似 RSpec 的 AI 测试框架：

describe_agent "refund assistant" do
  case "expired refund" do
    ask "购买超过 30 天还能退款吗？"

    expect_answer.to mention("30 天")
    expect_answer.not_to claim("一定可以退款")
    expect_citation "refund-policy"
    expect_tool(:refund_lookup).not_to_be_called
  end
end

支持：

精确字符串断言
JSON Schema 断言
语义相似度
LLM Judge
工具调用断言
引用验证
延迟和成本限制
Prompt 版本回归比较
CI 输出

这个项目本质上是：

给不确定性的 AI 系统设计确定性测试接口。

重点训练：

DSL 设计
Matcher 模式
自定义错误信息
插件体系
测试执行生命周期
Ruby 对象模型

难度： 3.5/5
开源潜力： 很高

## 3. Python
RAG 失败诊断器

输入一次完整的 RAG 执行记录，判断错误出在哪一层：

用户问题
  ↓
Query Rewrite
  ↓
Embedding
  ↓
向量检索
  ↓
Reranker
  ↓
上下文构造
  ↓
模型生成

自动识别：

文档解析失败
查询改写错误
Chunk 划分不合理
正确文档未召回
正确文档排序过低
上下文被截断
表格信息丢失
模型忽略证据
引用与结论不一致
模型产生无依据结论

输出类似：

主要失败阶段：Retrieval

正确文档位于第 17 位，没有进入 top-5。

可能原因：
- 查询中的缩写未展开
- 仅使用稠密向量搜索
- 文档标题权重不足

建议：
- 加入 BM25 混合搜索
- 使用 query expansion
- 对标题字段增加权重

重点训练：

文档解析
Embedding
向量数据库
Reranker
数据分析
AI 评测
可观测性

## 4. Haskell

类型安全的 Agent 工作流验证器

用户声明 Agent 工作流：

workflow =
  Search
    :>> ReadDocuments
    :>> Summarize
    :>> RequireApproval
    :>> Publish

系统在运行前检查：

是否引用了不存在的步骤
是否可能进入无限循环
是否存在未处理的错误路径
写操作前是否一定经过审批
私密数据是否可能流向网络工具
所有状态是否都有合法迁移
某些工具是否可能以错误顺序调用

可以把工作流建模为：

data Action
  = ReadFile
  | SearchWeb
  | SendEmail
  | RequireApproval
  | GenerateAnswer

重点训练：

代数数据类型
GADT
Phantom Types
类型级编程
状态机
纯函数
效果建模

## 5. Rust
本地模型自动路由器

统一连接：

llama.cpp
Ollama
MLX
vLLM
远程 API

根据任务和硬件决定模型：

简单分类 → 3B 本地模型
代码修改 → Coder 模型
长文档 → 长上下文模型
敏感内容 → 本地模型
高难推理 → 远程大模型

路由指标：

首 Token 延迟
Tokens/s
内存占用
模型加载时间
上下文长度
任务准确率
隐私等级
请求成本

还可支持：

自动模型休眠
请求排队
失败切换
负载均衡
OpenAI-compatible API

重点训练：

Tokio
并发调度
缓存
资源控制
网络服务
性能 Benchmark

## 6. Go
持久化 Agent Worker 系统

实现一个简化版的 Agent 任务运行平台：

API
 ↓
Scheduler
 ↓
Task Queue
 ↓
Agent Workers
 ↓
Checkpoint Store

支持：

长时间任务
定时任务
人工审批
中断恢复
Worker 崩溃恢复
任务取消
并行子任务
超时与重试
多租户资源限制

重点不是编写 Agent 推理逻辑，而是保证：

一个执行 30 分钟、调用 20 个工具的任务，不会因为进程重启而全部丢失。

重点训练：

Goroutine
Channel
Context 取消
数据库事务
Lease
幂等执行
分布式状态机


## 7. 极简 Transformer 推理引擎

极简 Transformer 推理引擎

不要试图支持所有模型，只支持一个小型架构，例如：

小型 GPT
TinyLlama 的有限子集
自己训练的小模型
字符级 Transformer

实现：

读取模型权重
  ↓
Tokenizer
  ↓
Embedding
  ↓
Attention
  ↓
Feed Forward
  ↓
Sampling
  ↓
文本输出

逐步加入：

KV Cache
多线程矩阵运算
FP16
简单量化
Memory Mapping
C BLAS 接口
性能分析

这个项目的目标不是超过 llama.cpp，而是理解：

一个语言模型究竟怎样从权重文件生成下一个 Token。

重点训练：

Allocator
SIMD
内存布局
Cache locality
C ABI
comptime
数值计算
