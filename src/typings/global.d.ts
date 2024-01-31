type Nullable<T> = T | null

type ComponentRef<T> = InstanceType<T> | null

type ElementRef<T extends HTMLElement> = T | null

interface DisplayModeItem {
  value: string | number
  title: string
  icon: string
}

interface MenuItem {
  type?: 'normal' | 'separator' | 'submenu'
  label?: string
  click?: () => void
  submenu?: MenuItem[]
}
