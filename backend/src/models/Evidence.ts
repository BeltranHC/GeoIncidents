import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { EvidenceType } from '../types/enums';
import Incident from './Incident';

interface EvidenceAttributes {
  id: string;
  incidentId: string;
  type: EvidenceType;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EvidenceCreationAttributes extends Optional<EvidenceAttributes, 'id'> {}

class Evidence extends Model<EvidenceAttributes, EvidenceCreationAttributes> implements EvidenceAttributes {
  declare id: string;
  declare incidentId: string;
  declare type: EvidenceType;
  declare url: string;
  declare fileName: string;
  declare fileSize: number;
  declare mimeType: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Evidence.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'incident_id',
      references: {
        model: 'incidents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(EvidenceType)),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
  },
  {
    sequelize,
    tableName: 'evidences',
    timestamps: true,
    underscored: true,
  }
);

Evidence.belongsTo(Incident, { foreignKey: 'incidentId', as: 'incident' });

export default Evidence;
