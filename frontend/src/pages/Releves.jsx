import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Releves = () => {
  const [releves, setReleves] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    type: '',
    agent_id: searchParams.get('agent_id') || '',
    date_from: '',
    date_to: '',
    sortBy: 'date_releve',
    sortOrder: 'DESC',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchReleves();
  }, [filters]);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Erreur récupération agents:', error);
    }
  };

  const fetchReleves = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.agent_id) params.append('agent_id', filters.agent_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`/api/releves?${params.toString()}`);
      setReleves(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération relevés:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'DESC' ? 'ASC' : 'DESC',
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Relevés</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              value={filters.agent_id}
              onChange={(e) => setFilters({ ...filters, agent_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.prenom} {agent.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ 
                type: '', 
                agent_id: '', 
                date_from: '', 
                date_to: '', 
                sortBy: 'date_releve', 
                sortOrder: 'DESC' 
              })}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <span className="font-semibold">{releves.length}</span> relevé(s) trouvé(s)
          {filters.date_from && ` depuis le ${new Date(filters.date_from).toLocaleDateString('fr-FR')}`}
          {filters.date_to && ` jusqu'au ${new Date(filters.date_to).toLocaleDateString('fr-FR')}`}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date_releve')}
                >
                  Date <SortIcon field="date_releve" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ancien Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nouvel Index
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('consommation')}
                >
                  Consommation <SortIcon field="consommation" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {releves.map((releve) => (
                <tr 
                  key={releve.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/releves/${releve.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(releve.date_releve)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {releve.agent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={releve.adresse}>
                    {releve.adresse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        releve.type === 'EAU'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {releve.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {releve.ancien_index.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {releve.nouvel_index.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {releve.consommation.toFixed(2)} {releve.type === 'EAU' ? 'm³' : 'kWh'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {releves.length === 0 && (
        <div className="text-center py-12 text-gray-500">Aucun relevé trouvé</div>
      )}
    </div>
  );
};

export default Releves;
