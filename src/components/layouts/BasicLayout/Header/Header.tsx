import classNames from 'clsx'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import type { FC } from 'react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { IcBaselineMenuOpen } from '@mx-space/kami-design/components/Icons/layout'

import { CustomLogo as Logo } from '~/components/universal/Logo'
import { TrackerAction } from '~/constants/tracker'
import { useAnalyze } from '~/hooks/use-analyze'
import { useInitialData, useKamiConfig } from '~/hooks/use-initial-data'
import { useIsClient } from '~/hooks/use-is-client'
import { useSingleAndDoubleClick } from '~/hooks/use-single-double-click'
import { useStore } from '~/store'

import { HeaderActionBasedOnRouterPath } from './HeaderActionBasedOnRouterPath'
import { HeaderDrawer } from './HeaderDrawer'
import { HeaderDrawerNavigation } from './HeaderDrawerNavigation'
import { MenuList } from './HeaderMenuList'
import styles from './index.module.css'

export const Header: FC = observer(() => {
  const {
    seo: { title, description },
  } = useInitialData()
  const {
    site: { subtitle },
  } = useKamiConfig()
  const {
    appStore,
    userStore: { isLogged, url },
  } = useStore()

  const { isPadOrMobile, headerNav } = appStore

  const router = useRouter()
  const { event } = useAnalyze()
  const clickFunc = useSingleAndDoubleClick(
    () => {
      router.push('/')

      event({
        action: TrackerAction.Click,
        label: '点击 - 顶部 Logo',
      })
    },
    () => {
      if (isLogged && url?.adminUrl) {
        location.href = url.adminUrl
      } else {
        router.push('/login')
      }
    },
  )

  const [drawerOpen, setDrawerOpen] = useState(false)
  const showPageHeader = useMemo(
    () =>
      headerNav.show &&
      (appStore.scrollDirection == 'down' || appStore.viewport.mobile) &&
      appStore.isOverPostTitleHeight,
    [
      headerNav.show,
      appStore.isOverPostTitleHeight,
      appStore.scrollDirection,
      appStore.viewport.mobile,
    ],
  )
  // NOTE: fix `tab` focus element lead to header dislocation
  const appHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    appHeaderRef.current?.scrollIntoView()
  }, [showPageHeader])

  const isClient = useIsClient()

  const headerSubTitle = subtitle || description || ''
  // const headerSubTitle = ''
  if (!isClient) {
    return null
  }

  return (
    <header
      className={classNames(
        styles['header'],
        !appStore.headerNav.show &&
          appStore.isOverFirstScreenHeight &&
          appStore.viewport.mobile
          ? styles['hide']
          : null,
      )}
      style={
        {
          '--opacity': appStore.headerOpacity,
        } as any
      }
    >
      <nav
        className={classNames(
          styles['nav-container'],
          'overflow-hidden',
          showPageHeader ? styles['toggle'] : null,
        )}
      >
        <div
          className={classNames(
            styles['head-swiper'],
            'justify-between min-w-0',
          )}
          ref={appHeaderRef}
        >
          <div
            className={
              'flex items-center justify-center cursor-pointer select-none min-w-0'
            }
            onClick={clickFunc}
          >
            <div className={styles['header-logo']}>
              <Logo />
            </div>
            <div className={styles['header-title-wrapper']}>
              <h1
                className={classNames(
                  styles['title'],
                  headerSubTitle && styles['title-has-sub'],
                )}
              >
                {title}
              </h1>
              {headerSubTitle && (
                <h2 className={styles['subtitle']}>{headerSubTitle}</h2>
              )}
            </div>
          </div>

          <div
            className={styles['more-button']}
            onClick={() => {
              setDrawerOpen(true)
            }}
          >
            <IcBaselineMenuOpen className="text-2xl" />
          </div>
          <MenuList />
        </div>
        <HeaderMetaTitle title={headerNav.title} meta={headerNav.meta} />
      </nav>
      {isPadOrMobile && (
        <HeaderDrawer
          show={drawerOpen}
          onExit={() => {
            setDrawerOpen(false)
          }}
        >
          <HeaderDrawerNavigation />
        </HeaderDrawer>
      )}
    </header>
  )
})

const HeaderMetaTitle: FC<{
  title: string
  meta: string
}> = memo((props) => {
  const { title, meta } = props
  return (
    <div
      className={classNames(
        styles['head-swiper'],
        styles['swiper-metawrapper'],
        'flex justify-between truncate',
      )}
    >
      <div className={styles['head-info']}>
        <div className={styles['desc']}>
          <div className={styles['meta']}>{meta}</div>
          <div className={styles['title']}>{title}</div>
        </div>
      </div>
      <div className={styles['right-wrapper']}>
        <HeaderActionBasedOnRouterPath />
      </div>
    </div>
  )
})
