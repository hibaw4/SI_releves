import express from 'express';
import { Compteur, Releve } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total compteurs
    const totalCompteurs = await Compteur.count();

    // Compteurs relevés ce mois (distinct count)
    const compteursRelevesCeMoisResult = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: startOfMonth,
        },
      },
      attributes: ['compteur_id'],
      group: ['compteur_id'],
      raw: true,
    });

    const compteursRelevesCeMois = compteursRelevesCeMoisResult.length;
    const tauxCouverture = totalCompteurs > 0 
      ? ((compteursRelevesCeMois / totalCompteurs) * 100).toFixed(2)
      : 0;

    // Consommation moyenne par type
    const consommationData = {
      EAU: 0,
      ELECTRICITE: 0,
    };

    // Get all releves with compteur type to calculate average manually
    const allReleves = await Releve.findAll({
      include: [
        {
          model: Compteur,
          attributes: ['type'],
        },
      ],
    });

    const eauConsommations = allReleves
      .filter(r => r.Compteur.type === 'EAU')
      .map(r => r.consommation);
    const elecConsommations = allReleves
      .filter(r => r.Compteur.type === 'ELECTRICITE')
      .map(r => r.consommation);

    if (eauConsommations.length > 0) {
      consommationData.EAU = eauConsommations.reduce((a, b) => a + b, 0) / eauConsommations.length;
    }
    if (elecConsommations.length > 0) {
      consommationData.ELECTRICITE = elecConsommations.reduce((a, b) => a + b, 0) / elecConsommations.length;
    }

    res.json({
      tauxCouverture: parseFloat(tauxCouverture),
      totalCompteurs,
      compteursRelevesCeMois,
      consommationMoyenneParType: consommationData,
    });
  } catch (error) {
    console.error('Erreur récupération dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

