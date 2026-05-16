import { useState, useEffect, useRef } from "react";
import { useUser, SignIn, SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const A       = "#2563eb";
const AG      = "#2563eb14";
const AB      = "#2563eb44";
const SUCCESS = "#059669";
const WARN    = "#d97706";
const DANGER  = "#dc2626";
const BG      = "#f0f4f8";
const SURFACE = "#ffffff";
const SURFACE2= "#f8fafc";
const BORDER  = "#d1dce8";
const TEXT1   = "#0f2540";
const TEXT2   = "#4a6080";
const TEXT3   = "#8aaac8";
const SIDEBAR  = "#1e2d3d";
const SIDEBAR2 = "#162433";
const mono    = "'DM Mono',monospace";
const cond    = "'Barlow Condensed',sans-serif";
const GYM_ID  = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const BELT_COLORS = {
  white:  { bg:"#e8edf5", text:"#1a2a3a" },
  blue:   { bg:"#1d4ed8", text:"#fff"    },
  purple: { bg:"#7e22ce", text:"#fff"    },
  brown:  { bg:"#78350f", text:"#fff"    },
  black:  { bg:"#1e293b", text:"#e2e8f0" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATIC / FALLBACK DATA
// ─────────────────────────────────────────────────────────────────────────────
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

const INIT_PRICES = { adult:120, youth:85, family:200 };

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

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const PAYMENT_METHOD_ICONS  = { card:"💳", bank:"🏦", cash:"💵", venmo:"📱", zelle:"⚡" };
const PAYMENT_METHOD_LABELS = { card:"Credit/Debit Card", bank:"ACH Bank Transfer", cash:"Cash", venmo:"Venmo", zelle:"Zelle" };
const INIT_PAYMENT_METHODS  = [
  { id:"pm1", type:"card",  label:"Visa ···· 4242",            isDefault:true  },
  { id:"pm2", type:"bank",  label:"Chase Checking ···· 8891",  isDefault:false },
  { id:"pm3", type:"venmo", label:"@marcus-silva",             isDefault:false },
];
const INIT_SPLITS = [{ methodId:"pm1", pct:100 }];

const ROLES = {
  owner:      { label:"Gym Owner",       nav:["dashboard","students","attendance","calendar","curriculum","videos","documents","instructors","messaging","reports","billing","settings"] },
  instructor: { label:"Instructor",      nav:["dashboard","students","attendance","calendar","curriculum","videos","documents","instructors"] },
  student:    { label:"Student",         nav:["my-progress","attendance","calendar","curriculum","videos","documents","billing"] },
  parent:     { label:"Parent/Guardian", nav:["parent-portal","calendar","documents","billing"] },
};

const NAV_META = {
  dashboard:"Dashboard", students:"Students", attendance:"Attendance",
  calendar:"Calendar", curriculum:"Curriculum", videos:"Videos",
  documents:"Documents", instructors:"Instructors", messaging:"Messaging",
  reports:"Reports", billing:"Billing", settings:"Settings",
  "my-progress":"My Progress", "parent-portal":"My Children",
};

const GYM_LAT=37.7749, GYM_LNG=-122.4194, GYM_RADIUS_M=150;
function haversineMetres(la1,ln1,la2,ln2){
  const R=6371000,r=Math.PI/180,dLa=(la2-la1)*r,dLn=(ln2-ln1)*r;
  const a=Math.sin(dLa/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLn/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function BeltBadge({ belt, stripes=0 }) {
  const c=BELT_COLORS[belt]||BELT_COLORS.white;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:c.bg,color:c.text,
      border:belt==="white"?"1px solid #b0bfd0":"none",padding:"2px 8px",borderRadius:4,
      fontFamily:mono,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:2,flexShrink:0}}>
      {belt}{stripes>0&&<span style={{letterSpacing:0}}>{Array(stripes).fill("▪").join("")}</span>}
    </span>
  );
}

function ProgressRing({ pct, size=56, color=A }) {
  const r=(size-8)/2,circ=2*Math.PI*r,fill=Math.min(pct/100,1)*circ;
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
      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct>=100?SUCCESS:color,
        borderRadius:h/2,transition:"width .6s ease"}}/>
    </div>
  );
}

