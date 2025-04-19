import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { MaterialIcons } from '@expo/vector-icons'
import VendorInformationForm from '../components/VendorInformationForm'
import { checkIfVendorProfileExists } from '../../lib/vendorProfileHelpers'

export default function VendorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [vendorProfile, setVendorProfile] = useState<any>(null)
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

  // Check if user is a vendor
  useEffect(() => {
    if (user && user.user_metadata?.user_type !== 'vendor') {
      router.replace('/(auth)/signin')
    }
  }, [user])

  // Check if vendor profile exists
  useEffect(() => {
    const checkVendorProfile = async () => {
      if (user?.id) {
        try {
          const hasProfile = await checkIfVendorProfileExists(user.id)
          setShowForm(!hasProfile)
          if (hasProfile) {
            fetchVendorProfile()
          } else {
            setLoading(false)
          }
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

  // Fetch vendor profile data
  const fetchVendorProfile = async () => {
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error
        
        setVendorProfile(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching vendor profile:', error)
        setLoading(false)
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // If the user needs to complete the form, show it
  if (showForm) {
    return <VendorInformationForm />
  }

  // Show dashboard with vendor profile data
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {vendorProfile && (
        <>
          <View style={styles.profileHeader}>
            {vendorProfile.profile_image && (
              <Image 
                source={{ uri: vendorProfile.profile_image }} 
                style={styles.profileImage} 
              />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'Vendor'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="business" size={22} color="#ff8c00" />
              <Text style={styles.cardTitle}>Business Details</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                <Text style={styles.detailValue}>{vendorProfile.phone}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{vendorProfile.location}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="description" size={20} color="#666" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>GST Number</Text>
                <Text style={styles.detailValue}>{vendorProfile.gst_number}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="verified" size={22} color="#ff8c00" />
              <Text style={styles.cardTitle}>Certifications</Text>
            </View>
            <Text style={styles.certificationValue}>{vendorProfile.certification}</Text>
            
            {vendorProfile.certification_image && (
              <View style={styles.certImageContainer}>
                <Text style={styles.certImageLabel}>Certification Document</Text>
                <Image 
                  source={{ uri: vendorProfile.certification_image }} 
                  style={styles.certificationImage} 
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ff8c00',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  certificationValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  certImageContainer: {
    marginTop: 8,
  },
  certImageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  certificationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
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
});
