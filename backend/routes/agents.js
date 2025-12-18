import express from 'express';
import Agent from '../models/Agent.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all agents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const agents = await Agent.findAll({
      order: [['nom', 'ASC']],
    });
    res.json(agents);
  } catch (error) {
    console.error('Erreur récupération agents:', error);
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

