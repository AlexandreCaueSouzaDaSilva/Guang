import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useGetNotebooks, useCreateNote, getGetNotebooksQueryKey } from "@workspace/api-client-react";

const P = "#E53935";
const SURFACE = "var(--surface)";
const BORDER = "var(--border)";
const FG = "var(--fg)";
const TEXT2 = "var(--text-secondary)";
const BG = "var(--bg)";

export default function Resultado() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState("");
  const [notebookId, setNotebookId] = useState<string>("none");
  const [saveImage, setSaveImage] = useState(true);

  const { data: notebooks } = useGetNotebooks({ query: { queryKey: getGetNotebooksQueryKey() } });

  const createNoteMutation = useCreateNote({
    mutation: {
      onSuccess: () => {
        toast({ title: "Nota salva com sucesso!" });
        setShowSaveModal(false);
        sessionStorage.removeItem("guang_pending_image");
        sessionStorage.removeItem("guang_pending_lang");
        setLocation("/home");
      },
      onError: () => {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      },
    },
  });

  useEffect(() => {
    const data = sessionStorage.getItem("guang_result");
    if (data) {
      const parsed = JSON.parse(data);
      setResult(parsed);
      setTitle(`Nota de ${new Date().toLocaleDateString("pt-BR")}`);
    } else {
      setLocation("/home");
    }
    // Recover the image that was captured
    const img = sessionStorage.getItem("guang_pending_image");
    if (img) setCapturedImage(img);
  }, [setLocation]);

  const copyToClipboard = () => {
    if (!result?.transcribedText) return;
    navigator.clipboard.writeText(result.transcribedText);
    toast({ title: "Texto copiado!" });
  };

  const handleSave = () => {
    if (!result) return;
    createNoteMutation.mutate({
      data: {
        title,
        transcribedText: result.transcribedText,
        imageUrl: saveImage && capturedImage ? capturedImage : null,
        sourceLanguage: result.detectedLanguage ?? null,
        targetLanguage: result.targetLanguage ?? null,
        notebookId: notebookId !== "none" ? parseInt(notebookId) : null,
      },
    });
  };

  if (!result) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`,
    borderRadius: "8px", fontSize: "14px", background: SURFACE, color: FG,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100dvh", background: BG, overflowY: "auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 8px" }}>
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
        <span style={{ fontSize: "20px", fontWeight: 600, color: FG }}>Resultado</span>
      </div>

      {/* Image preview */}
      {capturedImage && (
        <>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "16px 0 10px" }}>
            Imagem capturada
          </div>
          <div style={{ margin: "0 20px", borderRadius: "14px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
            <img src={capturedImage} alt="Imagem enviada" style={{ width: "100%", display: "block", maxHeight: "220px", objectFit: "cover" }} />
          </div>
        </>
      )}

      {/* Language badges */}
      {(result.detectedLanguage || result.targetLanguage) && (
        <div style={{ display: "flex", gap: "8px", padding: "0 20px", margin: "14px 0 0", flexWrap: "wrap" }}>
          {result.detectedLanguage && (
            <span style={{ fontSize: "11px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "3px 8px", color: TEXT2 }}>
              Origem: <strong style={{ color: FG }}>{result.detectedLanguage.toUpperCase()}</strong>
            </span>
          )}
          {result.targetLanguage && (
            <span style={{ fontSize: "11px", background: "#FFEBEE", border: `1px solid ${P}22`, borderRadius: "6px", padding: "3px 8px", color: P }}>
              Traduzido → <strong>{result.targetLanguage.toUpperCase()}</strong>
            </span>
          )}
        </div>
      )}

      {/* Transcribed text */}
      <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "16px 0 10px" }}>
        Texto transcrito
      </div>
      <div style={{ margin: "0 20px", background: SURFACE, borderRadius: "14px", border: `1px solid ${BORDER}`, padding: "16px" }}>
        <p style={{ margin: 0, fontSize: "14px", color: FG, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {result.transcribedText}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", padding: "16px 20px 40px" }}>
        <button
          onClick={copyToClipboard}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", background: SURFACE, color: FG, border: `1px solid ${BORDER}`,
            borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", background: P, color: "#fff", border: "none",
            borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Salvar
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{ background: SURFACE, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: FG, margin: "0 0 20px" }}>Salvar Nota</h3>

            <label style={{ fontSize: "12px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px" }}
              placeholder="Título da nota"
            />

            <label style={{ fontSize: "12px", color: TEXT2, fontWeight: 500, display: "block", marginBottom: "6px" }}>Caderno (opcional)</label>
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px", cursor: "pointer" }}
            >
              <option value="none">Nenhum caderno</option>
              {notebooks?.map((nb) => (
                <option key={nb.id} value={nb.id.toString()}>{nb.name}</option>
              ))}
            </select>

            {/* Image toggle — only shown if there is a captured image */}
            {capturedImage && (
              <div
                onClick={() => setSaveImage((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: BG, border: `1px solid ${BORDER}`,
                  borderRadius: "12px", padding: "12px 14px", marginBottom: "20px",
                  cursor: "pointer", userSelect: "none",
                }}
              >
                {/* Thumbnail */}
                <img
                  src={capturedImage}
                  alt="thumb"
                  style={{ width: 44, height: 44, borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: `1px solid ${BORDER}` }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: FG }}>Salvar imagem junto</p>
                  <span style={{ fontSize: "11px", color: TEXT2 }}>
                    {saveImage ? "A imagem ficará anexada à nota" : "Apenas o texto será salvo"}
                  </span>
                </div>
                {/* Toggle */}
                <div style={{
                  width: 44, height: 26, borderRadius: "13px",
                  background: saveImage ? P : BORDER,
                  position: "relative", flexShrink: 0, transition: "background 0.25s",
                }}>
                  <span style={{
                    position: "absolute", width: 20, height: 20, borderRadius: "50%",
                    background: "#fff", top: 3,
                    left: saveImage ? 21 : 3, transition: "left 0.25s",
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={createNoteMutation.isPending || !title.trim()}
              style={{
                width: "100%", padding: "14px", background: P, color: "#fff",
                border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 600,
                cursor: "pointer", opacity: (createNoteMutation.isPending || !title.trim()) ? 0.6 : 1,
              }}
            >
              {createNoteMutation.isPending ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
