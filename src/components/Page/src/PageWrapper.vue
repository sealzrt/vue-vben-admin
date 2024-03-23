<template>
  <div :class="getClass" ref="wrapperRef">
    <!--
      $attrs 是一个对象，包含了父组件传递给子组件的所有非props属性。
      omit: 表示要从对象中删除某一些属性
    -->
    <PageHeader
      :ghost="ghost"
      :title="title"
      v-bind="omit($attrs, 'class')"
      :style="getHeaderStyle"
      ref="headerRef"
      v-if="getShowHeader"
    >
      <!-- 模板块, 定义了 PageHeader 组件的默认插槽内容。-->
      <template #default>
        <template v-if="content">
          {{ content }}
        </template>
        <!-- 如果else条件为真，则渲染当前组件 PageWrapper 的headerContent插槽 -->
        <!-- <slot> 标签用于定义插槽的占位符，等待父组件提供插槽的内容 -->
        <slot name="headerContent" v-else></slot>
      </template>
      <!-- 遍历 getHeaderSlots 计算属性，根据数组中的值动态创建 PageHeader 组件的 动态命名作用域插槽-->
      <!-- 对于每个 item，创建一个当前组件 PageWrapper 的命名作用域插槽，插槽名称与 item 的值相同。将 data 对象（如果 data 为假，则使用空对象）绑定到插槽-->
      <template #[item]="data" v-for="item in getHeaderSlots">
        <!-- <slot> 标签用于定义插槽的占位符，等待父组件提供插槽的内容 -->
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </PageHeader>

    <div class="overflow-hidden" :class="getContentClass" :style="getContentStyle" ref="contentRef">
      <slot></slot>
    </div>

    <PageFooter v-if="getShowFooter" ref="footerRef">
      <template #left>
        <slot name="leftFooter"></slot>
      </template>
      <template #right>
        <slot name="rightFooter"></slot>
      </template>
    </PageFooter>
  </div>
