import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { User, Agent, Compteur, Releve } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import agentsRoutes from './routes/agents.js';
import compteursRoutes from './routes/compteurs.js';
import relevesRoutes from './routes/releves.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';
import simulationRoutes from './routes/simulation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/compteurs', compteursRoutes);
app.use('/api/releves', relevesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/simulation', simulationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');

    // Sync models (create tables)
    await sequelize.sync({ alter: true }); // Use alter to update schema without dropping
    console.log('✅ Modèles synchronisés avec la base de données.');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

startServer();
