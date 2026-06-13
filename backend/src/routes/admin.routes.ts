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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max for videos
});

// Accept thumbnail (image), video, and pdf as separate fields
const courseUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

const router = Router();
router.use(authMiddleware, adminMiddleware);

// Analytics
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Courses — use courseUpload for file fields
router.get('/courses', getCourses);
router.post('/courses', courseUpload, createCourse);
router.put('/courses/:id', courseUpload, updateCourse);
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
