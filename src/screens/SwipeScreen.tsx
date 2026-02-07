import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export type SwipeScreenProps = {
  selectedAlbum: MediaLibrary.Album;
  reviewCount: number;
  mode: 'browse' | 'review';
  onOpenAlbumPicker: () => void;
  onToggleMode: () => void;
  currentAsset?: MediaLibrary.Asset;
  nextAsset?: MediaLibrary.Asset;
  panHandlers: any;
  cardTransform: any;
  onPreview: (uri?: string) => void;
  loadingAssets: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onUndo: () => void;
};

export default function SwipeScreen({
  selectedAlbum,
  reviewCount,
  mode,
  onOpenAlbumPicker,
  onToggleMode,
  currentAsset,
  nextAsset,
  panHandlers,
  cardTransform,
  onPreview,
  loadingAssets,
  hasNextPage,
  onLoadMore,
  onUndo,
}: SwipeScreenProps) {
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenAlbumPicker} style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{selectedAlbum.title}</Text>
          <Text style={styles.headerTitleArrow}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onToggleMode}>
          <Text style={styles.headerButtonText}>
            {mode === 'browse' ? `Review (${reviewCount})` : 'Back to Swipe'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deckContainer}>
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to view the full pic</Text>
          <Image source={require('../../assets/blackarrow.png')} style={styles.tapHintArrow} resizeMode="contain" />
        </View>

        {nextAsset && (
          <View style={styles.card}>
            <Image source={{ uri: nextAsset.uri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {currentAsset ? (
          <Animated.View {...panHandlers} style={[styles.card, { transform: cardTransform }]}>
            <Pressable style={styles.previewPressable} onPress={() => onPreview(currentAsset.uri)}>
              <Image source={{ uri: currentAsset.uri }} style={styles.image} resizeMode="cover" />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>All done!</Text>
            <Text style={styles.emptyBody}>You swiped through everything in this album.</Text>
            {hasNextPage ? (
              <TouchableOpacity style={styles.primaryButton} onPress={onLoadMore}>
                <Text style={styles.primaryButtonText}>Load more</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <View style={styles.swipeHintsRow}>
          <View style={styles.swipeHintItem}>
            <Image source={require('../../assets/redarrow.png')} style={styles.swipeArrow} resizeMode="contain" />
            <Text style={styles.swipeDeleteText}>Swipe to delete</Text>
          </View>
          <View style={styles.swipeHintItem}>
            <Image source={require('../../assets/greenarrow.png')} style={styles.swipeArrow} resizeMode="contain" />
            <Text style={styles.swipeKeepText}>Swipe to keep</Text>
          </View>
        </View>

        {loadingAssets && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#111" />
          </View>
        )}
      </View>

      <View style={styles.undoHint}>
        <Text style={styles.undoHintText}>Tap here to undo
The last swipe</Text>
        <Image source={require('../../assets/blackarrow2.png')} style={styles.undoHintArrow} resizeMode="contain" />
      </View>
      <TouchableOpacity style={styles.swipeFooter} onPress={onUndo} activeOpacity={0.7}>
        <Image source={require('../../assets/flicklogo.png')} style={styles.swipeFooterLogo} resizeMode="contain" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#111',
    fontSize: 18,
    fontFamily: 'Chopsticks',
  },
  headerTitleArrow: {
    marginLeft: 6,
    fontSize: 16,
    color: '#111',
  },
  headerButton: {
    backgroundColor: '#2e2f33',
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Chopsticks',
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 34,
  },
  tapHint: {
    position: 'absolute',
    top: 75,
    alignItems: 'center',
  },
  tapHintText: {
    fontFamily: 'Chopsticks',
    fontSize: 14,
    color: '#111',
    marginBottom: 2,
  },
  tapHintArrow: {
    width: 44,
    height: 44,
  },
  card: {
    position: 'absolute',
    width: '88%',
    height: '62%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#c9c9c9',
    borderWidth: 2,
    borderColor: '#2e2f33',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  previewPressable: {
    flex: 1,
  },
  swipeHintsRow: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swipeHintItem: {
    alignItems: 'center',
  },
  swipeArrow: {
    width: 90,
    height: 30,
    marginBottom: 6,
  },
  swipeDeleteText: {
    fontFamily: 'Chopsticks',
    fontSize: 14,
    color: '#cc3b3b',
  },
  swipeKeepText: {
    fontFamily: 'Chopsticks',
    fontSize: 14,
    color: '#2c9b4b',
  },
  swipeFooter: {
    alignItems: 'center',
    paddingBottom: 18,
  },
  swipeFooterLogo: {
    width: 82,
    height: 82,
  },
  undoHint: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 1,
  },
  undoHintText: {
    fontFamily: 'Chopsticks',
    fontSize: 13,
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
  },
  undoHintArrow: {
    width: 42,
    height:42,
    transform: [{ rotate: '0deg' }],
    paddingBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#111',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#4d4f57',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2e2f33',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 20,
  },
});