function Avatar({ name="?", size=40 }) {
  const initials=name.split(" ").map(w=>w[0]).slice(0,2).join("");
  const hue=(name.charCodeAt(0)*53+(name.charCodeAt(1)||0)*17)%360;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`hsl(${hue},55%,88%)`,color:`hsl(${hue},55%,28%)`,
      border:`2px solid hsl(${hue},40%,78%)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:cond,fontWeight:900,fontSize:size*.38}}>{initials}</div>
  );
}

function StatCard({ label, value, sub, accent=A }) {
  return (
    <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderTop:`3px solid ${accent}`,
      borderRadius:10,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
      <div style={{fontFamily:mono,fontSize:9,color:TEXT3,textTransform:"uppercase",letterSpacing:2,marginBottom:7}}>{label}</div>
      <div style={{fontFamily:cond,fontWeight:900,fontSize:32,color:TEXT1,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:6}}>{sub}</div>}
    </div>
  );
}

function Panel({ title, children, action, noPad }) {
  return (
    <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden",
      boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"13px 18px",borderBottom:`1px solid ${BORDER}`,background:SURFACE2}}>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:14,color:TEXT1,textTransform:"uppercase",letterSpacing:1.2}}>{title}</div>
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
      ...s[variant],padding:small?"5px 12px":"9px 18px",borderRadius:6,
      cursor:disabled?"not-allowed":"pointer",fontFamily:mono,
      fontSize:small?9:10,letterSpacing:1,textTransform:"uppercase",fontWeight:600,
      transition:"opacity .15s",flexShrink:0,opacity:disabled?.5:1
    }}>{children}</button>
  );
}

function Tag({ children, color=TEXT3 }) {
  return (
    <span style={{fontFamily:mono,fontSize:8,color,background:color+"18",
      border:`1px solid ${color}38`,borderRadius:4,padding:"2px 7px",
      letterSpacing:1,textTransform:"uppercase",flexShrink:0}}>{children}</span>
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
      style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,padding:"8px 12px",
        color:TEXT1,fontFamily:mono,fontSize:10,outline:"none",width:"100%",boxSizing:"border-box",...sx}}/>
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

function selStyle(){ return {background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,padding:"8px 10px",fontFamily:mono,fontSize:10,color:TEXT1,width:"100%"}; }

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, role, setRole, gymLogo }) {
const nav=ROLES[role].nav;
  const { signOut } = useClerk();
  return (
    <div style={{width:220,background:SIDEBAR,borderRight:`1px solid ${SIDEBAR2}`,
      display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0,position:"sticky",top:0,zIndex:10}}>
      <div style={{padding:"20px 18px 16px",borderBottom:`1px solid ${SIDEBAR2}`}}>
        {gymLogo
          ? <img src={gymLogo} alt="logo" style={{maxWidth:"100%",maxHeight:52,objectFit:"contain",marginBottom:6}}/>
          : <div style={{fontFamily:cond,fontWeight:900,fontSize:21,color:"#f0f6ff",letterSpacing:.4,lineHeight:1}}>
              <span style={{color:A}}>BJJ</span>Groundwork
            </div>
        }
        <div style={{fontFamily:mono,fontSize:8,color:"#3a5570",letterSpacing:2,marginTop:3}}>GYM MANAGEMENT</div>
      </div>
      <div style={{padding:"10px 10px 0"}}>
        <div style={{fontFamily:mono,fontSize:8,color:"#3a5570",letterSpacing:2,textTransform:"uppercase",marginBottom:4,paddingLeft:6}}>Viewing as</div>
        <select value={role} onChange={e=>setRole(e.target.value)} style={{width:"100%",background:SIDEBAR2,color:"#7a9abf",
          border:"1px solid #253545",borderRadius:6,fontFamily:mono,fontSize:9,padding:"7px 9px",outline:"none",cursor:"pointer"}}>
          {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <nav style={{padding:"10px 8px",flex:1,overflowY:"auto"}}>
        {nav.map(id=>{
          const on=active===id;
          return (
            <button key={id} onClick={()=>setActive(id)} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",
              borderRadius:6,border:"none",cursor:"pointer",marginBottom:1,transition:"all .12s",
              background:on?A:"transparent",color:on?"#fff":"#4a7090",
              fontFamily:mono,fontSize:9,letterSpacing:1,textTransform:"uppercase",fontWeight:on?700:400,
            }}>{NAV_META[id]}</button>
          );
        })}
      </nav>
      <div style={{padding:"12px 18px",borderTop:`1px solid ${SIDEBAR2}`}}>
        <div style={{fontFamily:mono,fontSize:8,color:"#2a4050",letterSpacing:1,marginBottom:2}}>GYM</div>
        <div style={{color:"#4a7090",fontSize:12,fontFamily:cond,fontWeight:700,marginBottom:10}}>Ribeiro BJJ Academy</div>
        <button onClick={()=>signOut()} style={{
          width:"100%",padding:"8px",borderRadius:6,border:"1px solid #253545",
          background:"transparent",color:"#4a7090",cursor:"pointer",
          fontFamily:mono,fontSize:9,letterSpacing:1,textTransform:"uppercase",
          transition:"all .15s"
        }}>Sign Out</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ students, calendarEvents }) {
  const eligible=students.filter(s=>s.attendance>=(s.nextEligible||50));
  const overdue=students.filter(s=>s.billing==="Overdue"||s.billing_status==="Overdue");
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Dashboard" sub="BJJGroundwork" badge="Sun Apr 19, 2026"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <StatCard label="Active Students" value={students.length}  sub="+2 this month"   accent={A}/>
        <StatCard label="Classes Today"   value={calendarEvents.filter(e=>e.day==="Mon").length} sub="today" accent="#7c3aed"/>
        <StatCard label="Promotion Ready" value={eligible.length}  sub="awaiting review" accent={SUCCESS}/>
        <StatCard label="Overdue Billing" value={overdue.length}   sub="action required" accent={DANGER}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:18,marginBottom:18}}>
        <Panel title="Today's Schedule">
          {calendarEvents.slice(0,5).map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div>
                <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:2}}>{c.day} · {c.time}</div>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{c.title}</div>
                <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{c.instructor||c.instructor_name||"—"}</div>
              </div>
              <Tag color={c.type==="private"?WARN:A}>{c.type||"class"}</Tag>
            </div>
          ))}
          {calendarEvents.length===0&&<div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>No classes scheduled.</div>}
        </Panel>
        <Panel title="Promotion Eligible">
          {eligible.length===0&&<div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>None currently eligible.</div>}
          {eligible.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
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
              <div style={{width:"100%",height:(d.pct/100)*64,background:`linear-gradient(0deg,${A},${A}88)`,borderRadius:"3px 3px 0 0"}}/>
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
  const [editStudent,setEditStudent]=useState(null);
  const canEdit=role==="owner"||role==="instructor";

  const filtered=students.filter(s=>
    (beltF==="all"||s.belt===beltF)&&s.name.toLowerCase().includes(search.toLowerCase()));

  const addStudent=async()=>{
    if(!newName.trim())return;
    const { data } = await supabase.from("users").insert({
      name:newName,belt:newBelt,stripes:0,attendance:0,age:parseInt(newAge)||18,
      billing_status:"Active",fee:parseInt(newFee)||120,discount:0,role:"student",gym_id:GYM_ID
    }).select().single();
    if(data) setStudents(p=>[...p,{...data,
      nextEligible:data.belt==="white"?50:data.belt==="blue"?92:data.belt==="purple"?200:400,
      parentId:data.parent_id,billing:data.billing_status
    }]);
    setNewName("");setNewAge("");setNewFee("120");setShowAdd(false);
  };

  const saveStudentEdit=async()=>{
    if(!editStudent)return;
    await supabase.from("users").update({
      belt:editStudent.belt,stripes:editStudent.stripes,attendance:editStudent.attendance,
      billing_status:editStudent.billing||editStudent.billing_status,
      fee:editStudent.fee,discount:editStudent.discount
    }).eq("id",editStudent.id);
    setStudents(p=>p.map(s=>s.id===editStudent.id?{
      ...s,...editStudent,
      billing:editStudent.billing||editStudent.billing_status,
      nextEligible:editStudent.belt==="white"?50:editStudent.belt==="blue"?92:editStudent.belt==="purple"?200:400
    }:s));
    setEditStudent(null);
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
            padding:"6px 12px",borderRadius:6,cursor:"pointer",fontFamily:mono,fontSize:9,
            textTransform:"uppercase",letterSpacing:1,border:`1px solid ${BORDER}`,transition:"all .12s",
            background:beltF===b?A:SURFACE,color:beltF===b?"#fff":TEXT2}}>{b}</button>
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
            <select value={newBelt} onChange={e=>setNewBelt(e.target.value)} style={selStyle()}>
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
          const ne=s.nextEligible||(s.belt==="white"?50:s.belt==="blue"?92:s.belt==="purple"?200:400);
          const pct=Math.min(Math.round((s.attendance/ne)*100),100);
          const billing=s.billing||s.billing_status||"Active";
          const effectiveFee=s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee;
          return (
            <div key={s.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,
              padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                <Avatar name={s.name} size={42}/>
                <div>
                  <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:4}}>{s.name}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <BeltBadge belt={s.belt} stripes={s.stripes}/>
                    {billing==="Overdue"&&<Tag color={DANGER}>Overdue</Tag>}
                    {billing==="Paused" &&<Tag color={WARN}>Paused</Tag>}
                    {s.discount>0&&<Tag color={SUCCESS}>{s.discount}% off</Tag>}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <ProgressRing pct={pct}/>
                <div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:2}}>PROMOTION</div>
                  <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:pct>=100?SUCCESS:A,lineHeight:1}}>{pct}%</div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{s.attendance}/{ne} classes</div>
                </div>
              </div>
              <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <Info label="Age"     value={s.age}/>
                  <Info label="Monthly" value={s.discount>0?`$${effectiveFee}`:`$${s.fee}`}/>
                  <Info label="Status"  value={billing}/>
                </div>
                {canEdit&&<Btn small variant="ghost" onClick={()=>setEditStudent({...s,billing:billing})}>Edit Student</Btn>}
              </div>
            </div>
          );
        })}
      </div>

      {editStudent&&(
        <Modal title={`Edit — ${editStudent.name}`} onClose={()=>setEditStudent(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[
              {label:"Belt",el:<select value={editStudent.belt} onChange={e=>setEditStudent(p=>({...p,belt:e.target.value}))} style={selStyle()}>
                {["white","blue","purple","brown","black"].map(b=><option key={b}>{b}</option>)}</select>},
              {label:"Stripes (0-4)",el:<input type="number" min={0} max={4} value={editStudent.stripes}
                onChange={e=>setEditStudent(p=>({...p,stripes:parseInt(e.target.value)||0}))} style={{...selStyle(),width:"100%"}}/>},
              {label:"Classes Attended",el:<input type="number" min={0} value={editStudent.attendance}
                onChange={e=>setEditStudent(p=>({...p,attendance:parseInt(e.target.value)||0}))} style={{...selStyle(),width:"100%"}}/>},
              {label:"Billing Status",el:<select value={editStudent.billing}
                onChange={e=>setEditStudent(p=>({...p,billing:e.target.value,billing_status:e.target.value}))} style={selStyle()}>
                {["Active","Paused","Overdue"].map(s=><option key={s}>{s}</option>)}</select>},
              {label:"Monthly Fee ($)",el:<input type="number" value={editStudent.fee}
                onChange={e=>setEditStudent(p=>({...p,fee:parseInt(e.target.value)||0}))} style={{...selStyle(),width:"100%"}}/>},
              {label:"Discount (%)",el:<input type="number" min={0} max={100} value={editStudent.discount}
                onChange={e=>setEditStudent(p=>({...p,discount:parseInt(e.target.value)||0}))} style={{...selStyle(),width:"100%"}}/>},
            ].map(({label,el})=>(
              <div key={label}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4,textTransform:"uppercase"}}>{label}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="neutral" onClick={()=>setEditStudent(null)}>Cancel</Btn>
            <Btn onClick={saveStudentEdit}>Save Changes</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEO-LOCKED STUDENT KIOSK
// ─────────────────────────────────────────────────────────────────────────────
function StudentKiosk({ students, calendarEvents }) {
  const [geoState,setGeoState]=useState("idle");
  const [geoMsg,setGeoMsg]=useState("");
  const [distM,setDistM]=useState(null);
  const [sel,setSel]=useState(null);
  const [checkedIn,setCheckedIn]=useState(false);
  const me=students[0];
  const classes=calendarEvents.filter(e=>e.type==="class"||!e.type);

  const requestGeo=()=>{
    if(!navigator.geolocation){setGeoState("error");setGeoMsg("Geolocation not supported.");return;}
    setGeoState("checking");
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const d=haversineMetres(pos.coords.latitude,pos.coords.longitude,GYM_LAT,GYM_LNG);
        setDistM(Math.round(d));
        if(d<=GYM_RADIUS_M)setGeoState("allowed");
        else{setGeoState("denied");setGeoMsg(`You are ${Math.round(d)} m from the gym. Check-in requires on-site presence.`);}
      },
      err=>{
        setGeoState("error");
        setGeoMsg({1:"Location permission denied.",2:"Location unavailable.",3:"Request timed out."}[err.code]||"Unknown error.");
      },
      {enableHighAccuracy:true,timeout:10000,maximumAge:0}
    );
  };

  const doCheckIn=async()=>{
    if(!sel||!me)return;
    await supabase.from("attendance").insert({gym_id:GYM_ID,class_id:sel.id,student_id:me.id,verified_on_site:true});
    setCheckedIn(true);
  };

  if(!me) return <div style={{padding:40,fontFamily:mono,color:TEXT3}}>No student data found.</div>;

  if(geoState==="idle") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",textAlign:"center",paddingTop:40}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:AG,border:`2px solid ${AB}`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 24px"}}>📍</div>
        <div style={{fontFamily:cond,fontWeight:900,fontSize:26,color:TEXT1,marginBottom:10}}>Location Verification Required</div>
        <div style={{fontFamily:mono,fontSize:10,color:TEXT2,lineHeight:1.8,marginBottom:28}}>
          BJJGroundwork verifies you are physically at the gym before recording attendance. Your location is never stored.
        </div>
        <Btn onClick={requestGeo}>Verify My Location</Btn>
      </div>
    </div>
  );

  if(geoState==="checking") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"60px auto",textAlign:"center"}}>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:22,color:TEXT1,marginBottom:10}}>Locating you…</div>
        <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:20}}>
          {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:A,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
        </div>
      </div>
    </div>
  );

  if(geoState==="denied"||geoState==="error") return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",paddingTop:32}}>
        <div style={{background:DANGER+"0d",border:`1px solid ${DANGER}33`,borderRadius:12,padding:28,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:16}}>🚫</div>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:DANGER,marginBottom:10}}>{geoState==="denied"?"Not at Gym Location":"Location Error"}</div>
          <div style={{fontFamily:mono,fontSize:10,color:TEXT2,lineHeight:1.8,marginBottom:20}}>{geoMsg}</div>
          {distM&&geoState==="denied"&&(
            <div style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 16px",
              marginBottom:20,display:"inline-flex",gap:16,alignItems:"center"}}>
              <div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>YOUR DISTANCE</div><div style={{fontFamily:cond,fontWeight:900,fontSize:24,color:DANGER}}>{distM} m</div></div>
              <div style={{width:1,height:36,background:BORDER}}/>
              <div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>ALLOWED</div><div style={{fontFamily:cond,fontWeight:900,fontSize:24,color:SUCCESS}}>{GYM_RADIUS_M} m</div></div>
            </div>
          )}
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn onClick={()=>{setGeoState("idle");setDistM(null);}}>Try Again</Btn>
            <Btn variant="neutral" onClick={()=>setGeoState("idle")}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  if(checkedIn) return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{maxWidth:480,margin:"0 auto",paddingTop:32,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:SUCCESS+"18",border:`2px solid ${SUCCESS}55`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px"}}>✓</div>
        <div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:SUCCESS,marginBottom:8}}>Checked In!</div>
        <div style={{fontFamily:mono,fontSize:10,color:TEXT2,marginBottom:6}}><strong>{me.name}</strong> — {sel?.title}</div>
        <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:28}}>Verified on-site · {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
        <Btn variant="ghost" onClick={()=>{setCheckedIn(false);setSel(null);setGeoState("idle");}}>Done</Btn>
      </div>
    </div>
  );

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Check In" sub="On-site Kiosk"/>
      <div style={{background:SUCCESS+"0d",border:`1px solid ${SUCCESS}44`,borderRadius:8,
        padding:"10px 16px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:SUCCESS,display:"flex",
          alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,flexShrink:0}}>✓</div>
        <div style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>Location verified — within {GYM_RADIUS_M} m of the gym</div>
      </div>
      <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:12,padding:"18px 20px",
        marginBottom:22,display:"flex",alignItems:"center",gap:16}}>
        <Avatar name={me.name} size={52}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:TEXT1,marginBottom:5}}>{me.name}</div>
          <BeltBadge belt={me.belt} stripes={me.stripes}/>
        </div>
        <Tag color={SUCCESS}>On-site ✓</Tag>
      </div>
      <Panel title="Select Your Class">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
          {classes.map(c=>(
            <button key={c.id} onClick={()=>setSel(c)} style={{textAlign:"left",padding:"14px 16px",borderRadius:8,cursor:"pointer",
              border:`2px solid ${sel?.id===c.id?A:BORDER}`,background:sel?.id===c.id?AG:SURFACE,transition:"all .15s"}}>
              <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:3}}>{c.day} · {c.time}</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{c.title}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{c.instructor_name||c.instructor||"—"}</div>
              {sel?.id===c.id&&<div style={{marginTop:6}}><Tag color={A}>Selected</Tag></div>}
            </button>
          ))}
        </div>
        <div style={{marginTop:18,display:"flex",alignItems:"center",gap:14,borderTop:`1px solid ${BORDER}`,paddingTop:16}}>
          <Btn onClick={doCheckIn} disabled={!sel}>Check In Now</Btn>
          {!sel&&<span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Select a class above</span>}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE (staff view)
// ─────────────────────────────────────────────────────────────────────────────
function Attendance({ students, role, calendarEvents }) {
  const classes=calendarEvents.filter(e=>e.type==="class"||!e.type);
  const [sel,setSel]=useState(classes[0]||null);
  const [checked,setChecked]=useState({});
  const [saved,setSaved]=useState(false);
  const toggle=id=>setChecked(p=>({...p,[id]:!p[id]}));
  const count=Object.values(checked).filter(Boolean).length;

  if(role==="student") return <StudentKiosk students={students} calendarEvents={calendarEvents}/>;

  const save=async()=>{
    const ids=Object.entries(checked).filter(([,v])=>v).map(([k])=>k);
    await Promise.all(ids.map(sid=>supabase.from("attendance").insert({
      gym_id:GYM_ID,class_id:sel?.id,student_id:sid,verified_on_site:false
    })));
    setSaved(true);setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Attendance" sub="Roster Check-in" badge={`${count} checked in`}/>
      <div style={{display:"grid",gridTemplateColumns:"230px 1fr",gap:18}}>
        <Panel title="Classes" noPad>
          {classes.map(c=>(
            <button key={c.id} onClick={()=>{setSel(c);setChecked({});setSaved(false);}} style={{
              display:"block",width:"100%",textAlign:"left",padding:"11px 16px",border:"none",
              cursor:"pointer",transition:"all .12s",
              background:sel?.id===c.id?AG:SURFACE,borderLeft:`3px solid ${sel?.id===c.id?A:"transparent"}`}}>
              <div style={{fontFamily:mono,fontSize:9,color:A,marginBottom:2}}>{c.day} · {c.time}</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{c.title}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{c.instructor_name||c.instructor||"—"}</div>
            </button>
          ))}
          {classes.length===0&&<div style={{padding:16,fontFamily:mono,fontSize:10,color:TEXT3}}>No classes found.</div>}
        </Panel>
        <Panel title={sel?`${sel.title} — ${sel.day} ${sel.time}`:"Select a class"} action={`${count}/${students.length} present`}>
          <div style={{display:"flex",gap:9,marginBottom:13}}>
            <Btn small variant="ghost" onClick={()=>{const a={};students.forEach(s=>a[s.id]=true);setChecked(a);}}>Select All</Btn>
            <Btn small variant="ghost" onClick={()=>setChecked({})}>Clear</Btn>
          </div>
          {students.map(s=>(
            <div key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"center",gap:12,
              padding:"10px 12px",borderRadius:8,cursor:"pointer",marginBottom:4,
              background:checked[s.id]?`${SUCCESS}0d`:SURFACE2,
              border:`1px solid ${checked[s.id]?SUCCESS+"66":BORDER}`,transition:"all .2s"}}>
              <div style={{width:22,height:22,borderRadius:4,flexShrink:0,
                background:checked[s.id]?SUCCESS:BORDER,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900}}>
                {checked[s.id]?"✓":""}
              </div>
              <Avatar name={s.name} size={32}/>
              <div style={{flex:1,fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{s.name}</div>
              <BeltBadge belt={s.belt} stripes={s.stripes}/>
            </div>
          ))}
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:12}}>
            <Btn onClick={save} disabled={!sel}>Save Attendance</Btn>
            {saved&&<span style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>✓ Saved</span>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
function Calendar({ role, calendarEvents, setCalendarEvents }) {
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",day:"Mon",time:"",type:"class",instructor:"",capacity:"10"});
  const canEdit=role==="owner"||role==="instructor";

  const addEvent=async()=>{
    if(!form.title||!form.time)return;
    const { data } = await supabase.from("classes").insert({
      title:form.title,day:form.day,time:form.time,type:form.type,
      instructor_name:form.instructor,capacity:parseInt(form.capacity)||10,gym_id:GYM_ID
    }).select().single();
    if(data) setCalendarEvents(p=>[...p,{...data,instructor:data.instructor_name}]);
    setForm({title:"",day:"Mon",time:"",type:"class",instructor:"",capacity:"10"});
    setShowForm(false);
  };

  const typeColor={class:A,private:WARN};

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
              {label:"Title",     el:<Input value={form.title}      onChange={v=>setForm(p=>({...p,title:v}))}      placeholder="Class name"/>},
              {label:"Day",       el:<select value={form.day}       onChange={e=>setForm(p=>({...p,day:e.target.value}))} style={selStyle()}>{DAYS.map(d=><option key={d}>{d}</option>)}</select>},
              {label:"Time",      el:<Input value={form.time}       onChange={v=>setForm(p=>({...p,time:v}))}       placeholder="18:00"/>},
              {label:"Type",      el:<select value={form.type}      onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={selStyle()}><option value="class">Class</option><option value="private">Private</option></select>},
              {label:"Instructor",el:<Input value={form.instructor} onChange={v=>setForm(p=>({...p,instructor:v}))} placeholder="Instructor"/>},
              {label:"Capacity",  el:<Input value={form.capacity}   onChange={v=>setForm(p=>({...p,capacity:v}))}  placeholder="10" type="number"/>},
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
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10}}>
        {DAYS.map(day=>{
          const dayEvts=calendarEvents.filter(e=>e.day===day);
          return (
            <div key={day} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{background:A,padding:"8px 0",textAlign:"center",fontFamily:cond,fontWeight:900,fontSize:15,color:"#fff"}}>{day}</div>
              <div style={{padding:8}}>
                {dayEvts.length===0&&<div style={{fontFamily:mono,fontSize:8,color:TEXT3,padding:"8px 4px"}}>No classes</div>}
                {dayEvts.map(e=>(
                  <div key={e.id} style={{background:e.type==="private"?WARN+"18":AG,
                    border:`1px solid ${(typeColor[e.type]||A)}44`,borderLeft:`3px solid ${typeColor[e.type]||A}`,
                    borderRadius:5,padding:"6px 8px",marginBottom:5}}>
                    <div style={{fontFamily:mono,fontSize:8,color:typeColor[e.type]||A}}>{e.time}</div>
                    <div style={{fontFamily:cond,fontWeight:700,fontSize:12,color:TEXT1}}>{e.title}</div>
                    <div style={{fontFamily:mono,fontSize:7,color:TEXT3}}>{e.instructor_name||e.instructor||"—"}</div>
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

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM
// ─────────────────────────────────────────────────────────────────────────────
function Curriculum({ curriculum, setCurriculum, role }) {
  const [belt,setBelt]=useState("white");
  const [tab,setTab]=useState("techniques");
  const [taught,setTaught]=useState({});
  const [editing,setEditing]=useState(false);
  const [newTech,setNewTech]=useState("");
  const canEdit=role==="owner"||role==="instructor";

  const toggleTaught=k=>setTaught(p=>({...p,[k]:!p[k]}));

  const addTech=async()=>{
    if(!newTech.trim())return;
    const { data } = await supabase.from("techniques").insert({
      belt,title:newTech.trim(),gym_id:GYM_ID,sort_order:curriculum[belt].length+1
    }).select().single();
    if(data) setCurriculum(p=>({...p,[belt]:[...p[belt],data.title]}));
    setNewTech("");
  };

  const removeTech=async(b,i)=>{
    const title=curriculum[b][i];
    await supabase.from("techniques").delete().eq("gym_id",GYM_ID).eq("belt",b).eq("title",title);
    setCurriculum(p=>({...p,[b]:p[b].filter((_,idx)=>idx!==i)}));
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Curriculum" sub="Technique Library & LMS">
        {canEdit&&<Btn variant={editing?"success":"ghost"} small onClick={()=>setEditing(p=>!p)}>{editing?"Done Editing":"Edit"}</Btn>}
      </PageHeader>
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${BORDER}`}}>
        {[["techniques","Techniques"],["lms","Instructor Certification"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 20px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,
            background:"transparent",borderBottom:`3px solid ${tab===t?A:"transparent"}`,color:tab===t?A:TEXT2,marginBottom:-1}}>{l}</button>
        ))}
      </div>

      {tab==="techniques"&&(
        <>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {Object.keys(curriculum).map(b=>{
              const c=BELT_COLORS[b],on=belt===b;
              return (
                <button key={b} onClick={()=>setBelt(b)} style={{padding:"8px 18px",borderRadius:7,cursor:"pointer",
                  fontFamily:mono,fontSize:9,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,transition:"all .15s",
                  background:on?c.bg:SURFACE,color:on?c.text:TEXT2,
                  border:on?(b==="white"?"1px solid #b0bfd0":`1px solid ${c.bg}`):`1px solid ${BORDER}`,
                  boxShadow:on?`0 0 0 2px ${A}`:"none"}}>{b} belt</button>
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
                <div key={k} style={{background:done?SUCCESS+"0d":SURFACE,border:`1px solid ${done?SUCCESS+"55":BORDER}`,
                  borderRadius:8,padding:"13px 16px",display:"flex",alignItems:"center",gap:13,transition:"all .2s"}}>
                  <div style={{width:34,height:34,borderRadius:6,flexShrink:0,
                    background:done?SUCCESS:BELT_COLORS[belt].bg,color:done?"#fff":BELT_COLORS[belt].text,
                    border:belt==="white"&&!done?"1px solid #b0bfd0":"none",
                    display:"flex",alignItems:"center",justifyContent:"center",fontFamily:cond,fontWeight:900,fontSize:16}}>
                    {done?"✓":i+1}
                  </div>
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
              <div style={{width:34,height:34,borderRadius:6,flexShrink:0,
                background:c.done?SUCCESS+"18":SURFACE2,border:`1px solid ${c.done?SUCCESS+"55":BORDER}`,
                color:c.done?SUCCESS:TEXT3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
                {c.done?"✓":"○"}
              </div>
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
// VIDEOS
// ─────────────────────────────────────────────────────────────────────────────
function Videos({ role, videos, setVideos }) {
  const [beltF,setBeltF]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",belt:"white",duration:"00:00"});
  const [uploading,setUploading]=useState(false);
  const [selectedFile,setSelectedFile]=useState(null);
  const fileRef=useRef();
  const canEdit=role==="owner";
  const filtered=videos.filter(v=>beltF==="all"||v.belt===beltF);

  const handleFileSelect=e=>{
    const file=e.target.files[0];
    if(!file)return;
    setSelectedFile(file);
    setForm(p=>({...p,title:file.name.replace(/\.[^/.]+$/,"")}));
  };

  const addVideo=async()=>{
    if(!form.title.trim())return;
    setUploading(true);
    let storagePath=null;
    if(selectedFile){
      const fileName=`${Date.now()}-${selectedFile.name}`;
      const { data:up, error:ue } = await supabase.storage.from("videos").upload(fileName,selectedFile,{cacheControl:"3600",upsert:false});
      if(ue){alert("Upload failed: "+ue.message);setUploading(false);return;}
      storagePath=up.path;
    }
    const { data } = await supabase.from("videos").insert({
      title:form.title,belt:form.belt,duration:form.duration,storage_path:storagePath,gym_id:GYM_ID
    }).select().single();
    if(data) setVideos(p=>[...p,{...data,date:new Date(data.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}]);
    setForm({title:"",belt:"white",duration:"00:00"});setSelectedFile(null);setUploading(false);setShowAdd(false);
  };

  const getUrl=path=>{
    if(!path)return null;
    const { data }=supabase.storage.from("videos").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Videos" sub="Remote Learning Library">
        {canEdit&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ Add Video</Btn>}
      </PageHeader>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {["all","white","blue","purple","brown"].map(b=>(
          <button key={b} onClick={()=>setBeltF(b)} style={{padding:"6px 12px",borderRadius:6,cursor:"pointer",
            fontFamily:mono,fontSize:9,textTransform:"uppercase",letterSpacing:1,border:`1px solid ${BORDER}`,
            background:beltF===b?A:SURFACE,color:beltF===b?"#fff":TEXT2}}>{b==="all"?"All Belts":b}</button>
        ))}
      </div>

      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"18px 20px",marginBottom:20}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>Add Video</div>
          <div style={{border:`2px dashed ${selectedFile?A:BORDER}`,borderRadius:8,padding:"28px",textAlign:"center",
            marginBottom:14,background:SURFACE2,cursor:"pointer"}} onClick={()=>fileRef.current.click()}>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleFileSelect} style={{display:"none"}}/>
            <div style={{fontSize:28,marginBottom:8}}>{selectedFile?"🎬":"📁"}</div>
            {selectedFile
              ? <div style={{fontFamily:cond,fontWeight:700,fontSize:16,color:A}}>{selectedFile.name}</div>
              : <>
                  <div style={{fontFamily:cond,fontWeight:700,fontSize:16,color:TEXT2,marginBottom:4}}>Click to browse or drop video file</div>
                  <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>MP4, MOV, AVI up to 2GB</div>
                </>
            }
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,alignItems:"end",marginBottom:14}}>
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
          {uploading&&<div style={{background:AG,border:`1px solid ${AB}`,borderRadius:6,padding:"10px 14px",marginBottom:12,fontFamily:mono,fontSize:10,color:A}}>Uploading video… please wait</div>}
          <div style={{display:"flex",gap:10}}>
            <Btn small onClick={addVideo} disabled={uploading}>{uploading?"Uploading…":"Save Video"}</Btn>
            <Btn small variant="neutral" onClick={()=>{setShowAdd(false);setSelectedFile(null);}}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {filtered.map(v=>{
          const url=getUrl(v.storage_path);
          return (
            <div key={v.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{height:140,background:`linear-gradient(135deg,${BELT_COLORS[v.belt]?.bg||"#e8edf5"}33,${A}22)`,
                display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                <div style={{fontSize:40,opacity:.4}}>▶</div>
                <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.55)",color:"#fff",fontFamily:mono,fontSize:9,padding:"3px 8px",borderRadius:4}}>{v.duration}</div>
                <div style={{position:"absolute",top:8,left:8}}><BeltBadge belt={v.belt} stripes={0}/></div>
              </div>
              <div style={{padding:"13px 14px"}}>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1,marginBottom:5}}>{v.title}</div>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{v.date}</div>
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  {url
                    ? <a href={url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Btn small>▶ Watch</Btn></a>
                    : <Btn small disabled>No file</Btn>
                  }
                  {canEdit&&<Btn small variant="danger" onClick={async()=>{
                    if(v.storage_path)await supabase.storage.from("videos").remove([v.storage_path]);
                    await supabase.from("videos").delete().eq("id",v.id);
                    setVideos(p=>p.filter(x=>x.id!==v.id));
                  }}>Remove</Btn>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
function Documents({ role, documents, setDocuments }) {
  const [viewing,setViewing]=useState(null);
  const [editing,setEditing]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",category:"Policy",content:""});
  const isOwner=role==="owner";

  const saveEdit=async()=>{
    await supabase.from("documents").update({title:editing.title,content:editing.content}).eq("id",editing.id);
    setDocuments(p=>p.map(d=>d.id===editing.id?{...editing}:d));
    setEditing(null);
  };

  const addDoc=async()=>{
    if(!form.title.trim())return;
    const { data } = await supabase.from("documents").insert({
      title:form.title,category:form.category,content:form.content,gym_id:GYM_ID
    }).select().single();
    if(data) setDocuments(p=>[...p,{...data,date:new Date(data.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}]);
    setForm({title:"",category:"Policy",content:""});setShowAdd(false);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Documents" sub="Gym Library">
        {isOwner&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ New Document</Btn>}
      </PageHeader>
      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"18px 20px",marginBottom:20}}>
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
          <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Document body…" rows={4}
            style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"9px 12px",color:TEXT1,fontFamily:mono,fontSize:10,resize:"vertical",outline:"none"}}/>
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <Btn small onClick={addDoc}>Save</Btn>
            <Btn small variant="neutral" onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {documents.map(d=>(
          <div key={d.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"18px 18px"}}>
            <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:5}}>{d.title}</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <Tag color={A}>{d.category}</Tag>
              <span style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{d.date}</span>
            </div>
            <div style={{fontFamily:mono,fontSize:9,color:TEXT2,lineHeight:1.6,marginBottom:12,
              overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{d.content}</div>
            <div style={{display:"flex",gap:8}}>
              <Btn small variant="ghost" onClick={()=>setViewing(d)}>View</Btn>
              {isOwner&&<Btn small variant="neutral" onClick={()=>setEditing({...d})}>Edit</Btn>}
              {isOwner&&<Btn small variant="danger" onClick={async()=>{
                await supabase.from("documents").delete().eq("id",d.id);
                setDocuments(p=>p.filter(x=>x.id!==d.id));
              }}>Delete</Btn>}
            </div>
          </div>
        ))}
      </div>
      {viewing&&(
        <Modal title={viewing.title} onClose={()=>setViewing(null)}>
          <Tag color={A}>{viewing.category}</Tag>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,margin:"8px 0 16px"}}>{viewing.date}</div>
          <div style={{fontFamily:mono,fontSize:11,color:TEXT2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{viewing.content}</div>
        </Modal>
      )}
      {editing&&(
        <Modal title="Edit Document" onClose={()=>setEditing(null)}>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>TITLE</div>
            <Input value={editing.title} onChange={v=>setEditing(p=>({...p,title:v}))} placeholder="Title"/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>CONTENT</div>
            <textarea value={editing.content} onChange={e=>setEditing(p=>({...p,content:e.target.value}))} rows={6}
              style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"9px 12px",color:TEXT1,fontFamily:mono,fontSize:10,resize:"vertical",outline:"none"}}/>
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
// INSTRUCTORS
// ─────────────────────────────────────────────────────────────────────────────
function Instructors({ instructors, setInstructors, role }) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",belt:"purple",email:"",cert:"Level 1"});
  const [editIns,setEditIns]=useState(null);
  const isOwner=role==="owner";

  const addInstructor=async()=>{
    if(!form.name.trim())return;
    const { data } = await supabase.from("users").insert({
      name:form.name,belt:form.belt,email:form.email,role:"instructor",gym_id:GYM_ID
    }).select().single();
    if(data) setInstructors(p=>[...p,{...data,progress:0,classes:0,cert:form.cert}]);
    setForm({name:"",belt:"purple",email:"",cert:"Level 1"});setShowAdd(false);
  };

  const saveInsEdit=async()=>{
    if(!editIns)return;
    await supabase.from("users").update({
      name:editIns.name,email:editIns.email,belt:editIns.belt,
      attendance:editIns.classes
    }).eq("id",editIns.id);
    setInstructors(p=>p.map(i=>i.id===editIns.id?{...i,...editIns}:i));
    setEditIns(null);
  };

  const remove=async id=>{
    await supabase.from("users").delete().eq("id",id);
    setInstructors(p=>p.filter(i=>i.id!==id));
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Instructors" sub="Staff & LMS">
        {isOwner&&<Btn onClick={()=>setShowAdd(p=>!p)}>+ Add Instructor</Btn>}
      </PageHeader>
      {showAdd&&(
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"18px 20px",marginBottom:20}}>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:14,textTransform:"uppercase"}}>New Instructor</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 2fr 1fr",gap:10,alignItems:"end"}}>
            {[
              {label:"Full Name", el:<Input value={form.name}  onChange={v=>setForm(p=>({...p,name:v}))}  placeholder="Name"/>},
              {label:"Belt",      el:<select value={form.belt} onChange={e=>setForm(p=>({...p,belt:e.target.value}))} style={selStyle()}>{["blue","purple","brown","black"].map(b=><option key={b}>{b}</option>)}</select>},
              {label:"Email",     el:<Input value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} placeholder="email@gym.com"/>},
              {label:"Cert",      el:<select value={form.cert} onChange={e=>setForm(p=>({...p,cert:e.target.value}))} style={selStyle()}>{["Level 1","Level 2","Level 3"].map(l=><option key={l}>{l}</option>)}</select>},
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
          <div key={ins.id} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:20}}>
            <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:14}}>
              <Avatar name={ins.name} size={46}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:4}}>{ins.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <BeltBadge belt={ins.belt} stripes={0}/>
                  <Tag color={A}>{ins.cert||"Level 1"}</Tag>
                </div>
                {ins.email&&<div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:4}}>{ins.email}</div>}
              </div>
            </div>
            <div style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1}}>LMS COMPLETION</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:16,color:ins.progress>=100?SUCCESS:A}}>{ins.progress||0}%</div>
              </div>
              <ProgressBar pct={ins.progress||0}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${BORDER}`,paddingTop:11,alignItems:"center"}}>
              <Info label="Classes" value={ins.classes||0}/>
              <Info label="Status"  value={(ins.progress||0)>=100?"Certified":"In Progress"}/>
              <div style={{display:"flex",gap:6}}>
                {isOwner&&<Btn small variant="ghost" onClick={()=>setEditIns({...ins})}>Edit</Btn>}
                {isOwner&&<Btn small variant="danger" onClick={()=>remove(ins.id)}>Remove</Btn>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Panel title="Certification Course Catalog">
        {LMS_COURSES.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
            <div style={{width:32,height:32,borderRadius:6,flexShrink:0,
              background:c.done?SUCCESS+"14":SURFACE2,border:`1px solid ${c.done?SUCCESS+"55":BORDER}`,
              color:c.done?SUCCESS:TEXT3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
              {c.done?"✓":"○"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1,marginBottom:2}}>{c.title}</div>
              {!c.done&&c.progress>0&&<div style={{width:160,marginTop:4}}><ProgressBar pct={c.progress} h={3}/></div>}
            </div>
            <Tag color={A}>{c.level}</Tag>
            {c.done?<Tag color={SUCCESS}>Complete</Tag>:<Btn small variant="ghost">Enroll</Btn>}
          </div>
        ))}
      </Panel>

      {editIns&&(
        <Modal title={`Edit — ${editIns.name}`} onClose={()=>setEditIns(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[
              {label:"Name",          el:<Input value={editIns.name}    onChange={v=>setEditIns(p=>({...p,name:v}))}    placeholder="Full name"/>},
              {label:"Email",         el:<Input value={editIns.email||""} onChange={v=>setEditIns(p=>({...p,email:v}))} placeholder="email@gym.com"/>},
              {label:"Belt",          el:<select value={editIns.belt}   onChange={e=>setEditIns(p=>({...p,belt:e.target.value}))} style={selStyle()}>{["blue","purple","brown","black"].map(b=><option key={b}>{b}</option>)}</select>},
              {label:"Cert Level",    el:<select value={editIns.cert||"Level 1"} onChange={e=>setEditIns(p=>({...p,cert:e.target.value}))} style={selStyle()}>{["Level 1","Level 2","Level 3"].map(l=><option key={l}>{l}</option>)}</select>},
              {label:"LMS Progress %",el:<input type="number" min={0} max={100} value={editIns.progress||0} onChange={e=>setEditIns(p=>({...p,progress:parseInt(e.target.value)||0}))} style={{...selStyle(),width:"100%"}}/>},
              {label:"Classes Taught",el:<input type="number" min={0} value={editIns.classes||0}            onChange={e=>setEditIns(p=>({...p,classes:parseInt(e.target.value)||0}))}  style={{...selStyle(),width:"100%"}}/>},
            ].map(({label,el})=>(
              <div key={label}>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4,textTransform:"uppercase"}}>{label}</div>
                {el}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="neutral" onClick={()=>setEditIns(null)}>Cancel</Btn>
            <Btn onClick={saveInsEdit}>Save Changes</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING
// ─────────────────────────────────────────────────────────────────────────────
function Messaging({ students }) {
  const [tab,setTab]=useState("blast");
  const [blastMsg,setBlastMsg]=useState("");
  const [blastSent,setBlastSent]=useState(false);
  const [selStu,setSelStu]=useState(students[0]?.id||null);
  const [directMsg,setDirectMsg]=useState("");
  const [messages,setMessages]=useState([
    {studentId:students[0]?.id,from:"owner",text:"Your dues are coming up next week.",time:"Apr 14"},
    {studentId:students[0]?.id,from:"student",text:"Thanks, I'll sort it out!",time:"Apr 14"},
  ]);

  const sendBlast=()=>{if(!blastMsg.trim())return;setBlastSent(true);setBlastMsg("");setTimeout(()=>setBlastSent(false),3000);};
  const sendDirect=()=>{if(!directMsg.trim())return;setMessages(p=>[...p,{studentId:selStu,from:"owner",text:directMsg,time:"Now"}]);setDirectMsg("");};
  const conv=messages.filter(m=>m.studentId===selStu);
  const selS=students.find(s=>s.id===selStu);

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Messaging" sub="SMS & Direct Messages"/>
      <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:`1px solid ${BORDER}`}}>
        {[["blast","Broadcast to All"],["direct","Individual Message"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,background:"transparent",
            borderBottom:`3px solid ${tab===t?A:"transparent"}`,color:tab===t?A:TEXT2,marginBottom:-1}}>{l}</button>
        ))}
      </div>
      {tab==="blast"&&(
        <div style={{maxWidth:600}}>
          <Panel title="Send SMS to All Students">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>Message will be sent to all {students.length} students.</div>
            <textarea value={blastMsg} onChange={e=>setBlastMsg(e.target.value)} placeholder="Type your message…" maxLength={320} rows={4}
              style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"10px 12px",
                color:TEXT1,fontFamily:mono,fontSize:10,resize:"none",outline:"none",marginBottom:10}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{blastMsg.length}/320</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {blastSent&&<span style={{fontFamily:mono,fontSize:10,color:SUCCESS}}>✓ Sent!</span>}
                <Btn onClick={sendBlast} disabled={!blastMsg.trim()}>Send to All</Btn>
              </div>
            </div>
          </Panel>
        </div>
      )}
      {tab==="direct"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:18,height:500}}>
          <Panel title="Students" noPad>
            <div style={{overflowY:"auto",maxHeight:440}}>
              {students.map(s=>(
                <button key={s.id} onClick={()=>setSelStu(s.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",
                  padding:"11px 14px",border:"none",cursor:"pointer",
                  background:selStu===s.id?AG:SURFACE,textAlign:"left",borderLeft:`3px solid ${selStu===s.id?A:"transparent"}`}}>
                  <Avatar name={s.name} size={32}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:cond,fontWeight:700,fontSize:13,color:TEXT1}}>{s.name}</div>
                    <div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>{messages.filter(m=>m.studentId===s.id).length} messages</div>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title={selS?selS.name:"Select a student"}>
            <div style={{display:"flex",flexDirection:"column",height:360}}>
              <div style={{flex:1,overflowY:"auto",marginBottom:12}}>
                {conv.length===0&&<div style={{fontFamily:mono,fontSize:10,color:TEXT3}}>No messages yet.</div>}
                {conv.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.from==="owner"?"flex-end":"flex-start",marginBottom:8}}>
                    <div style={{maxWidth:"75%",padding:"8px 13px",borderRadius:10,
                      background:m.from==="owner"?A:SURFACE2,color:m.from==="owner"?"#fff":TEXT1,
                      border:m.from==="owner"?"none":`1px solid ${BORDER}`,fontFamily:mono,fontSize:10}}>
                      <div>{m.text}</div>
                      <div style={{fontSize:8,opacity:.6,marginTop:3}}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <input value={directMsg} onChange={e=>setDirectMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDirect()}
                  placeholder="Type a message…"
                  style={{flex:1,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"9px 13px",color:TEXT1,fontFamily:mono,fontSize:10,outline:"none"}}/>
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
  const mrr=students.filter(s=>(s.billing||s.billing_status)==="Active").reduce((a,s)=>{
    const ef=s.discount>0?s.fee*(1-s.discount/100):s.fee;return a+ef;},0);
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
                <div style={{width:"100%",height:(d.pct/100)*72,background:`linear-gradient(0deg,${A},${A}88)`,borderRadius:"3px 3px 0 0"}}/>
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
            <div key={h} style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${BORDER}`}}>{h}</div>
          ))}
          {students.map(s=>{
            const net=s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee;
            const billing=s.billing||s.billing_status||"Active";
            return [
              <div key={`n${s.id}`} style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT2,padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>{s.name}</div>,
              <div key={`b${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}><BeltBadge belt={s.belt} stripes={s.stripes}/></div>,
              <div key={`f${s.id}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>${s.fee}</div>,
              <div key={`d${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}>{s.discount>0?<Tag color={SUCCESS}>{s.discount}%</Tag>:<span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>—</span>}</div>,
              <div key={`st${s.id}`} style={{padding:"8px 0",borderBottom:`1px solid ${SURFACE2}`}}><span style={{fontFamily:cond,fontWeight:700,fontSize:15,color:billing==="Active"?SUCCESS:DANGER}}>${net}</span></div>,
            ];
          })}
        </div>
      </Panel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING
// ─────────────────────────────────────────────────────────────────────────────
function SplitPaymentEditor({ methods, splits, setSplits, totalAmount }) {
  const addSplit=()=>{
    const usedIds=splits.map(s=>s.methodId);
    const next=methods.find(m=>!usedIds.includes(m.id));
    if(!next)return;
    const ns=[...splits,{methodId:next.id,pct:0}];
    const even=Math.floor(100/ns.length),rem=100-even*(ns.length-1);
    setSplits(ns.map((s,i)=>({...s,pct:i===ns.length-1?rem:even})));
  };
  const removeSplit=mid=>{
    if(splits.length===1)return;
    const rem=splits.filter(s=>s.methodId!==mid);
    const diff=100-rem.reduce((a,s)=>a+s.pct,0);
    setSplits(rem.map((s,i)=>i===0?{...s,pct:s.pct+diff}:s));
  };
  const updatePct=(mid,raw)=>{
    const val=Math.min(100,Math.max(0,parseInt(raw)||0));
    setSplits(p=>p.map(s=>s.methodId===mid?{...s,pct:val}:s));
  };
  const total=splits.reduce((a,s)=>a+s.pct,0);
  const balanced=total===100;
  return (
    <div>
      {splits.map(sp=>{
        const m=methods.find(x=>x.id===sp.methodId);
        if(!m)return null;
        const amt=Math.round((sp.pct/100)*totalAmount*100)/100;
        return (
          <div key={sp.methodId} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
            background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,marginBottom:8}}>
            <div style={{fontSize:18,flexShrink:0}}>{PAYMENT_METHOD_ICONS[m.type]}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{m.label}</div>
              <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{PAYMENT_METHOD_LABELS[m.type]}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <input type="number" value={sp.pct} min={0} max={100} onChange={e=>updatePct(sp.methodId,e.target.value)}
                style={{width:54,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:6,padding:"6px 8px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"center"}}/>
              <span style={{fontFamily:mono,fontSize:11,color:TEXT2}}>%</span>
            </div>
            <div style={{minWidth:56,textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1}}>${amt.toFixed(2)}</div>
            </div>
            {splits.length>1&&<button onClick={()=>removeSplit(sp.methodId)} style={{background:"none",border:"none",cursor:"pointer",color:TEXT3,fontSize:16,flexShrink:0}}>✕</button>}
          </div>
        );
      })}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderRadius:6,marginBottom:12,
        background:balanced?SUCCESS+"0d":DANGER+"0d",border:`1px solid ${balanced?SUCCESS+"44":DANGER+"33"}`}}>
        <div style={{fontFamily:mono,fontSize:10,color:balanced?SUCCESS:DANGER}}>
          {balanced?"✓ Split totals 100%":`Total: ${total}% — must equal 100%`}
        </div>
        <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1}}>Total: ${totalAmount}</div>
      </div>
      {splits.length<methods.length&&<Btn small variant="ghost" onClick={addSplit}>+ Add Payment Method</Btn>}
    </div>
  );
}

function Billing({ students, role }) {
  const isOwner=role==="owner",isParent=role==="parent",isStudent=role==="student";
  const overdue=students.filter(s=>(s.billing||s.billing_status)==="Overdue");
  const mrr=students.filter(s=>(s.billing||s.billing_status)==="Active").reduce((a,s)=>a+(s.discount>0?Math.round(s.fee*(1-s.discount/100)):s.fee),0);
  const [methods,setMethods]=useState(INIT_PAYMENT_METHODS);
  const [splits,setSplits]=useState(INIT_SPLITS);
  const [showAddM,setShowAddM]=useState(false);
  const [newType,setNewType]=useState("card");
  const [newLabel,setNewLabel]=useState("");
  const [payModal,setPayModal]=useState(false);
  const [paySent,setPaySent]=useState(false);
  const me=students[0];
  const myFee=me?(me.discount>0?Math.round(me.fee*(1-me.discount/100)):me.fee):0;

  const addMethod=()=>{
    if(!newLabel.trim())return;
    setMethods(p=>[...p,{id:"pm"+Date.now(),type:newType,label:newLabel,isDefault:false}]);
    setNewLabel("");setShowAddM(false);
  };
  const submitPayment=()=>{
    if(splits.reduce((a,s)=>a+s.pct,0)!==100)return;
    setPaySent(true);setPayModal(false);setTimeout(()=>setPaySent(false),3500);
  };

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Billing" sub={isOwner?"Finance":isParent?"My Account":"My Billing"}/>
      {isOwner&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
            <StatCard label="Monthly MRR" value={`$${mrr}`}      sub="after discounts" accent={SUCCESS}/>
            <StatCard label="Overdue"      value={overdue.length} sub="requires action" accent={DANGER}/>
            <StatCard label="Paused"       value={students.filter(s=>(s.billing||s.billing_status)==="Paused").length} sub="on hold" accent={WARN}/>
          </div>
          {overdue.length>0&&(
            <div style={{background:DANGER+"0d",border:`1px solid ${DANGER}33`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:DANGER}}>Overdue Accounts</div>
                <div style={{fontFamily:mono,fontSize:9,color:DANGER+"aa"}}>{overdue.map(s=>s.name).join(", ")}</div>
              </div>
              <Btn small variant="danger">Send Reminders</Btn>
            </div>
          )}
        </>
      )}
      {(isStudent||isParent)&&me&&(
        <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:12,padding:"20px 22px",marginBottom:22,display:"flex",alignItems:"center",gap:20}}>
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
      {(isStudent||isParent||isOwner)&&(
        <div style={{marginBottom:22}}>
          <Panel title="Payment Methods" action={
            <button onClick={()=>setShowAddM(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:mono,fontSize:9,color:A,letterSpacing:1,textTransform:"uppercase"}}>+ Add Method</button>
          }>
            {showAddM&&(
              <div style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"14px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
                <div style={{minWidth:130}}>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>TYPE</div>
                  <select value={newType} onChange={e=>setNewType(e.target.value)} style={selStyle()}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{flex:1,minWidth:160}}>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:4}}>LABEL / ACCOUNT</div>
                  <Input value={newLabel} onChange={setNewLabel} placeholder="e.g. Visa ···· 1234"/>
                </div>
                <Btn small onClick={addMethod}>Save</Btn>
                <Btn small variant="neutral" onClick={()=>setShowAddM(false)}>Cancel</Btn>
              </div>
            )}
            {methods.map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${BORDER}`}}>
                <div style={{fontSize:20}}>{PAYMENT_METHOD_ICONS[m.type]}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{m.label}</div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{PAYMENT_METHOD_LABELS[m.type]}</div>
                </div>
                {m.isDefault&&<Tag color={A}>Default</Tag>}
                <button onClick={()=>setMethods(p=>p.filter(x=>x.id!==m.id))} style={{background:"none",border:"none",cursor:"pointer",fontFamily:mono,fontSize:9,color:DANGER,letterSpacing:1,textTransform:"uppercase",padding:"4px 8px"}}>Remove</button>
              </div>
            ))}
          </Panel>
        </div>
      )}
      <Panel title={isOwner?"All Transactions":"Payment History"}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"0 20px"}}>
          {["Date","Description","Amount","Status"].map(h=>(
            <div key={h} style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,textTransform:"uppercase",paddingBottom:8,borderBottom:`1px solid ${BORDER}`}}>{h}</div>
          ))}
          {BILLING_HISTORY.map((r,i)=>[
            <div key={`d${i}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>{r.date}</div>,
            <div key={`n${i}`} style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>{r.desc}</div>,
            <div key={`a${i}`} style={{fontFamily:mono,fontSize:10,color:TEXT2,padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}>${r.amount}</div>,
            <div key={`s${i}`} style={{padding:"9px 0",borderBottom:`1px solid ${SURFACE2}`}}><Tag color={r.status==="Paid"?SUCCESS:DANGER}>{r.status}</Tag></div>,
          ])}
        </div>
        <div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}><Btn small variant="neutral">Download PDF</Btn></div>
      </Panel>
      <div style={{marginTop:16,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:22}}>💳</div>
        <div>
          <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:TEXT1,marginBottom:2}}>Stripe Integration — Coming in v1.1</div>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Real-time card processing, ACH, and automated recurring billing</div>
        </div>
        <div style={{flex:1}}/><Btn small variant="ghost">Learn More</Btn>
      </div>
      {payModal&&(
        <Modal title={`Pay $${myFee} — Split Payment`} onClose={()=>setPayModal(false)}>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:16,lineHeight:1.7}}>Divide this payment across multiple methods. Percentages must total 100%.</div>
          <SplitPaymentEditor methods={methods} splits={splits} setSplits={setSplits} totalAmount={myFee}/>
          <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
            <Btn variant="neutral" onClick={()=>setPayModal(false)}>Cancel</Btn>
            <Btn onClick={submitPayment} disabled={splits.reduce((a,s)=>a+s.pct,0)!==100}>Confirm Payment</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function Settings({ promoReqs, setPromoReqs, prices, setPrices, students, setStudents, gymLogo, setGymLogo }) {
  const [tab,setTab]=useState("pricing");
  const logoRef=useRef();

  const handleLogo=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();reader.onload=ev=>setGymLogo(ev.target.result);reader.readAsDataURL(file);
  };
  const updatePrice=(key,val)=>setPrices(p=>({...p,[key]:parseInt(val)||0}));
  const updateDiscount=(id,val)=>setStudents(p=>p.map(s=>s.id===id?{...s,discount:Math.min(100,Math.max(0,parseInt(val)||0))}:s));
  const updatePromo=(belt,field,val)=>setPromoReqs(p=>({...p,[belt]:{...p[belt],[field]:field==="evalRequired"?val:parseInt(val)||0}}));

  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="Settings" sub="Gym Configuration"/>
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:`1px solid ${BORDER}`}}>
        {[["pricing","Pricing & Discounts"],["promo","Promotion Requirements"],["logo","Gym Logo"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 18px",border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,
            letterSpacing:1,textTransform:"uppercase",fontWeight:tab===t?700:400,background:"transparent",
            borderBottom:`3px solid ${tab===t?A:"transparent"}`,color:tab===t?A:TEXT2,marginBottom:-1}}>{l}</button>
        ))}
      </div>

      {tab==="pricing"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Panel title="Membership Prices">
            {[["adult","Adult (18+)"],["youth","Youth (Under 18)"],["family","Family Plan"]].map(([key,label])=>(
              <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${BORDER}`}}>
                <div>
                  <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT1}}>{label}</div>
                  <div style={{fontFamily:mono,fontSize:9,color:TEXT3}}>Monthly fee</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:mono,fontSize:14,color:TEXT2}}>$</span>
                  <input type="number" value={prices[key]} onChange={e=>updatePrice(key,e.target.value)}
                    style={{width:70,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 10px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"right"}}/>
                  <span style={{fontFamily:mono,fontSize:10,color:TEXT3}}>/mo</span>
                </div>
              </div>
            ))}
            <div style={{marginTop:14}}><Btn small>Save Prices</Btn></div>
          </Panel>
          <Panel title="Individual Discounts">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:12}}>Set % discount per student. Enter 0 for none.</div>
            {students.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
                <Avatar name={s.name} size={30}/>
                <div style={{flex:1,fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{s.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <input type="number" value={s.discount} min={0} max={100} onChange={e=>updateDiscount(s.id,e.target.value)}
                    style={{width:52,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"5px 8px",fontFamily:mono,fontSize:11,color:TEXT1,outline:"none",textAlign:"center"}}/>
                  <span style={{fontFamily:mono,fontSize:10,color:TEXT3}}>%</span>
                  {s.discount>0&&<Tag color={SUCCESS}>-${Math.round(s.fee*s.discount/100)}/mo</Tag>}
                </div>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {tab==="promo"&&(
        <div>
          <div style={{fontFamily:mono,fontSize:10,color:TEXT2,marginBottom:18}}>Configure minimum requirements for belt promotion.</div>
          {Object.entries(promoReqs).map(([belt,reqs])=>(
            <div key={belt} style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,marginBottom:14,overflow:"hidden"}}>
              <div style={{background:BELT_COLORS[belt].bg,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
                <BeltBadge belt={belt} stripes={0}/>
                <div style={{fontFamily:cond,fontWeight:800,fontSize:16,color:BELT_COLORS[belt].text,textTransform:"uppercase"}}>{belt} Belt — Promotion Requirements</div>
              </div>
              <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {[
                  {field:"months",    label:"Min. Months", suffix:"mo"},
                  {field:"classes",   label:"Min. Classes", suffix:"classes"},
                  {field:"techniques",label:"Min. Techniques", suffix:"techs"},
                ].map(({field,label,suffix})=>(
                  <div key={field}>
                    <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <input type="number" value={reqs[field]} min={0} onChange={e=>updatePromo(belt,field,e.target.value)}
                        style={{width:70,background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:6,padding:"7px 10px",fontFamily:mono,fontSize:12,color:TEXT1,outline:"none",textAlign:"center"}}/>
                      <span style={{fontFamily:mono,fontSize:9,color:TEXT3}}>{suffix}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <div style={{fontFamily:mono,fontSize:8,color:TEXT3,letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>Instructor Eval</div>
                  <button onClick={()=>updatePromo(belt,"evalRequired",!reqs.evalRequired)} style={{padding:"8px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:mono,fontSize:10,letterSpacing:1,textTransform:"uppercase",background:reqs.evalRequired?SUCCESS:SURFACE2,color:reqs.evalRequired?"#fff":TEXT3}}>
                    {reqs.evalRequired?"Required":"Not Required"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="logo"&&(
        <div style={{maxWidth:500}}>
          <Panel title="Gym Logo & Branding">
            <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:16}}>Upload your gym logo to display in the sidebar. PNG with transparent background recommended.</div>
            {gymLogo
              ? <div style={{marginBottom:16}}>
                  <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Current Logo</div>
                  <div style={{background:SIDEBAR,borderRadius:8,padding:16,display:"inline-block"}}><img src={gymLogo} alt="logo" style={{maxWidth:200,maxHeight:80,objectFit:"contain"}}/></div>
                </div>
              : <div style={{background:SIDEBAR,borderRadius:8,padding:"28px 20px",textAlign:"center",marginBottom:16}}>
                  <div style={{fontFamily:cond,fontWeight:900,fontSize:20,color:"#f0f6ff"}}><span style={{color:A}}>BJJ</span>Groundwork</div>
                  <div style={{fontFamily:mono,fontSize:9,color:"#3a5570",marginTop:3}}>Default wordmark</div>
                </div>
            }
            <div style={{border:`2px dashed ${BORDER}`,borderRadius:8,padding:"24px",textAlign:"center",background:SURFACE2,marginBottom:14}}>
              <div style={{fontSize:28,marginBottom:8}}>🖼️</div>
              <div style={{fontFamily:cond,fontWeight:700,fontSize:15,color:TEXT2,marginBottom:4}}>Drop logo here or click to browse</div>
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
// MY PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
function MyProgress({ students, promoReqs, curriculum }) {
  const me=students[0];
  if(!me) return <div style={{padding:40,fontFamily:mono,color:TEXT3}}>No student data.</div>;
  const ne=me.nextEligible||(me.belt==="white"?50:me.belt==="blue"?92:me.belt==="purple"?200:400);
  const pct=Math.min(Math.round((me.attendance/ne)*100),100);
  const req=promoReqs[me.belt]||promoReqs.white;
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="My Progress" sub="Student Dashboard"/>
      <div style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:14,padding:24,display:"flex",alignItems:"center",gap:22,marginBottom:20}}>
        <Avatar name={me.name} size={64}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:cond,fontWeight:900,fontSize:26,color:TEXT1,marginBottom:5}}>{me.name}</div>
          <BeltBadge belt={me.belt} stripes={me.stripes}/>
          <div style={{fontFamily:mono,fontSize:9,color:TEXT3,marginTop:7}}>{me.attendance} total classes attended</div>
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
            {label:"Time in Rank",   val:`${req.months} months required`,done:false},
            {label:"Classes",        val:`${me.attendance}/${req.classes}`,done:me.attendance>=req.classes},
            {label:"Techniques",     val:`${req.techniques} required`,done:false},
            {label:"Instructor Eval",val:req.evalRequired?"Required":"Not Required",done:!req.evalRequired},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div style={{width:26,height:26,borderRadius:4,flexShrink:0,background:r.done?SUCCESS+"18":SURFACE2,color:r.done?SUCCESS:TEXT3,border:`1px solid ${r.done?SUCCESS+"55":BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{r.done?"✓":"○"}</div>
              <div>
                <div style={{fontFamily:mono,fontSize:9,color:TEXT3,letterSpacing:1,textTransform:"uppercase"}}>{r.label}</div>
                <div style={{fontFamily:cond,fontWeight:700,fontSize:14,color:TEXT1}}>{r.val}</div>
              </div>
            </div>
          ))}
        </Panel>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Panel title="Monthly Attendance">
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:60}}>
              {[4,6,5,7,8,6,8,9,7,8,9,10].map((v,i)=>(
                <div key={i} style={{flex:1,height:(v/10)*56,background:i===11?A:`${A}44`,borderRadius:"2px 2px 0 0"}}/>
              ))}
            </div>
            <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:6}}>Classes/month, last 12 months</div>
          </Panel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <StatCard label="Classes Left" value={Math.max(ne-me.attendance,0)} sub="for promotion" accent={A}/>
            <StatCard label="This Month"   value={9} sub="classes attended" accent={SUCCESS}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT PORTAL
// ─────────────────────────────────────────────────────────────────────────────
function ParentPortal({ students, curriculum }) {
  const children=students.filter(s=>s.parentId==="P1"||s.parent_id==="P1");
  return (
    <div style={{padding:"28px 32px"}}>
      <PageHeader title="My Children" sub="Parent Portal" badge="Guardian View"/>
      {children.length===0&&<div style={{fontFamily:mono,fontSize:11,color:TEXT3}}>No children linked to this account.</div>}
      {children.map(child=>{
        const ne=child.nextEligible||(child.belt==="white"?50:child.belt==="blue"?92:200);
        const pct=Math.min(Math.round((child.attendance/ne)*100),100);
        const billing=child.billing||child.billing_status||"Active";
        return (
          <div key={child.id} style={{background:SURFACE,border:`1px solid ${AB}`,borderRadius:14,padding:22,marginBottom:18}}>
            <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}>
              <Avatar name={child.name} size={56}/>
              <div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:22,color:TEXT1,marginBottom:5}}>{child.name}</div>
                <div style={{display:"flex",gap:7}}><BeltBadge belt={child.belt} stripes={child.stripes}/><Tag color={A}>Age {child.age}</Tag><Tag color={SUCCESS}>{billing}</Tag></div>
              </div>
              <div style={{marginLeft:"auto",textAlign:"center"}}>
                <ProgressRing pct={pct} size={66}/>
                <div style={{fontFamily:mono,fontSize:8,color:TEXT3,marginTop:2}}>PROMOTION</div>
                <div style={{fontFamily:cond,fontWeight:900,fontSize:17,color:pct>=100?SUCCESS:A}}>{pct}%</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
              <Panel title="Attendance"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:TEXT1}}>{child.attendance}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>total classes</div></Panel>
              <Panel title="Classes Left"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:A}}>{Math.max(ne-child.attendance,0)}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>for promotion</div></Panel>
              <Panel title="Membership"><div style={{fontFamily:cond,fontWeight:900,fontSize:28,color:SUCCESS}}>${child.fee}</div><div style={{fontFamily:mono,fontSize:8,color:TEXT3}}>per month</div></Panel>
            </div>
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
  const { user, isLoaded } = useUser();
  const clerkRole = user?.publicMetadata?.role;
  const [manualRole,setManualRole]   = useState("owner");
  const role = clerkRole || manualRole;
  const setRole = setManualRole;
  const [active,setActive]           = useState("dashboard");
  const [students,setStudents]       = useState([]);
  const [instructors,setInstructors] = useState([]);
  const [curriculum,setCurriculum]   = useState(INIT_CURRICULUM);
  const [promoReqs,setPromoReqs]     = useState(INIT_PROMO_REQS);
  const [prices,setPrices]           = useState(INIT_PRICES);
  const [gymLogo,setGymLogo]         = useState(null);
  const [calendarEvents,setCalendarEvents] = useState([]);
  const [documents,setDocuments]     = useState([]);
  const [videos,setVideos]           = useState([]);
  const [loading,setLoading]         = useState(true);

  useEffect(()=>{ setActive(ROLES[role].nav[0]); },[role]);

  useEffect(()=>{
    async function loadData() {
      const [
        {data:stuData},
        {data:insData},
        {data:classData},
        {data:techData},
        {data:docData},
        {data:vidData},
      ] = await Promise.all([
        supabase.from("users").select("*").eq("role","student").eq("gym_id",GYM_ID),
        supabase.from("users").select("*").eq("role","instructor").eq("gym_id",GYM_ID),
        supabase.from("classes").select("*").eq("gym_id",GYM_ID),
        supabase.from("techniques").select("*").eq("gym_id",GYM_ID).order("sort_order"),
        supabase.from("documents").select("*").eq("gym_id",GYM_ID).order("created_at"),
        supabase.from("videos").select("*").eq("gym_id",GYM_ID).order("created_at"),
      ]);

      if(stuData) setStudents(stuData.map(s=>({...s,
        nextEligible:s.belt==="white"?50:s.belt==="blue"?92:s.belt==="purple"?200:400,
        parentId:s.parent_id,billing:s.billing_status
      })));

      if(insData) setInstructors(insData.map(i=>({...i,
        progress:i.progress||0,classes:i.attendance||0,cert:i.cert||"Level 1"
      })));

      if(classData) setCalendarEvents(classData.map(c=>({...c,instructor:c.instructor_name||""})));

      if(techData){
        const grouped={white:[],blue:[],purple:[],brown:[]};
        techData.forEach(t=>{if(grouped[t.belt])grouped[t.belt].push(t.title);});
        if(Object.values(grouped).some(v=>v.length>0)) setCurriculum(grouped);
      }

      if(docData) setDocuments(docData.map(d=>({...d,
        date:new Date(d.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})
      })));

      if(vidData) setVideos(vidData.map(v=>({...v,
        date:new Date(v.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})
      })));

      setLoading(false);
    }
    loadData();
  },[]);

  if(!isLoaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",
      height:"100vh",fontFamily:"'DM Mono',monospace",fontSize:14,color:"#4a6080",background:"#f0f4f8"}}>
      Loading BJJGroundwork…
    </div>
  );

  if(loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",
      height:"100vh",fontFamily:"'DM Mono',monospace",fontSize:14,color:"#4a6080",background:"#f0f4f8"}}>
      Loading data…
    </div>
  );

  const sharedProps={students,setStudents,instructors,setInstructors,
    curriculum,setCurriculum,promoReqs,setPromoReqs,prices,setPrices,role};

  const VIEW = {
    dashboard:       <Dashboard      {...sharedProps} calendarEvents={calendarEvents}/>,
    students:        <Students       {...sharedProps}/>,
    attendance:      <Attendance     {...sharedProps} calendarEvents={calendarEvents}/>,
    calendar:        <Calendar       role={role} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents}/>,
    curriculum:      <Curriculum     {...sharedProps}/>,
    videos:          <Videos         role={role} videos={videos} setVideos={setVideos}/>,
    documents:       <Documents      role={role} documents={documents} setDocuments={setDocuments}/>,
    instructors:     <Instructors    {...sharedProps}/>,
    messaging:       <Messaging      students={students}/>,
    reports:         <Reports        students={students}/>,
    billing:         <Billing        students={students} role={role}/>,
    settings:        <Settings       {...sharedProps} gymLogo={gymLogo} setGymLogo={setGymLogo}/>,
    "my-progress":   <MyProgress     students={students} promoReqs={promoReqs} curriculum={curriculum}/>,
    "parent-portal": <ParentPortal   students={students} curriculum={curriculum}/>,
  };

  const AppShell = () => (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f0f4f8;color:#0f2540}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#f0f4f8}
        ::-webkit-scrollbar-thumb{background:#d1dce8;border-radius:3px}
        button:hover{opacity:.84}
        input[type=number]::-webkit-inner-spin-button{opacity:.5}
        select{appearance:auto}
      `}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#f0f4f8"}}>
        <Sidebar active={active} setActive={setActive} role={role} setRole={setRole} gymLogo={gymLogo}/>
        <main style={{flex:1,overflowY:"auto",maxHeight:"100vh",background:"#f0f4f8"}}>
          {VIEW[active]??<div style={{padding:40,fontFamily:"'DM Mono',monospace",color:"#8aaac8"}}>View not found.</div>}
        </main>
      </div>
    </>
  );

  return (
    <>
      <SignedOut>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",
          height:"100vh",background:"#f0f4f8",flexDirection:"column",gap:24}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:40,color:"#0f2540"}}>
            <span style={{color:"#2563eb"}}>BJJ</span>Groundwork
          </div>
          <SignIn routing="hash"/>
        </div>
      </SignedOut>
      <SignedIn>
        <AppShell/>
      </SignedIn>
    </>
  );
}