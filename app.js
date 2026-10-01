'use strict';
(() => {
  const layer=document.getElementById('window-layer');
  const tasks=document.getElementById('tasks');
  const windows=new Map();
  let highest=20, activeId=null;
  const announce=text=>{document.getElementById('announcer').textContent=text;};
  function updateTasks(){
    tasks.replaceChildren();
    windows.forEach((entry,id)=>{
      const button=document.createElement('button');
      button.className='task'+(id===activeId&&!entry.el.hidden?' active':'');
      button.textContent=CONTENT[id].title;
      button.setAttribute('aria-label',CONTENT[id].title+' 창 '+(entry.el.hidden?'복원':'선택'));
      button.addEventListener('click',()=>{entry.el.hidden=false;focusWindow(id);entry.el.querySelector('.window-titlebar h2').focus();});
      tasks.append(button);
    });
  }
  function focusWindow(id){
    const entry=windows.get(id); if(!entry)return;
    windows.forEach(e=>e.el.classList.remove('active'));
    entry.el.classList.add('active');entry.el.style.zIndex=String(++highest);activeId=id;updateTasks();
  }
  function fallbackFocus(){
    const visible=[...windows.entries()].filter(([,e])=>!e.el.hidden).sort((a,b)=>Number(b[1].el.style.zIndex)-Number(a[1].el.style.zIndex));
    if(visible.length){focusWindow(visible[0][0]);visible[0][1].el.querySelector('h2').focus();}
    else{activeId=null;updateTasks();document.querySelector('[data-home]').focus({preventScroll:true});}
  }
  function minimize(id){const e=windows.get(id);if(!e)return;e.el.hidden=true;announce(CONTENT[id].title+' 창을 최소화했습니다. 작업 표시줄에서 다시 열 수 있습니다.');fallbackFocus();}
  function closeWindow(id){const e=windows.get(id);if(!e)return;e.el.remove();windows.delete(id);announce(CONTENT[id].title+' 창을 닫았습니다.');fallbackFocus();}
  function openWindow(id,trigger){
    if(!CONTENT[id])return;
    if(windows.has(id)){windows.get(id).el.hidden=false;focusWindow(id);windows.get(id).el.querySelector('h2').focus();return;}
    const el=document.createElement('section');
    el.className='window';el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-labelledby','title-'+id);el.dataset.window=id;
    const offset=(windows.size%5)*22;
    el.style.left=`${Math.max(16,(innerWidth-860)/2)+offset}px`;el.style.top=`${Math.min(100+offset,Math.max(16,innerHeight-320))}px`;
    el.innerHTML=`<header class="window-titlebar"><h2 id="title-${id}" tabindex="-1">sw. / ${CONTENT[id].title}</h2><div class="window-controls"><button data-action="minimize" aria-label="${CONTENT[id].title} 창 최소화">−</button><button data-action="maximize" aria-label="${CONTENT[id].title} 창 최대화" aria-pressed="false">□</button><button data-action="close" aria-label="${CONTENT[id].title} 창 닫기">×</button></div></header><div class="window-body">${CONTENT[id].html()}</div><div class="window-footer">PKNU · SOCIAL WELFARE<span>자료 확인 2026.10.01</span></div>`;
    layer.append(el);windows.set(id,{el,trigger});
    el.addEventListener('pointerdown',()=>focusWindow(id));
    el.addEventListener('focusin',()=>{if(activeId!==id)focusWindow(id);});
    el.querySelector('.window-controls').addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.action==='close')closeWindow(id);
      if(b.dataset.action==='minimize')minimize(id);
      if(b.dataset.action==='maximize'){
        const max=el.classList.toggle('maximized');b.setAttribute('aria-pressed',String(max));b.setAttribute('aria-label',CONTENT[id].title+' 창 '+(max?'원래 크기로':'최대화'));b.textContent=max?'❐':'□';
      }
    });
    const bar=el.querySelector('.window-titlebar');
    let drag=null;
    bar.addEventListener('pointerdown',event=>{
      if(event.target.closest('button')||el.classList.contains('maximized')||innerWidth<=760)return;
      const rect=el.getBoundingClientRect();drag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener('pointermove',event=>{
      if(!drag)return;
      const left=Math.max(8,Math.min(innerWidth-el.offsetWidth-8,drag.left+event.clientX-drag.x));
      const top=Math.max(8,Math.min(innerHeight-135,drag.top+event.clientY-drag.y));
      el.style.left=left+'px';el.style.top=top+'px';
    });
    bar.addEventListener('pointerup',()=>{drag=null;});bar.addEventListener('pointercancel',()=>{drag=null;});
    el.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.parentElement.classList.add('image-unavailable');}));
    focusWindow(id);el.querySelector('h2').focus({preventScroll:true});announce(CONTENT[id].title+' 창을 열었습니다. Escape 키로 닫을 수 있습니다.');
  }
  function showDesktop(){windows.forEach(e=>{e.el.hidden=true;});activeId=null;updateTasks();announce('모든 창을 최소화했습니다.');document.querySelector('[data-home]').focus({preventScroll:true});}
  document.addEventListener('click',event=>{
    const opener=event.target.closest('[data-open]');if(opener){openWindow(opener.dataset.open,opener);return;}
    if(event.target.closest('[data-home]')){showDesktop();window.scrollTo({top:0,behavior:'smooth'});}
  });
  document.getElementById('show-desktop').addEventListener('click',showDesktop);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&activeId){event.preventDefault();closeWindow(activeId);}});
  window.addEventListener('resize',()=>{
    windows.forEach(({el})=>{if(el.classList.contains('maximized'))return;const r=el.getBoundingClientRect();el.style.left=Math.max(8,Math.min(r.left,innerWidth-r.width-8))+'px';el.style.top=Math.max(8,Math.min(r.top,innerHeight-150))+'px';});
  });
  const homeNews=document.getElementById('home-news');
  DEPARTMENT.achievements.slice(0,3).forEach((n,i)=>{
    const button=document.createElement('button');button.className='news-row';button.dataset.open='achievements';
    button.innerHTML=`<span class="number">0${i+1}</span><div><h3>${n.title}</h3><p>${n.period} · 공식 전공성과</p></div><span class="tag">${n.tag}</span>`;homeNews.append(button);
  });
  function tick(){
    const now=new Date();const clock=document.getElementById('clock');
    clock.innerHTML=`${now.toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false})}<br>${now.toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit'})}`;
  }
  tick();setInterval(tick,30000);
})();
