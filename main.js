/* Page UI: project cards, buttons, scroll effects (works without 3D) */
/* ---------- page UI (works without WebGL) ---------- */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const sections=$$('main > section');

  // manifesto words
  const man=$('#manifest');
  man.innerHTML=man.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(' ');
  const words=[...man.querySelectorAll('.w')];

  // ---------- projects: edit this list to add your work ----------
  // cat   : Video | Motion Graphics | Web & Ads | UX/UI  (must match a filter button)
  // tone  : dark | orange | light   (placeholder colour when there is no thumbnail)
  // tag   : video length such as '0:45', or 'STILL' for image work
  // thumb : image or GIF in the assets folder, e.g. 'assets/intro.jpg' — leave '' for a placeholder
  // link  : where the card opens (Vimeo, YouTube, Behance…) — leave '' if there is none yet
  const projects=[
    {cat:'Video',client:'Vimeo',title:'Introduce Myself',desc:'A short video introducing who I am and how I work.',
     role:'Concept, shoot, edit, motion',tools:'Premiere Pro, After Effects',tag:'[00:00]',tone:'dark',thumb:'assets/tor-cover.jpg',link:'https://vimeo.com/740988503'},
    {cat:'Motion Graphics',client:'Animation.mu',title:'[Animation project]',desc:'[One line on the story and style.]',
     role:'Animator — [which shots / scenes]',tools:'After Effects, Maya, Blender',tag:'[00:00]',tone:'orange',thumb:'',link:''},
    {cat:'Motion Graphics',client:'CM-Telecom',title:'[Brand motion piece]',desc:'[One line on what it was for.]',
     role:'Motion Graphic Designer — [your part]',tools:'After Effects, Illustrator',tag:'[00:00]',tone:'light',thumb:'',link:''},
    {cat:'Motion Graphics',client:'VSI Group',title:'[Explainer / ad video]',desc:'[One line on the brief.]',
     role:'Motion Graphic Designer — [your part]',tools:'After Effects, Premiere Pro',tag:'[00:00]',tone:'dark',thumb:'',link:''},
    {cat:'Web & Ads',client:'Language Training Center',title:'[Google Ads creative set]',desc:'[Campaign, audience and ad formats.]',
     role:'Campaign setup, ad copy and visuals',tools:'Google Ads, Photoshop',tag:'STILL',tone:'light',thumb:'',link:''},
    {cat:'UX/UI',client:'UX/UI design',title:'UX/UI',desc:'App and web interface design. [Add the project name.]',
     role:'UX/UI design — [your part]',tools:'Figma, Adobe XD',tag:'STILL',tone:'orange',thumb:'',link:''},
  ];
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const play='<span class="pplay" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg></span>';
  $('#pgrid').innerHTML=projects.map(p=>{
    const inner=(p.thumb?`<img src="${esc(p.thumb)}" alt="${esc(p.title)}" loading="lazy">`:'<span class="pph">[Thumbnail / GIF loop]</span>')+play;
    const thumb=p.link?`<a class="pthumb tone-${p.tone}" href="${esc(p.link)}" target="_blank" rel="noopener" aria-label="Watch ${esc(p.title)}">${inner}</a>`
                      :`<div class="pthumb tone-${p.tone}">${inner}</div>`;
    return `<article class="proj" data-cat="${esc(p.cat)}">${thumb}
      <p class="pmeta"><b>${esc(p.cat)}</b> · ${esc(p.client)}</p><h3>${esc(p.title)}</h3><p class="pdesc">${esc(p.desc)}</p>
      <p class="prole"><b>My role:</b> ${esc(p.role)} · Tools: ${esc(p.tools)}</p></article>`;}).join('');
  $$('#pfilter button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('#pfilter button').forEach(x=>{x.classList.toggle('on',x===btn);x.setAttribute('aria-pressed',x===btn)});
    const f=btn.dataset.f;$$('.proj').forEach(c=>c.hidden=!(f==='all'||c.dataset.cat===f));}));

  // service cards
  window.__hoverCard=-1;
  $$('.card').forEach(c=>{
    const i=+c.dataset.i;
    c.addEventListener('pointerenter',()=>window.__hoverCard=i);
    c.addEventListener('pointerleave',()=>{if(window.__hoverCard===i)window.__hoverCard=-1});
    c.querySelector('.plus').addEventListener('click',e=>{const on=c.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',on);window.__hoverCard=on?i:-1});
  });

  // copy buttons
  $$('.copy').forEach(b=>b.addEventListener('click',()=>{const el=b.parentElement.querySelector('.val'),t=el.textContent;
    const done=l=>{b.textContent=l;setTimeout(()=>b.textContent='Copy',1600)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);done('Selected')};
    try{navigator.clipboard.writeText(t).then(()=>done('Copied'),sel)}catch(_){sel()}}));

  // scroll-driven UI
  const body=document.body, cnum=$('#cnum'), rail=$('#railfill'), cue=$('#cue');
  const links=$$('.links a');
  let active=-1;
  function apply(i){const s=sections[i].dataset;active=i;
    body.style.setProperty('--bg',s.bg);body.style.setProperty('--ink',s.ink);body.style.setProperty('--dot',s.dot);body.style.setProperty('--btn',s.btn);
    body.style.setProperty('--btn-ink',s.btn==='#121212'?'#F4D84A':'#121212');
    cnum.textContent=String(i+1).padStart(2,'0');
    links.forEach(a=>a.classList.toggle('on',a.dataset.for===sections[i].id));}
  function onScroll(){
    const y=scrollY,vh=innerHeight,mid=y+vh*.5;
    let i=0;sections.forEach((s,k)=>{if(s.offsetTop<=mid)i=k});
    if(i!==active)apply(i);
    rail.style.height=(100*y/Math.max(1,document.documentElement.scrollHeight-vh))+'%';
    cue.style.opacity=y>vh*.3?0:1;
    const m=$('#manifesto'),p=Math.min(1,Math.max(0,(y-m.offsetTop+vh*.15)/((m.offsetHeight-vh)*.8)));
    const lit=Math.round(p*words.length);words.forEach((w,k)=>w.classList.toggle('lit',k<lit));
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  apply(0);onScroll();
})();
