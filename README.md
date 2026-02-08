# Flick

Flick is a Tinder‑style photo cleanup app built with React Native + Expo. Swipe right to keep photos, swipe left to queue them for deletion, then bulk delete in a review screen. The goal is to make gallery cleanup fast, safe, and satisfying.

## Features
- Album picker (choose which album to clean)
- Swipe deck: right = keep, left = delete (queues for review)
- Review screen with bulk select, restore, and delete
- Tap a photo to view it full screen
- Undo last swipe (tap the Flick logo on swipe screen)
- Custom branding (Chopsticks font, logo, splash)
- EAS Insights (optional analytics for cold starts)

## Tech Stack
- Expo SDK 54
- React Native
- TypeScript
- expo-media-library
- expo-insights

## Project Structure
```
src/
  components/
    AlbumPickerModal.tsx
  screens/
    HomeScreen.tsx
    SwipeScreen.tsx
    ReviewScreen.tsx
  types.ts
```



## Notes
- Android permissions are required for media library access.
- Expo Go cannot provide full media access; use a dev build or production build for full delete support.
- Icon/splash changes require a rebuild to take effect.

## Credits
Created by Gautham.
