import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import itemRoutes from './routes/item.routes';
import supplierRoutes from './routes/supplier.routes';
import requisitionRoutes from './routes/requisition.routes';
import purchaseOrderRoutes from './routes/purchaseOrder.routes';
import issuingRoutes from './routes/issuing.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// Allow all origins by default without credentials (Bearer tokens used)
// If CORS_ORIGIN is set, restrict to that/these origins and still no credentials
const originEnv = process.env.CORS_ORIGIN;
const allowedOrigins = originEnv ? originEnv.split(',').map(o => o.trim()) : '*';

app.use(cors({
  origin: allowedOrigins as any,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/items`, itemRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/requisitions`, requisitionRoutes);
app.use(`${API_PREFIX}/purchase-orders`, purchaseOrderRoutes);
app.use(`${API_PREFIX}/issuing`, issuingRoutes);

// API Info endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    message: 'Inventory Management System API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      items: `${API_PREFIX}/items`,
      suppliers: `${API_PREFIX}/suppliers`,
      requisitions: `${API_PREFIX}/requisitions`,
      purchaseOrders: `${API_PREFIX}/purchase-orders`,
      issuing: `${API_PREFIX}/issuing`
    },
    health: '/health'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');

    // Ensure a default admin exists on first run
    const { User, UserRole } = await import('./entities/User');
    const repo = AppDataSource.getRepository(User);
    const count = await repo.count();
    if (count === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await repo.save(
        repo.create({ username: 'admin', password: hashed, role: UserRole.ADMIN, isActive: true })
      );
      console.log('Default admin created (admin/' + defaultPassword + ')');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
