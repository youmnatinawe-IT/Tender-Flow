import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSessionExpired } from '../services/session';

export default function SessionExpiryWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    return onSessionExpired(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  return null;
}
