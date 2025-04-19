import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import VendorInformationForm from '../components/VendorInformationForm'
import { checkIfVendorProfileExists } from '../../lib/vendorProfileHelpers'

export default function VendorHomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState<boolean | null>(null)
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
    if (user && user.user_metadata?.user_type !== 'vendor') {
      router.replace('/(auth)/signin')
    }
  }, [user])

  useEffect(() => {
    const checkVendorProfile = async () => {
      if (user?.id) {
        try {
          const hasProfile = await checkIfVendorProfileExists(user.id)
          setShowForm(!hasProfile)
          setLoading(false)
        } catch (error) {
          console.error('Error checking vendor profile:', error)
          setLoading(false)
        }
      }
    }

    if (user) {
      checkVendorProfile()
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

  // If the user needs to complete the form, show it
  console.log("showForm", showForm);
  
  if (showForm) {
    return <VendorInformationForm />
  }
  else {
    router.replace('/(tabsVendor)/dashboard')
    return null
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#ff8c00',
    flexGrow: 1,
  },
  container: {
    // Removed flex: 1 to allow ScrollView to control height
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
    elevation: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff8c00',
  },
})
