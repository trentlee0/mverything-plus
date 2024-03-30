/// <reference types="node" />
/// <reference types="electron" />

import { ExtraFileMetadata, FindFileMetadata, PrimaryFileMetadata, SimpleFileInfo } from '@/models'

import { createReadStream, existsSync, lstatSync, mkdirSync, readlinkSync, stat, writeFileSync } from 'fs'
import path, { basename, dirname, extname, isAbsolute, join, resolve } from 'path'
import os, { UserInfo } from 'os'
import { Buffer } from 'buffer'
import { shell } from 'electron'
import mdfind from 'mdfind'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import { ContentType, FileConstant, FindEndingStatus } from '@/constant'
import { execAppleScript } from 'utools-utils/preload'
import { MainPushItem, getFileIcon, getPath } from 'utools-api'
import { MdfindProcessManager } from '@/utils/mdfinds'
import { readdir } from 'fs/promises'
import { decodeUnicode } from './utils/strings'
import { execFile, execFileSync } from 'child_process'
import { parsePlist } from './utils/plist'

const mdfindManager = new MdfindProcessManager()

function spotlight(
  query: string,
  directories: string[],
  attributes: Array<keyof PrimaryFileMetadata>,
  limit?: number
): Promise<Array<FindFileMetadata>> {
  mdfindManager.killCurrent()
  return new Promise((resolve, reject) => {
    const res = mdfind({
      query,
      attributes,
      names: [],
      directories,
      limit
    })
    const currentTask = mdfindManager.add(res)
    if (res.output) {
      const data: Array<FindFileMetadata> = []
      res.output.on('data', (chunk) => data.push(chunk))
      res.output.on('end', () => {
        // 防止已终止的 mdfind 子进程还返回数据
        if (!mdfindManager.isInterruptLastTask()) {
          resolve(data)
        }
        mdfindManager.markTaskAsEnd(currentTask)
      })
      res.output.on('error', (err) => reject(err))
    } else {
      resolve([])
    }
  })
}

function getFindAttributes(): Array<keyof PrimaryFileMetadata> {
  return [
    'kMDItemContentType',
    'kMDItemKind',
    'kMDItemDisplayName',
    'kMDItemFSSize',
    'kMDItemContentCreationDate',
    'kMDItemContentModificationDate',
    'kMDItemFSCreationDate',
    'kMDItemFSContentChangeDate',
    'kMDItemLastUsedDate'
  ]
}

export function findCallback(
  query: string,
  directories: string[],
  callback: (data: FindFileMetadata | null, index: number, endingStatus?: FindEndingStatus) => void,
  filter: RegExp | null,
  limit?: number
) {
  mdfindManager.killCurrent()
  const res = mdfind({
    query,
    directories,
    attributes: getFindAttributes(),
    names: [],
    limit
  })
  if (!res.output) return

  const currentTask = mdfindManager.add(res)
  let length = 0
  if (filter) {
    res.output.on('data', (chunk: FindFileMetadata) => {
      if (!filter.test(chunk.kMDItemPath)) return
      callback(chunk, ++length)
    })
  } else {
    res.output.on('data', (chunk) => callback(chunk, ++length))
  }
  res.output.on('end', () => {
    if (mdfindManager.isLastTask(currentTask)) {
      callback(
        null,
        length,
        mdfindManager.isInterruptLastTask() ? FindEndingStatus.INTERRUPTED : FindEndingStatus.NORMAL
      )
    }
    mdfindManager.markTaskAsEnd(currentTask)
  })
}

export async function findPush(
  query: string,
  directories: string[],
  limit: number
): Promise<Array<MainPushItem>> {
  const attributes: Array<keyof PrimaryFileMetadata> = [
    'kMDItemDisplayName',
    'kMDItemContentType',
    'kMDItemUserTags'
  ]
  return (await spotlight(query, directories, attributes, limit)).map((v) => ({
    text: v.kMDItemDisplayName,
    title: v.kMDItemPath,
    icon: getFileIconPath(v.kMDItemPath, v.kMDItemContentType),
    tags: v.kMDItemUserTags?.map(decodeUnicode)
  }))
}

function getEmbeddedIcon(contentType: string) {
  if (contentType === ContentType.FOLDER) return 'folder.png'
  if (contentType === ContentType.EXECUTABLE) return 'exec.png'
  if (contentType === ContentType.VOLUME) return 'disk.png'
  return null
}

function saveFileIcon(base64Icon: string, key: string) {
  const data = Buffer.from(base64Icon.replace(/^data:image\/\w+;base64,/, ''), 'base64')
  const basePath = resolve(getPath('temp'), 'utools-mverything-plus')
  if (!existsSync(basePath)) {
    mkdirSync(basePath)
  }
  const imgPath = `${basePath}/file-icon-${key}.png`
  if (!existsSync(imgPath)) {
    writeFileSync(imgPath, data)
  }
  return imgPath
}

function getAppIcon(appPath: string) {
  if (lstatSync(appPath).isSymbolicLink()) {
    const realPath = readlinkSync(appPath)
    if (isAbsolute(realPath)) {
      appPath = realPath
    } else {
      appPath = resolve(dirname(appPath), realPath)
    }
  }
  return getFileIcon(appPath)
}

