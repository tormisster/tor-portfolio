/* Page UI: project cards, buttons, scroll effects (works without 3D) */
/* ---------- page UI (works without WebGL) ---------- */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const sections=$$('main > section');

  // hero letters: each letter hops a little when the mouse passes over it
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const wrap=node=>[...node.childNodes].forEach(n=>{
      if(n.nodeType===3){const f=document.createDocumentFragment();
        [...n.textContent].forEach(c=>{if(c===' '){f.append(' ');return;}const i=document.createElement('i');i.className='ch';i.textContent=c;f.append(i);});
        n.replaceWith(f);}
      else if(n.nodeType===1) wrap(n);});
    $$('.hero-copy h1 b').forEach(wrap);
    $$('.hero-copy h1 .ch').forEach(c=>{
      c.addEventListener('pointerenter',()=>{if(!c.classList.contains('hop'))c.classList.add('hop');});
      c.addEventListener('animationend',()=>c.classList.remove('hop'));});
  }

  // manifesto words
  const man=$('#manifest');
  man.innerHTML=man.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(' ');
  const words=[...man.querySelectorAll('.w')];

  // ---------- projects: edit this list to add your work ----------
  // cat   : Motion Graphics | Video & Content | Website | Google Ads | AI-Generated Video  (Graphic & UI uses the gallery below)  (must match a filter button)
  // tone  : dark | orange | light   (placeholder colour when there is no thumbnail)
  // thumb : image or GIF in the assets folder, e.g. 'assets/intro.jpg' — leave '' for a placeholder
  // link  : where the card opens (Vimeo, YouTube, Behance…) — leave '' if there is none yet
  const projects=[
    {cat:'Motion Graphics',client:'',title:'Introduce Myself',desc:'A short video introducing who I am and how I work.',
     role:'Concept, filming, editing and motion graphics',tools:'Premiere Pro, After Effects',tone:'dark',thumb:'assets/tor-cover.jpg',link:'https://vimeo.com/740988503'},
    {cat:'Motion Graphics',client:'',title:'Showreel',desc:'Highlights of my motion graphics work from every company I have worked with.',
     role:'Selected and edited highlights from each company',tools:'',tone:'orange',thumb:'assets/showreel.jpg',link:'https://vimeo.com/562443442'},
    {cat:'Motion Graphics',client:'',title:'Christmas',desc:'A Christmas campaign video made for social media.',
     role:'Concept, storyboard, editing and social media posting',tools:'',tone:'light',thumb:'assets/christmas.jpg',link:'https://drive.google.com/file/d/1OzFpAEGEgPTgJJAHw4qSiPRdgmh0H6fz/view'},
    {cat:'Motion Graphics',client:'',title:'FIKS IT (LED Advertising)',desc:'A motion ad designed for LED billboard screens.',
     role:'Concept, storyboard and editing',tools:'',tone:'dark',thumb:'assets/fiks-it.jpg',link:'https://drive.google.com/file/d/11cFTSHQ8oeu4kmxp6o4H-9IMZj0I_K_Q/view'},
    {cat:'Motion Graphics',client:'',title:'TME (Website Banner)',desc:'An animated banner for the TME website.',
     role:'Concept, storyboard and editing',tools:'',tone:'orange',thumb:'assets/tme-banner.jpg',link:'https://drive.google.com/file/d/18h3Mcv1R8sVd8ARRXXDXoYmjPJchAkXh/view'},
    {cat:'Motion Graphics',client:'',title:'Christmas Promotion',desc:'A promotional video for a Christmas campaign.',
     role:'Concept, storyboard and editing',tools:'',tone:'light',thumb:'assets/christmas-promote.jpg',link:'https://drive.google.com/file/d/1LBg2vO5gCzQBkfxX3ET-0myuZzgO-VhX/view?usp=sharing'},
    {cat:'Motion Graphics',client:'',title:'Anyday Promotion',desc:'A promotional video for Anyday.',
     role:'Concept, storyboard and editing',tools:'',tone:'dark',thumb:'assets/anyday.jpg',link:'https://drive.google.com/file/d/1_GEOWZTsHrS2eopiWASBWihQEgGyDjZm/view?usp=sharing'},
    {cat:'Motion Graphics',client:'',title:'Chinese Language Course Promotion',desc:'A promotional video for a Chinese language course.',
     role:'Concept, storyboard and editing',tools:'',tone:'orange',thumb:'assets/chinese.jpg',link:'https://drive.google.com/file/d/1W3bzDBY4cB7jFJH-EuttYYX7UAbk7zu2/view?usp=sharing'},
    {cat:'Motion Graphics',client:'',title:'Krungsri Promotion',desc:'A promotional video for Krungsri.',
     role:'Concept, storyboard and editing',tools:'',tone:'dark',thumb:'assets/krungsri.jpg',link:'https://drive.google.com/file/d/1z0gKsVGxF91XcqzlLED8o1Nf0dzdWYjF/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo ad',title:'POP Secret Ads',desc:'A promotional video ad for POP Secret.',
     role:'Video editing and motion graphics',tools:'',tone:'orange',thumb:'assets/pop-secret.jpg',link:'https://drive.google.com/file/d/142-knQt7-1gta-LQdSmn1pZmy8Ss83_k/view?usp=sharing'},
    {cat:'Video & Content',client:'Video content',title:'Student Loan Fund (SLF)',desc:'A video for the Thai Student Loan Fund.',
     role:'Video editing',tools:'',tone:'dark',thumb:'assets/slf.jpg',link:'https://drive.google.com/file/d/1w3nEicxbLpVjk1dIZZCKlX2034A_r32y/view?usp=sharing'},
    {cat:'Video & Content',client:'Video content',title:'CPAC',desc:'A video for CPAC.',
     role:'Video editing',tools:'',tone:'orange',thumb:'assets/cpac.jpg',link:'https://drive.google.com/file/d/1nzoFvJ9Vv--5cuStuo7NjtBSBa6985bP/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo video',title:'German Industry',desc:'A short-form promotional video about German industry.',
     role:'Short-form video editing',tools:'',tone:'dark',thumb:'assets/germany.jpg',link:'https://drive.google.com/file/d/1KpygC7-UU2Be0w9Wk0DBvTvsH3s0TMTH/view?usp=sharing'},
    {cat:'Video & Content',client:'Video content',title:'CPAC (Part 2)',desc:'A second video for CPAC.',
     role:'Video editing',tools:'',tone:'light',thumb:'assets/cpac-2.jpg',link:'https://drive.google.com/file/d/1Szz3eTQcweRdrfw7gs7-psxmTr-x5y81/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo video',title:'Menu Coffee',desc:'A promotional video for a coffee menu.',
     role:'Video editing and motion graphics',tools:'',tone:'dark',thumb:'assets/coffee.jpg',link:'https://drive.google.com/file/d/1KnutjKtELARzoZobtgBV28Qk2L0O-ECN/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo video',title:'Perfume Promotion',desc:'A promotional video for a perfume brand.',
     role:'Video editing',tools:'',tone:'dark',thumb:'assets/perfume.jpg',link:'https://drive.google.com/file/d/13DG0BHUs7zCWOADt8o13GbC67HPzmnNS/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo video',title:'Perfume Promotion (Part 2)',desc:'A second promotional video for the perfume brand.',
     role:'Video editing',tools:'',tone:'orange',thumb:'assets/perfume-2.jpg',link:'https://drive.google.com/file/d/1V3NhTm7k6cfJBrKZGAokUY4ZOlWXCxwi/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo ad',title:'BFGoodrich',desc:'A promotional video ad for BFGoodrich tyres.',
     role:'Video editing',tools:'',tone:'dark',thumb:'assets/bfgoodrich.jpg',link:'https://drive.google.com/file/d/155B2YIuxkddoUhq0Y5_4F2dw2yBrxao9/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo video',title:'Promotion and Content',desc:'A promotional video and social content for a language school.',
     role:'Content planning and video editing',tools:'',tone:'orange',thumb:'assets/language-promo.jpg',link:'https://drive.google.com/file/d/1ZtPaecnOocm7GhcL42aSxvfqUWnDl6ZI/view?usp=sharing'},
    {cat:'Video & Content',client:'Video content',title:'App Promotion',desc:'A video that promotes a savings app.',
     role:'Video editing',tools:'',tone:'light',thumb:'assets/saving-app.jpg',link:'https://drive.google.com/file/d/1tAwz4b_N4VYjLZ1WGmF2kBmWY91WERwz/view?usp=sharing'},
    {cat:'Video & Content',client:'Promo ad',title:'INTENTA',desc:'A promotional video ad for INTENTA.',
     role:'Video editing and motion graphics',tools:'',tone:'dark',thumb:'assets/intenta.jpg',link:'https://drive.google.com/file/d/1aaI8WjPjsdVcF7t4fVmMJkrsJf6n5LrP/view?usp=sharing'},
    {cat:'Website',client:'Website',title:'Website Design & Build',desc:'The website for The Language Thailand: course pages, booking and enquiry paths for a multi-language school.',
     role:'Website design and build, page layout and content, lead buttons (LINE, phone, enquiry)',tools:'Wix, Photoshop',tone:'light',thumb:'assets/web-tlt.jpg',link:'https://www.thelanguage-thailand.com/'},
    {cat:'Website',client:'Website',title:'CQ Education',desc:'Website for an education consultancy: study-abroad advising, online classes and summer camps.',
     role:'Website design and build, page layout and content',tools:'Wix',tone:'light',thumb:'assets/web-cq.jpg',link:'https://www.cq-education.com/'},
    {cat:'Google Ads',client:'Language school, Bangkok',title:'Google Ads Lead Generation',desc:'Always-on Search and Performance Max campaigns for a multi-language school.',
     result:'3.5× more leads · Cost per lead −67% · CTR 3.6% → 5.6% (year over year)',
     role:'Account strategy, campaign structure, keywords, ad copy and ongoing optimisation',tools:'Google Ads, GA4',tone:'light',thumb:'assets/ads-leads.jpg',link:''},
    {cat:'Google Ads',client:'Language school, Bangkok',title:'B2B Corporate Lead Campaigns',desc:'Search and Performance Max campaigns that reach companies looking for staff language training.',
     result:'23× more corporate leads (year over year)',
     role:'Campaign setup, B2B keyword and audience targeting, lead tracking',tools:'Google Ads',tone:'dark',thumb:'assets/ads-b2b.jpg',link:''},
    {cat:'Google Ads',client:'Language school, Bangkok',title:'Conversion Tracking & Analytics',desc:'Lead tracking for LINE, phone calls and enquiry buttons, so every channel can be measured and optimised.',
     result:'2.8× more tracked enquiries across the website (year over year)',
     role:'GA4 and Google Ads conversion setup, reporting',tools:'GA4, Google Ads',tone:'orange',thumb:'assets/ads-tracking.jpg',link:''},
    {cat:'AI-Generated Video',client:'AI video',title:'Corgi Café',desc:'A short AI-generated character clip: a corgi enjoying bubble tea at home.',
     role:'Concept, prompting, AI video generation and editing',tools:'Google Veo',tone:'light',thumb:'assets/ai-video-1.jpg',link:'https://drive.google.com/file/d/1sd8zUFRUWOIlt4SjXQR8gHZ7E2-wwQWP/view?usp=sharing'},
    {cat:'AI-Generated Video',client:'AI video',title:'Couch Potato',desc:'A short AI-generated character clip with a playful 3D cartoon look.',
     role:'Concept, prompting, AI video generation and editing',tools:'',tone:'orange',thumb:'assets/ai-video-2.jpg',link:'https://drive.google.com/file/d/1uvCVxcn2UYH8t98YdC240FOrCB0pSSxE/view?usp=sharing'},
    {cat:'AI-Generated Video',client:'AI video',title:'Inside the Body',desc:'A short AI-generated action clip: a muscular hero battling inside the human body.',
     role:'Concept, prompting, AI video generation and editing',tools:'',tone:'dark',thumb:'assets/ai-video-3.jpg',link:'https://drive.google.com/file/d/1G_4ba9anMSt1_tjpwKHQPwM-Ul4GMo-3/view?usp=sharing'},
  ];
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const play='<span class="pplay" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg></span>';
  $('#pgrid').innerHTML=projects.map(p=>{
    const inner=(p.thumb?`<img src="${esc(p.thumb)}" alt="${esc(p.title)}" loading="lazy">`:'<span class="pph">[Thumbnail / GIF loop]</span>')+(p.link?play:'');
    const thumb=p.link?`<a class="pthumb tone-${p.tone}" href="${esc(p.link)}" target="_blank" rel="noopener" aria-label="Watch ${esc(p.title)}">${inner}</a>`
                      :`<div class="pthumb tone-${p.tone}">${inner}</div>`;
    return `<article class="proj" data-cat="${esc(p.cat)}">${thumb}
      <p class="pmeta"><b>${esc(p.cat)}</b>${p.client?' · '+esc(p.client):''}</p><h3>${esc(p.title)}</h3><p class="pdesc">${esc(p.desc)}</p>${p.result?`<p class="presult">${esc(p.result)}</p>`:''}
      <p class="prole"><b>My role:</b> ${esc(p.role)}${p.tools?' · Tools: '+esc(p.tools):''}</p></article>`;}).join('');
  // ---------- Graphic & UI gallery: a sliding strip; click an image to open it large ----------
  // add images to assets/ui/ as ui-NN.jpg (large) + ui-NN-t.jpg (thumbnail), then list them here
  const gallery=[
    ['Clothing store app UI'],['Flower shop app UI'],['Furniture store app UI'],['Headphone store app UI'],
    ['Lighting store website layout'],['Coffee shop app UI'],['Bike shop website banner'],['Garmin bundle social ad'],
    ['Bike promotion social ad'],['Floor coating social post'],['Japanese for kids social post'],['Assessment infographic'],
    ['Research infographic'],['Third-language class social post'],
  ].map(([alt],k)=>({alt,big:`assets/ui/ui-${String(k+1).padStart(2,'0')}.jpg`,thumb:`assets/ui/ui-${String(k+1).padStart(2,'0')}-t.jpg`}));
  const gal=document.createElement('div');gal.className='gallery';gal.dataset.cat='Graphic & UI';
  gal.innerHTML=`<div class="ghead"><p class="pmeta"><b>Graphic &amp; UI</b> · ${gallery.length} pieces</p>
      <div class="gnav"><button type="button" class="gprev" aria-label="Previous images">&#8592;</button><button type="button" class="gnext" aria-label="Next images">&#8594;</button></div></div>
    <div class="gtrack" tabindex="0">${gallery.map((g,k)=>`<button type="button" class="gitem" data-k="${k}" aria-label="Open ${esc(g.alt)}"><img src="${g.thumb}" alt="${esc(g.alt)}" loading="lazy"></button>`).join('')}</div>
    <p class="ghint">App UI, website layouts, banners and social posts. Click any image to view it full size.</p>`;
  $('#pgrid').append(gal);
  const track=gal.querySelector('.gtrack');
  gal.querySelector('.gprev').onclick=()=>track.scrollBy({left:-track.clientWidth*.8,behavior:'smooth'});
  gal.querySelector('.gnext').onclick=()=>track.scrollBy({left:track.clientWidth*.8,behavior:'smooth'});
  // lightbox
  const lb=document.createElement('div');lb.className='lightbox';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.innerHTML='<button type="button" class="lbclose" aria-label="Close">&#215;</button><button type="button" class="lbprev" aria-label="Previous">&#8592;</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="lbnext" aria-label="Next">&#8594;</button>';
  document.body.append(lb);
  let cur=0,lastFocus=null;const lbImg=lb.querySelector('img'),lbCap=lb.querySelector('figcaption');
  const show=k=>{cur=(k+gallery.length)%gallery.length;lbImg.src=gallery[cur].big;lbImg.alt=gallery[cur].alt;lbCap.textContent=`${gallery[cur].alt} · ${cur+1} / ${gallery.length}`;};
  const open=k=>{lastFocus=document.activeElement;show(k);lb.hidden=false;document.documentElement.classList.add('lb-open');lb.querySelector('.lbclose').focus();};
  const close=()=>{lb.hidden=true;document.documentElement.classList.remove('lb-open');lastFocus&&lastFocus.focus();};
  track.addEventListener('click',e=>{const b=e.target.closest('.gitem');if(b)open(+b.dataset.k);});
  lb.querySelector('.lbclose').onclick=close;lb.querySelector('.lbprev').onclick=()=>show(cur-1);lb.querySelector('.lbnext').onclick=()=>show(cur+1);
  lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')close();});
  addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);});

  // portrait (9:16) thumbnails: show the whole image over a blurred copy instead of cropping it
  $$('.pthumb img').forEach(img=>{const fit=()=>{if(img.naturalHeight>img.naturalWidth){const bg=img.cloneNode();bg.className='pbg';bg.alt='';bg.setAttribute('aria-hidden','true');
    img.parentElement.classList.add('tall');img.before(bg);}};img.complete?fit():img.addEventListener('load',fit,{once:true});});
  const filterBy=btn=>{
    $$('#pfilter button').forEach(x=>{x.classList.toggle('on',x===btn);x.setAttribute('aria-pressed',x===btn)});
    const f=btn.dataset.f;$$('.proj,.gallery').forEach(c=>c.hidden=!(f==='all'||c.dataset.cat===f));};
  $$('#pfilter button').forEach(btn=>btn.addEventListener('click',()=>filterBy(btn)));
  filterBy($('#pfilter button.on')||$('#pfilter button'));  // first button is selected when the page opens

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
