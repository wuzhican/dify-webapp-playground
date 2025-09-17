# 对话知识库选择组件使用指南

## 概述

本文档介绍了新增的对话知识库选择功能，该功能允许用户在聊天输入框中通过 `@` 符号触发下拉选择器来选择知识库，并在发送消息时将选择的知识库信息传递给后端。

## 功能特性

### 核心功能
- ✅ **@符号触发**: 在输入框中输入 `@` 符号自动显示知识库选择器
- ✅ **搜索过滤**: 支持按名称和描述搜索知识库
- ✅ **已选择展示**: 类似图片列表的展示方式，在输入框上方显示已选择的知识库
- ✅ **防重复选择**: 自动过滤已选择的知识库
- ✅ **键盘导航**: 支持 ↑↓ 键导航，Enter 选择，Esc 关闭
- ✅ **多语言支持**: 支持中文、英文、西班牙语、日语、越南语
- ✅ **响应式设计**: 适配桌面端和移动端

### 交互特性
- **Backspace删除**: 输入框为空时按 Backspace 可删除最后选择的知识库
- **自动关闭**: 选择知识库后自动关闭选择器
- **点击外部关闭**: 点击选择器外部区域自动关闭
- **发送后清理**: 发送消息后自动清空已选择的知识库

## 组件架构

### 新增组件

#### 1. KnowledgeList 组件
位置: `app/components/base/knowledge-list/index.tsx`

展示已选择知识库的水平列表组件，支持：
- 显示知识库名称、颜色标识和图标
- 删除操作（非 readonly 模式）
- 最大显示数量限制
- 超出时显示"更多"提示

#### 2. KnowledgeSelector 组件
位置: `app/components/base/knowledge-selector/index.tsx`

知识库下拉选择器组件，支持：
- 搜索过滤功能
- 键盘导航
- 防重复选择
- 知识库类型标识

#### 3. 类型定义
位置: `types/app.ts`

```typescript
export type KnowledgeItem = {
  id: string
  name: string
  description?: string
  color?: string // 知识库标识颜色
  icon?: string // 图标类型
  type?: 'document' | 'qa' | 'manual' // 知识库类型
  status?: 'active' | 'inactive' // 状态
}
```

## 使用方法

### 1. 基本使用

```typescript
import Chat from '@/app/components/chat'
import type { KnowledgeItem, VisionFile } from '@/types/app'

// 定义知识库列表
const knowledgeList: KnowledgeItem[] = [
  {
    id: 'kb_001',
    name: '产品手册',
    description: '产品功能和使用指南',
    color: '#3b82f6',
    icon: '📚',
    type: 'manual',
    status: 'active'
  },
  // ... 更多知识库
]

// 处理消息发送
const handleSendMessage = (
  message: string, 
  files: VisionFile[], 
  knowledgeList?: KnowledgeItem[]
) => {
  // 构建请求参数
  const inputs = {
    // 其他现有 inputs...
    selected_knowledge_ids: knowledgeList?.map(k => k.id) || []
  }
  
  // 调用 API
  chatAPI.sendMessage({
    query: message,
    files,
    inputs
  })
}

// 使用 Chat 组件
<Chat
  chatList={chatList}
  onSend={handleSendMessage}
  knowledgeConfig={{
    enabled: true,
    knowledgeList: knowledgeList
  }}
  // ... 其他配置
/>
```

### 2. 配置选项

#### knowledgeConfig 配置
```typescript
knowledgeConfig?: {
  enabled: boolean              // 是否启用知识库选择功能
  knowledgeList: KnowledgeItem[] // 可选择的知识库列表
}
```

### 3. 回调函数签名更新

`onSend` 回调函数增加了第三个参数：

```typescript
onSend?: (
  message: string,           // 消息内容
  files: VisionFile[],       // 文件列表
  knowledgeList?: KnowledgeItem[] // 选择的知识库列表（新增）
) => void
```

