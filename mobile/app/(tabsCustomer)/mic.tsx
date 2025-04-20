import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Image, Animated, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

// Sample stall data for recommendations
const STALLS_DATA = [
  {
    id: '1',
    name: 'Da Paolo Ristorante',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=2070',
    description: 'Authentic Italian pastas and wood-fired pizzas',
    location: 'Holland Village',
    cuisine: 'Italian',
    distance: '2.3 km',
    deliveryTime: '25-35 min',
    rating: 4.7,
    hygieneScore: 'A',
    verified: true,
  },
  {
    id: '2',
    name: 'Szechuan Paradise',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2129',
    description: 'Spicy Szechuan dishes and hotpot specialties',
    location: 'VivoCity',
    cuisine: 'Chinese',
    distance: '1.8 km',
    deliveryTime: '20-30 min',
    rating: 4.3,
    hygieneScore: 'B',
    verified: true,
  },
  {
    id: '3',
    name: 'Pasta Fresca',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2032',
    description: 'Handmade pasta and traditional Italian recipes',
    location: 'Bukit Timah',
    cuisine: 'Italian',
    distance: '3.5 km',
    deliveryTime: '30-40 min',
    rating: 4.6,
    hygieneScore: 'A',
    verified: true,
  },
  {
    id: '4',
    name: 'Dim Sum Palace',
    image: 'https://cdn.cnn.com/cnnnext/dam/assets/160325033254-hk-dim-sum-fook-lam-moon.jpg',
    description: 'Wide variety of dim sum and Cantonese specialties',
    location: 'Chinatown',
    cuisine: 'Chinese',
    distance: '1.2 km',
    deliveryTime: '15-25 min',
    rating: 4.4,
    hygieneScore: 'A',
    verified: true,
  },
];

const { width } = Dimensions.get('window');
const STALL_CARD_WIDTH = width * 0.9;

