import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Beef,
  Plus,
  Search,
  ClipboardList,
  Crown,
  LogOut,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAD = "linear-gradient(135deg, #085C42 0%, #139D6D 100%)";
const GRAD_DARK = "linear-gradient(160deg, #064832 0%, #085C42 100%)";

// ─── Data ─────────────────────────────────────────────────────────────────────

const initialAnimals = [
  { id: 1, tag: "MX-001", name: "Luna", breed: "Brahman", sex: "Hembra", birthDate: "2023-04-12", weight: 430, status: "Sana", notes: "Vacunación al día. Revisar peso en 30 días." },
  { id: 2, tag: "MX-002", name: "Toro", breed: "Charolais", sex: "Macho", birthDate: "2022-10-03", weight: 610, status: "Observación", notes: "Ligera pérdida de peso. Programar revisión veterinaria." },
  { id: 3, tag: "MX-003", name: "Estrella", breed: "Angus", sex: "Hembra", birthDate: "2024-01-21", weight: 290, status: "Sana", notes: "Crecimiento normal." },
];

const initialTasks = [
  { id: 1, title: "Revisar corral norte", employee: "Carlos Medina", dueDate: "2026-05-15", status: "Pendiente" },
  { id: 2, title: "Registrar peso de MX-001", employee: "Ana López", dueDate: "2026-05-16", status: "Completada" },
];

const initialUsers = [
  { id: 1, role: "Dueño", email: "dueno@rancho.com", password: "1234", name: "David", ranchName: "Rancho El Encino" },
  { id: 2, role: "Empleado", email: "empleado@rancho.com", password: "1234", name: "Carlos", ranchName: "Rancho El Encino" },
];

const emptyAnimalForm = {
  tag: "", name: "", breed: "", sex: "Hembra", birthDate: "", weight: "", status: "Sana", notes: "",
};

// ─── Storage hook ─────────────────────────────────────────────────────────────

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (!canUseStorage()) return initialValue;
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const updateValue = (nextValue) => {
    setValue((prev) => {
      const resolved = typeof nextValue === "function" ? nextValue(prev) : nextValue;
      if (canUseStorage()) {
        try {
          if (resolved === null || resolved === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(resolved));
          }
        } catch { /* ignore */ }
      }
      return resolved;
    });
  };

  return [value, updateValue];
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-semibold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-lg">
      <div className="mb-5 inline-flex rounded-2xl p-4 text-white" style={{ background: GRAD }}>
        <Icon size={28} />
      </div>
      <p className="text-base font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-4xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

// ─── Shell (authenticated layout) ────────────────────────────────────────────

