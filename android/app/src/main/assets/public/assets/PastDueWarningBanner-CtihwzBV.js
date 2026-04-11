import{c as r,r as p,d,j as a,B as y,s as l,b as h}from"./index-BYU6G4gC.js";import{T as u}from"./triangle-alert-oDd-3zdS.js";import{L as m}from"./loader-circle-wDATiZrx.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=r("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=r("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=r("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);function v({userId:t}){const[n,o]=p.useState(!1),{data:i}=d({queryKey:["subscription-past-due",t],enabled:!!t,queryFn:async()=>{if(!t)return!1;const{data:e}=await l.from("subscriptions").select("status").eq("user_id",t).eq("status","past_due").maybeSingle();return!!e}}),c=async()=>{o(!0);try{const{data:e,error:s}=await l.functions.invoke("create-portal-session");if(s)throw new Error(s.message||"Failed to open billing portal");if(!(e!=null&&e.url))throw new Error("No portal URL returned.");window.location.href=e.url}catch(e){const s=e instanceof Error?e.message:"Something went wrong. Please try again.";h.error(s)}finally{o(!1)}};return i?a.jsxs("div",{className:"w-full bg-gold/15 border-b border-gold/40 px-4 py-3 flex items-center justify-between gap-4 flex-wrap",children:[a.jsxs("div",{className:"flex items-center gap-2.5",children:[a.jsx(u,{className:"w-4 h-4 text-gold shrink-0"}),a.jsx("p",{className:"text-sm font-medium text-foreground",children:"Your payment failed. Please update your payment method to keep your Legacy Pass active."})]}),a.jsx(y,{size:"sm",onClick:c,disabled:n,className:"bg-gold text-background hover:bg-gold/90 font-semibold shrink-0",children:n?a.jsxs(a.Fragment,{children:[a.jsx(m,{className:"w-3.5 h-3.5 animate-spin mr-1.5"}),"Opening…"]}):"Update Payment Method"})]}):null}export{v as P,k as S,w as T,b as a};
