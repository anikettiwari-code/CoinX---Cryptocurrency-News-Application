import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, RefreshControl, Image, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  imageurl: string;
}

const CATEGORIES = ['ALL', 'BTC', 'ETH', 'DeFi', 'NFT', 'Regulation', 'Technology'];

// "No Results" dikhane ke liye naya component
const NoResultsComponent = () => (
  <View style={styles.centered}>
    <ThemedText type="subtitle">No results found.</ThemedText>
    <ThemedText>Try searching for something else.</ThemedText>
  </View>
);

export default function HomeScreen() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  const loadBookmarks = async () => {
    const jsonValue = await AsyncStorage.getItem('@bookmarks');
    const bookmarks = jsonValue ? JSON.parse(jsonValue) : [];
    setBookmarkedIds(new Set(bookmarks.map((b: NewsArticle) => b.id)));
  };

  const fetchNews = useCallback(async (category: string) => {
    setLoading(true);
    setSearchQuery('');
    try {
      const apiKey = '##########################################################';
      const categoriesParam = category === 'ALL' ? '' : `&categories=${category}`;
      const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN${categoriesParam}`;
      
      const response = await axios.get(url, { headers: { authorization: `Apikey ${apiKey}` } });
      const validNews = response.data.Data.filter((a: NewsArticle) => a && a.id && a.title && a.imageurl);
      setNews(validNews);
      setFilteredNews(validNews);
      await loadBookmarks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);

  const toggleBookmark = async (article: NewsArticle) => {
    const currentBookmarksJson = await AsyncStorage.getItem('@bookmarks');
    let bookmarks: NewsArticle[] = currentBookmarksJson ? JSON.parse(currentBookmarksJson) : [];
    const newBookmarkedIds = new Set(bookmarkedIds);

    if (newBookmarkedIds.has(article.id)) {
      bookmarks = bookmarks.filter(b => b.id !== article.id);
      newBookmarkedIds.delete(article.id);
    } else {
      bookmarks.push(article);
      newBookmarkedIds.add(article.id);
    }
    
    await AsyncStorage.setItem('@bookmarks', JSON.stringify(bookmarks));
    setBookmarkedIds(newBookmarkedIds);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNews(selectedCategory);
    setIsRefreshing(false);
  }, [selectedCategory, fetchNews]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = news.filter(item => {
        return item.title.toUpperCase().includes(text.toUpperCase());
      });
      setFilteredNews(newData);
    } else {
      setFilteredNews(news);
    }
  };

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <Pressable onPress={() => router.push({ pathname: '/news-detail', params: { url: item.url } })}>
      <ThemedView style={styles.card}>
        <Image source={{ uri: item.imageurl }} style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
          <ThemedText type="default" style={styles.cardSource}>Source: {item.source}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => toggleBookmark(item)} style={styles.bookmarkIcon}>
          <Ionicons name={bookmarkedIds.has(item.id) ? 'bookmark' : 'bookmark-outline'} size={24} color={tintColor} />
        </TouchableOpacity>
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>CoinX</ThemedText>
      
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category} 
              style={[styles.categoryChip, selectedCategory === category && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[styles.categoryText, selectedCategory === category && styles.categoryTextSelected]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search in selected category..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? <ActivityIndicator style={{marginTop: 20}} size="large" /> : (
        <FlatList
          data={filteredNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          // === YAHAN PAR "NO RESULTS" COMPONENT ADD KIYA GAYA HAI ===
          ListEmptyComponent={NoResultsComponent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { // "No Results" message ko center karne ke liye style
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    header: { textAlign: 'center', paddingTop: 16, paddingBottom: 8 },
    categoriesContainer: { paddingHorizontal: 16, paddingVertical: 10 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
    categoryChipSelected: { backgroundColor: Colors.light.tint },
    categoryText: { color: '#333' },
    categoryTextSelected: { color: '#fff', fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 16, paddingBottom: 10 },
    searchInput: { height: 40, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#f0f0f0' },
    card: { padding: 16, marginVertical: 8, marginHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
    cardImage: { width: 50, height: 50, borderRadius: 8, marginRight: 16, backgroundColor: '#eee' },
    cardTextContainer: { flex: 1, marginRight: 10 },
    cardTitle: { fontSize: 16 },
    cardSource: { opacity: 0.7, marginTop: 4 },
    bookmarkIcon: { padding: 5 },
});
