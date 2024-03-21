import type { ComputedRef, Ref } from 'vue';
import {
  type FormSchemaInner as FormSchema,
  type FormActionType,
  type FormProps,
} from '../types/form';

import { unref, nextTick, watchEffect } from 'vue';

interface UseAutoFocusContext {
  getSchema: ComputedRef<FormSchema[]>;
  getProps: ComputedRef<FormProps>;
  isInitedDefault: Ref<boolean>;
  formElRef: Ref<FormActionType>;
}

/**
 * 这段代码主要用于处理表单的自动聚焦功能，当表单元素发生变化时，如果满足条件，则自动聚焦到第一个表单项的 input 元素
 * @param getSchema
 * @param getProps
 * @param formElRef
 * @param isInitedDefault
 */
export async function useAutoFocus({
  // 获取表单的schema
  getSchema,
  // 获取表单的props
  getProps,
  // 获取表单元素的引用
  formElRef,
  // 判断是否初始化默认值
  isInitedDefault,
}: UseAutoFocusContext) {
  // 监听表单元素的变化
  watchEffect(async () => {
    // 如果已经初始化默认值或者props中autoFocusFirstItem为false，则不处理
    if (unref(isInitedDefault) || !unref(getProps).autoFocusFirstItem) {
      return;
    }
    // 等待下一次渲染
    await nextTick();
    // 获取表单的schema
    const schemas = unref(getSchema);
    // 获取表单元素
    const formEl = unref(formElRef);
    // 获取表单元素的DOM
    const el = (formEl as any)?.$el as HTMLElement;
    // 如果表单元素不存在或者DOM不存在或者schema不存在或者schema长度为0，则不处理
    if (!formEl || !el || !schemas || schemas.length === 0) {
      return;
    }

    // 获取第一个表单项
    const firstItem = schemas[0];
    // 只有当第一个表单项为Input类型时才打开
    if (!firstItem.component || !firstItem.component.includes('Input')) {
      return;
    }

    // 获取第一个表单项的input元素
    const inputEl = el.querySelector('.ant-row:first-child input') as Nullable<HTMLInputElement>;
    // 如果元素不存在，则不处理
    if (!inputEl) return;
    // 聚焦
    inputEl?.focus();
  });
}
