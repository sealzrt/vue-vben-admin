import{aE as m,Q as c,aZ as p}from"./entry/index-1163f12d-1703821863576.js";import{d as _,c as d,a7 as l,Z as u,_ as f,E as e,l as o,a9 as a,a0 as C,u as s}from"./vue-d56f5f31.js";import{a3 as M}from"./antd-090f1744.js";const P={class:"mt-2"},h=_({name:"CurrentPermissionMode",__name:"CurrentPermissionMode",setup(g){const n=m(),r=d(()=>n.getProjectConfig.permissionMode),{togglePermissionMode:i}=c();return(k,v)=>{const t=l("a-button");return u(),f("div",P,[e(" 当前权限模式： "),o(t,{type:"link"},{default:a(()=>[e(C(r.value===s(p).BACK?"后台权限模式":"前端角色权限模式"),1)]),_:1}),o(t,{class:"ml-4",onClick:s(i),type:"primary"},{default:a(()=>[e(" 切换权限模式 ")]),_:1},8,["onClick"]),o(s(M))])}}});export{h as _};
