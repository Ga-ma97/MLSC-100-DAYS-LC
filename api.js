/* =====================================================================
   api.js  -  the ONLY file that talks to data.
   Demo mode  : CONFIG.API_BASE = ""  -> localStorage (no server needed)
   Real backend: set CONFIG.API_BASE = "https://your-api.example.com"
   Endpoint contract is documented in BACKEND.md. Every function below maps
   to exactly one endpoint, so merging = filling in the server side.
   ===================================================================== */
const CONFIG={API_BASE:"",TODAY:34}; // TODAY is only used in demo mode
const tok=()=>{try{return localStorage.getItem("mlsc_token")}catch(e){return null}};
async function http(method,path,body){
  const r=await fetch(CONFIG.API_BASE+path,{method,headers:{"Content-Type":"application/json",...(tok()?{Authorization:"Bearer "+tok()}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));
  return r.ok?j:{error:j.error||j.message||"Request failed ("+r.status+")"};
}
const lc=q=>q.url||"https://leetcode.com/problems/"+q.title.toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g," ").replace(/ /g,"-")+"/";

/* ---- demo backend (localStorage) ---- */
const BOARD=[{name:"Mira",xp:3850,streak:33},{name:"Aarav",xp:3600,streak:28},{name:"Rohan",xp:3400,streak:25},{name:"Ananya",xp:3050,streak:21},{name:"Kabir",xp:2700,streak:14},{name:"Ishita",xp:2450,streak:11}];
const MISSED=[5,12,21,29],TODAY=CONFIG.TODAY;
const fresh=()=>({completed:Array.from({length:TODAY-1},(_,i)=>i+1).filter(d=>!MISSED.includes(d))});
const ls={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let db=ls.get("mlsc100");
if(!db||!Array.isArray(db.completed))db=fresh();
const xpOf=d=>(DAYS[d-1]||{}).points||100;
const userXp=()=>db.completed.reduce((s,d)=>s+xpOf(d),0);
function userStreak(){const set=new Set(db.completed);let d=set.has(TODAY)?TODAY:TODAY-1,n=0;while(d>0&&set.has(d)){n++;d--}return n}
function localBoard(){const me={name:(getUser()||{}).fullName||"You",xp:userXp(),streak:userStreak(),you:true};return [...BOARD,me].sort((a,b)=>b.xp-a.xp).map((p,i)=>({...p,rank:i+1}))}
function localState(){return{today:TODAY,completed:db.completed,xp:userXp(),streak:userStreak(),rank:localBoard().find(p=>p.you).rank}}
const getUser=()=>ls.get("mlsc_user");

const api={
  async days(){return CONFIG.API_BASE?http("GET","/api/days"):DAYS},                 // GET  /api/days
  async state(){return CONFIG.API_BASE?http("GET","/api/state"):localState()},       // GET  /api/state
  async board(){return CONFIG.API_BASE?http("GET","/api/leaderboard"):localBoard()}, // GET  /api/leaderboard
  async sync(day){                                                                   // POST /api/sync/:day
    if(CONFIG.API_BASE)return http("POST","/api/sync/"+day);
    if(!(day>=1&&day<=TODAY))return{error:"That day is not unlocked yet"};
    const had=db.completed.includes(day);
    if(!had){db.completed.push(day);db.completed.sort((a,b)=>a-b);ls.set("mlsc100",db)}
    return{...localState(),gained:had?0:xpOf(day),day};
  },
  async signup(f){                                                                   // POST /api/auth/signup
    if(CONFIG.API_BASE){const r=await http("POST","/api/auth/signup",f);if(r.token)localStorage.setItem("mlsc_token",r.token);if(r.user)ls.set("mlsc_user",r.user);return r}
    const users=ls.get("mlsc_users")||[];
    if(users.some(u=>u.email===f.email))return{error:"An account with this email already exists"};
    const user={fullName:f.fullName,email:f.email,leetcode:f.leetcode,college:f.college,year:f.year};
    users.push(user);ls.set("mlsc_users",users);ls.set("mlsc_user",user);return{user};   // DEMO: password is never stored
  },
  async login(f){                                                                    // POST /api/auth/login
    if(CONFIG.API_BASE){const r=await http("POST","/api/auth/login",f);if(r.token)localStorage.setItem("mlsc_token",r.token);if(r.user)ls.set("mlsc_user",r.user);return r}
    const u=(ls.get("mlsc_users")||[]).find(u=>u.email===f.email);
    if(!u)return{error:"No account found. Please sign up first."};
    ls.set("mlsc_user",u);return{user:u};
  },
  logout(){ls.del("mlsc_user");try{localStorage.removeItem("mlsc_token")}catch(e){}}
};
function resetDemo(){db=fresh();ls.set("mlsc100",db);render(true);showToast("Demo progress reset")}
