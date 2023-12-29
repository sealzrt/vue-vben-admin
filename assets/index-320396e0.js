import{P as R}from"./index-9f5f841f.js";import{D as i}from"./index-0d0272da.js";import{G as m,D,S as T}from"./siteSetting-efd6ab5b.js";import{u as n}from"./useDescription-f66cf39e.js";import{d as B,Z as S,a8 as V,a9 as g,$ as r,u as s,a0 as q,E as z,l as a,m as v}from"./vue-d56f5f31.js";import{O as C}from"./antd-090f1744.js";import"./entry/index-1163f12d-1703821863576.js";import"./useContentViewHeight-17e909ee.js";import"./useWindowSizeFn-ab2a372a.js";import"./onMountedOrActivated-60a5193f.js";const E={class:"flex justify-between items-center"},G={class:"flex-1"},L=["href"],J=B({__name:"index",setup(O){const{pkg:f,lastBuildTime:b}={pkg:{dependencies:{"@ant-design/icons-vue":"^6.1.0","@iconify/iconify":"^3.1.1","@logicflow/core":"^1.2.9","@logicflow/extension":"^1.2.9","@vben/hooks":"workspace:*","@vue/shared":"^3.3.4","@vueuse/core":"^10.2.1","@vueuse/shared":"^10.2.1","@zxcvbn-ts/core":"^3.0.2","ant-design-vue":"^4.0.6",axios:"^1.4.0",codemirror:"^5.65.12",cropperjs:"^1.5.13","crypto-js":"^4.1.1",dayjs:"^1.11.10","driver.js":"^1.3.0",echarts:"^5.4.2",exceljs:"^4.3.0","lodash-es":"^4.17.21",mockjs:"^1.1.0",nprogress:"^0.2.0","path-to-regexp":"^6.2.1",pinia:"2.1.4","pinia-plugin-persistedstate":"^3.2.0","print-js":"^1.6.0",qrcode:"^1.5.3",qs:"^6.11.2","resize-observer-polyfill":"^1.5.1",showdown:"^2.1.0",sortablejs:"^1.15.0",tinymce:"^5.10.7",unocss:"0.53.4",vditor:"^3.9.4",vue:"^3.3.4","vue-i18n":"^9.6.4","vue-json-pretty":"^2.2.4","vue-router":"^4.2.3","vue-types":"^5.1.0",vuedraggable:"^4.1.0","vxe-table":"^4.4.5","vxe-table-plugin-export-xlsx":"^3.0.4","xe-utils":"^3.5.11",xlsx:"^0.18.5"},devDependencies:{"@commitlint/cli":"^17.6.6","@commitlint/config-conventional":"^17.6.6","@iconify/json":"^2.2.87","@purge-icons/generated":"^0.9.0","@types/codemirror":"^5.60.8","@types/crypto-js":"^4.1.1","@types/lodash-es":"^4.17.7","@types/mockjs":"^1.0.7","@types/nprogress":"^0.2.0","@types/qrcode":"^1.5.1","@types/qs":"^6.9.7","@types/showdown":"^2.0.1","@types/sortablejs":"^1.15.1","@vben/eslint-config":"workspace:*","@vben/stylelint-config":"workspace:*","@vben/ts-config":"workspace:*","@vben/types":"workspace:*","@vben/vite-config":"workspace:*","@vue/compiler-sfc":"^3.3.4","@vue/test-utils":"^2.4.0","cross-env":"^7.0.3","cz-git":"^1.6.1",czg:"^1.6.1",husky:"^8.0.3","lint-staged":"13.2.3",prettier:"^2.8.8","prettier-plugin-packagejson":"^2.4.6",rimraf:"^5.0.1",turbo:"^1.10.7",typescript:"^5.2.2",unbuild:"^1.2.1",vite:"^4.4.0","vite-plugin-mock":"^2.9.6","vue-tsc":"^1.8.4"},name:"vben-admin",version:"2.10.1"},lastBuildTime:"2023-12-29 03:51:03"},{dependencies:c,devDependencies:l,name:h,version:y}=f,p=[],d=[],u=e=>t=>v(C,{color:e},()=>t),o=e=>t=>v("a",{href:t,target:"_blank"},e),x=[{label:"版本",field:"version",render:u("blue")},{label:"最后编译时间",field:"lastBuildTime",render:u("blue")},{label:"文档地址",field:"doc",render:o("文档地址")},{label:"预览地址",field:"preview",render:o("预览地址")},{label:"Github",field:"github",render:o("Github")}],_={version:y,lastBuildTime:b,doc:D,preview:T,github:m};Object.keys(c).forEach(e=>{p.push({field:e,label:e})}),Object.keys(l).forEach(e=>{d.push({field:e,label:e})});const[k]=n({title:"生产环境依赖",data:c,schema:p,column:3}),[j]=n({title:"开发环境依赖",data:l,schema:d,column:3}),[w]=n({title:"项目信息",data:_,schema:x,column:2});return(e,t)=>(S(),V(s(R),{title:"关于"},{headerContent:g(()=>[r("div",E,[r("span",G,[r("a",{href:s(m),target:"_blank"},q(s(h)),9,L),z(" 是一个基于Vue3.0、Vite、 Ant-Design-Vue 、TypeScript 的后台解决方案，目标是为中大型项目开发,提供现成的开箱解决方案及丰富的示例,原则上不会限制任何代码用于商用。 ")])])]),default:g(()=>[a(s(i),{onRegister:s(w),class:"enter-y"},null,8,["onRegister"]),a(s(i),{onRegister:s(k),class:"my-4 enter-y"},null,8,["onRegister"]),a(s(i),{onRegister:s(j),class:"enter-y"},null,8,["onRegister"])]),_:1}))}});export{J as default};
