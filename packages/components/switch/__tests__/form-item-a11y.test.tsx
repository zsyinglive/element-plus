import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import { ElFormItem } from '@element-plus/components/form'
import Switch from '../src/switch.vue'

describe('form item accessibility integration', () => {
  test('automatic id attachment', async () => {
    const wrapper = mount(
      <ElFormItem label="Foobar" data-test-ref="item">
        <Switch />
      </ElFormItem>
    )

    await nextTick()
    const formItem = wrapper.find('[data-test-ref="item"]')
    const formItemLabel = formItem.find('.el-form-item__label')
    const switchInput = wrapper.find('.el-switch__input')
    expect(formItem.attributes().role).toBeFalsy()
    expect(formItemLabel.attributes().for).toBe(switchInput.attributes().id)
  })

  test('specified id attachment', async () => {
    const wrapper = mount(
      <ElFormItem label="Foobar" data-test-ref="item">
        <Switch id="foobar" />
      </ElFormItem>
    )

    await nextTick()
    const formItem = wrapper.find('[data-test-ref="item"]')
    const formItemLabel = formItem.find('.el-form-item__label')
    const switchInput = wrapper.find('.el-switch__input')
    expect(formItem.attributes().role).toBeFalsy()
    expect(switchInput.attributes().id).toBe('foobar')
    expect(formItemLabel.attributes().for).toBe(switchInput.attributes().id)
  })

  test('form item role is group when multiple inputs', async () => {
    const wrapper = mount(
      <ElFormItem label="Foobar" data-test-ref="item">
        <Switch />
        <Switch />
      </ElFormItem>
    )

    await nextTick()
    const formItem = wrapper.find('[data-test-ref="item"]')
    expect(formItem.attributes().role).toBe('group')
  })
})
