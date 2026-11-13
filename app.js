const state={user:{name:"You",today:34,currentDay:34,completed:new Set(),xp:0,points:0,streak:0,rank:0,solved:0},days:[],slam:{score:0,combo:0,round:0,cur:null},runnerLen:0};

async function load(){ if(!state.days.length)state.days=await api.days(); const s=await api.state(); if(s.error)throw new Error(s.error); applyState(s); }
function applyState(s){
  const u=state.user;
  u.name=(getUser()||{}).fullName||"You"; u.today=u.currentDay=s.today; u.completed=new Set(s.completed);
  u.xp=u.points=s.xp; u.streak=s.streak; u.rank=s.rank; u.solved=s.completed.length;
}
const Q=n=>state.days[n-1];
const status=n=>state.user.completed.has(n)?"done":n===state.user.today?"today":n<state.user.today?"missed":"future";

const LEVELS=[["Arrays & Hashing","🧱"],["Strings & Windows","🪟"],["Stack & Queue","🥞"],["Lists & Search","🔗"],["Trees","🌳"],["Graphs","🕸️"],["Dynamic Programming","🧩"],["Greedy & Backtracking","🧭"],["Heap & Design","⛰️"],["Final Boss","🐉"]];
function levelOf(d){
  const t=d.topic;
  if(d.day===100) return 9;
  if(/Stack|Queue|Deque/.test(t)) return 2;
  if(/Linked|Binary Search/.test(t)) return 3;
  if(/Tree|BST/.test(t)) return 4;
  if(/Graph|Union|Topolog|Dijkstra|MST|BFS|Euler/.test(t)) return 5;
  if(/Dynamic|DP/.test(t)) return 6;
  if(/Backtrack|Greedy/.test(t)) return 7;
  if(/Heap|Design|Trie/.test(t)) return 8;
  if(/Sliding|Two Pointers|String/.test(t)) return 1;
  return 0;
}
function levels(){
  const L=LEVELS.map(([name,icon],i)=>({i,name,icon,days:[]}));
  state.days.forEach(d=>L[levelOf(d)].days.push(d.day));
  const u=state.user;
  L.forEach(l=>{
    l.done=l.days.filter(d=>u.completed.has(d)).length;
    l.missed=l.days.filter(d=>d<u.today&&!u.completed.has(d)).length;
    l.unlocked=l.days.filter(d=>d<=u.today).length;
    l.xp=l.days.filter(d=>u.completed.has(d)).reduce((s,d)=>s+Q(d).points,0);
    l.st=!l.unlocked?"locked":l.done===l.days.length?"lit":l.missed?"dim":"partial";
  });
  return L;
}

const ascii=String.raw`
                  ___________________________________
                 |  > solve(day)   // 1 problem/day  |
      .-""""-.   |  > O(n)  PASSED  LC . DSA . MLSC  |
     /  _  _  \  |  > streak++                       |
     | (o)(o) |  |_____________________  ___________|
     |   __   |                        \/     (root)
    _\  \__/  /_        .-----------.        /    \
  .'  '------'  '.      |  </>   LC |      (L)    (R)
 /  /|  MLSC  |\  \     '-----+-----'      / \    / \
|__/ |________| \__|    ======+=======    (.)(.)(.)(.)
    ==+======+==         STACK QUEUE TREE GRAPH DP
`;
function nav(active="home"){
  const links = [
    ["home","Home"],
    ["problems","Problems"],
    ["progress","Progress"],
    ["leaderboard","Leaderboard"],
    ["about","About"]
  ];
  return `
    <header class="nav">
      <div class="nav-inner">
        <a href="#home" class="brand">
          <img class="logo" src="${LOGO}" alt="WCE MLSC logo">
          <div>
            <strong>WCE MLSC</strong>
            <small>Microsoft Learn Students’ Club</small>
          </div>
        </a>
        <nav class="navlinks">
          ${links.map(([id,label])=>`<a class="navlink ${active===id?'active':''}" href="#${id}">${label}</a>`).join("")}
        </nav>
        ${getUser()?`<a href="#profile" class="nav-cta">${getUser().fullName.split(" ")[0]} ↗</a>`:`<a href="#login" class="nav-cta">Sign in ↗</a>`}
      </div>
    </header>
  `;
}

function footer(){
  return `<footer class="footer">WCE MLSC • 100 DAYS OF LC • COMPETE CONSISTENTLY • GET SHARPER</footer>`;
}

function shell(content,active){
  document.getElementById("app").innerHTML = `
    ${nav(active)}
    <main class="page">${content}</main>
    ${footer()}
    <div id="toast" class="toast"></div>
  `;
  wireDrag();
}

