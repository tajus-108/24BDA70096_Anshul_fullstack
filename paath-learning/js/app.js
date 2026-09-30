/* =====================================================================
   HELPERS
   ===================================================================== */
const $=s=>document.querySelector(s);
const byId=Object.fromEntries(COURSES.map(c=>[c.id,c]));
const bookById=Object.fromEntries(BOOKS.map(b=>[b.id,b]));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtN=n=>n>=1000?(n/1000).toFixed(1).replace(".0","")+"k":String(n);
const DAY=86400000;

const mem={};
const store={
  get(k){try{const v=localStorage.getItem(k);if(v!==null)return v}catch(e){}return k in mem?mem[k]:null},
  set(k,v){mem[k]=v;try{localStorage.setItem(k,v)}catch(e){}},
  del(k){delete mem[k];try{localStorage.removeItem(k)}catch(e){}}
};
const load=(k,d)=>{try{const v=store.get(k);return v?JSON.parse(v):d}catch(e){return d}};
const save=(k,v)=>store.set(k,JSON.stringify(v));
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h>>>0)};

const IC={
  play:'<svg class="i" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause:'<svg class="i" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  check:'<svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  back:'<svg class="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',
  file:'<svg class="i" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  task:'<svg class="i" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>'
};

/* patterned cover art, one pattern per course */
function pattern(type,seed){
  let s="";
  if(type==="dots"){for(let y=12;y<130;y+=20)for(let x=((y-12)/20)%2?12:22;x<215;x+=20)s+=`<circle cx="${x}" cy="${y}" r="${2+((x+y)/20|0)%4}"/>`;return `<g fill="#fff" fill-opacity=".22">${s}</g>`}
  if(type==="stripes"){for(let i=-120;i<240;i+=18)s+=`<line x1="${i}" y1="0" x2="${i+120}" y2="120"/>`;return `<g stroke="#fff" stroke-opacity=".2" stroke-width="7">${s}</g>`}
  if(type==="rings"){for(let r=16;r<130;r+=18)s+=`<circle cx="160" cy="34" r="${r}"/>`;return `<g fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3">${s}</g>`}
  if(type==="blocks"){for(let y=0;y<120;y+=20)for(let x=0;x<200;x+=20){const o=((x*7+y*13+seed)%6)/14;if(o>.08)s+=`<rect x="${x+2}" y="${y+2}" width="16" height="16" rx="3" fill-opacity="${o.toFixed(2)}"/>`}return `<g fill="#fff">${s}</g>`}
  for(let k=0;k<6;k++){let d="M0 "+(60+k*12);for(let x=0;x<=200;x+=10)d+=` L${x} ${(60+k*12+Math.sin(x/22+k)*9).toFixed(1)}`;s+=`<path d="${d}"/>`}
  return `<g fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3">${s}</g>`;
}
function svgPat(c,cls="pat"){return `<svg class="${cls}" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${pattern(c.pat,c.id.charCodeAt(0))}</svg>`}
const grad=cat=>`linear-gradient(135deg,${CATS[cat][0]},${CATS[cat][1]})`;
const coverHtml=(c,extra="",tag=true)=>`<div class="cover" style="background:${grad(c.cat)};${extra}">${svgPat(c)}${tag?`<span class="tag">${esc(c.cat)}</span>`:""}</div>`;

/* =====================================================================
   STATE
   ===================================================================== */
let user=null,data=null,query="",catFilter="All",lastTab="home";
let cur=null,playTimer=null,playPct=0,playing=false;

const persist=()=>{if(user)save("paath_data_"+user.email,data)};
const dur=(c,i)=>5+((c.id.length*3+i*7+c.hrs)%14);
function lessonsDone(id){return data.courses[id]?data.courses[id].done.length:0}
function statusOf(id){
  const p=data.courses[id];if(!p)return"none";
  const n=byId[id].lessons.length;
  return p.done.length>=n?"done":p.done.length>0?"prog":"new";
}
function touch(id){
  const now=Date.now();
  if(!data.courses[id])data.courses[id]={done:[],tasks:[],first:now,last:now};
  else data.courses[id].last=now;
  persist();
}
function ago(ts){
  const d=Math.floor((Date.now()-ts)/DAY);
  if(d<=0)return"Today";if(d===1)return"Yesterday";if(d<7)return d+" days ago";
  return new Date(ts).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}
function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2400);
}

