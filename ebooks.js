(function(){
  const params = new URLSearchParams(location.search);
  const qInput = document.getElementById('q');
  if (qInput && params.get('q')) qInput.value = params.get('q');
  const form = document.getElementById('searchForm');
  if (form){
    form.addEventListener('submit', e=>{ e.preventDefault(); const q=(qInput.value||'').trim(); if(!q)return; const u=new URL(location.href); u.searchParams.set('q',q); history.replaceState({},'',u.toString()); search(q); });
    if(qInput&&qInput.value) search(qInput.value);
  }
  const bookEl=document.getElementById('book'); const id=params.get('id'); if(bookEl&&id) load(id);

  function apiUrl(path,q){ const base='https://www.googleapis.com/books/v1'; const key=(window.APP_CONFIG&&window.APP_CONFIG.googleBooksApiKey)||''; const sp=new URLSearchParams(q||{}); if(key) sp.set('key',key); return base+path+(sp.toString()?('?'+sp):''); }

  async function search(q){
    const el=document.getElementById('results'); el.innerHTML='<div class="text-neutral-300">Loading...</div>';
    try{ const r=await fetch(apiUrl('/volumes',{q,maxResults:21,projection:'lite'})); const d=await r.json(); if(!d.items||!d.items.length){ el.innerHTML='<div class="text-neutral-400">No results</div>'; return;} el.innerHTML=d.items.map(card).join(''); }
    catch(e){ el.innerHTML='<div class="text-rose-400">Failed to load results</div>'; }
  }

  function card(it){
    const v=it.volumeInfo||{}; const img=(v.imageLinks&&(v.imageLinks.thumbnail||v.imageLinks.smallThumbnail))||''; const title=esc(v.title||'Untitled'); const authors=(v.authors||[]).join(', '); const id=it.id;
    return '<article class="rounded-2xl border border-white/10 bg-base-800 p-4 hover:border-indigo-500/60 transition">'
      + '<a class="block" href="/ebooks/book.html?id='+encodeURIComponent(id)+'">'
      + '<div class="aspect-[3/4] overflow-hidden rounded-xl bg-black/20 mb-3">'+(img?('<img src="'+img+'" alt="'+title+'" loading="lazy" class="w-full h-full object-cover">'):'')+'</div>'
      + '<div class="text-base font-semibold">'+title+'</div>'
      + '<div class="text-sm text-neutral-400">'+esc(authors)+'</div>'
      + '</a></article>';
  }

  async function load(id){
    bookEl.innerHTML='<div class="text-neutral-300">Loading...</div>';
    try{ const r=await fetch(apiUrl('/volumes/'+encodeURIComponent(id),{projection:'full'})); const d=await r.json(); render(d); }
    catch(e){ bookEl.innerHTML='<div class="text-rose-400">Failed to load book</div>'; }
  }

  function render(it){
    const v=it.volumeInfo||{}; const s=it.saleInfo||{}; const a=it.accessInfo||{};
    const title=v.title||'Untitled'; const authors=(v.authors||[]).join(', '); const desc=v.description||''; const img=(v.imageLinks&&(v.imageLinks.large||v.imageLinks.medium||v.imageLinks.thumbnail))||'';
    const categories=(v.categories||[]).join(', '); const lang=v.language||''; const pages=v.pageCount||''; const publisher=v.publisher||''; const date=v.publishedDate||'';
    try{ const ld={'@context':'https://schema.org','@type':'Book','name':title,'author':(v.authors||[]).map(n=>({'@type':'Person','name':n})),'datePublished':date||undefined,'inLanguage':lang||undefined,'publisher':publisher?({'@type':'Organization','name':publisher}):undefined}; const sTag=document.createElement('script'); sTag.type='application/ld+json'; sTag.textContent=JSON.stringify(ld); document.head.appendChild(sTag);}catch(e){}
    const buy=(s&&s.buyLink)?'<a class="rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500 ring-focus" rel="noopener" target="_blank" href="'+s.buyLink+'">Buy on Google Play</a>':'';
    const preview=(a&&a.webReaderLink)?'<a class="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/15 ring-focus" rel="noopener" target="_blank" href="'+a.webReaderLink+'">Preview</a>':'';
    const retail=(s&&s.retailPrice)?(s.retailPrice.amount+' '+s.retailPrice.currencyCode):'';

    bookEl.innerHTML = ''
      + '<section class="grid md:grid-cols-3 gap-8">'
      +   '<figure class="md:col-span-1"><div class="aspect-[3/4] overflow-hidden rounded-3xl border border-white/10">'+(img?('<img src="'+img+'" alt="'+esc(title)+' cover" class="w-full h-full object-cover">'):'')+'</div></figure>'
      +   '<div class="md:col-span-2">'
      +     '<h1 class="text-3xl sm:text-4xl font-black">'+esc(title)+'</h1>'
      +     '<p class="mt-1 text-neutral-300">'+esc(authors)+'</p>'
      +     '<div class="mt-4 flex items-center gap-3">'+buy+preview+'</div>'
      +     (retail?('<p class="mt-3 text-sm text-neutral-300">Retail: '+esc(retail)+'</p>'):'')
      +     '<div class="mt-6 prose prose-invert max-w-none">'+sanitize(desc)+'</div>'
      +     '<dl class="mt-6 grid sm:grid-cols-2 gap-4 text-sm text-neutral-300">'
      +       (categories?('<div><dt class="text-neutral-400">Categories</dt><dd>'+esc(categories)+'</dd></div>'):'')
      +       (pages?('<div><dt class="text-neutral-400">Pages</dt><dd>'+pages+'</dd></div>'):'')
      +       (publisher?('<div><dt class="text-neutral-400">Publisher</dt><dd>'+esc(publisher)+'</dd></div>'):'')
      +       (date?('<div><dt class="text-neutral-400">Published</dt><dd>'+esc(date)+'</dd></div>'):'')
      +       (lang?('<div><dt class="text-neutral-400">Language</dt><dd>'+esc(lang.toUpperCase())+'</dd></div>'):'')
      +     '</dl>'
      +     '<p class="mt-6 text-xs text-neutral-400">Metadata provided by Google Books API. Purchasing occurs on Google Play. You are not buying from this site.</p>'
      +   '</div>'
      + '</section>';
  }

  function esc(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }
  function sanitize(h){ const d=document.createElement('div'); d.innerHTML=h||''; d.querySelectorAll('script,style').forEach(n=>n.remove()); return d.innerHTML; }
})();