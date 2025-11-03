import 'reflect-metadata';
import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../entities/User';
import { Supplier } from '../../entities/Supplier';
import { Item, ItemCategory } from '../../entities/Item';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const itemRepository = AppDataSource.getRepository(Item);

    // Create default users
    console.log('Creating users...');
    
    const adminExists = await userRepository.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        username: 'admin',
        password: adminPassword,
        role: UserRole.ADMIN,
        fullName: 'System Administrator',
        email: 'admin@hospital.com',
        isActive: true
      });
      await userRepository.save(admin);
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    const subExists = await userRepository.findOne({ where: { username: 'sub' } });
    if (!subExists) {
      const subPassword = await bcrypt.hash('sub123', 10);
      const subordinate = userRepository.create({
        username: 'sub',
        password: subPassword,
        role: UserRole.SUBORDINATE,
        fullName: 'Department User',
        email: 'subordinate@hospital.com',
        isActive: true
      });
      await userRepository.save(subordinate);
      console.log('✅ Subordinate user created (username: sub, password: sub123)');
    } else {
      console.log('ℹ️  Subordinate user already exists');
    }

    // Create default suppliers
    console.log('Creating suppliers...');
    const suppliersData = [
      { name: 'MediCare Supplies', contactPerson: 'John Smith', phone: '+1-555-0100', email: 'orders@medicare.com', address: '123 Medical Ave, Healthcare City', notes: 'Primary medical supplies vendor' },
      { name: 'PharmaCo Ltd', contactPerson: 'Jane Doe', phone: '+1-555-0101', email: 'sales@pharmaco.com', address: '456 Pharma Plaza, Med Town', notes: 'Pharmaceutical supplier' },
      { name: 'LabEquip Inc', contactPerson: 'Mike Johnson', phone: '+1-555-0102', email: 'info@labequip.com', address: '789 Lab Street, Science City', notes: 'Laboratory equipment and supplies' },
      { name: 'CleanCo Solutions', contactPerson: 'Sarah Williams', phone: '+1-555-0103', email: 'sales@cleanco.com', address: '321 Clean Drive, Hygiene Town', notes: 'Sterilization and cleaning supplies' },
      { name: 'HospitalEquip Inc', contactPerson: 'Robert Brown', phone: '+1-555-0104', email: 'contact@hospitalequip.com', address: '654 Equipment Road, Medical City', notes: 'Hospital furniture and equipment' }
    ];

    for (const supplierData of suppliersData) {
      const exists = await supplierRepository.findOne({ where: { name: supplierData.name } });
      if (!exists) {
        const supplier = supplierRepository.create(supplierData);
        await supplierRepository.save(supplier);
        console.log(`✅ Supplier created: ${supplierData.name}`);
      }
    }

    // Create sample items
    console.log('Creating sample inventory items...');
    const suppliers = await supplierRepository.find();
    
    const itemsData = [
      { itemCode: 'MS001', itemName: 'Surgical Scalpel Set', category: ItemCategory.MEDICAL_SURGICAL, quantity: 50, unit: 'sets', reorderLevel: 10, unitPrice: 25.00, supplierId: suppliers[0]?.id },
      { itemCode: 'PH001', itemName: 'Paracetamol 500mg', category: ItemCategory.PHARMACEUTICALS, quantity: 120, unit: 'bottles', reorderLevel: 20, unitPrice: 8.50, supplierId: suppliers[1]?.id },
      { itemCode: 'PP001', itemName: 'Disposable Gloves (Box of 100)', category: ItemCategory.PPE, quantity: 75, unit: 'boxes', reorderLevel: 15, unitPrice: 12.00, supplierId: suppliers[0]?.id },
      { itemCode: 'LB001', itemName: 'Microscope Slides', category: ItemCategory.LABORATORY, quantity: 200, unit: 'packs', reorderLevel: 30, unitPrice: 5.00, supplierId: suppliers[2]?.id },
      { itemCode: 'SD001', itemName: 'Disinfectant Solution 1L', category: ItemCategory.STERILIZATION_DISINFECTION, quantity: 100, unit: 'bottles', reorderLevel: 20, unitPrice: 15.00, supplierId: suppliers[3]?.id },
      { itemCode: 'HE001', itemName: 'Hospital Bed (Standard)', category: ItemCategory.HOSPITAL_EQUIPMENT, quantity: 10, unit: 'units', reorderLevel: 2, unitPrice: 800.00, supplierId: suppliers[4]?.id },
      { itemCode: 'PP002', itemName: 'Surgical Masks (Box of 50)', category: ItemCategory.PPE, quantity: 150, unit: 'boxes', reorderLevel: 30, unitPrice: 10.00, supplierId: suppliers[0]?.id },
      { itemCode: 'LB002', itemName: 'Test Tubes (Pack of 100)', category: ItemCategory.LABORATORY, quantity: 80, unit: 'packs', reorderLevel: 15, unitPrice: 7.50, supplierId: suppliers[2]?.id },
      { itemCode: 'MS002', itemName: 'Sterile Gauze Pads', category: ItemCategory.MEDICAL_SURGICAL, quantity: 200, unit: 'packs', reorderLevel: 40, unitPrice: 6.00, supplierId: suppliers[0]?.id },
      { itemCode: 'PH002', itemName: 'Ibuprofen 400mg', category: ItemCategory.PHARMACEUTICALS, quantity: 90, unit: 'bottles', reorderLevel: 15, unitPrice: 10.00, supplierId: suppliers[1]?.id }
    ];

    for (const itemData of itemsData) {
      const exists = await itemRepository.findOne({ where: { itemCode: itemData.itemCode } });
      if (!exists) {
        const item = itemRepository.create({
          ...itemData,
          dateReceived: new Date(),
          description: `${itemData.itemName} - Standard inventory item`
        });
        await itemRepository.save(item);
        console.log(`✅ Item created: ${itemData.itemName}`);
      }
    }

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Admin    - username: admin, password: admin123');
    console.log('   User     - username: sub, password: sub123');
    console.log('');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
