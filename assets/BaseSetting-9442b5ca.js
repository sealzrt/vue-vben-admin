var _=(o,m,a)=>new Promise((u,i)=>{var d=t=>{try{r(a.next(t))}catch(n){i(n)}},l=t=>{try{r(a.throw(t))}catch(n){i(n)}},r=t=>t.done?u(t.value):Promise.resolve(t.value).then(d,l);r((a=a.apply(o,m)).next())});import{_ as g}from"./BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js";import"./BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js";import"./componentMap-e24e33c4.js";import{u as h}from"./useForm-c38c055a.js";import{l as C,C as I,a as S,c as b}from"./entry/index-1163f12d-1703821863576.js";import{C as x}from"./index-b1f4e6cf.js";import{h as A}from"./header-55b09394.js";import{a as B}from"./account-703345c2.js";import{b as w}from"./data-15304551.js";import{u as y}from"./upload-2b0f55a1.js";import{d as U,o as R,c as V,a7 as k,Z as M,a8 as N,a9 as p,l as s,u as e,$ as v,E,a2 as F,a3 as T}from"./vue-d56f5f31.js";import{R as $,U as f}from"./antd-090f1744.js";import"./FormItem.vue_vue_type_script_lang-a47ce972.js";import"./helper-794fc484.js";import"./index-0ed07fa9.js";import"./useWindowSizeFn-ab2a372a.js";import"./useFormItem-8d47235f.js";import"./RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js";import"./uuid-31b8b5a4.js";import"./useSortable-c882fe9a.js";import"./download-80f35978.js";import"./base64Conver-39fc0d26.js";import"./index-a220e839.js";import"./IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js";import"./copyTextToClipboard-0869443b.js";import"./index-46c9858a.js";const G=o=>(F("data-v-73a9c434"),o=o(),T(),o),P={class:"change-avatar"},W=G(()=>v("div",{class:"mb-2"},"头像",-1)),Z=U({__name:"BaseSetting",setup(o){const{createMessage:m}=S(),a=C(),[u,{setFieldsValue:i}]=h({labelWidth:120,schemas:w,showActionButtonGroup:!1});R(()=>_(this,null,function*(){const t=yield B();i(t)}));const d=V(()=>{const{avatar:t}=a.getUserInfo;return t||A});function l({src:t,data:n}){const c=a.getUserInfo;c.avatar=t,a.setUserInfo(c)}function r(){m.success("更新成功！")}return(t,n)=>{const c=k("a-button");return M(),N(e(I),{title:"基本设置",canExpan:!1},{default:p(()=>[s(e($),{gutter:24},{default:p(()=>[s(e(f),{span:14},{default:p(()=>[s(e(g),{onRegister:e(u)},null,8,["onRegister"])]),_:1}),s(e(f),{span:10},{default:p(()=>[v("div",P,[W,s(e(x),{uploadApi:e(y),value:d.value,btnText:"更换头像",btnProps:{preIcon:"ant-design:cloud-upload-outlined"},onChange:l,width:"150"},null,8,["uploadApi","value"])])]),_:1})]),_:1}),s(c,{type:"primary",onClick:r},{default:p(()=>[E(" 更新基本信息 ")]),_:1})]),_:1})}}});const ft=b(Z,[["__scopeId","data-v-73a9c434"]]);export{ft as default};
