import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — Lightened "slate dojo" palette for improved readability
// ─────────────────────────────────────────────────────────────────────────────
const A       = "#2563eb";
const AG      = "#2563eb14";
const AB      = "#2563eb44";
const SUCCESS = "#059669";
const WARN    = "#d97706";
const DANGER  = "#dc2626";
const BG      = "#f0f4f8";       // light slate base
const SURFACE = "#ffffff";       // card/panel surface
const SURFACE2= "#f8fafc";       // slight depth
const BORDER  = "#d1dce8";
const TEXT1   = "#0f2540";       // primary text
const TEXT2   = "#4a6080";       // secondary text
const TEXT3   = "#8aaac8";       // muted text
const SIDEBAR  = "#1e2d3d";      // sidebar dark
const SIDEBAR2 = "#162433";
const mono    = "'DM Mono',monospace";
const cond    = "'Barlow Condensed',sans-serif";

const BELT_COLORS = {
  white:  { bg:"#e8edf5", text:"#1a2a3a" },
  blue:   { bg:"#1d4ed8", text:"#fff"    },
  purple: { bg:"#7e22ce", text:"#fff"    },
  brown:  { bg:"#78350f", text:"#fff"    },
  black:  { bg:"#1e293b", text:"#e2e8f0" },
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE (all state lives in root App and passed as props/context)
// ─────────────────────────────────────────────────────────────────────────────
const INIT_STUDENTS = [
  { id:1, name:"Marcus Silva",   belt:"blue",   stripes:3, attendance:87,  nextEligible:92,  joined:"2022-03", age:24, parentId:null, billing:"Active",  fee:120, discount:0  },
  { id:2, name:"Aisha Okonkwo", belt:"purple", stripes:2, attendance:143, nextEligible:200, joined:"2021-07", age:29, parentId:null, billing:"Active",  fee:120, discount:0  },
  { id:3, name:"Tom Nakamura",  belt:"white",  stripes:4, attendance:61,  nextEligible:50,  joined:"2023-11", age:17, parentId:"P1", billing:"Active",  fee:85,  discount:0  },
  { id:4, name:"Sofia Reyes",   belt:"brown",  stripes:1, attendance:310, nextEligible:400, joined:"2019-04", age:34, parentId:null, billing:"Overdue", fee:120, discount:10 },
  { id:5, name:"Jake Miller",   belt:"blue",   stripes:1, attendance:52,  nextEligible:92,  joined:"2023-02", age:21, parentId:null, billing:"Active",  fee:120, discount:0  },
  { id:6, name:"Priya Mehta",   belt:"white",  stripes:2, attendance:22,  nextEligible:50,  joined:"2024-01", age:15, parentId:"P1", billing:"Active",  fee:85,  discount:0  },
  { id:7, name:"Carlos Diaz",   belt:"purple", stripes:4, attendance:198, nextEligible:200, joined:"2020-09", age:31, parentId:null, billing:"Active",  fee:120, discount:0  },
  { id:8, name:"Emma Thornton", belt:"blue",   stripes:0, attendance:35,  nextEligible:92,  joined:"2023-08", age:26, parentId:null, billing:"Paused",  fee:120, discount:15 },
];

const INIT_INSTRUCTORS = [
  { id:1, name:"Prof. Joao Ribeiro", cert:"Level 3", progress:100, classes:342, belt:"black", email:"joao@ribeiro.bjj" },
  { id:2, name:"Coach Ana Lima",     cert:"Level 2", progress:78,  classes:201, belt:"brown", email:"ana@ribeiro.bjj"  },
  { id:3, name:"Coach Diego Santos", cert:"Level 1", progress:45,  classes:88,  belt:"purple",email:"diego@ribeiro.bjj"},
];

const INIT_CURRICULUM = {
  white:  ["Defensive guard posture","Bridge & shrimp escapes","Single leg takedown","Rear mount escape","Side control escape","Closed guard basics"],
  blue:   ["Triangle choke","Armbar from guard","Scissor sweep","Half guard pass","Rear naked choke","Hip bump sweep"],
  purple: ["Berimbolo","Leg entanglements intro","Back attack system","Pressure passing","Darce choke","X-guard entries"],
  brown:  ["Advanced leg locks","Wrestling base transitions","High-% submission chains","Competition strategy","Heel hook mechanics","Advanced back takes"],
};

const INIT_PROMO_REQS = {
  white:  { months:6,  classes:50,  techniques:4, evalRequired:false },
  blue:   { months:12, classes:92,  techniques:6, evalRequired:true  },
  purple: { months:18, classes:200, techniques:6, evalRequired:true  },
  brown:  { months:24, classes:400, techniques:6, evalRequired:true  },
};

const INIT_PRICES = {
  adult:  120,
  youth:  85,
  family: 200,
};

const BILLING_HISTORY = [
  { date:"Apr 1, 2026", desc:"Monthly Membership", amount:120, status:"Paid"    },
  { date:"Mar 1, 2026", desc:"Monthly Membership", amount:120, status:"Paid"    },
  { date:"Feb 1, 2026", desc:"Monthly Membership", amount:120, status:"Paid"    },
  { date:"Jan 1, 2026", desc:"Monthly Membership", amount:120, status:"Paid"    },
  { date:"Dec 1, 2025", desc:"Monthly Membership", amount:120, status:"Paid"    },
  { date:"Nov 1, 2025", desc:"Monthly Membership", amount:120, status:"Overdue" },
];

const LMS_COURSES = [
  { title:"Child Safety & Safeguarding",     level:"Level 1", modules:4,  done:true,  progress:100 },
  { title:"Curriculum Design Fundamentals",  level:"Level 1", modules:6,  done:true,  progress:100 },
  { title:"Injury Prevention & First Aid",   level:"Level 2", modules:5,  done:false, progress:60  },
  { title:"Competition Coaching Strategies", level:"Level 2", modules:8,  done:false, progress:20  },
  { title:"Advanced Teaching Methodologies", level:"Level 3", modules:10, done:false, progress:0   },
];

const ATTENDANCE_TREND = [
  { month:"Oct", pct:68 },{ month:"Nov", pct:71 },{ month:"Dec", pct:59 },
  { month:"Jan", pct:74 },{ month:"Feb", pct:77 },{ month:"Mar", pct:81 },
];

const INIT_CALENDAR_EVENTS = [
  { id:"e1", title:"Fundamentals",       day:"Mon", time:"06:30", type:"class",   instructor:"Prof. Joao Ribeiro", capacity:12 },
  { id:"e2", title:"Kids BJJ",           day:"Tue", time:"09:00", type:"class",   instructor:"Coach Ana Lima",     capacity:15 },
  { id:"e3", title:"Open Mat",           day:"Mon", time:"12:00", type:"class",   instructor:"Prof. Joao Ribeiro", capacity:20 },
  { id:"e4", title:"Competition Prep",   day:"Wed", time:"18:00", type:"class",   instructor:"Coach Diego Santos", capacity:10 },
  { id:"e5", title:"Advanced No-Gi",     day:"Thu", time:"19:30", type:"class",   instructor:"Coach Ana Lima",     capacity:14 },
  { id:"e6", title:"Fundamentals",       day:"Wed", time:"06:30", type:"class",   instructor:"Prof. Joao Ribeiro", capacity:12 },
  { id:"e7", title:"All Levels",         day:"Sat", time:"10:00", type:"class",   instructor:"Coach Ana Lima",     capacity:20 },
  { id:"e8", title:"Private – Marcus S", day:"Tue", time:"07:00", type:"private", instructor:"Prof. Joao Ribeiro", capacity:1  },
];

const INIT_DOCUMENTS = [
  { id:"d1", title:"Gym Rules & Code of Conduct", category:"Policy",   date:"Jan 15, 2026", content:"All students must show respect..." },
  { id:"d2", title:"Waiver & Liability Form",      category:"Legal",    date:"Feb 1, 2026",  content:"By signing this form..."         },
  { id:"d3", title:"Competition Guidelines",       category:"Training", date:"Mar 10, 2026", content:"Competition team requirements..."  },
  { id:"d4", title:"Belt Promotion Overview",      category:"Policy",   date:"Apr 1, 2026",  content:"Promotion criteria summary..."    },
];

const INIT_VIDEOS = [
  { id:"v1", belt:"white",  title:"Closed Guard Basics — Full Breakdown",     duration:"14:32", date:"Apr 10, 2026" },
  { id:"v2", belt:"blue",   title:"Triangle Choke Setup & Finish",            duration:"09:18", date:"Apr 8, 2026"  },
  { id:"v3", belt:"purple", title:"Berimbolo Entry from De La Riva",          duration:"21:05", date:"Apr 5, 2026"  },
  { id:"v4", belt:"white",  title:"Bridge & Shrimp Fundamental Drills",       duration:"07:44", date:"Mar 30, 2026" },
  { id:"v5", belt:"blue",   title:"Armbar From Guard — Common Mistakes",      duration:"11:20", date:"Mar 22, 2026" },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const ROLES = {
  owner:      { label:"Gym Owner",       nav:["dashboard","students","attendance","calendar","curriculum","videos","documents","instructors","messaging","reports","billing","settings"] },
  instructor: { label:"Instructor",      nav:["dashboard","students","attendance","calendar","curriculum","videos","documents","instructors"] },
  student:    { label:"Student",         nav:["my-progress","attendance","calendar","curriculum","videos","documents","billing"] },
  parent:     { label:"Parent/Guardian", nav:["parent-portal","calendar","documents","billing"] },
};

const NAV_META = {
  dashboard:       "Dashboard",
  students:        "Students",
  attendance:      "Attendance",
  calendar:        "Calendar",
  curriculum:      "Curriculum",
  videos:          "Videos",
  documents:       "Documents",
  instructors:     "Instructors",
  messaging:       "Messaging",
  reports:         "Reports",
  billing:         "Billing",
  settings:        "Settings",
  "my-progress":   "My Progress",
  "parent-portal": "My Children",
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function BeltBadge({ belt, stripes }) {
  const c = BELT_COLORS[belt];
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,
      background:c.bg,color:c.text,
      border:belt==="white"?"1px solid #b0bfd0":"none",
      padding:"2px 8px",borderRadius:4,
      fontFamily:mono,fontSize:9,fontWeight:700,
      textTransform:"uppercase",letterSpacing:2,flexShrink:0
    }}>
      {belt}{stripes>0&&<span style={{letterSpacing:0}}>{Array(stripes).fill("▪").join("")}</span>}
    </span>
  );
}

function ProgressRing({ pct, size=56, color=A }) {
  const r=(size-8)/2, circ=2*Math.PI*r, fill=Math.min(pct/100,1)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct>=100?SUCCESS:color}
        strokeWidth={5} strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray .7s ease"}}/>
    </svg>
  );
}

