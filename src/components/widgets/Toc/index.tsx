import classNames from 'clsx'
import throttle from 'lodash-es/throttle'
import type { FC } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TransitionGroup } from 'react-transition-group'

import { RightLeftTransitionView } from '~/components/universal/Transition/right-left'
import { CustomEventTypes } from '~/types/events'
import { eventBus } from '~/utils/event-emitter'

import styles from './index.module.css'
import { TocItem } from './item'

export type TocProps = {
  headings: HTMLElement[]

  useAsWeight?: boolean
}

type Headings = {
  depth: number
  index: number
  title: string
}[]
export const Toc: FC<TocProps> = memo(
  ({ headings: $headings, useAsWeight }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const headings: Headings = useMemo(() => {
      return Array.from($headings).map((el) => {
        const depth = +el.tagName.slice(1)
        const title = el.id || el.textContent || ''

        const index = Number(el.dataset['index'])

        return {
          depth,
          index: isNaN(index) ? -1 : index,
          title,
        }
      })
    }, [$headings])
    const [index, setIndex] = useState(-1)
    useEffect(() => {
      const handler = (index: number) => {
        setIndex(index)
      }
      eventBus.on(CustomEventTypes.TOC, handler)
      return () => {
        eventBus.off(CustomEventTypes.TOC, handler)
      }
    }, [])

    const setMaxWidth = throttle(() => {
      if (containerRef.current) {
        containerRef.current.style.maxWidth = `${
          document.documentElement.getBoundingClientRect().width -
          containerRef.current.getBoundingClientRect().x -
          30
        }px`
      }
    }, 14)

    useEffect(() => {
      window.addEventListener('resize', setMaxWidth)

      return () => {
        window.removeEventListener('resize', setMaxWidth)
      }
    }, [setMaxWidth])

    const handleItemClick = useCallback((i) => {
      setTimeout(() => {
        setIndex(i)
      }, 350)
    }, [])

    const rootDepth = useMemo(
      () =>
        headings?.length
          ? (headings.reduce(
              (d: number, cur) => Math.min(d, cur.depth),
              headings[0]?.depth || 0,
            ) as any as number)
          : 0,
      [headings],
    )

    return (
      <section
        className={classNames(
          'kami-toc z-3',
          styles['toc'],
          useAsWeight && styles['weight'],
        )}
      >
        <div
          className={classNames('container', styles['container'])}
          ref={containerRef}
        >
          <TransitionGroup className={styles['anime-wrapper']}>
            {headings &&
              headings.map((heading) => {
                return (
                  <MemoedItem
                    heading={heading}
                    isActive={heading.index === index}
                    onClick={handleItemClick}
                    key={heading.title}
                    rootDepth={rootDepth}
                  />
                )
              })}
          </TransitionGroup>
        </div>
      </section>
    )
  },
)
const MemoedItem = memo<{
  isActive: boolean
  heading: Headings[0]
  rootDepth: number
  onClick: (i: number) => void
}>(
  (props) => {
    const { heading, isActive, onClick, rootDepth } = props

    return (
      <RightLeftTransitionView
        timeout={
          useRef({
            exit: 50,
            enter: 50 * heading.index,
          }).current
        }
        key={heading.title}
      >
        <TocItem
          index={heading.index}
          onClick={onClick}
          active={isActive}
          depth={heading.depth}
          title={heading.title}
          key={heading.title}
          rootDepth={rootDepth}
        />
      </RightLeftTransitionView>
    )
  },
  (a, b) => {
    // FUCK react transition group alway inject onExited props into Child element, but this props alway change, so ignore it.

    return (
      a.heading === b.heading &&
      a.isActive === b.isActive &&
      a.onClick === b.onClick &&
      a.rootDepth === b.rootDepth
    )
  },
)

MemoedItem.displayName = 'MemoedItem'
