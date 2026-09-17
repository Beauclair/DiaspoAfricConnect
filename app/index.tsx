import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import LoadingSpinner from '../src/components/common/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (user) return <Redirect href="/(tabs)/home" />;

  return <Redirect href="/(auth)/login" />;
}
