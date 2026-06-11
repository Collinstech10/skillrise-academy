import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth';

function generateReferralCode(username: string): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${username.substring(0, 4).toUpperCase()}${suffix}`;
}

function signToken(user: { id: string; email: string; role: string; status: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, status: user.status },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}

export async function register(req: Request, res: Response) {
  try {
    const { fullname, username, email, phone, password, referral_code } = req.body;

    // Validate required fields
    if (!fullname || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check email uniqueness
    const { data: existingEmail } = await supabaseAdmin
      .from('users').select('id').eq('email', email).maybeSingle();
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check username uniqueness
    const { data: existingUsername } = await supabaseAdmin
      .from('users').select('id').eq('username', username).maybeSingle();
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('users').select('id').eq('referral_code', referral_code).maybeSingle();
      if (!referrer) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
      referrerId = referrer.id;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode(username);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: uuidv4(),
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        phone,
        password_hash,
        referral_code: newReferralCode,
        referred_by: referrerId,
        balance: 0,
        status: 'pending',
        role: 'user',
      })
      .select('id, fullname, username, email, phone, referral_code, referred_by, balance, status, role, created_at')
      .single();

    if (error) throw error;

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (err: unknown) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed. Try again.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, fullname, username, email, phone, password_hash, referral_code, referred_by, balance, status, role, avatar_url, created_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = signToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, token },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Try again.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, fullname, username, email, phone, referral_code, referred_by, balance, status, role, avatar_url, created_at')
      .eq('id', req.user!.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const { data: user } = await supabaseAdmin
      .from('users').select('password_hash').eq('id', req.user!.id).single();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await supabaseAdmin.from('users').update({ password_hash: newHash }).eq('id', req.user!.id);

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
