import React from 'react';
import { FlatList, Pressable, StyleSheet, Image, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme'; // useTheme ko hatakar useColorScheme wapas laya gaya

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  imageurl: string;
}

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = React.useState<NewsArticle[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme(); // theme ko hatakar colorScheme wapas laya gaya

  useFocusEffect(
    React.useCallback(() => {
      const loadBookmarks = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@bookmarks');
          setBookmarks(jsonValue != null ? JSON.parse(jsonValue) : []);
        } catch (e) {
          console.error('Failed to load bookmarks.', e);
        }
      };
      loadBookmarks();
    }, [])
  );

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <Pressable onPress={() => router.push({ pathname: '/news-detail', params: { url: item.url } })}>
      <ThemedView style={styles.card}>
        <Image source={{ uri: item.imageurl }} style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
          <ThemedText type="default" style={styles.cardSource}>Source: {item.source}</ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Saved Articles</ThemedText>
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centered}>
          <ThemedText>You have no saved articles.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { textAlign: 'center', paddingTop: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  card: { padding: 16, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  cardImage: { width: 50, height: 50, borderRadius: 8, marginRight: 16, backgroundColor: '#eee' },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16 },
  cardSource: { opacity: 0.7, marginTop: 4 },
  listContent: { paddingBottom: 20 },
});
