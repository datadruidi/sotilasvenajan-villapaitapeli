import { lazy, Suspense } from 'react'

const MarkdownContent = lazy(() => import('./MarkdownContent'))

interface MarkdownProps {
  children: string
  breaks?: boolean
  loadingLabel: string
}

export function Markdown({ loadingLabel, ...props }: MarkdownProps) {
  return (
    <Suspense fallback={<p role="status">{loadingLabel}</p>}>
      <MarkdownContent {...props} />
    </Suspense>
  )
}
