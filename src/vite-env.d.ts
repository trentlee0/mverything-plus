/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'utools-api' {
  import utools from 'utools-api-types'
  export = utools
}

declare module 'utools-api' {
  import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
  import { Action } from 'utools-utils/type'

  export type * from 'utools-utils/type'

  export function createBrowserWindow(
    url: string,
    options: BrowserWindowConstructorOptions,
    callback?: () => void
  ): Omit<
    BrowserWindow,
    | 'on'
    | 'once'
    | 'addListener'
    | 'removeListener'
    | 'listenerCount'
    | 'listeners'
    | 'rawListeners'
    | 'getMaxListeners'
    | 'setMaxListeners'
    | 'removeAllListeners'
    | 'prependListener'
    | 'prependOnceListener'
  >

  export function onPluginEnter(callback: (action: Action) => void): void
}
