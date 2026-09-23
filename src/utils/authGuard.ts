import { Alert } from 'react-native';
import { router } from 'expo-router';
import { User as FirebaseUser } from 'firebase/auth';

/**
 * Check if user is authenticated before performing an action.
 * If not logged in, shows an alert prompting to sign in.
 *
 * @param user - The current Firebase user (or null)
 * @param action - Callback to run if the user is authenticated
 */
export function requireAuth(user: FirebaseUser | null, action: () => void): void {
  if (user) {
    action();
    return;
  }

  Alert.alert(
    'Sign In Required',
    'You need an account to do this. Would you like to sign in?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
    ],
  );
}
