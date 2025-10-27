import { useState, useEffect } from 'react';
import { fetchUser } from '../services/api.client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const fetchedUser = await fetchUser();
        setUser(fetchedUser);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const logout = () => {
    setUser(null);
    // Additional logout logic can be added here
  };

  return { user, loading, error, logout };
};