import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Platform, Dimensions, Pressable } from 'react-native';
import { Text, Card, Button, FAB, List, useTheme, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Shadow } from 'react-native-shadow-2';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate,
  useSharedValue,
  withSequence,
  FadeIn,
  SlideInRight
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_PADDING = SCREEN_WIDTH * 0.05; // 5% dari lebar layar
const CARD_WIDTH = SCREEN_WIDTH - (CARD_PADDING * 2);
const CARD_BORDER_RADIUS = Math.round(SCREEN_WIDTH * 0.06); // 6% dari lebar layar

const DashboardScreen = ({ navigation }) => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0]
    }]
  });
  const [monthlyStats, setMonthlyStats] = useState({
    income: [],
    expense: [],
    months: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('6'); // dalam bulan
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const theme = useTheme();
  const { logout, userData } = useAuth();
  const dropdownAnimation = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);

  const periodOptions = [
    { label: '1 Bulan', value: '1' },
    { label: '3 Bulan', value: '3' },
    { label: '6 Bulan', value: '6' },
    { label: '12 Bulan', value: '12' },
  ];

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const [summaryRes, transactionsRes, monthlyStatsRes] = await Promise.all([
        axios.get('http://172.20.10.3:5000/api/transactions/family/summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://172.20.10.3:5000/api/transactions/family/recent', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://172.20.10.3:5000/api/transactions/family/monthly-stats?months=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data);
      setRecentTransactions(transactionsRes.data);
      setMonthlyStats(monthlyStatsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
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

  const pieChartData = [
    {
      name: 'Pemasukan',
      population: summary.totalIncome,
      color: '#4ECDC4',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Pengeluaran',
      population: summary.totalExpense,
      color: '#FF6B6B',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  const validateChartData = (data) => {
    if (!data || !Array.isArray(data)) return [0];
    const validData = data.map(value => {
      if (!isFinite(value) || isNaN(value) || value === null || value === undefined) {
        return 0;
      }
      return Math.max(0, Number(value));
    });
    return validData.length > 0 ? validData : [0];
  };

  const getChartData = () => {
    const defaultData = {
      labels: ['Jan'],
      datasets: [
        {
          data: [0],
          color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: [0],
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };

    if (!monthlyStats.months || !monthlyStats.income || !monthlyStats.expense) {
      return defaultData;
    }

    const validIncome = validateChartData(monthlyStats.income);
    const validExpense = validateChartData(monthlyStats.expense);
    const validMonths = monthlyStats.months.slice(0, Math.min(validIncome.length, validExpense.length));

    if (validMonths.length === 0) {
      return defaultData;
    }

    return {
      labels: validMonths,
      datasets: [
        {
          data: validIncome.slice(0, validMonths.length),
          color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: validExpense.slice(0, validMonths.length),
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const togglePeriodPicker = () => {
    const isOpen = dropdownAnimation.value === 0;
    dropdownAnimation.value = withSpring(isOpen ? 1 : 0, {
      damping: 15,
      stiffness: 150
    });
    rotateAnimation.value = withSpring(isOpen ? 1 : 0, {
      damping: 15,
      stiffness: 150
    });
  };

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      opacity: dropdownAnimation.value,
      transform: [
        {
          translateY: interpolate(
            dropdownAnimation.value,
            [0, 1],
            [-20, 0],
            Extrapolate.CLAMP
          )
        },
        {
          scale: interpolate(
            dropdownAnimation.value,
            [0, 1],
            [0.9, 1],
            Extrapolate.CLAMP
          )
        }
      ],
      height: interpolate(
        dropdownAnimation.value,
        [0, 1],
        [0, 180],
        Extrapolate.CLAMP
      )
    };
  });

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(
            rotateAnimation.value,
            [0, 1],
            [0, 180]
          )}deg`
        }
      ]
    };
  });

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <Pressable 
        onPress={togglePeriodPicker}
        style={styles.periodButton}
      >
        <Text style={styles.periodButtonText}>{selectedPeriod} Bulan</Text>
        <Animated.View style={rotateStyle}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color="#144272" 
          />
        </Animated.View>
      </Pressable>
    </View>
  );

  const renderPeriodPicker = () => (
    <Animated.View style={[styles.periodPickerContainer, dropdownStyle]}>
      {periodOptions.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => {
            setSelectedPeriod(option.value);
            togglePeriodPicker();
          }}
          style={[
            styles.periodOption,
            selectedPeriod === option.value && styles.periodOptionSelected
          ]}
        >
          <Text
            style={[
              styles.periodOptionText,
              selectedPeriod === option.value && styles.periodOptionTextSelected
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );

  const renderFinancialOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.shadowContainer}>
        <View style={styles.cardWrapper}>
          <Card style={styles.overviewCard}>
            <Card.Content style={styles.overviewContent}>
              <View style={styles.overviewHeader}>
                <View>
                  <Text style={styles.overviewTitle}>Ringkasan Keuangan</Text>
                  <Text style={styles.overviewSubtitle}>30 Hari Terakhir</Text>
                </View>
                <IconButton
                  icon="calendar"
                  size={24}
                  iconColor="#144272"
                  style={styles.calendarButton}
                  onPress={() => {/* Handle calendar */}}
                />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statsItem}>
                  <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                    <Ionicons name="trending-up" size={24} color="#4ECDC4" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Total Pemasukan</Text>
                    <Text style={[styles.statsValue, { color: '#4ECDC4' }]}>
                      {formatCurrency(summary.totalIncome)}
                    </Text>
                    <Text style={styles.statsChange}>+{((summary.totalIncome / (summary.totalIncome + summary.totalExpense)) * 100).toFixed(1)}%</Text>
                  </View>
                </View>

                <View style={styles.statsItem}>
                  <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                    <Ionicons name="trending-down" size={24} color="#FF6B6B" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Total Pengeluaran</Text>
                    <Text style={[styles.statsValue, { color: '#FF6B6B' }]}>
                      {formatCurrency(summary.totalExpense)}
                    </Text>
                    <Text style={styles.statsChange}>-{((summary.totalExpense / (summary.totalIncome + summary.totalExpense)) * 100).toFixed(1)}%</Text>
                  </View>
                </View>

                <View style={styles.statsItem}>
                  <View style={[styles.statsIconContainer, { backgroundColor: 'rgba(108, 99, 255, 0.1)' }]}>
                    <Ionicons name="wallet" size={24} color="#6C63FF" />
                  </View>
                  <View>
                    <Text style={styles.statsLabel}>Saldo Saat Ini</Text>
                    <Text style={[styles.statsValue, { color: '#6C63FF' }]}>
                      {formatCurrency(summary.balance)}
                    </Text>
                    <Text style={styles.statsChange}>Total Keseluruhan</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartContent}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Statistik Keuangan </Text>
          {renderPeriodSelector()}
        </View>

        {renderPeriodPicker()}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContainer}
        >
          <View style={styles.chartWrapper}>
            <LineChart
              data={getChartData()}
              width={SCREEN_WIDTH * 1.2}
              height={220}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                style: {
                  borderRadius: CARD_BORDER_RADIUS * 0.5
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#fafafa"
                },
                propsForLabels: {
                  fontSize: Math.round(SCREEN_WIDTH * 0.032),
                  fontWeight: '500'
                },
                formatYLabel: (value) => {
                  const val = Math.abs(Number(value));
                  if (val >= 1000000) {
                    return `${(val / 1000000).toFixed(1)}M`;
                  }
                  if (val >= 1000) {
                    return `${(val / 1000).toFixed(0)}K`;
                  }
                  return val.toString();
                }
              }}
              bezier
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              segments={5}
              fromZero={true}
              style={{
                marginRight: CARD_PADDING,
                borderRadius: CARD_BORDER_RADIUS * 0.5,
                paddingRight: 0
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.statsSection}>
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
                <Text style={styles.legendText}>Pemasukan</Text>
              </View>
              <Text style={[styles.legendValue, { color: '#4ECDC4' }]}>
                {formatCurrency(monthlyStats.income.reduce((a, b) => a + b, 0))}
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>Pengeluaran</Text>
              </View>
              <Text style={[styles.legendValue, { color: '#FF6B6B' }]}>
                {formatCurrency(monthlyStats.expense.reduce((a, b) => a + b, 0))}
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="trending-up" size={16} color="#4ECDC4" />
                <Text style={styles.metricLabel}>Rata-rata Pemasukan</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#4ECDC4' }]}>
                {formatCurrency(monthlyStats.income.reduce((a, b) => a + b, 0) / monthlyStats.income.length || 0)}
              </Text>
              <Text style={styles.metricPeriod}>per bulan</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Ionicons name="trending-down" size={16} color="#FF6B6B" />
                <Text style={styles.metricLabel}>Rata-rata Pengeluaran</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#FF6B6B' }]}>
                {formatCurrency(monthlyStats.expense.reduce((a, b) => a + b, 0) / monthlyStats.expense.length || 0)}
              </Text>
              <Text style={styles.metricPeriod}>per bulan</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTransactionItem = (transaction, index) => {
    const AnimatedListItem = Animated.createAnimatedComponent(View);
    
    return (
      <AnimatedListItem
        key={transaction._id}
        entering={FadeIn.delay(index * 100).springify()}
        style={styles.transactionItem}
      >
        {/* Icon Section */}
        <View style={[
          styles.transactionIcon,
          { backgroundColor: transaction.type === 'income' 
              ? 'rgba(78, 205, 196, 0.1)' 
              : 'rgba(255, 107, 107, 0.1)' 
          }
        ]}>
          <Ionicons
            name={getTransactionIcon(transaction.category)}
            size={24}
            color={transaction.type === 'income' ? '#4ECDC4' : '#FF6B6B'}
          />
        </View>

        {/* Content Section */}
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#4ECDC4' : '#FF6B6B' }
              ]}
            >
              {formatCurrency(transaction.amount)}
            </Text>
          </View>

          <View style={styles.transactionFooter}>
            <View style={styles.transactionMeta}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={12} color="#64748B" />
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
              </View>
              <View style={[
                styles.transactionBadge,
                { backgroundColor: transaction.type === 'income' 
                    ? 'rgba(78, 205, 196, 0.1)' 
                    : 'rgba(255, 107, 107, 0.1)' 
                }
              ]}>
                <Text style={[
                  styles.transactionType,
                  { color: transaction.type === 'income' ? '#4ECDC4' : '#FF6B6B' }
                ]}>
                  {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.categoryContainer}>
                <Ionicons
                  name={getTransactionIcon(transaction.category)}
                  size={12}
                  color="#64748B"
                />
                <Text style={styles.categoryText}>{transaction.category}</Text>
              </View>
              <View style={styles.createdByContainer}>
                <Ionicons name="person-outline" size={12} color="#64748B" />
                <Text style={styles.createdByText}>
                  {transaction.createdBy?.name || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedListItem>
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
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Selamat datang,
            </Text>
            <Text style={styles.nameText}>
              Keluarga {userData?.familyName || userData?.name}
            </Text>
          </View>
          <IconButton
            icon="refresh"
            iconColor="white"
            size={24}
            onPress={fetchData}
            style={styles.refreshButton}
          />
        </View>

        <ScrollView style={styles.scrollView}>
          {renderFinancialOverview()}
          {renderStatistics()}
          
          <View style={[styles.transactionsContainer]}>
            <View style={styles.shadowContainer}>
              <View style={styles.cardWrapper}>
                <Card style={styles.transactionsCard}>
                  <View style={styles.transactionsHeader}>
                    <View>
                      <Text style={styles.transactionsTitle}>Transaksi Terbaru</Text>
                      <Text style={styles.transactionsSubtitle}>5 transaksi terakhir</Text>
                    </View>
                    <Button 
                      onPress={() => navigation.navigate('Transactions')}
                      mode="text"
                      textColor="#6C63FF"
                      style={styles.viewAllButton}
                    >
                      Lihat Semua
                    </Button>
                  </View>
                  <Card.Content style={styles.transactionsContent}>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction, index) => 
                        renderTransactionItem(transaction, index)
                      )
                    ) : (
                      <View style={styles.emptyTransactions}>
                        <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
                        <Text style={styles.emptyText}>Belum ada transaksi</Text>
                        <Text style={styles.emptySubtext}>Mulai catat transaksi keuangan Anda</Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </View>
            </View>
          </View>
        </ScrollView>

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
    borderBottomLeftRadius: CARD_BORDER_RADIUS,
    borderBottomRightRadius: CARD_BORDER_RADIUS,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  welcomeContainer: {
    flex: 1,
    paddingRight: CARD_PADDING,
  },
  welcomeText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  nameText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.06),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  refreshButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Math.round(SCREEN_WIDTH * 0.035),
    width: Math.round(SCREEN_WIDTH * 0.11),
    height: Math.round(SCREEN_WIDTH * 0.11),
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
  },
  balanceCard: {
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#144272',
    width: CARD_WIDTH,
  },
  balanceCardContent: {
    padding: CARD_PADDING,
    paddingVertical: CARD_PADDING * 1.4,
  },
  cardTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    marginBottom: CARD_PADDING * 0.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  balanceText: {
    color: 'white',
    fontSize: Math.round(SCREEN_WIDTH * 0.09),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: CARD_PADDING * 1.2,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: CARD_PADDING * 0.5,
    gap: CARD_PADDING * 1.4,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: CARD_PADDING * 0.7,
  },
  balanceIconContainer: {
    width: Math.round(SCREEN_WIDTH * 0.09),
    height: Math.round(SCREEN_WIDTH * 0.09),
    borderRadius: Math.round(SCREEN_WIDTH * 0.045),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    fontWeight: '600',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  balancePercentage: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  chartContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
  },
  chartContent: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CARD_PADDING * 0.8,
  },
  chartTitle: {
    color: '#0A2647',
    fontWeight: '700',
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    letterSpacing: 0.3,
  },
  periodSelector: {
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    overflow: 'hidden',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING * 0.8,
    paddingVertical: CARD_PADDING * 0.4,
    gap: 8,
  },
  periodButtonText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#144272',
    fontWeight: '600',
  },
  periodPickerContainer: {
    position: 'absolute',
    top: CARD_PADDING * 3,
    right: CARD_PADDING,
    backgroundColor: 'white',
    borderRadius: CARD_BORDER_RADIUS * 0.4,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodOption: {
    paddingVertical: CARD_PADDING * 0.6,
    paddingHorizontal: CARD_PADDING * 0.8,
    backgroundColor: 'transparent',
    minWidth: Math.round(SCREEN_WIDTH * 0.25),
  },
  periodOptionSelected: {
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
  },
  periodOptionText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    fontWeight: '500',
  },
  periodOptionTextSelected: {
    color: '#144272',
    fontWeight: '600',
  },
  chartScrollContainer: {
    paddingVertical: CARD_PADDING * 0.5,
  },
  chartWrapper: {
    marginVertical: CARD_PADDING * 0.4,
  },
  statsSection: {
    marginTop: CARD_PADDING,
  },
  legendContainer: {
    backgroundColor: '#F8FAFC',
    padding: CARD_PADDING * 0.8,
    borderRadius: CARD_BORDER_RADIUS * 0.5,
    marginBottom: CARD_PADDING,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#64748B',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: Math.round(SCREEN_WIDTH * 0.034),
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: CARD_PADDING,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS * 0.5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: Math.round(SCREEN_WIDTH * 0.038),
    fontWeight: '700',
    marginVertical: 2,
  },
  metricPeriod: {
    fontSize: Math.round(SCREEN_WIDTH * 0.028),
    color: '#94A3B8',
    fontWeight: '500',
  },
  transactionsContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
    marginBottom: CARD_PADDING * 4.4,
  },
  transactionsCard: {
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: 'white',
    width: CARD_WIDTH,
    elevation: 0,
    margin: 0,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingTop: CARD_PADDING,
    paddingBottom: CARD_PADDING * 0.5,
  },
  transactionsTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.042),
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: 2,
  },
  transactionsSubtitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#64748B',
    fontWeight: '500',
  },
  viewAllButton: {
    marginRight: -8,
  },
  transactionsContent: {
    padding: 0,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  transactionDate: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    letterSpacing: 0.2,
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
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: CARD_PADDING * 2,
  },
  emptyText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    fontWeight: '600',
    marginTop: CARD_PADDING * 0.5,
  },
  emptySubtext: {
    fontSize: Math.round(SCREEN_WIDTH * 0.032),
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: CARD_PADDING * 0.8,
    paddingHorizontal: CARD_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: CARD_PADDING * 0.8,
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
    gap: 6,
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
  fab: {
    position: 'absolute',
    right: CARD_PADDING,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#144272',
    borderRadius: 16,
  },
  overviewContainer: {
    padding: CARD_PADDING,
    paddingTop: CARD_PADDING * 0.6,
  },
  overviewCard: {
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: 'white',
    width: CARD_WIDTH,
    elevation: 0,
    margin: 0,
  },
  overviewContent: {
    padding: CARD_PADDING,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CARD_PADDING,
  },
  overviewTitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: '700',
    color: '#0A2647',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    fontWeight: '500',
  },
  calendarButton: {
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
    borderRadius: Math.round(SCREEN_WIDTH * 0.03),
  },
  statsGrid: {
    gap: CARD_PADDING,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARD_PADDING,
    padding: CARD_PADDING,
    backgroundColor: '#F8FAFC',
    borderRadius: CARD_BORDER_RADIUS * 0.7,
  },
  statsIconContainer: {
    width: Math.round(SCREEN_WIDTH * 0.12),
    height: Math.round(SCREEN_WIDTH * 0.12),
    borderRadius: Math.round(SCREEN_WIDTH * 0.06),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    fontWeight: '700',
    marginBottom: 2,
  },
  statsChange: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: '#64748B',
    fontWeight: '500',
  },
  shadowContainer: {
    backgroundColor: 'transparent',
    borderRadius: CARD_BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardWrapper: {
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
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

export default DashboardScreen; 