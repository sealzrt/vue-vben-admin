import { type Menu } from '@/router/types';
import { type AnyFunction } from '@vben/types';
import { ref, onBeforeMount, unref, Ref, nextTick } from 'vue';
import { getMenus } from '@/router/menus';
import { cloneDeep } from 'lodash-es';
import { filter, forEach } from '@/utils/helper/treeHelper';
import { useGo } from '@/hooks/web/usePage';
import { useScrollTo } from '@vben/hooks';
import { onKeyStroke, useDebounceFn } from '@vueuse/core';
import { useI18n } from '@/hooks/web/useI18n';

export interface SearchResult {
  name: string;
  path: string;
  icon?: string;
}

// Translate special characters
function transform(c: string) {
  const code: string[] = ['$', '(', ')', '*', '+', '.', '[', ']', '?', '\\', '^', '{', '}', '|'];
  return code.includes(c) ? `\\${c}` : c;
}

function createSearchReg(key: string) {
  const keys = [...key].map((item) => transform(item));
  const str = ['', ...keys, ''].join('.*');
  return new RegExp(str);
}

/**
 * 查询菜单
 * @param refs 菜单item ref
 * @param scrollWrap 菜单 wrapper ref
 * @param emit
 */
export function useMenuSearch(refs: Ref<HTMLElement[]>, scrollWrap: Ref, emit: AnyFunction) {
  // 声明一个类型为SearchResult的数组，用于存储搜索结果
  const searchResult = ref<SearchResult[]>([]);
  // 声明一个字符串，用于存储搜索关键字
  const keyword = ref('');
  // 声明一个整型，用于存储当前激活的搜索结果的索引
  const activeIndex = ref(-1);

  let menuList: Menu[] = [];

  const { t } = useI18n();
  // 路由跳转工具
  const go = useGo();

  const handleSearch = useDebounceFn(search, 200);

  // 在组件挂载之前执行
  onBeforeMount(async () => {
    // 获取菜单列表
    const list = await getMenus();
    // 深拷贝菜单列表
    menuList = cloneDeep(list);
    // 遍历菜单列表，将每一个菜单项的名称 根据多语言 进行翻译
    forEach(menuList, (item) => {
      item.name = t(item.name);
    });
  });

  // 函数search：处理搜索事件
  function search(e: ChangeEvent) {
    // 阻止事件冒泡
    e?.stopPropagation();
    // 获取搜索关键字
    const key = e.target.value;
    // 去除关键字前后空格
    keyword.value = key.trim();
    // 如果关键字为空，则清空搜索结果
    if (!key) {
      searchResult.value = [];
      return;
    }
    // 创建搜索正则
    const reg = createSearchReg(unref(keyword));
    // 过滤菜单列表
    const filterMenu = filter(menuList, (item) => {
      return reg.test(item.name) && !item.hideMenu;
    });
    // 处理搜索结果
    searchResult.value = handlerSearchResult(filterMenu, reg);
    // 设置激活菜单项
    activeIndex.value = 0;
  }

  function handlerSearchResult(filterMenu: Menu[], reg: RegExp, parent?: Menu) {
    const ret: SearchResult[] = [];
    filterMenu.forEach((item) => {
      const { name, path, icon, children, hideMenu, meta } = item;
      if (!hideMenu && reg.test(name) && (!children?.length || meta?.hideChildrenInMenu)) {
        ret.push({
          name: parent?.name ? `${parent.name} > ${name}` : name,
          path,
          icon,
        });
      }
      if (!meta?.hideChildrenInMenu && Array.isArray(children) && children.length) {
        ret.push(...handlerSearchResult(children, reg, item));
      }
    });
    return ret;
  }

  // Activate when the mouse moves to a certain line
  // 当鼠标移入时触发handleMouseenter函数
  function handleMouseenter(e: any) {
    // 获取触发事件的元素dataset中的index
    const index = e.target.dataset.index;
    // 将activeIndex的值设置为index
    activeIndex.value = Number(index);
  }

  // Arrow key up
  function handleUp() {
    // 如果搜索结果没有值，则直接返回
    if (!searchResult.value.length) return;
    // 将激活索引减一
    activeIndex.value--;
    // 如果激活索引小于0，则将激活索引设置为搜索结果的最后一位
    if (activeIndex.value < 0) {
      activeIndex.value = searchResult.value.length - 1;
    }
    // 调用handleScroll函数
    handleScroll();
  }

  // Arrow key down
  function handleDown() {
    if (!searchResult.value.length) return;
    activeIndex.value++;
    if (activeIndex.value > searchResult.value.length - 1) {
      activeIndex.value = 0;
    }
    handleScroll();
  }

  // When the keyboard up and down keys move to an invisible place
  // the scroll bar needs to scroll automatically
  function handleScroll() {
    const refList = unref(refs);
    if (!refList || !Array.isArray(refList) || refList.length === 0 || !unref(scrollWrap)) {
      return;
    }

    const index = unref(activeIndex);
    const currentRef = refList[index];
    if (!currentRef) {
      return;
    }
    const wrapEl = unref(scrollWrap);
    if (!wrapEl) {
      return;
    }
    const scrollHeight = currentRef.offsetTop + currentRef.offsetHeight;
    const wrapHeight = wrapEl.offsetHeight;
    const { start } = useScrollTo({
      el: wrapEl,
      duration: 100,
      to: scrollHeight - wrapHeight,
    });
    start();
  }

  // enter keyboard event
  async function handleEnter() {
    if (!searchResult.value.length) {
      return;
    }
    const result = unref(searchResult);
    const index = unref(activeIndex);
    if (result.length === 0 || index < 0) {
      return;
    }
    const to = result[index];
    handleClose();
    await nextTick();
    go(to.path);
  }

  // close search modal
  function handleClose() {
    searchResult.value = [];
    emit('close');
  }

  // enter search
  onKeyStroke('Enter', handleEnter);
  // Monitor keyboard arrow keys
  onKeyStroke('ArrowUp', handleUp);
  onKeyStroke('ArrowDown', handleDown);
  // esc close
  onKeyStroke('Escape', handleClose);

  return { handleSearch, searchResult, keyword, activeIndex, handleMouseenter, handleEnter };
}
