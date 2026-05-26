import { useState } from "react";
import { useGetNotebooks, useCreateNotebook, getGetNotebooksQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";

const P = "#E53935";
const SURFACE = "var(--surface)";
const BORDER = "var(--border)";
const FG = "var(--fg)";
const TEXT2 = "var(--text-secondary)";
const BG = "var(--bg)";

export default function Notebooks() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: notebooks, isLoading } = useGetNotebooks({ query: { queryKey: getGetNotebooksQueryKey() } });

  const createMutation = useCreateNotebook({
    mutation: {
      onSuccess: () => {
        toast({ title: "Caderno criado" });
        setShowForm(false);
        setNewName("");
        queryClient.invalidateQueries({ queryKey: getGetNotebooksQueryKey() });
      },
      onError: () => toast({ title: "Erro ao criar caderno", variant: "destructive" }),
    },
  });

  return (
    <div style={{ minHeight: "100dvh", background: BG, overflowY: "auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
        <Link href="/home">
          <button style={{
            width: 38, height: 38, borderRadius: "50%", background: SURFACE,
            border: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: FG, cursor: "pointer",
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        </Link>
        <span style={{ fontSize: "24px", fontWeight: 600, color: FG }}>Notebooks</span>
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: 38, height: 38, borderRadius: "50%", background: SURFACE,
            border: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: FG, cursor: "pointer",
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Section label */}
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "16px 0 10px" }}>
        Meus Notebooks
      </div>

      {/* Inline create form */}
      {showForm && (
        <div style={{ margin: "0 20px 16px", display: "flex", gap: "8px" }}>
          <input
            autoFocus
            placeholder="Nome do caderno"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMutation.mutate({ data: { name: newName } })}
            style={{
              flex: 1, padding: "10px 12px", border: `1px solid ${BORDER}`,
              borderRadius: "8px", fontSize: "14px", background: SURFACE, color: FG, outline: "none",
            }}
          />
          <button
            onClick={() => { if (newName.trim()) createMutation.mutate({ data: { name: newName } }); }}
            disabled={createMutation.isPending || !newName.trim()}
            style={{ padding: "10px 16px", background: P, color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Criar
          </button>
          <button onClick={() => { setShowForm(false); setNewName(""); }} style={{ padding: "10px 12px", background: SURFACE, color: FG, border: `1px solid ${BORDER}`, borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
            X
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: TEXT2 }}>Carregando...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "0 20px 32px" }}>
          {notebooks?.map((nb) => (
            <div
              key={nb.id}
              onClick={() => setLocation(`/notebooks/${nb.id}`)}
              style={{
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: "16px", padding: "12px", cursor: "pointer",
              }}
            >
              <div style={{ width: "100%", height: "80px", background: BORDER, borderRadius: "10px", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: FG }}>{nb.name}</p>
              <span style={{ fontSize: "11px", color: TEXT2 }}>{nb.noteCount} transcrições</span>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: SURFACE, border: `1.5px dashed ${P}`,
              borderRadius: "16px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "12px", color: P, fontSize: "13px", fontWeight: 500,
              minHeight: "130px", cursor: "pointer",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Novo</span>
          </button>
        </div>
      )}
    </div>
  );
}
