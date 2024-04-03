import type { ComputedRef, Slots } from 'vue';
import type { BasicTableProps, InnerHandlers, InnerMethods } from '../types/table';
import { unref, computed, h } from 'vue';
import TableHeader from '../components/TableHeader.vue';
import { isString } from '@/utils/is';
import { getSlot } from '@/utils/helper/tsxHelper';

/**
 * 用于处理表格标题
 * @param propsRef
 * @param slots
 * @param handlers
 * @param methods
 */
export function useTableHeader(
  // propsRef：一个计算属性，用于获取BasicTableProps的值
  propsRef: ComputedRef<BasicTableProps>,
  // slots：一个槽对象，用于获取表格标题
  slots: Slots,
  // handlers：一个内部处理程序对象，用于处理表格标题的回调函数
  handlers: InnerHandlers,
  //
  methods: InnerMethods,
) {
  // 获取标题属性
  const getHeaderProps = computed((): Recordable => {
    // 获取BasicTableProps的属性值
    const { title, showTableSetting, titleHelpMessage, tableSetting, showSelectionBar } =
      unref(propsRef);
    // 如果隐藏标题，则不显示标题
    const hideTitle = !slots.tableTitle && !title && !slots.toolbar && !showTableSetting;
    // 如果隐藏标题，并且标题不是字符串，则返回空对象
    if (hideTitle && !isString(title)) {
      return {};
    }

    // 返回标题
    // h(tag, props?, children?)
    return {
      title: hideTitle
        ? null
        : () =>
            h(
              TableHeader,
              {
                title,
                titleHelpMessage,
                showTableSetting,
                tableSetting,
                onColumnsChange: handlers.onColumnsChange,
                //
                clearSelectedRowKeys: methods.clearSelectedRowKeys,
                count: methods.getSelectRowKeys().length,
                showSelectionBar,
              } as Recordable,
              {
                ...(slots.toolbar
                  ? {
                      toolbar: () => getSlot(slots, 'toolbar'),
                    }
                  : {}),
                ...(slots.tableTitle
                  ? {
                      tableTitle: () => getSlot(slots, 'tableTitle'),
                    }
                  : {}),
                ...(slots.headerTop
                  ? {
                      headerTop: () => getSlot(slots, 'headerTop'),
                    }
                  : {}),
              },
            ),
    };
  });
  // 返回标题属性
  return { getHeaderProps };
}
