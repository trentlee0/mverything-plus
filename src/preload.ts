/// <reference types="node" />
/// <reference types="electron" />

import { FindFileMetadata, PrimaryFileMetadata, SimpleFileInfo } from '@/models'

import { createReadStream, lstatSync, readdirSync, stat } from 'fs'
import { readdir } from 'fs/promises'
import path, { basename } from 'path'
import os, { UserInfo } from 'os'
import { Buffer } from 'buffer'
import { shell } from 'electron'
import mdfind from 'mdfind'
import { fileMetadata } from 'file-metadata'
import chardet from 'chardet'
import iconv from 'iconv-lite'

let terminateFunc: Nullable<() => boolean> = null

function kill() {
  if (terminateFunc) {
    const res = terminateFunc()
    terminateFunc = null
    return res
  }
  return true
}

export function find(
  query: string,
  directories: string[],
  limit?: number
): Promise<Array<FindFileMetadata>> {
  kill()
  const attributes: Array<keyof PrimaryFileMetadata> = [
    'kMDItemContentType',
    'kMDItemKind',
    'kMDItemFSName',
    'kMDItemFSSize',
    'kMDItemFSCreationDate',
    'kMDItemFSContentChangeDate',
    'kMDItemLastUsedDate'
  ]
  return new Promise((resolve, reject) => {
    const res = mdfind({
      query,
      attributes,
      names: [],
      directories,
      limit
    })
    terminateFunc = res.terminate
    if (res.output) {
      const data: Array<FindFileMetadata> = []
      res.output.on('data', (chunk) => data.push(chunk))
      res.output.on('end', () => {
        // 防止已终止的 mdfind 子进程还返回数据
        if (terminateFunc) {
          resolve(data)
        }
      })
      res.output.on('error', (err) => reject(err))
    } else {
      resolve([])
    }
  })
}

export function killFind() {
  return kill()
}

export function getFileMetadata(filePath: string) {
  return fileMetadata(filePath)
}

export function trashFile(filePath: string) {
  shell.trashItem(filePath)
}

export function readFilePartText(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { flags: 'r' })
      .on('data', (data) => {
        const res = Buffer.from(data)
        stream.close()
        const encode = chardet.detect(res)
        if (encode) {
          resolve(iconv.decode(res, encode))
        } else {
          throw new Error('encode: ' + encode)
        }
      })
      .on('error', (err) => reject(err))
  })
}

export function readFileList(dirPath: string): Promise<Array<SimpleFileInfo>> {
  return new Promise((resolve) => {
    // 获取并过滤隐藏文件
    readdir(dirPath).then((files) => {
      const res = files
        .filter((item) => !item.startsWith('.'))
        .map((name) => {
          const st = lstatSync(path.join(dirPath, name))
          return {
            name,
            isFile: !st.isDirectory()
          }
        })
      resolve(res)
    })
  })
}

export function existsDir(dirPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    stat(dirPath, (err, stat) => {
      resolve(err ? false : stat.isDirectory())
    })
  })
}

export function getOsUserInfo(): UserInfo<string> {
  return os.userInfo()
}

export function getBasename(path: string): string {
  return basename(path)
}

export function getVolumes(): { name: string; path: string }[] {
  return readdirSync('/Volumes')
    .filter((item) => item !== 'Macintosh HD')
    .map((name) => ({ name, path: path.join('/Volumes', name) }))
}
