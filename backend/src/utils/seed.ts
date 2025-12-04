import { User, Category, Incident } from '../models';
import { UserRole, IncidentStatus, IncidentSeverity } from '../types/enums';
import { logger } from './logger';
import bcrypt from 'bcryptjs';

// Datos de categorías
const categoriesData = [
  { name: 'Robo', description: 'Robos a mano armada, hurtos, asaltos', icon: 'shield-off', color: '#EF4444', order: 1 },
  { name: 'Vandalismo', description: 'Daños a propiedad pública o privada', icon: 'hammer', color: '#F97316', order: 2 },
  { name: 'Acoso', description: 'Acoso callejero, intimidación', icon: 'user-x', color: '#8B5CF6', order: 3 },
  { name: 'Accidente', description: 'Accidentes de tránsito', icon: 'car', color: '#3B82F6', order: 4 },
  { name: 'Alumbrado', description: 'Problemas con iluminación pública', icon: 'lightbulb-off', color: '#FBBF24', order: 5 },
  { name: 'Drogas', description: 'Venta o consumo de drogas', icon: 'pill', color: '#10B981', order: 6 },
  { name: 'Ruido', description: 'Contaminación acústica excesiva', icon: 'volume-x', color: '#6366F1', order: 7 },
  { name: 'Otros', description: 'Otros tipos de incidentes', icon: 'alert-circle', color: '#6B7280', order: 8 },
];

// Datos de usuarios de prueba
const usersData = [
  {
    email: 'admin@geoincidents.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Sistema',
    role: UserRole.ADMIN,
    isActive: true,
    isAnonymous: false,
  },
  {
    email: 'usuario@test.com',
    password: 'test123',
    firstName: 'Usuario',
    lastName: 'Prueba',
    role: UserRole.CITIZEN,
    isActive: true,
    isAnonymous: false,
  },
  {
    email: 'maria@test.com',
    password: 'test123',
    firstName: 'María',
    lastName: 'González',
    role: UserRole.CITIZEN,
    isActive: true,
    isAnonymous: false,
  },
];

