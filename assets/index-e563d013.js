import{p as S,_ as d,f as U,l as V,h as P,o as B}from"./entry/index-1163f12d-1703821863576.js";import{D as T}from"./siteSetting-efd6ab5b.js";import{c as p,u as F}from"./index-95583927.js";import{b as k}from"./index-0ed07fa9.js";import{h as z}from"./header-55b09394.js";import{x as y,D as H}from"./antd-090f1744.js";import{d as W,c as Z,Z as t,_ as j,l as a,a9 as m,u as e,a8 as i,ab as l,$ as c,a1 as u,a0 as q,F as G}from"./vue-d56f5f31.js";import"./index-c54e00ba.js";import"./useContentViewHeight-17e909ee.js";import"./useWindowSizeFn-ab2a372a.js";import"./useSortable-c882fe9a.js";import"./index-42e6b831.js";import"./lock-e17eee5c.js";const J=["src"],ce=W({name:"UserDropdown",__name:"index",props:{theme:S.oneOf(["dark","light"])},setup(x){const n=p(()=>d(()=>import("./DropMenuItem-bdc97792.js"),["assets/DropMenuItem-bdc97792.js","assets/entry/index-1163f12d-1703821863576.js","assets/vue-d56f5f31.js","assets/antd-090f1744.js","assets/index-3558d5e9.css"])),v=p(()=>d(()=>import("./LockModal-02a6f4a6.js"),["assets/LockModal-02a6f4a6.js","assets/entry/index-1163f12d-1703821863576.js","assets/vue-d56f5f31.js","assets/antd-090f1744.js","assets/index-3558d5e9.css","assets/index-0ed07fa9.js","assets/useWindowSizeFn-ab2a372a.js","assets/index-5e2c95f6.css","assets/BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js","assets/FormItem.vue_vue_type_script_lang-a47ce972.js","assets/componentMap-e24e33c4.js","assets/useFormItem-8d47235f.js","assets/RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js","assets/uuid-31b8b5a4.js","assets/useSortable-c882fe9a.js","assets/download-80f35978.js","assets/base64Conver-39fc0d26.js","assets/index-a220e839.js","assets/index-74456602.css","assets/IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js","assets/copyTextToClipboard-0869443b.js","assets/index-46c9858a.js","assets/index-7f5b8959.css","assets/index-b1f4e6cf.js","assets/index-65df2ec9.css","assets/componentMap-6528b260.css","assets/helper-794fc484.js","assets/BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js","assets/BasicForm-ed840c0a.css","assets/useForm-c38c055a.js","assets/lock-e17eee5c.js","assets/header-55b09394.js","assets/LockModal-ca58db68.css"])),w=p(()=>d(()=>import("./index-9b837050.js"),["assets/index-9b837050.js","assets/entry/index-1163f12d-1703821863576.js","assets/vue-d56f5f31.js","assets/antd-090f1744.js","assets/index-3558d5e9.css","assets/index-0ed07fa9.js","assets/useWindowSizeFn-ab2a372a.js","assets/index-5e2c95f6.css","assets/BasicForm.vue_vue_type_script_setup_true_lang-642f17c1.js","assets/FormItem.vue_vue_type_script_lang-a47ce972.js","assets/componentMap-e24e33c4.js","assets/useFormItem-8d47235f.js","assets/RadioButtonGroup.vue_vue_type_script_setup_true_lang-c310a3e3.js","assets/uuid-31b8b5a4.js","assets/useSortable-c882fe9a.js","assets/download-80f35978.js","assets/base64Conver-39fc0d26.js","assets/index-a220e839.js","assets/index-74456602.css","assets/IconPicker.vue_vue_type_script_setup_true_lang-d1d8b5c9.js","assets/copyTextToClipboard-0869443b.js","assets/index-46c9858a.js","assets/index-7f5b8959.css","assets/index-b1f4e6cf.js","assets/index-65df2ec9.css","assets/componentMap-6528b260.css","assets/helper-794fc484.js","assets/BasicForm.vue_vue_type_style_index_0_lang-02a2ab57.js","assets/BasicForm-ed840c0a.css","assets/useForm-c38c055a.js"])),{prefixCls:o}=U("header-user-dropdown"),{t:r}=P(),{getShowDoc:_,getUseLockPage:D,getShowApi:C}=F(),g=V(),f=Z(()=>{const{realName:s="",avatar:h,desc:$}=g.getUserInfo||{};return{realName:s,avatar:h||z,desc:$}}),[L,{openModal:A}]=k(),[I,{openModal:b}]=k();function O(){A(!0)}function R(){b(!0,{})}function E(){g.confirmLoginOut()}function M(){B(T)}function N(s){switch(s.key){case"logout":E();break;case"doc":M();break;case"lock":O();break;case"api":R();break}}return(s,h)=>(t(),j(G,null,[a(e(H),{placement:"bottomLeft",overlayClassName:`${e(o)}-dropdown-overlay`},{overlay:m(()=>[a(e(y),{onClick:N},{default:m(()=>[e(_)?(t(),i(e(n),{key:"doc",text:e(r)("layout.header.dropdownItemDoc"),icon:"ion:document-text-outline"},null,8,["text"])):l("",!0),e(_)?(t(),i(e(y).Divider,{key:1})):l("",!0),e(C)?(t(),i(e(n),{key:"api",text:e(r)("layout.header.dropdownChangeApi"),icon:"ant-design:swap-outlined"},null,8,["text"])):l("",!0),e(D)?(t(),i(e(n),{key:"lock",text:e(r)("layout.header.tooltipLock"),icon:"ion:lock-closed-outline"},null,8,["text"])):l("",!0),a(e(n),{key:"logout",text:e(r)("layout.header.dropdownItemLoginOut"),icon:"ion:power-outline"},null,8,["text"])]),_:1})]),default:m(()=>[c("span",{class:u([[e(o),`${e(o)}--${x.theme}`],"flex"])},[c("img",{class:u(`${e(o)}__header`),src:f.value.avatar},null,10,J),c("span",{class:u(`${e(o)}__info hidden md:block`)},[c("span",{class:u([`${e(o)}__name`,"truncate"])},q(f.value.realName),3)],2)],2)]),_:1},8,["overlayClassName"]),a(e(v),{onRegister:e(L)},null,8,["onRegister"]),a(e(w),{onRegister:e(I)},null,8,["onRegister"])],64))}});export{ce as default};
