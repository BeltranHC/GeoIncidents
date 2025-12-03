import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { RiskLevel } from '../types/enums';

interface RiskZoneAttributes {
  id: string;
  name: string;
  description?: string;
  // Polígono almacenado como array de coordenadas
  polygon: string; // GeoJSON string
  riskLevel: RiskLevel;
  totalIncidents: number;
  lastCalculatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RiskZoneCreationAttributes extends Optional<RiskZoneAttributes, 'id' | 'totalIncidents'> {}

class RiskZone extends Model<RiskZoneAttributes, RiskZoneCreationAttributes> implements RiskZoneAttributes {
  declare id: string;
  declare name: string;
  declare description: string | undefined;
  declare polygon: string;
  declare riskLevel: RiskLevel;
  declare totalIncidents: number;
  declare lastCalculatedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RiskZone.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    polygon: {
      type: DataTypes.TEXT, // GeoJSON
      allowNull: false,
    },
    riskLevel: {
      type: DataTypes.ENUM(...Object.values(RiskLevel)),
      allowNull: false,
      field: 'risk_level',
    },
    totalIncidents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_incidents',
    },
    lastCalculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'last_calculated_at',
    },
  },
  {
    sequelize,
    tableName: 'risk_zones',
    timestamps: true,
    underscored: true,
  }
);

export default RiskZone;
