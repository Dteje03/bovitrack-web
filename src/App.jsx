import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Beef,
  UserRound,
  Users,
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
function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, variant = "default", className = "", type = "button" }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50";
  const variantClass =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      : variant === "ghost"
        ? "bg-transparent text-slate-700 hover:bg-slate-100"
        : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <button type={type} onClick={onClick} className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </button>
  );
}

const initialAnimals = [
  {
    id: 1,
    tag: "MX-001",
    name: "Luna",
    breed: "Brahman",
    sex: "Hembra",
    birthDate: "2023-04-12",
    weight: 430,
    status: "Sana",
    notes: "Vacunación al día. Revisar peso en 30 días.",
  },
  {
    id: 2,
    tag: "MX-002",
    name: "Toro",
    breed: "Charolais",
    sex: "Macho",
    birthDate: "2022-10-03",
    weight: 610,
    status: "Observación",
    notes: "Ligera pérdida de peso. Programar revisión veterinaria.",
  },
  {
    id: 3,
    tag: "MX-003",
    name: "Estrella",
    breed: "Angus",
    sex: "Hembra",
    birthDate: "2024-01-21",
    weight: 290,
    status: "Sana",
    notes: "Crecimiento normal.",
  },
];

const initialTasks = [
  {
    id: 1,
    title: "Revisar corral norte",
    employee: "Carlos Medina",
    dueDate: "2026-05-15",
    status: "Pendiente",
  },
  {
    id: 2,
    title: "Registrar peso de MX-001",
    employee: "Ana López",
    dueDate: "2026-05-16",
    status: "Completada",
  },
];

const initialUsers = [
  {
    id: 1,
    role: "Dueño",
    email: "dueno@rancho.com",
    password: "1234",
    name: "David",
    ranchName: "Rancho El Encino",
  },
  {
    id: 2,
    role: "Empleado",
    email: "empleado@rancho.com",
    password: "1234",
    name: "Carlos",
    ranchName: "Rancho El Encino",
  },
];

const emptyAnimalForm = {
  tag: "",
  name: "",
  breed: "",
  sex: "Hembra",
  birthDate: "",
  weight: "",
  status: "Sana",
  notes: "",
};

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
    setValue((previousValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(previousValue) : nextValue;

      if (canUseStorage()) {
        try {
          if (resolvedValue === null || resolvedValue === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
          }
        } catch {
          return resolvedValue;
        }
      }

      return resolvedValue;
    });
  };

  return [value, updateValue];
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const goToPage = (page) => {
    setCurrentPage(page);
    setOpen(false);
  };

  const Nav = () => (
    <nav className="space-y-2">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => goToPage(key)}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            currentPage === key ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white">
            <Beef size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold">BoviTrack</h1>
            <p className="text-xs text-slate-500">Registro ganadero</p>
          </div>
        </div>
        <Nav />
        <div className="absolute bottom-5 left-5 right-5">
          <div className="mb-3 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
            {user.ranchName && <p className="mt-1 text-xs text-slate-400">{user.ranchName}</p>}
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full rounded-2xl">
            <LogOut className="mr-2" size={16} /> Salir
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 font-bold">
          <Beef className="text-emerald-600" /> BoviTrack
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border p-2">
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden">
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} className="h-full w-72 bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold">Menú</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border p-2">
                <X size={18} />
              </button>
            </div>
            <Nav />
            <Button onClick={onLogout} variant="outline" className="mt-6 w-full rounded-2xl">
              <LogOut className="mr-2" size={16} /> Salir
            </Button>
          </motion.aside>
        </div>
      )}

      <main className="p-4 lg:ml-72 lg:p-8">{children}</main>
    </div>
  );
}

