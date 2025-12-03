import { Sequelize } from 'sequelize';
import { config } from './index';

export const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: config.env === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Sincronizar modelos en desarrollo
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados');
      
      // Ejecutar seed automáticamente
      const { seedDatabase } = await import('../utils/seed');
      await seedDatabase();
    }
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    process.exit(1);
  }
};
