import { Router } from 'express';
import { verifyMembership, verifyCourse, getPaymentHistory } from '../controllers/payments.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/verify-membership', verifyMembership);
router.post('/verify-course', verifyCourse);
router.get('/history', getPaymentHistory);

export default router;
