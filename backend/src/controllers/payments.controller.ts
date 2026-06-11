import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { verifyPaystackTransaction } from '../lib/paystack';
import { v4 as uuidv4 } from 'uuid';

const MEMBERSHIP_FEE = 2000;
const REFERRAL_REWARD = 500;

export async function verifyMembership(req: AuthRequest, res: Response) {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ success: false, message: 'Payment reference required' });

    const userId = req.user!.id;

    // Check already active
    const { data: currentUser } = await supabaseAdmin
      .from('users').select('status, referred_by').eq('id', userId).single();

    if (currentUser?.status === 'active') {
      return res.status(400).json({ success: false, message: 'Membership already active' });
    }

    // Check duplicate payment reference
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status').eq('payment_reference', reference).maybeSingle();

    if (existingPayment?.status === 'success') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    // Verify with Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);

    if (paystackResponse.data?.status !== 'success') {
      // Record failed payment
      await supabaseAdmin.from('payments').upsert({
        id: existingPayment?.id ?? uuidv4(),
        user_id: userId,
        amount: MEMBERSHIP_FEE,
        payment_reference: reference,
        status: 'failed',
        type: 'membership',
      });
      return res.status(400).json({ success: false, message: 'Payment not successful on Paystack' });
    }

    const paidAmount = paystackResponse.data.amount / 100; // convert kobo to naira

    if (paidAmount < MEMBERSHIP_FEE) {
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Expected ₦${MEMBERSHIP_FEE}, got ₦${paidAmount}`,
      });
    }

    // Record successful payment
    await supabaseAdmin.from('payments').upsert({
      id: existingPayment?.id ?? uuidv4(),
      user_id: userId,
      amount: MEMBERSHIP_FEE,
      payment_reference: reference,
      status: 'success',
      type: 'membership',
    });

    // Activate user account
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({ status: 'active' })
      .eq('id', userId)
      .select('id, fullname, username, email, phone, referral_code, referred_by, balance, status, role, avatar_url, created_at')
      .single();

    // Credit referrer ₦500 if applicable
    if (currentUser?.referred_by) {
      // Check referral not already rewarded
      const { data: existingReferral } = await supabaseAdmin
        .from('referrals')
        .select('id')
        .eq('referrer_id', currentUser.referred_by)
        .eq('referred_user_id', userId)
        .maybeSingle();

      if (!existingReferral) {
        // Insert referral record
        await supabaseAdmin.from('referrals').insert({
          id: uuidv4(),
          referrer_id: currentUser.referred_by,
          referred_user_id: userId,
          reward: REFERRAL_REWARD,
        });

        // Add balance to referrer
        const { data: referrer } = await supabaseAdmin
          .from('users').select('balance').eq('id', currentUser.referred_by).single();

        await supabaseAdmin
          .from('users')
          .update({ balance: (referrer?.balance ?? 0) + REFERRAL_REWARD })
          .eq('id', currentUser.referred_by);
      }
    }

    return res.json({
      success: true,
      message: 'Membership activated successfully! Welcome to SkillRise Academy.',
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error('verifyMembership error:', err);
    return res.status(500).json({ success: false, message: 'Payment verification failed. Contact support.' });
  }
}

export async function verifyCourse(req: AuthRequest, res: Response) {
  try {
    const { reference, courseId } = req.body;
    if (!reference || !courseId) {
      return res.status(400).json({ success: false, message: 'Reference and courseId required' });
    }

    const userId = req.user!.id;

    // Check course exists
    const { data: course } = await supabaseAdmin
      .from('courses').select('*').eq('id', courseId).single();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check already purchased
    const { data: existing } = await supabaseAdmin
      .from('purchases').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
    if (existing) return res.status(400).json({ success: false, message: 'Course already purchased' });

    // Check duplicate payment ref
    const { data: dupPayment } = await supabaseAdmin
      .from('payments').select('id, status').eq('payment_reference', reference).maybeSingle();
    if (dupPayment?.status === 'success') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    // Verify Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);
    if (paystackResponse.data?.status !== 'success') {
      await supabaseAdmin.from('payments').upsert({
        id: dupPayment?.id ?? uuidv4(),
        user_id: userId, amount: course.price,
        payment_reference: reference, status: 'failed', type: 'course',
      });
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    // Record payment
    await supabaseAdmin.from('payments').upsert({
      id: dupPayment?.id ?? uuidv4(),
      user_id: userId, amount: course.price,
      payment_reference: reference, status: 'success', type: 'course',
    });

    // Create purchase record
    await supabaseAdmin.from('purchases').insert({
      id: uuidv4(), user_id: userId, course_id: courseId, amount: course.price,
    });

    return res.json({
      success: true,
      message: `"${course.title}" is now unlocked. Happy learning!`,
      data: { course },
    });
  } catch (err) {
    console.error('verifyCourse error:', err);
    return res.status(500).json({ success: false, message: 'Course verification failed. Contact support.' });
  }
}

export async function getPaymentHistory(req: AuthRequest, res: Response) {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: payments ?? [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
