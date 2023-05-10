declare module 'mdfind' {
  import { Readable } from 'stream'

  type MdfindOptions = {
    query: string
    attributes?: string[]
    limit?: number
    directories?: string[]
    names?: string[]
    interpret?: boolean
  }

  type MdfindResult = {
    output: Readable | null
    terminate: () => boolean
  }

  export function mdfind(options: MdfindOptions): MdfindResult
  export default mdfind
}

declare module 'file-metadata' {
  import { ExtraFileMetadata } from '@/models'

  export function fileMetadata(filePath: string): Promise<ExtraFileMetadata>
  export function fileMetadataSync(filePath: string): ExtraFileMetadata
}
