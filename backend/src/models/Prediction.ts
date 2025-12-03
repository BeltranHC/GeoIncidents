import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import RiskZone from './RiskZone';
import Category from './Category';

interface PredictionAttributes {
  id: string;
  zoneId?: string;
  categoryId?: string;
  latitude: number;
  longitude: number;
  probability: number;
  predictedDate: Date;
  modelVersion: string;
  features: string; // JSON con las características usadas
  createdAt?: Date;
  updatedAt?: Date;
}

interface PredictionCreationAttributes extends Optional<PredictionAttributes, 'id'> {}

class Prediction extends Model<PredictionAttributes, PredictionCreationAttributes> implements PredictionAttributes {
  declare id: string;
  declare zoneId: string | undefined;
  declare categoryId: string | undefined;
  declare latitude: number;
  declare longitude: number;
  declare probability: number;
  declare predictedDate: Date;
  declare modelVersion: string;
  declare features: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Prediction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'zone_id',
      references: {
        model: 'risk_zones',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    probability: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
    },
    predictedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'predicted_date',
    },
    modelVersion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'model_version',
    },
    features: {
      type: DataTypes.TEXT, // JSON
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'predictions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['predicted_date'],
      },
      {
        fields: ['probability'],
      },
    ],
  }
);

Prediction.belongsTo(RiskZone, { foreignKey: 'zoneId', as: 'zone' });
Prediction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export default Prediction;
