import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IncidentStatus, IncidentSeverity } from '../types/enums';
import User from './User';
import Category from './Category';

interface IncidentAttributes {
  id: string;
  userId?: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  incidentDate: Date;
  status: IncidentStatus;
  severity: IncidentSeverity;
  isAnonymous: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  rejectionReason?: string;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'status' | 'severity' | 'isAnonymous' | 'viewCount'> {}

class Incident extends Model<IncidentAttributes, IncidentCreationAttributes> implements IncidentAttributes {
  declare id: string;
  declare userId: string | undefined;
  declare categoryId: string;
  declare title: string;
  declare description: string;
  declare latitude: number;
  declare longitude: number;
  declare address: string | undefined;
  declare incidentDate: Date;
  declare status: IncidentStatus;
  declare severity: IncidentSeverity;
  declare isAnonymous: boolean;
  declare validatedBy: string | undefined;
  declare validatedAt: Date | undefined;
  declare rejectionReason: string | undefined;
  declare viewCount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Asociaciones
  declare readonly user?: User;
  declare readonly category?: Category;
  declare readonly validator?: User;
}

Incident.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    incidentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'incident_date',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(IncidentStatus)),
      defaultValue: IncidentStatus.PENDING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM(...Object.values(IncidentSeverity)),
      defaultValue: IncidentSeverity.MEDIUM,
      allowNull: false,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_anonymous',
    },
    validatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'validated_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'validated_at',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
    },
  },
  {
    sequelize,
    tableName: 'incidents',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['latitude', 'longitude'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['category_id'],
      },
      {
        fields: ['incident_date'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

// Definir asociaciones
Incident.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Incident.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Incident.belongsTo(User, { foreignKey: 'validatedBy', as: 'validator' });

export default Incident;
