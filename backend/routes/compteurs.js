import express from 'express';
import Compteur from '../models/Compteur.js';
import { Releve } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all compteurs with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, search, sortBy = 'numero_serie', sortOrder = 'ASC' } = req.query;
    
    const where = {};
    if (type) {
      where.type = type;
    }
    if (search) {
      where[Op.or] = [
        { numero_serie: { [Op.like]: `%${search}%` } },
        { adresse: { [Op.like]: `%${search}%` } },
        { client_nom: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const validSortFields = ['numero_serie', 'type', 'adresse', 'index_actuel'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'numero_serie';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const compteurs = await Compteur.findAll({
      where,
      order: [[orderField, orderDirection]],
    });
    res.json(compteurs);
  } catch (error) {
    console.error('Erreur récupération compteurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get compteur by ID with reading history
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const compteur = await Compteur.findByPk(id);
    
    if (!compteur) {
      return res.status(404).json({ error: 'Compteur non trouvé' });
    }
    
    // Get last 10 readings
    const releves = await Releve.findAll({
      where: { compteur_id: id },
      order: [['date_releve', 'DESC']],
      limit: 10,
    });
    
    // Get last reading date
    const lastReleve = releves.length > 0 ? releves[0] : null;
    
    res.json({
      ...compteur.toJSON(),
      date_derniere_releve: lastReleve?.date_releve || null,
      historique_releves: releves.map(r => ({
        id: r.id,
        date_releve: r.date_releve,
        ancien_index: r.ancien_index,
        nouvel_index: r.nouvel_index,
        consommation: r.consommation,
      })),
    });
  } catch (error) {
    console.error('Erreur récupération compteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create new compteur
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, adresse, client_nom } = req.body;

    if (!type || !adresse) {
      return res.status(400).json({ error: 'Type et adresse sont requis' });
    }

    if (!['EAU', 'ELECTRICITE'].includes(type)) {
      return res.status(400).json({ error: 'Type doit être EAU ou ELECTRICITE' });
    }

    // Check if address already has 2 meters (water + electricity)
    const existingMeters = await Compteur.findAll({
      where: { adresse },
    });
    
    if (existingMeters.length >= 2) {
      return res.status(400).json({ 
        error: 'Cette adresse a déjà 2 compteurs (maximum autorisé)' 
      });
    }
    
    // Check if same type already exists at this address
    const sameTypeExists = existingMeters.some(m => m.type === type);
    if (sameTypeExists) {
      return res.status(400).json({ 
        error: `Un compteur de type ${type} existe déjà à cette adresse` 
      });
    }

    // Generate 9-digit serial number
    const lastCompteur = await Compteur.findOne({
      order: [['numero_serie', 'DESC']],
    });

    let nextNumber = 1;
    if (lastCompteur) {
      const lastNum = parseInt(lastCompteur.numero_serie);
      nextNumber = lastNum + 1;
    }

    const numero_serie = nextNumber.toString().padStart(9, '0');

    const compteur = await Compteur.create({
      numero_serie,
      type,
      adresse,
      index_actuel: 0,
      client_nom: client_nom || null,
    });

    res.status(201).json(compteur);
  } catch (error) {
    console.error('Erreur création compteur:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Numéro de série déjà existant' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
