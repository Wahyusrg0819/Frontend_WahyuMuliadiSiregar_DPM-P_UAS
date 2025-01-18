import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Animated, { 
  FadeInDown, 
  FadeOutDown,
  withTiming,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  // Animated values untuk opacity dan ukuran box
  const emailOpacity = useSharedValue(0);
  const passwordOpacity = useSharedValue(0);
  const confirmPasswordOpacity = useSharedValue(0);
  const boxProgress = useSharedValue(0);

  // Animated styles untuk input container
  const inputContainerStyle = useAnimatedStyle(() => {
    const baseHeight = 60; // Tinggi dasar input
    const spacing = 12; // Spacing antar input
    const padding = 8; // Padding container
    
    const totalHeight = interpolate(
      boxProgress.value,
      [0, 0.3, 0.6, 1],
      [
        baseHeight + (padding * 2), // Tinggi untuk 1 input
        (baseHeight * 2) + spacing + (padding * 2), // Tinggi untuk 2 input
        (baseHeight * 3) + (spacing * 2) + (padding * 2), // Tinggi untuk 3 input
        (baseHeight * 4) + (spacing * 3) + (padding * 2), // Tinggi untuk 4 input
      ]
    );

    return {
      height: totalHeight,
      transform: [
        {
          scale: interpolate(
            boxProgress.value,
            [0, 0.5, 1],
            [1, 1.02, 1]
          )
        }
      ]
    };
  });

  // Animated styles untuk input fields dengan slide up
  const emailStyle = useAnimatedStyle(() => ({
    opacity: emailOpacity.value,
    transform: [
      {
        translateY: interpolate(
          emailOpacity.value,
          [0, 1],
          [25, 0]
        )
      }
    ],
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    zIndex: 2
  }));

  const passwordStyle = useAnimatedStyle(() => ({
    opacity: passwordOpacity.value,
    transform: [
      {
        translateY: interpolate(
          passwordOpacity.value,
          [0, 1],
          [25, 0]
        )
      }
    ],
    position: 'absolute',
    top: 144,
    left: 0,
    right: 0,
    zIndex: 3
  }));

  const confirmPasswordStyle = useAnimatedStyle(() => ({
    opacity: confirmPasswordOpacity.value,
    transform: [
      {
        translateY: interpolate(
          confirmPasswordOpacity.value,
          [0, 1],
          [25, 0]
        )
      }
    ],
    position: 'absolute',
    top: 216,
    left: 0,
    right: 0,
    zIndex: 4
  }));

  // Effect untuk mengatur animasi berdasarkan input
  useEffect(() => {
    if (name.length > 0) {
      emailOpacity.value = withTiming(1, { duration: 500 });
      boxProgress.value = withSpring(0.3, { 
        damping: 12,
        stiffness: 100
      });
    } else {
      emailOpacity.value = withTiming(0, { duration: 300 });
      boxProgress.value = withSpring(0);
    }
  }, [name]);

  useEffect(() => {
    if (email.length > 0) {
      passwordOpacity.value = withTiming(1, { duration: 500 });
      boxProgress.value = withSpring(0.6, {
        damping: 12,
        stiffness: 100
      });
    } else {
      passwordOpacity.value = withTiming(0, { duration: 300 });
      boxProgress.value = withSpring(0.3);
    }
  }, [email]);

  useEffect(() => {
    if (password.length > 0) {
      confirmPasswordOpacity.value = withTiming(1, { duration: 500 });
      boxProgress.value = withSpring(1, {
        damping: 12,
        stiffness: 100
      });
    } else {
      confirmPasswordOpacity.value = withTiming(0, { duration: 300 });
      boxProgress.value = withSpring(0.6);
    }
  }, [password]);

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        setError('Password tidak cocok');
        return;
      }

      if (password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }

      setLoading(true);
      setError('');
      
      const result = await register(name, email, password);
      if (result.success) {
        navigation.replace('Login');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mendaftar');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Surface style={styles.surface}>
            <Animated.View 
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.iconContainer}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={40} color="#2196F3" />
              </View>
            </Animated.View>
            
            <Animated.Text 
              entering={FadeInDown.delay(400).duration(500)}
              style={styles.title}
            >
              Buat Akun Baru
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(600).duration(500)}
              style={styles.subtitle}
            >
              Daftar untuk mulai mengelola keuangan keluarga
            </Animated.Text>
            
            <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
              <View style={styles.inputWrapper}>
                <Animated.View 
                  entering={FadeInDown.delay(800).duration(500)}
                  style={{ zIndex: 1 }}
                >
                  <TextInput
                    label="Nama Lengkap"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon={() => <Ionicons name="person" size={24} color="#666" />} />}
                    outlineStyle={styles.inputOutline}
                    theme={{ colors: { primary: '#2196F3' }}}
                  />
                </Animated.View>

                <Animated.View style={emailStyle}>
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
                </Animated.View>
                
                <Animated.View style={passwordStyle}>
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
                </Animated.View>

                <Animated.View style={confirmPasswordStyle}>
                  <TextInput
                    label="Konfirmasi Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon={() => <Ionicons name="lock-closed" size={24} color="#666" />} />}
                    right={<TextInput.Icon 
                      icon={() => (
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={24} 
                          color="#666"
                        />
                      )}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />}
                    outlineStyle={styles.inputOutline}
                    theme={{ colors: { primary: '#2196F3' }}}
                  />
                </Animated.View>
              </View>
            </Animated.View>

            {error ? (
              <Animated.View 
                entering={FadeInDown}
                exiting={FadeOutDown}
                style={styles.errorContainer}
              >
                <Ionicons name="alert-circle" size={20} color="#F44336" />
                <Text style={styles.error}>{error}</Text>
              </Animated.View>
            ) : null}

            <Animated.View 
              entering={FadeInDown.delay(1000).duration(500)}
              style={{ width: '100%' }}
            >
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                loading={loading}
                disabled={loading}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                Daftar
              </Button>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(1200).duration(500)}
              style={styles.dividerContainer}
            >
              <View style={styles.divider} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.divider} />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(1400).duration(500)}
            >
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                labelStyle={styles.loginButtonLabel}
                icon={() => <Ionicons name="arrow-back" size={20} color="#2196F3" />}
              >
                Kembali ke Login
              </Button>
            </Animated.View>
          </Surface>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 16,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
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
    marginVertical: 16,
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 4,
  },
  inputWrapper: {
    position: 'relative',
    height: '100%',
  },
  input: {
    height: 60,
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
  loginButton: {
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  loginButtonLabel: {
    color: '#2196F3',
    fontSize: 16,
  },
});

export default RegisterScreen; 