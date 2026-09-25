import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
// ── Logo Pedidone ─────────────────────────────────────────────
const LogoPedidone = ({ height = 40, dark = false }) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
    <div style={{fontFamily:"'Hanken Grotesk',system-ui,sans-serif",fontWeight:800,fontSize:height*1.8,letterSpacing:"-2px",lineHeight:1,whiteSpace:"nowrap",color:dark?"#fff":"#14302A"}}>
      <span style={{fontWeight:300}}>Pedi</span>
      <span style={{letterSpacing:0}}>d</span>
      <svg width={height*0.6} height={height*0.6} viewBox="0 0 120 120" style={{display:"inline-block",verticalAlign:"-0.07em",margin:"0 1px"}} aria-hidden="true">
        <circle cx="60" cy="56" r="52" fill="#1FB86A"/>
        <path d="M22 88 L14 116 L48 104 Z" fill="#1FB86A"/>
        <g transform="translate(4,-1)" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 60 L40 72 L66 42"/>
          <path d="M53 67 L58 72 L84 42"/>
        </g>
      </svg>
      <span style={{color:dark?"#fff":"#14302A"}}>ne</span>
    </div>
  </div>
);
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BOT_URL      = import.meta.env.VITE_BOT_BASE_URL || "";
const MASTER_EMAIL = import.meta.env.VITE_MASTER_EMAIL || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Utils ─────────────────────────────────────────────────────
const fmt    = n  => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n??0);
const fmtF   = iso => iso ? new Date(iso+"T12:00:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"}) : "—";
const fmtFLg = iso => iso ? new Date(iso+"T12:00:00").toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "—";
const fmtH   = t  => t ? t.slice(0,5) : "—";
const hoy    = () => new Date().toISOString().split("T")[0];

const ESTADOS = {
  pendiente:  {label:"Pendiente", color:"#f59e0b",bg:"#fef3c7"},
  confirmado: {label:"Confirmado",color:"#3b82f6",bg:"#dbeafe"},
  recogido:   {label:"Recogido",  color:"#16a34a",bg:"#dcfce7"},
  cancelado:  {label:"Cancelado", color:"#ef4444",bg:"#fee2e2"},
};
const PAGO_LABELS = {local:"🏪 En local",efectivo:"💵 Efectivo",tarjeta:"💳 Tarjeta",online:"📲 Online"};

