import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { NotificationType } from '../types/enums';
import User from './User';
import Incident from './Incident';

interface NotificationAttributes {
  id: string;
  userId: string;
  incidentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  declare id: string;
  declare userId: string;
  declare incidentId: string | undefined;
  declare type: NotificationType;
  declare title: string;
  declare message: string;
  declare isRead: boolean;
  declare readAt: Date | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'incident_id',
      references: {
        model: 'incidents',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'is_read'],
      },
    ],
  }
);

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Incident, { foreignKey: 'incidentId', as: 'incident' });

export default Notification;
