import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/finance-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Surface style={styles.surface}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="wallet" size={40} color="#2196F3" />
              </View>
            </View>
            
            <Text style={styles.title}>Pengelola Keuangan Keluarga</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon={() => <Ionicons name="mail" size={24} color="#666" />} />}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#2196F3' }}}
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon={() => <Ionicons name="lock-closed" size={24} color="#666" />} />}
                right={<TextInput.Icon 
                  icon={() => (
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#666"
                    />
                  )}
                  onPress={() => setShowPassword(!showPassword)}
                />}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { primary: '#2196F3' }}}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#F44336" />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              loading={loading}
              disabled={loading}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Masuk
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
            >
              Daftar Akun Baru
            </Button>
          </Surface>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  inputOutline: {
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  error: {
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  button: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#2196F3',
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  registerButton: {
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  registerButtonLabel: {
    color: '#2196F3',
    fontSize: 16,
  },
});

export default LoginScreen; 