</template>
<script lang="ts" setup>
  import { PageWrapperFixedHeightKey } from '@/enums/pageEnum';
  import { useContentHeight } from '@/hooks/web/useContentHeight';
  import { useDesign } from '@/hooks/web/useDesign';
  import { propTypes } from '@/utils/propTypes';
  import { PageHeader } from 'ant-design-vue';
  import { omit } from 'lodash-es';
  import {
    CSSProperties,
    PropType,
    computed,
    provide,
    ref,
    unref,
    useAttrs,
    useSlots,
    watch,
  } from 'vue';
  import PageFooter from './PageFooter.vue';

  /**
   * PageWrapper组件能够接收并验证多个属性，如标题、是否紧密排列、是否透明等；
   * 能够获取父组件传递的属性及插槽；能够计算组件的类名、header样式等；
   * 能够监听函数及重新计算页面高度
   */
  defineOptions({
    name: 'PageWrapper',
    inheritAttrs: false,
  });

  const props = defineProps({
    // 标题
    title: propTypes.string,
    // 是否紧密排列
    dense: propTypes.bool,
    // 是否透明
    ghost: propTypes.bool,
    // 是否固定顶部
    headerSticky: propTypes.bool,
    // 头部样式
    headerStyle: Object as PropType<CSSProperties>,
    // 内容
    content: propTypes.string,
    // 内容样式
    contentStyle: {
      type: Object as PropType<CSSProperties>,
    },
    // 是否有背景
    contentBackground: propTypes.bool,
    // 是否全屏高度
    contentFullHeight: propTypes.bool.def(false),
    // 内容类
    contentClass: propTypes.string,
    // 是否固定高度
    fixedHeight: propTypes.bool,
    // 上方间距
    upwardSpace: propTypes.oneOfType([propTypes.number, propTypes.string]).def(0),
  });

  // useAttrs：这个函数用于获取当前组件的attrs。在 Vue.js 2 中，组件的属性是通过 this.attrs 访问的。
  // 但在 Vue.js 3 中，this 不再指向组件实例，因此需要使用 useAttrs 函数来获取属性。useAttrs 函数返回一个对象，其中包含所有属性
  const attrs = useAttrs();
  // useSlots：这个函数用于获取当前组件的插槽（slots）。插槽是 Vue.js 中一种特殊的模板，用于在父组件中插入子组件的内容。在 Vue.js 2 中，插槽是通过 this.$slots 访问的。
  // 但在 Vue.js 3 中，this 不再指向组件实例，因此需要使用 useSlots 函数来获取插槽。useSlots 函数返回一个对象，其中包含所有插槽。
  const slots = useSlots();

  // 定义四个ref，分别用于获取wrapper、header、content、footer的DOM元素
  const wrapperRef = ref(null);
  const headerRef = ref(null);
  const contentRef = ref(null);
  const footerRef = ref(null);
  // 使用useDesign函数获取prefixCls
  const { prefixCls } = useDesign('page-wrapper');

  // 向子组件提供固定高度的数据
  provide(
    PageWrapperFixedHeightKey,
    computed(() => props.fixedHeight),
  );

  // 计算属性，获取props中的contentFullHeight属性
  const getIsContentFullHeight = computed(() => {
    return props.contentFullHeight;
  });

  // 计算属性，获取upwardSpace的值
  const getUpwardSpace = computed(() => props.upwardSpace);

  // 使用useContentHeight函数，获取redoHeight、setCompensation、contentHeight的值
  const { redoHeight, setCompensation, contentHeight } = useContentHeight(
    // 获取isContentFullHeight的值
    getIsContentFullHeight,
    // 获取wrapperRef的值
    wrapperRef,
    // 获取headerRef、footerRef的值
    [headerRef, footerRef],
    // 获取contentRef的值
    [contentRef],
    // 获取getUpwardSpace的值
    getUpwardSpace,
  );

  setCompensation({ useLayoutFooter: true, elements: [footerRef] });

  // 计算属性 getClass，用于获取组件的类名
  const getClass = computed(() => {
    // 返回一个数组，包含组件的前缀类名、根据 props.dense 生成的类名、attrs.class 或者 {}
    return [
      prefixCls,
      {
        [`${prefixCls}--dense`]: props.dense,
      },
      attrs.class ?? {},
    ];
  });

  // 计算属性，用于获取header的样式
  const getHeaderStyle = computed((): CSSProperties => {
    // 获取props中的headerSticky属性
    const { headerSticky } = props;
    // 如果headerSticky属性为false，则返回空对象
    if (!headerSticky) {
      return {};
    }

    // 否则，返回一个包含position: 'sticky', top: 0, zIndex: 99属性的对象
    // 同时，将props中的headerStyle属性合并到这个对象中
    return {
      position: 'sticky',
      top: 0,
      zIndex: 99,
      ...props.headerStyle,
    };
  });

  const getShowHeader = computed(
    () => props.content || slots?.headerContent || props.title || getHeaderSlots.value.length,
  );

  const getShowFooter = computed(() => slots?.leftFooter || slots?.rightFooter);

  const getHeaderSlots = computed(() => {
    return Object.keys(omit(slots, 'default', 'leftFooter', 'rightFooter', 'headerContent'));
  });

  const getContentStyle = computed((): CSSProperties => {
    const { contentFullHeight, contentStyle, fixedHeight } = props;
    if (!contentFullHeight) {
      return { ...contentStyle };
    }

    const height = `${unref(contentHeight)}px`;
    return {
      ...contentStyle,
      minHeight: height,
      ...(fixedHeight ? { height } : {}),
    };
  });

  const getContentClass = computed(() => {
    const { contentBackground, contentClass } = props;
    return [
      `${prefixCls}-content`,
      contentClass,
      {
        [`${prefixCls}-content-bg`]: contentBackground,
      },
    ];
  });

  // 监听函数，当getShowFooter.value的值发生变化时，执行redoHeight()函数
  watch(
    () => [getShowFooter.value],
    () => {
      redoHeight();
    },
    {
      // 在渲染后执行，而不是在渲染前执行
      flush: 'post',
      // 立即执行
      immediate: true,
    },
  );
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-page-wrapper';

  .@{prefix-cls} {
    position: relative;

    .@{prefix-cls}-content {
      margin: 16px;
    }

    .ant-page-header {
      &:empty {
        padding: 0;
      }
    }

    &-content-bg {
      background-color: @component-background;
    }

    &--dense {
      .@{prefix-cls}-content {
        margin: 0;
      }
    }
  }
</style>