function ProgressBar({ pct, color=A, h=5 }) {
  return (
    <div style={{height:h,background:BORDER,borderRadius:h/2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,
        background:pct>=100?SUCCESS:color,borderRadius:h/2,transition:"width .6s ease"}}/>
    </div>
  );
}

function Avatar({ name, size=40 }) {
  const initials=name.split(" ").map(w=>w[0]).slice(0,2).join("");
  const hue=(name.charCodeAt(0)*53+(name.charCodeAt(1)||0)*17)%360;
  return (
    <div style={{
      width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`hsl(${hue},55%,88%)`,color:`hsl(${hue},55%,28%)`,
      border:`2px solid hsl(${hue},40%,78%)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:cond,fontWeight:900,fontSize:size*.38,
    }}>{initials}</div>
  );
}

function StatCard({ label, value, sub, accent=A }) {
  return (
    <div style={{
      background:SURFACE,border:`1px solid ${BORDER}`,
      borderTop:`3px solid ${accent}`,borderRadius:10,padding:"18px 20px",
      boxShadow:"0 1px 4px rgba(0,0,0,.06)"
    }}>
      <div style={{fontFamily:mono,fontSize:9,color:TEXT3,textTransform:"uppercase",letterSpacing:2,marginBottom:7}}>{label}</div>
      <div style={{fontFamily:cond,fontWeight:900,fontSize:32,color:TEXT1,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:6}}>{sub}</div>}
    </div>
  );
}

function Panel({ title, children, action, noPad, accent }) {
  return (
    <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
      overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"13px 18px",borderBottom:`1px solid ${BORDER}`,
        background:SURFACE2}}>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:14,color:TEXT1,
          textTransform:"uppercase",letterSpacing:1.2,
          ...(accent?{borderLeft:`3px solid ${accent}`,paddingLeft:8}:{})}}>{title}</div>
        {action&&<div style={{fontFamily:mono,fontSize:9,color:A,letterSpacing:1}}>{action}</div>}
      </div>
      <div style={noPad?{}:{padding:"14px 18px"}}>{children}</div>
    </div>
  );
}

function PageHeader({ title, sub, badge, children }) {
  return (
    <div style={{marginBottom:24,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div>
        <div style={{fontFamily:mono,fontSize:9,color:A,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{sub}</div>
        <h1 style={{fontFamily:cond,fontWeight:900,fontSize:36,color:TEXT1,margin:0,letterSpacing:.3,lineHeight:1,textTransform:"uppercase"}}>{title}</h1>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        {children}
        {badge&&<div style={{fontFamily:mono,fontSize:9,color:TEXT2,background:SURFACE,border:`1px solid ${BORDER}`,padding:"6px 12px",borderRadius:16}}>{badge}</div>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", small, disabled }) {
  const s={
    primary:{background:disabled?"#b0bfd0":A,color:"#fff",border:"none"},
    ghost:  {background:"transparent",color:A,border:`1px solid ${AB}`},
    danger: {background:DANGER+"14",color:DANGER,border:`1px solid ${DANGER}40`},
    success:{background:SUCCESS+"14",color:SUCCESS,border:`1px solid ${SUCCESS}40`},
    neutral:{background:SURFACE2,color:TEXT2,border:`1px solid ${BORDER}`},
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{
      ...s[variant],padding:small?"5px 12px":"9px 18px",
      borderRadius:6,cursor:disabled?"not-allowed":"pointer",fontFamily:mono,
      fontSize:small?9:10,letterSpacing:1,textTransform:"uppercase",fontWeight:600,
      transition:"opacity .15s",flexShrink:0,opacity:disabled?.5:1
    }}>{children}</button>
  );
}

function Tag({ children, color=TEXT3 }) {
  return (
    <span style={{fontFamily:mono,fontSize:8,color,
      background:color+"18",border:`1px solid ${color}38`,
      borderRadius:4,padding:"2px 7px",letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>
      {children}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{label}</div>
      <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT2}}>{value}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", style:sx }) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,
        padding:"8px 12px",color:TEXT1,fontFamily:mono,fontSize:10,outline:"none",width:"100%",
        boxSizing:"border-box",...sx}}/>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:SURFACE,borderRadius:12,padding:28,minWidth:420,maxWidth:600,
        width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,.2)",border:`1px solid ${BORDER}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:20,color:TEXT1,textTransform:"uppercase"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:TEXT3}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, role, setRole, gymLogo }) {
  const nav = ROLES[role].nav;
  return (
    <div style={{
      width:220,background:SIDEBAR,borderRight:`1px solid ${SIDEBAR2}`,
      display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0,
      position:"sticky",top:0,zIndex:10
    }}>
      {/* Logo area */}
      <div style={{padding:"20px 18px 16px",borderBottom:`1px solid ${SIDEBAR2}`}}>
        {gymLogo
          ? <img src={gymLogo} alt="Gym logo" style={{maxWidth:"100%",maxHeight:52,objectFit:"contain",marginBottom:6}}/>
          : <div style={{fontFamily:cond,fontWeight:900,fontSize:21,color:"#f0f6ff",letterSpacing:.4,lineHeight:1}}>
              <span style={{color:A}}>BJJ</span>Groundwork
            </div>
        }
        <div style={{fontFamily:mono,fontSize:8,color:"#3a5570",letterSpacing:2,marginTop:3}}>GYM MANAGEMENT</div>
      </div>

      {/* Role switcher */}
      <div style={{padding:"10px 10px 0"}}>
        <div style={{fontFamily:mono,fontSize:8,color:"#3a5570",letterSpacing:2,textTransform:"uppercase",marginBottom:4,paddingLeft:6}}>Viewing as</div>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{
          width:"100%",background:SIDEBAR2,color:"#7a9abf",
          border:"1px solid #253545",borderRadius:6,
          fontFamily:mono,fontSize:9,padding:"7px 9px",outline:"none",cursor:"pointer"
        }}>
          {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Nav */}
      <nav style={{padding:"10px 8px",flex:1,overflowY:"auto"}}>
        {nav.map(id=>{
          const on=active===id;
          return (
            <button key={id} onClick={()=>setActive(id)} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",
              padding:"9px 12px",borderRadius:6,border:"none",cursor:"pointer",
              marginBottom:1,transition:"all .12s",
              background:on?A:"transparent",
              color:on?"#fff":"#4a7090",
              fontFamily:mono,fontSize:9,letterSpacing:1,textTransform:"uppercase",fontWeight:on?700:400,
            }}>{NAV_META[id]}</button>
          );
        })}
      </nav>

      <div style={{padding:"12px 18px",borderTop:`1px solid ${SIDEBAR2}`}}>
        <div style={{fontFamily:mono,fontSize:8,color:"#2a4050",letterSpacing:1,marginBottom:2}}>GYM</div>
        <div style={{color:"#4a7090",fontSize:12,fontFamily:cond,fontWeight:700}}>Ribeiro BJJ Academy</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ students }) {
  const eligible=students.filter(s=>s.attendance>=s.nextEligible);
  const overdue=students.filter(s=>s.billing==="Overdue");
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Dashboard" sub="BJJGroundwork" badge="Sun Apr 19, 2026"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <StatCard label="Active Students" value={students.length}    sub="+2 this month"      accent={A}/>
        <StatCard label="Classes Today"   value={5}                  sub="3 instructors"      accent="#7c3aed"/>
        <StatCard label="Promotion Ready" value={eligible.length}    sub="awaiting review"    accent={SUCCESS}/>
        <StatCard label="Overdue Billing" value={overdue.length}     sub="action required"    accent={DANGER}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:18,marginBottom:18}}>
        <Panel title="Today's Schedule">
          {INIT_CALENDAR_EVENTS.slice(0,5).map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div>
                <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:2}}>{c.day} · {c.time}</div>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{c.title}</div>
                <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{c.instructor}</div>
              </div>
              <Tag color={c.type==="private"?WARN:A}>{c.type}</Tag>
            </div>
          ))}
        </Panel>
        <Panel title="Promotion Eligible">
          {eligible.length===0&&<div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>None currently eligible.</div>}
          {eligible.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
              <Avatar name={s.name}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1,marginBottom:3}}>{s.name}</div>
                <BeltBadge belt={s.belt} stripes={s.stripes}/>
              </div>
              <Btn small>Promote</Btn>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Attendance Trend — Last 6 Months">
        <div style={{display:"flex",alignItems:"flex-end",gap:12,height:80,paddingTop:8}}>
          {ATTENDANCE_TREND.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontFamily:mono,fontSize:9,color:A}}>{d.pct}%</div>
              <div style={{width:"100%",height:(d.pct/100)*64,
                background:`linear-gradient(0deg,${A},${A}88)`,borderRadius:"3px 3px 0 0"}}/>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{d.month}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────────────────
