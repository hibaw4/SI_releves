import express from 'express';
import User from '../models/User.js';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

const router = express.Router();

// Generate random password
const generatePassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@#$%^&*!';
  const all = lowercase + uppercase + numbers + special;
  
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Get all users with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, sortBy = 'nom', sortOrder = 'ASC', search } = req.query;
    
    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const validSortFields = ['nom', 'prenom', 'role', 'date_creation'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'nom';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[orderField, orderDirection]],
    });
    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create user (SuperAdmin only) - with auto-generated password
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { nom, prenom, email, role } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({ error: 'Nom, prénom et email sont requis' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Auto-generate password
    const generatedPassword = generatePassword();

    const user = await User.create({
      nom,
      prenom,
      email,
      password: generatedPassword,
      role: role || 'USER',
      must_change_password: true,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;
    
    // In production, this would be sent via email
    // For simulation, we return it (or log it)
    console.log(`[SIMULATION EMAIL] Nouveau mot de passe pour ${email}: ${generatedPassword}`);

    res.status(201).json({
      ...userResponse,
      // Include generated password for simulation purposes
      generatedPassword,
      message: 'Utilisateur créé. Le mot de passe a été généré automatiquement.',
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update user (SuperAdmin only)
router.patch('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, role } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (role) user.role = role;
    
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Reset password (SuperAdmin only)
router.post('/:id/reset-password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const newPassword = generatePassword();
    user.password = newPassword;
    user.must_change_password = true;
    await user.save();
    
    console.log(`[SIMULATION EMAIL] Nouveau mot de passe pour ${user.email}: ${newPassword}`);
    
    res.json({
      message: 'Mot de passe réinitialisé avec succès',
      generatedPassword: newPassword, // For simulation
    });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
