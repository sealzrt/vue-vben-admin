<template>
  <div :class="[prefixCls, getAlign]" @click="onCellClick">
    <template v-for="(action, index) in getActions" :key="`${index}-${action.label}`">
      <Tooltip v-if="action.tooltip" v-bind="getTooltip(action.tooltip)">
        <PopConfirmButton v-bind="omit(action, 'icon')">
          <Icon :icon="action.icon" :class="{ 'mr-1': !!action.label }" v-if="action.icon" />
          <template v-if="action.label">{{ action.label }}</template>
        </PopConfirmButton>
      </Tooltip>
      <PopConfirmButton v-else v-bind="omit(action, 'icon')">
        <Icon :icon="action.icon" :class="{ 'mr-1': !!action.label }" v-if="action.icon" />
        <template v-if="action.label">{{ action.label }}</template>
      </PopConfirmButton>
      <Divider
        type="vertical"
        class="action-divider"
        v-if="divider && index < getActions.length - 1"
      />
    </template>
    <Dropdown
      :trigger="['hover']"
      :dropMenuList="getDropdownList"
      popconfirm
      v-if="dropDownActions && getDropdownList.length > 0"
    >
      <slot name="more"></slot>
      <a-button type="link" size="small" v-if="!$slots.more">
        <MoreOutlined class="icon-more" />
      </a-button>
    </Dropdown>
  </div>
</template>
<script lang="ts" setup>
  import { PropType, computed, toRaw, unref } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import { Divider, Tooltip, TooltipProps } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { ActionItem, TableActionType } from '@/components/Table';
  import { PopConfirmButton } from '@/components/Button';
  import { Dropdown } from '@/components/Dropdown';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useTableContext } from '../hooks/useTableContext';
  import { usePermission } from '@/hooks/web/usePermission';
  import { isBoolean, isFunction, isString } from '@/utils/is';
  import { propTypes } from '@/utils/propTypes';
  import { ACTION_COLUMN_FLAG } from '../const';
  import { omit } from 'lodash-es';

  defineOptions({ name: 'TableAction' });

  // 定义props属性
  const props = defineProps({
    // actions类型为ActionItem数组，默认值为null
    actions: {
      type: Array as PropType<ActionItem[]>,
      default: null,
    },
    // dropDownActions类型为ActionItem数组，默认值为null
    dropDownActions: {
      type: Array as PropType<ActionItem[]>,
      default: null,
    },
    // divider类型为bool，默认值为true
    divider: propTypes.bool.def(true),
    // outside类型为bool, 操作按钮 是否在BasicTable外部 提供
    outside: propTypes.bool,
    // stopButtonPropagation类型为bool，默认值为false
    stopButtonPropagation: propTypes.bool.def(false),
  });

  const { prefixCls } = useDesign('basic-table-action');
  let table: Partial<TableActionType> = {};
  if (!props.outside) {
    table = useTableContext();
  }

  const { hasPermission } = usePermission();

  function isIfShow(action: ActionItem): boolean {
    const ifShow = action.ifShow;

    let isIfShow = true;

    if (isBoolean(ifShow)) {
      isIfShow = ifShow;
    }
    if (isFunction(ifShow)) {
      isIfShow = ifShow(action);
    }
    return isIfShow;
  }

  // 计算属性，用于获取操作按钮
  const getActions = computed(() => {
    // 获取传入的actions属性，如果没有则设置为空数组
    return (
      (toRaw(props.actions) || [])
        // 过滤掉没有权限和不需要显示的操作按钮
        .filter((action) => {
          return hasPermission(action.auth) && isIfShow(action);
        })
        // 将操作按钮映射成一个新的对象
        .map((action) => {
          // 获取操作按钮的popConfirm属性
          const { popConfirm } = action;
          // 返回一个新的对象
          return {
            // 获取弹出框的父元素
            getPopupContainer: () => unref((table as any)?.wrapRef) ?? document.body,
            // 类型为link
            type: 'link',
            // 尺寸为small
            size: 'small',
            // 合并传入的操作按钮属性
            ...action,
            // 合并传入的popConfirm属性
            ...(popConfirm || {}),
            // 确认事件
            onConfirm: popConfirm?.confirm,
            // 取消事件
            onCancel: popConfirm?.cancel,
            // 是否启用
            enable: !!popConfirm,
          };
        })
    );
  });

  // 计算属性getDropdownList，用于获取下拉列表的操作按钮
  const getDropdownList = computed((): any[] => {
    // 获取props中的dropDownActions属性，如果没有则赋值为空数组
    const list = (toRaw(props.dropDownActions) || []).filter((action) => {
      // 判断是否有权限，并且是否显示
      return hasPermission(action.auth) && isIfShow(action);
    });
    // 遍历list，将action中的label和popConfirm属性映射到新的对象中
    return list.map((action, index) => {
      const { label, popConfirm } = action;
      // 返回新的对象
      return {
        ...action,
        ...popConfirm,
        onConfirm: popConfirm?.confirm,
        onCancel: popConfirm?.cancel,
        text: label,
        // 判断是否为最后一个元素，如果是则不显示分割线
        divider: index < list.length - 1 ? props.divider : false,
      };
    });
  });

  // 定义一个函数getAlign，它是一个计算属性，用于获取表格中操作列的对其方式
  const getAlign = computed(() => {
    // 获取表格的列信息，如果没有则默认为空数组
    const columns = (table as TableActionType)?.getColumns?.() || [];
    // 查找标记为ACTION_COLUMN_FLAG的列
    const actionColumn = columns.find((item) => item.flag === ACTION_COLUMN_FLAG);
    // 如果没有找到，则默认值为'left'
    return actionColumn?.align ?? 'left';
  });

  // 定义一个函数，用于获取tooltip的属性
  function getTooltip(data: string | TooltipProps): TooltipProps {
    // 返回一个对象，用于设置tooltip的属性
    return {
      // 获取弹出框的容器，如果table存在wrapRef，则使用table的wrapRef，否则使用document.body
      getPopupContainer: () => unref((table as any)?.wrapRef) ?? document.body,
      // 设置tooltip的位置为bottom
      placement: 'bottom',
      // 如果data是字符串，则设置tooltip的title为data，否则使用data中的属性
      ...(isString(data) ? { title: data } : data),
    };
  }

  // 当单元格被点击时触发
  function onCellClick(e: MouseEvent) {
    // 如果stopButtonPropagation属性为false，则直接返回
    if (!props.stopButtonPropagation) return;
    // 获取点击事件的路径
    const path = e.composedPath() as HTMLElement[];
    // 遍历路径，查找是否有按钮元素
    const isInButton = path.find((ele) => {
      return ele.tagName?.toUpperCase() === 'BUTTON';
    });
    // 如果找到了按钮元素，则阻止事件传播
    isInButton && e.stopPropagation();
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-basic-table-action';

  .@{prefix-cls} {
    display: flex;
    align-items: center;

    .action-divider {
      display: table;
    }

    &.left {
      justify-content: flex-start;
    }

    &.center {
      justify-content: center;
    }

    &.right {
      justify-content: flex-end;
    }

    button {
      display: flex;
      align-items: center;

      span {
        margin-left: 0 !important;
      }
    }

    button.ant-btn-circle {
      span {
        margin: auto !important;
      }
    }

    .ant-divider,
    .ant-divider-vertical {
      margin: 0 2px;
    }

    .icon-more {
      transform: rotate(90deg);

      svg {
        font-size: 1.1em;
        font-weight: 700;
      }
    }
  }
</style>
