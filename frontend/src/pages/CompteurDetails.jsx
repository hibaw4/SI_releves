import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompteurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [compteur, setCompteur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompteur();
  }, [id]);

  const fetchCompteur = async () => {
    try {
      const response = await axios.get(`/api/compteurs/${id}`);
      setCompteur(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération compteur:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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

  if (!compteur) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Compteur non trouvé</p>
        <button onClick={() => navigate('/compteurs')} className="mt-4 text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/compteurs')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Détails Compteur</h1>
      </div>

      {/* Compteur Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Numéro de série</label>
            <p className="text-lg font-mono font-semibold text-gray-800">{compteur.numero_serie}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                compteur.type === 'EAU'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {compteur.type}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Index actuel</label>
            <p className="text-lg font-semibold text-gray-800">
              {compteur.index_actuel.toFixed(2)} {compteur.type === 'EAU' ? 'm³' : 'kWh'}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Adresse</label>
            <p className="text-lg text-gray-800">{compteur.adresse}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
            <p className={`text-lg ${compteur.client_nom ? 'text-gray-800' : 'text-gray-400'}`}>
              {compteur.client_nom || 'Non assigné'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Dernier relevé</label>
            <p className="text-lg text-gray-800">{formatDate(compteur.date_derniere_releve)}</p>
          </div>
        </div>
      </div>

      {/* Reading History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Historique des relevés (10 derniers)</h2>
          <button
            onClick={() => navigate(`/releves?compteur_id=${compteur.numero_serie}`)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir plus →
          </button>
        </div>

        {compteur.historique_releves?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ancien index</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nouvel index</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consommation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {compteur.historique_releves.map((releve) => (
                  <tr 
                    key={releve.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/releves/${releve.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(releve.date_releve)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {releve.ancien_index.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {releve.nouvel_index.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {releve.consommation.toFixed(2)} {compteur.type === 'EAU' ? 'm³' : 'kWh'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun relevé pour ce compteur
          </div>
        )}
      </div>
    </div>
  );
};

export default CompteurDetails;

