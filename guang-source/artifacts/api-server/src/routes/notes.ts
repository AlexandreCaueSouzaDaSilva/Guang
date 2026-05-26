import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/notes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notebookId = req.query.notebookId
      ? parseInt(req.query.notebookId as string)
      : undefined;
    const conditions = [eq(notesTable.userId, req.userId!)];
    if (notebookId) {
      conditions.push(eq(notesTable.notebookId, notebookId));
    }
    const notes = await db
      .select()
      .from(notesTable)
      .where(and(...conditions))
      .orderBy(notesTable.createdAt);
    res.json(notes);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, transcribedText, imageUrl, sourceLanguage, targetLanguage, notebookId } =
      req.body as {
        title?: string;
        transcribedText?: string;
        imageUrl?: string | null;
        sourceLanguage?: string | null;
        targetLanguage?: string | null;
        notebookId?: number | null;
      };
    if (!title?.trim() || !transcribedText) {
      res.status(400).json({ error: "Title and transcribedText are required" });
      return;
    }
    const [note] = await db
      .insert(notesTable)
      .values({
        title: title.trim(),
        transcribedText,
        imageUrl: imageUrl ?? null,
        sourceLanguage: sourceLanguage ?? null,
        targetLanguage: targetLanguage ?? null,
        userId: req.userId!,
        notebookId: notebookId ?? null,
      })
      .returning();
    res.status(201).json(note);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [note] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)));
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { title, transcribedText, notebookId } = req.body as {
      title?: string;
      transcribedText?: string;
      notebookId?: number | null;
    };
    const updates: Partial<{
      title: string;
      transcribedText: string;
      notebookId: number | null;
    }> = {};
    if (title) updates.title = title.trim();
    if (transcribedText !== undefined) updates.transcribedText = transcribedText;
    if (notebookId !== undefined) updates.notebookId = notebookId;
    const [note] = await db
      .update(notesTable)
      .set(updates)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)))
      .returning();
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [note] = await db
      .select({ id: notesTable.id })
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)));
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    await db.delete(notesTable).where(eq(notesTable.id, id));
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
