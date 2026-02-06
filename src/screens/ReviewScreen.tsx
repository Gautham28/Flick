import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { ReviewItem } from '../types';

export type ReviewScreenProps = {
  items: ReviewItem[];
  selection: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onPreview: (uri: string) => void;
};

export default function ReviewScreen({
  items,
  selection,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onRestoreSelected,
  onDeleteSelected,
  onPreview,
}: ReviewScreenProps) {
  return (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewToolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={onSelectAll}>
          <Text style={styles.toolbarText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onClearSelection}>
          <Text style={styles.toolbarText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={onRestoreSelected}>
          <Text style={styles.toolbarText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolbarButton, styles.deleteButton]} onPress={onDeleteSelected}>
          <Text style={[styles.toolbarText, styles.deleteText]}>Delete</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
