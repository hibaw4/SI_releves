import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('3months');
  const [editingQuartier, setEditingQuartier] = useState(false);
  const [quartier, setQuartier] = useState('');

  useEffect(() => {
    fetchAgent();
  }, [id, period]);

  const fetchAgent = async () => {
    try {
      const response = await axios.get(`/api/agents/${id}?period=${period}`);
      setAgent(response.data);
      setQuartier(response.data.quartier || '');
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération agent:', error);
      setLoading(false);
    }
  };

  const handleSaveQuartier = async () => {
    try {
      await axios.patch(`/api/agents/${id}/quartier`, { quartier });
      setEditingQuartier(false);
      fetchAgent();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Agent non trouvé</p>
        <button onClick={() => navigate('/agents')} className="mt-4 text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/agents')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Détails Agent</h1>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
            <p className="text-lg font-semibold text-gray-800">{agent.nom}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
            <p className="text-lg font-semibold text-gray-800">{agent.prenom}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
            <p className="text-lg text-gray-800">{agent.telephone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Quartier assigné</label>
            {editingQuartier ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveQuartier}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingQuartier(false);
                    setQuartier(agent.quartier || '');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className={`text-lg ${agent.quartier ? 'text-gray-800' : 'text-gray-400'}`}>
                  {agent.quartier || 'Non assigné'}
                </p>
                <button
                  onClick={() => setEditingQuartier(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Performance</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1week">1 semaine</option>
            <option value="1month">1 mois</option>
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="1year">1 an</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Relevés</p>
            <p className="text-3xl font-bold text-blue-800">{agent.stats?.totalReadings || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Moyenne journalière</p>
            <p className="text-3xl font-bold text-green-800">{agent.stats?.averageDailyReadings || 0}</p>
            <p className="text-xs text-green-600">relevés / jour travaillé</p>
          </div>
        </div>

        {/* Daily readings chart */}
        {agent.stats?.dailyReadings?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Évolution des relevés</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={agent.stats.dailyReadings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                  formatter={(value) => [value, 'Relevés']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {(!agent.stats?.dailyReadings || agent.stats.dailyReadings.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            Aucun relevé pour cette période
          </div>
        )}
      </div>

      {/* Link to readings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => navigate(`/releves?agent_id=${id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Voir tous les relevés de cet agent →
        </button>
      </div>
    </div>
  );
};

export default AgentDetails;

