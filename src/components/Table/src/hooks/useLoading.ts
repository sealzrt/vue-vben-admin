import { ref, ComputedRef, unref, computed, watch } from 'vue';
import type { BasicTableProps } from '../types/table';

// 导出一个函数，用于获取表格的loading状态
export function useLoading(props: ComputedRef<BasicTableProps>) {
  // 创建一个变量，用于存储loading状态
  const loadingRef = ref(unref(props).loading);

  // 监听props中的loading状态，并将其赋值给loadingRef
  watch(
    () => unref(props).loading,
    (loading) => {
      loadingRef.value = loading;
    },
  );

  // 创建一个计算属性，用于获取loading状态
  const getLoading = computed(() => unref(loadingRef));

  // 创建一个函数，用于设置loading状态
  function setLoading(loading: boolean) {
    loadingRef.value = loading;
  }

  // 返回loading状态的计算属性和设置函数
  return { getLoading, setLoading };
}
