import{_ as d}from"./BasicTable.vue_vue_type_script_setup_true_lang-5c055b72.js";import"./TableImg.vue_vue_type_style_index_0_lang-00dde315.js";import"./componentMap-e24e33c4.js";import"./index-dab6bb8a.js";import{c as l,d as e,j as m,a as c}from"./data-f74679b8.js";import{P as u}from"./index-9f5f841f.js";import{d as f,a7 as _,Z as h,a8 as x,a9 as t,l as o,u as a,E as i}from"./vue-d56f5f31.js";import"./BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js";import"./FormItem.vue_vue_type_script_lang-a47ce972.js";import"./entry/index-1163f12d-1703821863576.js";import"./antd-090f1744.js";import"./helper-794fc484.js";import"./BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js";import"./index-0ed07fa9.js";import"./useWindowSizeFn-ab2a372a.js";import"./useForm-c38c055a.js";import"./uuid-31b8b5a4.js";import"./sortable.esm-4ae27e0b.js";import"./RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js";import"./useFormItem-8d47235f.js";import"./onMountedOrActivated-60a5193f.js";import"./useSortable-c882fe9a.js";import"./download-80f35978.js";import"./base64Conver-39fc0d26.js";import"./index-a220e839.js";import"./IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js";import"./copyTextToClipboard-0869443b.js";import"./index-46c9858a.js";import"./index-b1f4e6cf.js";import"./useContentViewHeight-17e909ee.js";const R=f({__name:"JsonExport",setup(S){function n(){m({data:e,filename:"使用key作为默认头部.xlsx"})}function s(){m({data:e,header:{id:"ID",name:"姓名",age:"年龄",no:"编号",address:"地址",beginTime:"开始时间",endTime:"结束时间"},filename:"自定义头部.xlsx",json2sheetOpts:{header:["name","id"]}})}function p(){c({sheetList:[{data:e,sheetName:"使用key作为默认头部"},{data:e,header:{id:"ID",name:"姓名",age:"年龄",no:"编号",address:"地址",beginTime:"开始时间",endTime:"结束时间"},json2sheetOpts:{header:["name","id"]},sheetName:"自定义头部"}],filename:"多Sheet导出示例.xlsx"})}return(k,T)=>{const r=_("a-button");return h(),x(a(u),{title:"导出示例",content:"根据JSON格式的数据进行导出"},{default:t(()=>[o(a(d),{title:"基础表格",columns:a(l),dataSource:a(e)},{toolbar:t(()=>[o(r,{onClick:n},{default:t(()=>[i(" 导出：默认头部 ")]),_:1}),o(r,{onClick:s},{default:t(()=>[i(" 导出：自定义头部 ")]),_:1}),o(r,{onClick:p,danger:""},{default:t(()=>[i(" 导出多Sheet ")]),_:1})]),_:1},8,["columns","dataSource"])]),_:1})}}});export{R as default};
