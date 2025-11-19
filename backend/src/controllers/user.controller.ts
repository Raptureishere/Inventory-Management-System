import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'username', 'role', 'fullName', 'email', 'isActive', 'createdAt']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: Number(req.params.id) },
        select: ['id', 'username', 'role', 'fullName', 'email', 'isActive', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { username, password, role, fullName, email } = req.body;

      const existingUser = await this.userRepository.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        username,
        password: hashedPassword,
        role,
        fullName,
        email
      });

      await this.userRepository.save(user);

      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: Number(req.params.id) }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...updateData } = req.body;

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      this.userRepository.merge(user, updateData);
      await this.userRepository.save(user);

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const result = await this.userRepository.delete(req.params.id);

      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
