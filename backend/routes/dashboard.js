import express from 'express';
import { Compteur, Releve, Agent } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

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

    // Coverage by quartier
    const agents = await Agent.findAll();
    const quartiers = [...new Set(agents.filter(a => a.quartier).map(a => a.quartier))];
    
    const couvertureParQuartier = await Promise.all(quartiers.map(async (quartier) => {
      const quartiersAgentIds = agents.filter(a => a.quartier === quartier).map(a => a.id);
      
      // Get releves from these agents this month
      const relevesQuartier = await Releve.findAll({
        where: {
          agent_id: { [Op.in]: quartiersAgentIds },
          date_releve: { [Op.gte]: startOfMonth },
        },
        attributes: ['compteur_id'],
        group: ['compteur_id'],
        raw: true,
      });
      
      // Count total compteurs in addresses served by this quartier
      // For simplicity, we count compteurs that have been read by agents in this quartier
      const compteursQuartierCount = relevesQuartier.length;
      
      return {
        quartier,
        compteurs_releves: compteursQuartierCount,
      };
    }));

    // Consommation moyenne par type
    const consommationData = {
      EAU: 0,
      ELECTRICITE: 0,
    };

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

    // Agent performance (readings per day)
    const agentPerformance = await Promise.all(agents.map(async (agent) => {
      const agentReleves = await Releve.findAll({
        where: {
          agent_id: agent.id,
          date_releve: { [Op.gte]: startOfMonth },
        },
      });
      
      const daysWorked = new Set(
        agentReleves.map(r => new Date(r.date_releve).toISOString().split('T')[0])
      ).size;
      
      const avgDaily = daysWorked > 0 ? (agentReleves.length / daysWorked).toFixed(2) : 0;
      
      return {
        id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
        quartier: agent.quartier,
        totalReleves: agentReleves.length,
        daysWorked,
        averageDailyReadings: parseFloat(avgDaily),
      };
    }));

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthReleves = await Releve.findAll({
        where: {
          date_releve: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd,
          },
        },
        include: [{ model: Compteur, attributes: ['type'] }],
      });
      
      const eauConso = monthReleves
        .filter(r => r.Compteur.type === 'EAU')
        .reduce((sum, r) => sum + r.consommation, 0);
      const elecConso = monthReleves
        .filter(r => r.Compteur.type === 'ELECTRICITE')
        .reduce((sum, r) => sum + r.consommation, 0);
      
      const eauCount = monthReleves.filter(r => r.Compteur.type === 'EAU').length;
      const elecCount = monthReleves.filter(r => r.Compteur.type === 'ELECTRICITE').length;
      
      monthlyTrend.push({
        month: monthStart.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        monthDate: monthStart.toISOString(),
        eau: {
          total: eauConso,
          count: eauCount,
          average: eauCount > 0 ? (eauConso / eauCount).toFixed(2) : 0,
        },
        electricite: {
          total: elecConso,
          count: elecCount,
          average: elecCount > 0 ? (elecConso / elecCount).toFixed(2) : 0,
        },
      });
    }

    res.json({
      tauxCouverture: parseFloat(tauxCouverture),
      totalCompteurs,
      compteursRelevesCeMois,
      consommationMoyenneParType: consommationData,
      couvertureParQuartier,
      agentPerformance: agentPerformance.sort((a, b) => b.averageDailyReadings - a.averageDailyReadings),
      monthlyTrend,
    });
  } catch (error) {
    console.error('Erreur récupération dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
