/* AroGate - lecture gate through an Arolinks short link. One pass (cookie) unlocks every site of the hub for 24 hours; shows a "generate key" screen on open. */
(function () {
  "use strict";
  var OK = "aro_ok", NONCE = "aro_n", HOURS = 24, MIN_MS = 8000;
  function gc(k) { var m = document.cookie.match(new RegExp("(?:^|; )" + k + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; }
  function sc(k, v, sec) { document.cookie = k + "=" + encodeURIComponent(v) + "; path=/; max-age=" + sec + "; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : ""); }
  function dc(k) { document.cookie = k + "=; path=/; max-age=0"; }

  // coming back from the short link: ?aro=<nonce>
  try {
    var u = new URL(location.href), v = u.searchParams.get("aro");
    if (v) {
      var n = gc(NONCE).split(".");
      if (n[0] && n[0] === v && Date.now() - Number(n[1]) >= MIN_MS) sc(OK, "1", HOURS * 3600);
      dc(NONCE);
      u.searchParams.delete("aro");
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
    }
  } catch (e) {}

  var busy = false;
  // returns true when the visitor is already unlocked; otherwise sends them to the short link and returns false
  function check(proceed) {
    if (gc(OK) === "1") return true;
    if (busy) return false;
    busy = true;
    var nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    var back = new URL(location.href);
    back.searchParams.set("aro", nonce);
    sc(NONCE, nonce + "." + Date.now(), 1800);
    fetch("/api/arolinks?url=" + encodeURIComponent(back.href))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.shortenedUrl) { location.href = j.shortenedUrl; return; }
        throw new Error("no short link");
      })
      .catch(function () { // never lock people out if the service is down: 10 minutes free pass
        busy = false; dc(NONCE); sc(OK, "1", 600);
        if (typeof proceed === "function") proceed();
      });
    return false;
  }

  // full-screen "generate key" screen - same look as the site's own modals (logo, fonts, buttons, theme colours)
  function showWall() {
    if (gc(OK) === "1" || document.getElementById("aro-wall")) return;
    var st = document.createElement("style");
    st.textContent =
      "#aro-wall{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:18px;overflow-y:auto;background:rgba(8,10,15,.86);background:color-mix(in srgb,var(--bg,#080a0f) 88%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:var(--text,#f4f6fb);font-family:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}" +
      "#aro-wall .m{position:relative;width:min(100%,420px);padding:28px 24px 24px;text-align:center;border:1px solid var(--line-strong,rgba(255,255,255,.16));border-radius:22px;background:var(--panel-solid,#11151f);box-shadow:var(--shadow,0 24px 70px rgba(0,0,0,.32))}" +
      "#aro-wall .bm{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;overflow:hidden;display:block;border:2px solid rgba(166,156,255,.5);box-shadow:0 8px 26px rgba(139,124,255,.32)}" +
      "#aro-wall .bm img{width:100%;height:100%;object-fit:cover;display:block}" +
      "#aro-wall .tt{margin:0 0 16px;font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;letter-spacing:.04em;line-height:1.1}" +
      "#aro-wall .tt span{color:var(--brand-bright,#a69cff)}" +
      "#aro-wall .fi{width:40px;height:40px;margin:0 auto 14px;display:grid;place-items:center;border-radius:12px;color:var(--brand-bright,#a69cff);background:rgba(139,124,255,.13)}" +
      "#aro-wall .fi svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
      "#aro-wall h2{margin:0 0 8px;font:600 26px 'Space Grotesk',sans-serif;letter-spacing:-.04em}" +
      "#aro-wall p{margin:0;color:var(--muted,#8d96a8);font-size:13px;line-height:1.55}" +
      "#aro-wall ul{display:grid;gap:10px;margin:20px 0 24px;padding:0;list-style:none;text-align:left;color:var(--muted-bright,#b4bdcd);font-size:12px}" +
      "#aro-wall li{display:flex;align-items:center;gap:9px}" +
      "#aro-wall li::before{content:'\\2713';flex:none;display:grid;place-items:center;width:18px;height:18px;border-radius:50%;color:#0d2623;background:var(--mint,#55ddbb);font-weight:800;font-size:11px}" +
      "#aro-wall .btn{display:flex;justify-content:center;align-items:center;gap:9px;width:100%;min-height:46px;padding:0 18px;border:1px solid transparent;border-radius:12px;color:#fff;background:linear-gradient(135deg,#9487ff,#6c5bed);box-shadow:0 10px 24px rgba(109,91,237,.24);font:700 13px 'DM Sans',sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s}" +
      "#aro-wall .btn:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(109,91,237,.36)}#aro-wall .btn:active{transform:scale(.96)}" +
      "#aro-wall .btn svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#aro-wall .btn[disabled]{opacity:.65}";
    document.head.appendChild(st);
    var w = document.createElement("div");
    w.id = "aro-wall";
    w.innerHTML = '<div class="m">' +
      '<span class="bm"><img src="assets/icon-192.png" alt="CODEX STUDYS" referrerpolicy="no-referrer"></span>' +
      '<div class="tt">CODEX <span>STUDYS</span></div>' +
      '<div class="fi"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></div>' +
      '<h2>Free 24H Access</h2>' +
      '<p>Complete a quick task to generate your access key instantly.</p>' +
      '<ul><li>Valid for exactly 24 Hours</li><li>Direct video playback</li><li>Please disable AdBlockers</li></ul>' +
      '<button type="button" class="btn" id="aro-btn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8l4 4-4 4"/></svg><span>GENERATE KEY</span></button>' +
      '</div>';
    document.body.appendChild(w);
    document.documentElement.style.overflow = "hidden";
    document.getElementById("aro-btn").addEventListener("click", function () {
      var b = this; b.disabled = true; b.querySelector("span").textContent = "PLEASE WAIT...";
      check(function () { w.remove(); document.documentElement.style.overflow = ""; });
    });
  }
  function boot() { showWall(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.AroGate = { check: check };
})();
