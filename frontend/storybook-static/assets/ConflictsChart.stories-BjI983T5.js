import{C as h}from"./ConflictsChart-Bdp6vxfc.js";import"./jsx-runtime-D_zvdyIk.js";import"./index-DQLiH3RP.js";import"./BarChart-o9b-OQvE.js";import"./tiny-invariant-CopsF_GD.js";const E={title:"Charts/ConflictsChart",component:h,argTypes:{height:{control:{type:"number",min:120,max:600,step:20}},loading:{control:"boolean"},error:{control:"text"}}},C=[{resourceId:7,resourceName:"John Doe",weeklyConflicts:[{weekStarting:"2025-01-06",totalAllocation:6,standardLoad:4.5,overAllocation:1.5},{weekStarting:"2025-01-13",totalAllocation:5.2,standardLoad:4.5,overAllocation:.7}]},{resourceId:8,resourceName:"Jane Smith",weeklyConflicts:[{weekStarting:"2025-01-06",totalAllocation:4.6,standardLoad:4.5,overAllocation:.1}]}],o={args:{conflicts:C,height:280}},r={args:{conflicts:[],loading:!0}},e={args:{conflicts:[],error:"Failed to load conflicts"}},t={args:{conflicts:[]}};var a,s,n;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    conflicts: sampleConflicts,
    height: 280
  }
}`,...(n=(s=o.parameters)==null?void 0:s.docs)==null?void 0:n.source}}};var c,l,i;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    conflicts: [],
    loading: true
  }
}`,...(i=(l=r.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};var d,m,p;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    conflicts: [],
    error: 'Failed to load conflicts'
  }
}`,...(p=(m=e.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var g,u,f;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    conflicts: []
  }
}`,...(f=(u=t.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};const L=["Default","Loading","Error","Empty"];export{o as Default,t as Empty,e as Error,r as Loading,L as __namedExportsOrder,E as default};