export default function MicScreen() {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingsList, setRecordingsList] = useState<{uri: string, duration: number}[]>([]);
  
  // New states for loading and recommendations
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedStalls, setRecommendedStalls] = useState(STALLS_DATA);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation when switching views
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [showRecommendations, loading]);

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

  const startRecording = async () => {
    try {
      setError(null);
      // Stop any playing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      setRecordingUri(null);
      setDuration(null);
      setShowRecommendations(false);

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access microphone was denied');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording with MP3 format
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.mp3',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.mp3',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/mp3',
          bitsPerSecond: 128000,
        },
      });
      
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsListening(true);
    } catch (err: any) {
      setError('Failed to start recording: ' + err.message);
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsListening(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: uri! },
        { shouldPlay: false }
      );
      
      let durationMillis = 0;
      if (status.isLoaded) {
        durationMillis = status.durationMillis || 0;
      }
      setDuration(durationMillis / 1000); // Convert to seconds
      
      setRecording(null);
      if (uri) {
        setRecordingUri(uri);
        setRecordingsList(prev => [...prev, {uri, duration: durationMillis / 1000}]);
        
        // Start loading process
        fadeAnim.setValue(0);
        setLoading(true);
        
        // Simulate processing the audio and getting recommendations
        setTimeout(() => {
          setLoading(false);
          setShowRecommendations(true);
        }, 5000); // 5 seconds loading
      } else {
        setError('Failed to get recording URI');
      }
    } catch (err: any) {
      setError('Failed to stop recording: ' + err.message);
      console.error('Failed to stop recording', err);
    }
  };

  const loadSound = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);

      // Set up playback status update listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err: any) {
      setError('Failed to load sound: ' + err.message);
      console.error('Failed to load sound', err);
    }
  };

  const playSound = async (uri: string = '') => {
    try {
      const audioUri = uri || recordingUri;
      
      if (!sound || (uri && uri !== recordingUri)) {
        if (audioUri) {
          await loadSound(audioUri);
          setRecordingUri(audioUri);
        } else {
          return;
        }
      }
      
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      await sound?.playFromPositionAsync(0);
      setIsPlaying(true);
    } catch (err: any) {
      setError('Failed to play recording: ' + err.message);
      console.error('Failed to play recording', err);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (err: any) {
      setError('Failed to stop playback: ' + err.message);
      console.error('Failed to stop playback', err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesome5 key={i} name="star" size={14} color="#FFD700" style={{marginRight: 2}} />);
      } else if (i === fullStars && halfStar) {
        stars.push(<FontAwesome5 key={i} name="star-half-alt" size={14} color="#FFD700" style={{marginRight: 2}} />);
      } else {
        stars.push(<FontAwesome5 key={i} name="star" size={14} color="#E0E0E0" style={{marginRight: 2}} />);
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {stars}
        </View>
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderStall = ({ item, index }: { item: any; index: number }) => {
    return (
      <Animated.View
        style={[
          styles.stallCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.stallImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageOverlayContent}>
            <Text style={styles.stallName}>{item.name}</Text>
            {renderRatingStars(item.rating)}
          </View>
          
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <FontAwesome5 name="check-circle" size={14} color="#3498db" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.stallContent}>
          <View style={styles.tagRow}>
            <View style={styles.cuisineTag}>
              <FontAwesome5 name="utensils" size={12} color="#FF5200" />
              <Text style={styles.cuisineText}>{item.cuisine}</Text>
            </View>
            
            {item.hygieneScore && (
              <View style={styles.hygieneScore}>
                <Text style={styles.hygieneScoreText}>{item.hygieneScore}</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={2} style={styles.stallDescription}>
            {item.description}
          </Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <FontAwesome5 name="clock" size={14} color="#666" />
              <Text style={styles.detailText}>{item.deliveryTime}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.locationButton}
          >
            <FontAwesome5 name="directions" size={16} color="white" />
            <Text style={styles.locationText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const handleNewRecording = () => {
    setShowRecommendations(false);
    setRecordingUri(null);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording, sound]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#FF5200', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FontAwesome5 name="microphone" size={24} color="white" />
          <Text style={styles.headerTitle}>Voice Diner</Text>
        </View>
      </LinearGradient>
      
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <FontAwesome5 name="hamburger" size={50} color="#FF5200" />
            </Animated.View>
            <Text style={styles.loadingText}>Analyzing your food preferences...</Text>
            <Text style={styles.loadingSubtext}>Finding the perfect stalls for you</Text>
          </View>
        ) : showRecommendations ? (
          <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationsHeader}>
              <Text style={styles.recommendationsTitle}>
                Recommended For You
              </Text>
              <TouchableOpacity
                style={styles.newRecordingButton}
                onPress={handleNewRecording}
              >
                <FontAwesome5 name="sync-alt" size={18} color="#FF5200" />
                <Text style={styles.newRecordingText}>New Recording</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.recommendationsSubtitle}>
              Based on your voice request
            </Text>
            
            <FlatList
              data={recommendedStalls}
              renderItem={renderStall}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.stallsListContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <>
            <Text style={styles.instructionText}>
              {isListening ? 'Listening...' : 'Tap the microphone to start'}
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.micButton, 
                isListening && styles.listeningButton
              ]}
              onPress={toggleListening}
            >
              <FontAwesome 
                name="microphone" 
                size={40} 
                color={isListening ? "#ffffff" : "#FF5200"} 
              />
            </TouchableOpacity>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 18,
    marginTop: 30,
    marginBottom: 40,
    color: '#333333',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listeningButton: {
    backgroundColor: '#FF5200',
    transform: [{ scale: 1.1 }],
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  playbackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playbackText: {
    fontSize: 16,
    color: '#333333',
  },
  durationText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  // Loading container styles
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
  // Recommendations styles
  recommendationsContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8f9fa',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  newRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newRecordingText: {
    marginLeft: 5,
    color: '#FF5200',
    fontWeight: '600',
  },
  recommendationsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  stallsListContainer: {
    paddingBottom: 20,
  },
  // Stall card styles
  stallCard: {
    width: STALL_CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  stallImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  imageOverlayContent: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  stallName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  stallContent: {
    padding: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cuisineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cuisineText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  hygieneScore: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hygieneScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stallDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  locationButton: {
    backgroundColor: '#FF5200',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  recordingsContainer: {
    width: '100%',
    marginTop: 20,
    flex: 1,
  },
  recordingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  recordingsList: {
    paddingBottom: 20,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  recordingDuration: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
