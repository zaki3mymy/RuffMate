import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface ExamplePopoverProps {
  example: string
  ruleCode: string
}

export default function ExamplePopover({
  example,
  ruleCode,
}: ExamplePopoverProps) {
  const [showPopover, setShowPopover] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Pythonのみ登録してバンドルサイズを削減
  useEffect(() => {
    SyntaxHighlighter.registerLanguage('python', python)
  }, [])

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // クリック外側で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopover])

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPopover) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showPopover])

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowPopover(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowPopover(false)
    }
  }

  const handleClick = () => {
    if (isMobile) {
      setShowPopover(!showPopover)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label={`${ruleCode}の使用例を表示`}
        aria-expanded={showPopover}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-2 w-screen max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-4 shadow-xl md:w-auto md:max-w-3xl"
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-96 overflow-auto">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">使用例</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const inline = (props as { inline?: boolean }).inline
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={
                          oneDark as { [key: string]: React.CSSProperties }
                        }
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {example}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
