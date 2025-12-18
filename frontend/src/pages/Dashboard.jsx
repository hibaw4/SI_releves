import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-600">Erreur de chargement des statistiques</div>;
  }

  const chartData = [
    {
      name: 'EAU',
      'Consommation Moyenne': parseFloat(stats.consommationMoyenneParType.EAU.toFixed(2)),
    },
    {
      name: 'ÉLECTRICITÉ',
      'Consommation Moyenne': parseFloat(stats.consommationMoyenneParType.ELECTRICITE.toFixed(2)),
    },
  ];

  // Coverage gauge data for pie chart
  const coverageData = [
    { name: 'Relevés', value: stats.compteursRelevesCeMois },
    { name: 'Non relevés', value: stats.totalCompteurs - stats.compteursRelevesCeMois },
  ];
  const COVERAGE_COLORS = ['#3B82F6', '#E5E7EB'];

  // Monthly trend for chart
  const trendData = stats.monthlyTrend?.map(m => ({
    month: m.month,
    'Eau (m³)': parseFloat(m.eau.average) || 0,
    'Électricité (kWh)': parseFloat(m.electricite.average) || 0,
  })) || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Coverage Rate with Gauge */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Taux de couverture</h2>
          <div className="flex items-center justify-between">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {coverageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COVERAGE_COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-20">
                <span className="text-2xl font-bold text-blue-600">{stats.tauxCouverture}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{stats.compteursRelevesCeMois}</p>
              <p className="text-sm text-gray-500">sur {stats.totalCompteurs}</p>
              <p className="text-xs text-gray-400">compteurs ce mois</p>
            </div>
          </div>
        </div>

        {/* Consumption by Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Consommation moyenne</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Eau</span>
              </div>
              <span className="font-semibold text-gray-800">
                {stats.consommationMoyenneParType.EAU.toFixed(2)} m³
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Électricité</span>
              </div>
              <span className="font-semibold text-gray-800">
                {stats.consommationMoyenneParType.ELECTRICITE.toFixed(2)} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Statistiques</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Compteurs</span>
              <span className="font-semibold text-gray-800">{stats.totalCompteurs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Agents actifs</span>
              <span className="font-semibold text-gray-800">
                {stats.agentPerformance?.filter(a => a.totalReleves > 0).length || 0}
              </span>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="w-full mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir les rapports détaillés →
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Consumption by Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Consommation moyenne par type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Consommation Moyenne" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Monthly Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Évolution mensuelle (12 derniers mois)
          </h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Eau (m³)" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Électricité (kWh)" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </div>
      </div>

      {/* Agent Performance */}
      {stats.agentPerformance && stats.agentPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Performance des Agents (ce mois)
            </h2>
            <button
              onClick={() => navigate('/agents')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir tous les agents →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quartier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Relevés</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours Travaillés</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moy./Jour</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.agentPerformance.slice(0, 5).map((agent) => (
                  <tr 
                    key={agent.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {agent.prenom} {agent.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {agent.quartier || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {agent.totalReleves}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {agent.daysWorked}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {agent.averageDailyReadings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coverage by Quartier */}
      {stats.couvertureParQuartier && stats.couvertureParQuartier.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Relevés par Quartier (ce mois)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.couvertureParQuartier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quartier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="compteurs_releves" name="Compteurs relevés" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