function LoginScreen({ onLogin, onRegister, users }) {
  const [role, setRole] = useState("Dueño");
  const [email, setEmail] = useState("dueno@rancho.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setEmail(selectedRole === "Dueño" ? "dueno@rancho.com" : "empleado@rancho.com");
    setPassword("1234");
    setError("");
  };

  const submit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(
      (user) => user.role === role && user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (!found) {
      setError("Correo, contraseña o tipo de usuario incorrecto.");
      return;
    }

    setError("");
    onLogin(found);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-emerald-700 p-8 text-white">
            <div>
              <div className="mb-8 inline-flex rounded-3xl bg-white/15 p-4">
                <Beef size={44} />
              </div>
              <h1 className="text-4xl font-bold leading-tight">Sistema web para registro ganadero</h1>
              <p className="mt-4 text-emerald-50">
                Administra animales, empleados, tareas y membresías desde cualquier navegador, sin instalar una app móvil.
              </p>
            </div>
            <p className="mt-8 text-sm text-emerald-100">Demo: dueno@rancho.com / 1234 o empleado@rancho.com / 1234</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold">Identifícate</h2>
            <p className="mt-1 text-sm text-slate-500">Selecciona el tipo de usuario para ingresar.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {["Dueño", "Empleado"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectRole(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    role === item ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item === "Dueño" ? <UserRound /> : <Users />}
                  <p className="mt-2 font-semibold">{item}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Correo" value={email} onChange={setEmail} />
              <Field label="Contraseña" type="password" value={password} onChange={setPassword} />
            </div>

            {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <Button onClick={submit} className="mt-6 w-full rounded-2xl bg-emerald-600 py-6 text-base hover:bg-emerald-700">
              Ingresar
            </Button>
            <Button onClick={onRegister} variant="ghost" className="mt-2 w-full rounded-2xl">
              No tengo cuenta
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RegisterScreen({ onBack, onCreateUser, users }) {
  const [form, setForm] = useState({
    names: "",
    lastNames: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    ranchName: "",
    location: "",
    role: "Dueño",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const update = (key, value) => {
    setForm((previousForm) => ({ ...previousForm, [key]: value }));
    setMessage("");
  };

  const submit = () => {
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.names.trim() || !normalizedEmail || !form.password || !form.ranchName.trim()) {
      setMessageType("error");
      setMessage("Completa al menos nombre, correo, contraseña y rancho.");
      return;
    }

    const alreadyExists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (alreadyExists) {
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
    setForm({
      names: "",
      lastNames: "",
      phone: "",
      email: "",
      username: "",
      password: "",
      ranchName: "",
      location: "",
      role: "Dueño",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Registro nuevo usuario</h1>
        <p className="mt-1 text-slate-500">Crea una cuenta para dueño o empleado.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nombres" value={form.names} onChange={(value) => update("names", value)} />
          <Field label="Apellidos" value={form.lastNames} onChange={(value) => update("lastNames", value)} />
          <Field label="Número telefónico" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field label="Correo" type="email" value={form.email} onChange={(value) => update("email", value)} />
          <Field label="Nombre de usuario" value={form.username} onChange={(value) => update("username", value)} />
          <Field label="Contraseña" type="password" value={form.password} onChange={(value) => update("password", value)} />
          <SelectField label="Tipo de usuario" value={form.role} onChange={(value) => update("role", value)} options={["Dueño", "Empleado"]} />
          <Field label="Nombre del rancho" value={form.ranchName} onChange={(value) => update("ranchName", value)} />
          <Field label="Ubicación" value={form.location} onChange={(value) => update("location", value)} />
        </div>
        {message && (
          <p
            className={`mt-4 rounded-2xl p-3 text-sm ${
              messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={submit} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
            Crear cuenta
          </Button>
          <Button onClick={onBack} variant="outline" className="rounded-2xl">
            Regresar
          </Button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ animals, tasks, user }) {
  const healthy = animals.filter((animal) => animal.status === "Sana").length;
  const pending = tasks.filter((task) => task.status === "Pendiente").length;

  return (
    <div>
      <h1 className="text-3xl font-bold">Hola, {user.name}</h1>
      <p className="mt-1 text-slate-500">Resumen general del rancho.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={Beef} title="Animales registrados" value={animals.length} subtitle="Base local de ejemplo" />
        <StatCard icon={CheckCircle2} title="Animales sanos" value={healthy} subtitle="Sin alertas actuales" />
        <StatCard icon={ClipboardList} title="Tareas pendientes" value={pending} subtitle="Asignadas al equipo" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-bold">Últimos animales</h2>
            <div className="mt-4 space-y-3">
              {animals.slice(0, 3).map((animal) => (
                <div key={animal.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold">{animal.name}</p>
                    <p className="text-sm text-slate-500">
                      {animal.tag} · {animal.breed}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      animal.status === "Sana" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {animal.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-bold">Próximas tareas</h2>
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-slate-500">
                    {task.employee} · {task.dueDate}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnimalForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(editing ? { ...editing, weight: String(editing.weight ?? "") } : emptyAnimalForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editing ? { ...editing, weight: String(editing.weight ?? "") } : emptyAnimalForm);
    setError("");
  }, [editing]);

  const update = (key, value) => {
    setForm((previousForm) => ({ ...previousForm, [key]: value }));
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
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold">{editing ? "Editar animal" : "Registrar animal"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Arete / Identificador" value={form.tag} onChange={(value) => update("tag", value)} />
          <Field label="Nombre" value={form.name} onChange={(value) => update("name", value)} />
          <Field label="Raza" value={form.breed} onChange={(value) => update("breed", value)} />
          <SelectField label="Sexo" value={form.sex} onChange={(value) => update("sex", value)} options={["Hembra", "Macho"]} />
          <Field label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(value) => update("birthDate", value)} />
          <Field label="Peso aproximado (kg)" type="number" value={form.weight} onChange={(value) => update("weight", value)} />
          <SelectField
            label="Estado"
            value={form.status}
            onChange={(value) => update("status", value)}
            options={["Sana", "Observación", "En tratamiento"]}
          />
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Notas</span>
          <textarea
            value={form.notes ?? ""}
            onChange={(event) => update("notes", event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={submit} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
            Guardar
          </Button>
          <Button onClick={onCancel} variant="outline" className="rounded-2xl">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AnimalsPage({ animals, setAnimals }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => animals.find((animal) => animal.id === selectedId) || null, [animals, selectedId]);

  const filtered = useMemo(() => {
    return animals.filter((animal) =>
      [animal.tag, animal.name, animal.breed, animal.status].join(" ").toLowerCase().includes(query.toLowerCase())
    );
  }, [animals, query]);

  const openCreateForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (animal) => {
    setEditing(animal);
    setShowForm(true);
  };

  const saveAnimal = (form) => {
    if (editing) {
      const updatedAnimal = { ...form, id: editing.id };
      setAnimals((previousAnimals) => previousAnimals.map((animal) => (animal.id === editing.id ? updatedAnimal : animal)));
      setSelectedId(editing.id);
    } else {
      const newAnimal = { ...form, id: Date.now() };
      setAnimals((previousAnimals) => [newAnimal, ...previousAnimals]);
      setSelectedId(newAnimal.id);
    }

    setShowForm(false);
    setEditing(null);
  };

  const removeAnimal = (id) => {
    setAnimals((previousAnimals) => previousAnimals.filter((animal) => animal.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editing?.id === id) {
      setEditing(null);
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Animales</h1>
          <p className="mt-1 text-slate-500">Registro, consulta, edición y eliminación.</p>
        </div>
        <Button onClick={openCreateForm} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2" size={18} /> Registrar animal
        </Button>
      </div>

      {showForm && (
        <div className="mt-6">
          <AnimalForm
            editing={editing}
            onSave={saveAnimal}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por arete, nombre, raza o estado"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="py-3">Arete</th>
                    <th>Nombre</th>
                    <th>Raza</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((animal) => (
                    <tr key={animal.id} className="border-b last:border-0">
                      <td className="py-4 font-semibold">{animal.tag}</td>
                      <td>{animal.name}</td>
                      <td>{animal.breed}</td>
                      <td>{animal.sex}</td>
                      <td>{animal.weight} kg</td>
                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            animal.status === "Sana" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {animal.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setSelectedId(animal.id)} className="rounded-xl border p-2 hover:bg-slate-50">
                            <Eye size={16} />
                          </button>
                          <button type="button" onClick={() => openEditForm(animal)} className="rounded-xl border p-2 hover:bg-slate-50">
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAnimal(animal.id)}
                            className="rounded-xl border p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                        No se encontraron animales con esa búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            {selected ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Detalle</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{selected.tag}</span>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900">
                  <Beef size={36} />
                  <h3 className="mt-3 text-2xl font-bold">{selected.name}</h3>
                  <p>
                    {selected.breed} · {selected.sex}
                  </p>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    <strong>Nacimiento:</strong> {selected.birthDate || "Sin fecha"}
                  </p>
                  <p>
                    <strong>Peso:</strong> {selected.weight} kg
                  </p>
                  <p>
                    <strong>Estado:</strong> {selected.status}
                  </p>
                  <p>
                    <strong>Notas:</strong> {selected.notes || "Sin notas"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center text-slate-500">
                <Eye className="mb-3" />
                <p>Selecciona un animal para ver sus detalles.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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

    setTasks((previousTasks) => [
      { id: Date.now(), title: title.trim(), employee: employee.trim(), dueDate, status: "Pendiente" },
      ...previousTasks,
    ]);
    setTitle("");
    setEmployee(user.role === "Empleado" ? user.name : "");
    setDueDate("");
    setError("");
  };

  const toggle = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, status: task.status === "Pendiente" ? "Completada" : "Pendiente" } : task
      )
    );
  };

  const visibleTasks = useMemo(() => {
    if (user.role === "Dueño") return tasks;
    return tasks.filter((task) => task.employee === user.name || task.employee === "Carlos Medina");
  }, [tasks, user.name, user.role]);

  return (
    <div>
      <h1 className="text-3xl font-bold">{user.role === "Dueño" ? "Tareas" : "Mis tareas"}</h1>
      <p className="mt-1 text-slate-500">Asignación y seguimiento de actividades.</p>

      {user.role === "Dueño" && (
        <Card className="mt-6 rounded-3xl border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-bold">Nueva tarea</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Descripción" value={title} onChange={setTitle} />
              <Field label="Empleado" value={employee} onChange={setEmployee} />
              <Field label="Fecha límite" type="date" value={dueDate} onChange={setDueDate} />
            </div>
            {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button onClick={addTask} className="mt-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2" size={18} /> Agregar tarea
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTasks.map((task) => (
          <Card key={task.id} className="rounded-3xl border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">Asignada a {task.employee}</p>
                </div>
                {task.status === "Completada" ? <CheckCircle2 className="text-emerald-600" /> : <AlertCircle className="text-amber-500" />}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={16} /> {task.dueDate}
              </div>
              <Button onClick={() => toggle(task.id)} variant="outline" className="mt-4 w-full rounded-2xl">
                Marcar como {task.status === "Pendiente" ? "completada" : "pendiente"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {visibleTasks.length === 0 && (
          <Card className="rounded-3xl border-0 shadow-sm md:col-span-2 xl:col-span-3">
            <CardContent className="flex min-h-40 items-center justify-center p-5 text-center text-slate-500">
              No hay tareas registradas.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MembershipPage() {
  const plans = [
    {
      title: "Básico",
      price: "$0",
      description: "Registro limitado para pruebas",
      features: ["Hasta 20 animales", "1 usuario", "Datos locales"],
    },
    {
      title: "Rancho",
      price: "$199",
      description: "Para administración diaria",
      features: ["Animales ilimitados", "Empleados", "Tareas", "Soporte básico"],
    },
    {
      title: "Pro",
      price: "$399",
      description: "Para operación avanzada",
      features: ["Reportes", "Historial médico", "Nube", "Soporte prioritario"],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Membresía</h1>
      <p className="mt-1 text-slate-500">Planes de ejemplo para monetizar la plataforma.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Card key={plan.title} className={`rounded-3xl border-0 shadow-sm ${index === 1 ? "ring-2 ring-emerald-500" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{plan.title}</h2>
                {index === 1 && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">Recomendado</span>}
              </div>
              <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
              <p className="mt-5 text-4xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-slate-500">/mes</span>
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" /> {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700">Seleccionar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BoviTrackWebApp() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useLocalStorageState("bovitrack.currentUser", null);
  const [users, setUsers] = useLocalStorageState("bovitrack.users", initialUsers);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [animals, setAnimals] = useLocalStorageState("bovitrack.animals", initialAnimals);
  const [tasks, setTasks] = useLocalStorageState("bovitrack.tasks", initialTasks);

  const createUser = (newUser) => {
    setUsers((previousUsers) => [newUser, ...previousUsers]);
  };

  const logout = () => {
    setUser(null);
    setCurrentPage("dashboard");
  };

  if (screen === "register") {
    return <RegisterScreen users={users} onBack={() => setScreen("login")} onCreateUser={createUser} />;
  }

  if (!user) {
    return (
      <LoginScreen
        users={users}
        onLogin={(selectedUser) => {
          setUser(selectedUser);
          setCurrentPage("dashboard");
        }}
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
