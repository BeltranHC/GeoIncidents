import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';

import { config } from './config';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares';
import { logger } from './utils';

const app: Application = express();
const httpServer = createServer(app);

// Socket.IO para tiempo real
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
  },
});

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intente más tarde',
  },
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos
app.use('/uploads', express.static(config.upload.dir));

// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Geolocalización de Incidentes',
      version: '1.0.0',
      description: 'Sistema de registro y análisis de incidentes urbanos',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas API
app.use('/api', routes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO eventos
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);

  // Unirse a sala de zona geográfica
  socket.on('join:zone', (zoneId: string) => {
    socket.join(`zone:${zoneId}`);
    logger.debug(`Socket ${socket.id} se unió a zona ${zoneId}`);
  });

  // Nuevo incidente reportado
  socket.on('incident:new', (incident) => {
    // Emitir a todos los clientes en el área
    io.emit('incident:created', incident);
  });

  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Exportar io para usar en otros módulos
export { io };

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a base de datos
    await connectDatabase();

    // Iniciar servidor HTTP
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Servidor ejecutándose en http://localhost:${config.port}`);
      logger.info(`📚 Documentación API en http://localhost:${config.port}/api-docs`);
      logger.info(`🌍 Entorno: ${config.env}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
