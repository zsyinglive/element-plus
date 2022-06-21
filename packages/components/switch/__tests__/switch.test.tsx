import { markRaw, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { debugWarn } from '@element-plus/utils'
import { Checked, CircleClose } from '@element-plus/icons-vue'
import Switch from '../src/switch.vue'
import type { VueWrapper } from '@vue/test-utils'

type Value = string | number | boolean

vi.mock('@element-plus/utils/error', () => ({
  debugWarn: vi.fn(),
}))

const snapshot = (wrapper: VueWrapper) => {
  const element = wrapper.element
  expect(element).toMatchSnapshot()
}

vi.mock('@element-plus/hooks/use-id', () => ({
  useId: () => ref('ID'),
}))

describe('Switch.vue', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('create', () => {
    const wrapper = mount(
      <Switch
        activeText="on"
        inactiveText="off"
        activeColor="#0f0"
        inactiveColor="#f00"
        width={100}
      />
    )
    snapshot(wrapper)

    const vm = wrapper.getComponent(Switch)
    expect(vm.attributes().style).toMatchInlineSnapshot(
      '"--el-switch-on-color: #0f0; --el-switch-off-color: #f00;"'
    )
    expect(vm.classes('is-checked')).toBe(false)

    const core = vm.element.querySelector<HTMLDivElement>('.el-switch__core')!
    expect(core.style.width).toBe('100px')

    const leftLabel = wrapper.find('.el-switch__label--left span')
    expect(leftLabel.text()).toBe('off')
  })

  test('size', () => {
    const wrapper = mount(<Switch size="large" />)
    snapshot(wrapper)
    expect(wrapper.find('.el-switch--large').exists()).toBe(true)
  })

  test('tabindex', () => {
    const wrapper = mount(<Switch tabindex="0" />)
    snapshot(wrapper)
    expect(wrapper.find('.el-switch__input').attributes().tabindex).toBe('0')
  })

  test('inline prompt', () => {
    const wrapper = mount(
      <Switch
        inlinePrompt={true}
        activeText="on"
        inactiveText="off"
        activeColor="#0f0"
        inactiveColor="#f00"
        width={100}
      />
    )

    snapshot(wrapper)

    const vm = wrapper.getComponent(Switch)
    expect(vm.attributes().style).toMatchInlineSnapshot(
      '"--el-switch-on-color: #0f0; --el-switch-off-color: #f00;"'
    )

    expect(vm.classes('is-checked')).toBe(false)

    const core = vm.element.querySelector<HTMLDivElement>('.el-switch__core')!
    expect(core.style.width).toBe('100px')

    const innerLabel = wrapper.find('.el-switch__inner span')
    expect(innerLabel.text()).toBe('on')
  })

  test('switch with icons', () => {
    const wrapper = mount(
      <Switch
        activeIcon={markRaw(Checked)}
        inactiveIcon={markRaw(CircleClose)}
      />
    )
    snapshot(wrapper)
    expect(wrapper.findComponent(Checked).exists()).toBe(true)
  })

  test('value correctly update', async () => {
    const value = ref(true)
    const wrapper = mount(() => (
      <Switch v-model={value.value} activeColor="#0f0" inactiveColor="#f00" />
    ))
    snapshot(wrapper)

    const vm = wrapper.getComponent(Switch)
    expect(vm.attributes().style).toMatchInlineSnapshot(
      '"--el-switch-on-color: #0f0; --el-switch-off-color: #f00;"'
    )
    expect(vm.classes('is-checked')).toBe(true)

    const coreWrapper = wrapper.find<HTMLDivElement>('.el-switch__core')!
    await coreWrapper.trigger('click')
    snapshot(wrapper)
    expect(vm.classes('is-checked')).toBe(false)
    expect(value.value).toBe(false)

    await coreWrapper.trigger('click')
    snapshot(wrapper)
    expect(vm.classes('is-checked')).toBe(true)
    expect(value.value).toBe(true)
  })

  test('change event', async () => {
    const value = ref(true)
    let target: Value = 1
    const handleChange = (value: Value) => (target = value)
    const wrapper = mount(() => (
      <Switch v-model={value.value} onUpdate:modelValue={handleChange} />
    ))
    snapshot(wrapper)

    expect(target).toBe(1)
    const coreWrapper = wrapper.find('.el-switch__core')
    await coreWrapper.trigger('click')

    const switchWrapper = wrapper.findComponent(Switch)
    expect(switchWrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(target).toBe(false)
  })

  test('disabled switch should not respond to user click', async () => {
    const value = ref(true)
    const wrapper = mount(() => <Switch disabled v-model={value.value} />)
    snapshot(wrapper)
    expect(value.value).toBe(true)

    const coreWrapper = wrapper.find('.el-switch__core')
    await coreWrapper.trigger('click')
    snapshot(wrapper)

    expect(value.value).toBe(true)
  })

  test('expand switch value', async () => {
    const onValue = '100'
    const offValue = '0'
    const value = ref('100')
    const wrapper = mount(() => (
      <Switch
        v-model={value.value}
        activeValue={onValue}
        inactiveValue={offValue}
      />
    ))
    snapshot(wrapper)

    const coreWrapper = wrapper.find('.el-switch__core')
    await coreWrapper.trigger('click')
    expect(value.value).toBe('0')
    await coreWrapper.trigger('click')
    expect(value.value).toBe('100')
  })

  test('default switch active-value is false', async () => {
    const value = ref(false)
    const wrapper = mount(() => (
      <Switch v-model={value.value} activeValue={false} inactiveValue={true} />
    ))
    snapshot(wrapper)

    const coreWrapper = wrapper.find('.el-switch__core')
    await coreWrapper.trigger('click')
    expect(value.value).toBe(true)
    await coreWrapper.trigger('click')
    expect(value.value).toBe(false)
  })

  test('model-value is the single source of truth', async () => {
    const wrapper = mount(<Switch model-value={true} />)
    snapshot(wrapper)

    const coreWrapper = wrapper.find('.el-switch__core')
    const switchWrapper = wrapper.findComponent(Switch)
    const switchVm = switchWrapper.vm
    const inputEl = wrapper.find<HTMLInputElement>('input').element

    expect(switchVm.checked).toBe(true)
    expect(switchWrapper.classes('is-checked')).toBe(true)

    expect(inputEl.checked).toBe(true)
    await coreWrapper.trigger('click')
    expect(switchVm.checked).toBe(true)
    expect(switchWrapper.classes('is-checked')).toBe(true)
    expect(inputEl.checked).toBe(true)
  })

  test('sets checkbox value', async () => {
    const value = ref(false)
    const wrapper = mount(() => <Switch v-model={value.value} />)
    snapshot(wrapper)

    const inputEl = wrapper.find<HTMLInputElement>('input').element

    value.value = true
    await nextTick()
    expect(inputEl.checked).toBe(true)

    value.value = false
    await nextTick()
    expect(inputEl.checked).toBe(false)
  })

  test('beforeChange function return Promise', async () => {
    const value = ref(true)
    const loading = ref(false)
    let asyncResult = 'error'
    const beforeChange = () => {
      loading.value = true
      return new Promise<boolean>((resolve, reject) => {
        setTimeout(() => {
          loading.value = false
          return asyncResult === 'success'
            ? resolve(true)
            : reject(new Error('Error'))
        }, 1000)
      })
    }

    const wrapper = mount(() => (
      <Switch
        v-model={value.value}
        loading={loading.value}
        beforeChange={beforeChange}
      />
    ))

    vi.useFakeTimers()

    const coreWrapper = wrapper.find('.el-switch__core')

    await coreWrapper.trigger('click')
    vi.runAllTimers()
    await nextTick()
    expect(value.value).toBe(true)
    expect(debugWarn).toHaveBeenCalledTimes(1)

    vi.resetAllMocks()

    asyncResult = 'success'
    await coreWrapper.trigger('click')
    vi.runAllTimers()
    await nextTick()
    expect(value.value).toBe(false)
    expect(debugWarn).toHaveBeenCalledTimes(0)

    await coreWrapper.trigger('click')
    vi.runAllTimers()
    await nextTick()
    expect(value.value).toBe(true)
    expect(debugWarn).toHaveBeenCalledTimes(0)
  })

  test('beforeChange function return boolean', async () => {
    const value = ref(true)
    let result = false
    const beforeChange = () => result

    const wrapper = mount(() => (
      <Switch v-model={value.value} beforeChange={beforeChange} />
    ))

    const coreWrapper = wrapper.find('.el-switch__core')

    await coreWrapper.trigger('click')
    expect(value.value).toBe(true)

    result = true
    await coreWrapper.trigger('click')
    expect(value.value).toBe(false)

    await coreWrapper.trigger('click')
    expect(value.value).toBe(true)
  })
})