// ── Componentes base ──────────────────────────────────────────
const Badge = ({estado}) => {
  const e=ESTADOS[estado]||ESTADOS.pendiente;
  return <span style={{background:e.bg,color:e.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{e.label}</span>;
};
const Btn = ({children,onClick,color="#6b7280",solid=false,style={}}) => (
  <button onClick={onClick} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${color}30`,cursor:"pointer",fontSize:12,fontWeight:600,background:solid?color:`${color}12`,color:solid?"#fff":color,...style}}>{children}</button>
);
const KPI = ({icon,value,label,color="#111",sub}) => (
  <div style={{background:"#fff",borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.07)",borderLeft:`4px solid ${color}`,flex:1,minWidth:130}}>
    <div style={{fontSize:22}}>{icon}</div>
    <div style={{fontSize:26,fontWeight:800,color,lineHeight:1.1,marginTop:6}}>{value}</div>
    <div style={{fontSize:12,color:"#999",marginTop:4,fontWeight:500}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:"#bbb",marginTop:2}}>{sub}</div>}
  </div>
);
const selStyle = {padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13,background:"#fff",cursor:"pointer"};
const inputSt  = {width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,fontFamily:"inherit",outline:"none"};
const Field=({label,children})=><div style={{marginBottom:13}}><div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:4}}>{label}</div>{children}</div>;

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
function LoginPage({onLogin}) {
  const [email,setEmail]   = useState("");
  const [pass,setPass]     = useState("");
  const [error,setError]   = useState("");
  const [loading,setLoading] = useState(false);

  const doLogin = async () => {
    if (!email||!pass) { setError("Introduce email y contraseña"); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (err) { setError("Email o contraseña incorrectos"); setLoading(false); return; }
    onLogin();
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:"#1e293b",borderRadius:16,padding:"44px 40px",width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <img src="/logo.png" alt="Pedidone" style={{height:40,marginBottom:4}}/>
        <div style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:32}}>Panel de gestión de pedidos</div>

        <label style={{display:"block",fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",marginBottom:6}}>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doLogin()}
          placeholder="tu@email.com" type="email"
          style={{width:"100%",padding:"11px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:14,fontFamily:"inherit",marginBottom:16,outline:"none",boxSizing:"border-box"}}/>

        <label style={{display:"block",fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",marginBottom:6}}>Contraseña</label>
        <input value={pass} onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doLogin()}
          placeholder="••••••••" type="password"
          style={{width:"100%",padding:"11px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:14,fontFamily:"inherit",marginBottom:4,outline:"none",boxSizing:"border-box"}}/>

        {error && <div style={{color:"#f87171",fontSize:13,marginTop:8,marginBottom:4}}>{error}</div>}

        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",padding:12,borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontSize:14,fontWeight:700,marginTop:16,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
          {loading ? "Entrando..." : "Entrar →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP PRINCIPAL — detecta rol y redirige
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [session,  setSession]  = useState(null);
  const [userRole, setUserRole] = useState(null); // 'master' | 'admin'
  const [tenantId, setTenantId] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Detectar ruta /master
  const isMasterRoute = window.location.pathname === "/master";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserRole(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserRole(session.user.id);
      else { setUserRole(null); setTenantId(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId) => {
    const { data } = await supabase.from("tenant_users").select("role,tenant_id").eq("user_id", userId).single();
    if (data) { setUserRole(data.role); setTenantId(data.tenant_id); }
    setLoading(false);
  };

  const doLogout = () => supabase.auth.signOut();

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"system-ui"}}>
      Cargando...
    </div>
  );

  if (!session) return <LoginPage onLogin={()=>{}} />;

  // Master intentando acceder a /master
  if (isMasterRoute && userRole === "master")
    return <MasterPanel onLogout={doLogout} />;

  // Cliente intentando acceder a /master → redirigir al panel normal
  if (isMasterRoute && userRole !== "master") {
    window.location.href = "/";
    return null;
  }

  // Cliente normal → su dashboard
  if (userRole === "admin" && tenantId)
    return <Dashboard tenantId={tenantId} onLogout={doLogout} />;

  // Master accediendo al panel normal → redirigir a /master
  if (userRole === "master") {
    window.location.href = "/master";
    return null;
  }

  return <div style={{padding:40,fontFamily:"system-ui"}}>Error: usuario sin rol asignado. Contacta con soporte.</div>;
}

// ══════════════════════════════════════════════════════════════
// PANEL MASTER
// ══════════════════════════════════════════════════════════════
function MasterPanel({onLogout}) {
  const [tenants,  setTenants]  = useState([]);
  const [vista,    setVista]    = useState("tenants"); // tenants | nuevo
  const [form,     setForm]     = useState({ nombre:"", telefono:"", phone_id:"", token:"", email:"", pass:"", bienvenida:"" });
  const [toast,    setToast]    = useState(null);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(false);

  const showToast = (msg,tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    setTenants(data||[]);
    // Stats por tenant
    const { data: pedidos } = await supabase.from("pedidos").select("tenant_id,estado,total,created_at");
    const st = {};
    (pedidos||[]).forEach(p => {
      if (!st[p.tenant_id]) st[p.tenant_id] = { total:0, activos:0, facturacion:0 };
      st[p.tenant_id].total++;
      if (p.estado!=="cancelado") { st[p.tenant_id].activos++; st[p.tenant_id].facturacion+=(p.total||0); }
    });
    setStats(st);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

const crearCliente = async () => {
    if (!form.nombre||!form.telefono||!form.email||!form.pass) {
      showToast("Rellena todos los campos obligatorios","error"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/crear-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MASTER_SECRET}`,
        },
        body: JSON.stringify({
          nombre: form.nombre, telefono: form.telefono,
          phone_id: form.phone_id, token: form.token,
          email: form.email, pass: form.pass,
          bienvenida: form.bienvenida,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`✅ Cliente "${form.nombre}" creado correctamente`);
      setForm({ nombre:"", telefono:"", phone_id:"", token:"", email:"", pass:"", bienvenida:"" });
      setVista("tenants");
      await cargar();
    } catch(err) {
      showToast("Error: "+err.message,"error");
    }
    setLoading(false);
  };

  const toggleActivo = async (id, activo) => {
    await supabase.from("tenants").update({ activo: !activo }).eq("id", id);
    showToast(!activo ? "✅ Cliente activado" : "⏸ Cliente desactivado");
    await cargar();
  };

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"#f4f4f6"}}>
      {toast&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:toast.tipo==="error"?"#ef4444":"#111827",color:"#fff",padding:"10px 18px",borderRadius:10,fontWeight:600,fontSize:14}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:"#0f172a",padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <img src="/logo.png" alt="Pedidone" style={{height:32,filter:"brightness(0) invert(1)"}}/>
          <span style={{color:"rgba(255,255,255,.4)",fontSize:13,marginLeft:12}}>Panel Master</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setVista(vista==="tenants"?"nuevo":"tenants")} style={{padding:"8px 16px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {vista==="nuevo" ? "← Volver" : "+ Nuevo cliente"}
          </button>
          <button onClick={onLogout} style={{padding:"8px 14px",background:"transparent",color:"rgba(255,255,255,.5)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,fontSize:13,cursor:"pointer"}}>Salir</button>
        </div>
      </div>

      <div style={{padding:"28px 30px"}}>

        {/* Stats globales */}
        <div style={{display:"flex",gap:14,marginBottom:28,flexWrap:"wrap"}}>
          <KPI icon="🏪" value={tenants.length} label="Clientes totales" color="#2563eb"/>
          <KPI icon="✅" value={tenants.filter(t=>t.activo).length} label="Clientes activos" color="#16a34a"/>
          <KPI icon="📦" value={Object.values(stats).reduce((s,t)=>s+t.total,0)} label="Pedidos totales" color="#7c3aed"/>
          <KPI icon="💰" value={fmt(Object.values(stats).reduce((s,t)=>s+t.facturacion,0))} label="Facturación global" color="#d97706"/>
        </div>

        {/* LISTA DE TENANTS */}
        {vista==="tenants" && (
          <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.07)"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #f0f0f0",fontWeight:700,fontSize:15}}>Clientes</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"2px solid #f0f0f0"}}>
                {["Negocio","Teléfono","WhatsApp","Pedidos","Facturación","Estado",""].map(h=>(
                  <th key={h} style={{padding:"10px 16px",textAlign:"left",color:"#999",fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {tenants.map(t=>(
                  <tr key={t.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                    <td style={{padding:"12px 16px",fontWeight:700}}>{t.nombre}</td>
                    <td style={{padding:"12px 16px",color:"#555"}}>{t.telefono_negocio}</td>
                    <td style={{padding:"12px 16px",fontSize:11,color:t.whatsapp_phone_id==="PENDIENTE"?"#ef4444":"#16a34a"}}>
                      {t.whatsapp_phone_id==="PENDIENTE" ? "⚠️ Pendiente" : "✅ Conectado"}
                    </td>
                    <td style={{padding:"12px 16px",fontWeight:700}}>{stats[t.id]?.total||0}</td>
                    <td style={{padding:"12px 16px",fontWeight:700}}>{fmt(stats[t.id]?.facturacion||0)}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{background:t.activo?"#dcfce7":"#fee2e2",color:t.activo?"#16a34a":"#ef4444",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>
                        {t.activo?"Activo":"Inactivo"}
                      </span>
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:5}}>
                        <Btn onClick={()=>toggleActivo(t.id,t.activo)} color={t.activo?"#ef4444":"#16a34a"}>
                          {t.activo?"Desactivar":"Activar"}
                        </Btn>
                        <a href={`/?tenant=${t.id}`} target="_blank" rel="noreferrer">
                          <Btn color="#2563eb">Ver panel</Btn>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {!tenants.length && <tr><td colSpan="7" style={{padding:"40px",textAlign:"center",color:"#aaa"}}>No hay clientes aún</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* NUEVO CLIENTE */}
        {vista==="nuevo" && (
          <div style={{maxWidth:600}}>
            <div style={{background:"#fff",borderRadius:12,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,.07)"}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>Nuevo cliente</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <Field label="Nombre del negocio *"><input style={inputSt} value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Panadería Pérez"/></Field>
                <Field label="Teléfono del negocio *"><input style={inputSt} value={form.telefono} onChange={e=>setForm(f=>({...f,telefono:e.target.value}))} placeholder="34611111111"/></Field>
                <Field label="WhatsApp Phone Number ID"><input style={inputSt} value={form.phone_id} onChange={e=>setForm(f=>({...f,phone_id:e.target.value}))} placeholder="De Meta Developers"/></Field>
                <Field label="WhatsApp Token"><input style={inputSt} value={form.token} onChange={e=>setForm(f=>({...f,token:e.target.value}))} placeholder="EAAxxxx..."/></Field>
                <Field label="Email de acceso al panel *"><input style={inputSt} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="cliente@negocio.com" type="email"/></Field>
                <Field label="Contraseña inicial *"><input style={inputSt} value={form.pass} onChange={e=>setForm(f=>({...f,pass:e.target.value}))} placeholder="mínimo 8 caracteres" type="password"/></Field>
              </div>
              <Field label="Mensaje de bienvenida del bot">
                <textarea style={{...inputSt,minHeight:70,resize:"vertical"}} value={form.bienvenida} onChange={e=>setForm(f=>({...f,bienvenida:e.target.value}))} placeholder="¡Bienvenido/a a *Nombre*! Aquí puedes hacer tu pedido..."/>
              </Field>

              <div style={{background:"#fef3c7",borderRadius:8,padding:"12px 14px",fontSize:12,color:"#92400e",marginBottom:16}}>
                ⚠️ Tras crear el cliente, ve a <strong>Supabase → Authentication → Users</strong> y crea el usuario con el email y contraseña indicados. Luego vincúlalo ejecutando el SQL de vinculación.
              </div>

              <button onClick={crearCliente} disabled={loading} style={{width:"100%",padding:13,background:"#2563eb",color:"#fff",border:"none",borderRadius:9,fontWeight:800,fontSize:14,cursor:loading?"not-allowed":"pointer"}}>
                {loading?"Creando...":"✅ Crear cliente"}
              </button>
            </div>

            {/* SQL helper */}
            <div style={{background:"#1e293b",borderRadius:12,padding:20,marginTop:16}}>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:11,marginBottom:8,fontWeight:700}}>SQL para vincular el usuario tras crearlo en Supabase Auth:</div>
              <pre style={{color:"#7dd3fc",fontSize:12,margin:0,whiteSpace:"pre-wrap"}}>
{`INSERT INTO tenant_users (user_id, tenant_id, role)
SELECT u.id, t.id, 'admin'
FROM auth.users u, tenants t
WHERE u.email = '${form.email||"EMAIL_CLIENTE"}'
AND t.nombre = '${form.nombre||"NOMBRE_NEGOCIO"}';`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD DEL CLIENTE
// ══════════════════════════════════════════════════════════════
function Dashboard({tenantId, onLogout}) {
  const [pedidos,   setPedidos]   = useState([]);
  const [productos, setProductos] = useState([]);
  const [locales,   setLocales]   = useState([]);
  const [tenant,    setTenant]    = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [vista,     setVista]     = useState("hoy");
  const [filtroEstado, setFE]     = useState("");
  const [filtroLocal,  setFL]     = useState("");
  const [filtroOrigen, setFO]     = useState("");
  const [busqueda,  setBusqueda]  = useState("");
  const [fechaSel,  setFechaSel]  = useState(hoy());
  const [modal,     setModal]     = useState(null);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg,tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3000); };

  const cargar = useCallback(async () => {
    setCargando(true);
    const [{ data:p },{ data:l },{ data:pr },{ data:t }] = await Promise.all([
      supabase.from("pedidos_resumen").select("*").eq("tenant_id",tenantId).order("fecha_recogida").order("hora_recogida"),
      supabase.from("locales").select("*").eq("tenant_id",tenantId).eq("activo",true).order("orden"),
      supabase.from("productos").select("*").eq("tenant_id",tenantId).eq("disponible",true).order("orden"),
      supabase.from("tenants").select("*").eq("id",tenantId).single(),
    ]);
    setPedidos(p||[]); setLocales(l||[]); setProductos(pr||[]); setTenant(t);
    setCargando(false);
  }, [tenantId]);

  useEffect(()=>{ cargar(); },[cargar]);

  useEffect(()=>{
    const ch = supabase.channel("live-"+tenantId)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"pedidos"},payload=>{
        setPedidos(prev => prev.map(p => p.id===payload.new.id ? {...p,...payload.new} : p));
        setModal(m => m&&m.id===payload.new.id ? {...m,...payload.new} : m);
      })
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"pedidos"},()=>{
        supabase.from("pedidos_resumen").select("*").eq("tenant_id",tenantId)
          .order("fecha_recogida").order("hora_recogida")
          .then(({data})=>{ if(data) setPedidos(data); });
      })
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[tenantId]);

  const cambiar = async (id, campos) => {
    const {error} = await supabase.from("pedidos").update(campos).eq("id",id);
    if(error){showToast("Error al actualizar","error");return;}
    setPedidos(prev => prev.map(p => p.id===id ? {...p,...campos} : p));
    if(modal?.id===id) setModal(p=>({...p,...campos}));
    showToast("Actualizado ✅");
  };

  const toggleRecordatorios = async () => {
    if (!tenant) return;
    const nuevo = !tenant.recordatorios_activos;
    await supabase.from("tenants").update({recordatorios_activos:nuevo}).eq("id",tenantId);
    setTenant(t=>({...t,recordatorios_activos:nuevo}));
    showToast(nuevo?"🔔 Recordatorios activados":"🔕 Recordatorios desactivados");
  };

  const activos    = pedidos.filter(p=>p.estado!=="cancelado");
  const hoyP       = pedidos.filter(p=>p.fecha_recogida===hoy()&&p.estado!=="cancelado");
  const facturacion = activos.reduce((s,p)=>s+(p.total||0),0);
  const cobrado     = activos.filter(p=>p.pagado).reduce((s,p)=>s+(p.total||0),0);

  const filtrados = pedidos.filter(p=>{
    if(vista==="hoy"&&p.fecha_recogida!==fechaSel) return false;
    if(filtroEstado&&p.estado!==filtroEstado) return false;
    if(filtroLocal&&p.local_nombre!==filtroLocal) return false;
    if(filtroOrigen&&p.origen!==filtroOrigen) return false;
    if(busqueda){
      const q=busqueda.toLowerCase();
      return p.cliente_nombre?.toLowerCase().includes(q)||p.cliente_telefono?.includes(q)||String(p.numero_pedido).includes(q);
    }
    return true;
  });

  const pedidosPorDia={};
  activos.forEach(p=>{ pedidosPorDia[p.fecha_recogida]=(pedidosPorDia[p.fecha_recogida]||0)+1; });

  const nav = [
    {id:"hoy",icon:"📅",label:"Hoy"},
    {id:"pedidos",icon:"📋",label:"Todos los pedidos"},
    {id:"calendario",icon:"🗓",label:"Calendario"},
    {id:"stats",icon:"📊",label:"Estadísticas"},
    null,
    {id:"nueva-venta",icon:"🧾",label:"Nueva venta"},
    {id:"catalogo",icon:"🛍️",label:"Catálogo"},
    {id:"ajustes",icon:"⚙️",label:"Ajustes"},
  ];

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"#f4f4f6",display:"flex"}}>
      {toast&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:toast.tipo==="error"?"#ef4444":"#111827",color:"#fff",padding:"10px 18px",borderRadius:10,fontWeight:600,fontSize:14,boxShadow:"0 4px 20px rgba(0,0,0,.25)"}}>{toast.msg}</div>}

      <aside style={{width:215,background:"#0f172a",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:50}}>
        <div style={{padding:"22px 18px 16px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>   <img src="/logo.png" alt="Pedidone" style={{height:24,filter:"brightness(0) invert(1)"}}/>   <span style={{fontSize:13,color:"rgba(255,255,255,.7)",fontWeight:600}}>{tenant?.nombre||"Panel"}</span> </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:3}}>Panel de pedidos</div>
          {tenant?.recordatorios_activos&&<div style={{marginTop:6,fontSize:10,background:"#16a34a22",color:"#4ade80",padding:"2px 8px",borderRadius:10,display:"inline-block",fontWeight:700}}>🔔 Recordatorios ON</div>}
        </div>
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {nav.map((v,i)=>v===null
            ? <div key={i} style={{height:1,background:"rgba(255,255,255,.07)",margin:"8px 0"}}/>
            : <button key={v.id} onClick={()=>setVista(v.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 10px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:vista===v.id?"rgba(255,255,255,.12)":"transparent",color:vista===v.id?"#fff":"rgba(255,255,255,.55)",fontWeight:vista===v.id?700:400,fontSize:13}}>
                <span style={{width:18,textAlign:"center"}}>{v.icon}</span>{v.label}
              </button>
          )}
        </nav>
        <div style={{padding:"10px 10px 16px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <button onClick={onLogout} style={{width:"100%",padding:9,borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:12}}>
            ⏻ Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{marginLeft:215,flex:1,padding:"26px 28px",minHeight:"100vh"}}>
        {cargando
          ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"#aaa"}}>Cargando...</div>
          : <>
          {vista==="hoy"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
                <div><div style={{fontSize:20,fontWeight:800}}>Pedidos del día</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{fmtFLg(fechaSel)}</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <input type="date" value={fechaSel} onChange={e=>setFechaSel(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13}}/>
                  <button onClick={()=>setVista("nueva-venta")} style={{padding:"8px 16px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Nueva venta</button>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                <KPI icon="📦" value={hoyP.length} label="Pedidos hoy" color="#2563eb"/>
                <KPI icon="⏳" value={hoyP.filter(p=>p.estado==="confirmado").length} label="Por recoger" color="#d97706"/>
                <KPI icon="✅" value={hoyP.filter(p=>p.estado==="recogido").length} label="Recogidos" color="#16a34a"/>
                <KPI icon="💰" value={fmt(hoyP.reduce((s,p)=>s+(p.total||0),0))} label="Facturación hoy" color="#7c3aed"/>
              </div>
              {locales.length>1&&(
                <div style={{display:"flex",gap:10,marginBottom:16}}>
                  {locales.map(l=>{
                    const n=hoyP.filter(p=>p.local_nombre===l.nombre).length;
                    return <div key={l.id} style={{background:"#fff",borderRadius:10,padding:"12px 16px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",flex:1}}>
                      <div style={{fontSize:11,color:"#999",fontWeight:700,marginBottom:3}}>📍 {l.nombre}</div>
                      <div style={{fontSize:22,fontWeight:800}}>{n}</div>
                    </div>;
                  })}
                </div>
              )}
              <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                {filtrados.length===0?<Empty msg="No hay pedidos para este día"/>:<Tabla pedidos={filtrados} locales={locales} onVer={setModal} onCambiar={cambiar} soloHora/>}
              </div>
            </div>
          )}
          {vista==="pedidos"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <div style={{fontSize:20,fontWeight:800}}>Todos los pedidos</div>
                <span style={{fontSize:13,color:"#888"}}>{filtrados.length} de {pedidos.length}</span>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                <input placeholder="🔍 Nombre, teléfono o #..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{padding:"8px 13px",borderRadius:8,border:"1px solid #ddd",fontSize:13,minWidth:220}}/>
                <select value={filtroEstado} onChange={e=>setFE(e.target.value)} style={selStyle}>
                  <option value="">Todos los estados</option>
                  {Object.entries(ESTADOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filtroLocal} onChange={e=>setFL(e.target.value)} style={selStyle}>
                  <option value="">Todos los locales</option>
                  {locales.map(l=><option key={l.id} value={l.nombre}>{l.nombre}</option>)}
                </select>
                <select value={filtroOrigen} onChange={e=>setFO(e.target.value)} style={selStyle}>
                  <option value="">Todos los orígenes</option>
                  <option value="whatsapp">📱 WhatsApp</option>
                  <option value="tienda">🏪 Tienda</option>
                </select>
              </div>
              <div style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                {filtrados.length===0?<Empty msg="Sin resultados"/>:<Tabla pedidos={filtrados} locales={locales} onVer={setModal} onCambiar={cambiar}/>}
              </div>
            </div>
          )}
          {vista==="calendario"&&(
            <div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:20}}>Calendario de recogidas</div>
              <Calendario pedidosPorDia={pedidosPorDia} onDiaClick={d=>{setFechaSel(d);setVista("hoy");}}/>
            </div>
          )}
          {vista==="stats"&&(
            <div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:20}}>Estadísticas</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
                <KPI icon="📦" value={activos.length} label="Pedidos activos" color="#0f172a"/>
                <KPI icon="💰" value={fmt(facturacion)} label="Facturación total" color="#7c3aed"/>
                <KPI icon="✅" value={fmt(cobrado)} label="Cobrado" color="#16a34a" sub={`${fmt(facturacion-cobrado)} pendiente`}/>
                <KPI icon="⏳" value={pedidos.filter(p=>p.estado==="confirmado").length} label="Por recoger" color="#f59e0b"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <Card title="📍 Por local"><Barras items={locales.map((l,i)=>({label:l.nombre,valor:activos.filter(p=>p.local_nombre===l.nombre).length,color:["#2563eb","#d97706"][i%2]}))} max={activos.length}/></Card>
                <Card title="🛍️ Productos más pedidos"><Barras items={(()=>{const t={};activos.forEach(p=>(p.lineas||[]).forEach(l=>{t[l.producto]=(t[l.producto]||0)+l.cantidad;}));return Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>({label:n,valor:v,color:["#2563eb","#7c3aed","#d97706","#16a34a","#ef4444"][i%5]}));})()}/></Card>
                <Card title="📱 Origen"><Barras items={[{label:"📱 WhatsApp",valor:activos.filter(p=>p.origen==="whatsapp").length,color:"#25d366"},{label:"🏪 Tienda",valor:activos.filter(p=>p.origen==="tienda").length,color:"#2563eb"}]} max={activos.length}/></Card>
                <Card title="💳 Métodos de pago"><Barras items={["local","efectivo","tarjeta","online"].map((m,i)=>({label:PAGO_LABELS[m],valor:activos.filter(p=>p.pago_metodo===m).length,color:["#64748b","#16a34a","#2563eb","#7c3aed"][i]}))} max={activos.length}/></Card>
              </div>
            </div>
          )}
          {vista==="nueva-venta"&&<NuevaVenta productos={productos} locales={locales} tenant={tenant} tenantId={tenantId} onCreado={async(datos)=>{
            const {data:pedido}=await supabase.from("pedidos").insert({tenant_id:tenantId,...datos}).select().single();
            if(datos.lineas&&pedido){await supabase.from("pedido_lineas").insert(datos.lineas.map(l=>({pedido_id:pedido.id,producto_id:l.id,producto_nombre:l.nombre,producto_precio:l.precio,cantidad:l.cantidad})));}
            showToast(`✅ Pedido #${String(pedido?.numero_pedido||0).padStart(4,"0")} creado`);
            await cargar();
          }}/>}
          {vista==="catalogo"&&<Catalogo productos={productos} tenantId={tenantId} onRefresh={cargar} showToast={showToast}/>}
          {vista==="ajustes"&&(
            <div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:20}}>Ajustes</div>
              <div style={{background:"#fff",borderRadius:12,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,.06)",maxWidth:520}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>🔔 Recordatorios automáticos</div>
                <div style={{fontSize:13,color:"#666",marginBottom:16,lineHeight:1.6}}>Cuando está activo, el sistema envía un WhatsApp de recordatorio a cada cliente <strong>el día anterior a las 18:00h</strong> con los detalles de su recogida.</div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div onClick={toggleRecordatorios} style={{width:48,height:26,borderRadius:13,cursor:"pointer",transition:"background .2s",background:tenant?.recordatorios_activos?"#16a34a":"#d1d5db",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,transition:"left .2s",left:tenant?.recordatorios_activos?"26px":"3px",width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
                  </div>
                  <span style={{fontWeight:600,color:tenant?.recordatorios_activos?"#16a34a":"#888"}}>{tenant?.recordatorios_activos?"Activados":"Desactivados"}</span>
                </div>
              </div>
            </div>
          )}
          </>
        }
      </main>
      {modal&&<ModalDetalle pedido={modal} locales={locales} onCerrar={()=>setModal(null)} onCambiar={cambiar} botUrl={BOT_URL}/>}
      <style>{`*{box-sizing:border-box;}body{margin:0;}tr:hover td{background:#fafafa;}`}</style>
    </div>
  );
}