/* =====================================================================
   AUTH
   ===================================================================== */
let mode="signup",picked=new Set();
function drawAuth(){
  $("#artStack").innerHTML=["py","ux","se"].map(id=>{const c=byId[id];return `<div class="cover" style="background:${grad(c.cat)}">${svgPat(c)}<span class="name">${esc(c.title)}</span></div>`}).join("");
  $("#interestChips").innerHTML=CAT_NAMES.map(c=>`<button type="button" class="chip" data-a="interest" data-v="${esc(c)}">${esc(c)}</button>`).join("");
}
function setMode(m){
  mode=m;
  const su=m==="signup";
  document.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.v===m));
  $("#fName").classList.toggle("hidden",!su);
  $("#fInterests").classList.toggle("hidden",!su);
  $("#authTitle").textContent=su?"Create your account":"Welcome back";
  $("#authSub").textContent=su?"Free to join. Choose what you want to learn and we will suggest courses.":"Log in to continue your courses.";
  $("#authBtn").textContent=su?"Create account":"Log in";
  $("#pass").autocomplete=su?"new-password":"current-password";
  $("#authErr").textContent="";
}
function submitAuth(e){
  e.preventDefault();
  const name=$("#name").value.trim(),email=$("#email").value.trim().toLowerCase(),pass=$("#pass").value;
  const err=m=>{$("#authErr").textContent=m};
  const accounts=load("paath_accounts",{});
  if(!/^\S+@\S+\.\S+$/.test(email))return err("Enter a valid email address, like you@example.com.");
  if(mode==="signup"){
    if(!name)return err("Enter your name so we can greet you.");
    if(pass.length<6)return err("Choose a password with at least 6 characters.");
    if(accounts[email])return err("An account with this email already exists. Switch to Log in.");
    accounts[email]={name,h:hash(pass),interests:[...picked]};
    save("paath_accounts",accounts);
    startSession(email,accounts[email]);
  }else{
    const a=accounts[email];
    if(!a)return err("No account found for this email. Switch to Sign up to create one.");
    if(a.h!==hash(pass))return err("The password is incorrect. Try again.");
    startSession(email,a);
  }
}
function demoLogin(){
  const email="demo@paath.app",accounts=load("paath_accounts",{});
  if(!accounts[email]){
    accounts[email]={name:"Demo Learner",h:hash("demo1234"),interests:["Programming","Design"]};
    save("paath_accounts",accounts);
  }
  if(!load("paath_data_"+email,null)){
    const n=Date.now();
    save("paath_data_"+email,{
      courses:{
        py:{done:[0,1,2,3,4,5],tasks:[0,1],first:n-24*DAY,last:n-12*DAY},
        ux:{done:[0,1,2,3],tasks:[0],first:n-9*DAY,last:n-2*DAY},
        web:{done:[0,1],tasks:[],first:n-5*DAY,last:n-DAY},
        pf:{done:[],tasks:[],first:n-30*DAY,last:n-30*DAY}
      },saved:["b1","b3"]});
  }
  startSession(email,accounts[email]);
}
function startSession(email,acc){
  user={email,name:acc.name,interests:acc.interests||[]};
  data=load("paath_data_"+email,{courses:{},saved:[]});
  save("paath_session",email);
  $("#auth").classList.add("hidden");$("#shell").classList.remove("hidden");
  $("#avatar").textContent=(user.name[0]||"?").toUpperCase();
  $("#mName").textContent=user.name;$("#mEmail").textContent=user.email;
  query="";$("#q").value="";
  if(!location.hash||location.hash==="#/library"&&false)location.hash="#/home";
  route();
}
function logout(){
  stopPlay();user=null;data=null;store.del("paath_session");
  $("#shell").classList.add("hidden");$("#auth").classList.remove("hidden");
  $("#menu").classList.add("hidden");
  $("#pass").value="";location.hash="";setMode("login");
}

/* =====================================================================
   ROUTING
   ===================================================================== */
