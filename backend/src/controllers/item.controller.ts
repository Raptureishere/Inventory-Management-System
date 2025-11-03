import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Item } from '../entities/Item';
import { AuthRequest } from '../middleware/auth';
import { Like } from 'typeorm';

export class ItemController {
  private itemRepository = AppDataSource.getRepository(Item);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 20, search, category } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.itemName = Like(`%${search}%`);
      }
      
      if (category) {
        where.category = category;
      }

      const [items, total] = await this.itemRepository.findAndCount({
        where,
        relations: ['supplier'],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { itemName: 'ASC' }
      });

      res.json({
        data: items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const item = await this.itemRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: ['supplier']
      });

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const item = this.itemRepository.create(req.body);
      await this.itemRepository.save(item);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const item = await this.itemRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      this.itemRepository.merge(item, req.body);
      await this.itemRepository.save(item);
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const result = await this.itemRepository.delete(req.params.id);
      
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
