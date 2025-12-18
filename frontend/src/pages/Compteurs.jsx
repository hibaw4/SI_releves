import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Compteurs = () => {
  const [compteurs, setCompteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'EAU', adresse: '', client_nom: '' });
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    sortBy: 'numero_serie',
    sortOrder: 'ASC',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompteurs();
  }, [filters]);

  const fetchCompteurs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`/api/compteurs?${params.toString()}`);
      setCompteurs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération compteurs:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/compteurs', formData);
      setShowModal(false);
      setFormData({ type: 'EAU', adresse: '', client_nom: '' });
      fetchCompteurs();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <span className="text-gray-300">↕</span>;
    return filters.sortOrder === 'ASC' ? <span>↑</span> : <span>↓</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Compteurs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Nouveau Compteur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              placeholder="N° série, adresse ou client..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="EAU">EAU</option>
              <option value="ELECTRICITE">ÉLECTRICITÉ</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ type: '', search: '', sortBy: 'numero_serie', sortOrder: 'ASC' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nouveau Compteur</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="EAU">EAU</option>
                  <option value="ELECTRICITE">ÉLECTRICITÉ</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="123 Avenue Mohammed V, Rabat"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nom du client (optionnel)</label>
                <input
                  type="text"
                  value={formData.client_nom}
                  onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du client"
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Le numéro de série sera généré automatiquement.
              </p>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('numero_serie')}
              >
                Numéro de série <SortIcon field="numero_serie" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                Type <SortIcon field="type" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('adresse')}
              >
                Adresse <SortIcon field="adresse" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('index_actuel')}
              >
                Index actuel <SortIcon field="index_actuel" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {compteurs.map((compteur) => (
              <tr 
                key={compteur.numero_serie} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/compteurs/${compteur.numero_serie}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                  {compteur.numero_serie}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      compteur.type === 'EAU'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {compteur.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{compteur.adresse}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {compteur.index_actuel.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{compteur.client_nom || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compteurs.length === 0 && (
        <div className="text-center py-12 text-gray-500">Aucun compteur trouvé</div>
      )}
    </div>
  );
};

export default Compteurs;
