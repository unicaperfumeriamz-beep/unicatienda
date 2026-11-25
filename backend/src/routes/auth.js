import express from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { users, notifications } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, referralCode } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields', code: 'BAD_REQUEST' });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use', code: 'CONFLICT' });
    }

    let referredBy = null;
    let referrerUser = null;
    if (referralCode) {
      const cleanRefCode = referralCode.trim();
      const { loyaltySettings } = await import('../db/schema.js');
      const settings = await db.select().from(loyaltySettings).limit(1);
      
      if (settings.length > 0 && settings[0].isReferralProgramActive) {
        const referrer = await db.select().from(users).where(eq(users.referralCode, cleanRefCode)).limit(1);
        if (referrer.length > 0) {
          referrerUser = referrer[0];
          referredBy = referrerUser.id;
          
          // Recompensar al referidor con 500 puntos por haber referido a alguien
          const newReferrerPoints = (referrerUser.points || 0) + 500;
          await db.update(users)
            .set({ points: newReferrerPoints })
            .where(eq(users.id, referrerUser.id));

          // Notificar al referidor
          try {
            await db.insert(notifications).values({
              id: crypto.randomUUID(),
              userId: referrerUser.id,
              title: '¡Puntos por referir a un amigo!',
              message: `¡${name} se ha registrado con tu código de invitación! Sumaste 500 puntos a tu cuenta.`,
              createdAt: new Date(),
            });
          } catch (notifErr) {
            console.error('Error creando notificación de referido:', notifErr);
          }
        }
      }
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();
    const newReferralCode = crypto.randomBytes(4).toString('hex');

    // El nuevo usuario inicia con 0 puntos. Únicamente sumará puntos si realiza una compra o refiere a alguien.
    await db.insert(users).values({
      id,
      name,
      email,
      phone,
      address,
      points: 0,
      passwordHash: hashedPassword,
      referralCode: newReferralCode,
      referredBy,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields', code: 'BAD_REQUEST' });
    }

    const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userRecord[0];

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // En un proyecto real, se guarda el refreshToken en cookies HttpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points || 0, referralCode: user.referralCode }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const userRecord = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const user = userRecord[0];
    if (!user) return res.status(404).json({ success: false });
    res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points || 0, referralCode: user.referralCode }
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/referrals', authenticate, async (req, res) => {
  try {
    const referredUsers = await db.select({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt
    }).from(users).where(eq(users.referredBy, req.user.id));
    
    res.json({ success: true, data: referredUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/referrals/status', async (req, res) => {
  try {
    const { loyaltySettings } = await import('../db/schema.js');
    const settings = await db.select().from(loyaltySettings).limit(1);
    const isActive = settings.length > 0 ? settings[0].isReferralProgramActive : false;
    res.json({ success: true, data: { isActive } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
