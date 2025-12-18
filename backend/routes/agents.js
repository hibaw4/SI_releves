import express from 'express';
import Agent from '../models/Agent.js';
import { Releve, Compteur } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// Get all agents with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { quartier, sortBy = 'nom', sortOrder = 'ASC', search } = req.query;
    
    const where = {};
    if (quartier) {
      where.quartier = quartier;
    }
    if (search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const validSortFields = ['nom', 'prenom', 'quartier'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'nom';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const agents = await Agent.findAll({
      where,
      order: [[orderField, orderDirection]],
    });
    res.json(agents);
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get list of all unique quartiers
router.get('/quartiers', authenticateToken, async (req, res) => {
  try {
    const quartiers = await Agent.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('quartier')), 'quartier']],
      where: {
        quartier: {
          [Op.ne]: null,
          [Op.ne]: '',
        },
      },
      order: [['quartier', 'ASC']],
      raw: true,
    });
    res.json(quartiers.map(q => q.quartier));
  } catch (error) {
    console.error('Erreur récupération quartiers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get agent by ID with stats
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '3months' } = req.query;
    
    const agent = await Agent.findByPk(id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }
    
    // Calculate period start date
    const now = new Date();
    let periodStart = new Date();
    
    switch (period) {
      case '1week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case '1month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        periodStart.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodStart.setMonth(now.getMonth() - 3);
    }
    
    // Get releves for this agent in the period
    const releves = await Releve.findAll({
      where: {
        agent_id: id,
        date_releve: {
          [Op.gte]: periodStart,
        },
      },
      order: [['date_releve', 'ASC']],
    });
    
    // Calculate daily readings statistics
    const dailyStats = {};
    releves.forEach(releve => {
      const date = new Date(releve.date_releve).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = 0;
      }
      dailyStats[date]++;
    });
    
    const dailyReadings = Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    }));
    
    // Calculate average daily readings
    const totalDays = Object.keys(dailyStats).length;
    const totalReadings = releves.length;
    const averageDailyReadings = totalDays > 0 ? (totalReadings / totalDays).toFixed(2) : 0;
    
    res.json({
      ...agent.toJSON(),
      stats: {
        totalReadings,
        averageDailyReadings: parseFloat(averageDailyReadings),
        dailyReadings,
        period,
      },
    });
  } catch (error) {
    console.error('Erreur récupération agent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update agent quartier
router.patch('/:id/quartier', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quartier } = req.body;

    const agent = await Agent.findByPk(id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    agent.quartier = quartier;
    await agent.save();

    res.json(agent);
  } catch (error) {
    console.error('Erreur mise à jour agent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
