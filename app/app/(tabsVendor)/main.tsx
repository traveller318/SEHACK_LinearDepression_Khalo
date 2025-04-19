import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function VendorHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace('/(auth)/signin')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  useEffect(() => {
    if (user && user.user_metadata?.user_type !== 'vendor') {
      router.replace('/(auth)/signin')
    }
  }, [user])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Vendor</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.user_metadata?.full_name || 'Not set'}</Text>

        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.user_metadata?.user_type || 'Not set'}</Text>

        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user?.id}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
})