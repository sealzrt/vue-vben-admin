import { Slots } from 'vue';
import { isFunction } from '@/utils/is';
import { RenderOpts } from '@/components/Form';

/**
 * @description:  Get slot to prevent empty error
 */
// 用于获取slots中的指定slot
export function getSlot(slots: Slots, slot = 'default', data?: any, opts?: RenderOpts) {
  // 如果slots不存在，或者slots中没有指定的slot，则返回null
  if (!slots || !Reflect.has(slots, slot)) {
    return null;
  }
  // 如果slots中指定的slot不是函数，则报错并返回null
  if (!isFunction(slots[slot])) {
    console.error(`${slot} is not a function!`);
    return null;
  }
  // 获取slots中指定的slot函数
  const slotFn = slots[slot];
  // 如果slotFn不存在，则返回null
  if (!slotFn) return null;
  // 将data和opts合并为params
  const params = { ...data, ...opts };
  // 调用slotFn，并返回结果
  return slotFn(params);
}

/**
 * extends slots
 * @param slots
 * @param excludeKeys
 */
export function extendSlots(slots: Slots, excludeKeys: string[] = []) {
  const slotKeys = Object.keys(slots);
  const ret: any = {};
  slotKeys.map((key) => {
    if (excludeKeys.includes(key)) {
      return null;
    }
    ret[key] = (data?: any) => getSlot(slots, key, data);
  });
  return ret;
}
