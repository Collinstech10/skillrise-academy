import { Router } from 'express';
import multer from 'multer';
import { getDashboard, getReferrals, updateProfile, uploadAvatar, getLeaderboard } from '../controllers/users.controller';
import { authMiddleware, activeUserMiddleware } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', activeUserMiddleware, getDashboard);
router.get('/referrals', activeUserMiddleware, getReferrals);
router.get('/leaderboard', activeUserMiddleware, getLeaderboard);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
