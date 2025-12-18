# SI Relevés - Backoffice MVP

Application web de gestion pour une société d'eau et d'électricité. Ce système permet de gérer les compteurs, les agents de terrain et de visualiser les relevés de consommation.

## Stack Technique

- **Backend**: Node.js + Express
- **Base de données**: MySQL avec Sequelize ORM
- **Frontend**: React (Vite) + Tailwind CSS
- **Sécurité**: JWT pour l'authentification

## Structure du Projet

```
SI_releves/
├── backend/
│   ├── config/          # Configuration base de données
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── middleware/      # Middleware (auth)
│   ├── server.js        # Point d'entrée serveur
│   ├── seed.js          # Script de seeding
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Composants React
    │   ├── pages/       # Pages de l'application
    │   ├── context/     # Context (Auth)
    │   └── App.jsx
    └── package.json
```

## Installation

### Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

### Configuration Backend

1. Installer les dépendances:
```bash
cd backend
npm install
```

2. Configurer la base de données:
   - Créer un fichier `.env` dans le dossier `backend/` (copier `.env.example`)
   - Modifier les variables selon votre configuration MySQL:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=si_releves
   JWT_SECRET=si-releves-secret-key-2024
   PORT=3000
   ```

3. Créer la base de données MySQL:
```sql
CREATE DATABASE si_releves;
```

4. Lancer le seed pour peupler la base de données:
```bash
npm run seed
```

5. Démarrer le serveur:
```bash
npm start
# ou en mode développement avec auto-reload:
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### Configuration Frontend

1. Installer les dépendances:
```bash
cd frontend
npm install
```

2. Démarrer le serveur de développement:
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Comptes de Test

Le script de seed crée automatiquement deux comptes:

- **Superadmin**: 
  - Email: `admin@ree.ma`
  - Mot de passe: `password123`

- **Utilisateur standard**:
  - Email: `user@ree.ma`
  - Mot de passe: `password123`

## Données de Seed

Le script de seed crée également:
- 10 Agents fictifs
- 50 Compteurs (mixte Eau/Électricité) avec des adresses à Rabat
- 100 Relevés passés pour alimenter les graphiques

## API Routes

### Authentification
- `POST /api/auth/login` - Connexion

### Dashboard
- `GET /api/dashboard` - Statistiques du dashboard (taux de couverture, consommation moyenne)

### Utilisateurs (SuperAdmin uniquement)
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur

### Agents
- `GET /api/agents` - Liste des agents
- `PATCH /api/agents/:id/quartier` - Modifier le quartier d'un agent

### Compteurs
- `GET /api/compteurs` - Liste des compteurs
- `POST /api/compteurs` - Créer un compteur

### Relevés
- `GET /api/releves` - Liste des relevés
- `POST /api/releves/simulation/releve` - Simulation de relevé depuis mobile (publique, pour test)

## Fonctionnalités

### Module Authentification
- Page de connexion avec email/mot de passe
- Gestion JWT et sessions

### Module Superadmin
- Gestion des utilisateurs (création, liste)

### Module Utilisateur Standard
- **Dashboard**: 
  - KPI: Taux de couverture (compteurs relevés ce mois / total)
  - Graphique: Consommation moyenne par type (Eau vs Électricité)
- **Compteurs**: Liste et création de compteurs
- **Agents**: Liste et modification des quartiers d'affectation
- **Relevés**: Historique des relevés avec toutes les informations

## Notes Techniques

- Les mots de passe sont hashés avec bcrypt
- Les noms sont automatiquement convertis en MAJUSCULES
- Les prénoms ont automatiquement la première lettre en majuscule
- Les numéros de série des compteurs sont générés automatiquement (9 chiffres)
- La consommation est calculée automatiquement lors de la création d'un relevé
- L'index actuel du compteur est mis à jour automatiquement après chaque relevé

