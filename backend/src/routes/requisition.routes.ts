import { Router } from 'express';
import { RequisitionController } from '../controllers/requisition.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const requisitionController = new RequisitionController();

router.use(authenticate);

router.get('/', requisitionController.getAll);
router.get('/:id', requisitionController.getById);
router.post('/', requisitionController.create);
router.put('/:id/forward', requisitionController.forward);
router.put('/:id/cancel', requisitionController.cancel);

export default router;
