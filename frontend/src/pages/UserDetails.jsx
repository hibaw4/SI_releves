import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [resetPassword, setResetPassword] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
      setFormData({
        nom: response.data.nom,
        prenom: response.data.prenom,
        role: response.data.role,
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`/api/users/${id}`, formData);
      setEditing(false);
      fetchUser();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur?')) {
      return;
    }
    try {
      const response = await axios.post(`/api/users/${id}/reset-password`);
      setResetPassword(response.data.generatedPassword);
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la réinitialisation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Utilisateur non trouvé</p>
        <button onClick={() => navigate('/users')} className="mt-4 text-blue-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/users')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Détails Utilisateur</h1>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={handleResetPassword}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Réinitialiser le mot de passe
              </button>
            </>
          )}
        </div>
      </div>

      {resetPassword && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold mb-2">Mot de passe réinitialisé!</p>
          <p className="text-sm text-green-700">Nouveau mot de passe:</p>
          <p className="font-mono bg-green-100 p-2 rounded mt-2 select-all">{resetPassword}</p>
          <button 
            onClick={() => setResetPassword(null)}
            className="mt-3 text-sm text-green-600 hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
            {editing ? (
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{user.nom}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
            {editing ? (
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-800">{user.prenom}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-lg text-gray-800">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
            {editing ? (
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">USER</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            ) : (
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  user.role === 'SUPERADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {user.role}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
            <p className="text-lg text-gray-800">
              {new Date(user.date_creation).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {user.date_modification && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Dernière modification</label>
              <p className="text-lg text-gray-800">
                {new Date(user.date_modification).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {editing && (
          <div className="flex gap-4 mt-6 pt-6 border-t">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Enregistrer
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  nom: user.nom,
                  prenom: user.prenom,
                  role: user.role,
                });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;

