'use strict';
(() => {
  const toScrollContent = html => html.replace(/<button data-open="([^" ]+)"[^>]*>([\s\S]*?)<\/button>/g, '<a href="#$1">$2</a>').replace(programHeader,'');
  document.querySelectorAll('[data-section]').forEach(el=>{el.innerHTML=toScrollContent(CONTENT[el.dataset.section].html());});
  document.getElementById('program-content').innerHTML=['undergrad','graduate','global'].map((id,i)=>'<article id="'+id+'" class="program-block"><div class="program-index">0'+(i+1)+'</div><div class="content">'+toScrollContent(CONTENT[id].html())+'</div></article>').join('');
  const toggle=document.getElementById('menu-toggle'),nav=document.getElementById('navigation');
  function closeMenu(){nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','전체 메뉴 열기');}
  toggle.addEventListener('click',()=>{const opened=nav.hidden;nav.hidden=!opened;toggle.setAttribute('aria-expanded',String(opened));toggle.setAttribute('aria-label',opened?'전체 메뉴 닫기':'전체 메뉴 열기');});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!nav.hidden){closeMenu();toggle.focus();}});
})();
