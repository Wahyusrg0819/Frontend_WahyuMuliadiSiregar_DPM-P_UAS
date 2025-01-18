import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Platform, StatusBar, SafeAreaView } from 'react-native';
import { 
  Text, 
  Searchbar, 
  List, 
  Chip, 
  FAB,
  Portal,
  Dialog,
  Button,
  IconButton,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05;
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06);

const TransactionScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('http://172.20.10.3:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchQuery,
          type: selectedType !== 'all' ? selectedType : undefined
        }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, selectedType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`http://172.20.10.3:5000/api/transactions/${selectedTransaction._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteDialogVisible(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const renderItem = ({ item }) => {    
    return (
      <View style={styles.transactionItem}>
        {/* Icon Section */}
        <View style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'income' 
              ? 'rgba(78, 205, 196, 0.1)' 
              : 'rgba(255, 107, 107, 0.1)' 
          }
        ]}>
          <Ionicons
            name={getTransactionIcon(item.category)}
            size={24}
            color={item.type === 'income' ? '#4ECDC4' : '#FF6B6B'}
          />
        </View>

        {/* Content Section */}
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.description}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? '#4ECDC4' : '#FF6B6B' }
              ]}
            >
              {formatCurrency(item.amount)}
            </Text>
          </View>

          <View style={styles.transactionFooter}>
            <View style={styles.transactionMeta}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={12} color="#64748B" />
                <Text style={styles.transactionDate}>
                  {new Date(item.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={[
                styles.transactionBadge,
                { backgroundColor: item.type === 'income' 
                    ? 'rgba(78, 205, 196, 0.1)' 
                    : 'rgba(255, 107, 107, 0.1)' 
                }
              ]}>
                <Text style={[
                  styles.transactionType,
                  { color: item.type === 'income' ? '#4ECDC4' : '#FF6B6B' }
                ]}>
                  {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <View style={styles.categoryContainer}>
                <Ionicons
                  name={getTransactionIcon(item.category)}
                  size={12}
                  color="#64748B"
                />
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={styles.transactionMeta}>
                <View style={styles.createdByContainer}>
                  <Ionicons name="person-outline" size={12} color="#64748B" />
                  <Text style={styles.createdByText}>
                    {item.createdBy?.name || 'Unknown'}
                  </Text>
                </View>
                {item.createdBy?._id === userData?._id && (
                  <View style={styles.buttonContainer}>
                    <IconButton
                      icon={() => <Ionicons name="pencil" size={18} color="#6C63FF" />}
                      onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
                      style={styles.actionButton}
                    />
                    <IconButton
                      icon={() => <Ionicons name="trash" size={18} color="#FF6B6B" />}
                      onPress={() => {
                        setSelectedTransaction(item);
                        setDeleteDialogVisible(true);
                      }}
                      style={styles.actionButton}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaksi</Text>
          <IconButton
            icon="refresh"
            iconColor="white"
            size={24}
            onPress={fetchTransactions}
            style={styles.refreshButton}
          />
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Cari transaksi..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor="#64748B"
          />
        </View>

        <View style={styles.filterContainer}>
          <Chip
            selected={selectedType === 'all'}
            onPress={() => setSelectedType('all')}
            style={[styles.chip, selectedType === 'all' && styles.selectedChip]}
            textStyle={[styles.chipText, selectedType === 'all' && styles.selectedChipText]}
          >
            Semua
          </Chip>
          <Chip
            selected={selectedType === 'income'}
            onPress={() => setSelectedType('income')}
            style={[styles.chip, selectedType === 'income' && styles.selectedChip]}
            textStyle={[styles.chipText, selectedType === 'income' && styles.selectedChipText]}
          >
            Pemasukan
          </Chip>
          <Chip
            selected={selectedType === 'expense'}
            onPress={() => setSelectedType('expense')}
            style={[styles.chip, selectedType === 'expense' && styles.selectedChip]}
            textStyle={[styles.chipText, selectedType === 'expense' && styles.selectedChipText]}
          >
            Pengeluaran
          </Chip>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <Portal>
          <Dialog
            visible={deleteDialogVisible}
            onDismiss={() => setDeleteDialogVisible(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Hapus Transaksi</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Apakah Anda yakin ingin menghapus transaksi ini?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setDeleteDialogVisible(false)}
                textColor="#64748B"
              >
                Batal
              </Button>
              <Button 
                onPress={handleDelete}
                textColor="#FF6B6B"
                mode="contained"
                style={styles.deleteButton}
              >
                Hapus
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddTransaction')}
          color="white"
        />
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
  searchContainer: {
    marginTop: -CARD_PADDING,
    paddingHorizontal: CARD_PADDING,
    marginBottom: CARD_PADDING * 0.5,
  },
  searchbar: {
    elevation: 4,
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  searchInput: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#0A2647',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: CARD_PADDING,
    marginBottom: CARD_PADDING,
    gap: CARD_PADDING * 0.5,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: CARD_BORDER_RADIUS * 0.4,
  },
  selectedChip: {
    backgroundColor: '#0A2647',
  },
  chipText: {
    color: '#64748B',
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    fontWeight: '600',
  },
  selectedChipText: {
    color: 'white',
  },
  list: {
    padding: CARD_PADDING,
    paddingTop: 0,
    gap: CARD_PADDING * 0.8,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.5,
    padding: CARD_PADDING * 0.8,
    gap: CARD_PADDING * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIcon: {
    width: Math.round(SCREEN_WIDTH * 0.12),
    height: Math.round(SCREEN_WIDTH * 0.12),
    borderRadius: Math.round(SCREEN_WIDTH * 0.06),
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  transactionTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.038),
    color: '#0A2647',
    fontWeight: '600',
    flex: 1,
    marginRight: CARD_PADDING,
  },
  transactionAmount: {
    fontSize: Math.round(SCREEN_WIDTH * 0.038),
    fontWeight: '700',
  },
  transactionFooter: {
    gap: 8,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARD_PADDING * 0.6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDate: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    fontWeight: '500',
  },
  transactionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  transactionType: {
    fontSize: Math.round(SCREEN_WIDTH * 0.028),
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    margin: 0,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  fab: {
    position: 'absolute',
    right: CARD_PADDING,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#144272',
    borderRadius: 16,
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
  dialogText: {
    color: '#64748B',
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  createdByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createdByText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    fontWeight: '500',
  },
});

export default TransactionScreen; 