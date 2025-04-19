import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import axios from 'axios';

// Define stall interface
interface Stall {
  id?: string | number;
  name: string;
  image?: string;
  cuisine: string;
  distance?: string;
  deliveryTime?: string;
  rating?: string | number;
  hygieneScore?: string | number;
  verified?: boolean;
}

// Stall card component
const StallCard = ({ stall }: { stall: Stall }) => {
  return (
    <View style={styles.stallCard}>
      <Image 
        source={{ uri: stall.image || 'https://via.placeholder.com/100' }} 
        style={styles.stallImage} 
      />
      <View style={styles.stallInfo}>
        <Text style={styles.stallName}>{stall.name}</Text>
        <Text style={styles.stallCuisine}>{stall.cuisine}</Text>
        <View style={styles.stallMetrics}>
          <View style={styles.metricItem}>
            <MaterialIcons name="star" size={16} color="#FFC107" />
            <Text style={styles.metricText}>{stall.rating || '4.5'}</Text>
          </View>
          <View style={styles.metricItem}>
            <MaterialIcons name="location-on" size={16} color="#FF5200" />
            <Text style={styles.metricText}>{stall.distance || '0.5 km'}</Text>
          </View>
          <View style={styles.metricItem}>
            <MaterialIcons name="delivery-dining" size={16} color="#4CAF50" />
            <Text style={styles.metricText}>{stall.deliveryTime || '20 min'}</Text>
          </View>
        </View>
      </View>
      {stall.verified && (
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="verified" size={16} color="#4CAF50" />
        </View>
      )}
    </View>
  );
};

export default function MicScreen() {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
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

      // Create and start recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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
      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setRecording(null);
      if (uri) {
        await processAudio(uri);
      } else {
        setError('Failed to get recording URI');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError('Failed to stop recording: ' + err.message);
      console.error('Failed to stop recording', err);
      setIsProcessing(false);
    }
  };

  const processAudio = async (uri: string) => {
    try {
      // Create form data with the audio file
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        name: 'recording.wav',
        type: 'audio/wav',
      } as any);

      // Send the audio to the Flask server
      const response = await axios.post(
        'http://10.10.112.73:5000/analyze_speech',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data;
      if (data.status === 'success') {
        setKeywords(data.keywords_sent || []);
        
        // Process stalls from node_response
        if (data.node_response && Array.isArray(data.node_response)) {
          setStalls(data.node_response);
        } else {
          setStalls([]);
        }
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError('Failed to process audio: ' + err.message);
      console.error('Failed to process audio', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Assistant</Text>
      </View>
      
      <View style={styles.content}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#FF5200" />
            <Text style={styles.processingText}>Processing your request...</Text>
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
            
            <Text style={styles.helpText}>
              Try saying: "Show me Chinese restaurants" or "Find Indian food"
            </Text>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {keywords.length > 0 && (
              <View style={styles.keywordsContainer}>
                <Text style={styles.keywordsTitle}>Detected cuisines:</Text>
                <View style={styles.keywordsList}>
                  {keywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {stalls.length > 0 && (
          <View style={styles.stallsContainer}>
            <Text style={styles.stallsTitle}>Recommended Stalls</Text>
            <FlatList
              data={stalls}
              renderItem={({ item }) => <StallCard stall={item} />}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              horizontal={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stallsList}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 18,
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
  helpText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  keywordsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keywordChip: {
    backgroundColor: '#ffebee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  keywordText: {
    color: '#FF5200',
    fontWeight: '500',
  },
  stallsContainer: {
    marginTop: 20,
    width: '100%',
    flex: 1,
  },
  stallsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  stallsList: {
    paddingBottom: 20,
  },
  stallCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  stallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  stallInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stallName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  stallCuisine: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  stallMetrics: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metricText: {
    fontSize: 12,
    marginLeft: 2,
    color: '#666666',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