/* ---------- helpers ---------- */
function dragify(el,drop){
  let x=0,y=0,sx=0,sy=0,on=false,lim=null;
  el.style.touchAction="none";
  el.addEventListener("pointerdown",e=>{
    e.preventDefault();el.setPointerCapture(e.pointerId);on=true;sx=e.clientX-x;sy=e.clientY-y;
    const b=el.closest(".hero,.slam-board");        // stickers can only move inside their own area
    if(b){const er=el.getBoundingClientRect(),br=b.getBoundingClientRect();
      lim={x0:x-(er.left-br.left),x1:x+(br.right-er.right),y0:y-(er.top-br.top),y1:y+(br.bottom-er.bottom)}}
    el.classList.add("lift");el.style.transition="none";
  });
  el.addEventListener("pointermove",e=>{
    if(!on)return;x=e.clientX-sx;y=e.clientY-sy;
    if(lim){x=Math.min(Math.max(x,lim.x0),lim.x1);y=Math.min(Math.max(y,lim.y0),lim.y1)}
    el.style.translate=`${x}px ${y}px`;
  });
  el.addEventListener("pointerup",e=>{
    if(!on)return;on=false;el.classList.remove("lift");
    el.style.transition="translate .5s cubic-bezier(.2,1.4,.3,1)";
    if(drop&&drop(el,e)===false){x=0;y=0;el.style.translate="0 0"}
  });
}
function burst(el,n=16){
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<n;i++){
    const s=document.createElement("i");s.className="confetti";
    const a=Math.random()*6.28,d=50+Math.random()*90;
    s.style.cssText=`left:${cx}px;top:${cy}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;background:hsl(${Math.random()*360},90%,62%)`;
    document.body.appendChild(s);setTimeout(()=>s.remove(),1000);
  }
}
async function syncDay(day,origin){
  const s=await api.sync(day);
  if(s.error){showToast(s.error);return false}
  applyState(s);
  if(s.gained){if(origin)burst(origin,24);showToast(`Day ${day} lit up  +${s.gained} XP collected`)}
  render(true);
  return true;
}
const chip=s=>({done:"✔ SOLVED",today:"● TODAY",missed:"○ MISSED",future:"🔒 LOCKED"}[s]);

/* ---------- heatmap ---------- */
function heat(){
  let h="";
  for(let d=1;d<=100;d++) h+=`<button class="hm ${status(d)}" data-day="${d}" style="--i:${d}" title="Day ${d}: ${Q(d).title}"><span>${d}</span></button>`;
  return h;
}

