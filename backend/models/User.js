import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('nom', value.toUpperCase());
    },
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      // Handle compound names like "Mohamed-Amine" or "Fatima Ezzahra"
      const words = value.split(/[-\s]/);
      const separator = value.includes('-') ? '-' : ' ';
      const capitalized = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(separator);
      this.setDataValue('prenom', capitalized);
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SUPERADMIN', 'USER'),
    allowNull: false,
    defaultValue: 'USER',
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  must_change_password: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      user.date_modification = new Date();
    },
  },
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default User;
