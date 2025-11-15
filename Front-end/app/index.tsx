import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Tabs' as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' as never }],
        });
      }
    }
  }, [user, loading, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ECDC4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
