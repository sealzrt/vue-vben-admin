import type { ColEx } from '../types';
import type { AdvanceState } from '../types/hooks';
import { ComputedRef, getCurrentInstance, Ref, shallowReactive, computed, unref, watch } from 'vue';
import type { FormProps, FormSchemaInner as FormSchema } from '../types/form';
import { isBoolean, isFunction, isNumber, isObject } from '@/utils/is';
import { useBreakpoint } from '@/hooks/event/useBreakpoint';
import { useDebounceFn } from '@vueuse/core';

const BASIC_COL_LEN = 24;

interface UseAdvancedContext {
  advanceState: AdvanceState;
  emit: EmitType;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  defaultValueRef: Ref<Recordable>;
}

/**
 * 主要用于处理表单的布局和显示，根据屏幕尺寸和表单项的宽度自动切换到高级模式或简单模式
 */
export default function ({
  advanceState,
  emit,
  getProps,
  getSchema,
  formModel,
  defaultValueRef,
}: UseAdvancedContext) {
  // 获取当前vue组件实例
  const vm = getCurrentInstance();

  // 获取屏幕尺寸相关的 Ref：realWidthRef、screenEnum 和 screenRef。
  const { realWidthRef, screenEnum, screenRef } = useBreakpoint();

  // 计算空格子数量
  const getEmptySpan = computed((): number => {
    // 如果不是高级模式，则返回0
    if (!advanceState.isAdvanced) {
      return 0;
    }
    // 某些特殊情况，需要手动指定额外的空行
    const emptySpan = unref(getProps).emptySpan || 0;

    // 如果是数字，则直接返回
    if (isNumber(emptySpan)) {
      return emptySpan;
    }
    // 如果是对象，则根据屏幕大小获取对应的空格子数量
    if (isObject(emptySpan)) {
      const { span = 0 } = emptySpan;
      const screen = unref(screenRef) as string;

      const screenSpan = (emptySpan as any)[screen.toLowerCase()];
      return screenSpan || span || 0;
    }
    return 0;
  });

  // 使用useDebounceFn函数创建一个防抖函数函数，参数为updateAdvanced函数和30
  const debounceUpdateAdvanced = useDebounceFn(updateAdvanced, 30);

  // 使用 watch 监听 getSchema、advanceState.isAdvanced 和 realWidthRef 的值的变化,
  // 当这些值发生变化时，如果 showAdvancedButton 为 true，则调用 debounceUpdateAdvanced 函数。
  watch(
    [() => unref(getSchema), () => advanceState.isAdvanced, () => unref(realWidthRef)],
    () => {
      // debugger
      // 获取getProps中的showAdvancedButton属性
      const { showAdvancedButton } = unref(getProps);
      // 如果showAdvancedButton为true，则调用debounceUpdateAdvanced函数
      if (showAdvancedButton) {
        debounceUpdateAdvanced();
      }
    },
    { immediate: true },
  );

  /**
   * 定义 getAdvanced 函数：用于计算每个表单项在当前屏幕尺寸下的宽度，并根据宽度判断是否需要切换到高级模式
   * @param itemCol
   * @param itemColSum
   * @param isLastAction
   */
  function getAdvanced(itemCol: Partial<ColEx>, itemColSum = 0, isLastAction = false) {
    const width = unref(realWidthRef);

    const mdWidth =
      parseInt(itemCol.md as string) ||
      parseInt(itemCol.xs as string) ||
      parseInt(itemCol.sm as string) ||
      (itemCol.span as number) ||
      BASIC_COL_LEN;

    const lgWidth = parseInt(itemCol.lg as string) || mdWidth;
    const xlWidth = parseInt(itemCol.xl as string) || lgWidth;
    const xxlWidth = parseInt(itemCol.xxl as string) || xlWidth;
    if (width <= screenEnum.LG) {
      itemColSum += mdWidth;
    } else if (width < screenEnum.XL) {
      itemColSum += lgWidth;
    } else if (width < screenEnum.XXL) {
      itemColSum += xlWidth;
    } else {
      itemColSum += xxlWidth;
    }

    if (isLastAction) {
      advanceState.hideAdvanceBtn = false;
      if (itemColSum <= BASIC_COL_LEN * 2) {
        // When less than or equal to 2 lines, the collapse and expand buttons are not displayed
        advanceState.hideAdvanceBtn = true;
        advanceState.isAdvanced = true;
      } else if (
        itemColSum > BASIC_COL_LEN * 2 &&
        itemColSum <= BASIC_COL_LEN * (unref(getProps).autoAdvancedLine || 3)
      ) {
        advanceState.hideAdvanceBtn = false;

        // More than 3 lines collapsed by default
      } else if (!advanceState.isLoad) {
        advanceState.isLoad = true;
        advanceState.isAdvanced = !advanceState.isAdvanced;
      }
      return { isAdvanced: advanceState.isAdvanced, itemColSum };
    }
    if (itemColSum > BASIC_COL_LEN * (unref(getProps).alwaysShowLines || 1)) {
      return { isAdvanced: advanceState.isAdvanced, itemColSum };
    } else {
      // The first line is always displayed
      return { isAdvanced: true, itemColSum };
    }
  }

  const fieldsIsAdvancedMap = shallowReactive({});

  /**
   * 用于更新高级模式的状态。
   * 遍历 getSchema 中的每个表单项，计算每个表单项的宽度，并根据宽度判断是否需要切换到高级模式。同时，更新 advanceState.actionSpan 和 advanceState.hideAdvanceBtn 的值
   */
  function updateAdvanced() {
    let itemColSum = 0;
    let realItemColSum = 0;
    const { baseColProps = {} } = unref(getProps);

    for (const schema of unref(getSchema)) {
      const { show, colProps } = schema;
      let isShow = true;

      if (isBoolean(show)) {
        isShow = show;
      }

      if (isFunction(show)) {
        isShow = show({
          schema: schema,
          model: formModel,
          field: schema.field,
          values: {
            ...unref(defaultValueRef),
            ...formModel,
          },
        });
      }

      if (isShow && (colProps || baseColProps)) {
        const { itemColSum: sum, isAdvanced } = getAdvanced(
          { ...baseColProps, ...colProps },
          itemColSum,
        );

        itemColSum = sum || 0;
        if (isAdvanced) {
          realItemColSum = itemColSum;
        }
        fieldsIsAdvancedMap[schema.field] = isAdvanced;
      }
    }

    // 确保页面发送更新
    vm?.proxy?.$forceUpdate();

    advanceState.actionSpan = (realItemColSum % BASIC_COL_LEN) + unref(getEmptySpan);

    getAdvanced(unref(getProps).actionColOptions || { span: BASIC_COL_LEN }, itemColSum, true);

    emit('advanced-change');
  }

  function handleToggleAdvanced() {
    advanceState.isAdvanced = !advanceState.isAdvanced;
  }

  return { handleToggleAdvanced, fieldsIsAdvancedMap };
}