function getFileIconPath(filePath: string, contentType: string) {
  const embeddedIcon = getEmbeddedIcon(contentType)
  if (embeddedIcon) return embeddedIcon

  const ext = extname(filePath)
  if (ext) {
    return (
      'file://' +
      (filePath.endsWith('.app')
        ? saveFileIcon(getAppIcon(filePath), basename(filePath))
        : saveFileIcon(getFileIcon(ext), ext))
    )
  }
  return 'file.png'
}

export function getFileIconBase64(filePath: string, contentType: string) {
  const embeddedIcon = getEmbeddedIcon(contentType)
  if (embeddedIcon) return embeddedIcon

  if (filePath.endsWith('.app')) return getAppIcon(filePath)

  const ext = extname(filePath)
  if (ext && contentType !== ContentType.DIRECTORY) return getFileIcon(ext)
  if (dirname(filePath) === '/Volumes') return 'disk.png'
  if (contentType === ContentType.DIRECTORY) return 'folder.png'
  return 'file.png'
}

export async function find(query: string, directories: string[], filter: RegExp | null, limit?: number) {
  const res = await spotlight(query, directories, getFindAttributes(), limit)
  return filter ? res.filter((item) => filter.test(item.kMDItemPath)) : res
}

export function killFind() {
  return mdfindManager.killCurrent()
}

export function getFileMetadata(filePath: string) {
  return new Promise<ExtraFileMetadata>((resolve, reject) => {
    execFile('mdls', ['-plist', '-', filePath], (error, stdout) => {
      if (error) return reject(error)
      resolve(parsePlist(stdout))
    })
  })
}

export function trashFile(filePath: string) {
  shell.trashItem(filePath)
}

export function readFilePartText(filePath: string): Promise<{
  text: string
  encoding: string
  partialSize: number
  size: number
}> {
  return new Promise((resolve, reject) => {
    const st = lstatSync(filePath)
    const stream = createReadStream(filePath, {
      flags: 'r',
      highWaterMark: 128 * FileConstant.KB,
      start: 0
    })
      .on('data', (data) => {
        stream.close()
        const res = data as Buffer
        const encoding = chardet.detect(res)
        if (encoding !== null) {
          resolve({
            text: iconv.decode(res, encoding),
            encoding,
            partialSize: res.byteLength,
            size: st.size
          })
        } else {
          throw new Error('The encoding of the detected file is null! File: ' + filePath)
        }
      })
      .on('error', reject)
  })
}

export async function readFileList(dirPath: string) {
  const st = lstatSync(dirPath)
  if (!st.isDirectory()) return null
  // 获取并过滤隐藏文件
  const files = await readdir(dirPath)
  return files
    .filter((item) => !item.startsWith('.') && item !== '$RECYCLE.BIN')
    .map((name) => {
      const st = lstatSync(path.join(dirPath, name))
      return <SimpleFileInfo>{
        name,
        isDirectory: st.isDirectory()
      }
    })
}

export function existsDir(dirPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    stat(dirPath, (err, stat) => {
      resolve(err ? false : stat.isDirectory())
    })
  })
}

export function existsFile(path: string) {
  return existsSync(path)
}

export function getOsUserInfo(): UserInfo<string> {
  return os.userInfo()
}

export function getBasename(path: string) {
  return basename(path)
}

export function getDirname(path: string) {
  return dirname(path)
}

export function joinPath(...paths: string[]) {
  return join(...paths)
}

export interface VolumeInfo {
  name: string
  path: string
}

interface DiskInfo {
  AllDisks: string[]
  AllDisksAndPartitions: AllDisksAndPartition[]
  VolumesFromDisks: string[]
  WholeDisks: string[]
}

interface AllDisksAndPartition {
  Content: string
  DeviceIdentifier: string
  OSInternal: boolean
  Partitions: Partition[]
  Size: number
}

interface Partition {
  Content: string
  DeviceIdentifier: string
  MountPoint?: string
  Size: number
  VolumeName?: string
  VolumeUUID?: string
}

export async function getVolumes() {
  return new Promise<Array<{ name: string; path: string }>>((resolve, reject) => {
    execFile('diskutil', ['list', '-plist', 'external'], (error, stdout) => {
      if (error) return reject(error)
      resolve(
        parsePlist<DiskInfo>(stdout).AllDisksAndPartitions.flatMap((item) => {
          return item.Partitions.filter((p) => !!p.MountPoint).map((p) => {
            const name = p.VolumeName as string
            const path = p.MountPoint as string
            return { name, path }
          })
        })
      )
    })
  })
}

export async function openInfoWindow(paths: string | string[]) {
  if (typeof paths === 'string') paths = [paths]
  const openScript = (p: string) => {
    if (!p.startsWith('/System')) return `open information window of ((POSIX file "${p}") as alias)`
    return `
      activate reveal (POSIX file "${p}") as alias
      tell application "System Events"
        click menu item "显示简介" of menu "文件" of menu bar item "文件" of menu bar 1 of process "Finder"
      end tell`
  }
  const script = `
    tell application "Finder"
      ${paths.map(openScript).join('\n')}
      activate information window
    end tell`
  await execAppleScript(script, true)
}

export function openFile(path: string) {
  execFileSync('open', [path])
}