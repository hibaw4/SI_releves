import express from 'express';
import { Releve, Compteur, Agent } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all releves with filtering and sorting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      agent_id, 
      date_from, 
      date_to,
      sortBy = 'date_releve',
      sortOrder = 'DESC'
    } = req.query;
    
    const where = {};
    
    // Date filters
    if (date_from || date_to) {
      where.date_releve = {};
      if (date_from) {
        where.date_releve[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        where.date_releve[Op.lte] = new Date(date_to + 'T23:59:59');
      }
    }
    
    if (agent_id) {
      where.agent_id = agent_id;
    }
    
    // Build compteur filter
    const compteurWhere = {};
    if (type) {
      compteurWhere.type = type;
    }
    
    const validSortFields = ['date_releve', 'consommation'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'date_releve';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    const releves = await Releve.findAll({
      where,
      include: [
        {
          model: Compteur,
          attributes: ['numero_serie', 'type', 'adresse'],
          where: Object.keys(compteurWhere).length > 0 ? compteurWhere : undefined,
        },
        {
          model: Agent,
          attributes: ['id', 'nom', 'prenom', 'quartier'],
        },
      ],
      order: [[orderField, orderDirection]],
    });

    const formattedReleves = releves.map(releve => ({
      id: releve.id,
      date_releve: releve.date_releve,
      agent: `${releve.Agent.prenom} ${releve.Agent.nom}`,
      agent_id: releve.Agent.id,
      quartier: releve.Agent.quartier,
      adresse: releve.Compteur.adresse,
      compteur_id: releve.Compteur.numero_serie,
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

// Get releve by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const releve = await Releve.findByPk(id, {
      include: [
        {
          model: Compteur,
          attributes: ['numero_serie', 'type', 'adresse', 'client_nom'],
        },
        {
          model: Agent,
          attributes: ['id', 'nom', 'prenom', 'telephone', 'quartier'],
        },
      ],
    });
    
    if (!releve) {
      return res.status(404).json({ error: 'Relevé non trouvé' });
    }
    
    res.json({
      id: releve.id,
      date_releve: releve.date_releve,
      agent: {
        id: releve.Agent.id,
        nom: releve.Agent.nom,
        prenom: releve.Agent.prenom,
        telephone: releve.Agent.telephone,
        quartier: releve.Agent.quartier,
      },
      compteur: {
        numero_serie: releve.Compteur.numero_serie,
        type: releve.Compteur.type,
        adresse: releve.Compteur.adresse,
        client_nom: releve.Compteur.client_nom,
      },
      ancien_index: releve.ancien_index,
      nouvel_index: releve.nouvel_index,
      consommation: releve.consommation,
    });
  } catch (error) {
    console.error('Erreur récupération relevé:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulation route for mobile app
router.post('/simulation/releve', async (req, res) => {
  try {
    const { compteur_id, nouvel_index, agent_id } = req.body;

    if (!compteur_id || nouvel_index === undefined) {
      return res.status(400).json({ error: 'compteur_id et nouvel_index requis' });
    }

    const compteur = await Compteur.findByPk(compteur_id);
    if (!compteur) {
      return res.status(404).json({ error: 'Compteur non trouvé' });
    }

    // Get agent (specified or random)
    let agent;
    if (agent_id) {
      agent = await Agent.findByPk(agent_id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent non trouvé' });
      }
    } else {
      const agents = await Agent.findAll();
      if (agents.length === 0) {
        return res.status(400).json({ error: 'Aucun agent disponible' });
      }
      agent = agents[Math.floor(Math.random() * agents.length)];
    }

    const ancien_index = compteur.index_actuel;
    const consommation = nouvel_index - ancien_index;

    if (consommation < 0) {
      return res.status(400).json({ 
        error: 'Le nouvel index doit être supérieur à l\'index actuel' 
      });
    }

    // Create releve
    const releve = await Releve.create({
      compteur_id: compteur.numero_serie,
      agent_id: agent.id,
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
        agent: `${agent.prenom} ${agent.nom}`,
      },
    });
  } catch (error) {
    console.error('Erreur simulation relevé:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
