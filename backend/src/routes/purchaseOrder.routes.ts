import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrder.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

router.use(authenticate);

router.get('/', purchaseOrderController.getAll);
router.get('/:id', purchaseOrderController.getById);
router.post('/', authorize(UserRole.ADMIN), purchaseOrderController.create);
router.put('/:id/receive', authorize(UserRole.ADMIN), purchaseOrderController.receive);

export default router;
