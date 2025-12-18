import express from 'express';
import Compteur from '../models/Compteur.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all compteurs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const compteurs = await Compteur.findAll({
      order: [['numero_serie', 'ASC']],
    });
    res.json(compteurs);
  } catch (error) {
    console.error('Erreur récupération compteurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create new compteur
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, adresse } = req.body;

    if (!type || !adresse) {
      return res.status(400).json({ error: 'Type et adresse sont requis' });
    }

    if (!['EAU', 'ELECTRICITE'].includes(type)) {
      return res.status(400).json({ error: 'Type doit être EAU ou ELECTRICITE' });
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
      client_nom: null,
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

