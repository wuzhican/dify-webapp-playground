'use client'
import type { FC } from 'react'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type { KnowledgeItem } from '@/types/app'

type KnowledgeSelectorProps = {
  knowledgeList: KnowledgeItem[]
  selectedKnowledge: KnowledgeItem[]
  onSelect: (knowledge: KnowledgeItem) => void
  position: { top: number; left: number }
  onClose: () => void
  className?: string
}

const KnowledgeSelector: FC<KnowledgeSelectorProps> = ({
  knowledgeList,
  selectedKnowledge,
  onSelect,
  position,
  onClose,
  className,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const selectorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter knowledge list based on search query and exclude already selected
  const filteredKnowledgeList = knowledgeList.filter(item => {
    const isNotSelected = !selectedKnowledge.some(selected => selected.id === item.id)
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return isNotSelected && matchesSearch && item.status === 'active'
  })

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredKnowledgeList.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredKnowledgeList[highlightedIndex]) {
          handleSelect(filteredKnowledgeList[highlightedIndex])
        }
        break
    }
  }

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredKnowledgeList])

  const handleSelect = (knowledge: KnowledgeItem) => {
    onSelect(knowledge)
    onClose()
  }

  return (
    <div
      ref={selectorRef}
      className={classNames(
        'fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg',
        className
      )}
      style={{
        top: Math.max(10, position.top), // Ensure it doesn't go off-screen
        left: position.left,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search input */}
      <div className='p-3 border-b border-gray-100'>
        <input
          ref={inputRef}
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('app.knowledgeSelector.searchPlaceholder')}
          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      {/* Knowledge list */}
      <div className='max-h-60 overflow-y-auto'>
        {filteredKnowledgeList.length > 0 ? (
          <div className='p-1'>
            {filteredKnowledgeList.map((item, index) => (
              <div
                key={item.id}
                className={classNames(
                  'flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors duration-150',
                  {
                    'bg-blue-50 text-blue-700': index === highlightedIndex,
                    'hover:bg-gray-50': index !== highlightedIndex,
                  }
                )}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {/* Knowledge base color indicator */}
                {item.color && (
                  <div
                    className='w-3 h-3 rounded-full mr-3 flex-shrink-0'
                    style={{ backgroundColor: item.color }}
                  />
                )}

                {/* Knowledge base icon */}
                {item.icon && (
                  <span className='mr-2 text-lg'>{item.icon}</span>
                )}

                <div className='flex-1 min-w-0'>
                  {/* Knowledge base name */}
                  <div className='text-sm font-medium text-gray-900 truncate'>
                    {item.name}
                  </div>
                  {/* Knowledge base description */}
                  {item.description && (
                    <div className='text-xs text-gray-500 truncate mt-0.5'>
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Knowledge base type badge */}
                {item.type && (
                  <div className='ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex-shrink-0'>
                    {t(`app.knowledgeSelector.type.${item.type}`)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='p-4 text-center text-sm text-gray-500'>
            {searchQuery ?
              t('app.knowledgeSelector.noResults') :
              t('app.knowledgeSelector.noAvailable')
            }
          </div>
        )}
      </div>

      {/* Tip */}
      <div className='px-3 py-2 text-xs text-gray-400 border-t border-gray-100'>
        {t('app.knowledgeSelector.navigationTip')}
      </div>
    </div>
  )
}

export default KnowledgeSelector
