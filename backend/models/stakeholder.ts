import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface StakeholderAttributes {
  id: string;
  name: string;
  logo: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StakeholderCreationAttributes = Optional<StakeholderAttributes, 'id' | 'logo' | 'createdAt' | 'updatedAt'>;

class Stakeholder extends Model<StakeholderAttributes, StakeholderCreationAttributes> implements StakeholderAttributes {
  declare id: string;
  declare name: string;
  declare logo: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Stakeholder.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrlOrNull(value: unknown) {
        if (value && typeof value === 'string') {
          const ok = /^https?:\/\//.test(value);
          if (!ok) throw new Error('logo must be a valid URL');
        }
      }
    }
  },
}, {
  sequelize,
  modelName: 'Stakeholder',
  tableName: 'stakeholders',
  timestamps: true,
});

export default Stakeholder;
