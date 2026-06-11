import { Router } from 'express';
import multer from 'multer';
import {
  getStats, getUsers, updateUserStatus, deleteUser,
  getCourses, createCourse, updateCourse, deleteCourse,
  getPayments, verifyPayment, getReferrals,
  createAnnouncement, getAnnouncements,
} from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  },
});

const router = Router();
router.use(authMiddleware, adminMiddleware);

// Analytics
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Courses
router.get('/courses', getCourses);
router.post('/courses', upload.single('thumbnail'), createCourse);
router.put('/courses/:id', upload.single('thumbnail'), updateCourse);
router.delete('/courses/:id', deleteCourse);

// Payments
router.get('/payments', getPayments);
router.put('/payments/:id/verify', verifyPayment);

// Referrals
router.get('/referrals', getReferrals);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

export default router;
