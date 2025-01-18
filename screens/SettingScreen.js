import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Portal, 
  Dialog,
  IconButton,
  Surface,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05;
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06);

const SettingScreen = () => {
  const navigation = useNavigation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const { logout } = useAuth();
  const theme = useTheme();

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setError('Password baru tidak cocok');
        return;
      }

      if (newPassword.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }

      setLoading(true);
      setError('');

      const response = await axios.post('http://172.20.10.3:5000/api/auth/change-password', {
        oldPassword,
        newPassword
      });

      setShowChangePassword(false);
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode) {
      setError('Masukkan kode invite terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://172.20.10.3:5000/api/family/join', {
        inviteCode
      });
      setInviteCode('');
      // Tampilkan pesan sukses jika diperlukan
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal bergabung dengan keluarga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0A2647"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>Pengaturan</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.settingsContainer}>
            <Surface style={styles.settingsCard}>
              {/* Keluarga Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="people" size={24} color="#144272" />
                  <Text style={styles.sectionTitle}>Keluarga</Text>
                </View>
                <View style={styles.inviteContainer}>
                  <TextInput
                    label="Kode Invite Keluarga"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    mode="outlined"
                    style={styles.inviteInput}
                    placeholder="Masukkan kode invite"
                    autoCapitalize="characters"
                    outlineColor="#64748B"
                    activeOutlineColor="#144272"
                    right={
                      <TextInput.Icon 
                        icon="arrow-right"
                        onPress={handleJoinFamily}
                        disabled={loading}
                      />
                    }
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <Text style={styles.inviteHint}>
                    Masukkan kode invite untuk bergabung dengan keluarga
                  </Text>
                </View>
              </View>

              {/* Keamanan Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield" size={24} color="#144272" />
                  <Text style={styles.sectionTitle}>Keamanan</Text>
                </View>
                <Button 
                  mode="outlined"
                  onPress={() => setShowChangePassword(true)}
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                  icon={() => <Ionicons name="key-outline" size={20} color="#144272" />}
                >
                  Ubah Password
                </Button>
              </View>

              {/* Keluar Section */}
              <View style={[styles.section, styles.lastSection]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="log-out" size={24} color="#FF6B6B" />
                  <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>Keluar</Text>
                </View>
                <Button 
                  mode="outlined" 
                  onPress={logout}
                  style={[styles.actionButton, styles.logoutButton]}
                  contentStyle={styles.buttonContent}
                  icon={() => <Ionicons name="exit-outline" size={20} color="#FF6B6B" />}
                >
                  Keluar dari Aplikasi
                </Button>
              </View>
            </Surface>
          </View>
        </ScrollView>

        <Portal>
          <Dialog
            visible={showChangePassword}
            onDismiss={() => {
              setShowChangePassword(false);
              setError('');
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setShowPassword({ old: false, new: false, confirm: false });
            }}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Ubah Password</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Password Lama"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showPassword.old}
                mode="outlined"
                style={styles.input}
                outlineColor="#64748B"
                activeOutlineColor="#144272"
                right={
                  <TextInput.Icon 
                    icon={showPassword.old ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                  />
                }
              />
              <TextInput
                label="Password Baru"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword.new}
                mode="outlined"
                style={styles.input}
                outlineColor="#64748B"
                activeOutlineColor="#144272"
                right={
                  <TextInput.Icon 
                    icon={showPassword.new ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  />
                }
              />
              <TextInput
                label="Konfirmasi Password Baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword.confirm}
                mode="outlined"
                style={styles.input}
                outlineColor="#64748B"
                activeOutlineColor="#144272"
                right={
                  <TextInput.Icon 
                    icon={showPassword.confirm ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  />
                }
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => {
                  setShowChangePassword(false);
                  setError('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowPassword({ old: false, new: false, confirm: false });
                }}
                textColor="#64748B"
              >
                Batal
              </Button>
              <Button 
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                mode="contained"
                style={styles.dialogButton}
              >
                Simpan
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
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: CARD_PADDING,
  },
  settingsCard: {
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    padding: CARD_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_PADDING,
  },
  sectionTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: 'bold',
    color: '#144272',
    marginLeft: CARD_PADDING * 0.8,
  },
  actionButton: {
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  buttonContent: {
    paddingVertical: CARD_PADDING * 0.4,
  },
  logoutButton: {
    borderColor: '#FF6B6B',
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
    marginBottom: CARD_PADDING * 0.8,
  },
  error: {
    color: '#FF6B6B',
    marginTop: CARD_PADDING * 0.4,
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
  },
  dialogButton: {
    backgroundColor: '#144272',
  },
  inviteContainer: {
    marginBottom: CARD_PADDING * 0.8,
  },
  inviteInput: {
    backgroundColor: 'white',
    marginBottom: CARD_PADDING * 0.4,
  },
  inviteHint: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#64748B',
    marginTop: CARD_PADDING * 0.2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: CARD_PADDING * 0.2,
    marginLeft: -CARD_PADDING * 0.4,
  },
});

export default SettingScreen; 