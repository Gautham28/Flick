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
          <Text style={styles.modalTitle}>Choose an Album</Text>
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
