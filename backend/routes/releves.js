import express from 'express';
import { Releve, Compteur, Agent } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all releves with related data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const releves = await Releve.findAll({
      include: [
        {
          model: Compteur,
          attributes: ['numero_serie', 'type', 'adresse'],
        },
        {
          model: Agent,
          attributes: ['id', 'nom', 'prenom'],
        },
      ],
      order: [['date_releve', 'DESC']],
    });

    const formattedReleves = releves.map(releve => ({
      id: releve.id,
      date_releve: releve.date_releve,
      agent: `${releve.Agent.prenom} ${releve.Agent.nom}`,
      adresse: releve.Compteur.adresse,
      ancien_index: releve.ancien_index,
      nouvel_index: releve.nouvel_index,
      consommation: releve.consommation,
      type: releve.Compteur.type,
    }));

    res.json(formattedReleves);
  } catch (error) {
    console.error('Erreur récupération relevés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulation route for mobile app
router.post('/simulation/releve', async (req, res) => {
  try {
    const { compteur_id, nouvel_index } = req.body;

    if (!compteur_id || nouvel_index === undefined) {
      return res.status(400).json({ error: 'compteur_id et nouvel_index requis' });
    }

    const compteur = await Compteur.findByPk(compteur_id);
    if (!compteur) {
      return res.status(404).json({ error: 'Compteur non trouvé' });
    }

    // Get a random agent for simulation
    const agents = await Agent.findAll();
    if (agents.length === 0) {
      return res.status(400).json({ error: 'Aucun agent disponible' });
    }
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    const ancien_index = compteur.index_actuel;
    const consommation = nouvel_index - ancien_index;

    // Create releve
    const releve = await Releve.create({
      compteur_id: compteur.numero_serie,
      agent_id: randomAgent.id,
      date_releve: new Date(),
      ancien_index,
      nouvel_index,
      consommation,
    });

    // Update compteur index
    compteur.index_actuel = nouvel_index;
    await compteur.save();

    res.status(201).json({
      message: 'Relevé créé avec succès',
      releve: {
        id: releve.id,
        consommation: releve.consommation,
        ancien_index: releve.ancien_index,
        nouvel_index: releve.nouvel_index,
      },
    });
  } catch (error) {
    console.error('Erreur simulation relevé:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