// Datos de incidentes de ejemplo (Puno, Perú)
const incidentsData = [
  {
    title: 'Robo de celular en el centro',
    description: 'Me robaron el celular cerca de la Plaza de Armas durante la noche. Dos sujetos en moto.',
    latitude: -15.8402,
    longitude: -70.0219,
    address: 'Plaza de Armas, Puno',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Robo',
  },
  {
    title: 'Grafiti en el malecón',
    description: 'Rayaron las bancas del malecón ecoturístico con pintura spray.',
    latitude: -15.8367,
    longitude: -70.0178,
    address: 'Malecón Ecoturístico Bahía de los Incas',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Vandalismo',
  },
  {
    title: 'Accidente vehicular en Av. El Sol',
    description: 'Colisión entre combi y mototaxi. Hay tráfico intenso en la zona.',
    latitude: -15.8425,
    longitude: -70.0256,
    address: 'Avenida El Sol, Puno',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Accidente',
  },
  {
    title: 'Poste de luz sin funcionar',
    description: 'Poste de alumbrado público malogrado hace una semana cerca del mercado.',
    latitude: -15.8389,
    longitude: -70.0198,
    address: 'Jr. Arequipa, cerca del Mercado Central',
    severity: IncidentSeverity.LOW,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Alumbrado',
  },
  {
    title: 'Asalto cerca del terminal',
    description: 'Reporto asalto a mano armada cerca del terminal terrestre. Sujeto con cuchillo.',
    latitude: -15.8456,
    longitude: -70.0312,
    address: 'Terminal Terrestre de Puno',
    severity: IncidentSeverity.CRITICAL,
    status: IncidentStatus.VALIDATED,
    isAnonymous: true,
    categoryName: 'Robo',
  },
  {
    title: 'Daño a paradero de buses',
    description: 'Destruyeron el techo del paradero durante la madrugada.',
    latitude: -15.8378,
    longitude: -70.0234,
    address: 'Av. Floral, Puno',
    severity: IncidentSeverity.LOW,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Vandalismo',
  },
  {
    title: 'Ruido excesivo de discoteca',
    description: 'Discoteca con música a alto volumen hasta altas horas de la madrugada.',
    latitude: -15.8412,
    longitude: -70.0187,
    address: 'Jr. Lima, Centro de Puno',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Ruido',
  },
  {
    title: 'Venta de sustancias ilícitas',
    description: 'Se observa venta de drogas cerca del parque Pino.',
    latitude: -15.8395,
    longitude: -70.0211,
    address: 'Parque Pino, Puno',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.VALIDATED,
    isAnonymous: true,
    categoryName: 'Drogas',
  },
  {
    title: 'Acoso callejero reportado',
    description: 'Sujeto acosando verbalmente a mujeres cerca de la universidad.',
    latitude: -15.8345,
    longitude: -70.0245,
    address: 'Universidad Nacional del Altiplano',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Acoso',
  },
  {
    title: 'Bache peligroso en pista',
    description: 'Bache grande en la vía que ya ha causado daños a varios vehículos.',
    latitude: -15.8432,
    longitude: -70.0267,
    address: 'Av. Laykakota, Puno',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Otros',
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    logger.info('🌱 Iniciando seed de la base de datos...');

    // Crear categorías
    logger.info('📁 Creando categorías...');
    const categories = await Promise.all(
      categoriesData.map(async (cat) => {
        const [category] = await Category.findOrCreate({
          where: { name: cat.name },
          defaults: cat,
        });
        return category;
      })
    );
    logger.info(`✅ ${categories.length} categorías creadas/encontradas`);

    // Crear usuarios
    logger.info('👥 Creando usuarios...');
    const users: User[] = [];
    
    for (const userData of usersData) {
      // Buscar si el usuario ya existe
      let user = await User.findOne({ where: { email: userData.email } });
      
      if (!user) {
        // Crear nuevo usuario - el hook beforeCreate hasheará la contraseña
        user = await User.create(userData);
        logger.info(`   ✅ Usuario creado: ${userData.email}`);
      } else {
        // Si el usuario existe, actualizar la contraseña y asegurar que esté activo
        // Usamos update directo para evitar el hook que podría causar doble hash
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        await User.update(
          { 
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            isActive: true,
            isAnonymous: false
          },
          { 
            where: { email: userData.email },
            individualHooks: false // Evitar que se ejecute el hook beforeUpdate
          }
        );
        
        // Recargar el usuario
        user = await User.findOne({ where: { email: userData.email } }) as User;
        logger.info(`   🔄 Usuario actualizado: ${userData.email} (isActive: ${user.isActive})`);
      }
      
      users.push(user);
    }
    logger.info(`✅ ${users.length} usuarios procesados`);

    // Solo crear incidentes de ejemplo si no hay ninguno en la base de datos
    const incidentCount = await Incident.count();
    if (incidentCount === 0) {
      // Crear incidentes de ejemplo solo si la base de datos está vacía
      logger.info('🚨 Creando incidentes de ejemplo en Puno...');
      
      const citizenUser = users.find(u => u.email === 'usuario@test.com');
        
      for (const incidentData of incidentsData) {
        const category = categories.find(c => c.name === incidentData.categoryName);
        if (category) {
          await Incident.create({
            userId: incidentData.isAnonymous ? undefined : citizenUser?.id,
            categoryId: category.id,
            title: incidentData.title,
            description: incidentData.description,
            latitude: incidentData.latitude,
            longitude: incidentData.longitude,
            address: incidentData.address,
            incidentDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random en últimos 7 días
            severity: incidentData.severity,
            status: incidentData.status,
            isAnonymous: incidentData.isAnonymous,
          });
        }
      }
      logger.info(`✅ ${incidentsData.length} incidentes de ejemplo creados`);
    } else {
      logger.info(`📊 Ya existen ${incidentCount} incidentes en la base de datos, no se crean nuevos de ejemplo`);
    }

    logger.info('🎉 Seed completado exitosamente');
    logger.info('');
    logger.info('📋 Usuarios de prueba:');
    logger.info('   Admin: admin@geoincidents.com / admin123');
    logger.info('   Usuario: usuario@test.com / test123');
    logger.info('   Usuario: maria@test.com / test123');
    
  } catch (error) {
    logger.error('❌ Error durante el seed:', error);
    throw error;
  }
}
