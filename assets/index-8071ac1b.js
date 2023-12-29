import k from"./CollapseItem-c771ccba.js";import B from"./FormComponentPanel-9a9ae2c6.js";import G from"./JsonModal-d9cae8a8.js";import V from"./index-1a0a95d5.js";import{_ as N}from"./useForm.vue_vue_type_script_setup_true_lang-95923332.js";import Z from"./Toolbar-9c3817c4.js";import q from"./PropsPanel-bbf81291.js";import Q from"./ImportJsonModal-6914627d.js";import U from"./CodeModal-3d088ea2.js";import"./index-af5adfcd.js";import{g as P,f as X}from"./index-e9d0e7df.js";import{b as Y,c as ee,l as oe}from"./formItemConfig-dfeb1f31.js";import{f as te,a$ as re,C as b,c as ne}from"./entry/index-1163f12d-1703821863576.js";import{g as se}from"./formItemPropsConfig-1be4311c.js";import{bi as J,bj as le,L as ae,f as c}from"./antd-090f1744.js";import{d as ie,f as a,p as f,Z as me,_ as pe,l as n,a9 as i,u as s,a1 as z,ad as ue,aa as de,N as ce,ai as fe,aj as ve,F as he}from"./vue-d56f5f31.js";import"./vuedraggable.umd-64c7d73d.js";import"./LayoutItem-03454e90.js";import"./FormNode-687f4a57.js";import"./FormNodeOperate-821bb561.js";import"./useFormDesignState-0e07fca3.js";import"./index-238d1127.js";import"./PreviewCode-ed1ec6de.js";import"./copyTextToClipboard-0869443b.js";import"./index-83fd65d9.js";import"./FormRender-2f35e6ac.js";import"./BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js";import"./FormItem.vue_vue_type_script_lang-a47ce972.js";import"./componentMap-e24e33c4.js";import"./useFormItem-8d47235f.js";import"./RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js";import"./index-0ed07fa9.js";import"./useWindowSizeFn-ab2a372a.js";import"./uuid-31b8b5a4.js";import"./useSortable-c882fe9a.js";import"./download-80f35978.js";import"./base64Conver-39fc0d26.js";import"./index-a220e839.js";import"./IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js";import"./index-46c9858a.js";import"./index-b1f4e6cf.js";import"./helper-794fc484.js";import"./BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js";import"./useForm-c38c055a.js";import"./FormProps.vue_vue_type_script_setup_true_name_FormProps_lang-e83ca5b5.js";import"./FormItemProps.vue_vue_type_script_setup_true_name_FormItemProps_lang-0120149b.js";import"./RuleProps-4cc4cad9.js";import"./ComponentProps-885b5702.js";import"./FormOptions-b2cb7727.js";import"./FormItemColumnProps-1c04538c.js";const ye=ie({__name:"index",props:{title:{type:String,default:"v-form-antd表单设计器"}},setup(Pe){const{prefixCls:F}=te("form-design"),D=a(null),I=a(null),M=a(null),w=a(null),L=a(null),S=a(null),$=a({}),t=a({schemas:[],layout:"horizontal",labelLayout:"flex",labelWidth:100,labelCol:{},wrapperCol:{},currentItem:{component:"",componentProps:{}},activeKey:1}),T=o=>{o.schemas=o.schemas||[],o.schemas.forEach(e=>{e.colProps=e.colProps||{span:24},e.componentProps=e.componentProps||{},e.itemProps=e.itemProps||{}}),t.value=o},W=re(t,{deep:!0,capacity:20,parse:o=>{const e=c(o),{currentItem:r,schemas:l}=e,d=l&&l.find(m=>m.key===(r==null?void 0:r.key));return d&&(e.currentItem=d),e}}),p=o=>{t.value.currentItem=o,E(o.key?t.value.activeKey===1?2:t.value.activeKey:1)},H=o=>{o.colProps=o.colProps||{},o.colProps.span=se.span},v=(o,e)=>{},g=o=>{const e=c(o);return H(e),P(e),e},h=o=>{var r;const e=c(o);if(H(e),P(e),!((r=t.value.currentItem)!=null&&r.key)){p(e),t.value.schemas&&t.value.schemas.push(e);return}x(e,!1)},j=o=>{const e=c(o);return e.component==="Grid"&&X([o],r=>{P(r)}),e},x=(o=t.value.currentItem,e=!0)=>{var d;const r=(d=t.value.currentItem)==null?void 0:d.key,l=m=>{m.some((y,C)=>{var K;if(y.key===r){e?m.splice(C,0,j(y)):m.splice(C+1,0,o);const _={newIndex:C+1};return A(_,m,e),!0}["Grid","Tabs"].includes(y.component)&&((K=y.columns)==null||K.forEach(_=>{l(_.children)}))})};t.value.schemas&&l(t.value.schemas)},A=({newIndex:o},e,r=!1)=>{const l=e[o];r&&P(l),p(l)},u=o=>{const e=c(t.value);o==null||o.showModal(e)},E=o=>{t.value.activeKey=o},O=()=>{t.value.schemas=[],p({component:""})},R=(o,e)=>$.value[o]=e;return f("formModel",$),f("setFormModelMethod",R),f("formConfig",t),f("historyReturn",W),f("formDesignMethods",{handleBeforeColAdd:A,handleCopy:x,handleListPush:h,handleSetSelectItem:p,handleAddAttrs:v,setFormConfig:T}),(o,e)=>(me(),pe(he,null,[n(s(ae),null,{default:i(()=>[n(s(J),{class:z(`left ${s(F)}-sider`),collapsible:"",collapsedWidth:"0",width:"270",zeroWidthTriggerStyle:{"margin-top":"-70px","background-color":"gray"},breakpoint:"md"},{default:i(()=>[n(s(b),{title:"基础控件"},{default:i(()=>[n(k,{list:s(Y),handleListPush:g,onAddAttrs:v,onHandleListPush:h},null,8,["list"])]),_:1}),n(s(b),{title:"自定义控件"},{default:i(()=>[n(k,{list:s(ee),onAddAttrs:v,handleListPush:g,onHandleListPush:h},null,8,["list"])]),_:1}),n(s(b),{title:"布局控件"},{default:i(()=>[n(k,{list:s(oe),handleListPush:g,onAddAttrs:v,onHandleListPush:h},null,8,["list"])]),_:1})]),_:1},8,["class"]),n(s(le),null,{default:i(()=>[n(Z,{onHandleOpenJsonModal:e[0]||(e[0]=r=>u(I.value)),onHandleOpenImportJsonModal:e[1]||(e[1]=r=>u(M.value)),onHandlePreview:e[2]||(e[2]=r=>u(w.value)),onHandlePreview2:e[3]||(e[3]=r=>u(L.value)),onHandleOpenCodeModal:e[4]||(e[4]=r=>u(S.value)),onHandleClearFormItems:O}),n(B,{"current-item":t.value.currentItem,data:t.value,onHandleSetSelectItem:p},null,8,["current-item","data"])]),_:1}),n(s(J),{class:z(`right ${s(F)}-sider`),collapsible:"",reverseArrow:!0,collapsedWidth:"0",width:"270",zeroWidthTriggerStyle:{"margin-top":"-70px","background-color":"gray"},breakpoint:"lg"},{default:i(()=>[n(q,{ref_key:"propsPanel",ref:D,activeKey:t.value.activeKey},ue({_:2},[de(t.value.schemas,r=>({name:`${r.component}Props`,fn:i(l=>[ce(o.$slots,`${r.component}Props`,fe(ve({formItem:l,props:l.componentProps})),void 0,!0)])}))]),1032,["activeKey"])]),_:3},8,["class"])]),_:3}),n(G,{ref_key:"jsonModal",ref:I},null,512),n(U,{ref_key:"codeModal",ref:S},null,512),n(Q,{ref_key:"importJsonModal",ref:M},null,512),n(V,{ref_key:"eFormPreview",ref:w,formConfig:t.value},null,8,["formConfig"]),n(N,{ref_key:"eFormPreview2",ref:L,formConfig:t.value},null,8,["formConfig"])],64))}});const ho=ne(ye,[["__scopeId","data-v-331ea7e8"]]);export{ho as default};
