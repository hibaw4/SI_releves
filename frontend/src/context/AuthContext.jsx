import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const inactivityTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    delete axios.defaults.headers.common['Authorization'];
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    lastActivity.current = Date.now();
    localStorage.setItem('lastActivity', lastActivity.current.toString());
    
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    if (token) {
      inactivityTimer.current = setTimeout(() => {
        console.log('Session expirée pour inactivité');
        logout();
        window.location.href = '/login?expired=true';
      }, INACTIVITY_TIMEOUT);
    }
  }, [token, logout]);

  // Track user activity
  useEffect(() => {
    if (!token) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Check for existing session on page load
    const storedLastActivity = localStorage.getItem('lastActivity');
    if (storedLastActivity) {
      const timeSinceActivity = Date.now() - parseInt(storedLastActivity);
      if (timeSinceActivity > INACTIVITY_TIMEOUT) {
        logout();
        return;
      }
    }

    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [token, resetInactivityTimer, logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('lastActivity', Date.now().toString());
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, mustChangePassword: userData.must_change_password };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion',
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      // Update user to remove must_change_password flag
      const updatedUser = { ...user, must_change_password: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du changement de mot de passe',
      };
    }
  };

  const isSuperAdmin = () => {
    return user?.role === 'SUPERADMIN';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isSuperAdmin,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