## 国际化配置

### 语言键值对照表

| 键名 | 中文 | 英文 | 说明 |
|------|------|------|------|
| `app.knowledgeSelector.placeholder` | 选择知识库... | Select knowledge base... | 选择器占位符 |
| `app.knowledgeSelector.searchPlaceholder` | 搜索知识库 | Search knowledge bases | 搜索框占位符 |
| `app.knowledgeSelector.noResults` | 未找到匹配的知识库 | No matching knowledge bases found | 搜索无结果 |
| `app.knowledgeSelector.noAvailable` | 暂无可用知识库 | No available knowledge bases | 无可用知识库 |
| `app.knowledgeSelector.inputPlaceholder` | 在这里输入消息... (输入 @ 选择知识库) | Type your message here... (Type @ to select knowledge base) | 输入框提示 |
| `app.knowledgeSelector.navigationTip` | 使用 ↑↓ 导航，Enter 选择，Esc 关闭 | Use ↑↓ to navigate, Enter to select, Esc to close | 导航提示 |

### 添加新语言支持

1. 在 `i18n/lang/app.[lang].ts` 中添加 `knowledgeSelector` 配置
2. 参考现有语言文件的结构添加对应翻译

## API 集成

### 请求格式
知识库选择信息通过现有的 `inputs` 字段传递：

```typescript
{
  "query": "用户消息",
  "files": [...],
  "inputs": {
    // 现有的 inputs 内容...
    "selected_knowledge_ids": ["kb_001", "kb_002"] // 选中的知识库ID数组
  }
}
```

### 后端处理建议
后端可以根据 `selected_knowledge_ids` 数组来确定使用哪些知识库进行检索和回答。

## 样式自定义

### 主要 CSS 类名
- `.knowledge-item`: 知识库项容器
- `.knowledge-item-color`: 颜色标识圆点
- `.knowledge-item-remove`: 删除按钮

### 自定义样式示例
```css
/* 自定义知识库项样式 */
.knowledge-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 自定义选择器样式 */
.knowledge-selector {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
}
```

## 最佳实践

### 1. 知识库数据结构
- **id**: 使用有意义的唯一标识符，建议格式: `kb_xxx`
- **name**: 保持简洁，建议不超过 20 个字符
- **description**: 提供有助于用户选择的描述信息
- **color**: 使用十六进制颜色值，建议使用品牌色系
- **type**: 明确知识库类型，便于用户理解

### 2. 性能优化
- 知识库列表建议不超过 50 个，超过时考虑分页或分类
- 搜索功能使用防抖处理，避免频繁过滤
- 大量知识库时考虑虚拟滚动

### 3. 用户体验
- 提供清晰的操作提示
- 合理的最大选择数量限制
- 适当的动画过渡效果

## 故障排查

### 常见问题

1. **选择器不显示**
   - 检查 `knowledgeConfig.enabled` 是否为 `true`
   - 确认 `knowledgeList` 数组不为空
   - 验证输入的是 `@` 符号

2. **国际化文本不显示**
   - 检查语言包是否包含 `knowledgeSelector` 配置
   - 确认 i18n 初始化正确

3. **样式显示异常**
   - 检查 Tailwind CSS 配置
   - 确认没有样式冲突

4. **键盘导航不工作**
   - 确认选择器获得了焦点
   - 检查是否有其他组件拦截键盘事件

## 更新日志

### v1.0.0 (2025-01-15)
- ✅ 新增知识库选择功能
- ✅ 支持 @符号触发选择器
- ✅ 集成到 Chat 组件
- ✅ 多语言支持 (中/英/西/日/越)
- ✅ 完整的键盘导航支持
- ✅ 响应式设计适配

## 技术支持

如有问题或建议，请参考：
- 设计文档: 查看完整的设计规范
- 代码示例: `app/components/chat/mock-knowledge-data.ts`
- 类型定义: `types/app.ts`