/* ---------- HOME ---------- */
function home(){
  const u=state.user,t=Q(u.today),lv=levels()[levelOf(t)];
  shell(`
    <section class="hero reveal">
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="badge"><span class="dot"></span> WCE MLSC • 100 DAY CHALLENGE</div>
        <h1>COMPETE<br><span>CONSISTENTLY.</span></h1>
        <p>One day. One problem. One stronger version of you. Solve on LeetCode, let the extension sync, and turn 100 days of DSA into a map you can walk.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#problems">Enter the challenge →</a>
          <a class="btn btn-secondary" href="#progress">Open my map</a>
        </div>
      </div>
      <div class="stickers">
        <div class="sticker s-logo" style="--r:-8deg;left:3%;top:10%"><img src="${LOGO}" alt="WCE MLSC"></div>
        <div class="sticker k-ok" style="--r:-9deg;left:4%;top:42%">Accepted ✔</div>
        <div class="sticker k-brace" style="--r:8deg;left:11%;top:66%">{ }</div>
        <div class="sticker k-pill" style="--r:-6deg;left:2%;top:84%">O(log n)</div>
        <div class="sticker k-tle" style="--r:10deg;right:4%;top:12%">TLE ✘</div>
        <div class="sticker k-fire" style="--r:-8deg;right:6%;top:40%">🔥 ${u.streak}-day streak</div>
        <div class="sticker k-code" style="--r:5deg;right:3%;top:64%">while(!AC)<br>retry();</div>
        <div class="sticker k-coffee" style="--r:-5deg;right:12%;top:84%">☕ + LC</div>
        <div class="sticker k-brain" style="--r:12deg;left:15%;top:20%">🧠</div>
        <span class="sticker-hint">✦ drag the stickers</span>
      </div>
    </section>

    <section class="glass streak-shell reveal">
      <div class="streak-top">
        <div><div class="eyebrow">THE 100 DAY STREAK</div><div class="streak-title">Show up. Leave a mark.</div></div>
        <div class="streak-meta">DAY ${u.today} / 100 • ${u.solved} SOLVED</div>
      </div>
      <div class="heatmap-wrap"><div class="hm-grid" id="heatmap">${heat()}</div></div>
      <div class="streak-legend">
        <span>Tap any day to pop open its problem</span>
        <span class="legend"><i class="lg done"></i> solved <i class="lg missed"></i> missed <i class="lg today"></i> today <i class="lg"></i> locked</span>
      </div>
    </section>

    <section class="mission reveal">
      <article class="glass mission-main">
        <div class="eyebrow">TODAY'S MISSION • DAY ${u.today} • ${lv.icon} ${lv.name.toUpperCase()}</div>
        <h2>${t.title}</h2>
        <p>Today’s single problem is tracked by the extension. No manual checkbox. Your job is simply to solve.</p>
        <div class="tags"><span class="tag green">${t.difficulty.toUpperCase()}</span><span class="tag">${t.topic.toUpperCase()}</span><span class="tag">+${t.points} XP</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn btn-primary" target="_blank" href="${lc(t)}">Solve on LeetCode ↗</a>
          <button class="btn btn-secondary" id="simToday">⚡ Simulate extension sync</button>
        </div>
      </article>
      <aside class="glass mission-side">
        <div><div class="eyebrow">CHALLENGE COMPLETION</div>
          <div class="ring"><div class="ring-content"><strong>${u.solved}%</strong><small>${u.solved} OF 100</small></div></div></div>
        <div class="streak-meta">🔥 ${u.streak} DAY CURRENT STREAK</div>
      </aside>
    </section>

    <section class="stats reveal">
      <div class="glass stat"><span>PROBLEMS SOLVED</span><strong>${u.solved}</strong><small>OF ${u.today} UNLOCKED</small></div>
      <div class="glass stat"><span>XP</span><strong>${u.xp.toLocaleString()}</strong><small>COLLECTED FROM DAYS</small></div>
      <div class="glass stat"><span>RANK</span><strong>#${u.rank}</strong><small>MLSC ARENA</small></div>
      <div class="glass stat"><span>STREAK</span><strong>🔥 ${u.streak}</strong><small>KEEP IT ALIVE</small></div>
    </section>

    <section class="glass slam reveal">
      <div class="slam-head">
        <div><div class="eyebrow">PATTERN SLAM • DRAG • STICK</div>
          <h2>Slap the right pattern on the problem.</h2></div>
        <div class="slam-hud"><b id="slScore">0</b> PTS<span id="slCombo">combo x0</span></div>
      </div>
      <div class="slam-board">
        <div class="slam-target" id="slTarget"><small>WHICH PATTERN SOLVES</small><b id="slQ"></b><em id="slMsg">Drag a sticker onto this card</em></div>
        <div class="tray" id="tray">${LEVELS.slice(0,9).map(([n,ic],i)=>`<div class="sticker pat" data-l="${i}" style="--r:${(i%2?1:-1)*(3+i%4*2)}deg;--c:hsl(${i*40+130},85%,60%)">${ic} ${n}</div>`).join("")}</div>
      </div>
    </section>
  `,"home");

  document.querySelectorAll(".hm").forEach(c=>c.onclick=()=>openDay(Number(c.dataset.day)));
  document.querySelectorAll(".stickers .sticker").forEach(s=>dragify(s));
  document.getElementById("simToday").onclick=e=>syncDay(u.today,e.currentTarget);
  startSlam();
}

/* ---------- Pattern Slam ---------- */
function startSlam(){
  const S=state.slam,pool=[...state.user.completed];
  const day=pool[Math.floor(Math.random()*pool.length)]||1;
  S.cur={day,l:levelOf(Q(day))};
  document.getElementById("slQ").textContent=`Day ${day} · ${Q(day).title}`;
  document.getElementById("slScore").textContent=S.score;
  document.getElementById("slCombo").textContent="combo x"+S.combo;
  const target=document.getElementById("slTarget");
  document.querySelectorAll(".sticker.pat").forEach(el=>dragify(el,(el,e)=>{
    const r=target.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) return false;
    if(Number(el.dataset.l)===S.cur.l){
      S.combo++;S.score+=10*S.combo;burst(el,22);
      target.classList.add("win");
      document.getElementById("slMsg").textContent="✔ Stuck! +"+10*S.combo;
      setTimeout(()=>{target.classList.remove("win");
        document.querySelectorAll(".sticker.pat").forEach(s=>{s.style.transition="none";s.style.translate="0 0"});
        startSlam()},800);
      return true;
    }
    S.combo=0;target.classList.add("shake");
    document.getElementById("slMsg").textContent="✘ Not that one. Think about the pattern.";
    document.getElementById("slCombo").textContent="combo x0";
    setTimeout(()=>target.classList.remove("shake"),500);
    return false;
  }));
}

