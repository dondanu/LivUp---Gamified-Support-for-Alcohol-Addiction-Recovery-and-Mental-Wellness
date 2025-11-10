import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useNavigation } from '@react-navigation/native';
import {
  Phone,
  MessageCircle,
  Heart,
  Wind,
  Activity,
  Music,
  BookOpen,
  ArrowLeft,
} from 'lucide-react-native';
import { EmergencyContact } from '@/types/database.types';

export default function SOSScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    loadEmergencyContacts();
  }, [profile]);

  const loadEmergencyContacts = async () => {
    if (!profile?.id) return;

    try {
      const response = await api.getSOSContacts();
      if (response.contacts) {
        setContacts(response.contacts);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => console.error('Error opening phone:', err));
  };

  const distractionActivities = [
    {
      icon: Wind,
      title: 'Deep Breathing',
      description: 'Practice 5 minutes of deep breathing exercises',
      color: ['#4ECDC4', '#44A08D'],
      duration: '5 min',
    },
    {
      icon: Activity,
      title: 'Quick Walk',
      description: 'Take a 10-minute walk to clear your mind',
      color: ['#667EEA', '#764BA2'],
      duration: '10 min',
    },
    {
      icon: Music,
      title: 'Listen to Music',
      description: 'Put on your favorite uplifting playlist',
      color: ['#F093FB', '#F5576C'],
      duration: '15 min',
    },
    {
      icon: BookOpen,
      title: 'Read Something',
      description: 'Read an inspiring article or book chapter',
      color: ['#FF6B6B', '#FF8E53'],
      duration: '15 min',
    },
  ];

  const helplines = [
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: '24/7 treatment referral and information',
    },
    {
      name: 'Crisis Text Line',
      phone: '741741',
      description: 'Text HOME to 741741 for crisis support',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Support</Text>
        <Text style={styles.headerSubtitle}>You're not alone. Help is here.</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.emergencyCard}>
          <Heart size={32} color="#E74C3C" />
          <Text style={styles.emergencyTitle}>Having a Craving?</Text>
          <Text style={styles.emergencyText}>
            This feeling will pass. You are stronger than this moment. Take a deep breath and
            remember why you started this journey.
          </Text>
        </View>

        {contacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Support Network</Text>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => handleCall(contact.phone)}>
                <View style={styles.contactIconContainer}>
                  <Phone size={24} color="#4ECDC4" />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.relationship && (
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  )}
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Helplines</Text>
          {helplines.map((helpline, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helplineCard}
              onPress={() => handleCall(helpline.phone)}>
              <View style={styles.helplineIconContainer}>
                <MessageCircle size={24} color="#FFFFFF" />
              </View>
              <View style={styles.helplineDetails}>
                <Text style={styles.helplineName}>{helpline.name}</Text>
                <Text style={styles.helplineDescription}>{helpline.description}</Text>
                <Text style={styles.helplinePhone}>{helpline.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distraction Activities</Text>
          <Text style={styles.sectionDescription}>
            Try one of these activities to overcome your craving
          </Text>

          {distractionActivities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <LinearGradient colors={activity.color as [string, string]} style={styles.activityGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <View style={styles.activityHeader}>
                  <activity.icon size={28} color="#FFFFFF" />
                  <Text style={styles.activityDuration}>{activity.duration}</Text>
                </View>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>Remember</Text>
          <Text style={styles.reminderText}>• This craving is temporary</Text>
          <Text style={styles.reminderText}>
            • You've overcome cravings before and you can do it again
          </Text>
          <Text style={styles.reminderText}>• Every moment you resist is a victory</Text>
          <Text style={styles.reminderText}>
            • Your future self will thank you for staying strong
          </Text>
          <Text style={styles.reminderText}>• You are worthy of a healthy, sober life</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  contactRelationship: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 4,
  },
  callText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  helplineCard: {
    backgroundColor: '#667EEA',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  helplineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helplineDetails: {
    flex: 1,
  },
  helplineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helplineDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  helplinePhone: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityGradient: {
    padding: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDuration: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  reminderText: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 28,
    marginBottom: 8,
  },
});
