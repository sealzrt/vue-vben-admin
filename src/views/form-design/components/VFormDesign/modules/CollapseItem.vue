<template>
  <div :class="prefixCls">
    <draggable
      tag="ul"
      :model-value="list"
      v-bind="{
        // 设置组的名称，如果你有两个draggable，需要相互拖拽，这个group的那么需要一致才可以
        group: { name: 'form-draggable', pull: 'clone', put: false },
        // 是否开启内部排序
        sort: false,
        // 克隆
        clone: cloneItem,
        // 拖动的动画时长，在同一个draggable中有效，为0的时候表示没有动画效果
        animation: 180,
        // 当拖动列表单元时会生成一个副本作为影子单元来模拟被拖动单元排序的情况，此配置项就是来给这个影子单元添加一个class，我们可以通过这种方式来给影子元素进行编辑样式
        ghostClass: 'moving',
      }"
      item-key="type"
      @start="handleStart($event, list)"
      @add="handleAdd"
    >
      <template #item="{ element, index }">
        <li
          class="bs-box text-ellipsis"
          @dragstart="$emit('add-attrs', list, index)"
          @click="$emit('handle-list-push', element)"
        >
          <!-- <svg v-if="element.icon.indexOf('icon-') > -1" class="icon" aria-hidden="true">
            <use :xlink:href="`#${element.icon}`" />
          </svg> -->
          <Icon :icon="element.icon" />
          {{ element.label }}</li
        ></template
      >
    </draggable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, PropType } from 'vue';
  import { IVFormComponent } from '../../../typings/v-form-component';
  import draggable from 'vuedraggable';
  import Icon from '@/components/Icon/Icon.vue';
  import { useDesign } from '@/hooks/web/useDesign';

  export default defineComponent({
    name: 'CollapseItem',
    components: { draggable, Icon },
    props: {
      list: {
        type: [Array] as PropType<IVFormComponent[]>,
        default: () => [],
      },
      /**
       * 通过props传递函数, 和传递变量的方式一致 :handleListPush="handleListPushDrag"
       */
      handleListPush: {
        type: Function,
        default: null,
      },
    },
    setup(props, { emit }) {
      const { prefixCls } = useDesign('form-design-collapse-item');

      const state = reactive({});

      /**
       * 拖拽开始的事件
       * @param e
       * @param list1
       */
      const handleStart = (e: any, list1: IVFormComponent[]) => {
        emit('start', list1[e.oldIndex].component);
      };
      const handleAdd = (e: any) => {
        console.log(e);
      };
      // https://github.com/SortableJS/vue.draggable.next
      // https://github.com/SortableJS/vue.draggable.next/blob/master/example/components/custom-clone.vue
      const cloneItem = (one) => {
        return props.handleListPush(one);
      };
      return { prefixCls, state, handleStart, handleAdd, cloneItem };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-form-design-collapse-item';

  @import url('../styles/variable.less');

  .@{prefix-cls} {
    ul {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 0;
      padding: 5px;
      list-style: none;
      // background: #efefef;

      li {
        width: calc(50% - 6px);
        height: 36px;
        margin: 2.7px;
        padding: 8px 12px;
        transition: all 0.3s;
        border: 1px solid @border-color;
        border-radius: 3px;
        line-height: 20px;
        cursor: move;

        &:hover {
          position: relative;
          border: 1px solid @primary-color;
          // z-index: 1;
          box-shadow: 0 2px 6px @primary-color;
          color: @primary-color;
        }
      }
    }

    svg {
      display: inline !important;
    }
  }
</style>
