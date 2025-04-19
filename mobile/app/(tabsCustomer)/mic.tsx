import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function MicScreen() {
  const insets = useSafeAreaInsets();
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Assistant</Text>
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
        
        <Text style={styles.helpText}>
          Use voice commands to navigate the app
        </Text>
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
  },
});
