import sequelize from './config/database.js';
import { User, Agent, Compteur, Releve } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const quartiersRabat = [
  'Agdal', 'Hay Riad', 'Hay Fath', 'Océan', 'Hassan', 
  'Akrach', 'Souissi', 'Yacoub El Mansour', 'Témara', 'Salé'
];

const prenoms = ['Ahmed', 'Fatima', 'Mohammed', 'Aicha', 'Hassan', 'Khadija', 'Omar', 'Zineb', 'Youssef', 'Sanae'];
const noms = ['Alaoui', 'Benali', 'Idrissi', 'Amrani', 'El Fassi', 'Bennani', 'Tazi', 'Alami', 'Berrada', 'Chraibi'];

const adressesRabat = [
  '123 Avenue Mohammed V, Rabat',
  '45 Boulevard Zerktouni, Rabat',
  '78 Rue Oqba, Rabat',
  '12 Avenue Allal Ben Abdellah, Rabat',
  '89 Rue de la Plage, Rabat',
  '34 Avenue Fal Ould Oumeir, Rabat',
  '56 Rue Abou Inane, Rabat',
  '78 Boulevard Hassan II, Rabat',
  '23 Avenue de France, Rabat',
  '67 Rue Abderrahman El Ghafiki, Rabat',
  '90 Avenue Al Massira, Rabat',
  '45 Rue Ibn Battuta, Rabat',
  '12 Boulevard Zerktouni, Rabat',
  '78 Avenue Mohammed VI, Rabat',
  '34 Rue Ahmed Balafrej, Rabat',
  '56 Avenue Hassan II, Rabat',
  '89 Rue de la Résistance, Rabat',
  '23 Boulevard Zerktouni, Rabat',
  '67 Avenue Al Massira, Rabat',
  '90 Rue Ibn Sina, Rabat',
  '45 Avenue Mohammed V, Rabat',
  '12 Rue Oqba, Rabat',
  '78 Boulevard Zerktouni, Rabat',
  '34 Avenue Fal Ould Oumeir, Rabat',
  '56 Rue de la Plage, Rabat',
  '89 Avenue Allal Ben Abdellah, Rabat',
  '23 Rue Abou Inane, Rabat',
  '67 Boulevard Hassan II, Rabat',
  '90 Avenue de France, Rabat',
  '45 Rue Abderrahman El Ghafiki, Rabat',
  '12 Avenue Al Massira, Rabat',
  '78 Rue Ibn Battuta, Rabat',
  '34 Boulevard Zerktouni, Rabat',
  '56 Avenue Mohammed VI, Rabat',
  '89 Rue Ahmed Balafrej, Rabat',
  '23 Boulevard Hassan II, Rabat',
  '67 Rue de la Résistance, Rabat',
  '90 Avenue Zerktouni, Rabat',
  '45 Rue Ibn Sina, Rabat',
  '12 Avenue Mohammed V, Rabat',
  '78 Rue Oqba, Rabat',
  '34 Boulevard Zerktouni, Rabat',
  '56 Avenue Fal Ould Oumeir, Rabat',
  '89 Rue de la Plage, Rabat',
  '23 Avenue Allal Ben Abdellah, Rabat',
  '67 Rue Abou Inane, Rabat',
  '90 Boulevard Hassan II, Rabat',
  '45 Avenue de France, Rabat',
  '12 Rue Abderrahman El Ghafiki, Rabat',
  '78 Avenue Al Massira, Rabat',
];

async function seed() {
  try {
    console.log('🌱 Début du seeding...');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Tables créées');

    // Create Superadmin
    const superadmin = await User.create({
      nom: 'ADMIN',
      prenom: 'Super',
      email: 'admin@ree.ma',
      password: 'password123',
      role: 'SUPERADMIN',
    });
    console.log('✅ Superadmin créé: admin@ree.ma / password123');

    // Create Standard User
    const user = await User.create({
      nom: 'USER',
      prenom: 'Standard',
      email: 'user@ree.ma',
      password: 'password123',
      role: 'USER',
    });
    console.log('✅ User standard créé: user@ree.ma / password123');

    // Create 10 Agents
    const agents = [];
    for (let i = 0; i < 10; i++) {
      const agent = await Agent.create({
        nom: noms[i % noms.length],
        prenom: prenoms[i % prenoms.length],
        telephone: `0${6 + (i % 2)}${Math.floor(Math.random() * 90000000) + 10000000}`,
        quartier: quartiersRabat[i % quartiersRabat.length],
      });
      agents.push(agent);
    }
    console.log(`✅ ${agents.length} agents créés`);

    // Create 50 Compteurs (mix EAU/ELECTRICITE)
    const compteurs = [];
    const types = ['EAU', 'ELECTRICITE'];
    for (let i = 1; i <= 50; i++) {
      const numero_serie = i.toString().padStart(9, '0');
      const type = types[Math.floor(Math.random() * 2)];
      const indexInitial = Math.floor(Math.random() * 5000) + 100; // Index initial entre 100 et 5100

      const compteur = await Compteur.create({
        numero_serie,
        type,
        adresse: adressesRabat[(i - 1) % adressesRabat.length],
        index_actuel: indexInitial,
        client_nom: `${prenoms[(i - 1) % prenoms.length]} ${noms[(i - 1) % noms.length]}`,
      });
      compteurs.push(compteur);
    }
    console.log(`✅ ${compteurs.length} compteurs créés`);

    // Create 100 Relevés passés
    const releves = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const compteur = compteurs[Math.floor(Math.random() * compteurs.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      // Generate random date in the past 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const dateReleve = new Date(now);
      dateReleve.setDate(dateReleve.getDate() - daysAgo);
      
      // Get current index (may have been updated by previous releve)
      const currentIndex = compteur.index_actuel;
      const increment = Math.floor(Math.random() * 100) + 10; // Increment between 10 and 110
      const nouvelIndex = currentIndex + increment;
      
      const releve = await Releve.create({
        compteur_id: compteur.numero_serie,
        agent_id: agent.id,
        date_releve: dateReleve,
        ancien_index: currentIndex,
        nouvel_index: nouvelIndex,
        consommation: increment,
      });
      
      // Update compteur index
      compteur.index_actuel = nouvelIndex;
      await compteur.save();
      
      releves.push(releve);
    }
    console.log(`✅ ${releves.length} relevés créés`);

    console.log('🎉 Seeding terminé avec succès!');
    console.log('\n📋 Comptes de connexion:');
    console.log('   Superadmin: admin@ree.ma / password123');
    console.log('   User: user@ree.ma / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();

