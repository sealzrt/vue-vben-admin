import{i as s}from"./mock-api-476da0d3.js";import{P as p}from"./index-9f5f841f.js";import{b5 as t,F as d,X as i,A as F,Q as f}from"./antd-090f1744.js";import{d as r,l as u,f as m,E as e}from"./vue-d56f5f31.js";import{u as E}from"./index-88cd51d8.js";import"./entry/index-1163f12d-1703821863576.js";import"./useContentViewHeight-17e909ee.js";import"./useWindowSizeFn-ab2a372a.js";import"./onMountedOrActivated-60a5193f.js";const c=r({setup(){const a=m(""),{data:l,loading:n}=E(s,{throttleWait:1e3,refreshDeps:[a]});return()=>u(f,{title:"节流"},{default:()=>[u(t,null,{default:()=>[u(t.Paragraph,null,{default:()=>[e("通过设置"),u(t.Text,{type:"danger"},{default:()=>[e(" options.throttleWait ")]}),e("，进入节流模式，此时如果频繁触发"),u(t.Text,{code:!0},{default:()=>[e(" run ")]}),e("或者"),u(t.Text,{code:!0},{default:()=>[e(" runAsync ")]}),e(", 则会以节流策略进行请求。")]}),u(t.Paragraph,null,{default:()=>[u(t.Text,{code:!0},{default:()=>["const { data, run } = useRequest(imitateApi, { throttleWait: 300, manual: true });"]})]}),u(t.Paragraph,null,{default:()=>[e("如上示例代码，频繁触发"),u(t.Text,{code:!0},{default:()=>[e(" run ")]}),e(", 300ms 执行一次。")]}),u(t.Paragraph,null,{default:()=>[e("你可以在下面 input 框中快速输入文本，体验效果")]})]}),u(d,{spinning:n.value},{default:()=>[u(i,{direction:"vertical"},{default:()=>[u(F,{value:a.value,"onUpdate:value":o=>a.value=o,placeholder:"Please enter username"},null),u("div",null,[e("Username: "),l.value])]})]})]})}}),T=r({setup(){return()=>u(p,null,{default:()=>[u(c,null,null)]})}});export{T as default};
