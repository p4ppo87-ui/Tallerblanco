"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://seygknzlruftfezcjpim.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleWdrbnpscnVmdGZlemNqcGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjY3MDQsImV4cCI6MjA5MTAwMjcwNH0.vODo6mIsy2QY2f1Mh5GstMJfQ3U5YmPBxDmmzozorWQ"
);

const fmt = (n: any) => "$" + Number(n || 0).toLocaleString("es-AR");
const today = () => new Date().toISOString().slice(0, 10);
const mesActual = () => new Date().toISOString().slice(0, 7);
const ESTADOS = ["pendiente", "en proceso", "esperando repuesto", "completado"];
const ESTADO_COLOR: Record<string, any> = {
  completado: { bg: "#052e16", text: "#4ade80", border: "#166534" },
  "en proceso": { bg: "#431407", text: "#fb923c", border: "#9a3412" },
  pendiente: { bg: "#1e1b4b", text: "#a5b4fc", border: "#3730a3" },
  "esperando repuesto": { bg: "#422006", text: "#fbbf24", border: "#92400e" },
};
const TOPE_H = 70113407;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: #080c14; }
  :root {
    --bg: #080c14; --surface: #0d1421; --surface2: #111827;
    --border: #1f2937; --border2: #374151;
    --accent: #e55a00; --accent2: #ff7a2f;
    --text: #f1f5f9; --muted: #64748b;
    --green: #4ade80; --red: #f87171; --yellow: #fbbf24; --blue: #60a5fa;
    --font-display: 'Bebas Neue', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }
  .app { min-height: 100vh; background: var(--bg); color: var(--text); font-family: var(--font-mono); max-width: 480px; margin: 0 auto; position: relative; }
  .header { background: linear-gradient(135deg, #0d1421 0%, #111827 100%); border-bottom: 2px solid var(--accent); padding: 16px 20px 12px; position: sticky; top: 0; z-index: 100; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { font-family: var(--font-display); font-size: 28px; letter-spacing: 3px; color: var(--accent); }
  .logo-sub { font-size: 9px; color: var(--muted); letter-spacing: 4px; margin-top: 2px; }
  .header-date { font-size: 10px; color: var(--muted); text-align: right; letter-spacing: 1px; }
  .header-kpis { display: flex; gap: 16px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .header-kpi { flex: 1; }
  .header-kpi-label { font-size: 8px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  .header-kpi-val { font-size: 16px; font-weight: 700; margin-top: 2px; }
  .nav { display: flex; background: var(--surface); border-bottom: 1px solid var(--border); overflow-x: auto; }
  .nav::-webkit-scrollbar { display: none; }
  .nav-btn { flex: none; padding: 10px 16px; font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border: none; background: transparent; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; }
  .nav-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
  .main { padding: 16px; padding-bottom: 100px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .section-title { font-size: 10px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; font-weight: 700; }
  .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
  .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
  .kpi-label { font-size: 8px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  .kpi-val { font-size: 22px; font-weight: 700; margin-top: 4px; line-height: 1; }
  .orden-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 10px; position: relative; overflow: hidden; cursor: pointer; }
  .orden-folio { font-size: 10px; color: var(--accent); font-weight: 700; letter-spacing: 2px; }
  .orden-cliente { font-size: 16px; font-weight: 700; margin: 4px 0 2px; }
  .orden-vehiculo { font-size: 12px; color: var(--muted); }
  .orden-servicio { font-size: 13px; color: var(--text); margin-top: 6px; }
  .orden-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
  .orden-costo { font-size: 20px; font-weight: 700; color: var(--green); }
  .badge { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; border: 1px solid; }
  .fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; background: var(--accent); color: #fff; border: none; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 4px 20px rgba(229,90,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: flex-end; z-index: 300; }
  .modal-box { background: var(--surface); border: 1px solid var(--accent); border-radius: 16px 16px 0 0; padding: 24px 20px 40px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-size: 11px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; font-weight: 700; margin-bottom: 20px; }
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 9px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px; }
  .form-input { background: var(--surface2); border: 1px solid var(--border2); color: var(--text); font-family: var(--font-mono); font-size: 14px; padding: 10px 12px; border-radius: 6px; width: 100%; outline: none; }
  .form-input:focus { border-color: var(--accent); }
  .form-select { background: var(--surface2); border: 1px solid var(--border2); color: var(--text); font-family: var(--font-mono); font-size: 14px; padding: 10px 12px; border-radius: 6px; width: 100%; outline: none; }
  .form-textarea { background: var(--surface2); border: 1px solid var(--border2); color: var(--text); font-family: var(--font-mono); font-size: 13px; padding: 10px 12px; border-radius: 6px; width: 100%; outline: none; resize: vertical; min-height: 70px; }
  .form-textarea:focus { border-color: var(--accent); }
  .btn-row { display: flex; gap: 10px; margin-top: 20px; }
  .btn { flex: 1; padding: 13px; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border: none; border-radius: 6px; cursor: pointer; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-ghost { background: var(--surface2); color: var(--muted); border: 1px solid var(--border2); }
  .btn-danger { background: #7f1d1d; color: var(--red); border: 1px solid #991b1b; }
  .btn-sm { padding: 6px 12px; font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 1px; border: none; border-radius: 4px; cursor: pointer; }
  .search-input { background: var(--surface); border: 1px solid var(--border2); color: var(--text); font-family: var(--font-mono); font-size: 13px; padding: 10px 14px; border-radius: 8px; width: 100%; outline: none; margin-bottom: 14px; }
  .search-input:focus { border-color: var(--accent); }
  .alert-item { background: #422006; border: 1px solid var(--yellow); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; font-size: 12px; }
  .progress-wrap { background: var(--surface2); border-radius: 4px; height: 8px; overflow: hidden; }
  .progress-bar { height: 100%; border-radius: 4px; transition: width 0.4s; }
  .debe-badge { background: #450a0a; border: 1px solid #991b1b; color: var(--red); font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 1px; }
  .view-toggle { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 3px; margin-bottom: 14px; }
  .view-btn { flex: 1; padding: 7px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border: none; background: transparent; color: var(--muted); border-radius: 6px; cursor: pointer; }
  .view-btn.active { background: var(--accent); color: #fff; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .empty { text-align: center; color: var(--muted); font-size: 12px; padding: 40px 20px; letter-spacing: 1px; }
  .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: var(--muted); font-size: 10px; letter-spacing: 1px; }
  .detail-val { text-align: right; max-width: 60%; }
`;

export default function TallerApp() {
  const [tab, setTab] = useState("Inicio");
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [gastos, setGastos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [selectedOrden, setSelectedOrden] = useState<any | null>(null);
  const [ordenesView, setOrdenesView] = useState("rapido");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [o, g, c, i] = await Promise.all([
      supabase.from("ordenes").select("*").order("created_at", { ascending: false }),
      supabase.from("gastos").select("*").order("created_at", { ascending: false }),
      supabase.from("clientes").select("*").order("created_at", { ascending: false }),
      supabase.from("inventario").select("*").order("created_at", { ascending: false }),
    ]);
    setOrdenes(o.data || []);
    setGastos(g.data || []);
    setClientes(c.data || []);
    setInventario(i.data || []);
    setLoading(false);
  }

  const mes = mesActual();
  const ordenesMes = ordenes.filter(o => (o.fecha || "").startsWith(mes));
  const ingresosCobradonMes = ordenesMes.filter(o => o.estado === "completado" && o.cobrado).reduce((s, o) => s + (+o.costo || 0), 0);
  const gastosMes = gastos.filter(g => (g.fecha || "").startsWith(mes)).reduce((s, g) => s + (+g.monto || 0), 0);
  const utilidadMes = ingresosCobradonMes - gastosMes;
  const ordenesActivas = ordenes.filter(o => o.estado !== "completado").length;
  const pendientesCobro = ordenes.filter(o => o.estado === "completado" && !o.cobrado);
  const totalPendienteCobro = pendientesCobro.reduce((s, o) => s + (+o.costo || 0), 0);
  const totalFacturado = ordenes.filter(o => o.cobrado).reduce((s, o) => s + (+o.costo || 0), 0);

  async function addOrden() {
    if (!form.cliente || !form.servicio) return;
    const folio = "OT-" + String(ordenes.length + 1).padStart(3, "0");
    const nuevo = { ...form, folio, fecha: form.fecha || today(), estado: "pendiente", cobrado: false, costo: +form.costo || 0, items: [], costo_mano_obra: +form.costo || 0 };
    const { data, error } = await supabase.from("ordenes").insert([nuevo]).select();
    if (data && !error) {
      setOrdenes(prev => [data[0], ...prev]);
      // Incrementar visitas del cliente
      const cliente = clientes.find(c => (c.nombre || "").toLowerCase().trim() === (form.cliente || "").toLowerCase().trim());
      if (cliente) {
        await supabase.from("clientes").update({ visitas: (cliente.visitas || 0) + 1 }).eq("id", cliente.id);
        setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, visitas: (c.visitas || 0) + 1 } : c));
      }
    }
    setModal(null); setForm({});
  }

  async function addGasto() {
    if (!form.concepto || !form.monto) return;
    if (form._editId) {
      await supabase.from("gastos").update({ concepto: form.concepto, monto: +form.monto, categoria: form.categoria, fecha: form.fecha }).eq("id", form._editId);
      setGastos(prev => prev.map(g => g.id === form._editId ? { ...g, ...form, monto: +form.monto } : g));
    } else {
      const { data, error } = await supabase.from("gastos").insert([{ ...form, monto: +form.monto, fecha: form.fecha || today() }]).select();
      if (data && !error) setGastos(prev => [data[0], ...prev]);
    }
    setModal(null); setForm({});
  }

  async function deleteGasto(id: number) {
    await supabase.from("gastos").delete().eq("id", id);
    setGastos(prev => prev.filter(g => g.id !== id));
  }

  async function addCliente() {
    if (!form.nombre) return;
    if (form._editId) {
      await supabase.from("clientes").update({ nombre: form.nombre, telefono: form.telefono, email: form.email, cuit: form.cuit, vehiculos: form.vehiculos || [] }).eq("id", form._editId);
      setClientes(prev => prev.map(c => c.id === form._editId ? { ...c, ...form } : c));
    } else {
      const { data, error } = await supabase.from("clientes").insert([{ nombre: form.nombre, telefono: form.telefono || "", email: form.email || "", cuit: form.cuit || "", vehiculos: form.vehiculos || [], visitas: 0 }]).select();
      if (data && !error) setClientes(prev => [data[0], ...prev]);
    }
    setModal(null); setForm({});
  }

  async function deleteCliente(id: number) {
    await supabase.from("clientes").delete().eq("id", id);
    setClientes(prev => prev.filter(c => c.id !== id));
  }

  async function cambiarEstado(id: number, estado: string) {
    await supabase.from("ordenes").update({ estado }).eq("id", id);
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado } : o));
    if (selectedOrden?.id === id) setSelectedOrden((prev: any) => ({ ...prev, estado }));
  }

  async function marcarCobrado(id: number) {
    const fecha = today();
    await supabase.from("ordenes").update({ cobrado: true, cobrado_fecha: fecha }).eq("id", id);
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, cobrado: true, cobrado_fecha: fecha } : o));
    if (selectedOrden?.id === id) setSelectedOrden((prev: any) => ({ ...prev, cobrado: true, cobrado_fecha: fecha }));
  }

  async function deleteOrden(id: number) {
    await supabase.from("ordenes").delete().eq("id", id);
    setOrdenes(prev => prev.filter(o => o.id !== id));
    setSelectedOrden(null);
  }

  async function updateOrden(updated: any) {
    const { id, created_at, ...rest } = updated;
    await supabase.from("ordenes").update(rest).eq("id", id);
    setOrdenes(prev => prev.map(o => o.id === id ? updated : o));
    setSelectedOrden(updated);
  }

  async function ajustarStock(id: number, delta: number) {
    const item = inventario.find(i => i.id === id);
    if (!item) return;
    const nueva = Math.max(0, item.cantidad + delta);
    await supabase.from("inventario").update({ cantidad: nueva }).eq("id", id);
    setInventario(prev => prev.map(i => i.id === id ? { ...i, cantidad: nueva } : i));
  }

  async function descontarStock(invId: number, cantidad: number) {
    const item = inventario.find(i => i.id === invId);
    if (!item) return;
    const nueva = Math.max(0, item.cantidad - cantidad);
    await supabase.from("inventario").update({ cantidad: nueva }).eq("id", invId);
    setInventario(prev => prev.map(i => i.id === invId ? { ...i, cantidad: nueva } : i));
  }

  async function agregarItemInventario(nuevoItem: any) {
    const { data, error } = await supabase.from("inventario").insert([nuevoItem]).select();
    if (data && !error) setInventario(prev => [data[0], ...prev]);
  }

  async function eliminarItemInventario(id: number) {
    await supabase.from("inventario").delete().eq("id", id);
    setInventario(prev => prev.filter(i => i.id !== id));
  }

  const TABS = ["Inicio", "Órdenes", "Finanzas", "Clientes", "Inventario"];
  const filteredOrdenes = ordenes.filter(o =>
    !search ||
    (o.cliente || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.vehiculo || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.folio || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#e55a00", fontSize: 14, letterSpacing: 3 }}>CARGANDO...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div>
              <div className="logo">TALLER BLANCO</div>
              <div className="logo-sub">SISTEMA DE GESTIÓN</div>
            </div>
            <div className="header-date">
              {new Date().toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
            </div>
          </div>
          <div className="header-kpis">
            <div className="header-kpi">
              <div className="header-kpi-label">Este mes</div>
              <div className="header-kpi-val" style={{ color: utilidadMes >= 0 ? "#4ade80" : "#f87171" }}>{fmt(utilidadMes)}</div>
            </div>
            <div className="header-kpi">
              <div className="header-kpi-label">Activas</div>
              <div className="header-kpi-val" style={{ color: "#fb923c" }}>{ordenesActivas}</div>
            </div>
            <div className="header-kpi" style={{ cursor: totalPendienteCobro > 0 ? "pointer" : "default" }} onClick={() => totalPendienteCobro > 0 && setModal("acobrar")}>
              <div className="header-kpi-label">A cobrar {totalPendienteCobro > 0 ? "▼" : ""}</div>
              <div className="header-kpi-val" style={{ color: totalPendienteCobro > 0 ? "#f87171" : "#64748b" }}>{fmt(totalPendienteCobro)}</div>
            </div>
          </div>
        </div>

        <div className="nav">
          {TABS.map(t => (
            <button key={t} className={`nav-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="main">
          {tab === "Inicio" && <TabInicio ordenes={ordenes} ordenesMes={ordenesMes} ingresosCobradonMes={ingresosCobradonMes} gastosMes={gastosMes} utilidadMes={utilidadMes} ordenesActivas={ordenesActivas} pendientesCobro={pendientesCobro} totalPendienteCobro={totalPendienteCobro} totalFacturado={totalFacturado} inventario={inventario} setModal={setModal} setSelectedOrden={setSelectedOrden} marcarCobrado={marcarCobrado} />}
          {tab === "Órdenes" && <TabOrdenes ordenes={filteredOrdenes} search={search} setSearch={setSearch} ordenesView={ordenesView} setOrdenesView={setOrdenesView} setSelectedOrden={setSelectedOrden} />}
          {tab === "Finanzas" && <TabFinanzas ordenes={ordenes} gastos={gastos} setModal={setModal} setForm={setForm} deleteGasto={deleteGasto} />}
          {tab === "Clientes" && <TabClientes clientes={clientes} ordenes={ordenes} setModal={setModal} setForm={setForm} deleteCliente={deleteCliente} />}
          {tab === "Inventario" && <TabInventario inventario={inventario} ajustarStock={ajustarStock} agregarItem={agregarItemInventario} eliminarItem={eliminarItemInventario} />}
        </div>

        {(tab === "Órdenes" || tab === "Inicio") && <button className="fab" onClick={() => { setForm({ fecha: today() }); setModal("orden"); }}>+</button>}
        {tab === "Finanzas" && <button className="fab" onClick={() => { setForm({ fecha: today() }); setModal("gasto"); }}>+</button>}
        {tab === "Clientes" && <button className="fab" onClick={() => { setForm({}); setModal("cliente"); }}>+</button>}

        {modal === "orden" && <ModalOrden form={form} setForm={setForm} onSave={addOrden} onClose={() => { setModal(null); setForm({}); }} clientes={clientes} />}
        {modal === "gasto" && <ModalGasto form={form} setForm={setForm} onSave={addGasto} onClose={() => { setModal(null); setForm({}); }} />}
        {modal === "cliente" && <ModalCliente form={form} setForm={setForm} onSave={addCliente} onClose={() => { setModal(null); setForm({}); }} />}
        {modal === "acobrar" && <ModalACobrar pendientes={pendientesCobro} total={totalPendienteCobro} onCobrar={marcarCobrado} onClose={() => setModal(null)} onVerOrden={(o: any) => { setModal(null); setSelectedOrden(o); }} />}

        {selectedOrden && (
          <OrdenDetail
            orden={selectedOrden}
            onClose={() => setSelectedOrden(null)}
            cambiarEstado={cambiarEstado}
            marcarCobrado={marcarCobrado}
            onDelete={deleteOrden}
            onUpdate={updateOrden}
            inventario={inventario}
            descontarStock={descontarStock}
          />
        )}
      </div>
    </>
  );
}

function TabInicio({ ordenes, ordenesMes, ingresosCobradonMes, gastosMes, utilidadMes, ordenesActivas, pendientesCobro, totalPendienteCobro, totalFacturado, inventario, setModal, setSelectedOrden, marcarCobrado }: any) {
  const margen = ingresosCobradonMes > 0 ? Math.round((utilidadMes / ingresosCobradonMes) * 100) : 0;
  const ticketProm = ordenesMes.filter((o: any) => o.estado === "completado" && o.cobrado).length
    ? Math.round(ingresosCobradonMes / ordenesMes.filter((o: any) => o.estado === "completado" && o.cobrado).length) : 0;
  const pctTope = Math.min(100, Math.round((totalFacturado / TOPE_H) * 100));
  const topeColor = pctTope >= 80 ? "#f87171" : pctTope >= 60 ? "#fbbf24" : "#4ade80";
  const activas = ordenes.filter((o: any) => o.estado !== "completado").slice(0, 3);
  const stockBajo = inventario.filter((i: any) => i.cantidad <= i.minimo).length;

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: "3px solid #4ade80" }}><div className="kpi-label">Cobrado mes</div><div className="kpi-val" style={{ color: "#4ade80", fontSize: 18 }}>{fmt(ingresosCobradonMes)}</div></div>
        <div className="kpi-card" style={{ borderLeft: "3px solid #f87171" }}><div className="kpi-label">Gastos mes</div><div className="kpi-val" style={{ color: "#f87171", fontSize: 18 }}>{fmt(gastosMes)}</div></div>
        <div className="kpi-card" style={{ borderLeft: `3px solid ${utilidadMes >= 0 ? "#fb923c" : "#f87171"}` }}><div className="kpi-label">Utilidad neta</div><div className="kpi-val" style={{ color: utilidadMes >= 0 ? "#fb923c" : "#f87171", fontSize: 18 }}>{fmt(utilidadMes)}</div></div>
        <div className="kpi-card" style={{ borderLeft: "3px solid #60a5fa" }}><div className="kpi-label">Ticket prom.</div><div className="kpi-val" style={{ color: "#60a5fa", fontSize: 18 }}>{fmt(ticketProm)}</div></div>
      </div>

      {pendientesCobro.length > 0 && (
        <div className="card" style={{ borderColor: "#991b1b", background: "#0d0707" }}>
          <div className="section-title" style={{ color: "#f87171" }}>⚠ Por cobrar ({pendientesCobro.length})</div>
          {pendientesCobro.slice(0, 3).map((o: any) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{o.cliente}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{o.folio} · {o.servicio}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171" }}>{fmt(o.costo)}</div>
                <button className="btn-sm btn-primary" style={{ marginTop: 4 }} onClick={() => { marcarCobrado(o.id).then(() => onClose()); }}>✓ Cobrar</button>
              </div>
            </div>
          ))}
          {pendientesCobro.length > 3 && <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, textAlign: "center" }}>+{pendientesCobro.length - 3} más — <span style={{ color: "#e55a00", cursor: "pointer" }} onClick={() => setModal("acobrar")}>Ver todos</span></div>}
        </div>
      )}

      <div className="card">
        <div className="section-title">Órdenes activas</div>
        {activas.length === 0 && <div className="empty">Sin órdenes activas</div>}
        {activas.map((o: any) => {
          const ec = ESTADO_COLOR[o.estado] || ESTADO_COLOR.pendiente;
          return (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1f2937", cursor: "pointer" }} onClick={() => setSelectedOrden(o)}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{o.cliente}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{o.vehiculo} · {o.folio}</div>
              </div>
              <span className="badge" style={{ background: ec.bg, color: ec.text, borderColor: ec.border }}>{o.estado}</span>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="section-title">Tope Monotributo Cat. H</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: "#64748b" }}>Facturado: {fmt(totalFacturado)}</span>
          <span style={{ color: topeColor, fontWeight: 700 }}>{pctTope}%</span>
        </div>
        <div className="progress-wrap"><div className="progress-bar" style={{ width: `${pctTope}%`, background: topeColor }} /></div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>Tope: {fmt(TOPE_H)}</div>
      </div>

      {stockBajo > 0 && (
        <div className="card" style={{ borderColor: "#92400e" }}>
          <div className="section-title" style={{ color: "#fbbf24" }}>⚠ Stock bajo</div>
          {inventario.filter((i: any) => i.cantidad <= i.minimo).map((i: any) => (
            <div key={i.id} className="alert-item"><strong>{i.nombre}</strong> — {i.cantidad} {i.unidad} (mín. {i.minimo})</div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabOrdenes({ ordenes, search, setSearch, ordenesView, setOrdenesView, setSelectedOrden }: any) {
  return (
    <div>
      <input className="search-input" placeholder="Buscar cliente, vehículo, folio..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="view-toggle">
        <button className={`view-btn ${ordenesView === "rapido" ? "active" : ""}`} onClick={() => setOrdenesView("rapido")}>Rápido</button>
        <button className={`view-btn ${ordenesView === "completo" ? "active" : ""}`} onClick={() => setOrdenesView("completo")}>Completo</button>
      </div>
      {ordenes.length === 0 && <div className="empty">No hay órdenes aún.<br />Tocá + para crear una.</div>}
      {ordenesView === "rapido" && ordenes.map((o: any) => {
        const ec = ESTADO_COLOR[o.estado] || ESTADO_COLOR.pendiente;
        return (
          <div key={o.id} className="orden-card" onClick={() => setSelectedOrden(o)}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: ec.border }} />
            <div style={{ paddingLeft: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="orden-folio">{o.folio}</div>
                  <div className="orden-cliente">{o.cliente}</div>
                  <div className="orden-vehiculo">{o.vehiculo} {o.placa ? `· ${o.placa}` : ""}</div>
                </div>
                <span className="badge" style={{ background: ec.bg, color: ec.text, borderColor: ec.border }}>{o.estado}</span>
              </div>
              <div className="orden-servicio">{o.servicio}</div>
              <div className="orden-bottom">
                <div className="orden-costo">{fmt(o.costo)}</div>
                {o.estado === "completado" && !o.cobrado && <span className="debe-badge">SIN COBRAR</span>}
                {o.cobrado && <span style={{ fontSize: 10, color: "#4ade80" }}>✓ Cobrado</span>}
              </div>
            </div>
          </div>
        );
      })}
      {ordenesView === "completo" && (
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
              <thead>
                <tr>{["Folio","Cliente","Vehículo","Servicio","Costo","Estado","Cobrado"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 9, letterSpacing: 2, color: "#64748b", borderBottom: "1px solid #1f2937" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {ordenes.map((o: any) => {
                  const ec = ESTADO_COLOR[o.estado] || ESTADO_COLOR.pendiente;
                  return (
                    <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSelectedOrden(o)}>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937", color: "#e55a00", fontWeight: 700 }}>{o.folio}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937", fontWeight: 700 }}>{o.cliente}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937", color: "#94a3b8" }}>{o.vehiculo}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937" }}>{o.servicio}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937", color: "#4ade80", fontWeight: 700 }}>{fmt(o.costo)}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937" }}><span className="badge" style={{ background: ec.bg, color: ec.text, borderColor: ec.border }}>{o.estado}</span></td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #1f2937", color: o.cobrado ? "#4ade80" : "#f87171" }}>{o.cobrado ? "✓" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TabFinanzas({ ordenes, gastos, setModal, setForm, deleteGasto }: any) {
  const [mesFiltro, setMesFiltro] = useState(mesActual());
  const [vistaComparativa, setVistaComparativa] = useState(false);

  function gananciaOrden(o: any) {
    const items = o.items || [];
    const costoRepuestos = items.reduce((s: number, i: any) => s + ((+i.costo_compra || +i.costoCompra || 0) * +i.cantidad), 0);
    const ventaRepuestos = items.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    const manoObra = +o.costo_mano_obra || Math.max(0, (+o.costo || 0) - ventaRepuestos);
    return manoObra + (ventaRepuestos - costoRepuestos);
  }

  const mesesConDatos = (() => {
    const set = new Set<string>();
    ordenes.forEach((o: any) => { if (o.fecha) set.add(o.fecha.slice(0, 7)); });
    gastos.forEach((g: any) => { if (g.fecha) set.add(g.fecha.slice(0, 7)); });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  })();

  const ordenesMesCobradas = ordenes.filter((o: any) => (o.cobrado || o.estado === "completado") && (o.fecha || "").startsWith(mesFiltro));
  const ingresosDelMes = ordenesMesCobradas.reduce((s: number, o: any) => s + (+o.costo || 0), 0);
  const costoRepuestosMes = ordenesMesCobradas.reduce((s: number, o: any) => s + (o.items || []).reduce((ss: number, i: any) => ss + ((+i.costoCompra || 0) * +i.cantidad), 0), 0);
  const gananciaRealMes = ordenesMesCobradas.reduce((s: number, o: any) => s + gananciaOrden(o), 0);
  const gastosDelMes = gastos.filter((g: any) => (g.fecha || "").startsWith(mesFiltro)).reduce((s: number, g: any) => s + (+g.monto || 0), 0);
  const utilidadRealMes = gananciaRealMes - gastosDelMes;
  const gastosMesArr = gastos.filter((g: any) => (g.fecha || "").startsWith(mesFiltro));
  const gastosCat: Record<string, number> = {};
  gastosMesArr.forEach((g: any) => { gastosCat[g.categoria || "otro"] = (gastosCat[g.categoria || "otro"] || 0) + g.monto; });

  const ultimos6 = mesesConDatos.slice(0, 6).map(m => {
    const ords = ordenes.filter((o: any) => (o.cobrado || o.estado === "completado") && (o.fecha || "").startsWith(m));
    const ing = ords.reduce((s: number, o: any) => s + (+o.costo || 0), 0);
    const gan = ords.reduce((s: number, o: any) => s + gananciaOrden(o), 0);
    const gas = gastos.filter((g: any) => (g.fecha || "").startsWith(m)).reduce((s: number, g: any) => s + (+g.monto || 0), 0);
    return { mes: m, ingresos: ing, gastos: gas, gananciaReal: gan - gas };
  });

  const labelMes = (m: string) => {
    const [y, mo] = m.split("-");
    const nombres = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${nombres[+mo - 1]} ${y}`;
  };

  return (
    <div>
      <div className="view-toggle">
        <button className={`view-btn ${!vistaComparativa ? "active" : ""}`} onClick={() => setVistaComparativa(false)}>Por mes</button>
        <button className={`view-btn ${vistaComparativa ? "active" : ""}`} onClick={() => setVistaComparativa(true)}>Comparar</button>
      </div>

      {vistaComparativa && (
        <div>
          <div className="card">
            <div className="section-title">Últimos {ultimos6.length} meses</div>
            {ultimos6.map(({ mes, ingresos, gastos: gas, gananciaReal }) => {
              const positivo = gananciaReal >= 0;
              return (
                <div key={mes} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: mes === mesActual() ? "#e55a00" : "#f1f5f9" }}>{labelMes(mes)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: positivo ? "#4ade80" : "#f87171" }}>{fmt(gananciaReal)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                    <span>↑ {fmt(ingresos)}</span><span>↓ {fmt(gas)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!vistaComparativa && (
        <div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Mes a ver</label>
            <select className="form-select" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
              {mesesConDatos.length === 0
                ? <option value={mesActual()}>{labelMes(mesActual())}</option>
                : mesesConDatos.map(m => <option key={m} value={m}>{labelMes(m)}{m === mesActual() ? " (actual)" : ""}</option>)
              }
            </select>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card" style={{ borderLeft: "3px solid #4ade80" }}><div className="kpi-label">Facturado</div><div className="kpi-val" style={{ color: "#4ade80", fontSize: 18 }}>{fmt(ingresosDelMes)}</div></div>
            <div className="kpi-card" style={{ borderLeft: "3px solid #f87171" }}><div className="kpi-label">Gastos</div><div className="kpi-val" style={{ color: "#f87171", fontSize: 18 }}>{fmt(gastosDelMes)}</div></div>
            {costoRepuestosMes > 0 && <div className="kpi-card" style={{ borderLeft: "3px solid #f87171" }}><div className="kpi-label">Costo repuestos</div><div className="kpi-val" style={{ color: "#f87171", fontSize: 18 }}>− {fmt(costoRepuestosMes)}</div></div>}
            <div className="kpi-card" style={{ borderLeft: `3px solid ${utilidadRealMes >= 0 ? "#fb923c" : "#f87171"}` }}><div className="kpi-label">Ganancia real</div><div className="kpi-val" style={{ color: utilidadRealMes >= 0 ? "#fb923c" : "#f87171", fontSize: 18 }}>{fmt(utilidadRealMes)}</div></div>
          </div>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Gastos por categoría</div>
              {mesFiltro === mesActual() && <button className="btn-sm btn-primary" onClick={() => { setForm({ fecha: today() }); setModal("gasto"); }}>+ Gasto</button>}
            </div>
            {Object.entries(gastosCat).map(([cat, total]: any) => {
              const pct = gastosDelMes > 0 ? Math.round((total / gastosDelMes) * 100) : 0;
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ textTransform: "capitalize", color: "#94a3b8" }}>{cat}</span>
                    <span style={{ color: "#e55a00" }}>{fmt(total)} ({pct}%)</span>
                  </div>
                  <div className="progress-wrap"><div className="progress-bar" style={{ width: `${pct}%`, background: "#e55a00" }} /></div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="section-title">Detalle gastos</div>
            {gastosMesArr.length === 0 && <div style={{ fontSize: 12, color: "#64748b" }}>Sin gastos este mes</div>}
            {gastosMesArr.map((g: any) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{g.concepto}</div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "capitalize" }}>{g.categoria} · {g.fecha}</div>
                </div>
                <span style={{ color: "#f87171", fontWeight: 700, fontSize: 13 }}>{fmt(g.monto)}</span>
                <button className="btn-sm" style={{ background: "#1e293b", color: "#94a3b8" }} onClick={() => { setForm({ _editId: g.id, concepto: g.concepto, monto: g.monto, categoria: g.categoria, fecha: g.fecha }); setModal("gasto"); }}>✏</button>
                <button className="btn-sm" style={{ background: "#7f1d1d", color: "#f87171" }} onClick={() => deleteGasto(g.id)}>🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabClientes({ clientes, ordenes, setModal, setForm, deleteCliente }: any) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtrados = clientes.filter((c: any) =>
    !search || (c.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono || "").includes(search) || (c.cuit || "").includes(search)
  );

  return (
    <div>
      <input className="search-input" placeholder="Buscar por nombre, teléfono o CUIT..." value={search} onChange={e => setSearch(e.target.value)} />
      {filtrados.length === 0 && <div className="empty">{search ? "Sin resultados." : "No hay clientes.\nTocá + para agregar."}</div>}
      {filtrados.map((c: any) => {
        const ordenesCliente = ordenes.filter((o: any) => (o.cliente || "").toLowerCase().trim() === (c.nombre || "").toLowerCase().trim());
        const totalHistorico = ordenesCliente.filter((o: any) => o.cobrado).reduce((s: number, o: any) => s + (+o.costo || 0), 0);
        const isExpanded = expanded === c.id;
        return (
          <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: 14, cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : c.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e55a00" }}>{c.nombre}</div>
                  {c.telefono && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>📞 {c.telefono}</div>}
                  {c.email && <div style={{ fontSize: 12, color: "#94a3b8" }}>✉ {c.email}</div>}
                  {c.cuit && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>ID: {c.cuit}</div>}
                </div>
                <div style={{ textAlign: "right", marginLeft: 12 }}>
                  <div style={{ fontSize: 10, color: "#64748b" }}>VISITAS</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>{ordenesCliente.length}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</div>
                </div>
              </div>
              {totalHistorico > 0 && <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Total histórico: <span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(totalHistorico)}</span></div>}
            </div>
            {isExpanded && (
              <div style={{ borderTop: "1px solid #1f2937" }}>
                {ordenesCliente.length > 0 ? (
                  <div style={{ padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>ÓRDENES</div>
                    {ordenesCliente.map((o: any) => {
                      const ec = ESTADO_COLOR[o.estado] || ESTADO_COLOR.pendiente;
                      return (
                        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1f2937" }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#e55a00" }}>{o.folio}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{o.servicio} · {o.fecha}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: o.cobrado ? "#4ade80" : "#f87171" }}>{fmt(o.costo)}</div>
                            <span className="badge" style={{ background: ec.bg, color: ec.text, borderColor: ec.border }}>{o.estado}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>Sin órdenes aún</div>}
                <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #1f2937" }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: "9px" }} onClick={() => { setForm({ _editId: c.id, nombre: c.nombre, telefono: c.telefono || "", email: c.email || "", cuit: c.cuit || "", vehiculos: c.vehiculos || [] }); setModal("cliente"); }}>✏ Editar</button>
                  <button className="btn btn-danger" style={{ flex: 1, padding: "9px" }} onClick={() => { if (confirm("¿Eliminar cliente?")) deleteCliente(c.id); }}>🗑 Eliminar</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TabInventario({ inventario, ajustarStock, agregarItem, eliminarItem }: any) {
  const [vista, setVista] = useState("stock");
  const [nuevoItem, setNuevoItem] = useState({ nombre: "", cantidad: 1, unidad: "pza", precio: 0, costo_compra: 0, minimo: 2, categoria: "" });

  function agregarItemManual() {
    if (!nuevoItem.nombre) return;
    agregarItem({ ...nuevoItem, cantidad: +nuevoItem.cantidad, precio: +nuevoItem.precio, costo_compra: +nuevoItem.costo_compra, minimo: +nuevoItem.minimo });
    setNuevoItem({ nombre: "", cantidad: 1, unidad: "pza", precio: 0, costo_compra: 0, minimo: 2, categoria: "" });
    setVista("stock");
  }

  return (
    <div>
      <div className="view-toggle">
        <button className={`view-btn ${vista === "stock" ? "active" : ""}`} onClick={() => setVista("stock")}>Stock</button>
        <button className={`view-btn ${vista === "agregar" ? "active" : ""}`} onClick={() => setVista("agregar")}>+ Agregar</button>
      </div>

      {vista === "stock" && (
        <>
          {inventario.filter((i: any) => i.cantidad <= i.minimo).length > 0 && (
            <div className="card" style={{ borderColor: "#92400e" }}>
              <div className="section-title" style={{ color: "#fbbf24" }}>⚠ Stock bajo</div>
              {inventario.filter((i: any) => i.cantidad <= i.minimo).map((i: any) => (
                <div key={i.id} className="alert-item"><strong>{i.nombre}</strong> — {i.cantidad} {i.unidad} (mín. {i.minimo})</div>
              ))}
            </div>
          )}
          <div className="card">
            <div className="section-title">Inventario</div>
            {inventario.length === 0 && <div className="empty">Sin ítems. Agregá uno manualmente.</div>}
            {inventario.map((i: any) => {
              const bajo = i.cantidad <= i.minimo;
              return (
                <div key={i.id} style={{ padding: "12px 0", borderBottom: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{i.nombre}</div>
                      <div style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>
                        {i.categoria || "—"} · Costo: {fmt(i.costo_compra || i.precio)} · Venta: {fmt(i.precio)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: bajo ? "#f87171" : "#4ade80" }}>{i.cantidad}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{i.unidad}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <button className="btn-sm" style={{ background: "#7f1d1d", color: "#f87171" }} onClick={() => ajustarStock(i.id, -1)}>−</button>
                    <button className="btn-sm btn-primary" onClick={() => ajustarStock(i.id, +1)}>+</button>
                    <span style={{ fontSize: 10, color: "#64748b" }}>mín. {i.minimo} {i.unidad}</span>
                    <button className="btn-sm" style={{ background: "#1f2937", color: "#f87171", marginLeft: "auto" }} onClick={() => { if (confirm("¿Eliminar?")) eliminarItem(i.id); }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {vista === "agregar" && (
        <div className="card">
          <div className="section-title">Nuevo ítem</div>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={nuevoItem.nombre} onChange={e => setNuevoItem(p => ({ ...p, nombre: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="form-group"><label className="form-label">Cantidad inicial</label><input className="form-input" type="number" value={nuevoItem.cantidad} onChange={e => setNuevoItem(p => ({ ...p, cantidad: +e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Unidad</label>
              <select className="form-select" value={nuevoItem.unidad} onChange={e => setNuevoItem(p => ({ ...p, unidad: e.target.value }))}>
                {["pza","lt","kg","juego","mt","set"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Costo compra ($)</label>
              <input className="form-input" type="number" value={nuevoItem.costo_compra}
                onChange={e => {
                  const costo = +e.target.value;
                  setNuevoItem(p => ({ ...p, costo_compra: +e.target.value, precio: costo > 0 ? Math.round(costo * 1.30) : p.precio }));
                }} placeholder="Lo que pagaste" />
            </div>
            <div className="form-group">
              <label className="form-label">Precio venta ($)</label>
              <input className="form-input" type="number" value={nuevoItem.precio}
                onChange={e => {
                  const venta = +e.target.value;
                  setNuevoItem(p => ({ ...p, precio: +e.target.value, costo_compra: venta > 0 ? Math.round(venta / 1.30) : p.costo_compra }));
                }} placeholder="Lo que cobrás" />
            </div>
          </div>
          {nuevoItem.costo_compra > 0 && nuevoItem.precio > 0 && (
            <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12 }}>
              <span style={{ color: "#64748b" }}>Ganancia: </span><span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(nuevoItem.precio - nuevoItem.costo_compra)}</span>
              <span style={{ color: "#64748b" }}> · Markup: </span><span style={{ color: "#fbbf24", fontWeight: 700 }}>{Math.round(((nuevoItem.precio - nuevoItem.costo_compra) / nuevoItem.costo_compra) * 100)}%</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="form-group"><label className="form-label">Stock mínimo</label><input className="form-input" type="number" value={nuevoItem.minimo} onChange={e => setNuevoItem(p => ({ ...p, minimo: +e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Categoría</label>
              <select className="form-select" value={nuevoItem.categoria} onChange={e => setNuevoItem(p => ({ ...p, categoria: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {["lubricantes","filtros","frenos","encendido","suspensión","electricidad","repuestos","otro"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={agregarItemManual}>Agregar al inventario</button>
        </div>
      )}
    </div>
  );
}

function ModalOrden({ form, setForm, onSave, onClose, clientes }: any) {
  const f = (k: string) => (v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const [showSugerencias, setShowSugerencias] = useState(false);
  const sugerencias = clientes.filter((c: any) => form.cliente && (c.nombre || "").toLowerCase().includes((form.cliente || "").toLowerCase()) && (c.nombre || "").toLowerCase() !== (form.cliente || "").toLowerCase());
  const clienteRegistrado = clientes.find((c: any) => (c.nombre || "").toLowerCase().trim() === (form.cliente || "").toLowerCase().trim());
  const vehiculosCliente = clienteRegistrado?.vehiculos || [];

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">Nueva Orden de Trabajo</div>
        <div className="form-group">
          <label className="form-label">Cliente *</label>
          <input className="form-input" value={form.cliente || ""} onChange={e => { f("cliente")(e.target.value); setShowSugerencias(true); }} placeholder="Nombre del cliente" autoComplete="off" />
          {showSugerencias && sugerencias.length > 0 && (
            <div style={{ background: "#1e293b", border: "1px solid #374151", borderRadius: 6, marginTop: 4 }}>
              {sugerencias.map((c: any) => (
                <div key={c.id} onClick={() => { setForm((p: any) => ({ ...p, cliente: c.nombre })); setShowSugerencias(false); }} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #374151" }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{c.nombre}</span>
                  {c.telefono && <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>{c.telefono}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Vehículo</label>
          {vehiculosCliente.length > 0 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {vehiculosCliente.map((v: any) => {
                  const sel = form.vehiculo === v.descripcion;
                  return (
                    <div key={v.id} onClick={() => setForm((p: any) => ({ ...p, vehiculo: v.descripcion, placa: v.patente || "" }))} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: sel ? "#1e3a5f" : "#111827", border: `1px solid ${sel ? "#3b82f6" : "#374151"}`, borderRadius: 6, cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#60a5fa" : "#f1f5f9" }}>{v.descripcion}</div>
                        {v.patente && <div style={{ fontSize: 11, color: "#64748b" }}>{v.patente}</div>}
                      </div>
                      {sel && <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
              <input className="form-input" value={form.vehiculo || ""} onChange={e => f("vehiculo")(e.target.value)} placeholder="O escribí otro vehículo" />
            </>
          ) : (
            <input className="form-input" value={form.vehiculo || ""} onChange={e => f("vehiculo")(e.target.value)} placeholder="Ej: Toyota Corolla 2020" />
          )}
        </div>
        <div className="form-group"><label className="form-label">Placa / Patente</label><input className="form-input" value={form.placa || ""} onChange={e => f("placa")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Trabajo a realizar *</label><input className="form-input" value={form.servicio || ""} onChange={e => f("servicio")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Diagnóstico / Notas técnicas</label><textarea className="form-textarea" value={form.diagnostico || ""} onChange={e => f("diagnostico")(e.target.value)} /></div>
        <div className="form-group">
          <label className="form-label">Mecánico asignado</label>
          <select className="form-select" value={form.mecanico || ""} onChange={e => f("mecanico")(e.target.value)}>
            <option value="">Sin asignar</option>
            <option value="Papá">Papá</option>
            <option value="Hermano">Hermano</option>
            <option value="Yo">Yo</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Costo estimado ($)</label><input className="form-input" type="number" value={form.costo || ""} onChange={e => f("costo")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.fecha || ""} onChange={e => f("fecha")(e.target.value)} /></div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ModalGasto({ form, setForm, onSave, onClose }: any) {
  const f = (k: string) => (v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">{form._editId ? "Editar Gasto" : "Registrar Gasto"}</div>
        <div className="form-group"><label className="form-label">Concepto *</label><input className="form-input" value={form.concepto || ""} onChange={e => f("concepto")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Monto ($) *</label><input className="form-input" type="number" value={form.monto || ""} onChange={e => f("monto")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Categoría</label>
          <select className="form-select" value={form.categoria || ""} onChange={e => f("categoria")(e.target.value)}>
            <option value="">Seleccionar...</option>
            {["insumos","fijo","servicios","equipo","repuestos","otro"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.fecha || ""} onChange={e => f("fecha")(e.target.value)} /></div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ModalCliente({ form, setForm, onSave, onClose }: any) {
  const f = (k: string) => (v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ descripcion: "", patente: "" });
  const vehiculos = form.vehiculos || [];

  function agregarVehiculo() {
    if (!nuevoVehiculo.descripcion) return;
    const v = { id: Date.now(), ...nuevoVehiculo };
    setForm((p: any) => ({ ...p, vehiculos: [...(p.vehiculos || []), v] }));
    setNuevoVehiculo({ descripcion: "", patente: "" });
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-title">{form._editId ? "Editar Cliente" : "Nuevo Cliente"}</div>
        <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={form.nombre || ""} onChange={e => f("nombre")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.telefono || ""} onChange={e => f("telefono")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email || ""} onChange={e => f("email")(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">CUIT / DNI</label><input className="form-input" value={form.cuit || ""} onChange={e => f("cuit")(e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Vehículos</div>
          {vehiculos.map((v: any) => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1f2937" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700 }}>{v.descripcion}</div>{v.patente && <div style={{ fontSize: 11, color: "#64748b" }}>{v.patente}</div>}</div>
              <button className="btn-sm" style={{ background: "#7f1d1d", color: "#f87171" }} onClick={() => setForm((p: any) => ({ ...p, vehiculos: (p.vehiculos || []).filter((vv: any) => vv.id !== v.id) }))}>🗑</button>
            </div>
          ))}
          <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><label className="form-label">Modelo</label><input className="form-input" value={nuevoVehiculo.descripcion} onChange={e => setNuevoVehiculo(p => ({ ...p, descripcion: e.target.value }))} placeholder="Ej: Toyota Corolla" /></div>
              <div><label className="form-label">Patente</label><input className="form-input" value={nuevoVehiculo.patente} onChange={e => setNuevoVehiculo(p => ({ ...p, patente: e.target.value }))} placeholder="ABC123" /></div>
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", padding: "8px" }} onClick={agregarVehiculo}>+ Agregar vehículo</button>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function OrdenDetail({ orden, onClose, cambiarEstado, marcarCobrado, onDelete, onUpdate, inventario, descontarStock }: any) {
  const [mode, setMode] = useState("ver");
  const [o, setO] = useState(() => {
    const items = orden.items || [];
    const totalItemsInit = items.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    const costoMO = orden.costo_mano_obra !== undefined ? +orden.costo_mano_obra : Math.max(0, (+orden.costo || 0) - totalItemsInit);
    return { ...orden, items, costo_mano_obra: costoMO };
  });
  const [newItem, setNewItem] = useState({ descripcion: "", cantidad: 1, precio: "", costo_compra: "" });
  const [itemMode, setItemMode] = useState("manual");

  const totalItems = o.items.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
  const totalCostoItems = o.items.reduce((s: number, i: any) => s + ((+i.costo_compra || 0) * +i.cantidad), 0);
  const gananciaItems = totalItems - totalCostoItems;
  const costoManoObra = +o.costo_mano_obra || 0;
  const totalOrden = costoManoObra + totalItems;
  const gananciaReal = costoManoObra + gananciaItems;
  const margenReal = totalCostoItems > 0 ? Math.round((gananciaItems / totalCostoItems) * 100) : null;
  const ec = ESTADO_COLOR[o.estado] || ESTADO_COLOR.pendiente;

  function saveEdit() {
    onUpdate({ ...o, costo: totalOrden });
    setMode("ver");
  }

  function addItemManual() {
    if (!newItem.descripcion || !newItem.precio) return;
    const item = { id: Date.now(), descripcion: newItem.descripcion, cantidad: +newItem.cantidad || 1, precio: +newItem.precio, costo_compra: +newItem.costo_compra || 0 };
    const updated = { ...o, items: [...o.items, item] };
    const newTotal = updated.items.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    setO(updated);
    onUpdate({ ...updated, costo: costoManoObra + newTotal });
    setNewItem({ descripcion: "", cantidad: 1, precio: "", costo_compra: "" });
  }

  function addItemInventario(inv: any, precioVenta: number) {
    const existing = o.items.find((i: any) => i.invId === inv.id);
    let updatedItems;
    const pVenta = +precioVenta || +inv.precio;
    if (existing) {
      updatedItems = o.items.map((i: any) => i.invId === inv.id ? { ...i, cantidad: i.cantidad + 1 } : i);
    } else {
      updatedItems = [...o.items, { id: Date.now(), invId: inv.id, descripcion: inv.nombre, cantidad: 1, precio: pVenta, costo_compra: +inv.costo_compra || +inv.precio }];
    }
    const newTotal = updatedItems.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    const updated = { ...o, items: updatedItems };
    setO(updated);
    onUpdate({ ...updated, costo: costoManoObra + newTotal });
    descontarStock(inv.id, 1);
  }

  function removeItem(itemId: number) {
    const updatedItems = o.items.filter((i: any) => i.id !== itemId);
    const newTotal = updatedItems.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    const updated = { ...o, items: updatedItems };
    setO(updated);
    onUpdate({ ...updated, costo: costoManoObra + newTotal });
  }

  function updateItemCantidad(itemId: number, delta: number) {
    const updatedItems = o.items.map((i: any) => i.id === itemId ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i);
    const newTotal = updatedItems.reduce((s: number, i: any) => s + (+i.precio * +i.cantidad), 0);
    const updated = { ...o, items: updatedItems };
    setO(updated);
    onUpdate({ ...updated, costo: costoManoObra + newTotal });
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: "#e55a00", fontWeight: 700, letterSpacing: 2 }}>{o.folio}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{o.cliente}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{o.vehiculo} {o.placa ? `· ${o.placa}` : ""}</div>
          </div>
          <span className="badge" style={{ background: ec.bg, color: ec.text, borderColor: ec.border }}>{o.estado}</span>
        </div>

        <div className="view-toggle" style={{ marginBottom: 16 }}>
          <button className={`view-btn ${mode === "ver" ? "active" : ""}`} onClick={() => setMode("ver")}>Ver</button>
          <button className={`view-btn ${mode === "editar" ? "active" : ""}`} onClick={() => setMode("editar")}>Editar</button>
          <button className={`view-btn ${mode === "items" ? "active" : ""}`} onClick={() => setMode("items")}>Repuestos</button>
        </div>

        {mode === "ver" && (
          <>
            <div className="detail-row"><span className="detail-label">Servicio</span><span className="detail-val">{o.servicio}</span></div>
            <div className="detail-row"><span className="detail-label">Mecánico</span><span className="detail-val">{o.mecanico || "—"}</span></div>
            <div className="detail-row"><span className="detail-label">Fecha</span><span className="detail-val">{o.fecha}</span></div>
            <div className="detail-row"><span className="detail-label">Mano de obra</span><span className="detail-val" style={{ color: "#60a5fa", fontWeight: 700 }}>{fmt(costoManoObra)}</span></div>
            {o.items.length > 0 && <div className="detail-row"><span className="detail-label">Repuestos (venta)</span><span className="detail-val" style={{ color: "#fb923c", fontWeight: 700 }}>{fmt(totalItems)}</span></div>}
            <div className="detail-row" style={{ borderTop: "1px solid #e55a00", paddingTop: 12 }}>
              <span className="detail-label" style={{ color: "#e55a00" }}>TOTAL A COBRAR</span>
              <span className="detail-val" style={{ color: "#4ade80", fontWeight: 700, fontSize: 20 }}>{fmt(totalOrden)}</span>
            </div>
            {totalCostoItems > 0 && (
              <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, padding: 12, marginTop: 12 }}>
                <div style={{ fontSize: 9, color: "#60a5fa", letterSpacing: 2, marginBottom: 8 }}>DESGLOSE GANANCIA</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Mano de obra</span><span style={{ color: "#4ade80" }}>{fmt(costoManoObra)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Costo repuestos</span><span style={{ color: "#f87171" }}>− {fmt(totalCostoItems)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Ganancia repuestos</span><span style={{ color: "#fbbf24" }}>{fmt(gananciaItems)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span style={{ color: "#60a5fa" }}>Ganancia real</span><span style={{ color: "#4ade80" }}>{fmt(gananciaReal)} {margenReal !== null ? <span style={{ fontSize: 11, color: "#fbbf24" }}>({margenReal}%)</span> : ""}</span></div>
              </div>
            )}
            <div className="detail-row"><span className="detail-label">Cobrado</span><span className="detail-val" style={{ color: o.cobrado ? "#4ade80" : "#f87171", fontWeight: 700 }}>{o.cobrado ? `✓ ${o.cobrado_fecha || ""}` : "Pendiente"}</span></div>
            {o.diagnostico && (
              <div style={{ marginTop: 12, padding: 12, background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 6 }}>DIAGNÓSTICO</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{o.diagnostico}</div>
              </div>
            )}
            {o.items.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>REPUESTOS USADOS</div>
                {o.items.map((item: any) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span>{item.descripcion} × {item.cantidad}</span>
                    <span style={{ color: "#fb923c" }}>{fmt(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <label className="form-label">Cambiar estado</label>
              <select className="form-select" value={o.estado} onChange={e => { setO((prev: any) => ({ ...prev, estado: e.target.value })); cambiarEstado(o.id, e.target.value); }}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="btn-row" style={{ marginTop: 16 }}>
              {!o.cobrado && o.estado === "completado" && <button className="btn btn-primary" onClick={() => marcarCobrado(o.id).then(() => onClose())}>✓ Marcar cobrado</button>}
              <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
              <button className="btn btn-danger" onClick={() => { if (confirm("¿Eliminar orden?")) onDelete(o.id); }}>Eliminar</button>
            </div>
          </>
        )}

        {mode === "editar" && (
          <>
            <div className="form-group"><label className="form-label">Cliente</label><input className="form-input" value={o.cliente || ""} onChange={e => setO((p: any) => ({ ...p, cliente: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Vehículo</label><input className="form-input" value={o.vehiculo || ""} onChange={e => setO((p: any) => ({ ...p, vehiculo: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Patente</label><input className="form-input" value={o.placa || ""} onChange={e => setO((p: any) => ({ ...p, placa: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Trabajo / Servicio</label><input className="form-input" value={o.servicio || ""} onChange={e => setO((p: any) => ({ ...p, servicio: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Diagnóstico / Notas técnicas</label><textarea className="form-textarea" value={o.diagnostico || ""} onChange={e => setO((p: any) => ({ ...p, diagnostico: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Mecánico</label>
              <select className="form-select" value={o.mecanico || ""} onChange={e => setO((p: any) => ({ ...p, mecanico: e.target.value }))}>
                <option value="">Sin asignar</option>
                <option value="Papá">Papá</option>
                <option value="Hermano">Hermano</option>
                <option value="Yo">Yo</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Mano de obra ($)</label><input className="form-input" type="number" value={o.costo_mano_obra ?? ""} onChange={e => setO((p: any) => ({ ...p, costo_mano_obra: +e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={o.fecha || ""} onChange={e => setO((p: any) => ({ ...p, fecha: e.target.value }))} /></div>
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => setMode("ver")}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveEdit}>Guardar cambios</button>
            </div>
          </>
        )}

        {mode === "items" && (
          <>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Mano de obra</span><span style={{ color: "#60a5fa" }}>{fmt(costoManoObra)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Repuestos (venta)</span><span style={{ color: "#fb923c" }}>{fmt(totalItems)}</span></div>
              {totalCostoItems > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Costo repuestos</span><span style={{ color: "#f87171" }}>− {fmt(totalCostoItems)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span style={{ color: "#e55a00" }}>TOTAL A COBRAR</span><span style={{ color: "#4ade80" }}>{fmt(totalOrden)}</span></div>
              {gananciaReal > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}><span style={{ color: "#60a5fa" }}>Ganancia real</span><span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(gananciaReal)} {margenReal !== null ? `(${margenReal}%)` : ""}</span></div>}
            </div>

            {o.items.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 8 }}>REPUESTOS AGREGADOS</div>
                {o.items.map((item: any) => {
                  const ventaTotal = item.precio * item.cantidad;
                  const costoTotal = (item.costo_compra || 0) * item.cantidad;
                  const ganancia = ventaTotal - costoTotal;
                  const markup = costoTotal > 0 ? Math.round((ganancia / costoTotal) * 100) : null;
                  return (
                    <div key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{item.descripcion}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Venta: {fmt(item.precio)} c/u {item.costo_compra > 0 ? `· Costo: ${fmt(item.costo_compra)}` : ""}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button className="btn-sm" style={{ background: "#1f2937", color: "#94a3b8" }} onClick={() => updateItemCantidad(item.id, -1)}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.cantidad}</span>
                          <button className="btn-sm" style={{ background: "#1f2937", color: "#94a3b8" }} onClick={() => updateItemCantidad(item.id, +1)}>+</button>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 64 }}>
                          <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>{fmt(ventaTotal)}</div>
                          {markup !== null && <div style={{ fontSize: 10, color: "#fbbf24" }}>gan. {markup}%</div>}
                        </div>
                        <button className="btn-sm" style={{ background: "#7f1d1d", color: "#f87171" }} onClick={() => removeItem(item.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="view-toggle" style={{ marginBottom: 12 }}>
              <button className={`view-btn ${itemMode === "manual" ? "active" : ""}`} onClick={() => setItemMode("manual")}>Manual</button>
              <button className={`view-btn ${itemMode === "inventario" ? "active" : ""}`} onClick={() => setItemMode("inventario")}>Del inventario</button>
            </div>

            {itemMode === "manual" && (
              <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 12 }}>AGREGAR REPUESTO MANUAL</div>
                <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={newItem.descripcion} onChange={e => setNewItem(p => ({ ...p, descripcion: e.target.value }))} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="form-group">
                    <label className="form-label">Costo compra ($)</label>
                    <input className="form-input" type="number" value={newItem.costo_compra}
                      onChange={e => {
                        const costo = +e.target.value;
                        setNewItem(p => ({ ...p, costo_compra: e.target.value, precio: costo > 0 ? String(Math.round(costo * 1.30)) : p.precio }));
                      }} placeholder="Lo que pagaste" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio venta ($)</label>
                    <input className="form-input" type="number" value={newItem.precio}
                      onChange={e => {
                        const venta = +e.target.value;
                        setNewItem(p => ({ ...p, precio: e.target.value, costo_compra: venta > 0 ? String(Math.round(venta / 1.30)) : p.costo_compra }));
                      }} placeholder="Lo que cobrás" />
                  </div>
                </div>
                {+newItem.costo_compra > 0 && +newItem.precio > 0 && (
                  <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 6, padding: "6px 10px", marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: "#64748b" }}>Ganancia: </span><span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(+newItem.precio - +newItem.costo_compra)}</span>
                    <span style={{ color: "#64748b" }}> · Markup: </span><span style={{ color: "#fbbf24", fontWeight: 700 }}>{Math.round(((+newItem.precio - +newItem.costo_compra) / +newItem.costo_compra) * 100)}%</span>
                  </div>
                )}
                <div className="form-group"><label className="form-label">Cantidad</label><input className="form-input" type="number" value={newItem.cantidad} onChange={e => setNewItem(p => ({ ...p, cantidad: +e.target.value }))} /></div>
                <button className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={addItemManual}>+ Agregar repuesto</button>
              </div>
            )}

            {itemMode === "inventario" && (
              <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, marginBottom: 12 }}>SELECCIONAR DEL INVENTARIO</div>
                {inventario.map((inv: any) => <InventarioItemSelector key={inv.id} inv={inv} onUsar={(pv: number) => addItemInventario(inv, pv)} />)}
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InventarioItemSelector({ inv, onUsar }: any) {
  const [markup, setMarkup] = useState(30);
  const costoBase = +inv.costo_compra || +inv.precio;
  const precioVenta = Math.round(costoBase * (1 + markup / 100));
  const ganancia = precioVenta - costoBase;
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{inv.nombre}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{inv.cantidad} {inv.unidad} disponibles · Costo: {fmt(costoBase)}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>GANANCIA %</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <input style={{ background: "#1f2937", border: "1px solid #374151", color: "#fbbf24", width: 60, padding: "4px 8px", borderRadius: 4, fontFamily: "inherit", fontSize: 13 }} type="number" value={markup} onChange={e => setMarkup(+e.target.value)} min="0" />
            <span style={{ fontSize: 12, color: "#64748b" }}>% → <span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(precioVenta)}</span> <span style={{ color: "#fbbf24" }}>(+{fmt(ganancia)})</span></span>
          </div>
        </div>
        <button className="btn-sm btn-primary" style={{ alignSelf: "flex-end" }} onClick={() => onUsar(precioVenta)}>+ Usar</button>
      </div>
    </div>
  );
}

function ModalACobrar({ pendientes, total, onCobrar, onClose, onVerOrden }: any) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div><div className="modal-title" style={{ marginBottom: 4 }}>Pendientes de cobro</div><div style={{ fontSize: 11, color: "#64748b" }}>{pendientes.length} {pendientes.length === 1 ? "orden" : "órdenes"}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>TOTAL</div><div style={{ fontSize: 22, fontWeight: 700, color: "#f87171" }}>{fmt(total)}</div></div>
        </div>
        {pendientes.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: 13 }}>✓ Todo cobrado</div>}
        {pendientes.map((o: any) => (
          <div key={o.id} style={{ padding: "12px 0", borderBottom: "1px solid #1f2937" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{o.cliente}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{o.folio} · {o.servicio}</div>
                {o.vehiculo && <div style={{ fontSize: 11, color: "#64748b" }}>{o.vehiculo}</div>}
                <div style={{ fontSize: 11, color: "#64748b" }}>{o.fecha}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 12 }}><div style={{ fontSize: 18, fontWeight: 700, color: "#f87171" }}>{fmt(o.costo)}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 2, padding: "10px" }} onClick={() => onCobrar(o.id)}>✓ Cobrar {fmt(o.costo)}</button>
              <button className="btn btn-ghost" style={{ flex: 1, padding: "10px" }} onClick={() => onVerOrden(o)}>Ver</button>
            </div>
          </div>
        ))}
        <div className="btn-row" style={{ marginTop: 16 }}><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}