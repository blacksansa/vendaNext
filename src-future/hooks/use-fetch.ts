import { useState, useEffect } from 'react';
import { fetchData } from '../services/api.client';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataFromApi = async () => {
      try {
        const result = await fetchData(url);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromApi();
  }, [url]);

  const updateData = async (newData) => {
    try {
      await fetchData(url, {
        method: 'PUT',
        body: JSON.stringify(newData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setData((prevData) => ({
        ...prevData,
        ...newData,
      }));
    } catch (err) {
      setError(err);
    }
  };

  return { data, loading, error, updateData };
};

export default useFetch;