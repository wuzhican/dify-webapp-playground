'use client'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import XClose from '@/app/components/base/icons/line/x-close'
import type { KnowledgeItem } from '@/types/app'

type KnowledgeListProps = {
  list: KnowledgeItem[]
  readonly?: boolean
  onRemove?: (knowledgeId: string) => void
  maxDisplay?: number // Maximum display count
}

const KnowledgeList: FC<KnowledgeListProps> = ({
  list,
  readonly = false,
  onRemove,
  maxDisplay = 5,
}) => {
  const { t } = useTranslation()

  if (list.length === 0) {
    return null
  }

  const displayList = list.slice(0, maxDisplay)
  const remainingCount = list.length - maxDisplay

  return (
    <div className='flex flex-wrap items-center gap-1 mb-2'>
      {displayList.map(item => (
        <div
          key={item.id}
          className='group relative inline-flex items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 transition-colors duration-200'
        >
          {/* Knowledge base color indicator */}
          {item.color && (
            <div
              className='w-2 h-2 rounded-full mr-1.5 flex-shrink-0'
              style={{ backgroundColor: item.color }}
            />
          )}
          
          {/* Knowledge base icon */}
          {item.icon && (
            <span className='mr-1 text-sm'>{item.icon}</span>
          )}
          
          {/* Knowledge base name */}
          <span className='truncate max-w-[120px]' title={item.name}>
            {item.name}
          </span>
          
          {/* Remove button */}
          {!readonly && onRemove && (
            <button
              type='button'
              className='ml-1.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity duration-200'
              onClick={() => onRemove(item.id)}
              title={t('common.operation.remove')}
            >
              <XClose className='w-3 h-3 text-gray-500' />
            </button>
          )}
        </div>
      ))}
      
      {/* Show remaining count if there are more items */}
      {remainingCount > 0 && (
        <div className='inline-flex items-center bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-500'>
          + {remainingCount} {t('app.knowledgeSelector.more')}
        </div>
      )}
    </div>
  )
}

export default KnowledgeList