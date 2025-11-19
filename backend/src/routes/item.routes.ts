import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();
const itemController = new ItemController();

router.use(authenticate);

router.get('/', itemController.getAll);
router.get('/:id', itemController.getById);
router.post('/', authorize(UserRole.ADMIN), itemController.create);
router.put('/:id', authorize(UserRole.ADMIN), itemController.update);
router.delete('/:id', authorize(UserRole.ADMIN), itemController.delete);

export default router;
