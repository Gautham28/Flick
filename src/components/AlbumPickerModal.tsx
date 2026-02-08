import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export type AlbumPickerModalProps = {
  visible: boolean;
  albums: MediaLibrary.Album[];
  onSelect: (album: MediaLibrary.Album) => void;
  onClose: () => void;
};

export default function AlbumPickerModal({ visible, albums, onSelect, onClose }: AlbumPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>CHOOSE AN ALBUM</Text>
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            style={styles.albumList}
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={styles.albumRow}>
                <Text style={styles.albumName}>{item.title}</Text>
                <Text style={styles.albumCount}>{item.assetCount} photos</Text>
              </Pressable>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '78%',
    borderWidth: 2,
    borderColor: '#2e2f33',
  },
  modalTitle: {
    color: '#111',
    fontSize: 24,
    fontFamily: 'Chopsticks',
    marginBottom: 16,
  },
  albumList: {
    marginBottom: 16,
  },
  albumRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2e2f33',
    marginBottom: 12,
  },
  albumName: {
    color: '#111',
    fontSize: 20,
    fontFamily: 'Chopsticks',
    marginBottom: 6,
  },
  albumCount: {
    color: '#111',
    fontSize: 14,
  },
  modalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  modalCloseText: {
    color: '#e53935',
    fontFamily: 'Chopsticks',
    fontSize: 22,
  },
});
