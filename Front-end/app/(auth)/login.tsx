import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { Heart } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const { signIn, signInAnonymously } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Navigation will be handled automatically by RootNavigator
      // based on auth state change, so we don't need to navigate manually
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInAnonymously();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Navigation will be handled automatically by RootNavigator
      // based on auth state change, so we don't need to navigate manually
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} style={styles.container} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Heart size={64} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.title}>SoberPath</Text>
            <Text style={styles.subtitle}>Your Journey to Recovery Starts Here</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.anonymousButton}
              onPress={handleAnonymousLogin}
              disabled={loading}>
              <Text style={styles.anonymousButtonText}>Continue Anonymously</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  anonymousButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  anonymousButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: 'bold',
  },
});
