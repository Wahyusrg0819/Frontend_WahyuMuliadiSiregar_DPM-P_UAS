import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { Text, Button, Card, IconButton, Dialog, TextInput, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05;
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06);

const FamilyScreen = () => {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://172.20.10.3:5000/api/family/my-family', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamily(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setFamily(null);
      } else {
        setError('Terjadi kesalahan saat mengambil data keluarga');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleCreateFamily = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://172.20.10.3:5000/api/family/create', 
        { name: familyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateDialogVisible(false);
      setFamilyName('');
      fetchFamilyData();
    } catch (error) {
      console.error('Error creating family:', error);
    }
  };

  const handleJoinFamily = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://172.20.10.3:5000/api/family/join', 
        { inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinDialogVisible(false);
      setInviteCode('');
      fetchFamilyData();
    } catch (error) {
      console.error('Error joining family:', error);
    }
  };

  const handleLeaveFamily = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://172.20.10.3:5000/api/family/leave', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFamilyData();
    } catch (error) {
      console.error('Error leaving family:', error);
    }
  };

  const handleCopyInviteCode = async () => {
    if (family?.inviteCode) {
      await Clipboard.setStringAsync(family.inviteCode);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeIconContainer}>
          <Ionicons name="people" size={48} color="#144272" />
        </View>
        <Text style={styles.welcomeTitle}>Selamat Datang di Keluarga</Text>
        <Text style={styles.welcomeSubtitle}>
          Bergabung dengan keluarga untuk mengelola keuangan bersama
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setCreateDialogVisible(true)}
            style={styles.createButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={({ size, color }) => (
              <Ionicons name="add-circle-outline" size={20} color={color} />
            )}
          >
            Buat Keluarga
          </Button>
          <Button
            mode="outlined"
            onPress={() => setJoinDialogVisible(true)}
            style={styles.joinButton}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: '#144272' }]}
            icon={({ size, color }) => (
              <Ionicons name="enter-outline" size={20} color="#144272" />
            )}
          >
            Gabung Keluarga
          </Button>
        </View>
      </View>
    </View>
  );

  const renderFamilyInfo = () => (
    <View style={styles.familyContainer}>
      <View style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <View style={styles.familyTitleContainer}>
            <Text style={styles.familyName}>{family?.name}</Text>
            <View style={styles.memberCount}>
              <Ionicons name="people" size={16} color="#64748B" />
              <Text style={styles.memberCountText}>
                {family?.members?.length || 0} Anggota
              </Text>
            </View>
          </View>
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCodeLabel}>Kode Undangan:</Text>
            <View style={styles.inviteCodeWrapper}>
              <Text style={styles.inviteCode}>{family?.inviteCode}</Text>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor="#144272"
                onPress={handleCopyInviteCode}
                style={styles.copyButton}
              />
            </View>
            {showCopiedMessage && (
              <Text style={styles.copiedMessage}>Kode berhasil disalin!</Text>
            )}
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Anggota Keluarga</Text>
          <View style={styles.membersList}>
            {family?.members?.map((member, index) => (
              <View key={`member-${member._id || index}`} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Ionicons name="person" size={24} color="#144272" />
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: member.role === 'owner' ? 'rgba(78, 205, 196, 0.1)' : 'rgba(108, 99, 255, 0.1)' }
                    ]}>
                      <Text style={[
                        styles.roleText,
                        { color: member.role === 'owner' ? '#4ECDC4' : '#6C63FF' }
                      ]}>
                        {member.role === 'owner' ? 'Pemilik' : 'Anggota'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleLeaveFamily}
          style={styles.leaveButton}
          contentStyle={styles.buttonContent}
          labelStyle={[styles.buttonLabel, { color: '#FF6B6B' }]}
          icon={({ size, color }) => (
            <Ionicons name="exit-outline" size={20} color="#FF6B6B" />
          )}
        >
          Keluar dari Keluarga
        </Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0A2647"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keluarga</Text>
          <IconButton
            icon="refresh"
            iconColor="white"
            size={24}
            onPress={fetchFamilyData}
            style={styles.refreshButton}
          />
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.centerContainer}>
              <Text>Memuat...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : family ? (
            renderFamilyInfo()
          ) : (
            renderWelcomeScreen()
          )}
        </ScrollView>

        <Portal>
          <Dialog
            visible={createDialogVisible}
            onDismiss={() => setCreateDialogVisible(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Buat Keluarga Baru</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nama Keluarga"
                value={familyName}
                onChangeText={setFamilyName}
                mode="outlined"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setCreateDialogVisible(false)}
                textColor="#64748B"
              >
                Batal
              </Button>
              <Button 
                onPress={handleCreateFamily}
                mode="contained"
                style={styles.dialogButton}
              >
                Buat
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog
            visible={joinDialogVisible}
            onDismiss={() => setJoinDialogVisible(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Gabung Keluarga</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Kode Undangan"
                value={inviteCode}
                onChangeText={setInviteCode}
                mode="outlined"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setJoinDialogVisible(false)}
                textColor="#64748B"
              >
                Batal
              </Button>
              <Button 
                onPress={handleJoinFamily}
                mode="contained"
                style={styles.dialogButton}
              >
                Gabung
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.8,
    paddingBottom: CARD_PADDING * 1.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A2647',
    borderBottomLeftRadius: CARD_BORDER_RADIUS,
    borderBottomRightRadius: CARD_BORDER_RADIUS,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  refreshButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Math.round(SCREEN_WIDTH * 0.035),
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CARD_PADDING,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  welcomeContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeIconContainer: {
    width: Math.round(SCREEN_WIDTH * 0.2),
    height: Math.round(SCREEN_WIDTH * 0.2),
    borderRadius: Math.round(SCREEN_WIDTH * 0.1),
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CARD_PADDING,
  },
  welcomeTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.05),
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: CARD_PADDING * 0.5,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    textAlign: 'center',
    marginBottom: CARD_PADDING * 1.5,
    paddingHorizontal: CARD_PADDING,
  },
  buttonContainer: {
    width: '100%',
    gap: CARD_PADDING,
  },
  createButton: {
    backgroundColor: '#144272',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  joinButton: {
    borderColor: '#144272',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  buttonContent: {
    paddingVertical: CARD_PADDING * 0.6,
  },
  buttonLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  familyContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
  },
  familyCard: {
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  familyHeader: {
    marginBottom: CARD_PADDING,
  },
  familyTitleContainer: {
    marginBottom: CARD_PADDING * 0.8,
  },
  familyName: {
    fontSize: Math.round(SCREEN_WIDTH * 0.05),
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: 4,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCountText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#64748B',
    fontWeight: '500',
  },
  inviteCodeContainer: {
    backgroundColor: '#F8FAFC',
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  inviteCodeLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#64748B',
    marginBottom: 4,
  },
  inviteCodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    fontWeight: '600',
    color: '#0A2647',
    letterSpacing: 1,
  },
  copyButton: {
    margin: 0,
  },
  copiedMessage: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#4ECDC4',
    marginTop: 4,
  },
  membersSection: {
    marginTop: CARD_PADDING,
  },
  sectionTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: CARD_PADDING,
  },
  membersList: {
    gap: CARD_PADDING * 0.8,
  },
  memberItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
    padding: CARD_PADDING,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARD_PADDING,
  },
  memberAvatar: {
    width: Math.round(SCREEN_WIDTH * 0.12),
    height: Math.round(SCREEN_WIDTH * 0.12),
    borderRadius: Math.round(SCREEN_WIDTH * 0.06),
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: Math.round(SCREEN_WIDTH * 0.038),
    fontWeight: '600',
    color: '#0A2647',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.028),
    fontWeight: '600',
  },
  leaveButton: {
    marginTop: CARD_PADDING * 1.5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  dialogTitle: {
    color: '#0A2647',
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'white',
    marginTop: CARD_PADDING * 0.5,
  },
  dialogButton: {
    backgroundColor: '#144272',
  },
});

export default FamilyScreen; 