import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Supplier } from '../entities/Supplier';
import { AuthRequest } from '../middleware/auth';

export class SupplierController {
  private supplierRepository = AppDataSource.getRepository(Supplier);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const suppliers = await this.supplierRepository.find({
        order: { name: 'ASC' }
      });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const supplier = await this.supplierRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const supplier = this.supplierRepository.create(req.body);
      await this.supplierRepository.save(supplier);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const supplier = await this.supplierRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      this.supplierRepository.merge(supplier, req.body);
      await this.supplierRepository.save(supplier);

      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const result = await this.supplierRepository.delete(req.params.id);

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
