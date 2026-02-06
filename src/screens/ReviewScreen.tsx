import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { ReviewItem } from '../types';

export type ReviewScreenProps = {
  albumTitle: string;
  items: ReviewItem[];
  selection: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onPreview: (uri: string) => void;
  onBack: () => void;
};

export default function ReviewScreen({
  albumTitle,
  items,
  selection,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onRestoreSelected,
  onDeleteSelected,
  onPreview,
  onBack,
}: ReviewScreenProps) {
  const allSelected = items.length > 0 && selection.size === items.length;

  return (
    <View style={styles.reviewContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{albumTitle}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <Text style={styles.headerButtonText}>Back to Swiping</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewToolbar}>
        <TouchableOpacity
          style={[styles.toolbarButton, allSelected ? styles.toolbarButtonActive : null]}
          onPress={onSelectAll}
        >
          <Text style={[styles.toolbarText, allSelected ? styles.toolbarTextActive : null]}>
            Select All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onClearSelection}>
          <Text style={styles.toolbarText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onRestoreSelected}>
          <Text style={styles.toolbarText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDeleteSelected}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No photos queued</Text>
          <Text style={styles.emptyBody}>Swipe left to add photos here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const selected = selection.has(item.id);
            return (
              <Pressable
                onPress={() => onPreview(item.uri)}
                onLongPress={() => onToggleSelection(item.id)}
                delayLongPress={200}
                style={styles.reviewItem}
              >
                <Image source={{ uri: item.uri }} style={styles.reviewImage} />
                {selected ? <View style={styles.reviewSelected} /> : null}
              </Pressable>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Image source={require('../../assets/flicklogo.png')} style={styles.footerLogo} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewContainer: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#111',
    fontSize: 18,
    fontFamily: 'Chopsticks',
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
  reviewToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toolbarButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2e2f33',
    backgroundColor: '#f7f5f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    color: '#2e2f33',
    fontSize: 14,
    fontFamily: 'Chopsticks',
  },
  deleteButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff3b30',
    backgroundColor: '#ffecec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 14,
    fontFamily: 'Chopsticks',
  },
  grid: {
    paddingTop: 6,
  },
  reviewItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 6,
  },
  reviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#c9c9c9',
    borderWidth: 1.5,
    borderColor: '#2e2f33',
  },
  reviewSelected: {
    position: 'absolute',
    inset: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e6fff',
    backgroundColor: 'rgba(30,111,255,0.28)',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyTitle: {
    color: '#111',
    fontSize: 22,
    fontFamily: 'Chopsticks',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#4d4f57',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Chopsticks',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 18,
  },
  footerLogo: {
    width: 82,
    height: 82,
  },
});
