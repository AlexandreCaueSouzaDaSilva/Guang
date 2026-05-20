import { useState } from "react";
import { useRequestRecovery } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
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
    alignItems: "center",
    width: "100%",
    textAlign: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "20px",
  },
  block: {
    width: "300px",
    maxWidth: "90vw",
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
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#ffffff",
  },
  link: {
    color: "#ffcccc",
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default function Recovery() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  const { mutate, isPending } = useRequestRecovery({
    mutation: {
      onSuccess: () => {
        toast({ title: "Email enviado", description: "Verifique sua caixa de entrada." });
        setLocation("/login");
      },
      onError: () => {
        toast({ title: "Erro", description: "Não foi possível enviar o email.", variant: "destructive" });
      },
    },
  });

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Eu quero Recuperar Minha Senha</h2>
        <form style={s.block} onSubmit={(e) => { e.preventDefault(); if (email) mutate({ data: { email } }); }}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={{ ...s.btn, opacity: isPending ? 0.7 : 1 }} type="submit" disabled={isPending || !email}>
            {isPending ? "Enviando..." : "Enviar Link de Recuperação"}
          </button>
        </form>
        <div style={s.footer}>
          <p>Lembrou sua senha? <Link href="/login" style={s.link}>Faça login</Link></p>
        </div>
      </div>
    </div>
  );
}
