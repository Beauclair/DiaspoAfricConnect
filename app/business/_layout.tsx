import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function BusinessLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textWhite,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
