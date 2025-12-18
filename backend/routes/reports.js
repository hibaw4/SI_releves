import express from 'express';
import { Compteur, Releve, Agent } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get monthly readings report data
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    // Get all agents
    const agents = await Agent.findAll();
    
    // Get releves for the month
    const releves = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth,
        },
      },
      include: [
        { model: Agent, attributes: ['id', 'nom', 'prenom', 'quartier'] },
        { model: Compteur, attributes: ['type'] },
      ],
    });
    
    // Agent distribution by quartier
    const quartierDistribution = {};
    agents.forEach(agent => {
      const q = agent.quartier || 'Non assigné';
      if (!quartierDistribution[q]) {
        quartierDistribution[q] = {
          quartier: q,
          agentCount: 0,
          agents: [],
          totalReleves: 0,
        };
      }
      quartierDistribution[q].agentCount++;
      quartierDistribution[q].agents.push({
        id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
      });
    });
    
    // Calculate readings per agent per quartier
    releves.forEach(releve => {
      const q = releve.Agent.quartier || 'Non assigné';
      if (quartierDistribution[q]) {
        quartierDistribution[q].totalReleves++;
      }
    });
    
    // Calculate average daily readings per agent per quartier
    Object.values(quartierDistribution).forEach(qd => {
      const daysInMonth = endOfMonth.getDate();
      qd.avgDailyPerAgent = qd.agentCount > 0 
        ? (qd.totalReleves / (qd.agentCount * daysInMonth)).toFixed(2)
        : 0;
    });
    
    // Readings count per quartier
    const relevesParQuartier = Object.values(quartierDistribution).map(qd => ({
      quartier: qd.quartier,
      agentCount: qd.agentCount,
      totalReleves: qd.totalReleves,
      avgDailyPerAgent: parseFloat(qd.avgDailyPerAgent),
    }));
    
    // Summary statistics
    const totalReleves = releves.length;
    const totalAgents = agents.length;
    const avgRelevesPerAgent = totalAgents > 0 
      ? (totalReleves / totalAgents).toFixed(2) 
      : 0;
    
    res.json({
      period: {
        month: targetMonth + 1,
        year: targetYear,
        label: startOfMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      },
      summary: {
        totalReleves,
        totalAgents,
        avgRelevesPerAgent: parseFloat(avgRelevesPerAgent),
      },
      relevesParQuartier,
    });
  } catch (error) {
    console.error('Erreur génération rapport mensuel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get consumption evolution report data
router.get('/consumption', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    
    // Get all releves for current and last year
    const startCurrentYear = new Date(currentYear, 0, 1);
    const endCurrentYear = new Date(currentYear, 11, 31, 23, 59, 59);
    const startLastYear = new Date(lastYear, 0, 1);
    const endLastYear = new Date(lastYear, 11, 31, 23, 59, 59);
    
    const currentYearReleves = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: startCurrentYear,
          [Op.lte]: endCurrentYear,
        },
      },
      include: [{ model: Compteur, attributes: ['type'] }],
    });
    
    const lastYearReleves = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: startLastYear,
          [Op.lte]: endLastYear,
        },
      },
      include: [{ model: Compteur, attributes: ['type'] }],
    });
    
    // Calculate monthly averages
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthLabel = new Date(currentYear, month, 1).toLocaleString('fr-FR', { month: 'short' });
      
      // Current year data
      const currentMonthReleves = currentYearReleves.filter(r => 
        new Date(r.date_releve).getMonth() === month
      );
      
      // Last year data
      const lastMonthReleves = lastYearReleves.filter(r => 
        new Date(r.date_releve).getMonth() === month
      );
      
      // Water
      const currentEau = currentMonthReleves.filter(r => r.Compteur.type === 'EAU');
      const lastEau = lastMonthReleves.filter(r => r.Compteur.type === 'EAU');
      const currentEauAvg = currentEau.length > 0 
        ? currentEau.reduce((s, r) => s + r.consommation, 0) / currentEau.length
        : 0;
      const lastEauAvg = lastEau.length > 0 
        ? lastEau.reduce((s, r) => s + r.consommation, 0) / lastEau.length
        : 0;
      
      // Electricity
      const currentElec = currentMonthReleves.filter(r => r.Compteur.type === 'ELECTRICITE');
      const lastElec = lastMonthReleves.filter(r => r.Compteur.type === 'ELECTRICITE');
      const currentElecAvg = currentElec.length > 0 
        ? currentElec.reduce((s, r) => s + r.consommation, 0) / currentElec.length
        : 0;
      const lastElecAvg = lastElec.length > 0 
        ? lastElec.reduce((s, r) => s + r.consommation, 0) / lastElec.length
        : 0;
      
      monthlyData.push({
        month: monthLabel,
        monthNum: month + 1,
        eau: {
          currentYear: parseFloat(currentEauAvg.toFixed(2)),
          lastYear: parseFloat(lastEauAvg.toFixed(2)),
          evolution: lastEauAvg > 0 
            ? parseFloat(((currentEauAvg - lastEauAvg) / lastEauAvg * 100).toFixed(2))
            : 0,
        },
        electricite: {
          currentYear: parseFloat(currentElecAvg.toFixed(2)),
          lastYear: parseFloat(lastElecAvg.toFixed(2)),
          evolution: lastElecAvg > 0 
            ? parseFloat(((currentElecAvg - lastElecAvg) / lastElecAvg * 100).toFixed(2))
            : 0,
        },
      });
    }
    
    // Calculate yearly totals
    const currentYearEauTotal = currentYearReleves
      .filter(r => r.Compteur.type === 'EAU')
      .reduce((s, r) => s + r.consommation, 0);
    const currentYearElecTotal = currentYearReleves
      .filter(r => r.Compteur.type === 'ELECTRICITE')
      .reduce((s, r) => s + r.consommation, 0);
    const lastYearEauTotal = lastYearReleves
      .filter(r => r.Compteur.type === 'EAU')
      .reduce((s, r) => s + r.consommation, 0);
    const lastYearElecTotal = lastYearReleves
      .filter(r => r.Compteur.type === 'ELECTRICITE')
      .reduce((s, r) => s + r.consommation, 0);
    
    res.json({
      currentYear,
      lastYear,
      monthlyData,
      yearlyTotals: {
        eau: {
          currentYear: currentYearEauTotal,
          lastYear: lastYearEauTotal,
          evolution: lastYearEauTotal > 0 
            ? parseFloat(((currentYearEauTotal - lastYearEauTotal) / lastYearEauTotal * 100).toFixed(2))
            : 0,
        },
        electricite: {
          currentYear: currentYearElecTotal,
          lastYear: lastYearElecTotal,
          evolution: lastYearElecTotal > 0 
            ? parseFloat(((currentYearElecTotal - lastYearElecTotal) / lastYearElecTotal * 100).toFixed(2))
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Erreur génération rapport consommation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

