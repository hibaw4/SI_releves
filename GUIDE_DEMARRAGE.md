# Guide de Démarrage - SI Relevés

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 18 ou supérieure) : [Télécharger Node.js](https://nodejs.org/)
- **MySQL** (version 8.0 ou supérieure) : [Télécharger MySQL](https://dev.mysql.com/downloads/mysql/)
- **npm** (généralement inclus avec Node.js)

## Étape 1 : Configuration de MySQL

1. Démarrez MySQL sur votre machine
2. Connectez-vous à MySQL (via MySQL Workbench, ligne de commande, ou phpMyAdmin)
3. Créez la base de données :
```sql
CREATE DATABASE si_releves;
```

## Étape 2 : Configuration du Backend

1. Ouvrez un terminal et allez dans le dossier backend :
```bash
cd backend
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
   - Créez un fichier `.env` dans le dossier `backend/`
   - Ajoutez les informations suivantes (adaptez selon votre configuration MySQL) :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=si_releves
JWT_SECRET=si-releves-secret-key-2024
PORT=3000
```

   **Important** : Remplacez `votre_mot_de_passe_mysql` par votre vrai mot de passe MySQL.

## Étape 3 : Initialisation de la Base de Données

Toujours dans le dossier `backend/`, exécutez le script de seed pour créer les tables et peupler la base de données :

```bash
npm run seed
```

Vous devriez voir des messages confirmant la création des données :
- ✅ Superadmin créé: admin@ree.ma / password123
- ✅ User standard créé: user@ree.ma / password123
- ✅ 10 agents créés
- ✅ 50 compteurs créés
- ✅ 100 relevés créés

## Étape 4 : Démarrer le Serveur Backend

Toujours dans le dossier `backend/`, démarrez le serveur :

```bash
npm start
```

Le serveur devrait démarrer sur `http://localhost:3000`

Vous verrez les messages :
- ✅ Connexion à la base de données réussie.
- ✅ Modèles synchronisés avec la base de données.
- 🚀 Serveur démarré sur le port 3000

**Laissez ce terminal ouvert !**

## Étape 5 : Configuration du Frontend

1. Ouvrez **un nouveau terminal** (gardez le backend en cours d'exécution)
2. Allez dans le dossier frontend :
```bash
cd frontend
```

3. Installez les dépendances :
```bash
npm install
```

## Étape 6 : Démarrer l'Application Frontend

Toujours dans le dossier `frontend/`, démarrez le serveur de développement :

```bash
npm run dev
```

L'application devrait démarrer sur `http://localhost:5173`

Votre navigateur devrait s'ouvrir automatiquement. Sinon, ouvrez manuellement : `http://localhost:5173`

## Étape 7 : Connexion

Sur la page de connexion, utilisez l'un de ces comptes :

**Compte Superadmin** (accès complet) :
- Email : `admin@ree.ma`
- Mot de passe : `password123`

**Compte Utilisateur Standard** :
- Email : `user@ree.ma`
- Mot de passe : `password123`

## Résumé des Commandes

### Terminal 1 (Backend)
```bash
cd backend
npm install
# Configurer .env
npm run seed
npm start
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

## Vérification

Une fois tout démarré, vous devriez avoir :
- ✅ Backend accessible sur : http://localhost:3000
- ✅ Frontend accessible sur : http://localhost:5173
- ✅ Base de données MySQL avec toutes les tables et données

## Dépannage

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans le fichier `.env`
- Vérifiez que la base de données `si_releves` existe

### Erreur "Port already in use"
- Si le port 3000 est occupé, changez `PORT` dans le fichier `.env`
- Si le port 5173 est occupé, Vite utilisera automatiquement un autre port

### Erreur "Cannot find module"
- Exécutez `npm install` dans le dossier concerné (backend ou frontend)

### Réinitialiser la base de données
Si vous voulez réinitialiser complètement la base de données :
1. Supprimez la base : `DROP DATABASE si_releves;`
2. Recréez-la : `CREATE DATABASE si_releves;`
3. Relancez le seed : `npm run seed` (dans backend/)

## Structure des URLs

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3000/api
- **Health Check** : http://localhost:3000/api/health

Bon développement ! 🚀