/* ---------- day popup ---------- */
function openDay(day){
  const q=Q(day);if(!q)return showToast("Day not found");
  const s=status(day),lv=LEVELS[levelOf(q)];
  const o=document.createElement("div");o.className="modal-backdrop";
  o.innerHTML=`<div class="glass modal pop">
    <button class="close" aria-label="Close">×</button>
    <div class="eyebrow">DAY ${q.day} • ${q.points} XP • ${chip(s)}</div>
    <h2>${q.title}</h2>
    <div class="topic-line"><span class="tag green">${q.difficulty.toUpperCase()}</span><span class="tag">${q.topic.toUpperCase()}</span><span class="tag">${lv[1]} ${lv[0].toUpperCase()}</span></div>
    <p style="color:var(--muted);line-height:1.8;font-size:13px">${s==="future"?"This day unlocks later in the challenge. One problem per day, no skipping ahead.":s==="done"?"Solved. Its XP is already in your pocket and its landmark glows on your map.":"Solve it on LeetCode and the extension records it. Missed a day? Solving it late lights its landmark back up and collects its XP."}</p>
    <div style="display:flex;gap:8px;margin-top:22px;flex-wrap:wrap">
      ${s!=="future"?`<a class="btn btn-primary" target="_blank" href="${lc(q)}">Open on LeetCode ↗</a>`:""}
      ${s==="missed"||s==="today"?`<button class="btn btn-secondary" id="simDay">⚡ Simulate sync</button>`:""}
    </div></div>`;
  document.body.appendChild(o);
  const close=()=>o.remove();
  o.querySelector(".close").onclick=close;
  o.onclick=e=>{if(e.target===o)close()};
  const sim=o.querySelector("#simDay");
  if(sim)sim.onclick=async()=>{const el=sim;if(await syncDay(day,el))close()};
}

function openLevel(i){
  const l=levels()[i],pct=Math.round(l.done/l.days.length*100),uns=l.unlocked-l.done,up=l.days.length-l.unlocked;
  const o=document.createElement("div");o.className="modal-backdrop";
  o.innerHTML=`<div class="glass modal pop">
    <button class="close" aria-label="Close">×</button>
    <div class="eyebrow">LEVEL ${i+1} • ${l.st==="lit"?"✦ LIT":l.st==="dim"?"DIM":l.st==="locked"?"LOCKED":"IN PROGRESS"}</div>
    <h2>${l.icon} ${l.name}</h2>
    <div class="lv-stats"><div><b>${l.days.length}</b><span>Questions</span></div><div class="g"><b>${l.done}</b><span>Solved</span></div><div class="r"><b>${uns}</b><span>Unsolved</span></div><div><b>${up}</b><span>Upcoming</span></div></div>
    <div class="bar"><div style="width:${pct}%"></div></div>
    <small class="lv-note">${pct}% complete • ${l.xp} XP collected</small>
    <div class="lv-list">${l.days.map(d=>{const q=Q(d),s=status(d);return `<a class="lv-row ${s}" ${s==="future"?"":`href="${lc(q)}" target="_blank" rel="noopener"`}><span>Day ${d}</span><em>${q.title}</em><i>${chip(s)}</i></a>`}).join("")}</div>
  </div>`;
  document.body.appendChild(o);
  const close=()=>o.remove();
  o.querySelector(".close").onclick=close;
  o.onclick=e=>{if(e.target===o)close()};
}

