(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,18566,(e,t,a)=>{t.exports=e.r(76562)},57951,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(18566);let o={id:"1",name:"Demo User",email:"demo@pocketoption.com",balance:1e4,location:"New York, USA",joinDate:"2024-01-01",avatar:"/api/placeholder/40/40"},i="pocketoption_users",s="pocketoption_current_user",n=()=>{let e=localStorage.getItem(i);return e?JSON.parse(e):[]},l=e=>{e?localStorage.setItem(s,JSON.stringify(e)):localStorage.removeItem(s)},c=async(e,t)=>{if(await new Promise(e=>setTimeout(e,1e3)),"demo@pocketoption.com"===e&&"demo123"===t){let e={...o,email:"demo@pocketoption.com",password:"demo123",createdAt:new Date().toISOString()};return l(e),{success:!0,user:e}}let a=n().find(a=>a.email===e&&a.password===t);if(a)return l(a),{success:!0,user:{id:a.id,name:a.name,email:a.email,balance:a.balance,avatar:o.avatar,joinDate:a.createdAt,verified:!0,location:o.location,phone:""}};throw Error("Invalid credentials")},d=async(e,t,a)=>{await new Promise(e=>setTimeout(e,1e3));let r=n();if(r.find(e=>e.email===t))throw Error("User already exists with this email");let s={id:Date.now().toString(),name:e,email:t,password:a,balance:1e4,createdAt:new Date().toISOString()};return r.push(s),localStorage.setItem(i,JSON.stringify(r)),l(s),{success:!0,user:{id:s.id,name:s.name,email:s.email,balance:s.balance,avatar:o.avatar,joinDate:s.createdAt,verified:!0,location:o.location,phone:""}}},u=async()=>(await new Promise(e=>setTimeout(e,500)),l(null),{success:!0}),p=async()=>(await new Promise(e=>setTimeout(e,500)),{balance:o.balance}),m=(0,a.createContext)(void 0);function f({children:e}){let[o,i]=(0,a.useState)(null),[s,n]=(0,a.useState)(!0),l=(0,r.useRouter)(),f=async()=>{try{let e=localStorage.getItem("pocketoption_current_user");if(e){let t=JSON.parse(e);i({id:t.id,email:t.email,firstName:t.name?.split(" ")[0]||"",lastName:t.name?.split(" ")[1]||"",balance:t.balance,isAdmin:"admin@pocketoption.com"===t.email,kycStatus:"verified",createdAt:t.createdAt||new Date().toISOString(),phone:t.phone||"",location:t.country||""})}else i(null)}catch(e){console.error("Failed to fetch user:",e),i(null)}},y=async(e,t)=>{try{let a=await c(e,t),r={id:a.user.id,email:a.user.email,firstName:a.user.name?.split(" ")[0]||"",lastName:a.user.name?.split(" ")[1]||"",balance:a.user.balance,isAdmin:"admin@pocketoption.com"===e,kycStatus:"verified",createdAt:a.user.joinDate||new Date().toISOString(),phone:a.user.phone||"",location:a.user.country||""};i(r)}catch(e){throw e}},g=async e=>{try{let t=await d(e.firstName||"",e.email,e.password),a={id:t.user.id,email:t.user.email,firstName:e.firstName||"",lastName:e.lastName||"",balance:t.user.balance,isAdmin:!1,kycStatus:"verified",createdAt:t.user.joinDate||new Date().toISOString(),phone:t.user.phone||"",location:t.user.country||""};i(a)}catch(e){throw e}},h=async()=>{try{await u(),i(null),l.push("/")}catch(e){console.error("Logout error:",e),i(null),l.push("/")}},b=async e=>{if(o)try{let t={...o,balance:o.balance+e};i(t);let a=localStorage.getItem("pocketoption_current_user");if(a){let e=JSON.parse(a);e.balance=t.balance,localStorage.setItem("pocketoption_current_user",JSON.stringify(e));let r=localStorage.getItem("pocketoption_users");if(r){let a=JSON.parse(r),o=a.findIndex(t=>t.id===e.id);-1!==o&&(a[o].balance=t.balance,localStorage.setItem("pocketoption_users",JSON.stringify(a)))}}await p()}catch(e){console.error("Failed to update balance:",e),i(o)}};return(0,a.useEffect)(()=>{f().finally(()=>n(!1))},[]),(0,t.jsx)(m.Provider,{value:{user:o,loading:s,login:y,register:g,logout:h,refreshUser:f,updateBalance:b},children:e})}function y(){let e=(0,a.useContext)(m);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}e.s(["AuthProvider",()=>f,"useAuth",()=>y],57951)},5766,e=>{"use strict";let t,a;var r,o=e.i(71645);let i={data:""},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let a="",r="",o="";for(let i in e){let s=e[i];"@"==i[0]?"i"==i[1]?a=i+" "+s+";":r+="f"==i[1]?c(s,i):i+"{"+c(s,"k"==i[1]?"":t)+"}":"object"==typeof s?r+=c(s,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=s&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(i,s):i+":"+s+";")}return a+(t&&o?t+"{"+o+"}":o)+r},d={},u=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+u(e[a]);return t}return e};function p(e){let t,a,r=this||{},o=e.call?e(r.p):e;return((e,t,a,r,o)=>{var i;let p=u(e),m=d[p]||(d[p]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(p));if(!d[m]){let t=p!==e?e:(e=>{let t,a,r=[{}];for(;t=s.exec(e.replace(n,""));)t[4]?r.shift():t[3]?(a=t[3].replace(l," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(l," ").trim();return r[0]})(e);d[m]=c(o?{["@keyframes "+m]:t}:t,a?"":"."+m)}let f=a&&d.g?d.g:null;return a&&(d.g=d[m]),i=d[m],f?t.data=t.data.replace(f,i):-1===t.data.indexOf(i)&&(t.data=r?i+t.data:t.data+i),m})(o.unshift?o.raw?(t=[].slice.call(arguments,1),a=r.p,o.reduce((e,r,o)=>{let i=t[o];if(i&&i.call){let e=i(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+r+(null==i?"":i)},"")):o.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):o,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(r.target),r.g,r.o,r.k)}p.bind({g:1});let m,f,y,g=p.bind({k:1});function h(e,t){let a=this||{};return function(){let r=arguments;function o(i,s){let n=Object.assign({},i),l=n.className||o.className;a.p=Object.assign({theme:f&&f()},n),a.o=/ *go\d+/.test(l),n.className=p.apply(a,r)+(l?" "+l:""),t&&(n.ref=s);let c=e;return e[0]&&(c=n.as||e,delete n.as),y&&c[0]&&y(n),m(c,n)}return t?t(o):o}}var b=(e,t)=>"function"==typeof e?e(t):e,v=(t=0,()=>(++t).toString()),w=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},x="default",S=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return S(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},k=[],I={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},E={},N=(e,t=x)=>{E[t]=S(E[t]||I,e),k.forEach(([e,a])=>{e===t&&a(E[t])})},A=e=>Object.keys(E).forEach(t=>N(e,t)),O=(e=x)=>t=>{N(t,e)},D={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},j=(e={},t=x)=>{let[a,r]=(0,o.useState)(E[t]||I),i=(0,o.useRef)(E[t]);(0,o.useEffect)(()=>(i.current!==E[t]&&r(E[t]),k.push([t,r]),()=>{let e=k.findIndex(([e])=>e===t);e>-1&&k.splice(e,1)}),[t]);let s=a.toasts.map(t=>{var a,r,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||D[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...a,toasts:s}},C=e=>(t,a)=>{let r,o=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||v()}))(t,e,a);return O(o.toasterId||(r=o.id,Object.keys(E).find(e=>E[e].toasts.some(e=>e.id===r))))({type:2,toast:o}),o.id},T=(e,t)=>C("blank")(e,t);T.error=C("error"),T.success=C("success"),T.loading=C("loading"),T.custom=C("custom"),T.dismiss=(e,t)=>{let a={type:3,toastId:e};t?O(t)(a):A(a)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let a={type:4,toastId:e};t?O(t)(a):A(a)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,a)=>{let r=T.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?b(t.success,e):void 0;return o?T.success(o,{id:r,...a,...null==a?void 0:a.success}):T.dismiss(r),e}).catch(e=>{let o=t.error?b(t.error,e):void 0;o?T.error(o,{id:r,...a,...null==a?void 0:a.error}):T.dismiss(r)}),e};var $=1e3,_=(e,t="default")=>{let{toasts:a,pausedAt:r}=j(e,t),i=(0,o.useRef)(new Map).current,s=(0,o.useCallback)((e,t=$)=>{if(i.has(e))return;let a=setTimeout(()=>{i.delete(e),n({type:4,toastId:e})},t);i.set(e,a)},[]);(0,o.useEffect)(()=>{if(r)return;let e=Date.now(),o=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(r<0){a.visible&&T.dismiss(a.id);return}return setTimeout(()=>T.dismiss(a.id,t),r)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let n=(0,o.useCallback)(O(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,o.useCallback)(()=>{r&&n({type:6,time:Date.now()})},[r,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:o=8,defaultPosition:i}=t||{},s=a.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[a]);return(0,o.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)s(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[a,s]),{toasts:a,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},P=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,z=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,J=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,L=h("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${P} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${J} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,F=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,U=h("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${F} 1s linear infinite;
`,M=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,R=g`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,H=h("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${R} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,B=h("div")`
  position: absolute;
`,K=h("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Y=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=h("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Y} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,V=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?o.createElement(q,null,t):t:"blank"===a?null:o.createElement(K,null,o.createElement(U,{...r}),"loading"!==a&&o.createElement(B,null,"error"===a?o.createElement(L,{...r}):o.createElement(H,{...r})))},Z=h("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,G=h("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=o.memo(({toast:e,position:t,style:a,children:r})=>{let i=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[r,o]=w()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${g(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},s=o.createElement(V,{toast:e}),n=o.createElement(G,{...e.ariaProps},b(e.message,e));return o.createElement(Z,{className:e.className,style:{...i,...a,...e.style}},"function"==typeof r?r({icon:s,message:n}):o.createElement(o.Fragment,null,s,n))});r=o.createElement,c.p=void 0,m=r,f=void 0,y=void 0;var W=({id:e,className:t,style:a,onHeightUpdate:r,children:i})=>{let s=o.useCallback(t=>{if(t){let a=()=>{r(e,t.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return o.createElement("div",{ref:s,className:t,style:a},i)},X=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:i,toasterId:s,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=_(a,s);return o.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(a=>{let s,n,l=a.position||t,c=d.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}),u=(s=l.includes("top"),n=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:w()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(s?1:-1)}px)`,...s?{top:0}:{bottom:0},...n});return o.createElement(W,{id:a.id,key:a.id,onHeightUpdate:d.updateHeight,className:a.visible?X:"",style:u},"custom"===a.type?b(a.message,a):i?i(a):o.createElement(Q,{toast:a,position:l}))}))};e.s(["CheckmarkIcon",()=>H,"ErrorIcon",()=>L,"LoaderIcon",()=>U,"ToastBar",()=>Q,"ToastIcon",()=>V,"Toaster",()=>ee,"default",()=>T,"resolveValue",()=>b,"toast",()=>T,"useToaster",()=>_,"useToasterStore",()=>j],5766)}]);