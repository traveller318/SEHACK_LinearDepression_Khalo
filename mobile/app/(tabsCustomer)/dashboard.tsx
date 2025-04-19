import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardScreen() {
  const { user } = useAuth()
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to your Dashboard</Text>
        <Text style={styles.subtitle}>Your preferences have been saved!</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What's Next?</Text>
        <Text style={styles.cardText}>
          You can now explore restaurants and dishes that match your preferences.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ff8c00',
  },
  header: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  }
})
