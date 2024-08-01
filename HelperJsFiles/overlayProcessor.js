import { captureRef } from 'react-native-view-shot';
import * as ImageManipulator from 'expo-image-manipulator';

// This function applies an overlay to an image
export async function applyOverlay(photoUri) {
  try {
    // Capture the reference view as an image
    const overlayUri = await captureRef(photoUri, {
      result: 'tmpfile',
      height: 1080, // Adjust these values as needed
      width: 1920,
      quality: 0.7,
      format: 'jpg',
    });

    // Apply overlay logic - this assumes you have an overlay image in your assets
    const overlayImageUri = require("../assets/landscape-overlay.png")// Change this to the path of your overlay image

    const { uri: overlayAppliedUri } = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ overlay: { uri: overlayUri } }], // Apply the overlay to the photo
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return overlayAppliedUri;

  } catch (error) {
    console.error("Error applying overlay:", error);
    throw error;
  }
}
