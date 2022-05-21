import { Avatar } from 'components/universal/Avatar'
import { Divider } from 'components/universal/Divider'
import { FloatPopover } from 'components/universal/FloatPopover'
import { ImpressionView } from 'components/universal/ImpressionView'
import { TrackerAction } from 'constants/tracker'
import Link from 'next/link'
import type { FC } from 'react'
import { useMemo } from 'react'
import { textToBigCharOrWord } from 'utils/word'

import type { TopicModel } from '@mx-space/api-client/types/models/topic'

import { InnerTopicDetail } from './inner-detail'

export const NoteTopic: FC<{ noteId: string; topic: TopicModel }> = (props) => {
  const { topic } = props
  const { icon, name, introduce } = topic
  return (
    <ImpressionView
      action={TrackerAction.Impression}
      trackerMessage={`曝光底部话题 - ${topic.name}`}
    >
      <div data-hide-print>
        <div className="text-md">
          <strong>文章被专栏收录：</strong>
        </div>
        <Divider />
        <div className="flex items-center gap-4">
          <Avatar
            size={60}
            imageUrl={icon}
            text={textToBigCharOrWord(name)}
            className="flex-shrink-0"
            useRandomColor={false}
            shadow={false}
            wrapperProps={useMemo(
              () => ({ className: 'text-white dark:text-opacity-80' }),
              [],
            )}
          />
          <div className="flex-grow flex flex-col self-start">
            <span className="text-md font-medium mb-2">
              <FloatPopover
                triggerComponent={() => (
                  <Link href={`/notes/topics/${topic.slug}`}>
                    <a>
                      <span>{name}</span>
                    </a>
                  </Link>
                )}
              >
                <ImpressionView
                  trackerMessage={`曝光 - 内页话题 - ${topic.name}`}
                  action={TrackerAction.Impression}
                >
                  <InnerTopicDetail topic={topic} />
                </ImpressionView>
              </FloatPopover>
            </span>

            <p className="opacity-60 text-shizuku-text text-sm line-clamp-2">
              {introduce}
            </p>
          </div>
        </div>
      </div>
    </ImpressionView>
  )
}