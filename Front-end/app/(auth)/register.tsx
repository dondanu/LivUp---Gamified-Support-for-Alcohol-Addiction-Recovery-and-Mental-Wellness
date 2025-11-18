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
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();

  const handleRegister = async () => {
    // Clear previous errors
    setError('');

    // Validate all fields are filled
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    // Validate username (backend requires min 3 characters)
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length (backend requires min 6 characters)
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    // Use trimmed username
    const { error } = await signUp(email, password, trimmedUsername);

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
    <LinearGradient colors={['#667EEA', '#764BA2', '#F093FB']} style={styles.container} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <UserPlus size={64} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.title}>Join MindFusion</Text>
              <Text style={styles.subtitle}>Start your recovery journey today</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Username (min 3 characters)"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

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
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                minLength={6}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
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
  registerButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
