import{I as d}from"./index-dab6bb8a.js";import{_}from"./BasicTable.vue_vue_type_script_setup_true_lang-5c055b72.js";import"./TableImg.vue_vue_type_style_index_0_lang-00dde315.js";import"./componentMap-e24e33c4.js";import{P as x}from"./index-9f5f841f.js";import{d as h,f as S,a7 as E,Z as a,a8 as l,a9 as m,l as u,u as s,E as k,_ as v,F as D,aa as I}from"./vue-d56f5f31.js";import"./entry/index-1163f12d-1703821863576.js";import"./antd-090f1744.js";import"./index-0ed07fa9.js";import"./useWindowSizeFn-ab2a372a.js";import"./BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js";import"./FormItem.vue_vue_type_script_lang-a47ce972.js";import"./helper-794fc484.js";import"./BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js";import"./useForm-c38c055a.js";import"./uuid-31b8b5a4.js";import"./sortable.esm-4ae27e0b.js";import"./RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js";import"./useFormItem-8d47235f.js";import"./onMountedOrActivated-60a5193f.js";import"./useSortable-c882fe9a.js";import"./download-80f35978.js";import"./base64Conver-39fc0d26.js";import"./index-a220e839.js";import"./IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js";import"./copyTextToClipboard-0869443b.js";import"./index-46c9858a.js";import"./index-b1f4e6cf.js";import"./useContentViewHeight-17e909ee.js";const tt=h({__name:"ImportExcel",setup(Y){const o=S([]);function f(p){o.value=[];for(const i of p){const{header:e,results:t,meta:{sheetName:r}}=i,c=[];for(const n of e)c.push({title:n,dataIndex:n});o.value.push({title:r,dataSource:t,columns:c})}}return(p,i)=>{const e=E("a-button");return a(),l(s(x),{title:"excel数据导入示例"},{default:m(()=>[u(s(d),{onSuccess:f,dateFormat:"YYYY-MM-DD"},{default:m(()=>[u(e,{class:"m-3"},{default:m(()=>[k(" 导入Excel ")]),_:1})]),_:1}),(a(!0),v(D,null,I(o.value,(t,r)=>(a(),l(s(_),{key:r,title:t.title,columns:t.columns,dataSource:t.dataSource},null,8,["title","columns","dataSource"]))),128))]),_:1})}}});export{tt as default};
