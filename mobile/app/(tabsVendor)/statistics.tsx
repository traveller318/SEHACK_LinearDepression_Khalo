import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { MaterialIcons } from '@expo/vector-icons'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'

export default function VendorStatistics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dailySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    averageRating: 0,
    topSellingItems: [
      { name: 'Spicy Noodles', sales: 45 },
      { name: 'Fresh Juice', sales: 32 },
      { name: 'Steamed Dumplings', sales: 28 },
      { name: 'Grilled Sandwich', sales: 24 },
      { name: 'Butter Chicken', sales: 18 }
    ],
    weeklySalesData: [0, 0, 0, 0, 0, 0, 0]
  })

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      // This is a placeholder - in a real app you would implement actual statistics fetching
      // Example: fetch sales, ratings, customer data from your database
      
      // Mock data for demonstration
      setTimeout(() => {
        setStats({
          dailySales: 2450,
          weeklySales: 16780,
          monthlySales: 68540,
          totalCustomers: 412,
          averageRating: 4.7,
          topSellingItems: [
            { name: 'Spicy Noodles', sales: 45 },
            { name: 'Fresh Juice', sales: 32 },
            { name: 'Steamed Dumplings', sales: 28 },
            { name: 'Grilled Sandwich', sales: 24 },
            { name: 'Butter Chicken', sales: 18 }
          ],
          weeklySalesData: [3200, 4500, 3800, 5200, 4100, 6800, 5100]
        })
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    )
  }

  const screenWidth = Dimensions.get('window').width - 32;
  
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: stats.weeklySalesData,
        color: (opacity = 1) => `rgba(255, 140, 0, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Daily Sales (₹)']
  };
  
  const pieChartData = stats.topSellingItems.map((item, index) => {
    const colors = ['#FF9800', '#FF5722', '#FFC107', '#FFEB3B', '#CDDC39'];
    const shortenedName = item.name.length > 10 ? item.name.substring(0, 10) + '..' : item.name;
    return {
      name: shortenedName,
      sales: item.sales,
      color: colors[index],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    };
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Statistics</Text>
        <Text style={styles.subtitle}>Performance Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="attach-money" size={30} color="#ff8c00" />
          <Text style={styles.statValue}>₹{stats.dailySales}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="date-range" size={30} color="#ff8c00" />
          <Text style={styles.statValue}>₹{stats.weeklySales}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="calendar-today" size={30} color="#ff8c00" />
          <Text style={styles.statValue}>₹{stats.monthlySales}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={30} color="#ff8c00" />
          <Text style={styles.statValue}>{stats.totalCustomers}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <MaterialIcons name="timeline" size={24} color="#ff8c00" />
          <Text style={styles.chartTitle}>Weekly Sales Trend</Text>
        </View>
        <LineChart
          data={salesData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.ratingHeader}>
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={styles.ratingTitle}>Customer Rating</Text>
        </View>
        <View style={styles.ratingValue}>
          <Text style={styles.ratingNumber}>{stats.averageRating}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialIcons 
                key={star}
                name={star <= Math.floor(stats.averageRating) ? "star" : star <= stats.averageRating ? "star-half" : "star-border"} 
                size={20} 
                color="#FFD700" 
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <MaterialIcons name="pie-chart" size={24} color="#ff8c00" />
          <Text style={styles.chartTitle}>Sales Distribution</Text>
        </View>
        <PieChart
          data={pieChartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="sales"
          backgroundColor="transparent"
          paddingLeft="35"
          absolute
          style={styles.chart}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#ff8c00',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  ratingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
});
