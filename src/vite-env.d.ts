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

  export enum ActionType {
    TEXT = 'text',
    IMG = 'img',
    REGEX = 'regex',
    OVER = 'over',
    FILES = 'files',
    WINDOW = 'window'
  }

  export type FilesPayload = Array<{
    isFile: boolean
    isDirectory: boolean
    name: string
    path: string
  }>

  export interface WindowPayload {
    id: number
    class: string
    title: string
    x: number
    y: number
    width: number
    height: number
    appPath: string
    pid: number
    app: string
  }

  export type Payload = string | FilesPayload | WindowPayload

  export interface Action {
    code: string
    type: ActionType
    payload: Payload
  }
}
