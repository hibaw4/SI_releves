import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [quartier, setQuartier] = useState('');
  const [filters, setFilters] = useState({
    quartier: '',
    search: '',
    sortBy: 'nom',
    sortOrder: 'ASC',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuartiers();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  const fetchQuartiers = async () => {
    try {
      const response = await axios.get('/api/agents/quartiers');
      setQuartiers(response.data);
    } catch (error) {
      console.error('Erreur récupération quartiers:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.quartier) params.append('quartier', filters.quartier);
      if (filters.search) params.append('search', filters.search);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`/api/agents?${params.toString()}`);
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération agents:', error);
      setLoading(false);
    }
  };

  const handleEdit = (agent, e) => {
    e.stopPropagation();
    setEditingAgent(agent);
    setQuartier(agent.quartier || '');
  };

  const handleSave = async (e) => {
    e?.stopPropagation();
    try {
      await axios.patch(`/api/agents/${editingAgent.id}/quartier`, { quartier });
      setEditingAgent(null);
      setQuartier('');
      fetchAgents();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Agents</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              placeholder="Nom ou prénom..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
            <select
              value={filters.quartier}
              onChange={(e) => setFilters({ ...filters, quartier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les quartiers</option>
              {quartiers.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ quartier: '', search: '', sortBy: 'nom', sortOrder: 'ASC' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nom')}
              >
                Nom <SortIcon field="nom" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prenom')}
              >
                Prénom <SortIcon field="prenom" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quartier')}
              >
                Quartier <SortIcon field="quartier" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr 
                key={agent.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/agents/${agent.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {agent.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.prenom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {agent.telephone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingAgent?.id === agent.id ? (
                    <input
                      type="text"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={handleSave}
                      onKeyPress={(e) => e.key === 'Enter' && handleSave(e)}
                      autoFocus
                    />
                  ) : (
                    <span className={agent.quartier ? '' : 'text-gray-400'}>
                      {agent.quartier || 'Non assigné'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingAgent?.id !== agent.id && (
                    <button
                      onClick={(e) => handleEdit(agent, e)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier quartier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agents;
