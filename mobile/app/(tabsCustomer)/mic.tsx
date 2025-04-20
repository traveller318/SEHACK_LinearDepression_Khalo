import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

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
        
        // Load the recorded audio for playback
        await loadSound(uri);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Recorder</Text>
      </View>
      
      <View style={styles.content}>
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
        
        {recordingUri && (
          <View style={styles.playbackContainer}>
            <TouchableOpacity 
              style={styles.playbackButton}
              onPress={isPlaying ? stopSound : () => playSound()}
            >
              <FontAwesome 
                name={isPlaying ? "stop" : "play"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.playbackText}>
                {isPlaying ? "Stop Playback" : "Play Recording"}
              </Text>
              {duration && (
                <Text style={styles.durationText}>
                  Duration: {formatDuration(duration)}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {recordingsList.length > 0 && (
          <View style={styles.recordingsContainer}>
            <Text style={styles.recordingsTitle}>Your Recordings</Text>
            <FlatList
              data={recordingsList}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.recordingItem}
                  onPress={() => playSound(item.uri)}
                >
                  <View style={styles.recordingIcon}>
                    <FontAwesome name="file-audio-o" size={24} color="#FF5200" />
                  </View>
                  <View style={styles.recordingInfo}>
                    <Text style={styles.recordingName}>Recording {index + 1}</Text>
                    <Text style={styles.recordingDuration}>{formatDuration(item.duration)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.playIcon}
                    onPress={() => playSound(item.uri)}
                  >
                    <FontAwesome 
                      name={isPlaying && recordingUri === item.uri ? "stop" : "play"} 
                      size={20} 
                      color="#FF5200" 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={styles.recordingsList}
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
