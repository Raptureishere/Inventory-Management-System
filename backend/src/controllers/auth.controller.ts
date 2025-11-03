import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      const user = await this.userRepository.findOne({
        where: { username },
        select: ['id', 'username', 'password', 'role', 'isActive']
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  register = async (req: Request, res: Response) => {
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
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
}
