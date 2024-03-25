import type { Ref } from 'vue';
import { computed, unref } from 'vue';
import type { FormProps, FormSchemaInner as FormSchema } from '../types/form';
import { isNumber } from '@/utils/is';

/**
 * 计算表单项的标签宽度
 * @param schemaItemRef
 * @param propsRef
 */
export function useItemLabelWidth(schemaItemRef: Ref<FormSchema>, propsRef: Ref<FormProps>) {
  // 返回一个计算属性
  return computed(() => {
    // 获取表单项配置
    const schemaItem = unref(schemaItemRef);
    // 获取表单项的标签列和包装列配置
    const { labelCol = {}, wrapperCol = {} } = schemaItem.itemProps || {};
    // 获取表单项的标签宽度和禁用标签宽度
    const { labelWidth, disabledLabelWidth } = schemaItem;

    // 获取全局的标签宽度、标签列和包装列配置
    const {
      labelWidth: globalLabelWidth,
      labelCol: globalLabelCol,
      wrapperCol: globWrapperCol,
      layout,
    } = unref(propsRef);

    // 如果全局设置了标签宽度，所有项设置
    if ((!globalLabelWidth && !labelWidth && !globalLabelCol) || disabledLabelWidth) {
      labelCol.style = {
        textAlign: 'left',
      };
      return { labelCol, wrapperCol };
    }
    // 获取标签宽度
    let width = labelWidth || globalLabelWidth;
    // 合并全局和当前表单项的标签列和包装列配置
    const col = { ...globalLabelCol, ...labelCol };
    const wrapCol = { ...globWrapperCol, ...wrapperCol };

    // 如果标签宽度是数字，转换为字符串
    if (width) {
      width = isNumber(width) ? `${width}px` : width;
    }

    // 返回计算后的标签列和包装列配置
    return {
      labelCol: { style: { width }, ...col },
      wrapperCol: {
        style: { width: layout === 'vertical' ? '100%' : `calc(100% - ${width})` },
        ...wrapCol,
      },
    };
  });
}