// ── TABLA ─────────────────────────────────────────────────────
function Tabla({pedidos,locales,onVer,onCambiar,soloHora=false}) {
  const multi=locales.length>1;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{borderBottom:"2px solid #f0f0f0"}}>
          {["#","Cliente","Teléfono",multi&&"Local","Recogida","Total","Pago","Estado",""].filter(Boolean).map(h=>(
            <th key={h} style={{padding:"10px 14px",textAlign:"left",color:"#999",fontWeight:700,fontSize:11,whiteSpace:"nowrap",textTransform:"uppercase"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {pedidos.map(p=>(
            <tr key={p.id} style={{borderBottom:"1px solid #f5f5f5"}}>
              <td style={{padding:"11px 14px"}}>
                <div style={{fontWeight:800,color:"#111"}}>#{String(p.numero_pedido).padStart(4,"0")}</div>
                <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,background:p.origen==="tienda"?"#dbeafe":"#dcfce7",color:p.origen==="tienda"?"#1d4ed8":"#15803d"}}>{p.origen==="tienda"?"🏪 Tienda":"📱 WhatsApp"}</span>
              </td>
              <td style={{padding:"11px 14px",fontWeight:600}}>{p.cliente_nombre}</td>
              <td style={{padding:"11px 14px"}}><a href={`https://wa.me/${p.cliente_telefono}`} target="_blank" rel="noreferrer" style={{color:"#25d366",textDecoration:"none",fontWeight:500,fontSize:12}}>📱 {p.cliente_telefono}</a></td>
              {multi&&<td style={{padding:"11px 14px",fontSize:12,color:"#666"}}>{p.local_nombre}</td>}
              <td style={{padding:"11px 14px",whiteSpace:"nowrap",fontSize:12}}>
                {soloHora?<span style={{fontWeight:800,fontSize:16}}>{fmtH(p.hora_recogida)}</span>:<><span style={{fontWeight:600}}>{fmtF(p.fecha_recogida)}</span><br/><span style={{color:"#888"}}>{fmtH(p.hora_recogida)}</span></>}
              </td>
              <td style={{padding:"11px 14px",fontWeight:700}}>{fmt(p.total)}</td>
              <td style={{padding:"11px 14px"}}>
                <div style={{fontSize:11,color:"#666"}}>{PAGO_LABELS[p.pago_metodo]||"—"}</div>
                <button onClick={()=>onCambiar(p.id,{pagado:!p.pagado})} style={{marginTop:3,padding:"2px 8px",borderRadius:10,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:p.pagado?"#dcfce7":"#fee2e2",color:p.pagado?"#16a34a":"#ef4444"}}>{p.pagado?"✅ Pagado":"❌ Pendiente"}</button>
              </td>
              <td style={{padding:"11px 14px"}}><Badge estado={p.estado}/></td>
              <td style={{padding:"11px 14px"}}>
                <div style={{display:"flex",gap:4}}>
                  <Btn onClick={()=>onVer(p)}>Ver</Btn>
                  {p.estado==="confirmado"&&<Btn color="#16a34a" solid onClick={()=>onCambiar(p.id,{estado:"recogido"})}>✅</Btn>}
                  {p.estado!=="cancelado"&&p.estado!=="recogido"&&<Btn color="#ef4444" onClick={()=>onCambiar(p.id,{estado:"cancelado"})}>✕</Btn>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MODAL DETALLE ─────────────────────────────────────────────
function ModalDetalle({pedido:p,onCerrar,onCambiar,botUrl}) {
  const [obsEdit,setObsEdit]=useState(p.observaciones||"");
  const [editObs,setEditObs]=useState(false);
  return (
    <div onClick={onCerrar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:26,maxWidth:480,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.2)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>Pedido #{String(p.numero_pedido).padStart(4,"0")}</div>
            <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{new Date(p.created_at).toLocaleString("es-ES")}</div>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:p.origen==="tienda"?"#dbeafe":"#dcfce7",color:p.origen==="tienda"?"#1d4ed8":"#15803d"}}>{p.origen==="tienda"?"🏪 Creado en tienda":"📱 Pedido por WhatsApp"}</span>
          </div>
          <button onClick={onCerrar} style={{width:28,height:28,borderRadius:"50%",border:"none",background:"#f5f5f5",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {label:"👤 Cliente",val:p.cliente_nombre},
            {label:"📱 Teléfono",val:p.cliente_telefono,link:`https://wa.me/${p.cliente_telefono}`},
            {label:"📍 Local",val:p.local_nombre},
            {label:"📅 Fecha",val:fmtF(p.fecha_recogida)},
            {label:"🕐 Franja",val:fmtH(p.hora_recogida)},
            {label:"💳 Pago",val:PAGO_LABELS[p.pago_metodo]||"—"},
          ].map(f=>(
            <div key={f.label} style={{background:"#f8f8f8",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:10,color:"#aaa",fontWeight:700,marginBottom:2}}>{f.label}</div>
              {f.link?<a href={f.link} target="_blank" rel="noreferrer" style={{fontSize:13,fontWeight:700,color:"#25d366",textDecoration:"none"}}>{f.val}</a>:<div style={{fontSize:13,fontWeight:700}}>{f.val}</div>}
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:8}}>PRODUCTOS</div>
        {(p.lineas||[]).map((l,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5",fontSize:13}}>
            <span>{l.cantidad}× {l.producto}</span><span style={{fontWeight:700}}>{fmt(l.subtotal)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontWeight:800,fontSize:16,marginBottom:14}}>
          <span>Total</span><span>{fmt(p.total)}</span>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:5}}>OBSERVACIONES</div>
          {editObs
            ? <div style={{display:"flex",gap:6}}><input value={obsEdit} onChange={e=>setObsEdit(e.target.value)} style={{flex:1,padding:"7px 10px",borderRadius:7,border:"1px solid #ddd",fontSize:13}}/><Btn color="#16a34a" solid onClick={async()=>{await onCambiar(p.id,{observaciones:obsEdit});setEditObs(false);}}>✓</Btn><Btn onClick={()=>setEditObs(false)}>✕</Btn></div>
            : <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,color:p.observaciones?"#333":"#bbb"}}>{p.observaciones||"Sin observaciones"}</span><Btn onClick={()=>setEditObs(true)}>✏️</Btn></div>}
        </div>
        {p.pago_metodo==="online"&&!p.pagado&&botUrl&&(
          <div style={{background:"#eff6ff",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#1e40af",marginBottom:12}}>
            📲 Link de pago: <a href={`${botUrl}/pagar/${p.id}`} target="_blank" rel="noreferrer" style={{color:"#2563eb"}}>{botUrl}/pagar/{p.id}</a>
          </div>
        )}
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:14}}>
          <Badge estado={p.estado}/>
          <span style={{fontSize:12,color:p.pagado?"#16a34a":"#ef4444",fontWeight:700}}>{p.pagado?"✅ Pagado":"❌ Sin pagar"}</span>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button onClick={()=>onCambiar(p.id,{pagado:!p.pagado})} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #ddd",background:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{p.pagado?"💸 Marcar sin pagar":"💰 Marcar pagado"}</button>
          {(p.estado==="pendiente"||p.estado==="confirmado")&&<button onClick={()=>onCambiar(p.id,{estado:"recogido"})} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#16a34a",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>🎁 Marcar recogido</button>}
          {p.estado!=="cancelado"&&p.estado!=="recogido"&&<button onClick={()=>onCambiar(p.id,{estado:"cancelado"})} style={{padding:"10px 14px",borderRadius:8,border:"1px solid #ef4444",background:"#fff",color:"#ef4444",fontWeight:700,cursor:"pointer"}}>Cancelar</button>}
        </div>
      </div>
    </div>
  );
}

// ── NUEVA VENTA ───────────────────────────────────────────────
function NuevaVenta({productos,locales,tenant,tenantId,onCreado}) {
  const [nombre,setNombre]=useState("");const [tel,setTel]=useState("");const [localSel,setLocalSel]=useState(locales[0]?.nombre||"");const [fecha,setFecha]=useState(hoy());const [franja,setFranja]=useState("07:00-10:00");const [obs,setObs]=useState("");const [pago,setPago]=useState("efectivo");const [lineas,setLineas]=useState([]);const [enviando,setEnviando]=useState(false);
  const franjas=["07:00-10:00","10:00-13:00","13:00-16:00","16:00-20:30"];
  const addLinea=()=>{ if(!productos.length) return; const p=productos[0]; setLineas(l=>[...l,{id:p.id,nombre:p.nombre,precio:p.precio,cantidad:1}]); };
  const updLinea=(i,campo,val)=>setLineas(l=>l.map((x,j)=>j===i?{...x,[campo]:val}:x));
  const delLinea=(i)=>setLineas(l=>l.filter((_,j)=>j!==i));
  const cambiarProd=(i,prodId)=>{ const p=productos.find(x=>x.id===prodId); if(p) setLineas(l=>l.map((x,j)=>j===i?{...x,id:p.id,nombre:p.nombre,precio:p.precio}:x)); };
  const total=lineas.reduce((s,l)=>s+l.precio*l.cantidad,0);
  const pagadoAuto=pago==="efectivo"||pago==="tarjeta";
  const crear=async()=>{
    if(!nombre||!tel||!lineas.length||!fecha||!franja){alert("Completa todos los campos obligatorios");return;}
    setEnviando(true);
    const {data:numData}=await supabase.rpc("siguiente_numero_pedido",{p_tenant_id:tenantId});
    await onCreado({numero_pedido:numData,cliente_nombre:nombre,cliente_telefono:tel.replace(/\D/g,""),local_nombre:localSel,fecha_recogida:fecha,hora_recogida:franja,observaciones:obs||null,estado:"confirmado",origen:"tienda",pago_metodo:pago,pagado:pagadoAuto,total,lineas});
    setNombre("");setTel("");setLineas([]);setObs("");setPago("efectivo");setEnviando(false);
  };
  const pagoOpts=[{id:"efectivo",icon:"💵",label:"Efectivo",sub:"Pagado en mostrador"},{id:"tarjeta",icon:"💳",label:"Tarjeta",sub:"Pagado en mostrador"},{id:"online",icon:"📲",label:"Link online",sub:"Se envía link por WhatsApp"}];
  return (
    <div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Nueva venta en mostrador</div>
      <div style={{fontSize:13,color:"#888",marginBottom:20}}>El cliente recibirá un WhatsApp de confirmación</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
        <div>
          <div style={{background:"#fff",borderRadius:11,padding:18,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>👤 Datos del cliente</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Nombre *"><input style={inputSt} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre completo"/></Field>
              <Field label="Teléfono *"><input style={inputSt} value={tel} onChange={e=>setTel(e.target.value)} placeholder="34612345678" type="tel"/></Field>
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:11,padding:18,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:14}}>🛒 Productos</div>
              <button onClick={addLinea} style={{padding:"5px 12px",background:"#2563eb",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Añadir</button>
            </div>
            {lineas.length===0?<div style={{textAlign:"center",padding:"24px",color:"#aaa",fontSize:13}}>Pulsa "+ Añadir" para añadir productos</div>
            :lineas.map((l,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 34px",gap:8,marginBottom:8}}>
                <select style={inputSt} value={l.id} onChange={e=>cambiarProd(i,e.target.value)}>
                  {productos.map(p=><option key={p.id} value={p.id}>{p.nombre} — {p.precio.toFixed(2)}€</option>)}
                </select>
                <input style={{...inputSt,textAlign:"center"}} type="number" min="1" max="99" value={l.cantidad} onChange={e=>updLinea(i,"cantidad",parseInt(e.target.value)||1)}/>
                <button onClick={()=>delLinea(i)} style={{borderRadius:6,border:"none",background:"#fee2e2",color:"#ef4444",cursor:"pointer",fontWeight:700}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",borderRadius:11,padding:18,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📅 Recogida</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
              <Field label="Local *"><select style={inputSt} value={localSel} onChange={e=>setLocalSel(e.target.value)}>{locales.map(l=><option key={l.id} value={l.nombre}>{l.nombre}</option>)}</select></Field>
              <Field label="Fecha *"><input style={inputSt} type="date" value={fecha} min={hoy()} onChange={e=>setFecha(e.target.value)}/></Field>
              <Field label="Franja *"><select style={inputSt} value={franja} onChange={e=>setFranja(e.target.value)}>{franjas.map(f=><option key={f} value={f}>{f}h</option>)}</select></Field>
            </div>
            <Field label="Observaciones"><textarea style={{...inputSt,minHeight:52,resize:"vertical"}} value={obs} onChange={e=>setObs(e.target.value)} placeholder="Alergias, instrucciones especiales…"/></Field>
          </div>
          <div style={{background:"#fff",borderRadius:11,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>💳 Pago</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {pagoOpts.map(o=><div key={o.id} onClick={()=>setPago(o.id)} style={{padding:"12px 8px",borderRadius:10,border:`2px solid ${pago===o.id?"#2563eb":"#e5e7eb"}`,background:pago===o.id?"#eff4ff":"#fff",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:20}}>{o.icon}</div><div style={{fontSize:12,fontWeight:700,marginTop:4}}>{o.label}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{o.sub}</div>
              </div>)}
            </div>
          </div>
        </div>
        <div style={{position:"sticky",top:24}}>
          <div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.07)"}}>
            <div style={{fontWeight:700,marginBottom:12}}>📋 Resumen</div>
            {lineas.length===0?<div style={{color:"#aaa",fontSize:13,marginBottom:12}}>Sin productos</div>
            :lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid #f5f5f5"}}><span>{l.cantidad}× {l.nombre}</span><span style={{fontWeight:700}}>{(l.cantidad*l.precio).toFixed(2)}€</span></div>)}
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:18,padding:"10px 0 14px"}}><span>Total</span><span>{total.toFixed(2)}€</span></div>
            <button onClick={crear} disabled={enviando} style={{width:"100%",padding:13,background:"#2563eb",color:"#fff",border:"none",borderRadius:9,fontWeight:800,fontSize:14,cursor:enviando?"not-allowed":"pointer",opacity:enviando?.7:1}}>
              {enviando?"Creando...":"✅ Crear pedido y enviar WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CATÁLOGO ──────────────────────────────────────────────────
function Catalogo({productos,tenantId,onRefresh,showToast}) {
  const [modal,setModal]=useState(null);const [busq,setBusq]=useState("");
  const filtrados=productos.filter(p=>!busq||p.nombre.toLowerCase().includes(busq.toLowerCase())||(p.sku||"").toLowerCase().includes(busq.toLowerCase()));
  const guardar=async(datos,id)=>{
    const op=id?supabase.from("productos").update(datos).eq("id",id):supabase.from("productos").insert({tenant_id:tenantId,...datos});
    const{error}=await op;
    if(error){showToast("Error al guardar","error");return;}
    showToast(id?"✅ Producto actualizado":"✅ Producto creado");setModal(null);onRefresh();
  };
  const toggle=async(p)=>{ await supabase.from("productos").update({disponible:!p.disponible}).eq("id",p.id); showToast(p.disponible?"⏸ Desactivado":"✅ Activado"); onRefresh(); };
  const eliminar=async(p)=>{ if(!confirm(`¿Eliminar "${p.nombre}"?`)) return; await supabase.from("productos").delete().eq("id",p.id); showToast("🗑 Eliminado"); onRefresh(); };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:800}}>Catálogo</div>
        <button onClick={()=>setModal({})} style={{padding:"8px 16px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Añadir producto</button>
      </div>
      <input placeholder="🔍 Buscar..." value={busq} onChange={e=>setBusq(e.target.value)} style={{...inputSt,marginBottom:16,maxWidth:300}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
        {filtrados.map(p=>(
          <div key={p.id} style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,.07)",overflow:"hidden",opacity:p.disponible?1:.55}}>
            {p.imagen_url?<img src={p.imagen_url} alt={p.nombre} style={{width:"100%",height:140,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<div style={{height:140,background:"#f0f2f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:"#ccc"}}>📦</div>}
            <div style={{padding:12}}>
              <div style={{fontSize:10,color:"#2563eb",fontWeight:700,marginBottom:2}}>{p.categoria||"Sin categoría"}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{p.nombre}</div>
              {p.sku&&<div style={{fontSize:11,color:"#999",marginBottom:4}}>SKU: {p.sku}</div>}
              <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>{fmt(p.precio)}</div>
              <div style={{display:"flex",gap:5}}>
                <Btn onClick={()=>setModal(p)}>✏️</Btn>
                <Btn onClick={()=>toggle(p)} color={p.disponible?"#d97706":"#16a34a"}>{p.disponible?"⏸":"✅"}</Btn>
                <Btn onClick={()=>eliminar(p)} color="#ef4444">🗑</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal!==null&&<ModalProducto prod={modal} onGuardar={guardar} onCerrar={()=>setModal(null)}/>}
    </div>
  );
}

function ModalProducto({prod,onGuardar,onCerrar}) {
  const [form,setForm]=useState({nombre:prod.nombre||"",categoria:prod.categoria||"",sku:prod.sku||"",precio:prod.precio||"",descripcion:prod.descripcion||"",imagen_url:prod.imagen_url||""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div onClick={onCerrar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,padding:24,maxWidth:460,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><div style={{fontWeight:800,fontSize:17}}>{prod.id?"Editar":"Nuevo producto"}</div><button onClick={onCerrar} style={{width:28,height:28,borderRadius:"50%",border:"none",background:"#f5f5f5",cursor:"pointer"}}>✕</button></div>
        <Field label="Nombre *"><input style={inputSt} value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej: Panetone de Chocolate"/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Categoría *"><input style={inputSt} value={form.categoria} onChange={e=>set("categoria",e.target.value)} placeholder="Ej: Panetones"/></Field>
          <Field label="SKU"><input style={inputSt} value={form.sku} onChange={e=>set("sku",e.target.value)} placeholder="Ej: PAN-001"/></Field>
        </div>
        <Field label="Precio (€) *"><input style={inputSt} type="number" step="0.01" min="0" value={form.precio} onChange={e=>set("precio",e.target.value)} placeholder="25.00"/></Field>
        <Field label="Descripción"><textarea style={{...inputSt,minHeight:64,resize:"vertical"}} value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} placeholder="Descripción breve…"/></Field>
        <Field label="URL imagen">
          <input style={inputSt} value={form.imagen_url} onChange={e=>set("imagen_url",e.target.value)} placeholder="https://..."/>
          {form.imagen_url&&<img src={form.imagen_url} alt="" style={{width:"100%",height:100,objectFit:"cover",borderRadius:7,marginTop:6}} onError={e=>e.target.style.display="none"}/>}
        </Field>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={onCerrar} style={{flex:1,padding:11,borderRadius:8,border:"1px solid #ddd",background:"#fff",fontWeight:700,cursor:"pointer"}}>Cancelar</button>
          <button onClick={()=>{if(!form.nombre||!form.precio){alert("Nombre y precio obligatorios");return;}onGuardar({...form,precio:parseFloat(form.precio),disponible:true},prod.id);}} style={{flex:2,padding:11,borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontWeight:700,cursor:"pointer"}}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── CALENDARIO ────────────────────────────────────────────────
function Calendario({pedidosPorDia,onDiaClick}) {
  const [base,setBase]=useState(()=>{const h=new Date();return new Date(h.getFullYear(),h.getMonth(),1);});
  const a=base.getFullYear(),m=base.getMonth();
  const offset=(new Date(a,m,1).getDay()+6)%7;
  const diasMes=new Date(a,m+1,0).getDate();
  const celdas=[...Array(offset).fill(null),...Array.from({length:diasMes},(_,i)=>i+1)];
  const hoyStr=hoy();
  return (
    <div style={{background:"#fff",borderRadius:12,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,.06)",maxWidth:500}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button onClick={()=>setBase(new Date(a,m-1,1))} style={{padding:"5px 13px",borderRadius:7,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>‹</button>
        <span style={{fontWeight:700,fontSize:15}}>{base.toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setBase(new Date(a,m+1,1))} style={{padding:"5px 13px",borderRadius:7,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,textAlign:"center"}}>
        {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{fontSize:11,fontWeight:700,color:"#aaa",padding:"5px 0"}}>{d}</div>)}
        {celdas.map((d,i)=>{
          if(!d) return <div key={`e${i}`}/>;
          const iso=`${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const n=pedidosPorDia[iso]||0;
          return <div key={iso} onClick={()=>n>0&&onDiaClick(iso)} style={{padding:"7px 3px",borderRadius:7,fontSize:12,fontWeight:n>0?700:400,background:n>0?"#dbeafe":iso===hoyStr?"#f5f5f5":"transparent",color:n>0?"#1d4ed8":"#333",border:iso===hoyStr?"2px solid #2563eb":"2px solid transparent",cursor:n>0?"pointer":"default"}}>
            <div>{d}</div>{n>0&&<div style={{fontSize:9,marginTop:1}}>{n}p</div>}
          </div>;
        })}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
const Card=({title,children})=><div style={{background:"#fff",borderRadius:11,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}><div style={{fontWeight:700,fontSize:14,marginBottom:14}}>{title}</div>{children}</div>;
const Barras=({items,max})=>{const m=max||Math.max(...items.map(i=>i.valor),1);return <div>{items.map(({label,valor,color})=><div key={label} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:4}}><span style={{maxWidth:"70%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span><span style={{color}}>{valor}</span></div><div style={{height:7,background:"#f0f0f0",borderRadius:4}}><div style={{height:"100%",borderRadius:4,background:color,width:`${(valor/m*100).toFixed(0)}%`,transition:"width .4s"}}/></div></div>)}</div>;};
const Empty=({msg})=><div style={{padding:"50px 20px",textAlign:"center",color:"#aaa",fontSize:14}}>📭 {msg}</div>;
