import { Router } from 'express';
import multer from 'multer';
import {
  getStats, getUsers, updateUserStatus, deleteUser,
  getCourses, createCourse, updateCourse, deleteCourse,
  createCourseJson, updateCourseJson,
  getPayments, verifyPayment, getReferrals,
  createAnnouncement, getAnnouncements,
} from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

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

// Courses — JSON routes (files pre-uploaded from browser)
router.get('/courses', getCourses);
router.post('/courses/json', createCourseJson);
router.put('/courses/:id/json', updateCourseJson);
router.delete('/courses/:id', deleteCourse);

// Courses — legacy file upload routes (fallback)
router.post('/courses', courseUpload, createCourse);
router.put('/courses/:id', courseUpload, updateCourse);

// Payments
router.get('/payments', getPayments);
router.put('/payments/:id/verify', verifyPayment);

// Referrals
router.get('/referrals', getReferrals);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

export default router;