function Students({ students, setStudents, role }) {
  const [search,setSearch]=useState("");
  const [beltF,setBeltF]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");
  const [newBelt,setNewBelt]=useState("white");
  const [newAge,setNewAge]=useState("");
  const [newFee,setNewFee]=useState("120");

  const canEdit=role==="owner"||role==="instructor";
  const filtered=students.filter(s=>
    (beltF==="all"||s.belt===beltF)&&s.name.toLowerCase().includes(search.toLowerCase()));

  const addStudent=()=>{
    if(!newName.trim())return;
    const s={id:Date.now(),name:newName,belt:newBelt,stripes:0,
      attendance:0,nextEligible:50,joined:"2026-04",age:parseInt(newAge)||18,
      parentId:null,billing:"Active",fee:parseInt(newFee)||120,discount:0};
    setStudents(p=>[...p,s]);
    setNewName("");setNewAge("");setNewFee("120");setShowAdd(false);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Students" sub="Roster" badge={`${students.length} members`}>
        {canEdit&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ Add Student</Btn>}
      </PageHeader>

      <div style={{display:"flex",gap:9,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
        <Input value={search} onChange={setSearch} placeholder="Search…" style={{width:200}}/>
        {["all","white","blue","purple","brown","black"].map(b=>(
          <button key={b} onClick={()=>setBeltF(b)} style={{
            padding:"6px 12px",borderRadius:6,cursor:"pointer",
            fontFamily:mono,fontSize:9,textTransform:"uppercase",letterSpacing:1,
            border:`1px solid ${BORDER}`,transition:"all .12s",
            background:beltF===b?A:SURFACE,color:beltF===b?"#fff":TEXT2
          }}>{b}</button>
        ))}
      </div>

      {showAdd&&(
        <div style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,
          padding:"16px 18px",marginBottom:16,display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:2,minWidth:140}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginBottom:4,letterSpacing:1}}>FULL NAME</div>
            <Input value={newName} onChange={setNewName} placeholder="Full name"/>
          </div>
          <div style={{minWidth:100}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginBottom:4,letterSpacing:1}}>BELT</div>
            <select value={newBelt} onChange={e=>setNewBelt(e.target.value)} style={{
              background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,
              padding:"8px 10px",fontFamily:mono,fontSize:10,color:TEXT1,width:"100%"}}>
              {["white","blue","purple","brown","black"].map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{minWidth:70}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginBottom:4,letterSpacing:1}}>AGE</div>
            <Input value={newAge} onChange={setNewAge} placeholder="Age" type="number"/>
          </div>
          <div style={{minWidth:80}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginBottom:4,letterSpacing:1}}>FEE/MO</div>
            <Input value={newFee} onChange={setNewFee} placeholder="120" type="number"/>
          </div>
          <Btn small onClick={addStudent}>Save</Btn>
          <Btn small variant="neutral" onClick={()=>setShowAdd(false)}>Cancel</Btn>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {filtered.map(s=>{
          const pct=Math.min(Math.round((s.attendance/s.nextEligible)*100),100);
          const effectiveFee=s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee;
          return (
            <div key={s.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,
              borderRadius:10,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                <Avatar name={s.name} size={42}/>
                <div>
                  <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:4}}>{s.name}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <BeltBadge belt={s.belt} stripes={s.stripes}/>
                    {s.billing==="Overdue"&&<Tag color={DANGER}>Overdue</Tag>}
                    {s.billing==="Paused" &&<Tag color={WARN}>Paused</Tag>}
                    {s.parentId&&<Tag color="#7c3aed">Minor</Tag>}
                    {s.discount>0&&<Tag color={SUCCESS}>{s.discount}% off</Tag>}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <ProgressRing pct={pct}/>
                <div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:2}}>PROMOTION</div>
                  <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:pct>=100?SUCCESS:A,lineHeight:1}}>{pct}%</div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{s.attendance}/{s.nextEligible} classes</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${BORDER}`,paddingTop:10}}>
                <Info label="Age"     value={s.age}/>
                <Info label="Monthly" value={s.discount>0?`$${effectiveFee} ($${s.fee})`:`$${s.fee}`}/>
                <Info label="Joined"  value={s.joined}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEO-LOCK CONSTANTS
// In production these would be set by the gym owner in Settings.
// Coordinates here are sample; the allowed radius is 150 metres.
// ─────────────────────────────────────────────────────────────────────────────
const GYM_LAT  = 37.7749;   // replace with real gym latitude
const GYM_LNG  = -122.4194; // replace with real gym longitude
const GYM_RADIUS_M = 150;   // metres

function haversineMetres(lat1,lng1,lat2,lng2){
  const R=6371000,toR=Math.PI/180;
  const dLat=(lat2-lat1)*toR, dLng=(lng2-lng1)*toR;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*toR)*Math.cos(lat2*toR)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT KIOSK CHECK-IN  (geo-locked — student role only)
// ─────────────────────────────────────────────────────────────────────────────
function StudentKiosk({ students }) {
  // geo states: idle | checking | allowed | denied | error
  const [geoState,setGeoState]  = useState("idle");
  const [geoMsg,setGeoMsg]      = useState("");
  const [distM,setDistM]        = useState(null);
  const [sel,setSel]            = useState(null);
  const [checkedIn,setCheckedIn]= useState(false);
  const me = students[0]; // simulated logged-in student
  const classes = INIT_CALENDAR_EVENTS.filter(e=>e.type==="class");

  const requestGeo = () => {
    if(!navigator.geolocation){ setGeoState("error"); setGeoMsg("Geolocation not supported by this browser."); return; }
    setGeoState("checking");
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const d=haversineMetres(pos.coords.latitude,pos.coords.longitude,GYM_LAT,GYM_LNG);
        setDistM(Math.round(d));
        if(d<=GYM_RADIUS_M){ setGeoState("allowed"); }
        else { setGeoState("denied"); setGeoMsg(`You appear to be ${Math.round(d)} m from the gym. Check-in is only available on-site.`); }
      },
      err=>{
        setGeoState("error");
        const msgs={1:"Location permission denied. Please allow location access and try again.",
                    2:"Location unavailable. Please try again.",3:"Location request timed out."};
        setGeoMsg(msgs[err.code]||"An unknown location error occurred.");
      },
      {enableHighAccuracy:true,timeout:10000,maximumAge:0}
    );
  };

  const doCheckIn = () => {
    if(!sel) return;
    setCheckedIn(true);
  };

  // ── IDLE: prompt to verify location ──────────────────────────────────────
  if(geoState==="idle") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",textAlign:"center",paddingTop:40}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:AG,border:`2px solid ${AB}`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 24px"}}>📍</div>
        <div style={{fontFamily:cond,fontWeight:900,fontSize:26,color:TEXT1,marginBottom:10}}>Location Verification Required</div>
        <div style={{fontFamily:mono,fontSize:10,color:TEXT2,lineHeight:1.8,marginBottom:28}}>
          To prevent remote check-ins, BJJGroundwork verifies that you are physically present at the gym before recording your attendance. Your location is only used for this check and is never stored.
        </div>
        <Btn onClick={requestGeo}>Verify My Location</Btn>
      </div>
    </div>
  );

  // ── CHECKING ──────────────────────────────────────────────────────────────
  if(geoState==="checking") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"60px auto",textAlign:"center"}}>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:22,color:TEXT1,marginBottom:10}}>Locating you…</div>
        <div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>Please allow location access if prompted by your browser.</div>
        <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:6}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:10,height:10,borderRadius:"50%",background:A,
              animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </div>
  );

  // ── DENIED / ERROR ────────────────────────────────────────────────────────
  if(geoState==="denied"||geoState==="error") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",paddingTop:32}}>
        <div style={{background:DANGER+"0d",border:`1px solid ${DANGER}33`,borderRadius:12,padding:28,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:16}}>🚫</div>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:DANGER,marginBottom:10}}>
            {geoState==="denied"?"Not at Gym Location":"Location Error"}
          </div>
          <div style={{fontFamily:mono,fontSize:10,color:TEXT2,lineHeight:1.8,marginBottom:24}}>{geoMsg}</div>
          {distM!==null&&geoState==="denied"&&(
            <div style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 16px",
              marginBottom:20,display:"inline-flex",gap:16,alignItems:"center"}}>
              <div>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1}}>YOUR DISTANCE</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:24,color:DANGER}}>{distM} m</div>
              </div>
              <div style={{width:1,height:36,background:BORDER}}/>
              <div>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1}}>ALLOWED RADIUS</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:24,color:SUCCESS}}>{GYM_RADIUS_M} m</div>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn onClick={()=>{setGeoState("idle");setDistM(null);}}>Try Again</Btn>
            <Btn variant="neutral" onClick={()=>setGeoState("idle")}>Cancel</Btn>
          </div>
        </div>
        <div style={{marginTop:16,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 16px"}}>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>
            If you believe this is an error, please see the front desk to be manually checked in by an instructor.
          </div>
        </div>
      </div>
    </div>
  );

  // ── ALLOWED: show check-in form ───────────────────────────────────────────
  if(checkedIn) return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",paddingTop:32,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:SUCCESS+"18",border:`2px solid ${SUCCESS}55`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px"}}>✓</div>
        <div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:SUCCESS,marginBottom:8}}>Checked In!</div>
        <div style={{fontFamily:mono,fontSize:10,color:TEXT2,marginBottom:6}}>
          <strong style={{color:TEXT1}}>{me.name}</strong> — {sel?.title}
        </div>
        <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:28}}>
          Verified on-site · {new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
        </div>
        <div style={{display:"inline-flex",gap:14,alignItems:"center",
          background:SUCCESS+"0d",border:`1px solid ${SUCCESS}44`,
          borderRadius:8,padding:"10px 20px",marginBottom:28}}>
          <Avatar name={me.name} size={36}/>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:cond,fontWeight:700,fontSize:16,color:TEXT1}}>{me.name}</div>
            <BeltBadge belt={me.belt} stripes={me.stripes}/>
          </div>
        </div>
        <div><Btn variant="ghost" onClick={()=>{setCheckedIn(false);setSel(null);setGeoState("idle");}}>Done</Btn></div>
      </div>
    </div>
  );

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>

      {/* Location verified banner */}
      <div style={{background:SUCCESS+"0d",border:`1px solid ${SUCCESS}44`,borderRadius:8,
        padding:"10px 16px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:SUCCESS,
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,flexShrink:0}}>✓</div>
        <div style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>
          Location verified — you are within {GYM_RADIUS_M} m of the gym
          {distM!==null&&<span style={{color:TEXT3}}> ({distM} m away)</span>}
        </div>
      </div>

      {/* Student identity card */}
      <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:12,padding:"18px 20px",
        marginBottom:22,display:"flex",alignItems:"center",gap:16,boxShadow:"0 2px 8px rgba(37,99,235,.08)"}}>
        <Avatar name={me.name} size={52}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:TEXT1,marginBottom:5}}>{me.name}</div>
          <BeltBadge belt={me.belt} stripes={me.stripes}/>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:5}}>{me.attendance} classes attended</div>
        </div>
        <Tag color={SUCCESS}>On-site ✓</Tag>
      </div>

      {/* Class selector */}
      <Panel title="Select Your Class">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
          {classes.map(c=>(
            <button key={c.id} onClick={()=>setSel(c)} style={{
              textAlign:"left",padding:"14px 16px",borderRadius:8,cursor:"pointer",
              border:`2px solid ${sel?.id===c.id?A:BORDER}`,
              background:sel?.id===c.id?AG:SURFACE,transition:"all .15s"
            }}>
              <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:3}}>{c.day} · {c.time}</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{c.title}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:2}}>{c.instructor}</div>
              {sel?.id===c.id&&(
                <div style={{marginTop:6}}><Tag color={A}>Selected</Tag></div>
              )}
            </button>
          ))}
        </div>

        <div style={{marginTop:18,display:"flex",alignItems:"center",gap:14,borderTop:`1px solid ${BORDER}`,paddingTop:16}}>
          <Btn onClick={doCheckIn} disabled={!sel}>Check In Now</Btn>
          {!sel&&<span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Select a class above to continue</span>}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF ATTENDANCE — instructor / owner roster view (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function Attendance({ students, role }) {
  const [sel,setSel]=useState(INIT_CALENDAR_EVENTS.filter(e=>e.type==="class")[0]);
  const [checked,setChecked]=useState({});
  const [saved,setSaved]=useState(false);
  const toggle=id=>setChecked(p=>({...p,[id]:!p[id]}));
  const count=Object.values(checked).filter(Boolean).length;
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const classes=INIT_CALENDAR_EVENTS.filter(e=>e.type==="class");

  // Students see the geo-locked kiosk instead
  if(role==="student") return <StudentKiosk students={students}/>;

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Attendance" sub="Roster Check-in" badge={`${count} checked in`}/>
      <div style={{display:"grid",gridTemplateColumns:"230px 1fr",gap:18}}>
        <Panel title="Classes" noPad>
          {classes.map(c=>(
            <button key={c.id} onClick={()=>{setSel(c);setChecked({});setSaved(false);}} style={{
              display:"block",width:"100%",textAlign:"left",padding:"11px 16px",
              border:"none",cursor:"pointer",transition:"all .12s",
              background:sel.id===c.id?AG:SURFACE,
              borderLeft:`3px solid ${sel.id===c.id?A:"transparent"}`,
            }}>
              <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:2}}>{c.day} · {c.time}</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{c.title}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{c.instructor}</div>
            </button>
          ))}
        </Panel>

        <Panel title={`${sel.title} — ${sel.day} ${sel.time}`} action={`${count}/${students.length} present`}>
          <div style={{display:"flex",gap:9,marginBottom:13}}>
            <Btn small variant="ghost" onClick={()=>{const a={};students.forEach(s=>a[s.id]=true);setChecked(a);}}>Select All</Btn>
            <Btn small variant="ghost" onClick={()=>setChecked({})}>Clear</Btn>
          </div>
          {students.map(s=>(
            <div key={s.id} onClick={()=>toggle(s.id)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
              borderRadius:8,cursor:"pointer",marginBottom:4,
              background:checked[s.id]?`${SUCCESS}0d`:SURFACE2,
              border:`1px solid ${checked[s.id]?SUCCESS+"66":BORDER}`,
              transition:"all .2s"
            }}>
              <div style={{
                width:22,height:22,borderRadius:4,flexShrink:0,
                background:checked[s.id]?SUCCESS:BORDER,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:900,transition:"all .2s"
              }}>{checked[s.id]?"✓":""}</div>
              <Avatar name={s.name} size={32}/>
              <div style={{flex:1,fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{s.name}</div>
              <BeltBadge belt={s.belt} stripes={s.stripes}/>
            </div>
          ))}
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:12}}>
            <Btn onClick={save}>Save Attendance</Btn>
            {saved&&<span style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>✓ Saved</span>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR — shared instructor calendar + private lesson scheduling
// ─────────────────────────────────────────────────────────────────────────────
function Calendar({ role }) {
  const [events,setEvents]=useState(INIT_CALENDAR_EVENTS);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",day:"Mon",time:"",type:"class",instructor:"",capacity:"10"});
  const canEdit=role==="owner"||role==="instructor";

  const addEvent=()=>{
    if(!form.title||!form.time)return;
    setEvents(p=>[...p,{...form,id:"e"+Date.now(),capacity:parseInt(form.capacity)||10}]);
    setForm({title:"",day:"Mon",time:"",type:"class",instructor:"",capacity:"10"});
    setShowForm(false);
  };

  const typeColor={class:A,private:WARN}

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Calendar" sub="Class Schedule">
        {canEdit&&<Btn onClick={()=>setShowForm(p=>!p)}>+ Schedule</Btn>}
      </PageHeader>

      {showForm&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
          padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>New Event</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1.5fr 1fr",gap:10,alignItems:"end"}}>
            {[
              {label:"Title",    el:<Input value={form.title}      onChange={v=>setForm(p=>({...p,title:v}))}       placeholder="Class name"/>},
              {label:"Day",      el:<select value={form.day}       onChange={e=>setForm(p=>({...p,day:e.target.value}))} style={selStyle()}>{DAYS.map(d=><option key={d}>{d}</option>)}</select>},
              {label:"Time",     el:<Input value={form.time}       onChange={v=>setForm(p=>({...p,time:v}))}        placeholder="18:00"/>},
              {label:"Type",     el:<select value={form.type}      onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={selStyle()}><option value="class">Class</option><option value="private">Private</option></select>},
              {label:"Instructor",el:<Input value={form.instructor} onChange={v=>setForm(p=>({...p,instructor:v}))} placeholder="Instructor name"/>},
              {label:"Capacity", el:<Input value={form.capacity}   onChange={v=>setForm(p=>({...p,capacity:v}))}   placeholder="10" type="number"/>},
            ].map(({label,el})=>(
              <div key={label}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <Btn small onClick={addEvent}>Save Event</Btn>
            <Btn small variant="neutral" onClick={()=>setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10}}>
        {DAYS.map(day=>{
          const dayEvts=events.filter(e=>e.day===day);
          return (
            <div key={day} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{background:A,padding:"8px 0",textAlign:"center",
                fontFamily:cond,fontWeight:900,fontSize:15,color:"#fff",letterSpacing:1}}>{day}</div>
              <div style={{padding:8}}>
                {dayEvts.length===0&&<div style={{fontFamily:mono,fontSize:8,color:TEXT3,padding:"8px 4px"}}>No classes</div>}
                {dayEvts.map(e=>(
                  <div key={e.id} style={{
                    background:e.type==="private"?WARN+"18":AG,
                    border:`1px solid ${typeColor[e.type]||A}44`,
                    borderLeft:`3px solid ${typeColor[e.type]||A}`,
                    borderRadius:5,padding:"6px 8px",marginBottom:5
                  }}>
                    <div style={{fontFamily:mono,fontSize:8,color:typeColor[e.type]||A}}>{e.time}</div>
                    <div style={{fontFamily:cond,fontWeight:700,fontSize:12,color:TEXT1}}>{e.title}</div>
                    <div style={{fontFamily:mono,fontSize:7,color:TEXT3}}>{e.instructor||"—"}</div>
                    {e.type==="private"&&<Tag color={WARN}>Private</Tag>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function selStyle(){return{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,padding:"8px 10px",fontFamily:mono,fontSize:10,color:TEXT1,width:"100%"};}

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM — editable by owner/instructor, includes LMS section
// ─────────────────────────────────────────────────────────────────────────────
function Curriculum({ curriculum, setCurriculum, role }) {
  const [belt,setBelt]=useState("white");
  const [tab,setTab]=useState("techniques"); // "techniques" | "lms"
  const [taught,setTaught]=useState({});
  const [editing,setEditing]=useState(false);
  const [newTech,setNewTech]=useState("");
  const canEdit=role==="owner"||role==="instructor";

  const toggleTaught=k=>setTaught(p=>({...p,[k]:!p[k]}));
  const addTech=()=>{
    if(!newTech.trim())return;
    setCurriculum(p=>({...p,[belt]:[...p[belt],newTech.trim()]}));
    setNewTech("");
  };
  const removeTech=(belt,i)=>setCurriculum(p=>({...p,[belt]:p[belt].filter((_,idx)=>idx!==i)}));

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Curriculum" sub="Technique Library & LMS">
        {canEdit&&<Btn variant={editing?"success":"ghost"} small onClick={()=>setEditing(p=>!p)}>{editing?"Done Editing":"Edit"}</Btn>}
      </PageHeader>

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${BORDER}`,paddingBottom:0}}>
        {[["techniques","Techniques"],["lms","Instructor Certification"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"10px 20px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,
            background:"transparent",borderBottom:`3px solid ${tab===t?A:"transparent"}`,
            color:tab===t?A:TEXT2,marginBottom:-1
          }}>{l}</button>
        ))}
      </div>

      {tab==="techniques"&&(
        <>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {Object.keys(curriculum).map(b=>{
              const c=BELT_COLORS[b],on=belt===b;
              return (
                <button key={b} onClick={()=>setBelt(b)} style={{
                  padding:"8px 18px",borderRadius:7,cursor:"pointer",
                  fontFamily:mono,fontSize:9,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,
                  transition:"all .15s",
                  background:on?c.bg:SURFACE,color:on?c.text:TEXT2,
                  border:on?(b==="white"?"1px solid #b0bfd0":`1px solid ${c.bg}`):`1px solid ${BORDER}`,
                  boxShadow:on?`0 0 0 2px ${A}`:"none"
                }}>{b} belt</button>
              );
            })}
          </div>

          {editing&&(
            <div style={{display:"flex",gap:9,marginBottom:16}}>
              <Input value={newTech} onChange={setNewTech} placeholder="New technique name…" style={{flex:1}}/>
              <Btn small onClick={addTech}>Add</Btn>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {curriculum[belt].map((tech,i)=>{
              const k=`${belt}-${i}`,done=!!taught[k];
              return (
                <div key={k} style={{
                  background:done?SUCCESS+"0d":SURFACE,
                  border:`1px solid ${done?SUCCESS+"55":BORDER}`,
                  borderRadius:8,padding:"13px 16px",
                  display:"flex",alignItems:"center",gap:13,transition:"all .2s",
                  boxShadow:"0 1px 3px rgba(0,0,0,.04)"
                }}>
                  <div style={{
                    width:34,height:34,borderRadius:6,flexShrink:0,
                    background:done?SUCCESS:BELT_COLORS[belt].bg,
                    color:done?"#fff":BELT_COLORS[belt].text,
                    border:belt==="white"&&!done?"1px solid #b0bfd0":"none",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:cond,fontWeight:900,fontSize:16
                  }}>{done?"✓":i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1,marginBottom:2}}>{tech}</div>
                    <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{belt} belt</div>
                  </div>
                  {canEdit&&editing
                    ? <Btn small variant="danger" onClick={()=>removeTech(belt,i)}>Remove</Btn>
                    : <Btn small variant={done?"success":"ghost"} onClick={()=>toggleTaught(k)}>{done?"Taught":"Log"}</Btn>
                  }
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab==="lms"&&(
        <Panel title="Instructor Certification Courses">
          {LMS_COURSES.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div style={{
                width:34,height:34,borderRadius:6,flexShrink:0,
                background:c.done?SUCCESS+"18":SURFACE2,
                border:`1px solid ${c.done?SUCCESS+"55":BORDER}`,
                color:c.done?SUCCESS:TEXT3,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:15
              }}>{c.done?"✓":"○"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1,marginBottom:3}}>{c.title}</div>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{c.modules} modules</div>
                {!c.done&&c.progress>0&&<div style={{marginTop:5,width:180}}><ProgressBar pct={c.progress} h={3}/></div>}
              </div>
              <Tag color={A}>{c.level}</Tag>
              {c.done?<Tag color={SUCCESS}>Complete</Tag>:<Btn small variant="ghost">Enroll</Btn>}
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEOS — upload area (owner), view area (all)
// ─────────────────────────────────────────────────────────────────────────────
function Videos({ role }) {
  const [videos,setVideos]=useState(INIT_VIDEOS);
  const [beltF,setBeltF]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",belt:"white",duration:"00:00"});
  const canEdit=role==="owner";

  const filtered=videos.filter(v=>beltF==="all"||v.belt===beltF);

  const addVideo=()=>{
    if(!form.title.trim())return;
    setVideos(p=>[...p,{...form,id:"v"+Date.now(),date:"Apr 19, 2026"}]);
    setForm({title:"",belt:"white",duration:"00:00"});
    setShowAdd(false);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Videos" sub="Remote Learning Library">
        {canEdit&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ Add Video</Btn>}
      </PageHeader>

      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {["all","white","blue","purple","brown"].map(b=>(
          <button key={b} onClick={()=>setBeltF(b)} style={{
            padding:"6px 12px",borderRadius:6,cursor:"pointer",
            fontFamily:mono,fontSize:9,textTransform:"uppercase",letterSpacing:1,
            border:`1px solid ${BORDER}`,
            background:beltF===b?A:SURFACE,color:beltF===b?"#fff":TEXT2
          }}>{b==="all"?"All Belts":b}</button>
        ))}
      </div>

      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
          padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>Add Video</div>

          {/* File upload dropzone */}
          <div style={{border:`2px dashed ${BORDER}`,borderRadius:8,padding:"28px",textAlign:"center",marginBottom:14,background:SURFACE2}}>
            <div style={{fontSize:28,marginBottom:8}}>🎬</div>
            <div style={{fontFamily:cond,fontWeight:700,fontSize:16,color:TEXT2,marginBottom:4}}>Drop video file here or click to browse</div>
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>MP4, MOV, AVI up to 2GB</div>
            <Btn small variant="ghost">Browse Files</Btn>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,alignItems:"end"}}>
            {[
              {label:"Title",    el:<Input value={form.title}    onChange={v=>setForm(p=>({...p,title:v}))}    placeholder="Video title"/>},
              {label:"Belt",     el:<select value={form.belt}    onChange={e=>setForm(p=>({...p,belt:e.target.value}))}    style={selStyle()}>{["white","blue","purple","brown","black"].map(b=><option key={b}>{b}</option>)}</select>},
              {label:"Duration", el:<Input value={form.duration} onChange={v=>setForm(p=>({...p,duration:v}))} placeholder="14:32"/>},
            ].map(({label,el})=>(
              <div key={label}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <Btn small onClick={addVideo}>Save Video</Btn>
            <Btn small variant="neutral" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {filtered.map(v=>(
          <div key={v.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
            {/* Thumbnail placeholder */}
            <div style={{height:140,background:`linear-gradient(135deg,${BELT_COLORS[v.belt].bg}33,${A}22)`,
              display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <div style={{fontSize:40,opacity:.4}}>▶</div>
              <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.55)",
                color:"#fff",fontFamily:mono,fontSize:9,padding:"3px 8px",borderRadius:4}}>{v.duration}</div>
              <div style={{position:"absolute",top:8,left:8}}><BeltBadge belt={v.belt} stripes={0}/></div>
            </div>
            <div style={{padding:"13px 14px"}}>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1,marginBottom:5}}>{v.title}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{v.date}</div>
              <div style={{marginTop:10,display:"flex",gap:8}}>
                <Btn small>▶ Watch</Btn>
                {canEdit&&<Btn small variant="danger" onClick={()=>setVideos(p=>p.filter(x=>x.id!==v.id))}>Remove</Btn>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS — readable by all, editable only by owner
// ─────────────────────────────────────────────────────────────────────────────
function Documents({ role }) {
  const [docs,setDocs]=useState(INIT_DOCUMENTS);
  const [viewing,setViewing]=useState(null);
  const [editing,setEditing]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",category:"Policy",content:""});
  const isOwner=role==="owner";

  const saveEdit=()=>{
    setDocs(p=>p.map(d=>d.id===editing.id?{...editing}:d));
    setEditing(null);
  };
  const addDoc=()=>{
    if(!form.title.trim())return;
    setDocs(p=>[...p,{...form,id:"d"+Date.now(),date:"Apr 19, 2026"}]);
    setForm({title:"",category:"Policy",content:""});
    setShowAdd(false);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Documents" sub="Gym Library">
        {isOwner&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ New Document</Btn>}
      </PageHeader>

      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
          padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>New Document</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>TITLE</div>
              <Input value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} placeholder="Document title"/>
            </div>
            <div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>CATEGORY</div>
              <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={selStyle()}>
                {["Policy","Legal","Training","General"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>CONTENT</div>
          <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}
            placeholder="Document body text…" rows={4} style={{
              width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
              padding:"9px 12px",color:TEXT1,fontFamily:mono,fontSize:10,resize:"vertical",outline:"none"
            }}/>
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <Btn small onClick={addDoc}>Save</Btn>
            <Btn small variant="neutral" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {docs.map(d=>(
          <div key={d.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
            padding:"18px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:5}}>{d.title}</div>
                <div style={{display:"flex",gap:6}}>
                  <Tag color={A}>{d.category}</Tag>
                  <span style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{d.date}</span>
                </div>
              </div>
            </div>
            <div style={{fontFamily:mono,fontSize:9,color:TEXT2,lineHeight:1.6,marginBottom:12,
              overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
              {d.content}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn small variant="ghost" onClick={()=>setViewing(d)}>View</Btn>
              {isOwner&&<Btn small variant="neutral" onClick={()=>setEditing({...d})}>Edit</Btn>}
              {isOwner&&<Btn small variant="danger" onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))}>Delete</Btn>}
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewing&&(
        <Modal title={viewing.title} onClose={()=>setViewing(null)}>
          <Tag color={A}>{viewing.category}</Tag>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,margin:"8px 0 16px"}}>{viewing.date}</div>
          <div style={{fontFamily:mono,fontSize:11,color:TEXT2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{viewing.content}</div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing&&(
        <Modal title="Edit Document" onClose={()=>setEditing(null)}>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>TITLE</div>
            <Input value={editing.title} onChange={v=>setEditing(p=>({...p,title:v}))} placeholder="Title"/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>CONTENT</div>
            <textarea value={editing.content} onChange={e=>setEditing(p=>({...p,content:e.target.value}))} rows={6}
              style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                padding:"9px 12px",color:TEXT1,fontFamily:mono,fontSize:10,resize:"vertical",outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={saveEdit}>Save Changes</Btn>
            <Btn variant="neutral" onClick={()=>setEditing(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTORS — owner can add/remove
// ─────────────────────────────────────────────────────────────────────────────
function Instructors({ instructors, setInstructors, role }) {
  useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",belt:"purple",email:"",cert:"Level 1"});
  const isOwner=role==="owner";

  const addInstructor=()=>{
    if(!form.name.trim())return;
    setInstructors(p=>[...p,{...form,id:Date.now(),progress:0,classes:0}]);
    setForm({name:"",belt:"purple",email:"",cert:"Level 1"});
    setShowAdd(false);
  };
  const remove=id=>setInstructors(p=>p.filter(i=>i.id!==id));

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Instructors" sub="Staff & LMS">
        {isOwner&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ Add Instructor</Btn>}
      </PageHeader>

      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
          padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>New Instructor</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 2fr 1fr",gap:10,alignItems:"end"}}>
            {[
              {label:"Full Name",   el:<Input value={form.name}  onChange={v=>setForm(p=>({...p,name:v}))}  placeholder="Name"/>},
              {label:"Belt",        el:<select value={form.belt} onChange={e=>setForm(p=>({...p,belt:e.target.value}))} style={selStyle()}>{["blue","purple","brown","black"].map(b=><option key={b}>{b}</option>)}</select>},
              {label:"Email",       el:<Input value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} placeholder="email@gym.com"/>},
              {label:"Cert Level",  el:<select value={form.cert} onChange={e=>setForm(p=>({...p,cert:e.target.value}))} style={selStyle()}>{["Level 1","Level 2","Level 3"].map(l=><option key={l}>{l}</option>)}</select>},
            ].map(({label,el})=>(
              <div key={label}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <Btn small onClick={addInstructor}>Save</Btn>
            <Btn small variant="neutral" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16,marginBottom:28}}>
        {instructors.map(ins=>(
          <div key={ins.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
            padding:20,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
            <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:14}}>
              <Avatar name={ins.name} size={46}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:4}}>{ins.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <BeltBadge belt={ins.belt} stripes={0}/>
                  <Tag color={A}>{ins.cert}</Tag>
                </div>
                {ins.email&&<div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:4}}>{ins.email}</div>}
              </div>
            </div>
            <div style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1}}>LMS COMPLETION</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:16,color:ins.progress===100?SUCCESS:A}}>{ins.progress}%</div>
              </div>
              <ProgressBar pct={ins.progress}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${BORDER}`,paddingTop:11,alignItems:"center"}}>
              <Info label="Classes" value={ins.classes}/>
              <Info label="Status"  value={ins.progress===100?"Certified":"In Progress"}/>
              {isOwner&&<Btn small variant="danger" onClick={()=>remove(ins.id)}>Remove</Btn>}
            </div>
          </div>
        ))}
      </div>

      <Panel title="Certification Course Catalog">
        {LMS_COURSES.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
            <div style={{
              width:32,height:32,borderRadius:6,flexShrink:0,
              background:c.done?SUCCESS+"14":SURFACE2,border:`1px solid ${c.done?SUCCESS+"55":BORDER}`,
              color:c.done?SUCCESS:TEXT3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14
            }}>{c.done?"✓":"○"}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1,marginBottom:2}}>{c.title}</div>
              {!c.done&&c.progress>0&&<div style={{width:160,marginTop:4}}><ProgressBar pct={c.progress} h={3}/></div>}
            </div>
            <Tag color={A}>{c.level}</Tag>
            {c.done?<Tag color={SUCCESS}>Complete</Tag>:<Btn small variant="ghost">Enroll</Btn>}
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING — SMS blast + individual messages (owner only)
// ─────────────────────────────────────────────────────────────────────────────
function Messaging({ students }) {
  const [tab,setTab]=useState("blast");
  const [blastMsg,setBlastMsg]=useState("");
  const [blastSent,setBlastSent]=useState(false);
  const [selectedStudent,setSelectedStudent]=useState(students[0]?.id||null);
  const [directMsg,setDirectMsg]=useState("");
  const [messages,setMessages]=useState([
    {studentId:1,from:"owner",text:"Your dues are coming up next week.",time:"Apr 14"},
    {studentId:1,from:"student",text:"Thanks, I'll sort it out!",time:"Apr 14"},
    {studentId:4,from:"owner",text:"Hi Sofia, your payment is overdue.",time:"Apr 16"},
  ]);

  const sendBlast=()=>{
    if(!blastMsg.trim())return;
    setBlastSent(true);setBlastMsg("");
    setTimeout(()=>setBlastSent(false),3000);
  };
  const sendDirect=()=>{
    if(!directMsg.trim())return;
    setMessages(p=>[...p,{studentId:selectedStudent,from:"owner",text:directMsg,time:"Now"}]);
    setDirectMsg("");
  };

  const conv=messages.filter(m=>m.studentId===selectedStudent);
  const selS=students.find(s=>s.id===selectedStudent);

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Messaging" sub="SMS & Direct Messages"/>

      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${BORDER}`}}>
        {[["blast","Broadcast to All"],["direct","Individual Message"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,
            background:"transparent",borderBottom:`3px solid ${tab===t?A:"transparent"}`,
            color:tab===t?A:TEXT2,marginBottom:-1
          }}>{l}</button>
        ))}
      </div>

      {tab==="blast"&&(
        <div style={{maxWidth:600}}>
          <Panel title="Send SMS to All Students">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>
              This message will be sent as an SMS to all {students.length} active students.
            </div>
            <textarea value={blastMsg} onChange={e=>setBlastMsg(e.target.value)}
              placeholder="Type your message here… (max 160 chars for single SMS)"
              maxLength={320} rows={4} style={{
                width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                padding:"10px 12px",color:TEXT1,fontFamily:mono,fontSize:10,resize:"none",outline:"none",
                marginBottom:10
              }}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{blastMsg.length}/320 characters</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {blastSent&&<span style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>✓ Sent to all students!</span>}
                <Btn onClick={sendBlast} disabled={!blastMsg.trim()}>Send to All</Btn>
              </div>
            </div>
          </Panel>

          <div style={{marginTop:16}}>
            <Panel title="Recent Broadcasts">
              {[
                {date:"Apr 12",msg:"Reminder: No-Gi class moved to 7pm this Friday.",recipients:8},
                {date:"Apr 5", msg:"Congratulations to all students who competed last weekend!",recipients:8},
                {date:"Mar 28",msg:"Belt promotion ceremony this Saturday at 11am. All are welcome!",recipients:7},
              ].map((b,i)=>(
                <div key={i} style={{padding:"11px 0",borderBottom:`1px solid ${BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontFamily:mono,fontSize:9,color:A}}>{b.date}</span>
                    <Tag color={SUCCESS}>{b.recipients} recipients</Tag>
                  </div>
                  <div style={{fontFamily:mono,fontSize:10,color:TEXT2}}>{b.msg}</div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      )}

      {tab==="direct"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:18,height:500}}>
          {/* Student list */}
          <Panel title="Students" noPad>
            <div style={{overflowY:"auto",maxHeight:440}}>
              {students.map(s=>{
                const unread=messages.filter(m=>m.studentId===s.id).length;
                return (
                  <button key={s.id} onClick={()=>setSelectedStudent(s.id)} style={{
                    display:"flex",alignItems:"center",gap:10,width:"100%",
                    padding:"11px 14px",border:"none",cursor:"pointer",
                    background:selectedStudent===s.id?AG:SURFACE,textAlign:"left",
                    borderLeft:`3px solid ${selectedStudent===s.id?A:"transparent"}`
                  }}>
                    <Avatar name={s.name} size={32}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:cond,fontWeight:700,fontSize:13,color:TEXT1}}>{s.name}</div>
                      <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{unread} messages</div>
                    </div>
                    {s.billing==="Overdue"&&<div style={{width:6,height:6,borderRadius:3,background:DANGER}}/>}
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Conversation */}
          <Panel title={selS?selS.name:"Select a student"} action={selS?<BeltBadge belt={selS.belt} stripes={selS.stripes}/>:null}>
            <div style={{display:"flex",flexDirection:"column",height:360}}>
              <div style={{flex:1,overflowY:"auto",marginBottom:12}}>
                {conv.length===0&&<div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>No messages yet.</div>}
                {conv.map((m,i)=>(
                  <div key={i} style={{
                    display:"flex",justifyContent:m.from==="owner"?"flex-end":"flex-start",
                    marginBottom:8
                  }}>
                    <div style={{
                      maxWidth:"75%",padding:"8px 13px",borderRadius:10,
                      background:m.from==="owner"?A:SURFACE2,
                      color:m.from==="owner"?"#fff":TEXT1,
                      border:m.from==="owner"?"none":`1px solid ${BORDER}`,
                      fontFamily:mono,fontSize:10
                    }}>
                      <div>{m.text}</div>
                      <div style={{fontSize:8,opacity:.6,marginTop:3}}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <input value={directMsg} onChange={e=>setDirectMsg(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendDirect()}
                  placeholder="Type a message…"
                  style={{flex:1,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                    padding:"9px 13px",color:TEXT1,fontFamily:mono,fontSize:10,outline:"none"}}/>
                <Btn small onClick={sendDirect} disabled={!directMsg.trim()}>Send</Btn>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────
function Reports({ students }) {
  const beltCounts=Object.entries(students.reduce((a,s)=>({...a,[s.belt]:(a[s.belt]||0)+1}),{}));
  const maxC=Math.max(...beltCounts.map(([,c])=>c),1);
  const mrr=students.filter(s=>s.billing==="Active").reduce((a,s)=>{
    const ef=s.discount>0?s.fee*(1-s.discount/100):s.fee;
    return a+ef;
  },0);
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Reports" sub="Analytics & Insights"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
        <StatCard label="Monthly MRR"    value={`$${Math.round(mrr)}`} sub="after discounts"   accent={SUCCESS}/>
        <StatCard label="Retention Rate" value="91%"                   sub="past 12 months"    accent={A}/>
        <StatCard label="Avg Belt Tenure"value="18 mo"                 sub="white to blue avg" accent="#7c3aed"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:18,marginBottom:18}}>
        <Panel title="Monthly Attendance Rate">
          <div style={{display:"flex",alignItems:"flex-end",gap:12,height:90,paddingTop:8}}>
            {ATTENDANCE_TREND.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontFamily:mono,fontSize:9,color:A}}>{d.pct}%</div>
                <div style={{width:"100%",height:(d.pct/100)*72,
                  background:`linear-gradient(0deg,${A},${A}88)`,borderRadius:"3px 3px 0 0"}}/>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{d.month}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Belt Distribution">
          {beltCounts.map(([b,count])=>(
            <div key={b} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <BeltBadge belt={b} stripes={0}/>
              <div style={{flex:1}}><ProgressBar pct={(count/maxC)*100} color={b==="white"?"#9aadcc":BELT_COLORS[b].bg}/></div>
              <div style={{fontFamily:mono,fontSize:10,color:TEXT3,minWidth:14,textAlign:"right"}}>{count}</div>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Student Billing Status">
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto auto",gap:"0 20px"}}>
          {["Name","Belt","Base Fee","Discount","Net/mo"].map(h=>(
            <div key={h} style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,
              textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${BORDER}`}}>{h}</div>
          ))}
          {students.map(s=>{
            const net=s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee;
            return [
              <div key={`n${s.id}`} style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT2,padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>{s.name}</div>,
              <div key={`b${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}><BeltBadge belt={s.belt} stripes={s.stripes}/></div>,
              <div key={`f${s.id}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>${s.fee}</div>,
              <div key={`d${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>
                {s.discount>0?<Tag color={SUCCESS}>{s.discount}%</Tag>:<span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>—</span>}
              </div>,
              <div key={`st${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>
                <span style={{fontFamily:cond,fontWeight:700,fontSize:15,color:s.billing==="Active"?SUCCESS:DANGER}}>${net}</span>
              </div>,
            ];
          })}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING — split-payment support + owner full view + student/parent self-view
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_ICONS = { card:"💳", bank:"🏦", cash:"💵", venmo:"📱", zelle:"⚡" };
const PAYMENT_METHOD_LABELS = { card:"Credit/Debit Card", bank:"ACH Bank Transfer", cash:"Cash", venmo:"Venmo", zelle:"Zelle" };

const INIT_PAYMENT_METHODS = [
  { id:"pm1", type:"card",  label:"Visa ···· 4242", last4:"4242", isDefault:true  },
  { id:"pm2", type:"bank",  label:"Chase Checking ···· 8891", last4:"8891", isDefault:false },
  { id:"pm3", type:"venmo", label:"@marcus-silva",  last4:null,   isDefault:false },
];

// Default split: 100% on the default method; owner/student can adjust
const INIT_SPLITS = [
  { methodId:"pm1", pct:100 },
];

function SplitPaymentEditor({ methods, splits, setSplits, totalAmount }) {
  const addSplit = () => {
    const usedIds = splits.map(s=>s.methodId);
    const next = methods.find(m=>!usedIds.includes(m.id));
    if(!next) return;
    // redistribute evenly
    const newSplits = [...splits, {methodId:next.id, pct:0}];
    const even = Math.floor(100/newSplits.length);
    const rem  = 100 - even*(newSplits.length-1);
    setSplits(newSplits.map((s,i)=>({...s, pct: i===newSplits.length-1?rem:even})));
  };

  const removeSplit = (mid) => {
    if(splits.length===1) return;
    const remaining = splits.filter(s=>s.methodId!==mid);
    const total = remaining.reduce((a,s)=>a+s.pct,0);
    const diff  = 100 - total;
    setSplits(remaining.map((s,i)=>i===0?{...s,pct:s.pct+diff}:s));
  };

  const updatePct = (mid, raw) => {
    const val = Math.min(100, Math.max(0, parseInt(raw)||0));
    setSplits(p=>p.map(s=>s.methodId===mid?{...s,pct:val}:s));
  };

  const total = splits.reduce((a,s)=>a+s.pct,0);
  const balanced = total===100;

  return (
    <div>
      {splits.map((sp,i)=>{
        const m = methods.find(x=>x.id===sp.methodId);
        if(!m) return null;
        const amt = Math.round((sp.pct/100)*totalAmount*100)/100;
        return (
          <div key={sp.methodId} style={{
            display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
            background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,marginBottom:8
          }}>
            <div style={{fontSize:18,flexShrink:0}}>{PAYMENT_METHOD_ICONS[m.type]}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{m.label}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{PAYMENT_METHOD_LABELS[m.type]}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <input type="number" value={sp.pct} min={0} max={100}
                onChange={e=>updatePct(sp.methodId,e.target.value)}
                style={{width:54,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,
                  padding:"6px 8px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"center"}}/>
              <span style={{fontFamily:mono,fontSize:11,color:TEXT2}}>%</span>
            </div>
            <div style={{minWidth:56,textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1}}>${amt.toFixed(2)}</div>
            </div>
            {splits.length>1&&(
              <button onClick={()=>removeSplit(sp.methodId)} style={{
                background:"none",border:"none",cursor:"pointer",color:TEXT3,fontSize:16,flexShrink:0,padding:"0 2px"
              }}>✕</button>
            )}
          </div>
        );
      })}

      {/* Total validation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"9px 14px",borderRadius:6,marginBottom:12,
        background:balanced?SUCCESS+"0d":DANGER+"0d",
        border:`1px solid ${balanced?SUCCESS+"44":DANGER+"33"}`}}>
        <div style={{fontFamily:mono,fontSize:10,color:balanced?SUCCESS:DANGER}}>
          {balanced?"✓ Split totals 100%":`Split total: ${total}% — must equal 100%`}
        </div>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1}}>
          Total: ${totalAmount}
        </div>
      </div>

      {/* Add method button */}
      {splits.length < methods.length && (
        <Btn small variant="ghost" onClick={addSplit}>+ Add Payment Method</Btn>
      )}
    </div>
  );
}

function Billing({ students, role }) {
  const isOwner  = role==="owner";
  const isParent = role==="parent";
  const isStudent= role==="student";
  const overdue  = students.filter(s=>s.billing==="Overdue");
  const mrr      = students.filter(s=>s.billing==="Active").reduce((a,s)=>
    a+(s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee),0);

  // Payment methods + splits state (per-user in production; shared here for demo)
  const [methods,  setMethods]  = useState(INIT_PAYMENT_METHODS);
  const [splits,   setSplits]   = useState(INIT_SPLITS);
  const [showAddM, setShowAddM] = useState(false);
  const [newType,  setNewType]  = useState("card");
  const [newLabel, setNewLabel] = useState("");
  const [payModal, setPayModal] = useState(false);  // split-pay modal
  const [paySent,  setPaySent]  = useState(false);

  const me = students[0]; // simulated logged-in student
  const myFee = me.discount>0 ? Math.round(me.fee*(1-me.discount/100)) : me.fee;

  const addMethod = () => {
    if(!newLabel.trim()) return;
    setMethods(p=>[...p,{id:"pm"+Date.now(),type:newType,label:newLabel,last4:null,isDefault:false}]);
    setNewLabel(""); setShowAddM(false);
  };

  const removeMethod = (id) => {
    setMethods(p=>p.filter(m=>m.id!==id));
    setSplits(p=>p.filter(s=>s.methodId!==id));
  };

  const submitPayment = () => {
    const balanced = splits.reduce((a,s)=>a+s.pct,0)===100;
    if(!balanced) return;
    setPaySent(true); setPayModal(false);
    setTimeout(()=>setPaySent(false),3500);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Billing" sub={isOwner?"Finance":isParent?"My Account":"My Billing"}/>

      {/* ── Owner KPIs ────────────────────────────────────────────────────── */}
      {isOwner&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
            <StatCard label="Monthly MRR"  value={`$${mrr}`}        sub="after discounts"  accent={SUCCESS}/>
            <StatCard label="Overdue"      value={overdue.length}   sub="requires action"  accent={DANGER}/>
            <StatCard label="Paused"       value={students.filter(s=>s.billing==="Paused").length} sub="on hold" accent={WARN}/>
          </div>
          {overdue.length>0&&(
            <div style={{background:DANGER+"0d",border:`1px solid ${DANGER}33`,borderRadius:8,
              padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:DANGER}}>Overdue Accounts</div>
                <div style={{fontFamily:mono,fontSize:9,color:DANGER+"aa"}}>{overdue.map(s=>s.name).join(", ")}</div>
              </div>
              <Btn small variant="danger">Send Reminders</Btn>
            </div>
          )}
        </>
      )}

      {/* ── Student / Parent: current balance + split-pay CTA ─────────────── */}
      {(isStudent||isParent)&&(
        <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:12,padding:"20px 22px",
          marginBottom:22,display:"flex",alignItems:"center",gap:20,boxShadow:"0 2px 8px rgba(37,99,235,.07)"}}>
          <div>
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,letterSpacing:1,marginBottom:4}}>NEXT PAYMENT DUE</div>
            <div style={{fontFamily:cond,fontWeight:900,fontSize:38,color:TEXT1,lineHeight:1}}>${myFee}</div>
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:4}}>May 1, 2026 · Monthly membership</div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:10}}>
            {paySent&&<span style={{fontFamily:mono,fontSize:10,color:SUCCESS,alignSelf:"center"}}>✓ Payment submitted!</span>}
            <Btn onClick={()=>setPayModal(true)}>Pay ${myFee}</Btn>
          </div>
        </div>
      )}

      {/* ── Payment Methods panel (student/parent/owner) ──────────────────── */}
      {(isStudent||isParent||isOwner)&&(
        <div style={{marginBottom:22}}>
          <Panel title="Payment Methods" action={<button onClick={()=>setShowAddM(p=>!p)} style={{
            background:"none",border:"none",cursor:"pointer",fontFamily:mono,fontSize:9,
            color:A,letterSpacing:1,textTransform:"uppercase"}}>+ Add Method</button>}>

            {showAddM&&(
              <div style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,
                padding:"14px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
                <div style={{minWidth:130}}>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>TYPE</div>
                  <select value={newType} onChange={e=>setNewType(e.target.value)} style={selStyle()}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{flex:1,minWidth:160}}>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>LABEL / ACCOUNT</div>
                  <Input value={newLabel} onChange={setNewLabel} placeholder={
                    newType==="card"?"Visa ···· 1234":newType==="bank"?"Chase ···· 5678":newType==="venmo"?"@handle":"Account label"
                  }/>
                </div>
                <Btn small onClick={addMethod}>Save</Btn>
                <Btn small variant="neutral" onClick={()=>setShowAddM(false)}>Cancel</Btn>
              </div>
            )}

            {methods.length===0&&(
              <div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>No payment methods on file.</div>
            )}
            {methods.map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${BORDER}`}}>
                <div style={{fontSize:20}}>{PAYMENT_METHOD_ICONS[m.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{m.label}</div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{PAYMENT_METHOD_LABELS[m.type]}</div>
                </div>
                {m.isDefault&&<Tag color={A}>Default</Tag>}
                <button onClick={()=>removeMethod(m.id)} style={{
                  background:"none",border:"none",cursor:"pointer",
                  fontFamily:mono,fontSize:9,color:DANGER,letterSpacing:1,textTransform:"uppercase",padding:"4px 8px"
                }}>Remove</button>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {/* ── Transaction history ───────────────────────────────────────────── */}
      <Panel title={isOwner?"All Transactions":"Payment History"}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"0 20px"}}>
          {["Date","Description","Amount","Status"].map(h=>(
            <div key={h} style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,
              textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${BORDER}`}}>{h}</div>
          ))}
          {BILLING_HISTORY.map((r,i)=>[
            <div key={`d${i}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>{r.date}</div>,
            <div key={`n${i}`} style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>{r.desc}</div>,
            <div key={`a${i}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>${r.amount}</div>,
            <div key={`s${i}`} style={{padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>
              <Tag color={r.status==="Paid"?SUCCESS:DANGER}>{r.status}</Tag>
            </div>,
          ])}
        </div>
        <div style={{marginTop:14,display:"flex",justifyContent:"flex-end",gap:10}}>
          <Btn small variant="neutral">Download PDF</Btn>
        </div>
      </Panel>

      <div style={{marginTop:16,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:10,
        padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:22}}>💳</div>
        <div>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:2}}>Stripe Integration — Coming in v1.1</div>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Real-time card processing, ACH, and automated recurring billing</div>
        </div>
        <div style={{flex:1}}/>
        <Btn small variant="ghost">Learn More</Btn>
      </div>

      {/* ── Split-pay modal ───────────────────────────────────────────────── */}
      {payModal&&(
        <Modal title={`Pay $${myFee} — Split Payment`} onClose={()=>setPayModal(false)}>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:16,lineHeight:1.7}}>
            Divide this payment across multiple methods. Percentages must add up to 100%.
          </div>

          <SplitPaymentEditor
            methods={methods}
            splits={splits}
            setSplits={setSplits}
            totalAmount={myFee}
          />

          <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
            <Btn variant="neutral" onClick={()=>setPayModal(false)}>Cancel</Btn>
            <Btn onClick={submitPayment} disabled={splits.reduce((a,s)=>a+s.pct,0)!==100}>
              Confirm Payment
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS — owner: logo, prices, discounts, promotion requirements
// ─────────────────────────────────────────────────────────────────────────────
function Settings({ promoReqs, setPromoReqs, prices, setPrices, students, setStudents, gymLogo, setGymLogo }) {
  const [tab,setTab]=useState("pricing");
  const logoRef=useRef();

  const handleLogo=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setGymLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const updatePrice=(key,val)=>setPrices(p=>({...p,[key]:parseInt(val)||0}));
  const updateDiscount=(studentId,val)=>setStudents(p=>p.map(s=>s.id===studentId?{...s,discount:Math.min(100,Math.max(0,parseInt(val)||0))}:s));
  const updatePromo=(belt,field,val)=>setPromoReqs(p=>({
    ...p,[belt]:{...p[belt],[field]:field==="evalRequired"?val:parseInt(val)||0}
  }));

  const tabItems=[["pricing","Pricing & Discounts"],["promo","Promotion Requirements"],["logo","Gym Logo & Branding"]];

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Settings" sub="Gym Configuration"/>

      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:`1px solid ${BORDER}`}}>
        {tabItems.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,
            background:"transparent",borderBottom:`3px solid ${tab===t?A:"transparent"}`,
            color:tab===t?A:TEXT2,marginBottom:-1
          }}>{l}</button>
        ))}
      </div>

      {/* PRICING TAB */}
      {tab==="pricing"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Panel title="Membership Prices">
            {[["adult","Adult (18+)"],["youth","Youth (Under 18)"],["family","Family Plan"]].map(([key,label])=>(
              <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"13px 0",borderBottom:`1px solid ${BORDER}`}}>
                <div>
                  <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{label}</div>
                  <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Monthly fee</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:mono,fontSize:14,color:TEXT2}}>$</span>
                  <input type="number" value={prices[key]} onChange={e=>updatePrice(key,e.target.value)}
                    style={{width:70,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                      padding:"7px 10px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"right"}}/>
                  <span style={{fontFamily:mono,fontSize:10,color:TEXT3}}>/mo</span>
                </div>
              </div>
            ))}
            <div style={{marginTop:14}}>
              <Btn small>Save Prices</Btn>
            </div>
          </Panel>

          <Panel title="Individual Discounts">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>
              Set a % discount for individual students. Enter 0 for no discount.
            </div>
            {students.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
                <Avatar name={s.name} size={30}/>
                <div style={{flex:1,fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{s.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <input type="number" value={s.discount} min={0} max={100}
                    onChange={e=>updateDiscount(s.id,e.target.value)}
                    style={{width:52,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                      padding:"5px 8px",fontFamily:mono,fontSize:11,color:TEXT1,outline:"none",textAlign:"center"}}/>
                  <span style={{fontFamily:mono,fontSize:10,color:TEXT3}}>%</span>
                  {s.discount>0&&<Tag color={SUCCESS}>-${Math.round(s.fee*s.discount/100)}/mo</Tag>}
                </div>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {/* PROMO REQUIREMENTS TAB */}
      {tab==="promo"&&(
        <div>
          <div style={{fontFamily:mono,fontSize:10,color:TEXT2,marginBottom:18}}>
            Configure the minimum requirements a student must meet before being eligible for promotion.
          </div>
          {Object.entries(promoReqs).map(([belt,reqs])=>(
            <div key={belt} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
              marginBottom:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <div style={{background:BELT_COLORS[belt].bg,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
                <BeltBadge belt={belt} stripes={0}/>
                <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:BELT_COLORS[belt].text,textTransform:"uppercase"}}>
                  {belt} Belt — Promotion Requirements
                </div>
              </div>
              <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {[
                  {field:"months",    label:"Min. Months in Rank", type:"number", suffix:"mo"},
                  {field:"classes",   label:"Min. Classes Attended",type:"number", suffix:"classes"},
                  {field:"techniques",label:"Min. Techniques Trained",type:"number",suffix:"techs"},
                ].map(({field,label,suffix})=>(
                  <div key={field}>
                    <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <input type="number" value={reqs[field]} min={0}
                        onChange={e=>updatePromo(belt,field,e.target.value)}
                        style={{width:70,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,
                          padding:"7px 10px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"center"}}/>
                      <span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{suffix}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>Instructor Eval</div>
                  <button onClick={()=>updatePromo(belt,"evalRequired",!reqs.evalRequired)} style={{
                    padding:"8px 14px",borderRadius:6,border:"none",cursor:"pointer",
                    fontFamily:mono,fontSize:10,letterSpacing:1,textTransform:"uppercase",
                    background:reqs.evalRequired?SUCCESS:SURFACE2,
                    color:reqs.evalRequired?"#fff":TEXT3
                  }}>{reqs.evalRequired?"Required":"Not Required"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGO TAB */}
      {tab==="logo"&&(
        <div style={{maxWidth:500}}>
          <Panel title="Gym Logo & Branding">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:16}}>
              Upload your gym logo to display in the sidebar. Recommended: PNG with transparent background, min 200x100px.
            </div>

            {gymLogo
              ? (
                <div style={{marginBottom:16}}>
                  <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Current Logo</div>
                  <div style={{background:SIDEBAR,borderRadius:8,padding:16,display:"inline-block"}}>
                    <img src={gymLogo} alt="logo" style={{maxWidth:200,maxHeight:80,objectFit:"contain"}}/>
                  </div>
                </div>
              )
              : (
                <div style={{background:SIDEBAR,borderRadius:8,padding:"28px 20px",textAlign:"center",marginBottom:16}}>
                  <div style={{fontFamily:cond,fontWeight:900,fontSize:20,color:"#f0f6ff"}}>
                    <span style={{color:A}}>BJJ</span>Groundwork
                  </div>
                  <div style={{fontFamily:mono,fontSize:9,color:"#3a5570",marginTop:3}}>Default wordmark</div>
                </div>
              )
            }

            <div style={{border:`2px dashed ${BORDER}`,borderRadius:8,padding:"24px",textAlign:"center",background:SURFACE2,marginBottom:14}}>
              <div style={{fontSize:28,marginBottom:8}}>🖼️</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT2,marginBottom:4}}>Drop your logo here or click to browse</div>
              <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>PNG, SVG, or JPG — max 2MB</div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} style={{display:"none"}}/>
              <Btn small variant="ghost" onClick={()=>logoRef.current.click()}>Browse Files</Btn>
            </div>

            {gymLogo&&<Btn small variant="danger" onClick={()=>setGymLogo(null)}>Remove Logo</Btn>}
          </Panel>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MY PROGRESS (Student view)
// ─────────────────────────────────────────────────────────────────────────────
function MyProgress({ students, promoReqs, curriculum }) {
  const me=students[0];
  const pct=Math.min(Math.round((me.attendance/me.nextEligible)*100),100);
  const req=promoReqs[me.belt];

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="My Progress" sub="Student Dashboard"/>
      <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:14,padding:24,
        display:"flex",alignItems:"center",gap:22,marginBottom:20,boxShadow:"0 2px 8px rgba(37,99,235,.08)"}}>
        <Avatar name={me.name} size={64}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:26,color:TEXT1,marginBottom:5}}>{me.name}</div>
          <BeltBadge belt={me.belt} stripes={me.stripes}/>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:7}}>Member since {me.joined} · {me.attendance} total classes</div>
        </div>
        <div style={{textAlign:"center"}}>
          <ProgressRing pct={pct} size={80}/>
          <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:2}}>PROMOTION</div>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:20,color:pct>=100?SUCCESS:A}}>{pct}%</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <Panel title={`${me.belt} Belt — Requirements`}>
          {[
            {label:"Time in Rank",   val:`${req.months} months required`,    done:false},
            {label:"Classes",        val:`${me.attendance}/${req.classes}`,  done:me.attendance>=req.classes},
            {label:"Techniques",     val:`${req.techniques} must be trained`,done:false},
            {label:"Instructor Eval",val:req.evalRequired?"Required":"Not Required",done:!req.evalRequired},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div style={{
                width:26,height:26,borderRadius:4,flexShrink:0,
                background:r.done?SUCCESS+"18":SURFACE2,color:r.done?SUCCESS:TEXT3,
                border:`1px solid ${r.done?SUCCESS+"55":BORDER}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13
              }}>{r.done?"✓":"○"}</div>
              <div>
                <div style={{fontFamily:mono,fontSize:9,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{r.label}</div>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{r.val}</div>
              </div>
            </div>
          ))}
          {curriculum[me.belt].slice(0,4).map((tech,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div style={{
                width:22,height:22,borderRadius:3,flexShrink:0,fontSize:11,
                background:i<3?SUCCESS+"18":SURFACE2,color:i<3?SUCCESS:TEXT3,
                border:`1px solid ${i<3?SUCCESS+"55":BORDER}`,
                display:"flex",alignItems:"center",justifyContent:"center"
              }}>{i<3?"✓":"○"}</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:13,color:TEXT2}}>{tech}</div>
            </div>
          ))}
        </Panel>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Panel title="Monthly Attendance">
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:60}}>
              {[4,6,5,7,8,6,8,9,7,8,9,10].map((v,i)=>(
                <div key={i} style={{flex:1,height:(v/10)*56,
                  background:i===11?A:`${A}44`,borderRadius:"2px 2px 0 0"}}/>
              ))}
            </div>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:6}}>Classes/month, last 12 months</div>
          </Panel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <StatCard label="Classes Left" value={Math.max(me.nextEligible-me.attendance,0)} sub="for promotion" accent={A}/>
            <StatCard label="This Month"   value={9} sub="classes attended" accent={SUCCESS}/>
          </div>
          <Panel title="My Billing">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:SUCCESS}}>${me.discount>0?Math.round(me.fee*(1-me.discount/100)):me.fee}</div>
                <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>per month{me.discount>0?` (${me.discount}% discount)`:""}</div>
              </div>
              <Tag color={me.billing==="Active"?SUCCESS:DANGER}>{me.billing}</Tag>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT PORTAL
// ─────────────────────────────────────────────────────────────────────────────
function ParentPortal({ students, curriculum }) {
  const children=students.filter(s=>s.parentId==="P1");
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="My Children" sub="Parent Portal" badge="Guardian View"/>
      {children.map(child=>{
        const pct=Math.min(Math.round((child.attendance/child.nextEligible)*100),100);
        return (
          <div key={child.id} style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:14,
            padding:22,marginBottom:18,boxShadow:"0 2px 8px rgba(37,99,235,.07)"}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
              <Avatar name={child.name} size={56}/>
              <div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:TEXT1,marginBottom:5}}>{child.name}</div>
                <div style={{display:"flex",gap:7}}><BeltBadge belt={child.belt} stripes={child.stripes}/><Tag color={A}>Age {child.age}</Tag><Tag color={SUCCESS}>{child.billing}</Tag></div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"center"}}>
                <ProgressRing pct={pct} size={66}/>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:2}}>PROMOTION</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:17,color:pct>=100?SUCCESS:A}}>{pct}%</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
              <Panel title="Attendance"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:TEXT1}}>{child.attendance}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>total classes</div></Panel>
              <Panel title="Classes Left"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:A}}>{Math.max(child.nextEligible-child.attendance,0)}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>for promotion</div></Panel>
              <Panel title="Membership"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:SUCCESS}}>${child.fee}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>per month</div></Panel>
            </div>
            <Panel title={`${child.belt} Belt Curriculum`}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {curriculum[child.belt].map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:7,alignItems:"center",fontFamily:mono,fontSize:9,color:TEXT2}}>
                    <span style={{color:i<2?SUCCESS:TEXT3,flexShrink:0}}>{i<2?"✓":"○"}</span>{t}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [role,setRole]             = useState("owner");
  const [active,setActive]         = useState("dashboard");
  const [students,setStudents]     = useState(INIT_STUDENTS);
  const [instructors,setInstructors]= useState(INIT_INSTRUCTORS);
  const [curriculum,setCurriculum] = useState(INIT_CURRICULUM);
  const [promoReqs,setPromoReqs]   = useState(INIT_PROMO_REQS);
  const [prices,setPrices]         = useState(INIT_PRICES);
  const [gymLogo,setGymLogo]       = useState(null);

  useEffect(()=>{ setActive(ROLES[role].nav[0]); },[role]);

  const sharedProps={ students,setStudents,instructors,setInstructors,
    curriculum,setCurriculum,promoReqs,setPromoReqs,prices,setPrices,role };

  const VIEW = {
    dashboard:       <Dashboard       {...sharedProps}/>,
    students:        <Students        {...sharedProps}/>,
    attendance:      <Attendance      {...sharedProps}/>,
    calendar:        <Calendar        role={role}/>,
    curriculum:      <Curriculum      {...sharedProps}/>,
    videos:          <Videos          role={role}/>,
    documents:       <Documents       role={role}/>,
    instructors:     <Instructors     {...sharedProps}/>,
    messaging:       <Messaging       students={students}/>,
    reports:         <Reports         students={students}/>,
    billing:         <Billing         students={students} role={role}/>,
    settings:        <Settings        {...sharedProps} gymLogo={gymLogo} setGymLogo={setGymLogo}/>,
    "my-progress":   <MyProgress      students={students} promoReqs={promoReqs} curriculum={curriculum}/>,
    "parent-portal": <ParentPortal    students={students} curriculum={curriculum}/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};color:${TEXT1}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${BG}}
        ::-webkit-scrollbar-thumb{background:${BORDER};border-radius:3px}
        button:hover{opacity:.84}
        input[type=number]::-webkit-inner-spin-button{opacity:.5}
        select{appearance:auto}
      `}</style>

      <div style={{display:"flex",minHeight:"100vh",background:BG}}>
        <Sidebar active={active} setActive={setActive} role={role} setRole={setRole} gymLogo={gymLogo}/>
        <main style={{flex:1,overflowY:"auto",maxHeight:"100vh",background:BG}}>
          {VIEW[active]??<div style={{padding:40,fontFamily:mono,color:TEXT3}}>View not found.</div>}
        </main>
      </div>
    </>
  );
}