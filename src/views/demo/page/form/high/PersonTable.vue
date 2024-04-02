<template>
  <div>
    <BasicTable @register="registerTable" @edit-change="handleEditChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction :actions="createActions(record)" />
        </template>
      </template>
    </BasicTable>
    <a-button block class="mt-5" type="dashed" @click="handleAdd"> 新增成员</a-button>
  </div>
</template>
<script lang="ts" setup>
  import {
    BasicTable,
    useTable,
    TableAction,
    BasicColumn,
    ActionItem,
    EditRecordRow,
  } from '@/components/Table';

  const columns: BasicColumn[] = [
    {
      title: '成员姓名',
      dataIndex: 'name',
      editRow: true,
    },
    {
      title: '工号',
      dataIndex: 'no',
      editRow: true,
    },
    {
      title: '所属部门',
      dataIndex: 'dept',
      editRow: true,
    },
  ];

  const data: any[] = [
    {
      name: 'John Brown',
      no: '00001',
      dept: 'New York No. 1 Lake Park',
    },
    {
      name: 'John Brown2',
      no: '00002',
      dept: 'New York No. 2 Lake Park',
    },
    {
      name: 'John Brown3',
      no: '00003',
      dept: 'New York No. 3Lake Park',
    },
  ];

  const [registerTable, { getDataSource }] = useTable({
    // 列描述信息
    columns: columns,
    // 是否显示索引列
    showIndexColumn: false,
    // 数据源
    dataSource: data,
    // 操作列描述信息
    actionColumn: {
      width: 160,
      title: '操作',
      dataIndex: 'action',
      // slots: { customRender: 'action' },
    },
    // 滚动条
    scroll: { y: '100%' },
    // 分页
    pagination: false,
  });

  /*** 暴露getDataSource 供父组件使用 ***/
  defineExpose({ getDataSource });

  // 函数handleEdit用于处理编辑操作
  function handleEdit(record: EditRecordRow) {
    // 调用record的onEdit方法，传入参数true
    record.onEdit?.(true);
  }

  // 函数handleCancel用于处理取消操作
  function handleCancel(record: EditRecordRow) {
    // 调用record的onEdit方法，传入参数false
    record.onEdit?.(false);
    // 如果record是新添加的，从数据源中删除该记录
    if (record.isNew) {
      const data = getDataSource();
      const index = data.findIndex((item) => item.key === record.key);
      data.splice(index, 1);
    }
  }

  // 函数handleSave用于处理保存操作
  function handleSave(record: EditRecordRow) {
    // 调用record的onEdit方法，传入参数false和true
    record.onEdit?.(false, true);
  }

  // 函数handleEditChange用于处理编辑变化
  function handleEditChange(data: Recordable) {
    console.log(data);
  }

  // 函数handleAdd用于处理添加操作
  function handleAdd() {
    // 从数据源中获取数据
    const data = getDataSource();
    // 创建一个新的记录
    const addRow: EditRecordRow = {
      name: '',
      no: '',
      dept: '',
      editable: true,
      isNew: true,
      key: `${Date.now()}`,
    };
    // 将新记录添加到数据源中
    data.push(addRow);
  }

  // 函数createActions用于创建操作的配置数据
  function createActions(record: EditRecordRow): ActionItem[] {
    // 如果record不可编辑，则返回编辑和删除操作
    if (!record.editable) {
      return [
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
        },
        {
          label: '删除',
        },
      ];
    }
    // 如果record可编辑，则返回保存和取消操作
    return [
      {
        label: '保存',
        onClick: handleSave.bind(null, record),
      },
      {
        label: '取消',
        popConfirm: {
          title: '是否取消编辑',
          confirm: handleCancel.bind(null, record),
        },
      },
    ];
  }
</script>
