import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { IssuingVoucher, VoucherStatus } from '../entities/IssuingVoucher';
import { IssuingItem } from '../entities/IssuingItem';
import { Item } from '../entities/Item';
import { Requisition, RequisitionStatus } from '../entities/Requisition';
import { AuthRequest } from '../middleware/auth';
import { FindOptionsWhere } from 'typeorm';

export class IssuingController {
  private voucherRepository = AppDataSource.getRepository(IssuingVoucher);
  private issuingItemRepository = AppDataSource.getRepository(IssuingItem);
  private itemRepository = AppDataSource.getRepository(Item);
  private requisitionRepository = AppDataSource.getRepository(Requisition);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.query;

      const where: FindOptionsWhere<IssuingVoucher> = {};
      if (typeof status === 'string') {
        if ((Object.values(VoucherStatus) as string[]).includes(status)) {
          where.status = status as VoucherStatus;
        }
      }

      const vouchers = await this.voucherRepository.find({
        where,
        relations: ['requisition', 'items', 'items.item'],
        order: { createdAt: 'DESC' }
      });

      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['requisition', 'items', 'items.item']
      });

      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found' });
      }

      res.json(voucher);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { voucherId, requisitionId, issueDate, items, notes } = req.body;

      // Verify requisition exists and is forwarded
      const requisition = await this.requisitionRepository.findOne({
        where: { id: requisitionId }
      });

      if (!requisition) {
        return res.status(404).json({ message: 'Requisition not found' });
      }

      if (requisition.status !== RequisitionStatus.FORWARDED) {
        return res.status(400).json({ message: 'Can only issue from forwarded requisitions' });
      }

      // Create voucher
      const voucher = this.voucherRepository.create({
        voucherId,
        requisitionId,
        issueDate,
        notes,
        status: VoucherStatus.PENDING
      });

      await this.voucherRepository.save(voucher);

      // Create issuing items and update inventory
      if (items && items.length > 0) {
        for (const itemData of items as Array<{ itemId: number; requestedQty: number; issuedQty: number }>) {
          const item = await this.itemRepository.findOne({
            where: { id: itemData.itemId }
          });

          if (!item) {
            continue;
          }

          const issuedQty = Math.min(itemData.issuedQty, item.quantity);
          const balance = itemData.requestedQty - issuedQty;

          // Create issuing item
          const issuingItem = this.issuingItemRepository.create({
            voucherId: voucher.id,
            itemId: itemData.itemId,
            itemName: item.itemName,
            requestedQty: itemData.requestedQty,
            issuedQty,
            balance
          });

          await this.issuingItemRepository.save(issuingItem);

          // Update item quantity
          item.quantity -= issuedQty;
          await this.itemRepository.save(item);
        }
      }

      // Update voucher status
      const savedVoucher = await this.voucherRepository.findOne({
        where: { id: voucher.id },
        relations: ['items']
      });

      if (savedVoucher) {
        const allFullyProvided = savedVoucher.items.every(item => item.balance === 0);
        const someProvided = savedVoucher.items.some(item => item.issuedQty > 0);

        if (allFullyProvided) {
          savedVoucher.status = VoucherStatus.FULLY_PROVIDED;
        } else if (someProvided) {
          savedVoucher.status = VoucherStatus.PARTIALLY_PROVIDED;
        }

        await this.voucherRepository.save(savedVoucher);

        // Update requisition status
        requisition.status = RequisitionStatus.ISSUED;
        await this.requisitionRepository.save(requisition);
      }

      const finalVoucher = await this.voucherRepository.findOne({
        where: { id: voucher.id },
        relations: ['requisition', 'items', 'items.item']
      });

      res.status(201).json(finalVoucher);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items']
      });

      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found' });
      }

      const { items, notes } = req.body as { items?: Array<{ id: number; issuedQty: number }>; notes?: string };

      if (notes !== undefined) {
        voucher.notes = notes;
      }

      // Update issuing items if provided
      if (items && items.length > 0) {
        for (const itemData of items) {
          const issuingItem = await this.issuingItemRepository.findOne({
            where: { id: itemData.id }
          });

          if (!issuingItem) continue;

          const item = await this.itemRepository.findOne({
            where: { id: issuingItem.itemId }
          });

          if (!item) continue;

          // Restore previous quantity
          item.quantity += issuingItem.issuedQty;

          // Apply new quantity
          const newIssuedQty = Math.min(itemData.issuedQty, item.quantity);
          item.quantity -= newIssuedQty;

          issuingItem.issuedQty = newIssuedQty;
          issuingItem.balance = issuingItem.requestedQty - newIssuedQty;

          await this.itemRepository.save(item);
          await this.issuingItemRepository.save(issuingItem);
        }
      }

      // Recalculate voucher status
      const updatedVoucher = await this.voucherRepository.findOne({
        where: { id: voucher.id },
        relations: ['items']
      });

      if (updatedVoucher) {
        const allFullyProvided = updatedVoucher.items.every(item => item.balance === 0);
        const someProvided = updatedVoucher.items.some(item => item.issuedQty > 0);

        if (allFullyProvided) {
          updatedVoucher.status = VoucherStatus.FULLY_PROVIDED;
        } else if (someProvided) {
          updatedVoucher.status = VoucherStatus.PARTIALLY_PROVIDED;
        } else {
          updatedVoucher.status = VoucherStatus.PENDING;
        }

        await this.voucherRepository.save(updatedVoucher);
      }

      const finalVoucher = await this.voucherRepository.findOne({
        where: { id: voucher.id },
        relations: ['requisition', 'items', 'items.item']
      });

      res.json(finalVoucher);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  delete = async (req: AuthRequest, res: Response) => {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items']
      });

      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found' });
      }

      // Restore stock
      if (voucher.items) {
        for (const issuingItem of voucher.items) {
          const item = await this.itemRepository.findOne({ where: { id: issuingItem.itemId } });
          if (item) {
            item.quantity += issuingItem.issuedQty;
            await this.itemRepository.save(item);
          }
        }
      }

      // Delete issuing items
      await this.issuingItemRepository.delete({ voucherId: voucher.id });

      // Delete voucher
      await this.voucherRepository.remove(voucher);

      res.json({ message: 'Voucher deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}

