import { copyImage, copyFile } from 'utools-api'
import { ContentType } from '@/constant'

export function copyFromPath(path: string, contentType: string) {
  if (contentType === ContentType.IMAGE) {
    copyImage(path)
  } else {
    copyFile(path)
  }
}
