<!--
 * @Author: Vben
 * @Description: Multi-language switching component
-->
<template>
  <Dropdown
    placement="bottom"
    :trigger="['click']"
    :dropMenuList="localeList"
    :selectedKeys="selectedKeys"
    @menu-event="handleMenuEvent"
    overlayClassName="app-locale-picker-overlay"
  >
    <span class="cursor-pointer flex items-center">
      <Icon icon="ion:language" />
      <span v-if="showText" class="ml-1">{{ getLocaleText }}</span>
    </span>
  </Dropdown>
</template>
<script lang="ts" setup>
  import type { LocaleType } from '#/config';
  import type { DropMenu } from '@/components/Dropdown';
  import { ref, watchEffect, unref, computed } from 'vue';
  import { Dropdown } from '@/components/Dropdown';
  import Icon from '@/components/Icon/Icon.vue';
  import { useLocale } from '@/locales/useLocale';
  import { localeList } from '@/settings/localeSetting';

  const props = defineProps({
    /**
     * Whether to display text
     */
    showText: { type: Boolean, default: true },
    /**
     * Whether to refresh the interface when changing
     */
    reload: { type: Boolean },
  });

  // 定义一个变量selectedKeys，类型为string[]，用于存储选中的key
  const selectedKeys = ref<string[]>([]);

  // 使用useLocale()函数，获取changeLocale和getLocale函数
  const { changeLocale, getLocale } = useLocale();

  // 定义一个计算属性getLocaleText，用于获取当前选中的key对应的文本
  const getLocaleText = computed(() => {
    // 获取当前选中的key
    const key = selectedKeys.value[0];
    // 如果没有选中key，则返回空字符串
    if (!key) {
      return '';
    }
    // 遍历localeList，找到与当前key相等的项，返回该项的text
    return localeList.find((item) => item.event === key)?.text;
  });

  // 监听getLocale的改变，将改变后的值赋值给selectedKeys
  watchEffect(() => {
    selectedKeys.value = [unref(getLocale)];
  });

  // 定义一个异步函数toggleLocale，用于切换语言
  async function toggleLocale(lang: LocaleType | string) {
    // 调用changeLocale函数，切换语言
    await changeLocale(lang as LocaleType);
    // 将切换后的语言赋值给selectedKeys
    selectedKeys.value = [lang as string];
    // 如果reload为true，则刷新页面
    props.reload && location.reload();
  }

  // 定义一个函数handleMenuEvent，用于处理菜单事件
  function handleMenuEvent(menu: DropMenu) {
    // 如果当前选中的key与传入的menu.event相等，则不执行任何操作
    if (unref(getLocale) === menu.event) {
      return;
    }
    // 调用toggleLocale函数，切换语言
    toggleLocale(menu.event as string);
  }
</script>

<style lang="less">
  .app-locale-picker-overlay {
    .ant-dropdown-menu-item {
      min-width: 160px;
    }
  }
</style>
