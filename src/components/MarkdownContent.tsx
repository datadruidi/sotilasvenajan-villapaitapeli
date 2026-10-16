import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface MarkdownContentProps {
  children: string
  breaks?: boolean
}

export default function MarkdownContent({ children, breaks = false }: MarkdownContentProps) {
  return <ReactMarkdown remarkPlugins={breaks ? [remarkBreaks] : []}>{children}</ReactMarkdown>
}
