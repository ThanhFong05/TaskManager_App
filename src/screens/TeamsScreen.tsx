import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const TeamsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Teams</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Coming soon (Exam 2)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});

export default TeamsScreen;
