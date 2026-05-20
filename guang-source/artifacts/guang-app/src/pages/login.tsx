import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(135deg, #fd0000a8, #ff3636a8 50%, #ff0000a8 50%, #ff0000)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    textAlign: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "20px",
  },
  block: {
    width: "300px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    textAlign: "left",
    marginBottom: "4px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E0E0E0",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "12px",
    outline: "none",
    color: "#1A1A1A",
    background: "#fff",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#E53935",
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
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  link: {
    color: "#ffcccc",
    fontWeight: 700,
    textDecoration: "none",
  },
};

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => login(data.token),
      onError: () => {
        toast({ title: "Credenciais inválidas", description: "Verifique email e senha.", variant: "destructive" });
      },
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => mutate({ data: values });

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Login</h2>
        <form style={s.block} onSubmit={handleSubmit(onSubmit)}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="Digite seu email" {...register("email")} />
          {errors.email && <p style={{ color: "#E53935", fontSize: "11px", marginTop: "-8px", marginBottom: "8px", textAlign: "left" }}>{errors.email.message}</p>}

          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" placeholder="Digite sua senha" {...register("password")} />
          {errors.password && <p style={{ color: "#E53935", fontSize: "11px", marginTop: "-8px", marginBottom: "8px", textAlign: "left" }}>{errors.password.message}</p>}

          <button style={{ ...s.btn, opacity: isPending ? 0.7 : 1 }} type="submit" disabled={isPending}>
            {isPending ? "Entrando..." : "Login"}
          </button>
        </form>

        <div style={s.footer}>
          <p>Você não tem uma conta? <Link href="/register" style={s.link}>Sign up</Link></p>
          <p>Esqueci minha senha? <Link href="/recovery" style={s.link}>Recuperar senha</Link></p>
        </div>
      </div>
    </div>
  );
}
