import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReleveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [releve, setReleve] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleve();
  }, [id]);

  const fetchReleve = async () => {
    try {
      const response = await axios.get(`/api/releves/${id}`);
      setReleve(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération relevé:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!releve) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Relevé non trouvé</p>
        <button onClick={() => navigate('/releves')} className="mt-4 text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  const unit = releve.compteur.type === 'EAU' ? 'm³' : 'kWh';

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/releves')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Détails du Relevé</h1>
      </div>

      {/* Main Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations du relevé</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date du relevé</label>
            <p className="text-lg font-semibold text-gray-800">{formatDate(releve.date_releve)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">ID Relevé</label>
            <p className="text-lg font-mono text-gray-800">#{releve.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Ancien index</p>
            <p className="text-2xl font-bold text-gray-700">{releve.ancien_index.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{unit}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Nouvel index</p>
            <p className="text-2xl font-bold text-gray-700">{releve.nouvel_index.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{unit}</p>
          </div>
          <div className={`rounded-lg p-4 text-center ${
            releve.compteur.type === 'EAU' ? 'bg-blue-50' : 'bg-yellow-50'
          }`}>
            <p className={`text-sm mb-1 ${
              releve.compteur.type === 'EAU' ? 'text-blue-600' : 'text-yellow-600'
            }`}>Consommation</p>
            <p className={`text-2xl font-bold ${
              releve.compteur.type === 'EAU' ? 'text-blue-700' : 'text-yellow-700'
            }`}>{releve.consommation.toFixed(2)}</p>
            <p className={`text-xs ${
              releve.compteur.type === 'EAU' ? 'text-blue-500' : 'text-yellow-500'
            }`}>{unit}</p>
          </div>
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Agent</h2>
          <button
            onClick={() => navigate(`/agents/${releve.agent.id}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir détails →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
            <p className="text-lg text-gray-800">{releve.agent.prenom} {releve.agent.nom}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
            <p className="text-lg text-gray-800">{releve.agent.telephone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Quartier assigné</label>
            <p className={`text-lg ${releve.agent.quartier ? 'text-gray-800' : 'text-gray-400'}`}>
              {releve.agent.quartier || 'Non assigné'}
            </p>
          </div>
        </div>
      </div>

      {/* Compteur Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Compteur</h2>
          <button
            onClick={() => navigate(`/compteurs/${releve.compteur.numero_serie}`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir détails →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Numéro de série</label>
            <p className="text-lg font-mono text-gray-800">{releve.compteur.numero_serie}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                releve.compteur.type === 'EAU'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {releve.compteur.type}
            </span>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Adresse</label>
            <p className="text-lg text-gray-800">{releve.compteur.adresse}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
            <p className={`text-lg ${releve.compteur.client_nom ? 'text-gray-800' : 'text-gray-400'}`}>
              {releve.compteur.client_nom || 'Non assigné'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleveDetails;

