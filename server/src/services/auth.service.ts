import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dreamiiti_default_dev_secret_2026';

export const AuthService = {
  async signup(data: { name: string; email: string; password: string; selectedAreas?: string[] }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        profile: {
          create: {
            currentHorizon: '3_months',
            focusDuration: 25,
            workingHoursStart: '09:00',
            workingHoursEnd: '18:00',
            weekStartDay: 'monday',
          },
        },
        settings: {
          create: {
            theme: 'light',
            wellnessEnabled: true,
            gamificationEnabled: true,
            notificationsEnabled: true,
            dailyCheckInTime: '09:00',
            weeklyReviewDay: 'sunday',
          },
        },
      },
    });

    // Create default or personalized life areas
    const defaultAreas = [
      { name: 'Career & Learning', color: '#2E6F52', icon: 'Briefcase' },
      { name: 'Health & Routine', color: '#3B7A57', icon: 'HeartPulse' },
      { name: 'Financial Freedom', color: '#E5A93C', icon: 'Coins' },
      { name: 'Creativity & Hobbies', color: '#8E82B6', icon: 'Palette' },
      { name: 'Personal Growth', color: '#7B6FA1', icon: 'Sparkles' },
    ];

    for (const area of defaultAreas) {
      await prisma.lifeArea.create({
        data: {
          userId: user.id,
          name: area.name,
          color: area.color,
          icon: area.icon,
          isSystem: true,
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
      token,
    };
  },

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      include: { profile: true, settings: true },
    });

    if (!user) {
      // Use non-revealing generic message to avoid account enumeration
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        profile: user.profile,
        settings: user.settings,
      },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        timezone: true,
        createdAt: true,
        profile: true,
        settings: true,
        lifeAreas: true,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  },

  async updateProfile(userId: string, data: any) {
    const updated = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return updated;
  },

  async updateSettings(userId: string, data: any) {
    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return updated;
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // To prevent account enumeration, return success even if user not found
    if (!user) {
      return {
        message: 'If an account exists with this email, a reset code has been issued.',
        resetToken: null,
      };
    }

    // Invalidate existing active tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // In dev mode, return the token so the user can easily reset password without mail server
    return {
      message: 'If an account exists with this email, a reset code has been issued.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  },

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        token: token.trim(),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record) {
      throw new Error('Invalid or expired password reset token.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password has been successfully reset. Please log in.' };
  },
};
