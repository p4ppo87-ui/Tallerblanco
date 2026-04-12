"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://seygknzlruftfezcjpim.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleWdrbnpscnVmdGZlemNqcGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjY3MDQsImV4cCI6MjA5MTAwMjcwNH0.vODo6mIsy2QY2f1Mh5GstMJfQ3U5YmPBxDmmzozorWQ"
);

const TABS = ["Inicio", "Órdenes", "Finanzas", "Clientes", "Inventario"];
const TOPE_MONOTRIBUTO = 70113407;
const estadoColor: Record<string, string> = { completado: "#22c55e", "en proceso": "#f59e0b", pendiente: "#94a3b8" };
const estadoBg: Record<string, string> = { completado: "#052e16", "en proceso": "#431407", pendiente: "#1e293b" };

export default function TallerBlanco() {
  const [tab, setTab] = useState("Inicio");
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [gastos, setGastos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
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

  const totalIngresos = ordenes.filter(o => o.estado === "completado").reduce((s, o) => s + (o.costo || 0), 0);
  const totalGastos = gastos.reduce((s, g) => s + (g.monto || 0), 0);
  const utilidad = totalIngresos - totalGastos;
  const ordenesActivas = ordenes.filter(o => o.estado !== "completado").length;
  const aCobrar = ordenes.filter(o => o.estado !== "completado").reduce((s, o) => s + (o.costo || 0), 0);
  const ticketPromedio = ordenes.filter(o => o.estado === "completado").length
    ? Math.round(totalIngresos / ordenes.filter(o => o.estado === "completado").length) : 0;
  const pctMonotributo = Math.min(100, Math.round((totalIngresos / TOPE_MONOTRIBUTO) * 100));
  const stockBajo = inventario.filter(i => i.cantidad <= i.minimo).length;

  async function addOrden() {
    const folio = `OT-${String(ordenes.length + 1).padStart(3, "0")}`;
    const nuevo = { folio, cliente: form.cliente, vehiculo: form.vehiculo, placa: form.placa, servicio: form.servicio, mecanico: form.mecanico, costo: Number(form.costo) || 0, estado: form.estado || "pendiente", fecha: form.fecha };
    const { data, error } = await supabase.from("ordenes").insert([nuevo]).select();
    if (data && !error) setOrdenes(prev => [data[0], ...prev]);
    setModal(null); setForm({});
  }

  async function addGasto() {
    const nuevo = { concepto: form.concepto, monto: Number(form.monto) || 0, categoria: form.categoria, fecha: form.fecha };
    const { data, error } = await supabase.from("gastos").insert([nuevo]).select();
    if (data && !error) setGastos(prev => [data[0], ...prev]);
    setModal(null); setForm({});
  }

  async function addCliente() {
    const nuevo = { nombre: form.nombre, telefono: form.telefono, email: form.email, vehiculos: [], visitas: 0 };
    const { data, error } = await supabase.from("clientes").insert([nuevo]).select();
    if (data && !error) setClientes(prev => [data[0], ...prev]);
    setModal(null); setForm({});
  }

  async function cambiarEstado(id: number, estado: string) {
    await supabase.from("ordenes").update({ estado }).eq("id", id);
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado } : o));
  }

  async function ajustarStock(id: number, delta: number) {
    const item = inventario.find(i => i.id === id);
    if (!item) return;
    const nueva = Math.max(0, item.cantidad + delta);
    await supabase.from("inventario").update({ cantidad: nueva }).eq("id", id);
    setInventario(prev => prev.map(i => i.id === id ? { ...i, cantidad: nueva } : i));
  }

  const s: any = {
    app: { minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", background: "#0a0f1a", color: "#e2e8f0", fontFamily: "'Courier New', monospace", boxSizing: "border-box" },
    header: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #f97316", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo: { fontSize: 22, fontWeight: 900, letterSpacing: 3, color: "#f97316", textTransform: "uppercase" },
    sub: { fontSize: 11, color: "#64748b", letterSpacing: 2 },
    nav: { display: "flex", gap: 4, background: "#0f172a", padding: "8px 24px", borderBottom: "1px solid #1e293b", overflowX: "auto" },
    navBtn: (active: boolean) => ({ background: active ? "#f97316" : "transparent", color: active ? "#0a0f1a" : "#64748b", border: "none", padding: "8px 16px", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, borderRadius: 2, whiteSpace: "nowrap" }),
    main: { padding: "16px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
    cardAccent: (color: string) => ({ background: "#0f172a", border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: 4, padding: 20 }),
    kpiLabel: { fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
    kpiVal: (color: string) => ({ fontSize: 28, fontWeight: 900, color: color || "#e2e8f0" }),
    section: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4, padding: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 12, letterSpacing: 3, color: "#f97316", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { textAlign: "left", padding: "8px 12px", fontSize: 10, letterSpacing: 2, color: "#64748b", borderBottom: "1px solid #1e293b" },
    td: { padding: "10px 12px", borderBottom: "1px solid #0f172a" },
    badge: (estado: string) => ({ background: estadoBg[estado] || "#1e293b", color: estadoColor[estado] || "#94a3b8", padding: "2px 8px", borderRadius: 2, fontSize: 11, fontWeight: 700 }),
    btn: (variant?: string) => ({ background: variant === "primary" ? "#f97316" : variant === "danger" ? "#991b1b" : "#1e293b", color: variant === "primary" ? "#0a0f1a" : "#e2e8f0", border: "none", padding: "8px 16px", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, borderRadius: 2 }),
    input: { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "10px 12px", borderRadius: 2, width: "100%", fontFamily: "'Courier New', monospace", fontSize: 13, boxSizing: "border-box" },
    select: { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "10px 12px", borderRadius: 2, width: "100%", fontFamily: "'Courier New', monospace", fontSize: 13 },
    label: { fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 4 },
    formGroup: { marginBottom: 14 },
    modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
    modalBox: { background: "#0f172a", border: "1px solid #f97316", borderRadius: 4, padding: 24, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" },
    alert: { background: "#431407", border: "1px solid #f97316", borderRadius: 4, padding: "10px 14px", marginBottom: 8, fontSize: 13 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
    searchInput: { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "8px 12px", borderRadius: 2, fontFamily: "'Courier New', monospace", fontSize: 13 },
  };

  if (loading) return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f97316", fontSize: 14, letterSpacing: 3 }}>CARGANDO...</div>
    </div>
  );

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div>
          <div style={s.logo}>🔩 Taller Blanco</div>
          <div style={s.sub}>SISTEMA DE GESTIÓN</div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {new Date().toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}
        </div>
      </div>
      <div style={s.nav}>
        {TABS.map(t => <button key={t} style={s.navBtn(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div style={s.main}>
        {tab === "Inicio" && (
          <div>
            <div style={s.grid}>
              <div style={s.cardAccent("#22c55e")}><div style={s.kpiLabel}>Cobrado mes</div><div style={s.kpiVal("#22c55e")}>${totalIngresos.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#ef4444")}><div style={s.kpiLabel}>Gastos mes</div><div style={s.kpiVal("#ef4444")}>${totalGastos.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent(utilidad >= 0 ? "#f97316" : "#ef4444")}><div style={s.kpiLabel}>Utilidad neta</div><div style={s.kpiVal(utilidad >= 0 ? "#f97316" : "#ef4444")}>${utilidad.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#a78bfa")}><div style={s.kpiLabel}>Ticket prom.</div><div style={s.kpiVal("#a78bfa")}>${ticketPromedio.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#f59e0b")}><div style={s.kpiLabel}>Activas</div><div style={s.kpiVal("#f59e0b")}>{ordenesActivas}</div></div>
              <div style={s.cardAccent("#3b82f6")}><div style={s.kpiLabel}>A cobrar</div><div style={s.kpiVal("#3b82f6")}>${aCobrar.toLocaleString("es-AR")}</div></div>
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4, padding: 20, marginBottom: 16 }}>
              <div style={s.sectionTitle}>Tope Monotributo Cat. H</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: "#94a3b8" }}>Facturado: ${totalIngresos.toLocaleString("es-AR")}</span>
                <span style={{ color: pctMonotributo > 80 ? "#ef4444" : "#64748b" }}>{pctMonotributo}%</span>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 2, height: 8 }}>
                <div style={{ width: `${pctMonotributo}%`, height: 8, background: pctMonotributo > 80 ? "#ef4444" : "#f97316", borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Tope: ${TOPE_MONOTRIBUTO.toLocaleString("es-AR")}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={s.section}>
                <div style={s.sectionTitle}>Órdenes activas</div>
                {ordenes.filter(o => o.estado !== "completado").length === 0
                  ? <div style={{ color: "#64748b", fontSize: 13 }}>Sin órdenes activas</div>
                  : ordenes.filter(o => o.estado !== "completado").slice(0, 5).map((o: any) => (
                    <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #1e293b" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 700 }}>{o.cliente}</div><div style={{ fontSize: 11, color: "#64748b" }}>{o.servicio}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, color: "#f97316", fontWeight: 900 }}>${(o.costo || 0).toLocaleString("es-AR")}</div><span style={s.badge(o.estado)}>{o.estado}</span></div>
                    </div>
                  ))}
              </div>
              <div style={s.section}>
                <div style={s.sectionTitle}>⚠ Stock bajo</div>
                {inventario.filter(i => i.cantidad <= i.minimo).length === 0
                  ? <div style={{ color: "#64748b", fontSize: 13 }}>✓ Todo en orden</div>
                  : inventario.filter(i => i.cantidad <= i.minimo).map((i: any) => (
                    <div key={i.id} style={s.alert}><strong>{i.nombre}</strong> — {i.cantidad} {i.unidad} (mín. {i.minimo})</div>
                  ))}
                <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                  <div style={s.cardAccent("#22c55e")}><div style={s.kpiLabel}>Artículos</div><div style={s.kpiVal("#22c55e")}>{inventario.length}</div></div>
                  <div style={s.cardAccent("#ef4444")}><div style={s.kpiLabel}>Stock bajo</div><div style={s.kpiVal("#ef4444")}>{stockBajo}</div></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "Órdenes" && (
          <div>
            <div style={s.row}>
              <input style={{ ...s.searchInput, width: 250 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
              <button style={s.btn("primary")} onClick={() => setModal("orden")}>+ Nueva Orden</button>
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>Órdenes de Trabajo</div>
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead><tr>{["Folio","Cliente","Vehículo","Placa","Servicio","Mecánico","Costo","Estado","Cambiar"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {ordenes.filter(o => o.cliente?.toLowerCase().includes(search.toLowerCase()) || o.vehiculo?.toLowerCase().includes(search.toLowerCase()) || o.folio?.toLowerCase().includes(search.toLowerCase())).map((o: any) => (
                      <tr key={o.id}>
                        <td style={{ ...s.td, color: "#f97316", fontWeight: 700 }}>{o.folio}</td>
                        <td style={s.td}>{o.cliente}</td>
                        <td style={{ ...s.td, color: "#94a3b8" }}>{o.vehiculo}</td>
                        <td style={{ ...s.td, color: "#64748b" }}>{o.placa}</td>
                        <td style={s.td}>{o.servicio}</td>
                        <td style={{ ...s.td, color: "#94a3b8" }}>{o.mecanico}</td>
                        <td style={{ ...s.td, color: "#22c55e", fontWeight: 700 }}>${(o.costo || 0).toLocaleString("es-AR")}</td>
                        <td style={s.td}><span style={s.badge(o.estado)}>{o.estado}</span></td>
                        <td style={s.td}>
                          <select style={{ ...s.select, width: "auto", fontSize: 11, padding: "4px 6px" }} value={o.estado} onChange={e => cambiarEstado(o.id, e.target.value)}>
                            <option value="pendiente">Pendiente</option>
                            <option value="en proceso">En proceso</option>
                            <option value="completado">Completado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {tab === "Finanzas" && (
          <div>
            <div style={s.grid}>
              <div style={s.cardAccent("#22c55e")}><div style={s.kpiLabel}>Total ingresos</div><div style={s.kpiVal("#22c55e")}>${totalIngresos.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#ef4444")}><div style={s.kpiLabel}>Total gastos</div><div style={s.kpiVal("#ef4444")}>${totalGastos.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#f97316")}><div style={s.kpiLabel}>Utilidad neta</div><div style={s.kpiVal("#f97316")}>${utilidad.toLocaleString("es-AR")}</div></div>
              <div style={s.cardAccent("#a78bfa")}><div style={s.kpiLabel}>Ticket promedio</div><div style={s.kpiVal("#a78bfa")}>${ticketPromedio.toLocaleString("es-AR")}</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={s.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={s.sectionTitle}>Gastos por categoría</div>
                  <button style={s.btn("primary")} onClick={() => setModal("gasto")}>+ Gasto</button>
                </div>
                {Object.entries(gastos.reduce((acc: any, g: any) => { acc[g.categoria] = (acc[g.categoria] || 0) + g.monto; return acc; }, {})).map(([cat, total]: any) => {
                  const pct = totalGastos > 0 ? Math.round((total / totalGastos) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ textTransform: "capitalize" }}>{cat}</span>
                        <span style={{ color: "#f97316" }}>${total.toLocaleString("es-AR")} ({pct}%)</span>
                      </div>
                      <div style={{ background: "#1e293b", borderRadius: 2, height: 6 }}>
                        <div style={{ width: `${pct}%`, height: 6, background: "#f97316", borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={s.section}>
                <div style={s.sectionTitle}>Registro de gastos</div>
                <table style={s.table}>
                  <thead><tr>{["Concepto","Categoría","Monto","Fecha"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {gastos.map((g: any) => (
                      <tr key={g.id}>
                        <td style={s.td}>{g.concepto}</td>
                        <td style={{ ...s.td, color: "#94a3b8", textTransform: "capitalize" }}>{g.categoria}</td>
                        <td style={{ ...s.td, color: "#ef4444", fontWeight: 700 }}>${(g.monto || 0).toLocaleString("es-AR")}</td>
                        <td style={{ ...s.td, color: "#64748b" }}>{g.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {tab === "Clientes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button style={s.btn("primary")} onClick={() => setModal("cliente")}>+ Nuevo Cliente</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {clientes.map((c: any) => (
                <div key={c.id} style={s.section}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#f97316", marginBottom: 4 }}>{c.nombre}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>📞 {c.telefono}</div>
                  {c.email && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>✉ {c.email}</div>}
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>VEHÍCULOS</div>
                  {(c.vehiculos || []).map((v: string, i: number) => <div key={i} style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 2 }}>• {v}</div>)}
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>VISITAS</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#a78bfa" }}>{c.visitas || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "Inventario" && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Inventario de Repuestos</div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>{["Artículo","Categoría","Stock","Unidad","Precio","Mín.","Estado","Ajustar"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {inventario.map((i: any) => {
                    const bajo = i.cantidad <= i.minimo;
                    return (
                      <tr key={i.id}>
                        <td style={{ ...s.td, fontWeight: 700 }}>{i.nombre}</td>
                        <td style={{ ...s.td, color: "#94a3b8", textTransform: "capitalize" }}>{i.categoria}</td>
                        <td style={{ ...s.td, color: bajo ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{i.cantidad}</td>
                        <td style={{ ...s.td, color: "#64748b" }}>{i.unidad}</td>
                        <td style={{ ...s.td, color: "#f97316" }}>${i.precio}</td>
                        <td style={{ ...s.td, color: "#64748b" }}>{i.minimo}</td>
                        <td style={s.td}><span style={s.badge(bajo ? "pendiente" : "completado")}>{bajo ? "bajo" : "ok"}</span></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button style={{ ...s.btn("danger"), padding: "4px 10px" }} onClick={() => ajustarStock(i.id, -1)}>−</button>
                            <button style={{ ...s.btn("primary"), padding: "4px 10px" }} onClick={() => ajustarStock(i.id, +1)}>+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {modal === "orden" && (
        <div style={s.modalBg}><div style={s.modalBox}>
          <div style={s.sectionTitle}>Nueva Orden de Trabajo</div>
          {["cliente","vehiculo","placa","servicio","mecanico"].map(f => (
            <div key={f} style={s.formGroup}>
              <label style={s.label}>{f}</label>
              <input style={s.input} value={form[f]||""} onChange={e => setForm((p: any) => ({...p,[f]:e.target.value}))} />
            </div>
          ))}
          <div style={s.formGroup}><label style={s.label}>Costo ($)</label><input style={s.input} type="number" value={form.costo||""} onChange={e => setForm((p: any) => ({...p,costo:e.target.value}))} /></div>
          <div style={s.formGroup}><label style={s.label}>Fecha</label><input style={s.input} type="date" value={form.fecha||""} onChange={e => setForm((p: any) => ({...p,fecha:e.target.value}))} /></div>
          <div style={s.formGroup}><label style={s.label}>Estado</label>
            <select style={s.select} value={form.estado||"pendiente"} onChange={e => setForm((p: any) => ({...p,estado:e.target.value}))}>
              <option value="pendiente">Pendiente</option>
              <option value="en proceso">En proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <button style={s.btn()} onClick={()=>{setModal(null);setForm({})}}>Cancelar</button>
            <button style={s.btn("primary")} onClick={addOrden}>Guardar</button>
          </div>
        </div></div>
      )}
      {modal === "gasto" && (
        <div style={s.modalBg}><div style={s.modalBox}>
          <div style={s.sectionTitle}>Registrar Gasto</div>
          <div style={s.formGroup}><label style={s.label}>Concepto</label><input style={s.input} value={form.concepto||""} onChange={e => setForm((p: any) => ({...p,concepto:e.target.value}))} /></div>
          <div style={s.formGroup}><label style={s.label}>Monto ($)</label><input style={s.input} type="number" value={form.monto||""} onChange={e => setForm((p: any) => ({...p,monto:e.target.value}))} /></div>
          <div style={s.formGroup}><label style={s.label}>Categoría</label>
            <select style={s.select} value={form.categoria||""} onChange={e => setForm((p: any) => ({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["insumos","fijo","servicios","equipo","otro"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={s.formGroup}><label style={s.label}>Fecha</label><input style={s.input} type="date" value={form.fecha||""} onChange={e => setForm((p: any) => ({...p,fecha:e.target.value}))} /></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <button style={s.btn()} onClick={()=>{setModal(null);setForm({})}}>Cancelar</button>
            <button style={s.btn("primary")} onClick={addGasto}>Guardar</button>
          </div>
        </div></div>
      )}
      {modal === "cliente" && (
        <div style={s.modalBg}><div style={s.modalBox}>
          <div style={s.sectionTitle}>Nuevo Cliente</div>
          {["nombre","telefono","email"].map(f => (
            <div key={f} style={s.formGroup}>
              <label style={s.label}>{f}</label>
              <input style={s.input} value={form[f]||""} onChange={e => setForm((p: any) => ({...p,[f]:e.target.value}))} />
            </div>
          ))}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <button style={s.btn()} onClick={()=>{setModal(null);setForm({})}}>Cancelar</button>
            <button style={s.btn("primary")} onClick={addCliente}>Guardar</button>
          </div>
        </div></div>
      )}
    </div>
  );
}