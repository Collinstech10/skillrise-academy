import { Router } from 'express';
import {
  getAllLiveClasses, getLiveClassById,
} from '../controllers/liveclasses.controller';
import { authMiddleware, activeUserMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication + active membership
router.use(authMiddleware, activeUserMiddleware);

router.get('/', getAllLiveClasses);
router.get('/:id', getLiveClassById);

export default router;
