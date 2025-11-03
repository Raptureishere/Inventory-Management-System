import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Requisition, RequisitionStatus } from '../entities/Requisition';
import { RequisitionItem } from '../entities/RequisitionItem';
import { AuthRequest } from '../middleware/auth';

export class RequisitionController {
  private requisitionRepository = AppDataSource.getRepository(Requisition);
  private requisitionItemRepository = AppDataSource.getRepository(RequisitionItem);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { status, department } = req.query;
      
      const where: any = {};
      if (status) where.status = status;
      if (department) where.departmentName = department;

      const requisitions = await this.requisitionRepository.find({
        where,
        relations: ['items', 'items.item', 'createdBy'],
        order: { createdAt: 'DESC' }
      });

      res.json(requisitions);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const requisition = await this.requisitionRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items', 'items.item', 'createdBy']
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      res.json(requisition);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { departmentName, requisitionDate, items, notes } = req.body;

      const requisition = this.requisitionRepository.create({
        departmentName,
        requisitionDate,
        notes,
        createdById: req.user?.id,
        status: RequisitionStatus.PENDING
      });

      await this.requisitionRepository.save(requisition);

      if (items && items.length > 0) {
        const requisitionItems = items.map((item: any) =>
          this.requisitionItemRepository.create({
            requisitionId: requisition.id,
            itemId: item.itemId,
            itemName: item.itemName,
            requestedQty: item.requestedQty
          })
        );

        await this.requisitionItemRepository.save(requisitionItems);
      }

      const savedRequisition = await this.requisitionRepository.findOne({
        where: { id: requisition.id },
        relations: ['items', 'items.item']
      });

      res.status(201).json(savedRequisition);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  forward = async (req: AuthRequest, res: Response) => {
    try {
      const requisition = await this.requisitionRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      if (requisition.status !== RequisitionStatus.PENDING) {
        return res.status(400).json({ message: 'Can only forward pending requisitions' });
      }

      requisition.status = RequisitionStatus.FORWARDED;
      await this.requisitionRepository.save(requisition);

      res.json(requisition);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  cancel = async (req: AuthRequest, res: Response) => {
    try {
      const requisition = await this.requisitionRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      if (requisition.status === RequisitionStatus.ISSUED) {
        return res.status(400).json({ message: 'Cannot cancel issued requisitions' });
      }

      requisition.status = RequisitionStatus.CANCELLED;
      await this.requisitionRepository.save(requisition);

      res.json(requisition);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
