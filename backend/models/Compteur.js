import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const Compteur = sequelize.define('Compteur', {
  numero_serie: {
    type: DataTypes.STRING(9),
    primaryKey: true,
    allowNull: false,
    validate: {
      len: [9, 9],
      isNumeric: true,
    },
  },
  type: {
    type: DataTypes.ENUM('EAU', 'ELECTRICITE'),
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  index_actuel: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  client_nom: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'compteurs',
  timestamps: false,
});

export default Compteur;

