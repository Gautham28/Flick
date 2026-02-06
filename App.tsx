import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AlbumPickerModal from './src/components/AlbumPickerModal';
import HomeScreen from './src/screens/HomeScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import { Mode, ReviewItem } from './src/types';
import { useFonts } from 'expo-font';

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 200;
const PAGE_SIZE = 40;

export default function App() {
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus>('undetermined');
  const [accessPrivileges, setAccessPrivileges] = useState<MediaLibrary.AccessPrivileges>('none');
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('browse');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewSelection, setReviewSelection] = useState<Set<string>>(new Set());
  const [albumModalVisible, setAlbumModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Chopsticks: require('./assets/fonts/Chopsticks.ttf'),
  });
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'review') {
        setMode('browse');
        return true;
      }
      if (mode === 'browse' && selectedAlbum) {
        setSelectedAlbum(null);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [mode, selectedAlbum]);

  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    (async () => {
      const permission = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(permission.status);
      setAccessPrivileges(permission.accessPrivileges ?? 'none');
      if (permission.status === 'granted') {
        const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
        setAlbums(fetchedAlbums);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedAlbum) return;
    setAssets([]);
    setEndCursor(undefined);
    setHasNextPage(true);
    setCurrentIndex(0);
    setLoadingAssets(false);
    loadMoreAssets(true).catch(() => undefined);
  }, [selectedAlbum?.id]);

  const loadMoreAssets = async (initial = false) => {
    if (!selectedAlbum || loadingAssets || !hasNextPage) return;
    setLoadingAssets(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        first: PAGE_SIZE,
        album: selectedAlbum,
        after: initial ? undefined : endCursor,
        mediaType: ['photo'],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      setAssets((prev) => (initial ? page.assets : [...prev, ...page.assets]));
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
    } finally {
      setLoadingAssets(false);
    }
  };

  const currentAsset = assets[currentIndex];
  const nextAsset = assets[currentIndex + 1];

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const keepOpacity = position.x.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const deleteOpacity = position.x.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
        onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('keep');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('delete');
          } else {
            resetPosition();
          }
        },
      }),
    [currentIndex, assets]
  );

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction: 'keep' | 'delete') => {
    const x = direction === 'keep' ? 500 : -500;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'keep' | 'delete') => {
    const asset = assets[currentIndex];
    if (direction === 'delete' && asset) {
      setReviewItems((prev) => [
        {
          id: asset.id,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          creationTime: asset.creationTime ?? 0,
        },
        ...prev,
      ]);
    }
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
    if (currentIndex + 5 >= assets.length) {
      loadMoreAssets().catch(() => undefined);
    }
  };

  const openReview = () => setMode('review');
  const openBrowse = () => setMode('browse');

  const openPreview = (uri?: string) => {
    if (uri) setPreviewUri(uri);
  };

  const closePreview = () => setPreviewUri(null);

  const toggleSelection = (id: string) => {
    setReviewSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllReview = () => {
    setReviewSelection(new Set(reviewItems.map((item) => item.id)));
  };

  const clearSelection = () => setReviewSelection(new Set());

  const restoreSelected = () => {
    if (reviewSelection.size === 0) return;
    setReviewItems((prev) => prev.filter((item) => !reviewSelection.has(item.id)));
    clearSelection();
  };

  const deleteSelected = async () => {
    if (reviewSelection.size === 0) return;
    if (accessPrivileges !== 'all') {
      Alert.alert(
        'Need Full Access',
        'Please allow full photo access to delete items from your library.'
      );
      return;
    }
    const ids = Array.from(reviewSelection);
    try {
      await MediaLibrary.deleteAssetsAsync(ids);
      setReviewItems((prev) => prev.filter((item) => !reviewSelection.has(item.id)));
      clearSelection();
    } catch (error) {
      Alert.alert('Delete failed', 'Could not delete selected photos.');
    }
  };


  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.centered}>
        <ExpoStatusBar style="dark" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <SafeAreaView style={styles.centered}>
        <ExpoStatusBar style="light" />
        <Text style={styles.permissionTitle}>We need photo access</Text>
        <Text style={styles.permissionBody}>
          Enable photo library access to swipe through your albums.
        </Text>
        <Text style={styles.permissionHint}>
          Current status: {permissionStatus}
        </Text>
      </SafeAreaView>
    );
  }

  if (!selectedAlbum) {
    return (
      <>
        <HomeScreen onChooseAlbum={() => setAlbumModalVisible(true)} />
        <AlbumPickerModal
          visible={albumModalVisible}
          albums={albums}
          onSelect={(album) => {
            setSelectedAlbum(album);
            setAlbumModalVisible(false);
          }}
          onClose={() => setAlbumModalVisible(false)}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.container, styles.containerLight]}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />

      {mode === 'browse' ? (
        <SwipeScreen
          selectedAlbum={selectedAlbum}
          reviewCount={reviewItems.length}
          mode={mode}
          onOpenAlbumPicker={() => setAlbumModalVisible(true)}
          onToggleMode={mode === 'browse' ? openReview : openBrowse}
          currentAsset={currentAsset}
          nextAsset={nextAsset}
          panHandlers={panResponder.panHandlers}
          cardTransform={[...position.getTranslateTransform(), { rotate }]}
          onPreview={openPreview}
          loadingAssets={loadingAssets}
          hasNextPage={hasNextPage}
          onLoadMore={loadMoreAssets}
        />
      ) : (
        <ReviewScreen
          albumTitle={selectedAlbum.title}
          items={reviewItems}
          selection={reviewSelection}
          onToggleSelection={toggleSelection}
          onSelectAll={selectAllReview}
          onClearSelection={clearSelection}
          onRestoreSelected={restoreSelected}
          onDeleteSelected={deleteSelected}
          onPreview={openPreview}
          onBack={openBrowse}
        />
      )}

      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={closePreview}>
        <Pressable style={styles.previewBackdrop} onPress={closePreview}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>

      <AlbumPickerModal
        visible={albumModalVisible}
        albums={albums}
        onSelect={(album) => {
          setSelectedAlbum(album);
          setAlbumModalVisible(false);
        }}
        onClose={() => setAlbumModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f7f5f0',
  },
  containerDark: {
    backgroundColor: '#101114',
  },
  centered: {
    flex: 1,
    backgroundColor: '#101114',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#b0b4c1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#58a6ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  permissionBody: {
    color: '#b0b4c1',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionHint: {
    color: '#8a8f9c',
    marginTop: 12,
  },
  loadingText: {
    color: '#111',
    fontSize: 16,
    fontFamily: 'Chopsticks',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 20,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
