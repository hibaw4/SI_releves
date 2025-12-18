import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      'Consommation Moyenne': stats.consommationMoyenneParType.EAU.toFixed(2),
    },
    {
      name: 'ÉLECTRICITÉ',
      'Consommation Moyenne': stats.consommationMoyenneParType.ELECTRICITE.toFixed(2),
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* KPI Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Taux de couverture</h2>
        <div className="flex items-center">
          <div className="text-5xl font-bold text-blue-600 mr-4">
            {stats.tauxCouverture}%
          </div>
          <div className="text-gray-600">
            <p>{stats.compteursRelevesCeMois} compteurs relevés ce mois</p>
            <p>sur {stats.totalCompteurs} compteurs au total</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Consommation moyenne par type
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consommation Moyenne" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;