/* ---------- PROGRESS: adventure map ---------- */
function progress(){
  const u=state.user,L=levels();
  const cur=L.findIndex(l=>l.days.includes(u.today));
  shell(`
    <div class="section-head reveal">
      <div><div class="eyebrow">YOUR JOURNEY</div><h2>The DSA adventure map.</h2></div>
      <p>Each level is a topic. Solve its days and the landmark glows. Miss one and it dims until you solve it late and collect the XP.</p>
    </div>
    <section class="glass advmap reveal">
      <div class="hud"><span>⚡ <b>${u.xp.toLocaleString()}</b> XP</span><span>🔥 <b>${u.streak}</b> streak</span><span>✦ <b>${L.filter(l=>l.st==="lit").length}/10</b> levels lit</span><span>#<b>${u.rank}</b> rank</span></div>
      <div class="mapscroll"><svg id="adv" viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#39ff88"/><stop offset="1" stop-color="#28e8d2"/></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <polygon points="0,640 0,470 120,380 220,470 340,330 470,480 600,360 720,470 850,320 1000,450 1000,640" fill="rgba(75,140,255,.07)"/>
        <polygon points="0,640 0,540 160,470 300,550 460,470 620,560 800,480 1000,560 1000,640" fill="rgba(57,255,136,.05)"/>
        <path id="road" d="M60 560 C220 560 160 400 320 400 S470 560 600 540 S560 330 700 320 S820 520 930 300 S760 140 600 150 S420 60 300 120 S120 150 80 80" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 18"/>
        <path id="trail" d="" fill="none" stroke="url(#g1)" stroke-width="6" stroke-linecap="round" filter="url(#glow)"/>
        <g id="nodes"></g>
        <g id="runner" style="pointer-events:none"><circle r="19" fill="#07152a" stroke="#39ff88" stroke-width="2.5" filter="url(#glow)"/><text text-anchor="middle" dy="7" font-size="20">🧑‍💻</text></g>
      </svg></div>
    </section>
    <section class="lvl-grid reveal">
      ${L.map(l=>`<article class="glass lvl ${l.st}" data-l="${l.i}">
        <div class="lvl-top"><span>${l.icon}</span><small>LEVEL ${l.i+1}</small></div>
        <strong>${l.name}</strong>
        <div class="bar"><div style="width:${Math.round(l.done/l.days.length*100)}%"></div></div>
        <small>${l.done}/${l.days.length} solved${l.missed?` • <b style="color:var(--red)">${l.missed} missed</b>`:""}</small>
      </article>`).join("")}
    </section>
  `,"progress");

  const road=document.getElementById("road"),total=road.getTotalLength(),nodes=document.getElementById("nodes");
  const pos=L.map((l,i)=>road.getPointAtLength(total*(i/9)*.98+total*.01));
  nodes.innerHTML=L.map((l,i)=>`<g class="node ${l.st}${i===cur?" here":""}" data-l="${i}" transform="translate(${pos[i].x},${pos[i].y})">
      <circle r="34" class="halo"/><circle r="27" class="disc"/>
      <text text-anchor="middle" dy="8" font-size="26">${l.icon}</text>
      <text text-anchor="middle" y="52" class="nlabel">${l.name}</text>
      <text text-anchor="middle" y="66" class="nsub">${l.done}/${l.days.length}${l.missed?" · "+l.missed+" missed":""}</text></g>`).join("");
  document.querySelectorAll("#nodes .node,.lvl").forEach(n=>n.onclick=()=>openLevel(Number(n.dataset.l)));

  // runner animates from where it last stood to the current level
  const tgtLen=total*(cur/9)*.98+total*.01,from=state.runnerLen||0,t0=performance.now();
  const trail=document.getElementById("trail"),run=document.getElementById("runner");
  trail.setAttribute("d",road.getAttribute("d"));trail.style.strokeDasharray=`${total} ${total}`;
  (function step(now){
    const k=Math.min(1,(now-t0)/1400),e=1-Math.pow(1-k,3),len=from+(tgtLen-from)*e,p=road.getPointAtLength(len);
    run.setAttribute("transform",`translate(${p.x},${p.y-46})`);
    trail.style.strokeDashoffset=total-len;
    if(k<1)requestAnimationFrame(step);else state.runnerLen=tgtLen;
  })(t0);
}

/* ---------- LEADERBOARD ---------- */
async function leaderboard(){
  const lb=await api.board();
  const top=[lb[1],lb[0],lb[2]],medal=["🥈","🥇","🥉"],cls=["silver","gold","bronze"];
  const rest=lb.slice(3),max=lb[0].xp,me=lb.find(p=>p.you),above=lb[me.rank-2];
  shell(`
    <div class="section-head reveal">
      <div><div class="eyebrow">MLSC ARENA</div><h2>Make consistency visible.</h2></div>
      <p>${me.rank<=3?"You’re on the podium. Defend it.":above?`You are ${(above.xp-me.xp).toLocaleString()} XP behind ${above.name}. Solve a missed day to close the gap.`:""}</p>
    </div>
    <section class="stage reveal">
      <div class="beam"></div>
      ${top.map((p,i)=>`<article class="pod ${cls[i]}${p.you?" you":""}">
        <div class="medal">${medal[i]}</div>
        <div class="ring"><div class="av">${p.name[0]}</div></div>
        <h3>${p.name}${p.you?" (you)":""}</h3>
        <div class="pxp"><b data-xp="${p.xp}">0</b> XP</div>
        <small>🔥 ${p.streak} day streak</small>
        <div class="ped"><span>${p.rank}</span></div>
      </article>`).join("")}
    </section>
    <section class="glass rank-list reveal">
      ${rest.map(p=>`<div class="rank-row ${p.you?"me":""}">
        <span class="rank-no">#${p.rank}</span>
        <span class="person"><span class="avatar">${p.name[0]}</span>${p.name}${p.you?" (you)":""}</span>
        <span class="lbar"><i style="width:${p.xp/max*100}%"></i></span>
        <span class="score">${p.xp.toLocaleString()} XP</span><span class="streak">${p.streak}🔥</span>
      </div>`).join("")}
    </section>
  `,"leaderboard");
  document.querySelectorAll("[data-xp]").forEach(b=>{
    const end=Number(b.dataset.xp),t0=performance.now();
    (function s(n){const k=Math.min(1,(n-t0)/1200);b.textContent=Math.round(end*(1-Math.pow(1-k,3))).toLocaleString();if(k<1)requestAnimationFrame(s)})(t0);
  });
  document.querySelectorAll(".pod .medal").forEach(m=>m.addEventListener("click",()=>burst(m,26)));
}

