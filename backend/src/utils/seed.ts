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

// Datos de incidentes de ejemplo (Ciudad de México)
const incidentsData = [
  {
    title: 'Robo de celular en el metro',
    description: 'Me robaron el celular en la estación Balderas durante hora pico. El sujeto vestía de negro.',
    latitude: 19.4269,
    longitude: -99.1486,
    address: 'Metro Balderas, Ciudad de México',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Robo',
  },
  {
    title: 'Grafiti en edificio histórico',
    description: 'Rayaron la fachada del edificio de correos con pintura roja.',
    latitude: 19.4352,
    longitude: -99.1412,
    address: 'Palacio de Correos, Centro Histórico',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Vandalismo',
  },
  {
    title: 'Choque múltiple en Reforma',
    description: 'Tres vehículos involucrados, hay tráfico intenso. Se requiere apoyo vial.',
    latitude: 19.4284,
    longitude: -99.1676,
    address: 'Paseo de la Reforma 222',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Accidente',
  },
  {
    title: 'Poste de luz fundido',
    description: 'Lleva más de una semana sin funcionar, zona muy oscura de noche.',
    latitude: 19.4195,
    longitude: -99.1628,
    address: 'Colonia Juárez, calle Hamburgo',
    severity: IncidentSeverity.LOW,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Alumbrado',
  },
  {
    title: 'Asalto a peatón',
    description: 'Reporto asalto a mano armada cerca del parque. Dos sujetos en motocicleta.',
    latitude: 19.4124,
    longitude: -99.1737,
    address: 'Parque México, Condesa',
    severity: IncidentSeverity.CRITICAL,
    status: IncidentStatus.PENDING,
    isAnonymous: true,
    categoryName: 'Robo',
  },
  {
    title: 'Daño a parada de autobús',
    description: 'Rompieron los vidrios de la parada durante la noche.',
    latitude: 19.4356,
    longitude: -99.1534,
    address: 'Av. Insurgentes Sur',
    severity: IncidentSeverity.LOW,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Vandalismo',
  },
  {
    title: 'Ruido excesivo de construcción',
    description: 'Construcción trabajando fuera de horario permitido, ruido molesto.',
    latitude: 19.4321,
    longitude: -99.1543,
    address: 'Colonia Roma Norte',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.PENDING,
    isAnonymous: false,
    categoryName: 'Ruido',
  },
  {
    title: 'Punto de venta de drogas',
    description: 'Se observa actividad sospechosa de venta de sustancias en la esquina.',
    latitude: 19.4089,
    longitude: -99.1658,
    address: 'Colonia Roma Sur',
    severity: IncidentSeverity.HIGH,
    status: IncidentStatus.PENDING,
    isAnonymous: true,
    categoryName: 'Drogas',
  },
  {
    title: 'Acoso en transporte público',
    description: 'Hombre acosando verbalmente a mujeres en la estación de metrobús.',
    latitude: 19.4234,
    longitude: -99.1589,
    address: 'Metrobús Insurgentes',
    severity: IncidentSeverity.MEDIUM,
    status: IncidentStatus.VALIDATED,
    isAnonymous: false,
    categoryName: 'Acoso',
  },
  {
    title: 'Bache peligroso',
    description: 'Bache grande que ya ha causado daños a varios vehículos.',
    latitude: 19.4178,
    longitude: -99.1702,
    address: 'Avenida Chapultepec',
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

    // Verificar si ya hay incidentes
    const incidentCount = await Incident.count();
    if (incidentCount === 0) {
      // Crear incidentes
      logger.info('🚨 Creando incidentes de ejemplo...');
      
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
      logger.info(`✅ ${incidentsData.length} incidentes creados`);
    } else {
      logger.info(`ℹ️ Ya existen ${incidentCount} incidentes, saltando creación`);
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
