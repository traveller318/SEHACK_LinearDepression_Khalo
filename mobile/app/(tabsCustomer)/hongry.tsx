import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HongryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hongry</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Hongry</Text>
        <Text style={styles.descriptionText}>Your food delivery experience simplified</Text>
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
