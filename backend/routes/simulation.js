import express from 'express';
import { Op } from 'sequelize';
import Agent from '../models/Agent.js';
import Compteur from '../models/Compteur.js';
import { Releve } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Simulated client data from SI Commercial
const SIMULATED_CLIENTS = [
  { nom: 'BENANI', prenom: 'Karim', adresse: '15 Rue Ibn Sina, Agdal, Rabat' },
  { nom: 'EL AMRANI', prenom: 'Fatima', adresse: '23 Avenue Mohammed V, Centre-ville, Rabat' },
  { nom: 'TAZI', prenom: 'Youssef', adresse: '8 Rue des Orangers, Hay Ryad, Rabat' },
  { nom: 'ALAOUI', prenom: 'Nadia', adresse: '45 Boulevard Hassan II, Souissi, Rabat' },
  { nom: 'BERRADA', prenom: 'Ahmed', adresse: '12 Rue Moulay Ismail, Médina, Rabat' },
  { nom: 'FASSI', prenom: 'Salma', adresse: '67 Avenue Allal Ben Abdellah, Hassan, Rabat' },
  { nom: 'KETTANI', prenom: 'Omar', adresse: '34 Rue Patrice Lumumba, Océan, Rabat' },
  { nom: 'BENJELLOUN', prenom: 'Laila', adresse: '89 Avenue de France, Agdal, Rabat' },
  { nom: 'CHRAIBI', prenom: 'Rachid', adresse: '21 Rue Ghandi, Les Orangers, Rabat' },
  { nom: 'ZEMMOURI', prenom: 'Imane', adresse: '56 Boulevard An-Nasr, Hay Nahda, Rabat' },
];

// Simulated agent data from SI RH
const SIMULATED_AGENTS = [
  { nom: 'MANSOURI', prenom: 'Mehdi', telephone: '0661234567', quartier: 'Agdal' },
  { nom: 'LAHLOU', prenom: 'Soukaina', telephone: '0662345678', quartier: 'Hay Ryad' },
  { nom: 'IDRISSI', prenom: 'Anas', telephone: '0663456789', quartier: 'Hassan' },
  { nom: 'BENOMAR', prenom: 'Zineb', telephone: '0664567890', quartier: 'Souissi' },
  { nom: 'FILALI', prenom: 'Hamza', telephone: '0665678901', quartier: 'Océan' },
];

