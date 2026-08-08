import { useState, useCallback } from 'react';

export default function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (promise) => {
    setLoading(true);
    setError(null);

    try {
      const response = await promise;
      setLoading(false);
      return { success: true, response, data: response.data };
    } catch (err) {
      setLoading(false);
      setError(err);
      return { success: false, error: err };
    }
  }, []);

  return { loading, error, run, setError };
}
