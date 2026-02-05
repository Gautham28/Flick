import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
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

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 200;
const PAGE_SIZE = 40;

type Mode = 'browse' | 'review';

type ReviewItem = {
  id: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
};

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

  const renderAlbumPicker = () => (
    <Modal visible={albumModalVisible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose an Album</Text>
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            style={styles.albumList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedAlbum(item);
                  setAlbumModalVisible(false);
                }}
                style={styles.albumRow}
              >
                <Text style={styles.albumName}>{item.title}</Text>
                <Text style={styles.albumCount}>{item.assetCount} photos</Text>
              </Pressable>
            )}
          />
          <TouchableOpacity onPress={() => setAlbumModalVisible(false)} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
      <SafeAreaView style={styles.centered}>
        <ExpoStatusBar style="light" />
        <Text style={styles.title}>Pick an album to start</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setAlbumModalVisible(true)}>
          <Text style={styles.primaryButtonText}>Choose Album</Text>
        </TouchableOpacity>
        {renderAlbumPicker()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAlbumModalVisible(true)}>
          <Text style={styles.headerTitle}>{selectedAlbum.title}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={mode === 'browse' ? openReview : openBrowse}>
          <Text style={styles.headerAction}>
            {mode === 'browse' ? `Review (${reviewItems.length})` : 'Back to Swipe'}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'browse' ? (
        <View style={styles.deckContainer}>
          {nextAsset && (
            <View style={styles.card}>
              <Image source={{ uri: nextAsset.uri }} style={styles.image} resizeMode="cover" />
            </View>
          )}
          {currentAsset ? (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
                  transform: [...position.getTranslateTransform(), { rotate }],
                },
              ]}
            >
              <Animated.View style={[styles.badge, styles.keepBadge, { opacity: keepOpacity }]}> 
                <Text style={styles.badgeText}>KEEP</Text>
              </Animated.View>
              <Animated.View style={[styles.badge, styles.deleteBadge, { opacity: deleteOpacity }]}> 
                <Text style={styles.badgeText}>DELETE</Text>
              </Animated.View>
              <Image source={{ uri: currentAsset.uri }} style={styles.image} resizeMode="cover" />
            </Animated.View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>All done!</Text>
              <Text style={styles.emptyBody}>You swiped through everything in this album.</Text>
              {hasNextPage ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => loadMoreAssets()}>
                  <Text style={styles.primaryButtonText}>Load more</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          {loadingAssets && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.reviewContainer}>
          <View style={styles.reviewToolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={selectAllReview}>
              <Text style={styles.toolbarText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={clearSelection}>
              <Text style={styles.toolbarText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={restoreSelected}>
              <Text style={styles.toolbarText}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toolbarButton, styles.deleteButton]} onPress={deleteSelected}>
              <Text style={[styles.toolbarText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
          {reviewItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No photos queued</Text>
              <Text style={styles.emptyBody}>Swipe left to add photos here.</Text>
            </View>
          ) : (
            <FlatList
              data={reviewItems}
              keyExtractor={(item) => item.id}
              numColumns={3}
              renderItem={({ item }) => {
                const selected = reviewSelection.has(item.id);
                return (
                  <Pressable onPress={() => toggleSelection(item.id)} style={styles.reviewItem}>
                    <Image source={{ uri: item.uri }} style={styles.reviewImage} />
                    {selected ? <View style={styles.reviewSelected} /> : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      )}

      {renderAlbumPicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerAction: {
    color: '#58a6ff',
    fontSize: 16,
    fontWeight: '600',
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  card: {
    position: 'absolute',
    width: '86%',
    height: '70%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#20222a',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 2,
  },
  keepBadge: {
    left: 20,
    borderColor: '#7CFFB2',
  },
  deleteBadge: {
    right: 20,
    borderColor: '#FF7C7C',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
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
  loadingOverlay: {
    position: 'absolute',
    bottom: 20,
  },
  reviewContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  reviewToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toolbarButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#20222a',
  },
  toolbarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#3a1c1c',
  },
  deleteText: {
    color: '#ff8a8a',
  },
  reviewItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  reviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  reviewSelected: {
    position: 'absolute',
    inset: 4,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#58a6ff',
    backgroundColor: 'rgba(88,166,255,0.2)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1c22',
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  albumList: {
    marginBottom: 12,
  },
  albumRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2d36',
  },
  albumName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  albumCount: {
    color: '#8a8f9c',
    marginTop: 2,
  },
  modalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    color: '#58a6ff',
    fontWeight: '700',
  },
});
