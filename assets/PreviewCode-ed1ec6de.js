var b=Object.defineProperty,h=Object.defineProperties;var x=Object.getOwnPropertyDescriptors;var p=Object.getOwnPropertySymbols;var J=Object.prototype.hasOwnProperty,k=Object.prototype.propertyIsEnumerable;var u=(e,t,o)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,m=(e,t)=>{for(var o in t||(t={}))J.call(t,o)&&u(e,o,t[o]);if(p)for(var o of p(t))k.call(t,o)&&u(e,o,t[o]);return e},_=(e,t)=>h(e,x(t));import{C as g,M as w}from"./index-af5adfcd.js";import{c as $}from"./copyTextToClipboard-0869443b.js";import{a as M,c as B}from"./entry/index-1163f12d-1703821863576.js";import{d as D,r as F,G as N,a7 as f,Z as A,_ as O,$ as v,l as r,a9 as C,E as y}from"./vue-d56f5f31.js";import"./antd-090f1744.js";import"./useWindowSizeFn-ab2a372a.js";const P=D({name:"PreviewCode",components:{CodeEditor:g},props:{fileFormat:{type:String,default:"json"},editorJson:{type:String,default:""}},setup(e){const t=F({visible:!1}),o=(a,n=`file.${e.fileFormat}`)=>{let l="data:text/csv;charset=utf-8,";l+=a;const E=encodeURI(l),s=document.createElement("a");s.setAttribute("href",E),s.setAttribute("download",n),s.click()},c=()=>{o(e.editorJson)},{createMessage:d}=M(),i=()=>{const a=e.editorJson;if(!a){d.warning("代码为空！");return}$(a)};return _(m({},N(t)),{exportData:o,handleCopyJson:i,handleExportJson:c,MODE:w})}});const S={class:"v-json-box"},V={class:"copy-btn-box"};function j(e,t,o,c,d,i){const a=f("CodeEditor"),n=f("a-button");return A(),O("div",null,[v("div",S,[r(a,{value:e.editorJson,ref:"myEditor",mode:e.MODE.JSON},null,8,["value","mode"])]),v("div",V,[r(n,{onClick:e.handleCopyJson,type:"primary",class:"copy-btn","data-clipboard-action":"copy","data-clipboard-text":e.editorJson},{default:C(()=>[y(" 复制数据 ")]),_:1},8,["onClick","data-clipboard-text"]),r(n,{onClick:e.handleExportJson,type:"primary"},{default:C(()=>[y("导出代码")]),_:1},8,["onClick"])])])}const z=B(P,[["render",j],["__scopeId","data-v-a69efe87"]]);export{z as default};
