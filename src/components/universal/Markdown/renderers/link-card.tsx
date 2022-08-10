import clsx from 'clsx'
import type { FC } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { apiClient } from '~/utils/client'
import { getRandomImage } from '~/utils/images'

import styles from './link-card.module.css'

export enum LinkCardSource {
  Self,
  GHRepo,
}
export interface LinkCardProps {
  id: string
  source: LinkCardSource
}
export const LinkCard: FC<LinkCardProps> = (props) => {
  const { id, source } = props
  const [loading, setLoading] = useState(true)
  const fetchFnRef = useRef<() => Promise<any>>()
  const [fullUrl, setFullUrl] = useState('')
  const [cardInfo, setCardInfo] = useState<{
    title: string
    desc?: string
    image: string
  }>()

  const isValidType = useMemo(() => {
    switch (source) {
      case LinkCardSource.Self: {
        const [variant, params, ...rest] = id.split('/')

        if (!params) {
          return false
        }

        switch (variant) {
          case 'notes': {
            // e.g. variant === 'notes' ,  params === 124
            const valid = !isNaN(+params)
            if (!valid) {
              return false
            }
            fetchFnRef.current = async () => {
              return apiClient.note.getNoteById(+params).then((res) => {
                const { title, images, text } = res.data
                setCardInfo({
                  title,
                  desc: `${text.slice(0, 50)}...`,
                  // TODO
                  image: images?.[0].src || getRandomImage(1)[0],
                })
              })
            }
            setFullUrl(`/notes/${params}`)

            return true
          }
          case 'posts': {
            // e.g. posts/programming/shell-output-via-sse
            const [slug] = rest
            if (!slug || !params) {
              return false
            }

            fetchFnRef.current = async () => {
              return apiClient.post.getPost(params, slug).then((res) => {
                const { title, images, text, summary } = res
                setCardInfo({
                  title,
                  desc: summary ?? `${text.slice(0, 50)}...`,
                  // TODO
                  image: images?.[0].src || getRandomImage(1)[0],
                })
              })
            }
            setFullUrl(`/posts/${params}/${slug}`)

            return true
          }
          default: {
            return false
          }
        }
      }
      case LinkCardSource.GHRepo: {
        // e.g. mx-space/kami
        const [namespace, repo, ...rest] = id.split('/')
        if (!namespace || !repo) {
          return false
        }

        // TODO
        return !rest.length
      }
    }
  }, [source, id])
  const fetchInfo = useCallback(async () => {
    if (!fetchFnRef.current) {
      return
    }
    setLoading(true)
    await fetchFnRef.current()
    setLoading(false)
  }, [])

  const { ref } = useInView({
    triggerOnce: true,
    onChange(inView) {
      if (!inView) {
        return
      }

      fetchInfo()
    },
  })

  if (!isValidType) {
    return null
  }

  return (
    <a
      href={fullUrl}
      target={'_blank'}
      ref={ref}
      className={clsx(
        cardInfo && styles['card-grid'],
        loading && styles['skeleton'],
      )}
    >
      <div className={styles['contents']}>
        <div className={styles['title']}>{cardInfo?.title}</div>
        <div className={styles['desc']}>{cardInfo?.desc}</div>
      </div>
      <div className={styles['image']}>
        {cardInfo?.image && (
          <img
            src={cardInfo.image}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = ''
            }}
          />
        )}
      </div>
    </a>
  )
}
