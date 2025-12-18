import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [consumptionReport, setConsumptionReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [monthlyRes, consumptionRes] = await Promise.all([
        axios.get(`/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`),
        axios.get('/api/reports/consumption'),
      ]);
      setMonthlyReport(monthlyRes.data);
      setConsumptionReport(consumptionRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération rapports:', error);
      setLoading(false);
    }
  };

  const exportToPDF = (reportType) => {
    // In a real app, this would generate a PDF
    // For simulation, we'll create a printable view
    const printWindow = window.open('', '_blank');
    const title = reportType === 'monthly' 
      ? `Rapport Mensuel - ${monthlyReport?.period?.label}` 
      : `Rapport Évolution Consommation - ${consumptionReport?.currentYear}`;
    
    let content = `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; }
          .summary { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .stat { display: inline-block; margin-right: 40px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
    `;

    if (reportType === 'monthly' && monthlyReport) {
      content += `
        <div class="summary">
          <div class="stat">
            <div>Total Relevés</div>
            <div class="stat-value">${monthlyReport.summary.totalReleves}</div>
          </div>
          <div class="stat">
            <div>Total Agents</div>
            <div class="stat-value">${monthlyReport.summary.totalAgents}</div>
          </div>
          <div class="stat">
            <div>Moyenne par Agent</div>
            <div class="stat-value">${monthlyReport.summary.avgRelevesPerAgent}</div>
          </div>
        </div>
        <h2>Distribution par Quartier</h2>
        <table>
          <tr>
            <th>Quartier</th>
            <th>Nombre d'Agents</th>
            <th>Total Relevés</th>
            <th>Moyenne Journalière / Agent</th>
          </tr>
          ${monthlyReport.relevesParQuartier.map(q => `
            <tr>
              <td>${q.quartier}</td>
              <td>${q.agentCount}</td>
              <td>${q.totalReleves}</td>
              <td>${q.avgDailyPerAgent}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (reportType === 'consumption' && consumptionReport) {
      content += `
        <div class="summary">
          <h3>Totaux Annuels</h3>
          <div class="stat">
            <div>Eau ${consumptionReport.currentYear}</div>
            <div class="stat-value">${consumptionReport.yearlyTotals.eau.currentYear.toFixed(2)} m³</div>
          </div>
          <div class="stat">
            <div>Électricité ${consumptionReport.currentYear}</div>
            <div class="stat-value">${consumptionReport.yearlyTotals.electricite.currentYear.toFixed(2)} kWh</div>
          </div>
        </div>
        <h2>Évolution Mensuelle</h2>
        <table>
          <tr>
            <th>Mois</th>
            <th>Eau ${consumptionReport.currentYear}</th>
            <th>Eau ${consumptionReport.lastYear}</th>
            <th>Élec. ${consumptionReport.currentYear}</th>
            <th>Élec. ${consumptionReport.lastYear}</th>
          </tr>
          ${consumptionReport.monthlyData.map(m => `
            <tr>
              <td>${m.month}</td>
              <td>${m.eau.currentYear} m³</td>
              <td>${m.eau.lastYear} m³</td>
              <td>${m.electricite.currentYear} kWh</td>
              <td>${m.electricite.lastYear} kWh</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    content += `
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          Généré le ${new Date().toLocaleString('fr-FR')} - SI Relevés
        </p>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Rapports & Statistiques</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rapport Mensuel
        </button>
        <button
          onClick={() => setActiveTab('consumption')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'consumption'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Évolution Consommation
        </button>
      </div>

      {/* Monthly Report */}
      {activeTab === 'monthly' && monthlyReport && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            <button
              onClick={() => exportToPDF('monthly')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              📄 Exporter PDF
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-sm text-blue-600 font-medium">Total Relevés</p>
              <p className="text-3xl font-bold text-blue-800">{monthlyReport.summary.totalReleves}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <p className="text-sm text-green-600 font-medium">Total Agents</p>
              <p className="text-3xl font-bold text-green-800">{monthlyReport.summary.totalAgents}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <p className="text-sm text-purple-600 font-medium">Moyenne par Agent</p>
              <p className="text-3xl font-bold text-purple-800">{monthlyReport.summary.avgRelevesPerAgent}</p>
            </div>
          </div>

          {/* Quartier Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribution par Quartier</h2>
            {monthlyReport.relevesParQuartier.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyReport.relevesParQuartier}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quartier" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalReleves" name="Total Relevés" fill="#3B82F6" />
                    <Bar dataKey="agentCount" name="Nombre Agents" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>

                <table className="min-w-full divide-y divide-gray-200 mt-6">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quartier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agents</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Relevés</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moy. Journalière/Agent</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReport.relevesParQuartier.map((q, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{q.quartier}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{q.agentCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{q.totalReleves}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{q.avgDailyPerAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune donnée pour cette période</p>
            )}
          </div>
        </div>
      )}

      {/* Consumption Report */}
      {activeTab === 'consumption' && consumptionReport && (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => exportToPDF('consumption')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              📄 Exporter PDF
            </button>
          </div>

          {/* Yearly Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Eau (m³)</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600">{consumptionReport.currentYear}</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {consumptionReport.yearlyTotals.eau.currentYear.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-400">{consumptionReport.lastYear}</p>
                  <p className="text-xl text-blue-600">
                    {consumptionReport.yearlyTotals.eau.lastYear.toFixed(2)}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${
                  consumptionReport.yearlyTotals.eau.evolution >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {consumptionReport.yearlyTotals.eau.evolution >= 0 ? '↑' : '↓'} 
                  {Math.abs(consumptionReport.yearlyTotals.eau.evolution)}%
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Électricité (kWh)</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-yellow-600">{consumptionReport.currentYear}</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {consumptionReport.yearlyTotals.electricite.currentYear.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-yellow-400">{consumptionReport.lastYear}</p>
                  <p className="text-xl text-yellow-600">
                    {consumptionReport.yearlyTotals.electricite.lastYear.toFixed(2)}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${
                  consumptionReport.yearlyTotals.electricite.evolution >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {consumptionReport.yearlyTotals.electricite.evolution >= 0 ? '↑' : '↓'} 
                  {Math.abs(consumptionReport.yearlyTotals.electricite.evolution)}%
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Évolution Mensuelle - Comparaison N / N-1
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={consumptionReport.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="eau.currentYear" 
                  name={`Eau ${consumptionReport.currentYear}`} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="eau.lastYear" 
                  name={`Eau ${consumptionReport.lastYear}`} 
                  stroke="#93C5FD" 
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="electricite.currentYear" 
                  name={`Électricité ${consumptionReport.currentYear}`} 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="electricite.lastYear" 
                  name={`Électricité ${consumptionReport.lastYear}`} 
                  stroke="#FCD34D" 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Data Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Détails Mensuels</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">Eau {consumptionReport.currentYear}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase">Eau {consumptionReport.lastYear}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Évol.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yellow-500 uppercase">Élec. {consumptionReport.currentYear}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yellow-300 uppercase">Élec. {consumptionReport.lastYear}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Évol.</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consumptionReport.monthlyData.map((m, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.month}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{m.eau.currentYear} m³</td>
                      <td className="px-4 py-3 text-sm text-blue-400">{m.eau.lastYear} m³</td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        m.eau.evolution >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {m.eau.evolution >= 0 ? '+' : ''}{m.eau.evolution}%
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">{m.electricite.currentYear} kWh</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">{m.electricite.lastYear} kWh</td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        m.electricite.evolution >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {m.electricite.evolution >= 0 ? '+' : ''}{m.electricite.evolution}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

