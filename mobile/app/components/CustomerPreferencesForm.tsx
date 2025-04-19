import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

// Types for the form data
type DietaryPreferences = {
  vegetarian: boolean;
  vegan: boolean;
  eggetarian: boolean;
  jain: boolean;
  non_vegetarian: boolean;
  custom: string;
};

type HealthSensitivities = {
  lactose_intolerant: boolean;
  nut_allergy: boolean;
  gluten_intolerance: boolean;
  diabetic: boolean;
  low_sodium: boolean;
  no_artificial_preservatives: boolean;
  custom: string;
};

export default function CustomerPreferencesForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTourist, setIsTourist] = useState<boolean | null>(null);
  const [homeCity, setHomeCity] = useState('');
  const [showCustomDietary, setShowCustomDietary] = useState(false);
  const [showCustomSensitivity, setShowCustomSensitivity] = useState(false);
  const [customDietary, setCustomDietary] = useState('');
  const [customSensitivity, setCustomSensitivity] = useState('');

  // Initialize dietary preferences
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    vegetarian: false,
    vegan: false,
    eggetarian: false,
    jain: false,
    non_vegetarian: false,
    custom: '',
  });

  // Initialize health sensitivities
  const [healthSensitivities, setHealthSensitivities] = useState<HealthSensitivities>({
    lactose_intolerant: false,
    nut_allergy: false,
    gluten_intolerance: false,
    diabetic: false,
    low_sodium: false,
    no_artificial_preservatives: false,
    custom: '',
  });

  // Toggle tourist status
  const toggleTourist = (value: boolean) => {
    setIsTourist(value);
  };

  // Toggle dietary preference
  const toggleDietaryPreference = (preference: keyof Omit<DietaryPreferences, 'custom'>) => {
    setDietaryPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  };

  // Toggle health sensitivity
  const toggleHealthSensitivity = (sensitivity: keyof Omit<HealthSensitivities, 'custom'>) => {
    setHealthSensitivities((prev) => ({
      ...prev,
      [sensitivity]: !prev[sensitivity],
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isTourist === null) {
      Alert.alert('Error', 'Please select if you are new to the city');
      return;
    }

    if (!homeCity.trim()) {
      Alert.alert('Error', 'Please enter your current city');
      return;
    }

    try {
      setLoading(true);

      // Update custom preferences if entered
      const updatedDietaryPreferences = {
        ...dietaryPreferences,
        custom: customDietary,
      };

      const updatedHealthSensitivities = {
        ...healthSensitivities,
        custom: customSensitivity,
      };

      // Prepare data for submission
      const profileData = {
        user_id: user?.id,
        home_city: homeCity,
        is_tourist: isTourist,
        dietary_preferences: updatedDietaryPreferences,
        health_sensitivity: updatedHealthSensitivities,
      };

      console.log("profileData", profileData);

      // Call API to create customer profile
      const response = await fetch('http://192.168.137.1:3000/customer/createCustomerProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log("response", response);
      

      if (response.status === 200) {
        // Navigate to dashboard on success
        router.replace('/(tabsCustomer)/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Taste Preferences</Text>
        <Text style={styles.description}>
          Tell us what you love, and we'll find the perfect food for you
        </Text>
      </View>

      {/* Tourist Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Are you new to the city?</Text>
        <View style={styles.optionRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              isTourist === true && styles.selectedButton,
            ]}
            onPress={() => toggleTourist(true)}
          >
            <Text
              style={[
                styles.optionText,
                isTourist === true && styles.selectedOptionText,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              isTourist === false && styles.selectedButton,
            ]}
            onPress={() => toggleTourist(false)}
          >
            <Text
              style={[
                styles.optionText,
                isTourist === false && styles.selectedOptionText,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home City Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current City</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your current city"
          placeholderTextColor="#000000"
          value={homeCity}
          onChangeText={setHomeCity}
        />
      </View>

      {/* Dietary Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[
              styles.gridItem,
              dietaryPreferences.vegetarian && styles.selectedButton,
            ]}
            onPress={() => toggleDietaryPreference('vegetarian')}
          >
            <Text
              style={[
                styles.gridItemText,
                dietaryPreferences.vegetarian && styles.selectedOptionText,
              ]}
            >
              Vegetarian
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              dietaryPreferences.non_vegetarian && styles.selectedButton,
            ]}
            onPress={() => toggleDietaryPreference('non_vegetarian')}
          >
            <Text
              style={[
                styles.gridItemText,
                dietaryPreferences.non_vegetarian && styles.selectedOptionText,
              ]}
            >
              Non-Vegetarian
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              dietaryPreferences.vegan && styles.selectedButton,
            ]}
            onPress={() => toggleDietaryPreference('vegan')}
          >
            <Text
              style={[
                styles.gridItemText,
                dietaryPreferences.vegan && styles.selectedOptionText,
              ]}
            >
              Vegan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              dietaryPreferences.eggetarian && styles.selectedButton,
            ]}
            onPress={() => toggleDietaryPreference('eggetarian')}
          >
            <Text
              style={[
                styles.gridItemText,
                dietaryPreferences.eggetarian && styles.selectedOptionText,
              ]}
            >
              Eggetarian
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              dietaryPreferences.jain && styles.selectedButton,
            ]}
            onPress={() => toggleDietaryPreference('jain')}
          >
            <Text
              style={[
                styles.gridItemText,
                dietaryPreferences.jain && styles.selectedOptionText,
              ]}
            >
              Jain
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              styles.addCustomButton,
            ]}
            onPress={() => setShowCustomDietary(!showCustomDietary)}
          >
            <Text style={styles.addCustomText}>+ Add Custom</Text>
          </TouchableOpacity>
        </View>
        
        {showCustomDietary && (
          <TextInput
            style={[styles.textInput, { marginTop: 10 }]}
            placeholder="Enter custom dietary preference"
            placeholderTextColor="#ff8c00"
            value={customDietary}
            onChangeText={setCustomDietary}
          />
        )}
      </View>

      {/* Health Sensitivities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Sensitivities</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.lactose_intolerant && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('lactose_intolerant')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.lactose_intolerant && styles.selectedOptionText,
              ]}
            >
              Lactose Intolerant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.nut_allergy && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('nut_allergy')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.nut_allergy && styles.selectedOptionText,
              ]}
            >
              Nut Allergy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.gluten_intolerance && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('gluten_intolerance')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.gluten_intolerance && styles.selectedOptionText,
              ]}
            >
              Gluten Intolerance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.diabetic && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('diabetic')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.diabetic && styles.selectedOptionText,
              ]}
            >
              Diabetic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.low_sodium && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('low_sodium')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.low_sodium && styles.selectedOptionText,
              ]}
            >
              Low Sodium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              healthSensitivities.no_artificial_preservatives && styles.selectedButton,
            ]}
            onPress={() => toggleHealthSensitivity('no_artificial_preservatives')}
          >
            <Text
              style={[
                styles.gridItemText,
                healthSensitivities.no_artificial_preservatives && styles.selectedOptionText,
              ]}
            >
              No Artificial Preservatives
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.gridItem,
              styles.addCustomButton,
            ]}
            onPress={() => setShowCustomSensitivity(!showCustomSensitivity)}
          >
            <Text style={styles.addCustomText}>+ Add Custom</Text>
          </TouchableOpacity>
        </View>
        
        {showCustomSensitivity && (
          <TextInput
            style={[styles.textInput, { marginTop: 10 }]}
            placeholder="Enter custom health sensitivity"
            placeholderTextColor="#000000"
            value={customSensitivity}
            onChangeText={setCustomSensitivity}
          />
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff8c00',
  },
  headerContainer: {
    paddingTop: 50,
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00000',
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  selectedButton: {
    backgroundColor: '#ff8c00',
    borderColor: '#ff8c00',
  },
  optionText: {
    fontWeight: '600',
    color: '#000000',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#000000',
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#ececec',
    color: '#000000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemText: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontSize: 14,
  },
  addCustomButton: {
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
  },
  addCustomText: {
    color: '#000000',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 35,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonText: {
    color: '#ff8c00',
    fontWeight: 'bold',
    fontSize: 20,
  },
}); 