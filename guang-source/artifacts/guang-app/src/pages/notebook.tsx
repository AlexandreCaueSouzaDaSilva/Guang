import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetNotebook,
  useGetNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  getGetNotesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const P = "#E53935";
const SURFACE = "var(--surface)";
const BORDER = "var(--border)";
const FG = "var(--fg)";
const TEXT2 = "var(--text-secondary)";
const BG = "var(--bg)";

const LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "tr", label: "Türkçe" },
  { code: "hi", label: "हिन्दी" },
];

type NoteItem = {
  id: number;
  title: string | null;
  transcribedText: string | null;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  notebookId: number | null;
  createdAt: string;
};

type EditorMode = "closed" | "new" | "view" | "edit";

export default function Notebook() {
  const params = useParams();
  const notebookId = params.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: notebook, isLoading: isLoadingNotebook } = useGetNotebook(notebookId as number, {
    query: { enabled: !!notebookId },
  });
  const { data: notes, isLoading: isLoadingNotes } = useGetNotes(
    { notebookId },
    { query: { queryKey: getGetNotesQueryKey({ notebookId }), enabled: !!notebookId } }
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: getGetNotesQueryKey({ notebookId }) });

  const createMutation = useCreateNote({ mutation: { onSuccess: invalidate } });
  const updateMutation = useUpdateNote({ mutation: { onSuccess: invalidate } });
  const deleteMutation = useDeleteNote({ mutation: { onSuccess: invalidate } });

  // Editor state
  const [mode, setMode] = useState<EditorMode>("closed");
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const openNew = () => {
    setActiveNote(null);
    setTitle("");
    setContent("");
    setTranslated(null);
    setMode("new");
  };

  const openView = (note: NoteItem) => {
    setActiveNote(note);
    setTitle(note.title ?? "");
    setContent(note.transcribedText ?? "");
    setTranslated(null);
    setMode("view");
  };

  const openEdit = () => setMode("edit");

  const closeEditor = () => {
    setMode("closed");
    setActiveNote(null);
    setTranslated(null);
  };

  const handleTranslate = async () => {
    const text = translated ?? content;
    if (!text.trim()) {
      toast({ title: "Escreva algo antes de traduzir", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    try {
      const token = localStorage.getItem("guang_token");
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, targetLanguage: targetLang }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Erro na tradução");
      }
      const data = await res.json();
      setTranslated(data.translatedText);
      toast({ title: "Tradução concluída!" });
    } catch (e: any) {
      toast({ title: e.message ?? "Erro ao traduzir", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({ title: "Escreva algo na nota", variant: "destructive" });
      return;
    }
    const noteTitle = title.trim() || content.slice(0, 40);
    try {
      if (mode === "new") {
        await createMutation.mutateAsync({
          data: {
            title: noteTitle,
            transcribedText: translated ?? content,
            notebookId: notebookId ?? null,
            sourceLanguage: null,
            targetLanguage: translated ? targetLang : null,
          },
        });
        toast({ title: "Nota salva!" });
        closeEditor();
      } else if (mode === "edit" && activeNote) {
        await updateMutation.mutateAsync({
          id: activeNote.id,
          data: {
            title: noteTitle,
            transcribedText: translated ?? content,
            targetLanguage: translated ? targetLang : activeNote.targetLanguage ?? null,
          },
        });
        toast({ title: "Nota atualizada!" });
        closeEditor();
      }
    } catch (e: any) {
      toast({ title: e.message ?? "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Nota excluída" });
      setDeleteConfirmId(null);
      if (mode !== "closed") closeEditor();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEditing = mode === "new" || mode === "edit";
  const isOpen = mode !== "closed";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: `1px solid ${BORDER}`, background: BG, color: FG,
    fontSize: "15px", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100dvh", background: BG, overflowY: "auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <Link href="/notebooks">
          <button style={{ width: 38, height: 38, borderRadius: "50%", background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: FG, cursor: "pointer" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
        </Link>
        <span style={{ fontSize: "20px", fontWeight: 600, color: FG }}>
          {isLoadingNotebook ? "..." : notebook?.name ?? "Caderno"}
        </span>
        <button
          onClick={openNew}
          style={{ width: 38, height: 38, borderRadius: "50%", background: P, border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      {/* Notes list */}
      <div style={{ padding: "8px 20px 100px" }}>
        {isLoadingNotes ? (
          <p style={{ color: TEXT2, textAlign: "center", padding: "40px 0" }}>Carregando...</p>
        ) : notes && notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "14px", marginBottom: "10px", cursor: "pointer", position: "relative" }}
            >
              <div onClick={() => openView(note as NoteItem)} style={{ paddingRight: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: FG, flex: 1 }}>
                    {note.title ?? "Sem título"}
                  </h3>
                  {note.targetLanguage && (
                    <span style={{ fontSize: "10px", color: P, background: "#FFEBEE", borderRadius: "4px", padding: "2px 6px", fontWeight: 500 }}>
                      {LANGUAGES.find(l => l.code === note.targetLanguage)?.label ?? note.targetLanguage}
                    </span>
                  )}
                </div>
                <p style={{
                  margin: 0, fontSize: "13px", color: TEXT2, lineHeight: 1.5,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                }}>
                  {note.transcribedText}
                </p>
                <span style={{ fontSize: "11px", color: TEXT2, marginTop: "6px", display: "block" }}>
                  {new Date(note.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              {/* Delete button */}
              {deleteConfirmId === note.id ? (
                <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: "4px" }}>
                  <button onClick={() => handleDelete(note.id)} style={{ padding: "4px 8px", background: P, color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                    {deleteMutation.isPending ? "..." : "Apagar"}
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)} style={{ padding: "4px 8px", background: SURFACE, color: FG, border: `1px solid ${BORDER}`, borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(note.id); }}
                  style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: TEXT2, padding: 2 }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: TEXT2 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" fill="none" stroke={TEXT2} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <p style={{ fontSize: "15px", fontWeight: 500, margin: "0 0 6px" }}>Caderno vazio</p>
            <p style={{ fontSize: "13px", margin: 0 }}>Toque no + para escrever sua primeira nota</p>
          </div>
        )}
      </div>

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={openNew}
          style={{
            position: "fixed", bottom: 28, right: 24,
            width: 56, height: 56, borderRadius: "50%",
            background: P, border: "none", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 4px 16px rgba(229,57,53,0.4)",
            zIndex: 50,
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      )}

      {/* ── Bottom Sheet: Editor ── */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={closeEditor}
        >
          <div
            style={{ background: SURFACE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, margin: "0 auto", maxHeight: "90dvh", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <span style={{ fontSize: "16px", fontWeight: 600, color: FG }}>
                {mode === "new" ? "Nova nota" : mode === "edit" ? "Editar nota" : (activeNote?.title ?? "Nota")}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                {mode === "view" && (
                  <button
                    onClick={openEdit}
                    style={{ padding: "6px 14px", background: P, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                  >
                    Editar
                  </button>
                )}
                <button onClick={closeEditor} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT2, display: "flex", alignItems: "center" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Sheet body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
              {isEditing && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>Título (opcional)</label>
                  <input
                    style={inputStyle}
                    placeholder="Título da nota"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginBottom: "12px" }}>
                {isEditing && (
                  <label style={{ fontSize: "12px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>Conteúdo</label>
                )}
                {isEditing ? (
                  <textarea
                    style={{ ...inputStyle, minHeight: "140px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                    placeholder="Escreva sua nota aqui..."
                    value={content}
                    onChange={e => { setContent(e.target.value); setTranslated(null); }}
                    autoFocus={mode === "new"}
                  />
                ) : (
                  <>
                    {activeNote?.imageUrl && (
                      <div style={{ marginBottom: "12px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                        <img src={activeNote.imageUrl} alt="Imagem da nota" style={{ width: "100%", display: "block", maxHeight: "200px", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ fontSize: "14px", color: FG, lineHeight: 1.7, whiteSpace: "pre-wrap", background: BG, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                      {activeNote?.transcribedText}
                    </div>
                  </>
                )}
              </div>

              {/* Translation result */}
              {translated && (
                <div style={{ marginBottom: "12px", background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <svg width="14" height="14" fill="none" stroke="#F57F17" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3h14M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M9 3v18M9 9h6" /></svg>
                    <span style={{ fontSize: "12px", color: "#F57F17", fontWeight: 600 }}>
                      Tradução — {LANGUAGES.find(l => l.code === targetLang)?.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#4E342E", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{translated}</p>
                </div>
              )}

              {/* Translate controls */}
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <svg width="15" height="15" fill="none" stroke={P} strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3h14M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2M9 3v18M9 9h6" /></svg>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: FG }}>Traduzir para</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={targetLang}
                    onChange={e => { setTargetLang(e.target.value); setTranslated(null); }}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: SURFACE, color: FG, fontSize: "14px", outline: "none" }}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating || (!content.trim() && !activeNote?.transcribedText?.trim())}
                    style={{
                      padding: "10px 16px", background: isTranslating ? BORDER : "#FF7043",
                      color: isTranslating ? TEXT2 : "#fff", border: "none",
                      borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                      cursor: isTranslating ? "default" : "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {isTranslating ? "..." : "Traduzir"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sheet footer */}
            {isEditing && (
              <div style={{ padding: "12px 20px 32px", borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: "flex", gap: "10px" }}>
                <button
                  onClick={closeEditor}
                  style={{ flex: 1, padding: "13px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "10px", color: FG, fontSize: "15px", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ flex: 2, padding: "13px", background: P, border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                >
                  {isSaving ? "Salvando..." : translated ? "Salvar tradução" : "Salvar nota"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
