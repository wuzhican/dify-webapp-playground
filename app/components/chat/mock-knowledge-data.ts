// Knowledge base mock data for testing
import type { KnowledgeItem } from '@/types/app'

export const mockKnowledgeList: KnowledgeItem[] = [
  {
    id: 'kb_001',
    name: '产品手册',
    description: '产品功能和使用指南',
    color: '#3b82f6',
    icon: '📚',
    type: 'manual',
    status: 'active'
  },
  {
    id: 'kb_002',
    name: '技术文档',
    description: 'API接口和技术规范',
    color: '#10b981',
    icon: '📖',
    type: 'document',
    status: 'active'
  }
]

export const knowledgeConfig = {
  enabled: false,
  knowledgeList: mockKnowledgeList
}

