<template>
  <PageWrapper
    title="基础表单"
    contentBackground
    content=" 表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。"
    contentClass="p-4"
  >
    <BasicForm @register="register" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '@/components/Form';
  import { schemas } from './data';
  import { useMessage } from '@/hooks/web/useMessage';
  import { PageWrapper } from '@/components/Page';

  defineOptions({ name: 'FormBasicPage' });

  const { createMessage } = useMessage();
  // debugger
  const [register, { validate, setProps }] = useForm({
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 15,
    },
    schemas: schemas,
    actionColOptions: {
      offset: 8,
      span: 23,
    },
    submitButtonOptions: {
      text: '提交',
    },
    submitFunc: customSubmitFunc,
  });

  async function customSubmitFunc() {
    try {
      // 执行校验函数
      await validate();
      // 设置提交按钮的属性
      setProps({
        submitButtonOptions: {
          loading: true,
        },
      });
      // 设置延时函数，2s后将提交按钮的loading属性设置为false，并显示提交成功的消息
      setTimeout(() => {
        setProps({
          submitButtonOptions: {
            loading: false,
          },
        });
        createMessage.success('提交成功！');
      }, 2000);
    } catch (error) {
      // 打印错误信息
      console.error(error);
    }
  }
</script>
<style lang="less" scoped>
  .form-wrap {
    padding: 24px;
    background-color: @component-background;
  }
</style>
