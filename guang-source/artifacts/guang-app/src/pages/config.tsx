import { useState, useRef, useEffect } from "react";
import { useGetMe, useDeleteMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const P = "#E53935";
const SURFACE = "var(--surface)";
const BORDER = "var(--border)";
const FG = "var(--fg)";
const TEXT2 = "var(--text-secondary)";
const BG = "var(--bg)";

type Modal = "none" | "name" | "password" | "delete";

export default function Config() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: user } = useGetMe({}, { query: { queryKey: getGetMeQueryKey() } });
  const updateMutation = useUpdateMe({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
    },
  });
  const deleteMutation = useDeleteMe({
    mutation: { onSuccess: () => logout() },
  });

  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem("guang_dark") === "1");
  const [modal, setModal] = useState<Modal>("none");
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem("guang_avatar"));

  const [newName, setNewName] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdVisible, setPwdVisible] = useState(false);

  useEffect(() => {
    if (modal === "name" && user?.name) setNewName(user.name);
    if (modal !== "password") { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }
  }, [modal, user?.name]);

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  const toggleTema = () => {
    const next = !temaEscuro;
    setTemaEscuro(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("guang_dark", next ? "1" : "0");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 2 MB)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAvatar(b64);
      localStorage.setItem("guang_avatar", b64);
      toast({ title: "Foto atualizada!" });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      await updateMutation.mutateAsync({ data: { name: newName.trim() } });
      toast({ title: "Nome atualizado!" });
      setModal("none");
    } catch (e: any) {
      toast({ title: e?.message ?? "Erro ao atualizar nome", variant: "destructive" });
    }
  };

  const handleSavePassword = async () => {
    if (!currentPwd || !newPwd) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (newPwd.length < 6) {
      toast({ title: "Nova senha deve ter ao menos 6 caracteres", variant: "destructive" });
      return;
    }
    try {
      await updateMutation.mutateAsync({ data: { currentPassword: currentPwd, newPassword: newPwd } as any });
      toast({ title: "Senha alterada com sucesso!" });
      setModal("none");
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? "Erro ao alterar senha";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    zIndex: 100, padding: "0 0 0 0",
  };
  const sheetStyle: React.CSSProperties = {
    background: SURFACE, borderRadius: "20px 20px 0 0",
    padding: "24px 20px 40px", width: "100%", maxWidth: 480,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: `1px solid ${BORDER}`, background: BG, color: FG,
    fontSize: "15px", outline: "none", boxSizing: "border-box",
  };
  const btnPrimary: React.CSSProperties = {
    flex: 1, padding: "13px", background: P, border: "none",
    borderRadius: "10px", color: "#fff", fontSize: "15px",
    fontWeight: 600, cursor: "pointer",
  };
  const btnSecondary: React.CSSProperties = {
    flex: 1, padding: "13px", background: SURFACE,
    border: `1px solid ${BORDER}`, borderRadius: "10px",
    color: FG, fontSize: "15px", cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100dvh", background: BG, overflowY: "auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <Link href="/home">
          <button style={{ width: 38, height: 38, borderRadius: "50%", background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: FG, cursor: "pointer" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
        </Link>
        <span style={{ fontSize: "20px", fontWeight: 600, color: FG }}>Perfil</span>
        <div style={{ width: 38 }} />
      </div>

      {/* Avatar section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px 16px", gap: "12px" }}>
        <div style={{ position: "relative" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 90, height: 90, borderRadius: "50%", background: P,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: 700, color: "#fff", cursor: "pointer",
              overflow: "hidden", border: `3px solid ${P}`, flexShrink: 0,
            }}
          >
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initial}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: P, border: "2px solid " + BG,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: FG }}>{user?.name ?? "..."}</p>
          <span style={{ fontSize: "13px", color: TEXT2 }}>{user?.email}</span>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          style={{ fontSize: "13px", color: P, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
        >
          Alterar foto de perfil
        </button>
      </div>

      {/* Section: Conta */}
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "8px 0 10px" }}>Conta</div>
      <div style={{ margin: "0 20px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px", overflow: "hidden" }}>
        {/* Edit name */}
        <button
          onClick={() => setModal("name")}
          style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", gap: "12px", borderBottom: `1px solid ${BORDER}`, background: "none", cursor: "pointer" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="#1565C0" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: "left", marginLeft: "12px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: FG }}>Editar nome</p>
            <span style={{ fontSize: "12px", color: TEXT2 }}>{user?.name}</span>
          </div>
          <svg width="16" height="16" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        {/* Change password */}
        <button
          onClick={() => setModal("password")}
          style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", gap: "12px", background: "none", cursor: "pointer", border: "none" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#F3E5F5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="#7B1FA2" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: "left", marginLeft: "12px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: FG }}>Alterar senha</p>
            <span style={{ fontSize: "12px", color: TEXT2 }}>Mude sua senha de acesso</span>
          </div>
          <svg width="16" height="16" fill="none" stroke={TEXT2} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Section: Preferências */}
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "20px 0 10px" }}>Preferências</div>
      <div style={{ margin: "0 20px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "18px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: "12px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--icon-dark-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="var(--icon-dark-color)" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          </div>
          <div style={{ flex: 1, marginLeft: "12px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: FG }}>Tema escuro</p>
            <span style={{ fontSize: "12px", color: TEXT2 }}>{temaEscuro ? "Ativado" : "Desativado"}</span>
          </div>
          <button
            onClick={toggleTema}
            style={{ width: 44, height: 26, borderRadius: "13px", background: temaEscuro ? P : BORDER, border: "none", position: "relative", cursor: "pointer", transition: "background 0.3s", flexShrink: 0 }}
          >
            <span style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: "#fff", top: 3, left: temaEscuro ? 21 : 3, transition: "left 0.3s" }} />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 20px 48px" }}>
        <button
          onClick={logout}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "14px", border: `1px solid ${BORDER}`, background: SURFACE, color: TEXT2, fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          Deslogar Conta
        </button>
        <button
          onClick={() => setModal("delete")}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "14px", border: `1px solid ${P}`, background: "transparent", color: P, fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
          Deletar Conta
        </button>
      </div>

      {/* ── Modal: Editar Nome ── */}
      {modal === "name" && (
        <div style={overlayStyle} onClick={() => setModal("none")}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: 600, color: FG }}>Editar nome</h3>
            <label style={{ fontSize: "13px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>Nome completo</label>
            <input
              style={inputStyle}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Seu nome"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleSaveName()}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={btnSecondary} onClick={() => setModal("none")}>Cancelar</button>
              <button style={btnPrimary} disabled={updateMutation.isPending} onClick={handleSaveName}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Alterar Senha ── */}
      {modal === "password" && (
        <div style={overlayStyle} onClick={() => setModal("none")}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: 600, color: FG }}>Alterar senha</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Senha atual", value: currentPwd, set: setCurrentPwd, placeholder: "Digite a senha atual" },
                { label: "Nova senha", value: newPwd, set: setNewPwd, placeholder: "Mínimo 6 caracteres" },
                { label: "Confirmar nova senha", value: confirmPwd, set: setConfirmPwd, placeholder: "Repita a nova senha" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: "13px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: "42px" }}
                      type={pwdVisible ? "text" : "password"}
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setPwdVisible(v => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center" }}
                    >
                      {pwdVisible
                        ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={btnSecondary} onClick={() => setModal("none")}>Cancelar</button>
              <button style={btnPrimary} disabled={updateMutation.isPending} onClick={handleSavePassword}>
                {updateMutation.isPending ? "Salvando..." : "Alterar senha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Deletar Conta ── */}
      {modal === "delete" && (
        <div style={overlayStyle} onClick={() => setModal("none")}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" fill="none" stroke={P} strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              </div>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 600, color: FG, textAlign: "center" }}>Deletar conta</h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: TEXT2, textAlign: "center" }}>
              Esta ação é permanente. Todos os seus dados, notas e notebooks serão apagados.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={btnSecondary} onClick={() => setModal("none")}>Cancelar</button>
              <button
                style={{ ...btnPrimary, background: P }}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Deletando..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
