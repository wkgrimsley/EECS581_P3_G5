import type { ReactNode } from 'react'
import './Pager.css'

// Props = the inputs a component accepts. TypeScript checks them for you.
type PagerProps = {
  pages: ReactNode[]
}

// Lays pages out side by side. The CSS in Pager.css makes it swipeable
// on mobile and snap to one page at a time.
export default function Pager({ pages }: PagerProps) {
  return (
    <div className="pager">
      {pages.map((page, i) => (
        <section className="pager-page" key={i}>
          {page}
        </section>
      ))}
    </div>
  )
}
