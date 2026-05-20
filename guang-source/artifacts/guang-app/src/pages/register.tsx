import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(135deg, #000000, #ff0000 50%, #990000 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: "10vh",
    paddingBottom: "40px",
  },
  title: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "20px",
    textAlign: "center",
  },
  block: {
    width: "320px",
    maxWidth: "90vw",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(255,0,0,0.5)",
  },
  label: {
    fontSize: "12px",
    color: "#ccc",
    textAlign: "left",
    marginBottom: "4px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #444",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "12px",
    outline: "none",
    color: "#ffffff",
    background: "rgba(255,255,255,0.1)",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#ff0000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "4px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#ffffff",
    textAlign: "center",
  },
  link: {
    color: "#ff6666",
    fontWeight: 700,
    textDecoration: "none",
  },
  error: {
    color: "#ff6666",
    fontSize: "11px",
    marginTop: "-8px",
    marginBottom: "8px",
    textAlign: "left" as const,
  },
};

export default function Register() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", pin: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useRegister({
    mutation: {
      onSuccess: (data) => login(data.token),
      onError: () => {
        toast({ title: "Erro ao cadastrar", description: "Tente novamente.", variant: "destructive" });
      },
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.email.includes("@")) e.email = "Email inválido";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas não coincidem";
    if (form.pin && form.pin.length !== 6) e.pin = "PIN deve ter 6 dígitos";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    mutate({ data: { name: form.name, email: form.email, password: form.password, pin: form.pin || null } });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div style={s.page}>
      <h2 style={s.title}>Registrar</h2>
      <form style={s.block} onSubmit={handleSubmit}>
        <label style={s.label}>Nome</label>
        <input style={s.input} placeholder="Seu nome" value={form.name} onChange={set("name")} />
        {errors.name && <p style={s.error}>{errors.name}</p>}

        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} />
        {errors.email && <p style={s.error}>{errors.email}</p>}

        <label style={s.label}>Senha</label>
        <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set("password")} />
        {errors.password && <p style={s.error}>{errors.password}</p>}

        <label style={s.label}>Repetir Senha</label>
        <input style={s.input} type="password" placeholder="Repita a senha" value={form.confirmPassword} onChange={set("confirmPassword")} />
        {errors.confirmPassword && <p style={s.error}>{errors.confirmPassword}</p>}

        <label style={s.label}>PIN (6 dígitos, opcional)</label>
        <input style={s.input} type="number" placeholder="000000" maxLength={6} value={form.pin} onChange={set("pin")} />
        {errors.pin && <p style={s.error}>{errors.pin}</p>}

        <button style={{ ...s.btn, opacity: isPending ? 0.7 : 1 }} type="submit" disabled={isPending}>
          {isPending ? "Cadastrando..." : "Criar Conta"}
        </button>
      </form>
      <div style={s.footer}>
        <p>Já tem uma conta? <Link href="/login" style={s.link}>Faça login</Link></p>
      </div>
    </div>
  );
}
