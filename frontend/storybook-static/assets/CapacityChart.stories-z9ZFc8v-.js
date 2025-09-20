import{j as a}from"./jsx-runtime-D_zvdyIk.js";import"./index-DQLiH3RP.js";import{R as L,B as q,X as A,Y as B,T as R,L as V,b as _,a as z,C as F}from"./BarChart-o9b-OQvE.js";import"./tiny-invariant-CopsF_GD.js";const K=(e,r)=>Math.abs(e-r)<=.001?"#16a34a":e<r-.001?"#f59e0b":"#ef4444",D=({data:e,height:r=280,loading:l=!1,error:c=null,emptyMessage:S="No capacity data to display."})=>l?a.jsx("div",{className:"w-full flex items-center justify-center py-12","data-testid":"capacity-chart-loading",children:a.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"})}):c?a.jsx("div",{className:"w-full","data-testid":"capacity-chart-error",children:a.jsx("div",{className:"bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700",children:c})}):!e||e.length===0?a.jsx("div",{className:"w-full text-center py-8 text-sm text-gray-500","data-testid":"capacity-chart-empty",children:S}):a.jsx("div",{className:"w-full","data-testid":"capacity-chart",children:a.jsx(L,{width:"100%",height:r,children:a.jsxs(q,{data:e,margin:{top:16,right:24,left:8,bottom:8},children:[a.jsx(A,{dataKey:"resourceName",tick:{fontSize:12}}),a.jsx(B,{domain:[0,7],tick:{fontSize:12},label:{value:"Days",angle:-90,position:"insideLeft"}}),a.jsx(R,{}),a.jsx(V,{}),a.jsx(_,{y:4.5,stroke:"#16a34a",strokeDasharray:"4 4",label:{value:"Capacity (4.5)",position:"right",fill:"#16a34a"}}),a.jsx(z,{dataKey:"allocated",name:"Allocated",children:e.map((d,E)=>a.jsx(F,{fill:K(d.allocated,d.capacity)},`cell-${E}`))})]})})});D.__docgenInfo={description:"",methods:[],displayName:"CapacityChart",props:{data:{required:!0,tsType:{name:"Array",elements:[{name:"CapacityDatum"}],raw:"CapacityDatum[]"},description:""},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"280",computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}]},description:"",defaultValue:{value:"null",computed:!1}},emptyMessage:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'No capacity data to display.'",computed:!1}}}};const O={title:"Charts/CapacityChart",component:D,argTypes:{height:{control:{type:"number",min:120,max:600,step:20}},loading:{control:"boolean"},error:{control:"text"}}},k=[{resourceName:"Alice",week:"2025-01-06",allocated:4.5,capacity:4.5},{resourceName:"Bob",week:"2025-01-06",allocated:3.2,capacity:4.5},{resourceName:"Charlie",week:"2025-01-06",allocated:5.1,capacity:4.5}],t={args:{data:k,height:280}},s={args:{data:[],loading:!0}},o={args:{data:[],error:"Failed to load capacity data"}},i={args:{data:[]}},n={args:{data:k,height:420}};var p,m,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    data: sampleData,
    height: 280
  }
}`,...(u=(m=t.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var g,y,f;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    data: [],
    loading: true
  }
}`,...(f=(y=s.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var h,x,b;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    data: [],
    error: 'Failed to load capacity data'
  }
}`,...(b=(x=o.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var j,C,v;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...(v=(C=i.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};var N,w,T;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    data: sampleData,
    height: 420
  }
}`,...(T=(w=n.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};const $=["Default","Loading","Error","Empty","Tall"];export{t as Default,i as Empty,o as Error,s as Loading,n as Tall,$ as __namedExportsOrder,O as default};
