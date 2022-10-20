import type { Ref } from 'vue'
import { markRaw, reactive, ref, watch } from 'vue'
import { dynamicModals } from './api'
import CoreModal from './components/CoreModal/CoreModal.vue'
import type { ComponentProps, UseModal, UseModalPrivate } from './Modal'

function existModal<ModalProps extends ComponentProps, DefaultSlotProps extends ComponentProps>(options: UseModalPrivate<ModalProps, DefaultSlotProps>) {
  return dynamicModals.includes(options)
}

interface UseModalReturnType<ModalProps extends ComponentProps, DefaultSlotProps extends ComponentProps> {
  open: () => Promise<unknown>
  close: () => Promise<unknown>
  options: Omit<UseModalPrivate<ModalProps, DefaultSlotProps>, 'resolveOpened' | 'resolveClosed'>
  mergeOptions: (options: UseModal<ModalProps, DefaultSlotProps>) => void
}

export function useModal<
  ModalProps extends ComponentProps,
  DefaultSlotProps extends ComponentProps = ComponentProps,
>(_options?: UseModal<ModalProps, DefaultSlotProps>): UseModalReturnType<ModalProps, DefaultSlotProps> {
  const options = reactive({
    id: Symbol('useModal'),
    modelValue: false,
    component: markRaw(CoreModal),
    ..._options,
  }) as UseModalPrivate<ModalProps, DefaultSlotProps>

  const open = () => {
    options.modelValue = true
    return existModal(options)
      ? Promise.resolve('[Vue Final Modal] modal is already opened')
      : new Promise((resolve) => {
        options.resolveOpened = () => resolve('opened')
        dynamicModals.push(options)
      })
  }

  const close = () => {
    options.modelValue = false
    return existModal(options)
      ? new Promise((resolve) => {
        options.resolveClosed = () => resolve('closed')
      })
      : Promise.resolve('[Vue Final Modal] modal is already closed')
  }

  const mergeOptions = (_options: UseModal<ModalProps, DefaultSlotProps>) => {
    Object.assign(options?.attrs || {}, _options?.attrs || {})
    Object.assign(options?.component || {}, _options?.component || {})
    Object.assign(options?.slots || {}, _options?.slots || {})
  }

  return {
    open,
    close,
    options,
    mergeOptions,
  }
}

export function useModelValue(props: InstanceType<typeof CoreModal>['$props'], emit: InstanceType<typeof CoreModal>['$emit']): { modelValueLocal: Ref<boolean> } {
  const modelValueLocal = ref<boolean>(!!props.modelValue)
  watch(() => props.modelValue, (val) => {
    modelValueLocal.value = !!val
  })
  watch(modelValueLocal, (val) => {
    if (val !== props.modelValue)
      emit('update:modelValue', val)
  })

  return {
    modelValueLocal,
  }
}

export function useToClose(
  props: InstanceType<typeof CoreModal>['$props'],
  emit: InstanceType<typeof CoreModal>['$emit'],
  options: {
    vfmRootEl: Ref<HTMLDivElement | undefined>
    visible: Ref<boolean>
    modelValueLocal: Ref<boolean>
  }) {
  const { vfmRootEl, visible, modelValueLocal } = options
  const lastMousedownEl = ref<EventTarget | null>()

  function onEsc() {
    if (visible.value && props.escToClose)
      (modelValueLocal.value = false)
  }

  function onMousedown(e?: MouseEvent) {
    lastMousedownEl.value = e?.target
  }

  function onMouseupRoot(): void {
    // skip when the lastMousedownEl didn't equal vfmRootEl
    if (lastMousedownEl.value !== vfmRootEl.value)
      return

    if (props.clickToClose)
      modelValueLocal.value = false
    else
      emit('clickOutside')
  }

  return {
    onEsc,
    onMouseupRoot,
    onMousedown,
  }
}
