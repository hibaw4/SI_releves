import User from './User.js';
import Agent from './Agent.js';
import Compteur from './Compteur.js';
import Releve from './Releve.js';

// Define relationships
Releve.belongsTo(Compteur, { foreignKey: 'compteur_id', targetKey: 'numero_serie' });
Compteur.hasMany(Releve, { foreignKey: 'compteur_id', sourceKey: 'numero_serie' });

Releve.belongsTo(Agent, { foreignKey: 'agent_id' });
Agent.hasMany(Releve, { foreignKey: 'agent_id' });

export { User, Agent, Compteur, Releve };

