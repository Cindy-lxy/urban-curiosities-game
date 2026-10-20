'use strict';
// Localization is presentation-only: no chapter, cursor, inventory, flags or log is mutated.
(() => {
  const dictionary=window.EN_TEXT;
  const langKey='vn:'+GAME_ID+':language';
  let language='zh';
  try{language=localStorage.getItem(langKey)==='en'?'en':'zh';}catch(e){/* Language remains usable without storage. */}
  const records=new WeakMap();
  const attributes=new WeakMap();
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const fragments=new RegExp(Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
  function english(text){
    const trimmed=text.trim();
    if(Object.prototype.hasOwnProperty.call(dictionary,trimmed))return text.slice(0,text.indexOf(trimmed))+dictionary[trimmed]+text.slice(text.indexOf(trimmed)+trimmed.length);
    if(!/[\u3400-\u9fff]/.test(text))return text;
    return text.replace(fragments,s=>dictionary[s]).replaceAll('：',': ').replaceAll('（',' (').replaceAll('）',')');
  }
  function localizeNode(node){
    if(!node.parentElement||node.parentElement.closest('script,style,[data-no-localize]'))return;
    const old=records.get(node);
    const source=old&&old.shown===node.data?old.source:node.data;
    const shown=language==='en'?english(source):source;
    records.set(node,{source,shown});
    if(node.data!==shown)node.data=shown;
  }
  function localizeAttribute(el,name){
    const current=el.getAttribute(name);
    if(current===null)return;
    const map=attributes.get(el)||{};
    const old=map[name];
    const source=old&&old.shown===current?old.source:current;
    const shown=language==='en'?english(source):source;
    map[name]={source,shown};attributes.set(el,map);
    if(current!==shown)el.setAttribute(name,shown);
  }
  const observer=new MutationObserver(()=>apply());
  function apply(){
    observer.disconnect();
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;while(node=walker.nextNode())localizeNode(node);
    document.querySelectorAll('[title],[aria-label],[alt]').forEach(el=>{
      if(!el.closest('[data-no-localize]'))['title','aria-label','alt'].forEach(a=>localizeAttribute(el,a));
    });
    document.documentElement.lang=language==='en'?'en':'zh-CN';
    document.title=language==='en'?'Urban Curiosities — Ghosts or Rumors?':'都市奇闻-鬼怪还是谣言？';
    const b=document.querySelector('#langBtn');
    b.textContent=language==='en'?'中文':'EN';
    b.setAttribute('aria-label',language==='en'?'Switch to Chinese':'切换到英文');
    b.title=language==='en'?'切换到中文':'Switch to English';
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','alt']});
  }
  function setLanguage(next){
    language=next==='en'?'en':'zh';
    try{localStorage.setItem(langKey,language);}catch(e){/* Preference cannot persist; gameplay is unaffected. */}
    apply();
  }
  document.querySelector('#langBtn').addEventListener('click',()=>setLanguage(language==='en'?'zh':'en'));
  window.gameLocale={get language(){return language;},translate:english,setLanguage,refresh:apply};
  apply();
})();
