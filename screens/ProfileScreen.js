import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { Text, Avatar, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05;
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06);

const ProfileScreen = () => {
  const { userData } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://172.20.10.3:5000/api/family/my-family');
      setFamilyData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setFamilyData(null);
      } else {
        setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data keluarga');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderFamilyInfo = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#144272" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!familyData) {
      return (
        <View style={styles.infoContent}>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.pendingValue]}>
              Belum bergabung
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.infoContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={[styles.infoValue, styles.statusValue]}>
            {familyData.isOwner ? 'Pemilik' : 'Anggota'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Keluarga</Text>
          <Text style={styles.infoValue}>{familyData.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kode Invite</Text>
          <Text style={[styles.infoValue, styles.codeValue]}>{familyData.inviteCode}</Text>
        </View>
        <View style={[styles.infoRow, styles.lastInfoRow]}>
          <Text style={styles.infoLabel}>Jumlah Anggota</Text>
          <Text style={styles.infoValue}>{familyData.members?.length || 0} orang</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0A2647"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profil</Text>
            <IconButton
              icon="cog"
              iconColor="white"
              size={20}
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsButton}
            />
          </View>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={Math.round(SCREEN_WIDTH * 0.15)} 
                label={getInitials(userData?.name)} 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
                color="#0A2647"
                theme={{ colors: { primary: '#FFFFFF' }}}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userData?.name || 'User'}</Text>
              <Text style={styles.email}>{userData?.email || 'email@example.com'}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoHeader}>
                <Ionicons name="person-outline" size={24} color="#144272" />
                <Text style={styles.infoTitle}>Informasi Pribadi</Text>
              </View>
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nama</Text>
                  <Text style={styles.infoValue}>{userData?.name || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData?.email || '-'}</Text>
                </View>
                <View style={[styles.infoRow, styles.lastInfoRow]}>
                  <Text style={styles.infoLabel}>Bergabung Sejak</Text>
                  <Text style={styles.infoValue}>{formatDate(userData?.createdAt)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoHeader}>
                <Ionicons name="people-outline" size={24} color="#144272" />
                <Text style={styles.infoTitle}>Informasi Keluarga</Text>
              </View>
              {renderFamilyInfo()}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A2647',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0A2647',
    borderBottomLeftRadius: CARD_BORDER_RADIUS,
    borderBottomRightRadius: CARD_BORDER_RADIUS,
    paddingBottom: CARD_PADDING * 0.8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
    paddingBottom: CARD_PADDING * 0.4,
  },
  headerTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Math.round(SCREEN_WIDTH * 0.035),
  },
  content: {
    flex: 1,
    marginTop: CARD_PADDING * 1.2,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING * 1.2,
    paddingVertical: CARD_PADDING * 0.6,
  },
  avatarContainer: {
    marginRight: CARD_PADDING,
  },
  avatar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: Math.round(SCREEN_WIDTH * 0.042),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: CARD_PADDING * 0.15,
  },
  email: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoSection: {
    paddingHorizontal: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.5,
    paddingBottom: CARD_PADDING * 2,
  },
  infoItem: {
    marginBottom: CARD_PADDING * 1.5,
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
    paddingHorizontal: CARD_PADDING * 1.2,
    paddingVertical: CARD_PADDING,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_PADDING,
  },
  infoTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.042),
    fontWeight: 'bold',
    color: '#144272',
    marginLeft: CARD_PADDING * 0.8,
  },
  infoContent: {
    paddingLeft: CARD_PADDING * 1.2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: CARD_PADDING * 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#0A2647',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  statusValue: {
    color: '#144272',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: CARD_PADDING,
    alignItems: 'center',
  },
  errorContainer: {
    padding: CARD_PADDING,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    textAlign: 'center',
  },
  pendingValue: {
    color: '#64748B',
    fontStyle: 'italic',
  },
  codeValue: {
    color: '#FF6B6B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
});

export default ProfileScreen; 