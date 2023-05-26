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

  export * from 'utools-utils/type'
}
