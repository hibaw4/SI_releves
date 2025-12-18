import { useState, useEffect } from 'react';
import axios from 'axios';

const Simulation = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      console.log('[Simulation] 📊 Chargement du statut des données...');
      const response = await axios.get('/api/simulation/status');
      console.log('[Simulation] ✅ Statut récupéré:', response.data);
      setStatus(response.data);
      setLoading(false);
    } catch (error) {
      console.error('[Simulation] ❌ Erreur récupération statut:', error);
      setLoading(false);
    }
  };

  const runSimulation = async (type) => {
    setActionLoading(type);
    setResult(null);
    
    console.log(`[Simulation] 🚀 Lancement simulation: ${type}`);
    
    try {
      let response;
      switch (type) {
        case 'clients':
          console.log('[Simulation] 📥 Import clients depuis SI Commercial...');
          response = await axios.post('/api/simulation/erp/clients');
          console.log('[Simulation] ✅ Import clients terminé:', response.data);
          if (response.data.details?.created?.length > 0) {
            console.log('[Simulation] 📝 Compteurs créés:', response.data.details.created);
          }
          if (response.data.details?.skipped?.length > 0) {
            console.log('[Simulation] ⏭️ Clients ignorés (déjà existants):', response.data.details.skipped);
          }
          break;
        case 'agents':
          console.log('[Simulation] 📥 Import agents depuis SI RH...');
          response = await axios.post('/api/simulation/erp/agents');
          console.log('[Simulation] ✅ Import agents terminé:', response.data);
          if (response.data.details?.created?.length > 0) {
            console.log('[Simulation] 👥 Agents créés:', response.data.details.created);
          }
          if (response.data.details?.skipped?.length > 0) {
            console.log('[Simulation] ⏭️ Agents ignorés (déjà existants):', response.data.details.skipped);
          }
          break;
        case 'facturation':
          console.log(`[Simulation] 📤 Envoi facturation pour ${billingMonth}/${billingYear}...`);
          response = await axios.post('/api/simulation/facturation/send', {
            month: billingMonth,
            year: billingYear,
          });
          console.log('[Simulation] ✅ Envoi facturation terminé:', response.data);
          if (response.data.data?.length > 0) {
            console.log('[Simulation] 💰 Données envoyées à SI Facturation:', response.data.data);
          }
          break;
        case 'readings':
          console.log('[Simulation] 📝 Génération de relevés simulés...');
          response = await axios.post('/api/simulation/generate-readings');
          console.log('[Simulation] ✅ Relevés générés:', response.data);
          break;
        default:
          break;
      }
      setResult({ type, success: true, data: response.data });
      fetchStatus();
    } catch (error) {
      console.error(`[Simulation] ❌ Erreur simulation ${type}:`, error.response?.data || error.message);
      setResult({ 
        type, 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de la simulation' 
      });
    }
    setActionLoading(null);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulations ERP</h1>
      
      {/* Introduction */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Qu'est-ce que cette page ?</h2>
        <p className="text-blue-700 text-sm leading-relaxed">
          Cette page simule les échanges de données entre <strong>SI Relevés</strong> et les autres systèmes 
          d'information de RABAT ENERGIE & EAU. Les logs détaillés sont affichés dans la <strong>console du navigateur</strong> (F12).
        </p>
      </div>

      {/* Current Data Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">État actuel de la base de données</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Agents enregistrés</p>
            <p className="text-2xl font-bold text-blue-800">{status?.currentData?.agents || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Compteurs créés</p>
            <p className="text-2xl font-bold text-green-800">{status?.currentData?.compteurs || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Relevés effectués</p>
            <p className="text-2xl font-bold text-purple-800">{status?.currentData?.releves || 0}</p>
          </div>
        </div>
      </div>

      {/* Result Alert */}
      {result && (
        <div className={`rounded-lg p-4 mb-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✓ Simulation réussie!' : '✗ Erreur'}
              </h3>
              
              {result.success && result.data?.summary && (
                <div className="mt-2 text-sm text-green-700">
                  <p>✅ Créés: <strong>{result.data.summary.created || 0}</strong></p>
                  <p>⏭️ Ignorés: <strong>{result.data.summary.skipped || 0}</strong></p>
                  {result.data.summary.errors > 0 && (
                    <p>❌ Erreurs: <strong>{result.data.summary.errors}</strong></p>
                  )}
                </div>
              )}
              
              {/* Show skip reasons */}
              {result.success && result.data?.details?.skipped?.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800 mb-2">
                    ℹ️ Raisons des éléments ignorés :
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.data.details.skipped.slice(0, 5).map((item, i) => (
                      <li key={i}>
                        • {item.client || item.agent}: <em>{item.reason}</em>
                      </li>
                    ))}
                    {result.data.details.skipped.length > 5 && (
                      <li className="text-yellow-600">
                        ... et {result.data.details.skipped.length - 5} autres (voir console)
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Facturation summary */}
              {result.success && result.data?.summary?.totalReleves !== undefined && (
                <div className="mt-2 text-sm text-green-700">
                  <p>📊 Total relevés envoyés: <strong>{result.data.summary.totalReleves}</strong></p>
                  <p>💧 Eau: {result.data.summary.eau} relevés ({result.data.summary.totalConsommationEau?.toFixed(2)} m³)</p>
                  <p>⚡ Électricité: {result.data.summary.electricite} relevés ({result.data.summary.totalConsommationElec?.toFixed(2)} kWh)</p>
                </div>
              )}
              
              {/* Readings generation summary */}
              {result.success && result.data?.generated !== undefined && (
                <div className="mt-2 text-sm text-green-700">
                  <p>📝 Relevés générés: <strong>{result.data.generated}</strong></p>
                  <p className="text-xs text-green-600 mt-1">
                    Allez sur la page Rapports pour voir les nouvelles données!
                  </p>
                </div>
              )}
              
              {!result.success && (
                <p className="mt-1 text-sm text-red-600">{result.error}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                💡 Ouvrez la console (F12) pour voir les logs détaillés
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Simulation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SI Commercial - Clients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SI Commercial → SI Relevés</h3>
              <p className="text-sm text-gray-500">Import des clients</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ce que fait cette simulation :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Récupère {status?.simulatedData?.clientsAvailable || 0} clients fictifs</li>
              <li>• Crée 2 compteurs par client (eau + électricité)</li>
              <li>• Ignore les adresses qui ont déjà des compteurs</li>
            </ul>
          </div>
          
          <button
            onClick={() => runSimulation('clients')}
            disabled={actionLoading === 'clients'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {actionLoading === 'clients' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Import en cours...
              </span>
            ) : (
              'Importer les clients'
            )}
          </button>
        </div>

        {/* SI RH - Agents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SI RH → SI Relevés</h3>
              <p className="text-sm text-gray-500">Import des agents</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ce que fait cette simulation :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Récupère {status?.simulatedData?.agentsAvailable || 0} agents fictifs</li>
              <li>• Crée les profils avec assignation quartier</li>
              <li>• Ignore les agents déjà existants (même téléphone)</li>
            </ul>
          </div>
          
          <button
            onClick={() => runSimulation('agents')}
            disabled={actionLoading === 'agents'}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-green-400"
          >
            {actionLoading === 'agents' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Import en cours...
              </span>
            ) : (
              'Importer les agents'
            )}
          </button>
        </div>

        {/* Generate Readings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">App Mobile → SI Relevés</h3>
              <p className="text-sm text-gray-500">Génération de relevés</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ce que fait cette simulation :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Simule des relevés pour tous les compteurs</li>
              <li>• Génère des consommations aléatoires réalistes</li>
              <li>• Les données apparaissent dans la page Rapports</li>
            </ul>
          </div>
          
          <button
            onClick={() => runSimulation('readings')}
            disabled={actionLoading === 'readings' || (status?.currentData?.compteurs || 0) === 0}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-orange-400"
          >
            {actionLoading === 'readings' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Génération...
              </span>
            ) : (status?.currentData?.compteurs || 0) === 0 ? (
              'Importez d\'abord les clients'
            ) : (
              `Générer des relevés (${status?.currentData?.compteurs || 0} compteurs)`
            )}
          </button>
        </div>

        {/* SI Facturation - Billing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SI Relevés → SI Facturation</h3>
              <p className="text-sm text-gray-500">Export des consommations</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ce que fait cette simulation :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Collecte les relevés du mois sélectionné</li>
              <li>• Formate les données pour la facturation</li>
              <li>• Affiche le résumé dans la console</li>
            </ul>
          </div>
          
          <div className="flex gap-2 mb-4">
            <select
              value={billingMonth}
              onChange={(e) => setBillingMonth(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('fr-FR', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={billingYear}
              onChange={(e) => setBillingYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Array.from({ length: 3 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          
          <button
            onClick={() => runSimulation('facturation')}
            disabled={actionLoading === 'facturation' || (status?.currentData?.releves || 0) === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-purple-400"
          >
            {actionLoading === 'facturation' ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Envoi en cours...
              </span>
            ) : (status?.currentData?.releves || 0) === 0 ? (
              'Générez d\'abord des relevés'
            ) : (
              'Envoyer à la facturation'
            )}
          </button>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">📋 Guide rapide</h3>
        <ol className="text-sm text-yellow-700 space-y-2">
          <li><strong>1.</strong> Cliquez sur "Importer les clients" pour créer des compteurs</li>
          <li><strong>2.</strong> Cliquez sur "Importer les agents" pour créer des agents de terrain</li>
          <li><strong>3.</strong> Cliquez sur "Générer des relevés" pour simuler des relevés de compteurs</li>
          <li><strong>4.</strong> Allez sur la page <strong>Rapports</strong> pour voir les statistiques</li>
          <li><strong>5.</strong> Utilisez "Envoyer à la facturation" pour simuler l'export vers SI Facturation</li>
        </ol>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Architecture des flux de données</h2>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center w-32">
              <div className="text-2xl mb-1">🏢</div>
              <div className="font-semibold text-blue-800">SI Commercial</div>
              <div className="text-xs text-blue-600">Clients</div>
            </div>
            
            <div className="text-blue-500 font-bold text-xl">→</div>
            
            <div className="bg-indigo-100 border-2 border-indigo-400 rounded-lg p-4 text-center w-40">
              <div className="text-2xl mb-1">📊</div>
              <div className="font-semibold text-indigo-800">SI Relevés</div>
              <div className="text-xs text-indigo-600">Cette application</div>
            </div>
            
            <div className="text-purple-500 font-bold text-xl">→</div>
            
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-center w-32">
              <div className="text-2xl mb-1">💰</div>
              <div className="font-semibold text-purple-800">SI Facturation</div>
              <div className="text-xs text-purple-600">Factures</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center">
                <div className="text-xl">👥</div>
                <div className="text-xs font-semibold text-green-800">SI RH</div>
              </div>
              <div className="text-green-500">↗</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3 text-center">
                <div className="text-xl">📱</div>
                <div className="text-xs font-semibold text-orange-800">App Mobile</div>
              </div>
              <div className="text-orange-500">↗</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
