import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, StatusBar, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FoodSwiper from '../components/FoodSwiper';
import RecommendedStalls from '../components/RecommendedStalls';
import { getAIRecommendations } from '../../services/recommendationService';
import { FontAwesome5 } from '@expo/vector-icons';

// Explicitly set displayName for the HongryScreen component
const HongryScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [recommendedStalls, setRecommendedStalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSwiper, setShowSwiper] = useState(true);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [showSwiper, loading]);

  useEffect(() => {
    if (loading) {
      // Create a continuous spinning animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleFinishSwiping = async (foods: any[]) => {
    if (foods.length > 0) {
      setSelectedFoods(foods);
      setLoading(true);
      
      try {
        // Reset fade animation for transition
        fadeAnim.setValue(0);
        
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
    fadeAnim.setValue(0);
    setSelectedFoods([]);
    setRecommendedStalls([]);
    setShowSwiper(true);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#FF5200', '#FF8C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <FontAwesome5 name="utensils" size={24} color="white" />
            <Text style={styles.headerTitle}>Hongry</Text>
          </View>
        </LinearGradient>
        
        <Animated.View 
          style={[
            styles.contentContainer,
            { opacity: fadeAnim }
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <FontAwesome5 name="hamburger" size={50} color="#FF5200" />
              </Animated.View>
              <Text style={styles.loadingText}>Finding the perfect stalls for you...</Text>
              <Text style={styles.loadingSubtext}>Analyzing your taste preferences</Text>
            </View>
          ) : showSwiper ? (
            <FoodSwiper onFinish={handleFinishSwiping} />
          ) : (
            <RecommendedStalls 
              stalls={recommendedStalls}
              onBackToSwiper={handleBackToSwiper}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

// Explicitly set displayName to fix the error
HongryScreen.displayName = 'HongryScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HongryScreen;
