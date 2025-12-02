import { Router } from 'express';
import { IssuingController } from '../controllers/issuing.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();
const issuingController = new IssuingController();

router.use(authenticate);

router.get('/', issuingController.getAll);
router.get('/:id', issuingController.getById);
router.post('/', authorize(UserRole.ADMIN), issuingController.create);
router.put('/:id', authorize(UserRole.ADMIN), issuingController.update);
router.delete('/:id', authorize(UserRole.ADMIN), issuingController.delete);

export default router;
