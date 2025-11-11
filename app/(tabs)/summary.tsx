import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  catatan: string;
  tanggal: string;
}

export default function SummaryScreen() {
  const { user } = useAuth();
  const { db } = useDatabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    fetchData();
  }, [currentDate, db, user]);

  const fetchData = async () => {
    if (!db || !user) return;

    setLoading(true);

    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Fetch monthly summary
      const summaryResult = await db.getFirstAsync(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
        FROM records 
        WHERE user_id = ? 
        AND strftime('%m', tanggal) = ? 
        AND strftime('%Y', tanggal) = ?
      `, [user.id, month.toString().padStart(2, '0'), year.toString()]) as {
        income: number;
        expense: number;
      } | null;

      if (summaryResult) {
        setSummary({
          month,
          year,
          income: summaryResult.income,
          expense: summaryResult.expense,
          balance: summaryResult.income - summaryResult.expense,
        });
      }

      // Fetch transactions for the month
      const transactionsResult = await db.getAllAsync(`
        SELECT 
          r.id,
          r.amount,
          r.type,
          r.catatan,
          r.tanggal,
          c.nama as category
        FROM records r
        JOIN categories c ON r.category_id = c.id
        WHERE r.user_id = ?
        AND strftime('%m', r.tanggal) = ?
        AND strftime('%Y', r.tanggal) = ?
        ORDER BY r.tanggal DESC, r.created_at DESC
      `, [user.id, month.toString().padStart(2, '0'), year.toString()]) as Transaction[];

      setTransactions(transactionsResult || []);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const deleteTransaction = async (id: number) => {
    if (!db) return;

    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM records WHERE id = ?', [id]);
              fetchData(); // Refresh data
              Alert.alert('Berhasil', 'Transaksi berhasil dihapus');
            } catch (error) {
              console.error('Delete transaction error:', error);
              Alert.alert('Error', 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    });
  };

  const generatePDF = async () => {
    if (transactions.length === 0) {
      Alert.alert('Info', 'Tidak ada transaksi untuk dicetak.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Ringkasan Transaksi</h1>
          <p>Bulan: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</p>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Catatan</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${formatDate(transaction.tanggal)}</td>
                  <td>${transaction.catatan || '-'}</td>
                  <td>${formatCurrency(transaction.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { filePath } = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Ringkasan_Transaksi_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`,
        base64: false,
      });

      if (filePath) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        } else {
          Alert.alert('PDF berhasil dibuat', `File disimpan di: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Generate PDF error:', error);
      Alert.alert('Error', 'Gagal membuat PDF.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ringkasan Keuangan</Text>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color="#2E7D32" />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>

        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Total Pemasukan</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.income)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.expense)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.summaryLabel}>Sisa Saldo</Text>
            <Text style={[
              styles.summaryAmount,
              { color: summary.balance >= 0 ? '#2E7D32' : '#D32F2F' }
            ]}>
              {formatCurrency(summary.balance)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>
          Transaksi {monthNames[currentDate.getMonth()]}
        </Text>

        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'income' ? '#E8F5E8' : '#FFEBEE' }
                ]}>
                  <Ionicons
                    name={transaction.type === 'income' ? 'add' : 'remove'}
                    size={16}
                    color={transaction.type === 'income' ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.tanggal)}</Text>
                  {transaction.catatan && (
                    <Text style={styles.transactionNote}>{transaction.catatan}</Text>
                  )}
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTransaction(transaction.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Tidak ada transaksi di bulan ini
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.pdfButton}
        onPress={generatePDF}
      >
        <Ionicons name="document-text-outline" size={24} color="white" />
        <Text style={styles.pdfButtonText}>Cetak PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthButton: {
    padding: 5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCards: {
    paddingHorizontal: 20,
    gap: 15,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  balanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  pdfButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});