// Simulate batch import from SI Commercial (clients/addresses)
router.post('/erp/clients', authenticateToken, async (req, res) => {
  try {
    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    for (const client of SIMULATED_CLIENTS) {
      try {
        // Check if meters already exist at this address
        const existingMeters = await Compteur.findAll({
          where: { adresse: client.adresse },
        });

        if (existingMeters.length >= 2) {
          results.skipped.push({
            client: `${client.prenom} ${client.nom}`,
            reason: 'Adresse déjà équipée de 2 compteurs',
          });
          continue;
        }

        // Create meters for this client (water and/or electricity)
        const typesToCreate = ['EAU', 'ELECTRICITE'].filter(
          type => !existingMeters.some(m => m.type === type)
        );

        for (const type of typesToCreate) {
          // Generate new serial number
          const lastCompteur = await Compteur.findOne({
            order: [['numero_serie', 'DESC']],
          });
          const nextNumber = lastCompteur ? parseInt(lastCompteur.numero_serie) + 1 : 1;
          const numero_serie = nextNumber.toString().padStart(9, '0');

          const compteur = await Compteur.create({
            numero_serie,
            type,
            adresse: client.adresse,
            index_actuel: 0,
            client_nom: `${client.prenom} ${client.nom}`,
          });

          results.created.push({
            client: `${client.prenom} ${client.nom}`,
            compteur: numero_serie,
            type,
          });
        }
      } catch (error) {
        results.errors.push({
          client: `${client.prenom} ${client.nom}`,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Import clients SI Commercial terminé',
      summary: {
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error) {
    console.error('Erreur simulation import clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulate batch import from SI RH (agents)
router.post('/erp/agents', authenticateToken, async (req, res) => {
  try {
    const results = {
      created: [],
      skipped: [],
      errors: [],
    };

    for (const agentData of SIMULATED_AGENTS) {
      try {
        // Check if agent already exists (by phone number)
        const existing = await Agent.findOne({
          where: { telephone: agentData.telephone },
        });

        if (existing) {
          results.skipped.push({
            agent: `${agentData.prenom} ${agentData.nom}`,
            reason: 'Agent déjà existant (téléphone identique)',
          });
          continue;
        }

        const agent = await Agent.create(agentData);
        results.created.push({
          id: agent.id,
          agent: `${agentData.prenom} ${agentData.nom}`,
          quartier: agentData.quartier,
        });
      } catch (error) {
        results.errors.push({
          agent: `${agentData.prenom} ${agentData.nom}`,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Import agents SI RH terminé',
      summary: {
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error) {
    console.error('Erreur simulation import agents:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Simulate sending consumption data to SI Facturation
router.post('/facturation/send', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    // Get all releves for the month
    const releves = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth,
        },
      },
      include: [
        { model: Compteur, attributes: ['numero_serie', 'type', 'adresse', 'client_nom'] },
      ],
    });

    // Format data for billing system
    const billingData = releves.map(r => ({
      compteur_id: r.Compteur.numero_serie,
      type: r.Compteur.type,
      client: r.Compteur.client_nom,
      adresse: r.Compteur.adresse,
      periode: `${targetMonth + 1}/${targetYear}`,
      consommation: r.consommation,
      unite: r.Compteur.type === 'EAU' ? 'm³' : 'kWh',
      date_releve: r.date_releve,
    }));

    // In a real system, this would send to SI Facturation API
    console.log('[SIMULATION] Envoi vers SI Facturation:', billingData.length, 'relevés');

    res.json({
      message: 'Données envoyées à SI Facturation (simulation)',
      period: `${targetMonth + 1}/${targetYear}`,
      summary: {
        totalReleves: releves.length,
        eau: releves.filter(r => r.Compteur.type === 'EAU').length,
        electricite: releves.filter(r => r.Compteur.type === 'ELECTRICITE').length,
        totalConsommationEau: releves
          .filter(r => r.Compteur.type === 'EAU')
          .reduce((s, r) => s + r.consommation, 0),
        totalConsommationElec: releves
          .filter(r => r.Compteur.type === 'ELECTRICITE')
          .reduce((s, r) => s + r.consommation, 0),
      },
      data: billingData,
    });
  } catch (error) {
    console.error('Erreur simulation facturation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Generate simulated readings for all meters
router.post('/generate-readings', authenticateToken, async (req, res) => {
  try {
    const compteurs = await Compteur.findAll();
    const agents = await Agent.findAll();
    
    if (compteurs.length === 0) {
      return res.status(400).json({ error: 'Aucun compteur disponible. Importez d\'abord les clients.' });
    }
    
    if (agents.length === 0) {
      return res.status(400).json({ error: 'Aucun agent disponible. Importez d\'abord les agents.' });
    }
    
    const results = {
      generated: 0,
      errors: [],
    };
    
    // Generate readings for each meter
    for (const compteur of compteurs) {
      try {
        // Random agent
        const agent = agents[Math.floor(Math.random() * agents.length)];
        
        // Random consumption based on type
        let consumption;
        if (compteur.type === 'EAU') {
          // Water: 5-30 m³ per month
          consumption = Math.floor(Math.random() * 25) + 5;
        } else {
          // Electricity: 100-500 kWh per month
          consumption = Math.floor(Math.random() * 400) + 100;
        }
        
        const ancien_index = compteur.index_actuel;
        const nouvel_index = ancien_index + consumption;
        
        // Create reading
        await Releve.create({
          compteur_id: compteur.numero_serie,
          agent_id: agent.id,
          date_releve: new Date(),
          ancien_index,
          nouvel_index,
          consommation: consumption,
        });
        
        // Update meter's current index
        compteur.index_actuel = nouvel_index;
        await compteur.save();
        
        results.generated++;
        
        console.log(`[SIMULATION] Relevé créé - Compteur ${compteur.numero_serie} (${compteur.type}): +${consumption} ${compteur.type === 'EAU' ? 'm³' : 'kWh'}`);
      } catch (error) {
        results.errors.push({
          compteur: compteur.numero_serie,
          error: error.message,
        });
      }
    }
    
    console.log(`[SIMULATION] Total: ${results.generated} relevés générés`);
    
    res.json({
      message: `${results.generated} relevés générés avec succès`,
      generated: results.generated,
      errors: results.errors.length,
      details: {
        compteurs: compteurs.length,
        agents: agents.length,
      },
    });
  } catch (error) {
    console.error('Erreur génération relevés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get simulation status / available data
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const totalAgents = await Agent.count();
    const totalCompteurs = await Compteur.count();
    const totalReleves = await Releve.count();

    res.json({
      message: 'Statut des simulations ERP',
      availableSimulations: {
        'POST /api/simulation/erp/clients': 'Importer les clients depuis SI Commercial',
        'POST /api/simulation/erp/agents': 'Importer les agents depuis SI RH',
        'POST /api/simulation/facturation/send': 'Envoyer les données vers SI Facturation',
      },
      currentData: {
        agents: totalAgents,
        compteurs: totalCompteurs,
        releves: totalReleves,
      },
      simulatedData: {
        clientsAvailable: SIMULATED_CLIENTS.length,
        agentsAvailable: SIMULATED_AGENTS.length,
      },
    });
  } catch (error) {
    console.error('Erreur récupération statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

