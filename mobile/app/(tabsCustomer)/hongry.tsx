import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodSwiper from '../components/FoodSwiper';
import RecommendedStalls from '../components/RecommendedStalls';
import { getAIRecommendations } from '../../services/recommendationService';

// Explicitly set displayName for the HongryScreen component
const HongryScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [recommendedStalls, setRecommendedStalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSwiper, setShowSwiper] = useState(true);

  const handleFinishSwiping = async (foods: any[]) => {
    if (foods.length > 0) {
      setSelectedFoods(foods);
      setLoading(true);
      
      try {
        // Get AI recommendations based on selected foods
        const stalls = await getAIRecommendations(foods);
        setRecommendedStalls(stalls);
      } catch (error) {
        console.error('Error getting recommendations:', error);
      } finally {
        setLoading(false);
        setShowSwiper(false);
      }
    } else {
      // Handle case when no foods were selected
      setShowSwiper(false);
    }
  };

  const handleBackToSwiper = () => {
    setSelectedFoods([]);
    setRecommendedStalls([]);
    setShowSwiper(true);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hongry</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5200" />
          <Text style={styles.loadingText}>Finding the perfect stalls for you...</Text>
        </View>
      ) : showSwiper ? (
        <FoodSwiper onFinish={handleFinishSwiping} />
      ) : (
        <RecommendedStalls 
          stalls={recommendedStalls}
          onBackToSwiper={handleBackToSwiper}
        />
      )}
    </SafeAreaView>
  );
};

// Explicitly set displayName to fix the error
HongryScreen.displayName = 'HongryScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5200',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HongryScreen;
