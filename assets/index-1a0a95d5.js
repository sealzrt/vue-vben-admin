var h=Object.defineProperty,w=Object.defineProperties;var A=Object.getOwnPropertyDescriptors;var c=Object.getOwnPropertySymbols;var V=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable;var M=(e,o,t)=>o in e?h(e,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[o]=t,C=(e,o)=>{for(var t in o||(o={}))V.call(o,t)&&M(e,t,o[t]);if(c)for(var t of c(o))g.call(o,t)&&M(e,t,o[t]);return e},v=(e,o)=>w(e,A(o));var F=(e,o,t)=>new Promise((l,i)=>{var u=n=>{try{r(t.next(n))}catch(m){i(m)}},p=n=>{try{r(t.throw(n))}catch(m){i(m)}},r=n=>n.done?l(n.value):Promise.resolve(n.value).then(u,p);r((t=t.apply(e,o)).next())});import k from"./index-83fd65d9.js";import{a as D}from"./index-e9d0e7df.js";import S from"./JsonModal-d9cae8a8.js";import{M as U}from"./antd-090f1744.js";import{d as $,f as y,r as B,G as E,a7 as f,Z as G,a8 as J,a9 as b,l as d}from"./vue-d56f5f31.js";import{c as O}from"./entry/index-1163f12d-1703821863576.js";import"./FormRender-2f35e6ac.js";import"./index-238d1127.js";import"./formItemConfig-dfeb1f31.js";import"./componentMap-e24e33c4.js";import"./useFormItem-8d47235f.js";import"./RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js";import"./index-0ed07fa9.js";import"./useWindowSizeFn-ab2a372a.js";import"./uuid-31b8b5a4.js";import"./useSortable-c882fe9a.js";import"./download-80f35978.js";import"./base64Conver-39fc0d26.js";import"./index-a220e839.js";import"./IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js";import"./copyTextToClipboard-0869443b.js";import"./index-46c9858a.js";import"./index-b1f4e6cf.js";import"./useFormDesignState-0e07fca3.js";import"./PreviewCode-ed1ec6de.js";import"./index-af5adfcd.js";const N=$({name:"VFormPreview",components:{JsonModal:S,VFormCreate:k,Modal:U},setup(){const e=y(null),o=B({formModel:{},formConfig:{},visible:!1,fApi:{}}),t=r=>{D(r.schemas),o.formConfig=r,o.visible=!0},l=()=>{o.visible=!1,o.formModel={}},i=()=>F(this,null,function*(){var n,m,a,s;const r=yield(m=(n=o.fApi).submit)==null?void 0:m.call(n);(s=(a=e.value)==null?void 0:a.showModal)==null||s.call(a,r)}),u=r=>{},p=()=>{o.formModel={}};return v(C({handleGetData:i,handleCancel:l},E(o)),{showModal:t,jsonModal:e,onSubmit:u,onCancel:p})}});function P(e,o,t,l,i,u){const p=f("a-input"),r=f("VFormCreate"),n=f("JsonModal"),m=f("Modal");return G(),J(m,{title:"预览(支持布局)",open:e.visible,onOk:e.handleGetData,onCancel:e.handleCancel,okText:"获取数据",cancelText:"关闭",style:{top:"20px"},destroyOnClose:!0,width:900},{default:b(()=>[d(r,{"form-config":e.formConfig,fApi:e.fApi,"onUpdate:fApi":o[0]||(o[0]=a=>e.fApi=a),formModel:e.formModel,"onUpdate:formModel":o[1]||(o[1]=a=>e.formModel=a),onSubmit:e.onSubmit},{slotName:b(({formModel:a,field:s})=>[d(p,{value:a[s],"onUpdate:value":_=>a[s]=_,placeholder:"我是插槽传递的输入框"},null,8,["value","onUpdate:value"])]),_:1},8,["form-config","fApi","formModel","onSubmit"]),d(n,{ref:"jsonModal"},null,512)]),_:1},8,["open","onOk","onCancel"])}const fo=O(N,[["render",P]]);export{fo as default};
