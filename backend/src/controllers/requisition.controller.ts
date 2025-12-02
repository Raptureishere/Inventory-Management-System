import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Requisition, RequisitionStatus } from '../entities/Requisition';
import { RequisitionItem } from '../entities/RequisitionItem';
import { AuthRequest } from '../middleware/auth';
import { FindOptionsWhere } from 'typeorm';

export class RequisitionController {
  private requisitionRepository = AppDataSource.getRepository(Requisition);
  private requisitionItemRepository = AppDataSource.getRepository(RequisitionItem);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { status, department } = req.query;

      const where: FindOptionsWhere<Requisition> = {};
      if (typeof status === 'string') {
        if ((Object.values(RequisitionStatus) as string[]).includes(status)) {
          where.status = status as RequisitionStatus;
        }
      }
      if (typeof department === 'string') {
        where.departmentName = department;
      }

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
        const requisitionItems = items.map((item: { itemId: number; itemName: string; requestedQty: number }) =>
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

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const requisition = await this.requisitionRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items']
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      // Optional: Check if it can be deleted (e.g. only pending?)
      // For now, allowing delete of any, but usually we restrict if it has related records like IssuedItems.
      // Assuming cascade delete or manual cleanup if needed. 
      // RequisitionItem has foreign key to Requisition, so they should be deleted if cascade is on, or we delete them first.

      // Let's check Requisition entity for cascade options or manually delete items.
      // But for now, standard delete.

      await this.requisitionItemRepository.delete({ requisitionId: requisition.id });
      await this.requisitionRepository.remove(requisition);

      res.json({ message: 'Requisition deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const { departmentName, items, notes } = req.body;
      const requisition = await this.requisitionRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items']
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      if (requisition.status !== RequisitionStatus.PENDING) {
        return res.status(400).json({ message: 'Can only update pending requisitions' });
      }

      requisition.departmentName = departmentName;
      requisition.notes = notes;

      // Update items
      // Simplest strategy: delete existing items and recreate them
      // Or update existing ones.
      // Given the complexity, let's delete and recreate for now as it's safer for consistency.

      await this.requisitionItemRepository.delete({ requisitionId: requisition.id });

      if (items && items.length > 0) {
        const requisitionItems = items.map((item: { itemId: number; itemName: string; quantity: number }) =>
          this.requisitionItemRepository.create({
            requisitionId: requisition.id,
            itemId: item.itemId,
            itemName: item.itemName,
            requestedQty: item.quantity // Note: frontend sends 'quantity', entity has 'requestedQty'
          })
        );
        await this.requisitionItemRepository.save(requisitionItems);
      }

      await this.requisitionRepository.save(requisition);

      const updatedRequisition = await this.requisitionRepository.findOne({
        where: { id: requisition.id },
        relations: ['items', 'items.item']
      });

      res.json(updatedRequisition);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
