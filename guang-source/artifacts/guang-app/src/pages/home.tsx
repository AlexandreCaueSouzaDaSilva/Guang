import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetLanguages, useTranscribeImage, useGetNotes, getGetNotesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const P = "#E53935";
const SURFACE = "var(--surface)";
const BORDER = "var(--border)";
const FG = "var(--fg)";
const TEXT2 = "var(--text-secondary)";
const BG = "var(--bg)";

const SESSION_IMG_KEY = "guang_pending_image";
const SESSION_LANG_KEY = "guang_pending_lang";

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Restore state from sessionStorage in case Android reloaded the page
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    try { return sessionStorage.getItem(SESSION_IMG_KEY); } catch { return null; }
  });
  const [imageBase64, setImageBase64] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_IMG_KEY);
      return saved ? saved.split(",")[1] ?? null : null;
    } catch { return null; }
  });
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    try { return sessionStorage.getItem(SESSION_LANG_KEY) ?? "none"; } catch { return "none"; }
  });

  const { data: languages } = useGetLanguages();
  const { data: notes } = useGetNotes({}, { query: { queryKey: getGetNotesQueryKey() } });

  // Keep sessionStorage in sync whenever state changes
  useEffect(() => {
    try {
      if (imagePreview) {
        sessionStorage.setItem(SESSION_IMG_KEY, imagePreview);
      } else {
        sessionStorage.removeItem(SESSION_IMG_KEY);
      }
    } catch { /* storage full – ignore */ }
  }, [imagePreview]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_LANG_KEY, targetLanguage);
    } catch { /* ignore */ }
  }, [targetLanguage]);

  const transcribeMutation = useTranscribeImage({
    mutation: {
      onSuccess: (data) => {
        sessionStorage.setItem("guang_result", JSON.stringify(data));
        // Clear pending image after successful transcription
        sessionStorage.removeItem(SESSION_IMG_KEY);
        sessionStorage.removeItem(SESSION_LANG_KEY);
        setLocation("/resultado");
      },
      onError: () => {
        toast({ title: "Erro na transcrição", description: "Não foi possível ler a imagem.", variant: "destructive" });
      },
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress large images before converting to base64 to avoid memory issues on Android
    const maxSize = 1280;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setImagePreview(compressed);
        setImageBase64(compressed.split(",")[1]);
        // Reset file input so Android can retake same photo
        e.target.value = "";
      };
      img.onerror = () => {
        // Fallback: use original if canvas fails
        setImagePreview(dataUrl);
        setImageBase64(dataUrl.split(",")[1]);
        e.target.value = "";
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    // Reset file inputs so same file can be selected again
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const onTranscribe = () => {
    if (!imageBase64) return;
    transcribeMutation.mutate({
      data: { imageBase64, targetLanguage: targetLanguage !== "none" ? targetLanguage : undefined },
    });
  };

  const recentNotes = notes?.slice(0, 4) ?? [];

  return (
    <div style={{ minHeight: "100dvh", background: BG, overflowY: "auto" }}>
      {/* Topbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
        <span style={{ fontSize: "24px", fontWeight: 600, color: FG }}>Guang Project</span>
        <Link href="/config">
          <button style={{
            width: 38, height: 38, borderRadius: "50%", background: SURFACE,
            border: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
            justifyContent: "center", color: FG, cursor: "pointer",
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Section label */}
      <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, padding: "0 20px", margin: "16px 0 10px" }}>
        nova transcrição
      </div>

      {/* Hidden file inputs — capture="" without value forces retake */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {imagePreview ? (
        <div style={{ margin: "0 20px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${BORDER}`, position: "relative" }}>
          <img src={imagePreview} alt="Preview" style={{ width: "100%", display: "block", maxHeight: "240px", objectFit: "cover" }} />
          <button onClick={clearImage} style={{
            position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.65)",
            color: "#fff", border: "none", borderRadius: "8px", padding: "5px 12px",
            fontSize: "12px", cursor: "pointer", fontWeight: 500,
          }}>Limpar</button>
          <button
            onClick={() => cameraRef.current?.click()}
            style={{
              position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.65)",
              color: "#fff", border: "none", borderRadius: "8px", padding: "5px 12px",
              fontSize: "12px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: "5px",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
            </svg>
            Tirar outra
          </button>
        </div>
      ) : (
        <div
          onClick={() => galleryRef.current?.click()}
          style={{
            margin: "0 20px", background: SURFACE, border: `1.5px dashed ${P}`,
            borderRadius: "12px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "8px",
            height: "200px", cursor: "pointer",
          }}
        >
          <div style={{
            width: 52, height: 52, background: "var(--card-bg, #f5f5f5)", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${BORDER}`, color: P,
          }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: P, fontWeight: 500 }}>Toque para selecionar imagem</p>
          <span style={{ fontSize: "11px", color: TEXT2 }}>JPG, PNG, HEIC</span>
        </div>
      )}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 20px" }}>
        <div style={{ flex: 1, height: "1px", background: BORDER }} />
        <span style={{ fontSize: "11px", color: TEXT2 }}>ou</span>
        <div style={{ flex: 1, height: "1px", background: BORDER }} />
      </div>

      {/* Camera button */}
      <button
        onClick={() => cameraRef.current?.click()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          margin: "0 20px", width: "calc(100% - 40px)", background: SURFACE,
          color: FG, border: `1px solid ${BORDER}`, borderRadius: "14px",
          padding: "14px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
        }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        Usar câmera
      </button>

      {/* Language selector */}
      {imagePreview && (
        <div style={{ margin: "16px 20px 0" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500, marginBottom: "8px" }}>
            idioma de destino
          </div>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`,
              borderRadius: "8px", fontSize: "14px", background: SURFACE, color: FG,
              outline: "none", cursor: "pointer",
            }}
          >
            <option value="none">Original (sem tradução)</option>
            {languages?.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
            ))}
          </select>
        </div>
      )}

      {/* Recentes */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", margin: "20px 0 10px" }}>
        <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: TEXT2, fontWeight: 500 }}>recentes</span>
        <Link href="/notebooks">
          <span style={{ fontSize: "12px", color: P, fontWeight: 500, cursor: "pointer" }}>Ver todos</span>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "10px", padding: "0 20px", overflowX: "auto", paddingBottom: "8px" }}>
        {recentNotes.length === 0 ? (
          <p style={{ fontSize: "12px", color: TEXT2, margin: 0 }}>Nenhuma nota recente.</p>
        ) : recentNotes.map((note) => (
          <div key={note.id} style={{
            flexShrink: 0, background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: "12px", padding: "8px", width: "100px",
          }}>
            <div style={{ width: "100%", height: "50px", background: BORDER, borderRadius: "8px", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke={TEXT2} strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: FG, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {note.title ?? "Sem título"}
            </p>
            <span style={{ fontSize: "10px", color: TEXT2 }}>
              {new Date(note.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>

      {/* Transcribe button */}
      <button
        onClick={onTranscribe}
        disabled={!imageBase64 || transcribeMutation.isPending}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          margin: "20px 20px 32px", width: "calc(100% - 40px)", background: P,
          color: "#fff", border: "none", borderRadius: "14px",
          padding: "16px", fontSize: "15px", fontWeight: 500, cursor: "pointer",
          opacity: (!imageBase64 || transcribeMutation.isPending) ? 0.45 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {transcribeMutation.isPending ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Transcrevendo...
          </>
        ) : (
          <>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
            Transcrever
          </>
        )}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
