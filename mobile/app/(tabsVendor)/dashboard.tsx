import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  Linking,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'
import VendorInformationForm from '../components/VendorInformationForm'
import { checkIfVendorProfileExists } from '../../lib/vendorProfileHelpers'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'

const { width } = Dimensions.get('window')

interface StallImage {
  id: string
  stall_id: string
  user_id: string
  image_url: string
  uploaded_at: string
}

interface Stall {
  id: string
  vendor_id: string
  name: string
  cuisine: string
  hygiene_score: number
  is_verified: boolean
  created_at: string
  location: string
  image_url?: string
  images: StallImage[]
}

export default function VendorDashboard() {
  const [hygieneReportData, setHygieneReportData] = useState<{
    cleanliness_rating: number
    good_practices: string[]
    issues_found: string[]
    recommendations: string[]
    overall_summary: string
  } | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null)

  const { user } = useAuth()
  const router = useRouter()
  const [vendorProfile, setVendorProfile] = useState<any>(null)
  const [showForm, setShowForm] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stalls, setStalls] = useState<Stall[]>([])
  const [stallModalVisible, setStallModalVisible] = useState(false)

  // New stall form fields
  const [stallName, setStallName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [stallLocation, setStallLocation] = useState<{
    latitude: number
    longitude: number
    address: string
  } | null>(null)
  const [stallImages, setStallImages] = useState<
    {
      uri: string
      fileName: string
    }[]
  >([])
  const [formLoading, setFormLoading] = useState(false)

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
        fetchVendorStalls()
      } catch (error) {
        console.error('Error fetching vendor profile:', error)
        setLoading(false)
      }
    }
  }

  // Fetch vendor stalls
  const fetchVendorStalls = async () => {
    if (user?.id) {
      try {
        setLoading(true)
        console.log('Fetching stalls for vendor ID:', user.id)
        console.log(user.id)

        // Direct Supabase query instead of using getVendorStalls
        const { data: stallsData, error } = await supabase
          .from('stalls')
          .select('*, images(*)')
          .eq('vendor_id', user.id)

        if (error) {
          console.error('Supabase error fetching stalls:', error)
          throw error
        }

        console.log(stallsData)
        setStalls(stallsData || [])
      } catch (error) {
        console.error('Error fetching stalls:', error)
        Alert.alert('Error', 'Failed to load your stalls. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'We need location permission to add your stall. Please enable location in your device settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        )
        return
      }

      // Show loading feedback
      setFormLoading(true)

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      // Reverse geocode to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      let address = 'Unknown location'
      if (addressResponse && addressResponse.length > 0) {
        const addressObj = addressResponse[0]
        address = [
          addressObj.name,
          addressObj.street,
          addressObj.city,
          addressObj.region,
          addressObj.country,
        ]
          .filter(Boolean)
          .join(', ')
      }

      console.log('Current location detected:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address,
      })

      setStallLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      })
    } catch (error: any) {
      console.error('Error getting location:', error)
      Alert.alert(
        'Location Error',
        'Failed to get your current location. Please make sure your GPS is enabled.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Try Again',
            onPress: getCurrentLocation,
          },
        ]
      )
    } finally {
      setFormLoading(false)
    }
  }

  // Pick an image from gallery
  const pickStallImage = async () => {
    if (stallImages.length >= 5) {
      Alert.alert('Maximum images', 'You can only upload 5 images per stall')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]

        setStallImages([
          ...stallImages,
          {
            uri: asset.uri,
            fileName: `image_${stallImages.length + 1}`,
          },
        ])
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  // Remove an image from selection
  const removeImage = (index: number) => {
    setStallImages(stallImages.filter((_, i) => i !== index))
  }

  // Handle stall creation
  const createStall = async () => {
    if (!user?.id) return

    // Validate form
    if (!stallName.trim()) {
      Alert.alert('Error', 'Please enter a stall name')
      return
    }

    if (!cuisine.trim()) {
      Alert.alert('Error', 'Please enter a cuisine type')
      return
    }

    if (!stallLocation) {
      Alert.alert('Error', 'Please set your stall location')
      return
    }

    if (stallImages.length === 0) {
      Alert.alert('Error', 'Please add at least one image for your stall')
      return
    }

    setFormLoading(true)

    try {
      console.log('Creating stall with data:', {
        vendor_id: user.id,
        name: stallName,
        location: `POINT(${stallLocation.longitude} ${stallLocation.latitude})`,
        cuisine,
      })

      // Get cleanliness report from Flask API
      let hygieneScore = 0
      try {
        // Assuming user.phone is available in the user object, otherwise you'll need to fetch it
        const phoneNumber = user.user_metadata?.phone || '+919326445840' // Use fallback if not available

        console.log('Fetching hygiene report for phone:', phoneNumber)
        const response = await fetch(
          `https://cce4-103-124-122-210.ngrok-free.app/generate_report?vendor_number=+919326445840`
        )

        if (response.ok) {
          const reportData = await response.json()
          console.log('Received hygiene report:', reportData)

          // Extract cleanliness rating from the response
          hygieneScore = reportData.cleanliness_rating || 0

          // You can save other report data if needed
          const goodPractices = reportData.good_practices || []
          const issuesFound = reportData.issues_found || []
          const recommendations = reportData.recommendations || []
          const overallSummary = reportData.overall_summary || ''

          console.log(`Hygiene score from report: ${hygieneScore}`)
        } else {
          console.error(
            'Failed to fetch hygiene report:',
            response.status,
            response.statusText
          )
        }
      } catch (reportError) {
        console.error('Error fetching hygiene report:', reportError)
        // Continue with stall creation even if report fetch fails
      }

      // Create stall with Supabase - now including hygiene_score
      const { data: stallData, error: stallError } = await supabase
        .from('stalls')
        .insert({
          vendor_id: user.id,
          name: stallName,
          cuisine,
          location: `POINT(${stallLocation.longitude} ${stallLocation.latitude})`, // PostgreSQL geography format
          // Use the first image as the main stall image
          image_url: stallImages.length > 0 ? stallImages[0].uri : null,
          // Add hygiene score from the report
          hygiene_score: hygieneScore,
        })
        .select()

      if (stallError) {
        console.error('Error inserting stall:', stallError)
        throw new Error(`Failed to create stall: ${stallError.message}`)
      }

      console.log('Stall created successfully:', stallData)

      if (!stallData || stallData.length === 0) {
        throw new Error('Stall was created but no data was returned')
      }

      const stallId = stallData[0].id

      // Create additional image records if needed (for images 2-5)
      if (stallImages.length > 1) {
        console.log(
          `Adding ${
            stallImages.length - 1
          } additional images for stall ${stallId}`
        )

        const imagePromises = stallImages.slice(1).map(async (image, index) => {
          console.log(
            `Processing additional image ${index + 2}:`,
            image.uri.substring(0, 50) + '...'
          )

          // Insert image record
          const { data: imageData, error: imageError } = await supabase
            .from('images')
            .insert({
              stall_id: stallId,
              user_id: user.id,
              image_url: image.uri,
            })
            .select()

          if (imageError) {
            console.error(`Error creating image ${index + 2}:`, imageError)
            throw new Error(`Failed to create image: ${imageError.message}`)
          }

          console.log(`Image ${index + 2} created:`, imageData)
          return imageData
        })

        await Promise.all(imagePromises)
        console.log('All additional images processed successfully')
      }

      // Reset form and close modal
      setStallName('')
      setCuisine('')
      setStallLocation(null)
      setStallImages([])
      setStallModalVisible(false)

      // Refresh stalls
      fetchVendorStalls()

      Alert.alert('Success', 'Stall created successfully!')
    } catch (error: any) {
      console.error('Error creating stall:', error)
      Alert.alert('Error', `Failed to create stall: ${error.message}`)
    } finally {
      setFormLoading(false)
    }
  }

  // Toggle stall modal visibility
  const toggleStallModal = async (visible: boolean) => {
    setStallModalVisible(visible)

    // When opening the modal, get the current location automatically
    if (visible) {
      // Reset form fields
      setStallName('')
      setCuisine('')
      setStallImages([])

      // Get location automatically
      try {
        await getCurrentLocation()
      } catch (error) {
        console.error('Error getting initial location:', error)
      }
    }
  }

  // Stall card component
  const renderStallCard = ({ item }: { item: Stall }) => {
    // Use image_url if available, or first image from images array, or a placeholder
    const imageUrl = item.image_url
      ? item.image_url
      : item.images && item.images.length > 0
      ? item.images[0].image_url
      : 'https://via.placeholder.com/300x200?text=No+Image'

    const hygieneScore = item.hygiene_score || 0
    const isVerified = item.is_verified || false

    return (
      <TouchableOpacity
        style={styles.stallCard}
        onPress={() => router.push(`/stalls/${item.id}`)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.stallImage}
          resizeMode="cover"
        />
        <View style={styles.stallContent}>
          <View style={styles.stallHeader}>
            <Text style={styles.stallName}>{item.name}</Text>
            {isVerified && (
              <MaterialIcons name="verified" size={18} color="#4CAF50" />
            )}
          </View>
          <Text style={styles.stallCuisine}>{item.cuisine}</Text>
          <View style={styles.stallFooter}>
            <View style={styles.hygieneContainer}>
              <MaterialIcons
                name="cleaning-services"
                size={16}
                color="#4CAF50"
              />
              <Text style={styles.hygieneText}>{hygieneScore}/5</Text>
            </View>
            <Text style={styles.createdDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Render stall modal
  const renderStallModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={stallModalVisible}
      onRequestClose={() => setStallModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Stall</Text>
            <TouchableOpacity onPress={() => setStallModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Stall Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter stall name"
                value={stallName}
                onChangeText={setStallName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cuisine</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Indian, Chinese, Italian"
                value={cuisine}
                onChangeText={setCuisine}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              {stallLocation ? (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationText}>
                    {stallLocation.address}
                  </Text>
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.locationButtonText}>
                        Update Location
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color="white"
                      />
                      <Text style={styles.locationButtonText}>
                        Get Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Stall Images (5 images)</Text>
              <Text style={styles.helperText}>
                Upload exactly 5 images of your stall
              </Text>

              <View style={styles.imagesContainer}>
                {stallImages.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <MaterialIcons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

                {stallImages.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={pickStallImage}
                  >
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={24}
                      color="#ff8c00"
                    />
                    <Text style={styles.addImageText}>Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.imagesCounter}>
                {stallImages.length} of 5 images
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.createButton,
                formLoading && styles.disabledButton,
              ]}
              onPress={createStall}
              disabled={formLoading}
            >
              {formLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <LinearGradient
                  colors={['#FF9A5A', '#FF5200']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.createButtonText}>Create Stall</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
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
                <Text style={styles.profileName}>
                  {user?.user_metadata?.full_name || 'Vendor'}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Stalls</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => toggleStallModal(true)}
              >
                <LinearGradient
                  colors={['#FF9A5A', '#FF5200']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <MaterialIcons name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>Add Stall</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {stalls.length > 0 ? (
              <FlatList
                data={stalls}
                renderItem={renderStallCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.stallsList}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyStallsContainer}>
                <MaterialIcons name="store" size={60} color="#ddd" />
                <Text style={styles.emptyStallsText}>No stalls available</Text>
                <Text style={styles.emptyStallsSubtext}>
                  Create your first stall to get started
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {renderStallModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ff8c00',
    paddingTop: 45, // For status bar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  stallsList: {
    paddingBottom: 20,
  },
  stallCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  stallImage: {
    width: '100%',
    height: 160,
  },
  stallContent: {
    padding: 12,
  },
  stallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stallName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stallCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stallFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hygieneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hygieneText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyStallsContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyStallsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStallsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
    maxHeight: 500,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  locationContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imagePreview: {
    position: 'relative',
    width: (width - 64) / 3,
    height: (width - 64) / 3,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: (width - 64) / 3,
    height: (width - 64) / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  imagesCounter: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  createButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
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
