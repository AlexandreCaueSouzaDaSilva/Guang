import { Router } from "express";
import { db } from "@workspace/db";
import { notebooksTable, notesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/notebooks", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notebooks = await db
      .select({
        id: notebooksTable.id,
        name: notebooksTable.name,
        userId: notebooksTable.userId,
        createdAt: notebooksTable.createdAt,
        noteCount: sql<number>`cast(count(${notesTable.id}) as int)`,
      })
      .from(notebooksTable)
      .leftJoin(notesTable, eq(notesTable.notebookId, notebooksTable.id))
      .where(eq(notebooksTable.userId, req.userId!))
      .groupBy(notebooksTable.id);
    res.json(notebooks);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notebooks", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const [notebook] = await db
      .insert(notebooksTable)
      .values({ name: name.trim(), userId: req.userId! })
      .returning();
    res.status(201).json({ ...notebook, noteCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notebooks/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [notebook] = await db
      .select({
        id: notebooksTable.id,
        name: notebooksTable.name,
        userId: notebooksTable.userId,
        createdAt: notebooksTable.createdAt,
        noteCount: sql<number>`cast(count(${notesTable.id}) as int)`,
      })
      .from(notebooksTable)
      .leftJoin(notesTable, eq(notesTable.notebookId, notebooksTable.id))
      .where(
        and(
          eq(notebooksTable.id, id),
          eq(notebooksTable.userId, req.userId!)
        )
      )
      .groupBy(notebooksTable.id);
    if (!notebook) {
      res.status(404).json({ error: "Notebook not found" });
      return;
    }
    res.json(notebook);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/notebooks/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [notebook] = await db
      .select({ id: notebooksTable.id })
      .from(notebooksTable)
      .where(
        and(
          eq(notebooksTable.id, id),
          eq(notebooksTable.userId, req.userId!)
        )
      );
    if (!notebook) {
      res.status(404).json({ error: "Notebook not found" });
      return;
    }
    await db.delete(notebooksTable).where(eq(notebooksTable.id, id));
    res.json({ message: "Notebook deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