function question(day){return Q(day)||{title:`Day ${day} Challenge`,topic:"DSA",difficulty:"Medium"}}

function problems(){
  shell(`
    <div class="section-head reveal">
      <div><div class="eyebrow">PROBLEM LAB</div><h2>Your queue.</h2></div>
      <p>Drag problems between zones. In production this order can be stored per participant.</p>
    </div>
    <div class="board reveal">
      <section class="glass column dropzone">
        <div class="column-head"><strong>⚡ TODAY</strong><span class="count">1</span></div>
        <div class="drag-card" draggable="true"><div class="drag-title">Longest Substring Without Repeating Characters</div><div class="drag-meta">Medium · Sliding Window</div></div>
      </section>
      <section class="glass column dropzone">
        <div class="column-head"><strong>→ NEXT UP</strong><span class="count">3</span></div>
        ${[35,36,37].map(day=>{
          const q=question(day);
          return `<div class="drag-card" draggable="true"><div class="drag-title">${q.title}</div><div class="drag-meta">${q.difficulty} · ${q.topic}</div></div>`
        }).join("")}
      </section>
      <section class="glass column dropzone">
        <div class="column-head"><strong>✦ SAVE FOR LATER</strong><span class="count">2</span></div>
        ${[49,50].map(day=>{
          const q=question(day);
          return `<div class="drag-card" draggable="true"><div class="drag-title">${q.title}</div><div class="drag-meta">${q.difficulty} · ${q.topic}</div></div>`
        }).join("")}
      </section>
    </div>
  `,"problems");
}

function about(){
  shell(`
    <div class="section-head reveal">
      <div><div class="eyebrow">THE CHALLENGE</div><h2>100 days. 100 problems.</h2></div>
      <p>A shared DSA expedition where progress is automatic and consistency is the game.</p>
    </div>
    <section class="glass story reveal">
      <img class="story-logo" src="${LOGO}" alt="WCE MLSC">
      <div>
        <div class="eyebrow">ABOUT THE INITIATIVE</div>
        <p>The <b>100 Days of LC</b> challenge is an initiative by the <b>Microsoft Learn Students’ Club at Walchand College of Engineering (WCE MLSC)</b> to help students build the one habit that matters most in problem solving: consistency. Cracking interviews and mastering Data Structures and Algorithms is rarely about marathon weekends. It is about showing up every day, solving a single problem, and letting small wins compound.</p>
        <p>Every participant gets one carefully chosen LeetCode problem per day for 100 days, moving topic by topic from arrays and strings to graphs and dynamic programming. Streaks, XP, landmarks and a campus leaderboard keep the journey motivating, while a community of learners keeps you accountable. Miss a day and you can always come back, light up the landmark and collect your points. The goal is not perfection, it is momentum.</p>
      </div>
    </section>
    <section class="about-grid reveal">
      <article class="glass about-card"><div class="icon">◈</div><h3>One problem a day</h3><p>No endless scrolling. The system gives every participant one focused problem for the day.</p></article>
      <article class="glass about-card"><div class="icon">⌁</div><h3>Extension-powered</h3><p>The browser extension detects actual LeetCode completion. The participant doesn’t manually mark anything as solved.</p></article>
      <article class="glass about-card"><div class="icon">⚡</div><h3>Gamified DSA</h3><p>XP, streaks, landmarks, flash challenges and the MLSC leaderboard turn consistency into something you can feel.</p></article>
    </section>
    <section class="glass reveal" style="margin-top:18px;padding:40px;text-align:center">
      <div class="eyebrow">THE LOOP</div>
      <h2 style="font-size:clamp(35px,5vw,65px);letter-spacing:-.06em;margin:15px 0">Solve → Sync → Collect → Advance.</h2>
      <p style="color:var(--muted);max-width:700px;margin:auto;line-height:1.8;font-size:13px">LeetCode is where the work happens. The extension verifies the work. MLSC makes the journey visible.</p>
    </section>
  `,"about");
}

