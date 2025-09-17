'use client'
import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import s from './style.module.css'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import FileUploaderInAttachmentWrapper from '@/app/components/base/file-uploader-in-attachment'
import type { FileEntity, FileUpload } from '@/app/components/base/file-uploader-in-attachment/types'
import { getProcessedFiles } from '@/app/components/base/file-uploader-in-attachment/utils'
import KnowledgeList from '@/app/components/base/knowledge-list'
import KnowledgeSelector from '@/app/components/base/knowledge-selector'
import type { KnowledgeItem } from '@/types/app'

export type IChatProps = {
  chatList: ChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[], knowledgeList?: KnowledgeItem[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
  fileConfig?: FileUpload
  knowledgeConfig?: {
    enabled: boolean
    knowledgeList: KnowledgeItem[]
  }
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
  controlClearQuery,
  visionConfig,
  fileConfig,
  knowledgeConfig,
}) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const isUseInputMethod = useRef(false)

  const [query, setQuery] = React.useState('')
  const queryRef = useRef('')

  // Knowledge base selection state
  const [selectedKnowledge, setSelectedKnowledge] = React.useState<KnowledgeItem[]>([])
  const [showKnowledgeSelector, setShowKnowledgeSelector] = React.useState(false)
  const [selectorPosition, setSelectorPosition] = React.useState({ top: 0, left: 0 })

  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
    queryRef.current = value
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = () => {
    const query = queryRef.current
    if (!query || query.trim() === '') {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery) {
      setQuery('')
      queryRef.current = ''
      // Clear knowledge selection when clearing query
      setSelectedKnowledge([])
      setShowKnowledgeSelector(false)
    }
  }, [controlClearQuery])
  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const [attachmentFiles, setAttachmentFiles] = React.useState<FileEntity[]>([])

  // Knowledge base management functions
  const handleSelectKnowledge = (knowledge: KnowledgeItem) => {
    if (!selectedKnowledge.find(k => k.id === knowledge.id)) {
      setSelectedKnowledge(prev => [...prev, knowledge])
    }
    setShowKnowledgeSelector(false)
  }

  const handleRemoveKnowledge = (knowledgeId: string) => {
    setSelectedKnowledge(prev => prev.filter(k => k.id !== knowledgeId))
  }

  // Handle knowledge selector button click
  const handleKnowledgeButtonClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Find the input container by traversing up and looking for the container with specific classes
    let container = e.currentTarget.parentElement
    while (container) {
      if (container.classList.contains('bg-white') && container.classList.contains('rounded-xl')) {
        break
      }
      container = container.parentElement
    }
    const inputRect = container?.getBoundingClientRect()

    setSelectorPosition({
      top: (inputRect?.top || rect.top) - 320, // Show selector above input container
      left: rect.left,
    })
    setShowKnowledgeSelector(!showKnowledgeSelector)
  }

  const handleSend = () => {
    if (!valid() || (checkCanSend && !checkCanSend()))
      return
    const imageFiles: VisionFile[] = files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    }))
    const docAndOtherFiles: VisionFile[] = getProcessedFiles(attachmentFiles)
    const combinedFiles: VisionFile[] = [...imageFiles, ...docAndOtherFiles]

    // Send message with knowledge list
    onSend(queryRef.current, combinedFiles, selectedKnowledge)

    if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
      if (files.length)
        onClear()
      if (!isResponding) {
        setQuery('')
        queryRef.current = ''
      }
    }
    if (!attachmentFiles.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)) {
      setAttachmentFiles([])
    }

    // Clear knowledge selection after sending
    setSelectedKnowledge([])
    setShowKnowledgeSelector(false)
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current)
        handleSend()
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing

    // Close knowledge selector on Escape
    if (e.key === 'Escape' && showKnowledgeSelector) {
      setShowKnowledgeSelector(false)
      e.preventDefault()
      return
    }

    // Delete last selected knowledge base on Backspace when input is empty
    if (e.key === 'Backspace' && query === '' && selectedKnowledge.length > 0) {
      setSelectedKnowledge(prev => prev.slice(0, -1))
      e.preventDefault()
      return
    }

    if (e.code === 'Enter' && !e.shiftKey) {
      const result = query.replace(/\n$/, '')
      setQuery(result)
      queryRef.current = result
      e.preventDefault()
    }
  }

  const suggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    queryRef.current = suggestion
    handleSend()
  }

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'h-full')}>
      {/* Chat List */}
      <div className="h-full space-y-[30px]">
        {chatList.map((item) => {
          if (item.isAnswer) {
            const isLast = item.id === chatList[chatList.length - 1].id
            return <Answer
              key={item.id}
              item={item}
              feedbackDisabled={feedbackDisabled}
              onFeedback={onFeedback}
              isResponding={isResponding && isLast}
              suggestionClick={suggestionClick}
            />
          }
          return (
            <Question
              key={item.id}
              id={item.id}
              content={item.content}
              useCurrentUserAvatar={useCurrentUserAvatar}
              imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
            />
          )
        })}
      </div>
      {
        !isHideSendInput && (
          <div className={cn(!feedbackDisabled && '!left-3.5 !right-3.5', 'absolute z-10 bottom-0 left-0 right-0')}>
            <div className='p-[5.5px] max-h-[150px] bg-white border-[1.5px] border-gray-200 rounded-xl overflow-y-auto'>
              {/* Knowledge base selection list */}
              {knowledgeConfig?.enabled && selectedKnowledge.length > 0 && (
                <div className={`${visionConfig?.enabled ? 'pl-[52px]' : ''} mb-1`}>
                  <KnowledgeList
                    list={selectedKnowledge}
                    onRemove={handleRemoveKnowledge}
                    maxDisplay={3}
                  />
                </div>
              )}

              {visionConfig?.enabled && (
                <>
                  <div className='absolute bottom-2 left-2 flex items-center'>
                    <ChatImageUploader
                      settings={visionConfig}
                      onUpload={onUpload}
                      disabled={files.length >= visionConfig.number_limits}
                    />
                    <div className='mx-1 w-[1px] h-4 bg-black/5' />
                    {knowledgeConfig?.enabled && (
                      <Tooltip
                        selector='knowledge-selector-tip'
                        htmlContent={
                          <div>{t('app.knowledgeSelector.buttonTooltip')}</div>
                        }
                      >
                        <button
                          onClick={handleKnowledgeButtonClick}
                          className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors duration-150'
                          type='button'
                        >
                          <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
                          </svg>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  <div className='pl-[52px]'>
                    <ImageList
                      list={files}
                      onRemove={onRemove}
                      onReUpload={onReUpload}
                      onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                      onImageLinkLoadError={onImageLinkLoadError}
                    />
                  </div>
                </>
              )}
              {
                fileConfig?.enabled && (
                  <div className={`${visionConfig?.enabled ? 'pl-[52px]' : ''} mb-1`}>
                    <FileUploaderInAttachmentWrapper
                      fileConfig={fileConfig}
                      value={attachmentFiles}
                      onChange={setAttachmentFiles}
                    />
                  </div>
                )
              }
              {!visionConfig?.enabled && knowledgeConfig?.enabled && (
                <div className='absolute bottom-2 left-2 flex items-center'>
                  <Tooltip
                    selector='knowledge-selector-tip'
                    htmlContent={
                      <div>{t('app.knowledgeSelector.buttonTooltip')}</div>
                    }
                  >
                    <button
                      onClick={handleKnowledgeButtonClick}
                      className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors duration-150'
                      type='button'
                    >
                      <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              )}
              <Textarea
                className={`
                  block w-full px-2 pr-[118px] py-[7px] leading-5 max-h-none text-sm text-gray-700 outline-none appearance-none resize-none
                  ${(visionConfig?.enabled || knowledgeConfig?.enabled) && 'pl-12'}
                `}
                value={query}
                onChange={handleContentChange}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyDown}
                autoSize
                placeholder={knowledgeConfig?.enabled ? t('app.knowledgeSelector.inputPlaceholder') : ''}
              />
              <div className="absolute bottom-2 right-2 flex items-center h-8">
                <div className={`${s.count} mr-4 h-5 leading-5 text-sm bg-gray-50 text-gray-500`}>{query.trim().length}</div>
                <Tooltip
                  selector='send-tip'
                  htmlContent={
                    <div>
                      <div>{t('common.operation.send')} Enter</div>
                      <div>{t('common.operation.lineBreak')} Shift Enter</div>
                    </div>
                  }
                >
                  <div className={`${s.sendBtn} w-8 h-8 cursor-pointer rounded-md`} onClick={handleSend}></div>
                </Tooltip>
              </div>
            </div>

            {/* Knowledge selector */}
            {knowledgeConfig?.enabled && showKnowledgeSelector && (
              <KnowledgeSelector
                knowledgeList={knowledgeConfig.knowledgeList}
                selectedKnowledge={selectedKnowledge}
                onSelect={handleSelectKnowledge}
                position={selectorPosition}
                onClose={() => setShowKnowledgeSelector(false)}
              />
            )}
          </div>
        )
      }
    </div>
  )
}

export default React.memo(Chat)
