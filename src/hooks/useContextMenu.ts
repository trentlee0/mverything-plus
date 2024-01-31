import ContextMenu, { MenuItem } from '@imengyu/vue3-context-menu'
import { useDark } from './useDark'

export interface RightMenuItem {
  type?: 'normal' | 'separator' | 'submenu'
  label?: string
  click?: () => void
  submenu?: RightMenuItem[]
}

function toMenuItems(items?: RightMenuItem[]): MenuItem[] | undefined {
  return items
    ?.map((item, index) => ({
      label: item.label,
      onClick: item.click,
      divided: index + 1 < items.length && items[index + 1].type === 'separator',
      children: toMenuItems(item.submenu)
    }))
    .filter((item) => item.label !== undefined)
}

export function closeContextMenu() {
  ContextMenu.closeContextMenu()
}

export function useContextMenu(menuItems?: RightMenuItem[]) {
  const { isDark } = useDark()

  return {
    showMenu(pos: { x: number; y: number }, items?: RightMenuItem[]) {
      ContextMenu.showContextMenu({
        zIndex: 11,
        x: pos.x,
        y: pos.y,
        theme: isDark.value ? 'macos-dark' : 'macos-light',
        items: toMenuItems(items || menuItems)
      })
    },
    closeMenu() {
      ContextMenu.closeContextMenu()
    }
  }
}