function auth(mode="signup"){
  const su=mode==="signup";
  shell(`
    <div class="auth-split reveal">
      <aside class="glass auth-art">
        <div class="eyebrow">MLSC • 100 DAYS OF LC</div>
        <pre class="ascii-fig">${ascii}</pre>
        <ul class="perks">
          <li><b>One account, everywhere.</b> Use the same email in the web app and the browser extension so your solves sync to you.</li>
          <li><b>Solve on LeetCode.</b> The extension verifies your submission, nothing to tick manually.</li>
          <li><b>Climb the arena.</b> Streaks and XP rank you on the WCE MLSC leaderboard.</li>
        </ul>
      </aside>
      <section class="glass auth">
        <div class="auth-head">
          <h1>${su?"Start your 100 days.":"Welcome back."}</h1>
          <p>${su?"Create your challenge identity and begin the expedition.":"Your next problem is waiting."}</p>
        </div>
        <form id="authForm" novalidate>
          ${su?`<div class="group"><label>FULL NAME</label><input class="input" name="fullName" required placeholder="As on your college ID" autocomplete="name"></div>`:""}
          <div class="group"><label>EMAIL</label><input class="input" type="email" name="email" required placeholder="you@example.com" autocomplete="email"></div>
          ${su?`<div class="row2"><div class="group"><label>LEETCODE USERNAME</label><input class="input" name="leetcode" required placeholder="e.g. code_ninja"></div>
          <div class="group"><label>YEAR</label><select class="input" name="year"><option>First year</option><option>Second year</option><option>Third year</option><option>Final year</option></select></div></div>
          <div class="group"><label>COLLEGE / BRANCH</label><input class="input" name="college" value="WCE, Sangli" required></div>`:""}
          <div class="group"><label>PASSWORD</label><input class="input" type="password" name="password" required minlength="8" placeholder="At least 8 characters" autocomplete="${su?"new-password":"current-password"}"></div>
          ${su?`<div class="group"><label>CONFIRM PASSWORD</label><input class="input" type="password" name="confirm" required placeholder="Repeat password" autocomplete="new-password"></div>`:""}
          <p id="authErr" class="auth-err"></p>
          <button class="btn btn-primary" style="width:100%;margin-top:8px">${su?"Begin the challenge →":"Enter dashboard →"}</button>
        </form>
        <p style="text-align:center;color:var(--muted);font-size:11px;margin-top:17px">${su?`Already have an account? <a style="color:var(--green);font-weight:800" href="#login">Log in</a>`:`New here? <a style="color:var(--green);font-weight:800" href="#auth">Create account</a>`}</p>
      </section>
    </div>
  `,"");
  document.getElementById("authForm").onsubmit=async e=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.target)),err=document.getElementById("authErr");
    const bad=Object.entries(f).find(([k,v])=>!String(v).trim());
    if(bad)return err.textContent="Please fill in every field.";
    if(!/^\S+@\S+\.\S+$/.test(f.email))return err.textContent="Enter a valid email address.";
    if(f.password.length<8)return err.textContent="Password must be at least 8 characters.";
    if(su&&f.password!==f.confirm)return err.textContent="Passwords do not match.";
    delete f.confirm;
    const r=await (su?api.signup(f):api.login(f));
    if(r.error)return err.textContent=r.error;
    showToast("Welcome, "+r.user.fullName.split(" ")[0]+" ✦");
    location.hash="#home";
  };
}

function profile(){
  shell(`
    <div class="section-head reveal">
      <div><div class="eyebrow">YOUR SPACE</div><h2>Profile.</h2></div>
      <p>Your challenge identity, streak and extension connection.</p>
    </div>
    <div class="progress-grid reveal">
      <section class="glass progress-card">
        <img class="logo" src="${LOGO}" alt="MLSC" style="width:70px;height:70px">
        <h1 style="font-size:42px;letter-spacing:-.06em;margin-top:20px">${state.user.name}</h1>
        <p style="color:var(--muted);font-size:12px;margin-top:7px">WCE MLSC Challenger</p>
        <div style="margin-top:28px">
          <div class="rank-row" style="padding-left:0;padding-right:0"><span>Rank</span><strong>#${state.user.rank}</strong></div>
          <div class="rank-row" style="padding-left:0;padding-right:0"><span>Problems</span><strong>${state.user.solved}</strong></div>
          <div class="rank-row" style="padding-left:0;padding-right:0"><span>XP</span><strong>${state.user.points}</strong></div>
          <div class="rank-row" style="padding-left:0;padding-right:0"><span>Streak</span><strong>${state.user.streak} days</strong></div>
        </div>
      </section>
      <section class="glass progress-card">
        <div class="eyebrow">EXTENSION CONNECTION</div>
        <h2 style="font-size:32px;letter-spacing:-.05em;margin:12px 0">Your progress syncs automatically.</h2>
        <p style="color:var(--muted);font-size:12px;line-height:1.8">The final backend can receive events from the browser extension whenever the participant solves the assigned LeetCode problem.</p>
        <div class="glass" style="padding:18px;margin-top:25px">
          <span style="color:var(--green);font-size:11px">● CONNECTED</span>
          <p style="color:var(--muted);font-size:10px;margin-top:8px">Last sync: just now</p>
          <button class="mini-btn" style="margin-top:12px" onclick="resetDemo()">Reset demo progress</button> <button class="mini-btn" onclick="api.logout();location.hash='#login'">Sign out</button>
        </div>
      </section>
    </div>
  `,"");
}

