import dayjs from 'dayjs'
import { FC, forwardRef } from 'react'
import { QueueAnim } from '../components/Anime'

interface NoteLayoutProps {
  title: string
  tips?: string
  date: Date
}

const NoteLayout: FC<NoteLayoutProps> = forwardRef(
  ({ children, date, title, tips }, ref: any) => {
    const dateFormat = dayjs(date).format('YYYY-MM-DD')
    return (
      <main className="is-article is-note post-content paul-note" ref={ref}>
        <QueueAnim type="bottom" delay={500}>
          <article key={'a'}>
            <h1>{dateFormat}</h1>
            <h2 style={{ textAlign: 'center' }}>{title}</h2>

            {children}
          </article>
        </QueueAnim>
      </main>
    )
  },
)

export { NoteLayout }
