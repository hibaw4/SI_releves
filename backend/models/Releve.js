import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const Releve = sequelize.define('Releve', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  compteur_id: {
    type: DataTypes.STRING(9),
    allowNull: false,
    references: {
      model: 'compteurs',
      key: 'numero_serie',
    },
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agents',
      key: 'id',
    },
  },
  date_releve: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  ancien_index: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  nouvel_index: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  consommation: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'releves',
  timestamps: false,
  hooks: {
    beforeValidate: (releve) => {
      if (releve.nouvel_index !== null && releve.ancien_index !== null) {
        releve.consommation = releve.nouvel_index - releve.ancien_index;
      }
    },
    beforeCreate: (releve) => {
      if (releve.nouvel_index !== null && releve.ancien_index !== null) {
        releve.consommation = releve.nouvel_index - releve.ancien_index;
      }
    },
  },
});

export default Releve;