function showToast(message){
  const t=document.getElementById("toast");
  if(!t)return;
  t.textContent=message;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2400);
}

function wireDrag(){
  let dragged=null;
  document.querySelectorAll(".drag-card").forEach(el=>{
    el.addEventListener("dragstart",()=>{dragged=el;el.classList.add("dragging")});
    el.addEventListener("dragend",()=>{dragged=null;el.classList.remove("dragging")});
  });
  document.querySelectorAll(".dropzone").forEach(zone=>{
    zone.addEventListener("dragover",e=>e.preventDefault());
    zone.addEventListener("drop",e=>{
      e.preventDefault();
      if(dragged){zone.appendChild(dragged);showToast("Queue updated ✦")}
    });
  });
}

async function render(keep){
  try{ await renderInner(keep); }
  catch(err){
    console.error(err);
    document.getElementById("app").innerHTML=`<div style="max-width:620px;margin:12vh auto;padding:28px;border:1px solid rgba(255,110,142,.4);border-radius:20px;background:rgba(12,25,48,.8)">
      <h2 style="margin-bottom:10px">Couldn’t load the app</h2>
      <p style="color:#8fa1bd;line-height:1.7;font-size:14px">Make sure the Node server is running (<code>npm install</code> then <code>npm start</code>) and open <b>http://localhost:3000</b> in the browser. Do not open index.html directly or via Live Server.</p>
      <p style="margin-top:12px;font:12px monospace;color:#ff6e8e">${String(err&&err.message||err)}</p></div>`;
  }
}
async function renderInner(keep){
  await load();
  const r=(location.hash||"#home").slice(1);
  if(r==="home")home();
  else if(r==="problems")problems();
  else if(r==="progress")progress();
  else if(r==="leaderboard")await leaderboard();
  else if(r==="about")about();
  else if(r==="profile")profile();
  else if(r==="login")auth("login");
  else if(r==="auth")auth("signup");
  else home();
  if(keep!==true)window.scrollTo({top:0,behavior:"instant"});
}
window.addEventListener("mousemove",e=>{
  const g=document.getElementById("cursorGlow");
  if(g){g.style.left=e.clientX+"px";g.style.top=e.clientY+"px"}
});
window.addEventListener("hashchange",()=>render());

/* ---------- living background: drifting graph of DSA nodes ---------- */
function initBg(){
  const c=document.createElement("canvas");c.id="bg";document.body.prepend(c);
  const x=c.getContext("2d");let W,H,P=[],m={x:-999,y:-999};
  const size=()=>{W=c.width=innerWidth;H=c.height=innerHeight;P=Array.from({length:Math.min(70,Math.floor(W*H/22000))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:1.5+Math.random()*2}))};
  size();addEventListener("resize",size);
  addEventListener("pointermove",e=>{m.x=e.clientX;m.y=e.clientY});
  (function f(){
    x.clearRect(0,0,W,H);
    P.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      const dm=Math.hypot(p.x-m.x,p.y-m.y);
      x.fillStyle=dm<140?"rgba(57,255,136,.95)":"rgba(120,170,255,.55)";x.beginPath();x.arc(p.x,p.y,p.r,0,6.3);x.fill();
      for(let j=i+1;j<P.length;j++){const q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<150){x.strokeStyle=`rgba(90,150,255,${.22*(1-d/150)})`;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke()}}
      if(dm<170){x.strokeStyle=`rgba(57,255,136,${.5*(1-dm/170)})`;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(m.x,m.y);x.stroke()}
    });
    requestAnimationFrame(f);
  })();
}
document.addEventListener("dragstart",e=>{if(!e.target.closest||!e.target.closest(".drag-card"))e.preventDefault()});
initBg();

render();
