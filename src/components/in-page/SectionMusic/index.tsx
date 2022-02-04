import { PlayListType } from '@mx-space/extra'
import clsx from 'clsx'
import { runInAction } from 'mobx'
import { FC, memo } from 'react'
import { useStore } from 'store'
import styles from './index.module.css'

interface SectionMusicProps {
  data: PlayListType[]
  src: string
  name: string
}

export const SectionMusic: FC<SectionMusicProps> = memo((props) => {
  const { musicStore } = useStore()
  const loadList = (id: number[]) => {
    runInAction(() => {
      musicStore.setPlaylist(id)
      musicStore.isHide = false
      setTimeout(() => {
        musicStore.isPlay = true
      }, 1000)
    })
  }
  return (
    <section className={styles['kami-music']}>
      <div className={styles['music-cover']}>
        <div className={clsx(styles['fixed-cover'], styles['sticky-cover'])}>
          <img src={props.src}></img>
          <h3>{props.name}</h3>
        </div>
      </div>

      <div className={styles['music-list']}>
        <ul>
          {props.data.length ? (
            props.data.map((i, index) => {
              return (
                <li
                  key={index}
                  onClick={(_) =>
                    loadList(
                      props.data.filter((_, i) => i >= index).map((i) => i.id),
                    )
                  }
                >
                  <span className={styles['num']}>{index + 1}</span>
                  {i.name}
                  <time>{i.time}</time>
                </li>
              )
            })
          ) : (
            <p>
              <li>
                <span className={styles['num']}>0</span>
                这里暂时没有内容
              </li>
            </p>
          )}
        </ul>
      </div>
    </section>
  )
})
