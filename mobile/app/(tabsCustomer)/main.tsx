import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import CustomerPreferencesForm from '../components/CustomerPreferencesForm'
import { checkIfProfileExists } from '../../lib/customerProfileHelpers'

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [showPreferences, setShowPreferences] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

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
    if (user && user.user_metadata?.user_type !== 'customer') {
      router.replace('/(auth)/signin')
    }
  }, [user])

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user?.id) {
        try {
          const hasProfile = await checkIfProfileExists(user.id)
          setShowPreferences(!hasProfile) 
          setLoading(false)
        } catch (error) {
          console.error('Error checking profile:', error)
          setLoading(false)
        }
      }
    }

    if (user) {
      checkUserProfile()
    }
  }, [user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // If the user needs to complete preferences, show the form
  console.log("showPreferences", showPreferences);
  
  if (showPreferences) {
    return <CustomerPreferencesForm />
  }
  else{
    router.replace('/(tabsCustomer)/dashboard')
  }

  // Otherwise show the main home screen
  // return (
  //   <View style={styles.container}>
  //     <View style={styles.header}>
  //       <Text style={styles.title}>Welcome</Text>
  //       <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
  //         <Text style={styles.signOutText}>Sign Out</Text>
  //       </TouchableOpacity>
  //     </View>

  //     <View style={styles.userInfo}>
  //       <Text style={styles.label}>Email:</Text>
  //       <Text style={styles.value}>{user?.email}</Text>

  //       <Text style={styles.label}>Name:</Text>
  //       <Text style={styles.value}>{user?.user_metadata?.full_name || 'Not set'}</Text>
  //       <Text style={styles.label}>User Type:</Text>
  //       <Text style={styles.value}>{user?.user_metadata?.user_type || 'Not set'}</Text>
  //       <Text style={styles.label}>User ID:</Text>
  //       <Text style={styles.value}>{user?.id}</Text>
  //     </View>
  //   </View>
  // )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ff8c00',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff8c00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#ff8c00',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '500',
  },
})