import type { CSSProperties, Component, ComponentPublicInstance, Ref } from 'vue'

export type ComponentProps = ComponentPublicInstance['$props']

export type ModalId = number | string | symbol
export type StyleValue = string | CSSProperties | (string | CSSProperties)[]

export interface UseModalPrivate<
  ModalProps extends ComponentProps,
  DefaultSlotProps extends ComponentProps,
> {
  component?: Component
  attrs?: ModalProps
  defaultSlot?: string | {
    component: Component
    attrs?: DefaultSlotProps
  }

  id?: Symbol
  modelValue?: boolean
  rejectOpen?: (reason?: string) => void
  resolveOpened?: () => void
  rejectClose?: (reason?: string) => void
  resolveClosed?: () => void
}

export type UseModal<
  ModalProps extends ComponentProps,
  DefaultSlotProps extends ComponentProps,
> = Pick<
  UseModalPrivate<ModalProps, DefaultSlotProps>,
  | 'component'
  | 'attrs'
  | 'defaultSlot'
>

export interface Modal {
  modalId?: ModalId
  hideOverlay: Ref<boolean | undefined> | undefined
  overlayVisible: Ref<boolean>
  focus: () => void
  toggle: (show?: boolean) => Promise<string>
}
