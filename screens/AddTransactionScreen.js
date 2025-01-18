import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05;
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06);

const AddTransactionScreen = ({ navigation, route }) => {
  const { userData } = useAuth();
  const editingTransaction = route.params?.transaction;
  const [type, setType] = useState(editingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [category, setCategory] = useState(editingTransaction?.category || '');
  const [date, setDate] = useState(editingTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const categories = {
    income: ['Gaji', 'Bonus', 'Investasi', 'Lainnya'],
    expense: ['Makanan', 'Transport', 'Belanja', 'Pendidikan', 'Kesehatan', 'Hiburan', 'Lainnya']
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!amount || !description || !category || !date) {
        setError('Semua field harus diisi');
        return;
      }

      if (isNaN(amount) || parseFloat(amount) <= 0) {
        setError('Jumlah harus berupa angka lebih dari 0');
        return;
      }

      // Validasi format tanggal
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        setError('Format tanggal harus YYYY-MM-DD');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      const transactionData = {
        type,
        amount: parseFloat(amount),
        description,
        category,
        date,
        user: userData?._id
      };

      if (editingTransaction) {
        await axios.put(
          `http://172.20.10.3:5000/api/transactions/${editingTransaction._id}`,
          transactionData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://172.20.10.3:5000/api/transactions',
          transactionData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigation.goBack();
    } catch (err) {
      console.error('Error submitting transaction:', err.response?.data || err.message);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Data tidak valid');
      } else if (err.response?.status === 401) {
        setError('Sesi telah berakhir, silakan login kembali');
      } else if (err.response?.status === 403) {
        setError('Anda tidak memiliki izin untuk melakukan ini');
      } else {
        setError('Terjadi kesalahan, silakan coba lagi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (text) => {
    // Hanya izinkan angka dan tanda hubung
    const cleaned = text.replace(/[^0-9-]/g, '');
    
    // Format YYYY-MM-DD
    let formatted = cleaned;
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      formatted = cleaned + '-';
    } else if (cleaned.length === 7 && cleaned.split('-').length === 2) {
      formatted = cleaned + '-';
    }
    
    // Batasi panjang maksimal
    if (formatted.length <= 10) {
      setDate(formatted);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <IconButton
        icon="arrow-left"
        iconColor="white"
        size={24}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
      <Text style={styles.headerTitle}>
        {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[
          styles.typeOption,
          type === 'expense' && styles.typeOptionSelected,
          { backgroundColor: type === 'expense' ? 'rgba(255, 107, 107, 0.1)' : '#F8FAFC' }
        ]}
        onPress={() => setType('expense')}
      >
        <Ionicons
          name="trending-down"
          size={20}
          color={type === 'expense' ? '#FF6B6B' : '#64748B'}
        />
        <Text style={[
          styles.typeText,
          { color: type === 'expense' ? '#FF6B6B' : '#64748B' }
        ]}>
          Pengeluaran
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeOption,
          type === 'income' && styles.typeOptionSelected,
          { backgroundColor: type === 'income' ? 'rgba(78, 205, 196, 0.1)' : '#F8FAFC' }
        ]}
        onPress={() => setType('income')}
      >
        <Ionicons
          name="trending-up"
          size={20}
          color={type === 'income' ? '#4ECDC4' : '#64748B'}
        />
        <Text style={[
          styles.typeText,
          { color: type === 'income' ? '#4ECDC4' : '#64748B' }
        ]}>
          Pemasukan
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Jumlah</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          placeholder="Masukkan deskripsi"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kategori</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryDialog(true)}
        >
          <Text style={[styles.categoryText, !category && styles.placeholder]}>
            {category || 'Pilih kategori'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tanggal</Text>
        <TextInput
          value={date}
          onChangeText={handleDateChange}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        labelStyle={styles.submitButtonLabel}
      >
        {editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}
      </Button>
    </View>
  );

  const renderCategoryDialog = () => (
    showCategoryDialog && (
      <View style={styles.dialogOverlay}>
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Pilih Kategori</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowCategoryDialog(false)}
            />
          </View>
          <ScrollView style={styles.dialogContent}>
            {categories[type].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryOption}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryDialog(false);
                }}
              >
                <Ionicons
                  name={getTransactionIcon(cat)}
                  size={24}
                  color="#64748B"
                />
                <Text style={styles.categoryOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    )
  );

  const getTransactionIcon = (category) => {
    const icons = {
      'Gaji': 'cash',
      'Bonus': 'gift',
      'Investasi': 'trending-up',
      'Makanan': 'fast-food',
      'Transport': 'car',
      'Belanja': 'cart',
      'Pendidikan': 'school',
      'Kesehatan': 'medical',
      'Hiburan': 'game-controller',
      'Lainnya': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0A2647"
        barStyle="light-content"
      />
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.content}>
          {renderTypeSelector()}
          {renderForm()}
        </ScrollView>
        {renderCategoryDialog()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PADDING,
    paddingVertical: CARD_PADDING * 0.8,
    backgroundColor: '#0A2647',
  },
  headerTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    padding: CARD_PADDING,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: CARD_PADDING,
    marginBottom: CARD_PADDING * 1.5,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: CARD_PADDING * 0.8,
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    gap: 8,
  },
  typeOptionSelected: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    fontWeight: '600',
  },
  form: {
    gap: CARD_PADDING * 1.2,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#0A2647',
    fontWeight: '600',
    marginLeft: 4,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: CARD_PADDING * 0.8,
  },
  currencyPrefix: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    color: '#64748B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    paddingVertical: CARD_PADDING * 0.6,
    color: '#0A2647',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: CARD_PADDING * 0.8,
    paddingVertical: CARD_PADDING * 0.6,
  },
  categoryText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    color: '#0A2647',
  },
  placeholder: {
    color: '#94A3B8',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    textAlign: 'center',
  },
  submitButton: {
    marginTop: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    backgroundColor: '#0A2647',
  },
  submitButtonContent: {
    paddingVertical: CARD_PADDING * 0.4,
  },
  submitButtonLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    fontWeight: '600',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: CARD_PADDING,
  },
  dialog: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
    maxHeight: '80%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: CARD_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dialogTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: '600',
    color: '#0A2647',
  },
  dialogContent: {
    padding: CARD_PADDING,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING * 0.8,
    gap: CARD_PADDING * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryOptionText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    color: '#0A2647',
  },
});

export default AddTransactionScreen; 