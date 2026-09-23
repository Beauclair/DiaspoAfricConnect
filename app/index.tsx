import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import LoadingSpinner from '../src/components/common/LoadingSpinner';

export default function Index() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return <Redirect href="/(tabs)/home" />;
}
