import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/theme';
import LoadingSpinner from '../src/components/common/LoadingSpinner';

export default function Index() {
  const { loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingSpinner />
      </View>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
