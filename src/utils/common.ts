import { copyFile, copyImage } from 'utools-api'
import { getFileExtension } from './strings'

export function copyFromPath(path: string, picExts?: string) {
  const ext = getFileExtension(path)
  if (picExts?.includes(ext)) {
    copyImage(path)
  } else {
    copyFile(path)
  }
}
