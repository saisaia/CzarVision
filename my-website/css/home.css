/* ================== RESET ================== */
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
  background: linear-gradient(180deg,#070707,#0b0b0b);
  color:#fff;-webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* ================== NAVBAR ================== */
.navbar{
  position:sticky;top:0;z-index:9999;display:flex;justify-content:space-between;align-items:center;
  padding:12px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);
  border-bottom:1px solid rgba(255,255,255,0.03);backdrop-filter:blur(6px)
}
.brand {display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit}
.logo{height:44px;filter:brightness(0) invert(1);transition:transform .18s}
.brand-text{font-weight:700;letter-spacing:.6px}
.nav-actions{display:flex;align-items:center;gap:12px}
.nav-links{display:flex;gap:16px;align-items:center}
.nav-links a{color:rgba(255,255,255,0.9);text-decoration:none;font-weight:600}
.icon-btn, .search-input {background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);padding:8px 10px;border-radius:10px;color:var(--muted, #aab0b6)}

/* ================== BANNER ================== */
.banner{height:70vh;max-height:820px;background-size:cover;background-position:center;border-radius:0;position:relative;display:flex;align-items:flex-end;padding:40px 60px}
.banner-inner{z-index:2;max-width:720px}
#banner-title{font-size:clamp(28px,5vw,44px);line-height:1;margin-bottom:10px;font-weight:800}
#banner-overview{color:rgba(255,255,255,0.85);max-width:720px;margin-bottom:18px;opacity:0.95}
.banner-cta{display:flex;gap:12px}
.btn{padding:10px 16px;border-radius:10px;border:none;cursor:pointer;font-weight:700}
.btn.primary{background:#fff;color:#000}
.btn.ghost{background:rgba(0,0,0,0.45);color:#fff;border:1px solid rgba(255,255,255,0.06)}
.banner-dim{position:absolute;left:0;right:0;bottom:0;height:220px;background:linear-gradient(180deg,transparent,#0b0b0b);}

/* ================== ROWS ================== */
.container{max-width:1200px;margin:20px auto;padding:0 18px}
.row{margin:18px 0}
.row h2{font-size:18px;margin-bottom:12px}
.list{display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
.card{min-width:150px;flex:0 0 auto;border-radius:8px;overflow:hidden;position:relative;cursor:pointer;transition:transform .25s,box-shadow .25s}
.card img{width:100%;height:220px;object-fit:cover;display:block}
.card .title{position:absolute;left:8px;bottom:8px;background:linear-gradient(180deg,rgba(0,0,0,0.6),rgba(0,0,0,0.9));padding:6px 8px;border-radius:6px;font-size:13px}
.card:hover{transform:translateY(-10px);box-shadow:0 18px 50px rgba(0,0,0,0.7)}

/* ================== MODAL ================== */
.modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:9999;padding:20px}
.modal.show{display:flex}
.modal-content{width:100%;max-width:980px;background:linear-gradient(180deg,#121212,#0f0f0f);padding:18px;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,0.7);transform:translateY(8px);opacity:0;transition:all .28s}
.modal.show .modal-content{transform:none;opacity:1}
.modal-body{display:flex;gap:18px;align-items:flex-start}
.modal-body img{width:34%;border-radius:8px;object-fit:cover}
.modal-text{flex:1}
.modal-close{position:absolute;top:12px;right:12px;background:transparent;border:none;color:#f66;font-size:22px;cursor:pointer}
.player-wrap iframe{width:100%;height:420px;border-radius:8px;border:0;margin-top:12px}

/* ================== SEARCH MODAL ================== */
.search-modal{position:fixed;inset:0;display:none;align-items:flex-start;padding-top:80px;background:rgba(0,0,0,0.95);z-index:10000}
.search-modal.show{display:flex}
.search-panel{margin:auto;width:100%;max-width:920px;background:linear-gradient(180deg,#0f0f0f,#0c0c0c);padding:18px;border-radius:12px;border:1px solid rgba(255,255,255,0.03)}
.search-query{width:100%;padding:12px;border-radius:10px;border:none;background:rgba(255,255,255,0.02);color:#fff;outline:none}
.search-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-top:12px;max-height:60vh;overflow:auto}
.search-results .result img{width:100%;border-radius:8px;display:block}

/* ================== FOOTER ================== */
.footer{background:#0f0f0f;padding:24px 18px;text-align:center;color:#9aa0a6}
.footer-links{display:flex;justify-content:center;gap:14px;margin-top:8px}
.footer-links a{color:#c94;color:inherit;text-decoration:none}

/* ================== UTIL ANIMATIONS ================== */
@keyframes fadeUp {to{opacity:1;transform:none}}
.fade-up{opacity:0;transform:translateY(8px);animation:fadeUp .6s forwards}

/* ================== RESPONSIVE ================== */
@media (max-width:900px){
  .banner{height:52vh;padding:30px}
  .card img{height:170px}
  .modal-body{flex-direction:column}
  .modal-body img{width:100%}
  .player-wrap iframe{height:260px}
}
@media (max-width:480px){
  .navbar{padding:10px}
  .brand-text{display:none}
  .banner{padding:22px}
  #banner-title{font-size:20px}
  .list{gap:8px}
}