function Shell({ children, user, currentPage, setCurrentPage, onLogout }) {
  const [open, setOpen] = useState(false);

  const ownerItems = [
    ["dashboard", "Inicio", Beef],
    ["animals", "Animales", ClipboardList],
    ["tasks", "Tareas", CheckCircle2],
    ["membership", "Membresía", Crown],
  ];
  const employeeItems = [
    ["dashboard", "Inicio", Beef],
    ["tasks", "Mis tareas", CheckCircle2],
    ["animals", "Animales", ClipboardList],
  ];
  const items = user.role === "Dueño" ? ownerItems : employeeItems;

  const goToPage = (page) => { setCurrentPage(page); setOpen(false); };

  const Nav = () => (
    <nav className="space-y-1">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => goToPage(key)}
          className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-lg font-semibold transition ${
            currentPage === key
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  );

  const UserBox = () => (
    <div className="mt-auto pt-6">
      <div className="mb-4 rounded-2xl bg-white/10 p-5">
        <p className="text-base font-bold text-white">{user.name}</p>
        <p className="mt-0.5 text-sm text-white/70">{user.role}</p>
        {user.ranchName && <p className="mt-1 text-sm text-white/55">{user.ranchName}</p>}
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/20 px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10"
      >
        <LogOut size={18} /> Salir
      </button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: GRAD }}>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 hidden h-full w-72 flex-col p-7 lg:flex"
        style={{ background: "rgba(0,0,0,0.18)" }}
      >
        <div className="mb-10 flex items-center gap-4">
          <div className="rounded-2xl bg-white/15 p-3">
            <Beef size={28} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">BoviTrack</p>
            <p className="text-sm text-white/60">Registro ganadero</p>
          </div>
        </div>
        <Nav />
        <UserBox />
      </aside>

      {/* Mobile header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 lg:hidden"
        style={{ background: "rgba(8,92,66,0.97)" }}
      >
        <div className="flex items-center gap-3 text-xl font-bold text-white">
          <Beef size={22} /> BoviTrack
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/25 p-2 text-white"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile slide-in */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden">
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            className="flex h-full w-72 flex-col p-7 shadow-2xl"
            style={{ background: "#064832" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xl font-bold text-white">Menú</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/20 p-2 text-white"
              >
                <X size={18} />
              </button>
            </div>
            <Nav />
            <UserBox />
          </motion.aside>
        </div>
      )}

      {/* Main content */}
      <main className="p-6 lg:ml-72 lg:p-10">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, onRegister, users }) {
  const [role, setRole] = useState("Dueño");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.role === role && u.email.toLowerCase() === normalizedEmail && u.password === password
    );
    if (!found) {
      setError("Correo, contraseña o tipo de usuario incorrecto.");
      return;
    }
    setError("");
    onLogin(found);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ background: GRAD }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl"
      >
        <div className="overflow-hidden rounded-[2.5rem] shadow-2xl lg:grid lg:grid-cols-2">
          {/* Left – branding */}
          <div className="flex flex-col justify-between p-12 text-white" style={{ background: GRAD_DARK }}>
            <div>
              <div className="mb-10 inline-flex rounded-3xl bg-white/15 p-5">
                <Beef size={52} />
              </div>
              <h1 className="text-4xl font-bold leading-snug text-white">
                Sistema web para registro ganadero
              </h1>
              <p className="mt-6 text-xl leading-relaxed" style={{ color: "#CDD2D2" }}>
                Administra animales, empleados, tareas y membresías desde cualquier navegador.
              </p>
            </div>
            <div className="mt-10 rounded-2xl bg-white/10 p-6">
              <p className="text-lg font-semibold text-white">Bienvenido a BoviTrack</p>
              <p className="mt-1 text-base" style={{ color: "#CDD2D2" }}>
                Inicia sesión para administrar tu rancho ganadero.
              </p>
            </div>
          </div>

          {/* Right – form */}
          <div className="flex flex-col justify-center bg-white px-10 py-12">
            <h2 className="text-3xl font-bold text-slate-800">Iniciar sesión</h2>
            <p className="mt-3 text-lg text-slate-500">Ingresa tus credenciales para acceder.</p>

            <div className="mt-10 space-y-6">
              <SelectField label="Tipo de usuario" value={role} onChange={setRole} options={["Dueño", "Empleado"]} />
              <Field label="Correo electrónico" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
              <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            </div>

            {error && (
              <p className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-base text-red-700">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              className="mt-8 w-full rounded-2xl py-5 text-xl font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
              style={{ background: GRAD }}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="mt-4 w-full rounded-2xl py-4 text-lg font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

function RegisterScreen({ onBack, onCreateUser, users }) {
  const [form, setForm] = useState({
    names: "", lastNames: "", phone: "", email: "", username: "",
    password: "", ranchName: "", location: "", role: "Dueño",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const submit = () => {
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!form.names.trim() || !normalizedEmail || !form.password || !form.ranchName.trim()) {
      setMessageType("error");
      setMessage("Completa al menos nombre, correo, contraseña y rancho.");
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      setMessageType("error");
      setMessage("Ya existe una cuenta registrada con ese correo.");
      return;
    }
    onCreateUser({
      id: Date.now(),
      role: form.role,
      email: normalizedEmail,
      password: form.password,
      name: `${form.names} ${form.lastNames}`.trim(),
      phone: form.phone,
      username: form.username,
      ranchName: form.ranchName,
      location: form.location,
    });
    setMessageType("success");
    setMessage("Cuenta creada. Ya puedes iniciar sesión con ese correo y contraseña.");
    setForm({ names: "", lastNames: "", phone: "", email: "", username: "", password: "", ranchName: "", location: "", role: "Dueño" });
  };

  return (
    <div className="flex min-h-screen items-start justify-center p-6" style={{ background: GRAD }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="my-8 w-full max-w-3xl"
      >
        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-slate-800">Registro de usuario</h1>
          <p className="mt-2 text-lg text-slate-500">Crea una cuenta para dueño o empleado.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Field label="Nombres" value={form.names} onChange={(v) => update("names", v)} />
            <Field label="Apellidos" value={form.lastNames} onChange={(v) => update("lastNames", v)} />
            <Field label="Teléfono" value={form.phone} onChange={(v) => update("phone", v)} />
            <Field label="Correo electrónico" type="email" value={form.email} onChange={(v) => update("email", v)} />
            <Field label="Nombre de usuario" value={form.username} onChange={(v) => update("username", v)} />
            <Field label="Contraseña" type="password" value={form.password} onChange={(v) => update("password", v)} />
            <SelectField label="Tipo de usuario" value={form.role} onChange={(v) => update("role", v)} options={["Dueño", "Empleado"]} />
            <Field label="Nombre del rancho" value={form.ranchName} onChange={(v) => update("ranchName", v)} />
            <div className="md:col-span-2">
              <Field label="Ubicación" value={form.location} onChange={(v) => update("location", v)} />
            </div>
          </div>

          {message && (
            <p className={`mt-6 rounded-2xl px-5 py-4 text-base ${messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={submit}
              className="flex-1 rounded-2xl py-5 text-xl font-bold text-white shadow-lg transition hover:opacity-90"
              style={{ background: GRAD }}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-2xl border-2 border-slate-200 py-5 text-xl font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Regresar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ animals, tasks, user }) {
  const healthy = animals.filter((a) => a.status === "Sana").length;
  const pending = tasks.filter((t) => t.status === "Pendiente").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Hola, {user.name}</h1>
        <p className="mt-2 text-xl" style={{ color: "#CDD2D2" }}>Resumen general del rancho.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={Beef} title="Animales registrados" value={animals.length} subtitle="Base local" />
        <StatCard icon={CheckCircle2} title="Animales sanos" value={healthy} subtitle="Sin alertas" />
        <StatCard icon={ClipboardList} title="Tareas pendientes" value={pending} subtitle="Asignadas al equipo" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-7 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800">Últimos animales</h2>
          <div className="mt-5 space-y-3">
            {animals.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{a.name}</p>
                  <p className="text-base text-slate-500">{a.tag} · {a.breed}</p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${a.status === "Sana" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800">Próximas tareas</h2>
          <div className="mt-5 space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-2xl bg-slate-50 px-5 py-4">
                <p className="text-lg font-semibold text-slate-900">{t.title}</p>
                <p className="mt-1 text-base text-slate-500">{t.employee} · {t.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Animal form ──────────────────────────────────────────────────────────────

function AnimalForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(editing ? { ...editing, weight: String(editing.weight ?? "") } : emptyAnimalForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editing ? { ...editing, weight: String(editing.weight ?? "") } : emptyAnimalForm);
    setError("");
  }, [editing]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const submit = () => {
    if (!form.tag.trim() || !form.name.trim()) {
      setError("Completa al menos el arete y el nombre del animal.");
      return;
    }
    onSave({
      ...form,
      tag: form.tag.trim(),
      name: form.name.trim(),
      breed: form.breed.trim(),
      weight: form.weight === "" ? 0 : Number(form.weight),
    });
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800">{editing ? "Editar animal" : "Registrar animal"}</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Arete / Identificador" value={form.tag} onChange={(v) => update("tag", v)} />
        <Field label="Nombre" value={form.name} onChange={(v) => update("name", v)} />
        <Field label="Raza" value={form.breed} onChange={(v) => update("breed", v)} />
        <SelectField label="Sexo" value={form.sex} onChange={(v) => update("sex", v)} options={["Hembra", "Macho"]} />
        <Field label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(v) => update("birthDate", v)} />
        <Field label="Peso aproximado (kg)" type="number" value={form.weight} onChange={(v) => update("weight", v)} />
        <SelectField label="Estado" value={form.status} onChange={(v) => update("status", v)} options={["Sana", "Observación", "En tratamiento"]} />
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-base font-semibold text-slate-600">Notas</span>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          className="min-h-28 w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>
      {error && <p className="mt-4 rounded-2xl bg-red-50 px-5 py-4 text-base text-red-700">{error}</p>}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-2xl py-4 text-lg font-bold text-white shadow-md transition hover:opacity-90"
          style={{ background: GRAD }}
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-slate-200 py-4 text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Animals page ─────────────────────────────────────────────────────────────

function AnimalsPage({ animals, setAnimals }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => animals.find((a) => a.id === selectedId) || null, [animals, selectedId]);

  const filtered = useMemo(
    () => animals.filter((a) =>
      [a.tag, a.name, a.breed, a.status].join(" ").toLowerCase().includes(query.toLowerCase())
    ),
    [animals, query]
  );

  const openCreateForm = () => { setEditing(null); setShowForm(true); };
  const openEditForm = (a) => { setEditing(a); setShowForm(true); };

  const saveAnimal = (form) => {
    if (editing) {
      const updated = { ...form, id: editing.id };
      setAnimals((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
      setSelectedId(editing.id);
    } else {
      const next = { ...form, id: Date.now() };
      setAnimals((prev) => [next, ...prev]);
      setSelectedId(next.id);
    }
    setShowForm(false);
    setEditing(null);
  };

  const removeAnimal = (id) => {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editing?.id === id) { setEditing(null); setShowForm(false); }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Animales</h1>
          <p className="mt-2 text-xl" style={{ color: "#CDD2D2" }}>Registro, consulta, edición y eliminación.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-lg font-bold shadow-lg transition hover:bg-white/90"
          style={{ color: "#085C42" }}
        >
          <Plus size={20} /> Registrar animal
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AnimalForm editing={editing} onSave={saveAnimal} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Table card */}
        <div className="rounded-3xl bg-white p-7 shadow-lg">
          <div className="relative mb-5">
            <Search className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por arete, nombre, raza o estado"
              className="w-full rounded-2xl border-2 border-slate-200 py-4 pl-12 pr-5 text-lg outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b">
                  {["Arete", "Nombre", "Raza", "Sexo", "Peso", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="pb-4 text-base font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-4 text-lg font-semibold text-slate-800">{a.tag}</td>
                    <td className="py-4 text-lg text-slate-700">{a.name}</td>
                    <td className="py-4 text-base text-slate-600">{a.breed}</td>
                    <td className="py-4 text-base text-slate-600">{a.sex}</td>
                    <td className="py-4 text-base text-slate-600">{a.weight} kg</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${a.status === "Sana" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setSelectedId(a.id)} className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50">
                          <Eye size={18} />
                        </button>
                        <button type="button" onClick={() => openEditForm(a)} className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50">
                          <Pencil size={18} />
                        </button>
                        <button type="button" onClick={() => removeAnimal(a.id)} className="rounded-xl border-2 border-slate-200 p-2.5 text-red-500 transition hover:border-red-200 hover:bg-red-50">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-lg text-slate-400">
                      No se encontraron animales con esa búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail card */}
        <div className="rounded-3xl bg-white p-7 shadow-lg">
          {selected ? (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Detalle</h2>
                <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600">{selected.tag}</span>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-6 text-emerald-900">
                <Beef size={40} />
                <h3 className="mt-4 text-2xl font-bold">{selected.name}</h3>
                <p className="mt-1 text-lg">{selected.breed} · {selected.sex}</p>
              </div>
              <div className="mt-5 space-y-4 text-lg">
                <p><strong className="text-slate-700">Nacimiento:</strong> <span className="text-slate-600">{selected.birthDate || "Sin fecha"}</span></p>
                <p><strong className="text-slate-700">Peso:</strong> <span className="text-slate-600">{selected.weight} kg</span></p>
                <p><strong className="text-slate-700">Estado:</strong> <span className="text-slate-600">{selected.status}</span></p>
                <p><strong className="text-slate-700">Notas:</strong> <span className="text-slate-600">{selected.notes || "Sin notas"}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-slate-400">
              <Eye size={40} className="mb-4" />
              <p className="text-lg">Selecciona un animal para ver sus detalles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tasks page ───────────────────────────────────────────────────────────────

function TasksPage({ tasks, setTasks, user }) {
  const [title, setTitle] = useState("");
  const [employee, setEmployee] = useState(user.role === "Empleado" ? user.name : "");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const addTask = () => {
    if (!title.trim() || !employee.trim() || !dueDate) {
      setError("Completa la descripción, el empleado y la fecha límite.");
      return;
    }
    setTasks((prev) => [
      { id: Date.now(), title: title.trim(), employee: employee.trim(), dueDate, status: "Pendiente" },
      ...prev,
    ]);
    setTitle("");
    setEmployee(user.role === "Empleado" ? user.name : "");
    setDueDate("");
    setError("");
  };

  const toggle = (id) => {
    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: t.status === "Pendiente" ? "Completada" : "Pendiente" } : t)
    );
  };

  const visibleTasks = useMemo(() => {
    if (user.role === "Dueño") return tasks;
    return tasks.filter((t) => t.employee === user.name || t.employee === "Carlos Medina");
  }, [tasks, user.name, user.role]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">{user.role === "Dueño" ? "Tareas" : "Mis tareas"}</h1>
        <p className="mt-2 text-xl" style={{ color: "#CDD2D2" }}>Asignación y seguimiento de actividades.</p>
      </div>

      {user.role === "Dueño" && (
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800">Nueva tarea</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Field label="Descripción" value={title} onChange={setTitle} />
            <Field label="Empleado" value={employee} onChange={setEmployee} />
            <Field label="Fecha límite" type="date" value={dueDate} onChange={setDueDate} />
          </div>
          {error && <p className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-base text-red-700">{error}</p>}
          <button
            type="button"
            onClick={addTask}
            className="mt-6 flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-md transition hover:opacity-90"
            style={{ background: GRAD }}
          >
            <Plus size={20} /> Agregar tarea
          </button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleTasks.map((t) => (
          <div key={t.id} className="rounded-3xl bg-white p-7 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t.title}</h3>
                <p className="mt-2 text-base text-slate-500">Asignada a {t.employee}</p>
              </div>
              {t.status === "Completada"
                ? <CheckCircle2 size={28} className="shrink-0 text-emerald-600" />
                : <AlertCircle size={28} className="shrink-0 text-amber-500" />
              }
            </div>
            <div className="mt-5 flex items-center gap-2 text-base text-slate-500">
              <CalendarDays size={18} /> {t.dueDate}
            </div>
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className="mt-5 w-full rounded-2xl border-2 border-slate-200 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Marcar como {t.status === "Pendiente" ? "completada" : "pendiente"}
            </button>
          </div>
        ))}
        {visibleTasks.length === 0 && (
          <div className="col-span-full rounded-3xl bg-white p-10 text-center text-lg text-slate-400 shadow-lg">
            No hay tareas registradas.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Membership page ──────────────────────────────────────────────────────────

function MembershipPage() {
  const plans = [
    { title: "Básico", price: "$0", description: "Registro limitado para pruebas", features: ["Hasta 20 animales", "1 usuario", "Datos locales"] },
    { title: "Rancho", price: "$199", description: "Para administración diaria", features: ["Animales ilimitados", "Empleados", "Tareas", "Soporte básico"] },
    { title: "Pro", price: "$399", description: "Para operación avanzada", features: ["Reportes", "Historial médico", "Nube", "Soporte prioritario"] },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Membresía</h1>
        <p className="mt-2 text-xl" style={{ color: "#CDD2D2" }}>Planes de ejemplo para monetizar la plataforma.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <div
            key={plan.title}
            className={`rounded-3xl bg-white p-8 shadow-lg ${i === 1 ? "ring-4 ring-emerald-400" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">{plan.title}</h2>
              {i === 1 && (
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-700">
                  Recomendado
                </span>
              )}
            </div>
            <p className="mt-2 text-base text-slate-500">{plan.description}</p>
            <p className="mt-6 text-5xl font-bold text-slate-900">
              {plan.price}
              <span className="text-lg font-normal text-slate-400">/mes</span>
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-lg text-slate-700">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-8 w-full rounded-2xl py-4 text-lg font-bold text-white shadow-md transition hover:opacity-90"
              style={{ background: GRAD }}
            >
              Seleccionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BoviTrackWebApp() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useLocalStorageState("bovitrack.currentUser", null);
  const [users, setUsers] = useLocalStorageState("bovitrack.users", initialUsers);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [animals, setAnimals] = useLocalStorageState("bovitrack.animals", initialAnimals);
  const [tasks, setTasks] = useLocalStorageState("bovitrack.tasks", initialTasks);

  const createUser = (newUser) => setUsers((prev) => [newUser, ...prev]);

  const logout = () => { setUser(null); setCurrentPage("dashboard"); };

  if (screen === "register") {
    return <RegisterScreen users={users} onBack={() => setScreen("login")} onCreateUser={createUser} />;
  }

  if (!user) {
    return (
      <LoginScreen
        users={users}
        onLogin={(selectedUser) => { setUser(selectedUser); setCurrentPage("dashboard"); }}
        onRegister={() => setScreen("register")}
      />
    );
  }

  return (
    <Shell user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={logout}>
      {currentPage === "dashboard" && <Dashboard animals={animals} tasks={tasks} user={user} />}
      {currentPage === "animals" && <AnimalsPage animals={animals} setAnimals={setAnimals} />}
      {currentPage === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} user={user} />}
      {currentPage === "membership" && <MembershipPage />}
    </Shell>
  );
}
