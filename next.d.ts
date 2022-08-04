import type { DynamicOptions } from 'next/dynamic'

declare module 'next/dynamic' {
  export default function dynamic<P = {}>(
    fc: () => Promise<P>,
    options?: DynamicOptions<P>,
  ): P
}
