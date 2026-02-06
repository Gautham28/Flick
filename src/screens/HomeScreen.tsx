import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

export type HomeScreenProps = {
  onChooseAlbum: () => void;
};

export default function HomeScreen({ onChooseAlbum }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.homeContainer}>
      <ExpoStatusBar style="dark" />
      <View style={styles.homeContent}>
        <View style={styles.homeHeader}>
          <Image source={require('../../assets/flicklogo.png')} style={styles.homeLogo} resizeMode="contain" />
        </View>
        <Text style={styles.homeTitle}>Pick an album to start</Text>
        <TouchableOpacity style={styles.homeButton} onPress={onChooseAlbum}>
          <Text style={styles.homeButtonText}>Choose Album</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/home-image.png')} style={styles.homeHero} resizeMode="contain" />
      </View>
      <Text style={styles.homeFooter}>CREATED BY GAUTHAM</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  homeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 80,
    paddingBottom: 80,
  },
  homeHeader: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeLogo: {
    width: 82,
    height: 82,
  },
  homeTitle: {
    fontFamily: 'Chopsticks',
    fontSize: 30,
    color: '#111',
    marginBottom: 22,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#2e2f33',
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontFamily: 'Chopsticks',
    fontSize: 22,
  },
  homeHero: {
    width: '82%',
    height: 220,
    marginTop: 16,
  },
  homeFooter: {
    fontFamily: 'Chopsticks',
    fontSize: 12,
    color: '#111',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingBottom: 18,
  },
});
