import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Native splash screen ko dikhne se rokein
SplashScreen.preventAutoHideAsync();

function CustomSplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('@/assets/images/crypto_icon.png')}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 2 second ka delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Jab app taiyar ho, native splash screen ko hide karein
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Jab tak app taiyar nahi, custom splash screen dikhayein
  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  // App taiyar hone ke baad, main layout dikhayein
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="news-detail" 
        options={{ 
          title: 'Article',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashImage: {
    width: 120,
    height: 120,
  },
});
