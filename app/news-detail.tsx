import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function NewsDetailScreen() {
  // Home screen se bheje gaye URL ko yahan receive karein
  const { url } = useLocalSearchParams<{ url: string }>();

  // Agar URL nahi hai, toh kuch na dikhayein
  if (!url) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header ko set karein */}
      <Stack.Screen
        options={{
          title: 'Article',
          headerBackTitle: 'Back',
        }}
      />
      
      {/* WebView component jo website ko render karega */}
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    // WebView ke upar loading spinner ko center mein dikhane ke liye
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
