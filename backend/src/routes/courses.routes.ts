import { Router } from 'express';
import { getAllCourses, getCourseById, getMyCourses, purchaseCourse } from '../controllers/courses.controller';
import { authMiddleware, activeUserMiddleware } from '../middleware/auth';

const router = Router();

// Public — optionally authenticated to show purchase status
router.get('/', authMiddleware, getAllCourses);
router.get('/:id', getCourseById);

// Protected
router.get('/my-courses', authMiddleware, activeUserMiddleware, getMyCourses);
router.post('/purchase', authMiddleware, activeUserMiddleware, purchaseCourse);

export default router;