function route(){
  stopPlay();
  if(!user)return;
  const h=location.hash||"#/home";
  const m=h.match(/^#\/course\/(\w+)/);
  if(m&&byId[m[1]]){
    const c=byId[m[1]];touch(c.id);
    const firstUndone=c.lessons.findIndex((_,i)=>!data.courses[c.id].done.includes(i));
    cur={id:c.id,lesson:Math.max(0,firstUndone),tab:"lessons",quiz:{i:0,score:0,picked:null,finished:false}};
    renderCourse();
  }else if(h.startsWith("#/library")){lastTab="library";cur=null;renderLibrary()}
  else{lastTab="home";cur=null;renderHome()}
  $("#navHome").classList.toggle("on",lastTab==="home");
  $("#navLib").classList.toggle("on",lastTab==="library");
  window.scrollTo(0,0);
}

/* =====================================================================
   COMPONENTS
   ===================================================================== */
function courseCard(c,extra=""){
  const st=statusOf(c.id),n=c.lessons.length,d=lessonsDone(c.id);
  return `<a class="card" href="#/course/${c.id}">
    ${coverHtml(c)}
    <div class="body">
      <h3>${esc(c.title)}</h3><p class="by">${esc(c.by)}</p>
      <div class="meta"><span class="lvl">${c.level}</span><span>${c.hrs} hours</span><span class="star">${c.rating.toFixed(1)} ★</span></div>
      ${st==="prog"||st==="done"?`<div class="bar"><i style="width:${Math.round(d/n*100)}%"></i></div><div class="bar-label">${st==="done"?"Completed":d+" of "+n+" lessons done"}</div>`:`<div class="bar-label" style="margin-top:10px">${fmtN(c.learners)} learners</div>`}
      ${extra}
    </div></a>`;
}
function bookCover(b,cls=""){
  return `<div class="bk ${cls}" style="background:linear-gradient(160deg,${b.c[0]},${b.c[1]})"><b>${esc(b.title)}</b><small>${esc(b.author)}</small></div>`;
}
function bookCard(b){
  return `<button class="book" data-a="book" data-id="${b.id}" aria-label="${esc(b.title)} by ${esc(b.author)}">
    ${bookCover(b)}<p class="t">${esc(b.title)}</p><p class="a">${esc(b.author)}</p></button>`;
}
function progressCard(c){
  const n=c.lessons.length,d=lessonsDone(c.id);
  return courseCard(c);
}

/* =====================================================================
   HOME
   ===================================================================== */
function renderHome(){
  const q=query.trim().toLowerCase();
  const main=$("#main");
  $("#qClear").classList.toggle("hidden",!q);
  if(q){
    const words=q.split(/\s+/);
    const hit=c=>{const t=(c.title+" "+c.cat+" "+c.by+" "+c.tags+" "+c.desc).toLowerCase();return words.every(w=>t.includes(w))};
    const cs=COURSES.filter(hit).sort((a,b)=>b.learners-a.learners);
    const bs=BOOKS.filter(b=>words.every(w=>(b.title+" "+b.author+" "+b.cat).toLowerCase().includes(w)));
    main.innerHTML=`
      <div class="sec-head" style="margin-top:0"><div><h2>${cs.length?cs.length+" course"+(cs.length>1?"s":""):"No courses"} for “${esc(query.trim())}”</h2><p>Results update as you type.</p></div><button class="btn ghost small" data-a="clearSearch">Clear search</button></div>
      ${cs.length?`<div class="grid">${cs.map(c=>courseCard(c)).join("")}</div>`:
        `<div class="empty"><b>Nothing matches that yet</b>Check the spelling or try a broader topic.<div class="chips">${["python","design","english","marketing","physics"].map(s=>`<button class="chip" data-a="suggestSearch" data-v="${s}">${s}</button>`).join("")}</div></div>`}
      ${bs.length?`<div class="sec"><div class="sec-head"><h2>Books that match</h2></div><div class="shelf">${bs.map(bookCard).join("")}</div></div>`:""}`;
    return;
  }
  const inprog=Object.keys(data.courses).filter(id=>statusOf(id)==="prog").sort((a,b)=>data.courses[b].last-data.courses[a].last)[0];
  const popular=COURSES.filter(c=>catFilter==="All"||c.cat===catFilter).sort((a,b)=>b.learners-a.learners).slice(0,8);
  const first=user.name.split(" ")[0];
  let resume="";
  if(inprog){
    const c=byId[inprog],n=c.lessons.length,d=lessonsDone(inprog);
    resume=`<a class="resume" href="#/course/${c.id}" style="color:inherit">
      ${coverHtml(c,"",false)}
      <div class="txt"><p class="sm">Continue where you stopped</p><h3>${esc(c.title)}</h3>
      <div class="bar"><i style="width:${Math.round(d/n*100)}%"></i></div><div class="bar-label">${d} of ${n} lessons done. Next: ${esc(c.lessons[d]||c.lessons[n-1])}</div></div>
      <span class="btn">Resume</span></a>`;
  }
  main.innerHTML=`
    <div class="hello"><h1>Hi ${esc(first)}, what will you learn today?</h1><p>Search above, or start with what other learners are taking.</p></div>
    ${resume}
    <section class="sec">
      <div class="sec-head"><div><h2>Popular courses</h2><p>Most joined by learners this month.</p></div></div>
      <div class="cats" role="group" aria-label="Filter by topic" style="margin-bottom:16px">
        ${["All",...CAT_NAMES].map(c=>`<button class="chip ${c===catFilter?"on":""}" data-a="filterCat" data-v="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
      <div class="grid">${popular.map(c=>courseCard(c)).join("")}</div>
    </section>
    <section class="sec">
      <div class="sec-head"><div><h2>Popular books</h2><p>Tap a book to read about it and save it to your library.</p></div></div>
      <div class="shelf">${BOOKS.map(bookCard).join("")}</div>
    </section>`;
}

/* =====================================================================
   COURSE PAGE
   ===================================================================== */
function renderCourse(){
  const y=window.scrollY;
  const c=byId[cur.id],p=data.courses[c.id],n=c.lessons.length,d=p.done.length;
  const nextIdx=c.lessons.findIndex((_,i)=>!p.done.includes(i));
  const L=c.lessons[cur.lesson];
  const tabs=[["lessons","Lessons"],["notes","Notes and files"],["books","Books"],["tasks","Assignments"],["quiz","Practice quiz"]];
  $("#main").innerHTML=`
    <a class="crumb" href="#/${lastTab}">${IC.back}Back to ${lastTab==="library"?"library":"home"}</a>
    <section class="c-hero" style="background:${grad(c.cat)}">
      ${svgPat(c)}
      <span class="pill" style="align-self:flex-start;background:rgba(255,255,255,.92);color:#16204A;margin-bottom:12px">${esc(c.cat)}</span>
      <h1>${esc(c.title)}</h1>
      <div class="row"><span>By ${esc(c.by)}</span><span>${c.level}</span><span>${c.hrs} hours</span><span>${c.rating.toFixed(1)} ★ from ${fmtN(c.learners)} learners</span></div>
      <div class="bar"><i style="width:${Math.round(d/n*100)}%"></i></div>
      <div class="bar-label">${d===n?"You completed this course":d+" of "+n+" lessons done"}</div>
    </section>

    <section class="player" aria-label="Lesson player">
      <div class="screen">
        <span class="now">Lesson ${cur.lesson+1} of ${n}</span>
        <button class="playbtn" data-a="play" aria-label="${playing?"Pause":"Play"} lesson">${playing?IC.pause.replace('class="i"','class="i" style="width:30px;height:30px;fill:currentColor;stroke:none"'):'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'}</button>
      </div>
      <div class="scrub"><i id="scrubFill" style="width:${playPct}%"></i></div>
      <div class="ctrls">
        <h3>${esc(L)}</h3>
        <button class="btn ghost small" data-a="prev" ${cur.lesson===0?"disabled style='opacity:.4'":""}>Previous</button>
        <button class="btn accent small" data-a="complete">${p.done.includes(cur.lesson)?"Completed":"Mark complete"}</button>
        <button class="btn ghost small" data-a="next" ${cur.lesson===n-1?"disabled style='opacity:.4'":""}>Next</button>
      </div>
    </section>

    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" class="${cur.tab===k?"on":""}" data-a="tab" data-v="${k}">${l}</button>`).join("")}</div>
    <div class="panel">${coursePanel(c,p)}</div>`;
  window.scrollTo(0,y);
}
function coursePanel(c,p){
  if(cur.tab==="lessons"){
    return `<div class="list">${c.lessons.map((l,i)=>`
      <button class="row-item ${i===cur.lesson?"cur":""}" data-a="lesson" data-i="${i}">
        <span class="dot ${p.done.includes(i)?"done":""}">${p.done.includes(i)?IC.check:i+1}</span>
        <span class="grow"><b>${esc(l)}</b><small>Video, ${dur(c,i)} min</small></span>
        ${i===cur.lesson?'<span class="pill">Now playing</span>':""}
      </button>`).join("")}</div>`;
  }
  if(cur.tab==="notes"){
    const files=[["Course syllabus","PDF"],["Lesson notes, lessons 1 to 3","PDF"],["Lesson notes, lessons 4 to 6","PDF"],["One-page cheat sheet","PDF"],["Practice workbook","PDF"],["Lesson slides","PPT"]];
    return `<div class="list">${files.map(([f,t])=>`
      <button class="row-item" data-a="download" data-v="${esc(f)}">
        ${IC.file}<span class="grow"><b>${esc(f)}</b><small>${esc(c.title)}</small></span><span class="pill">${t}</span>
      </button>`).join("")}</div>`;
  }
  if(cur.tab==="books"){
    const bs=c.books.map(id=>bookById[id]).filter(Boolean);
    return `<p style="color:var(--muted);margin-bottom:14px">Recommended reading for this course.</p><div class="shelf">${bs.map(bookCard).join("")}</div>`;
  }
  if(cur.tab==="tasks"){
    const idx=[1,3,5];
    return `<div class="list">${idx.map((li,k)=>`
      <label class="row-item" style="cursor:pointer">
        <input class="check" type="checkbox" data-a="task" data-i="${k}" ${p.tasks.includes(k)?"checked":""}>
        <span class="grow"><b>Assignment ${k+1}: apply “${esc(c.lessons[li])}”</b><small>Finish after lesson ${li+1}. Write down what you tried and what surprised you.</small></span>
      </label>`).join("")}</div>`;
  }
  /* quiz */
  const qs=QUIZ[c.cat],s=cur.quiz;
  if(s.finished){
    return `<div class="q"><h3>You scored ${s.score} out of ${qs.length}</h3><p style="color:var(--muted);margin-bottom:14px">${s.score===qs.length?"Perfect. You are ready for the next lesson.":"Review the lesson notes and try again."}</p><button class="btn" data-a="quizRetry">Try again</button></div>`;
  }
  const Q=qs[s.i];
  return `<div class="q"><p style="color:var(--muted);font-size:.88rem;margin-bottom:6px">Question ${s.i+1} of ${qs.length}</p><h3>${esc(Q.q)}</h3>
    ${Q.o.map((o,i)=>{
      let cls="";if(s.picked!==null){if(i===Q.a)cls="ok";else if(i===s.picked)cls="no"}
      return `<button class="opt ${cls}" data-a="opt" data-i="${i}" ${s.picked!==null?"disabled":""}>${esc(o)}</button>`}).join("")}
    ${s.picked!==null?`<p class="fb" style="color:${s.picked===Q.a?"var(--good)":"var(--bad)"}">${s.picked===Q.a?"Correct.":"Not quite. The right answer is highlighted."}</p><button class="btn small" data-a="quizNext">${s.i===qs.length-1?"See score":"Next question"}</button>`:""}
  </div>`;
}
function completeLesson(){
  const p=data.courses[cur.id];
  if(!p.done.includes(cur.lesson)){
    p.done.push(cur.lesson);p.last=Date.now();persist();
    const n=byId[cur.id].lessons.length;
    toast(p.done.length===n?"Course completed. Well done!":"Lesson marked complete");
  }
}
function stopPlay(){clearInterval(playTimer);playTimer=null;playing=false;playPct=0}
function togglePlay(){
  if(playing){clearInterval(playTimer);playing=false;renderCourse();return}
  playing=true;renderCourse();
  playTimer=setInterval(()=>{
    playPct+=2;const f=$("#scrubFill");if(f)f.style.width=playPct+"%";
    if(playPct>=100){stopPlay();completeLesson();renderCourse()}
  },100);
}

/* =====================================================================
   LIBRARY
   ===================================================================== */
function suggestions(){
  const taken=Object.keys(data.courses);
  const w={},lastIn={},doneBeg={};
  taken.forEach(id=>{
    const c=byId[id],st=statusOf(id);
    w[c.cat]=(w[c.cat]||0)+(st==="done"?3:st==="prog"?2:1);
    if(!lastIn[c.cat]||data.courses[id].last>data.courses[lastIn[c.cat]].last)lastIn[c.cat]=id;
    if(st==="done"&&c.level==="Beginner")doneBeg[c.cat]=true;
  });
  if(!taken.length)user.interests.forEach(c=>{w[c]=1});
  let list=COURSES.filter(c=>!data.courses[c.id]&&w[c.cat]).map(c=>({c,
    score:w[c.cat]*10+c.rating+(doneBeg[c.cat]&&c.level==="Intermediate"?8:0),
    why:lastIn[c.cat]?(doneBeg[c.cat]&&c.level==="Intermediate"?`Next step after ${byId[lastIn[c.cat]].title}`:`Because you took ${byId[lastIn[c.cat]].title}`):`Because you picked ${c.cat}`
  })).sort((a,b)=>b.score-a.score);
  if(list.length<4){
    const have=new Set(list.map(x=>x.c.id));
    COURSES.filter(c=>!data.courses[c.id]&&!have.has(c.id)).sort((a,b)=>b.learners-a.learners)
      .forEach(c=>list.push({c,why:"Popular with learners"}));
  }
  return list.slice(0,4);
}
function renderLibrary(){
  $("#qClear").classList.toggle("hidden",!query.trim());
  const ids=Object.keys(data.courses).sort((a,b)=>data.courses[b].last-data.courses[a].last);
  const inprog=ids.filter(id=>statusOf(id)==="prog");
  const done=ids.filter(id=>statusOf(id)==="done");
  const lessons=ids.reduce((s,id)=>s+lessonsDone(id),0);
  const sug=suggestions();
  const saved=data.saved.map(id=>bookById[id]).filter(Boolean);
  const started=ids.length;
  $("#main").innerHTML=`
    <div class="hello"><h1>Your library</h1><p>Your courses, your progress and what to take next.</p></div>
    <div class="stats">
      <div class="stat"><b>${started}</b><span>Courses opened</span></div>
      <div class="stat"><b>${lessons}</b><span>Lessons finished</span></div>
      <div class="stat"><b>${done.length}</b><span>Courses completed</span></div>
    </div>
    ${inprog.length?`<section class="sec"><div class="sec-head"><div><h2>Continue learning</h2><p>Pick up right where you stopped.</p></div></div><div class="grid">${inprog.map(id=>courseCard(byId[id])).join("")}</div></section>`:""}
    ${done.length?`<section class="sec"><div class="sec-head"><div><h2>Previous courses</h2><p>Courses you finished. Open one any time to review.</p></div></div><div class="grid">${done.map(id=>courseCard(byId[id])).join("")}</div></section>`:""}
    <section class="sec hist"><div class="sec-head"><div><h2>Course history</h2><p>Everything you have opened, newest first.</p></div></div>
      ${ids.length?`<div class="list">${ids.map(id=>{
        const c=byId[id],st=statusOf(id),n=c.lessons.length;
        return `<a class="row-item" href="#/course/${id}">
          <span class="cv">${coverHtml(c,"",false)}</span>
          <span class="grow"><b>${esc(c.title)}</b><small>${esc(c.by)}, ${lessonsDone(id)} of ${n} lessons</small></span>
          <span class="st ${st==="done"?"done":st==="prog"?"prog":""}">${st==="done"?"Completed":st==="prog"?"In progress":"Not started"}</span>
          <span class="when">${ago(data.courses[id].last)}</span></a>`}).join("")}</div>`:
        `<div class="empty"><b>No courses yet</b>Open a course from Home and it will show up here.<div class="chips"><a class="btn small" href="#/home">Browse popular courses</a></div></div>`}
    </section>
    <section class="sec"><div class="sec-head"><div><h2>Suggested for you</h2><p>${ids.length?"Picked from the topics of courses you have taken.":"Based on the topics you chose, or what is popular."}</p></div></div>
      <div class="grid">${sug.map(s=>courseCard(s.c,`<p class="reason">${esc(s.why)}</p>`)).join("")}</div>
    </section>
    <section class="sec"><div class="sec-head"><div><h2>Saved books</h2><p>Books you saved from Home or a course.</p></div></div>
      ${saved.length?`<div class="shelf">${saved.map(bookCard).join("")}</div>`:`<div class="empty"><b>No saved books</b>Tap any book on Home and choose Save to library.</div>`}
    </section>`;
}

/* =====================================================================
   BOOK MODAL
   ===================================================================== */
function openBook(id){
  const b=bookById[id],isSaved=data.saved.includes(id);
  const rel=COURSES.filter(c=>c.books.includes(id)).slice(0,3);
  $("#modalRoot").innerHTML=`<div class="overlay" data-a="closeModal" role="dialog" aria-modal="true" aria-label="${esc(b.title)}">
    <div class="modal">${bookCover(b)}
      <div><h2>${esc(b.title)}</h2><p class="by">${esc(b.author)}, ${esc(b.cat)}</p><p>${esc(b.blurb)}</p>
        <div class="acts"><button class="btn" data-a="saveBook" data-id="${id}">${isSaved?"Saved to library":"Save to library"}</button>
        <button class="btn ghost" data-a="sample">Read a sample</button><button class="btn ghost" data-a="closeModal" data-x="1">Close</button></div>
        ${rel.length?`<div class="rel"><b>Used in these courses</b>${rel.map(c=>`<a href="#/course/${c.id}" data-a="closeModal" data-x="1">${esc(c.title)}</a>`).join("")}</div>`:""}
      </div></div></div>`;
}

/* =====================================================================
   EVENTS
   ===================================================================== */
const actions={
  authTab:t=>setMode(t.dataset.v),
  interest:t=>{const v=t.dataset.v;picked.has(v)?picked.delete(v):picked.add(v);t.classList.toggle("on")},
  demo:()=>demoLogin(),
  toggleMenu:()=>$("#menu").classList.toggle("hidden"),
  logout:()=>logout(),
  navHome:()=>{query="";$("#q").value="";catFilter="All";if(location.hash==="#/home"||!location.hash)route()},
  clearSearch:()=>{query="";$("#q").value="";route()},
  suggestSearch:t=>{query=t.dataset.v;$("#q").value=query;renderHome()},
  filterCat:t=>{catFilter=t.dataset.v;renderHome()},
  book:t=>openBook(t.dataset.id),
  closeModal:(t,e)=>{if(t.dataset.x||e.target===t)$("#modalRoot").innerHTML=""},
  saveBook:t=>{
    const id=t.dataset.id,i=data.saved.indexOf(id);
    if(i>=0){data.saved.splice(i,1);toast("Removed from library")}else{data.saved.push(id);toast("Saved to your library")}
    persist();openBook(id);if(lastTab==="library"&&!cur)renderLibrary();
  },
  sample:()=>toast("Demo only: book samples are not connected yet."),
  download:t=>toast("Demo only: “"+t.dataset.v+"” would download here."),
  tab:t=>{cur.tab=t.dataset.v;renderCourse()},
  lesson:t=>{stopPlay();cur.lesson=+t.dataset.i;renderCourse();document.querySelector(".player").scrollIntoView({behavior:"smooth",block:"center"})},
  play:()=>togglePlay(),
  prev:()=>{if(cur.lesson>0){stopPlay();cur.lesson--;renderCourse()}},
  next:()=>{if(cur.lesson<byId[cur.id].lessons.length-1){stopPlay();cur.lesson++;renderCourse()}},
  complete:()=>{completeLesson();renderCourse()},
  task:t=>{
    const p=data.courses[cur.id],k=+t.dataset.i,i=p.tasks.indexOf(k);
    i>=0?p.tasks.splice(i,1):p.tasks.push(k);persist();
  },
  opt:t=>{cur.quiz.picked=+t.dataset.i;const Q=QUIZ[byId[cur.id].cat][cur.quiz.i];if(cur.quiz.picked===Q.a)cur.quiz.score++;renderCourse()},
  quizNext:()=>{
    const s=cur.quiz,n=QUIZ[byId[cur.id].cat].length;
    if(s.i===n-1)s.finished=true;else{s.i++;s.picked=null}
    renderCourse();
  },
  quizRetry:()=>{cur.quiz={i:0,score:0,picked:null,finished:false};renderCourse()}
};
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-a]");
  if(!e.target.closest(".who"))$("#menu").classList.add("hidden");
  if(!t)return;
  const a=t.dataset.a;
  if(a==="task"||a==="navHome"&&t.tagName==="A"){ /* let links & checkboxes behave natively */ }
  actions[a]&&actions[a](t,e);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#modalRoot").innerHTML=""});
$("#authForm").addEventListener("submit",submitAuth);
$("#q").addEventListener("input",e=>{
  query=e.target.value;
  if(location.hash&&location.hash!=="#/home"){location.hash="#/home"}else renderHome();
});
window.addEventListener("hashchange",route);

/* =====================================================================
   BOOT
   ===================================================================== */
drawAuth();setMode("signup");
(function boot(){
  const email=store.get("paath_session");
  const acc=email&&load("paath_accounts",{})[email];
  if(acc)startSession(email,acc);
})();
