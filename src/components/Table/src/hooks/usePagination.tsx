import type { PaginationProps } from '../types/pagination';
import type { BasicTableProps } from '../types/table';
import { computed, unref, ref, ComputedRef, watch } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { isBoolean } from '@/utils/is';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../const';
import { useI18n } from '@/hooks/web/useI18n';

interface ItemRender {
  page: number;
  type: 'page' | 'prev' | 'next';
  originalElement: any;
}

function itemRender({ page, type, originalElement }: ItemRender) {
  if (type === 'prev') {
    return page === 0 ? null : <LeftOutlined />;
  } else if (type === 'next') {
    return page === 1 ? null : <RightOutlined />;
  }
  return originalElement;
}

/**
 * 分页
 * @param refProps
 */
export function usePagination(refProps: ComputedRef<BasicTableProps>) {
  // 使用 i18n
  const { t } = useI18n();

  // 定义一个 ref，用于存储分页配置
  const configRef = ref<PaginationProps>({});
  // 定义一个 ref，用于控制分页是否显示
  const show = ref(true);

  // 监听 refProps 的 pagination 属性
  watch(
    () => unref(refProps).pagination,
    (pagination) => {
      // 如果 pagination 是布尔值，并且为 false，则不进行任何操作
      if (!isBoolean(pagination) && pagination) {
        // 否则，将 pagination 的属性合并到 configRef 中
        configRef.value = {
          ...unref(configRef),
          ...(pagination ?? {}),
        };
      }
    },
  );

  // 定义一个 computed，用于获取分页信息
  const getPaginationInfo = computed((): PaginationProps | boolean => {
    // 获取 refProps 的 pagination 属性
    const { pagination } = unref(refProps);

    // 如果 show 的值为 false，或者 pagination 是布尔值，并且为 false，则返回 false
    if (!unref(show) || (isBoolean(pagination) && !pagination)) {
      return false;
    }

    // 否则，返回分页配置
    return {
      current: 1,
      size: 'small',
      defaultPageSize: PAGE_SIZE,
      showTotal: (total) => t('component.table.total', { total }),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      itemRender: itemRender,
      showQuickJumper: true,
      ...(isBoolean(pagination) ? {} : pagination),
      ...unref(configRef),
    };
  });

  // 定义一个函数，用于设置分页配置
  function setPagination(info: Partial<PaginationProps>) {
    // 获取分页信息
    const paginationInfo = unref(getPaginationInfo);
    // 将 info 合并到 paginationInfo 中
    configRef.value = {
      ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
      ...info,
    };
  }

  // 定义一个函数，用于获取分页配置
  function getPagination() {
    // 返回分页信息
    return unref(getPaginationInfo);
  }

  // 定义一个函数，用于获取分页是否显示
  function getShowPagination() {
    // 返回 show 的值
    return unref(show);
  }

  // 定义一个函数，用于设置分页是否显示
  async function setShowPagination(flag: boolean) {
    // 将 flag 设置到 show 中
    show.value = flag;
  }

  // 返回分页配置
  return { getPagination, getPaginationInfo, setShowPagination, getShowPagination, setPagination };
}
