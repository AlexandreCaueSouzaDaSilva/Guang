import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/user/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/user/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const updates: Partial<{ name: string; email: string; passwordHash: string }> = {};
    if (name !== undefined && name.trim()) updates.name = name.trim();
    if (email !== undefined && email.trim()) updates.email = email.toLowerCase().trim();

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: "Senha atual é obrigatória para alterar a senha" });
        return;
      }
      const [userRow] = await db
        .select({ passwordHash: usersTable.passwordHash })
        .from(usersTable)
        .where(eq(usersTable.id, req.userId!));
      const valid = await bcrypt.compare(currentPassword, userRow.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Senha atual incorreta" });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: "Nova senha deve ter ao menos 6 caracteres" });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "Nenhum campo para atualizar" });
      return;
    }

    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, req.userId!))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
      });
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/user/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, req.userId!));
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
