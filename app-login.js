(function(){
  const s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.defer=true; document.head.appendChild(s);
})();
window.openApp=function(slug){
  const cfg=window.APP_CONFIG||{}; const target=(cfg.reactRoutes&&cfg.reactRoutes[slug])||'/'; const clientId=cfg.googleClientId;
  if(!clientId){ location.href=target; return; }
  function prompt(){
    try{
      google.accounts.id.initialize({client_id:clientId,callback:(res)=>{const t=encodeURIComponent(res.credential||''); location.href=target+(t?('?token='+t):'');}});
      google.accounts.id.prompt();
    }catch(e){ location.href=target; }
  }
  if(!(window.google&&window.google.accounts&&window.google.accounts.id)){ const t=setInterval(()=>{ if(window.google&&window.google.accounts&&window.google.accounts.id){ clearInterval(t); prompt(); }},200); }
  else prompt();
};