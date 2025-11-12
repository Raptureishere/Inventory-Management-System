import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities/PurchaseOrder';
import { PurchaseOrderItem } from '../entities/PurchaseOrderItem';
import { Item } from '../entities/Item';
import { AuthRequest } from '../middleware/auth';
import { FindOptionsWhere } from 'typeorm';

export class PurchaseOrderController {
  private poRepository = AppDataSource.getRepository(PurchaseOrder);
  private poItemRepository = AppDataSource.getRepository(PurchaseOrderItem);
  private itemRepository = AppDataSource.getRepository(Item);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { status, supplierId } = req.query;

      const where: FindOptionsWhere<PurchaseOrder> = {};
      if (typeof status === 'string') {
        if ((Object.values(PurchaseOrderStatus) as string[]).includes(status)) {
          where.status = status as PurchaseOrderStatus;
        }
      }
      if (typeof supplierId === 'string' && supplierId.trim().length > 0) {
        where.supplierId = Number(supplierId);
      }

      const purchaseOrders = await this.poRepository.find({
        where,
        relations: ['supplier', 'items', 'items.item'],
        order: { createdAt: 'DESC' }
      });

      res.json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const po = await this.poRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['supplier', 'items', 'items.item']
      });

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      res.json(po);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { poNumber, supplierId, orderDate, expectedDeliveryDate, items, notes } = req.body;

      const po = this.poRepository.create({
        poNumber,
        supplierId,
        orderDate,
        expectedDeliveryDate,
        notes,
        status: PurchaseOrderStatus.PENDING,
        totalAmount: 0
      });

      await this.poRepository.save(po);

      let totalAmount = 0;

      if (items && items.length > 0) {
        for (const itemData of items as Array<{ itemId: number; itemName: string; orderedQty: number; unitPrice: number }>) {
          const totalPrice = itemData.orderedQty * itemData.unitPrice;
          totalAmount += totalPrice;

          const poItem = this.poItemRepository.create({
            purchaseOrderId: po.id,
            itemId: itemData.itemId,
            itemName: itemData.itemName,
            orderedQty: itemData.orderedQty,
            receivedQty: 0,
            unitPrice: itemData.unitPrice,
            totalPrice
          });

          await this.poItemRepository.save(poItem);
        }
      }

      po.totalAmount = totalAmount;
      await this.poRepository.save(po);

      const savedPO = await this.poRepository.findOne({
        where: { id: po.id },
        relations: ['supplier', 'items', 'items.item']
      });

      res.status(201).json(savedPO);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  receive = async (req: AuthRequest, res: Response) => {
    try {
      const po = await this.poRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['items']
      });

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (po.status === PurchaseOrderStatus.RECEIVED) {
        return res.status(400).json({ message: 'Purchase order already received' });
      }

      const { actualDeliveryDate, items } = req.body as { actualDeliveryDate?: Date; items?: Array<{ id: number; receivedQty: number }> };

      po.actualDeliveryDate = actualDeliveryDate || new Date();
      po.status = PurchaseOrderStatus.RECEIVED;

      // Update received quantities and inventory
      if (items && items.length > 0) {
        for (const itemData of items) {
          const poItem = await this.poItemRepository.findOne({
            where: { id: itemData.id }
          });

          if (!poItem) continue;

          poItem.receivedQty = itemData.receivedQty;
          await this.poItemRepository.save(poItem);

          // Update inventory item quantity
          const item = await this.itemRepository.findOne({
            where: { id: poItem.itemId }
          });

          if (item) {
            item.quantity += itemData.receivedQty;
            await this.itemRepository.save(item);
          }
        }
      }

      await this.poRepository.save(po);

      const updatedPO = await this.poRepository.findOne({
        where: { id: po.id },
        relations: ['supplier', 'items', 'items.item']
      });

      res.json(updatedPO);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
