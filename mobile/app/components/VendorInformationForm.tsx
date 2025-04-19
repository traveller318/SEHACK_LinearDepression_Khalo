import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const certificationOptions = [
  'FSSAI License',
  'Food Safety Training Certificate',
  'Fire Safety Certificate',
  'Hygiene Rating Certificate',
  'Local Municipal Health License'
];

export default function VendorInformationForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [certificationImage, setCertificationImage] = useState<{
    uri: string;
    base64: string | null;
    fileName: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<{
    uri: string;
    base64: string | null;
    fileName: string;
  } | null>(null);

  // Error states
  const [phoneError, setPhoneError] = useState('');
  const [gstError, setGstError] = useState('');
  const [certificationError, setCertificationError] = useState('');
  const [certImageError, setCertImageError] = useState('');
  const [profileImageError, setProfileImageError] = useState('');

  // Validate phone number (international format)
  const validatePhone = (value: string) => {
    // TODO: Add phone number validation
    // const phoneRegex = /^\+[1-9]\d{1,14}$/;
    // if (!phoneRegex.test(value)) {
    //   setPhoneError('Please enter a valid international phone number (e.g. +919876543210)');
    //   return false;
    // }
    // setPhoneError('');
    return true;
  };

  // Validate GST number
  const validateGST = (value: string) => {
    // TODO: Add GST number validation
    // const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    // if (!gstRegex.test(value)) {
    //   setGstError('Please enter a valid 15-character GST number (e.g. 29ABCDE1234F2Z5)');
    //   return false;
    // }
    // setGstError('');
    return true;
  };

  // Handle certification selection
  const toggleCertification = (cert: string) => {
    if (selectedCertifications.includes(cert)) {
      setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
    } else {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
    setCertificationError('');
  };

  // Pick an image from gallery
  const pickImage = async (isCertificate: boolean) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Generate a unique filename
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${asset.uri.split('.').pop()
          }`;

        if (isCertificate) {
          setCertificationImage({
            uri: asset.uri,
            base64: asset.base64 || null,
            fileName,
          });
          setCertImageError('');
        } else {
          setProfileImage({
            uri: asset.uri,
            base64: asset.base64 || null,
            fileName,
          });
          setProfileImageError('');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (
    base64Image: string,
    bucketName: string,
    filePath: string
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, decode(base64Image), {
          contentType: 'image/jpg',
          upsert: true,
        });
  
      console.log("bucket name", bucketName);
      console.log("file path", filePath);
  
      if (error) throw error;
  
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
  
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };
  

  // Validate form
  const validateForm = () => {
    let isValid = true;

    if (!validatePhone(phone)) isValid = false;
    if (!validateGST(gstNumber)) isValid = false;

    if (selectedCertifications.length === 0) {
      setCertificationError('Please select at least one certification');
      isValid = false;
    }

    if (!certificationImage) {
      setCertImageError('Please upload certification image');
      isValid = false;
    }

    if (!profileImage) {
      setProfileImageError('Please upload profile image');
      isValid = false;
    }

    if (!location.trim()) {
      isValid = false;
    }

    return isValid;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!user?.id || !certificationImage?.base64 || !profileImage?.base64) {
        throw new Error('Missing required information');
      }

      // Upload certification image
      const certImagePath = `${user.id}/${certificationImage.fileName}`;
      const certImageUrl = await uploadImage(
        certificationImage.base64,
        'images-certi',
        certImagePath
      );

      // Upload profile image
      const profileImagePath = `${user.id}/${profileImage.fileName}`;
      const profileImageUrl = await uploadImage(
        profileImage.base64,
        'profile-image',
        profileImagePath
      );

      // Create vendor profile
      const response = await fetch('http://192.168.137.1:3000/vendor/createVendorProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          phone,
          gst_number: gstNumber,
          certification: selectedCertifications.join(', '),
          location,
          certification_image: certImageUrl,
          profile_image: profileImageUrl,
        }),
      });

      const result = await response.json();

      if (response.status === 200) {
        router.replace('/(tabsVendor)/dashboard');
      } else {
        console.log("result uploading");
        console.log(result.error);

        Alert.alert('Error', 'Failed to submit information: ' + (result.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.log("normal error");
      console.log(error);
      console.error('Error submitting form:', error);
      Alert.alert('Error', `Failed to submit information: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Information</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Phone Number */}
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. +919876543210"
            placeholderTextColor="#777"
            value={phone}
            onChangeText={setPhone}
            onBlur={() => validatePhone(phone)}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

        {/* GST Number */}
        <Text style={styles.label}>GST Number</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="description" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. 29ABCDE1234F2Z5"
            placeholderTextColor="#777"
            value={gstNumber}
            onChangeText={setGstNumber}
            onBlur={() => validateGST(gstNumber)}
          />
        </View>
        {gstError ? <Text style={styles.errorText}>{gstError}</Text> : null}

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Koramangala, Bangalore"
            placeholderTextColor="#777"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Certifications */}
        <Text style={styles.label}>Certifications</Text>
        <View style={styles.certificationContainer}>
          {certificationOptions.map((cert) => (
            <TouchableOpacity
              key={cert}
              style={[
                styles.certButton,
                selectedCertifications.includes(cert) && styles.certButtonSelected,
              ]}
              onPress={() => toggleCertification(cert)}
            >
              {selectedCertifications.includes(cert) && (
                <MaterialIcons name="check-circle" size={16} color="#fff" style={styles.certIcon} />
              )}
              <Text
                style={[
                  styles.certButtonText,
                  selectedCertifications.includes(cert) && styles.certButtonTextSelected,
                ]}
              >
                {cert}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {certificationError ? <Text style={styles.errorText}>{certificationError}</Text> : null}

        {/* Profile Image */}
        <Text style={styles.label}>Profile Image</Text>
        <View style={styles.imageUploadContainer}>
          {profileImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: profileImage.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => pickImage(false)}
              >
                <MaterialIcons name="edit" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={() => pickImage(false)}
            >
              <FontAwesome name="user-circle" size={40} color="#ff8c00" />
              <Text style={styles.imagePickerText}>Upload Profile Photo</Text>
            </TouchableOpacity>
          )}
        </View>
        {profileImageError ? <Text style={styles.errorText}>{profileImageError}</Text> : null}

        {/* Certification Image */}
        <Text style={styles.label}>Certification Image</Text>
        <View style={styles.imageUploadContainer}>
          {certificationImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: certificationImage.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => pickImage(true)}
              >
                <MaterialIcons name="edit" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={() => pickImage(true)}
            >
              <MaterialIcons name="file-upload" size={40} color="#ff8c00" />
              <Text style={styles.imagePickerText}>Upload Certification</Text>
            </TouchableOpacity>
          )}
        </View>
        {certImageError ? <Text style={styles.errorText}>{certImageError}</Text> : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
  header: {
    backgroundColor: '#ff8c00',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  certificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  certButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  certButtonSelected: {
    backgroundColor: '#ff8c00',
    borderColor: '#ff8c00',
  },
  certIcon: {
    marginRight: 4,
  },
  certButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  certButtonTextSelected: {
    color: '#ffffff',
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  imagePickerText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#ff8c00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 10,
    fontSize: 14,
  },
}); 