<script lang="tsx">
  import { defineComponent, ref, unref } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import AppSearchModal from './AppSearchModal.vue';
  import { useI18n } from '@/hooks/web/useI18n';

  /**
   * 搜索框组件
   */
  export default defineComponent({
    name: 'AppSearch',
    setup() {
      const showModal = ref(false);
      // 多语言函数
      const { t } = useI18n();

      function changeModal(show: boolean) {
        showModal.value = show;
      }

      return () => {
        return (
          <div class="p-1" onClick={changeModal.bind(null, true)}>
            <Tooltip>
              {{
                title: () => t('common.searchText'),
                default: () => <SearchOutlined />,
              }}
            </Tooltip>
            <AppSearchModal onClose={changeModal.bind(null, false)} visible={unref(showModal)} />
          </div>
        );
      };
    },
  });
</script>
