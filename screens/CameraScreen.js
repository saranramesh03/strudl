import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, TouchableOpacity, View, Text, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { applyOverlay } from '../HelperJsFiles/overlayProcessor';
import { useIsFocused } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator'; // Import ImageManipulator


export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const isFocused = useIsFocused()



  async function takePicture() {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        exif: true,
        skipProcessing: true,
      };


      const photo = await cameraRef.current.takePictureAsync(options);

      console.log(photo);

      const resize = photo.height > photo.width
        ? { width: 1080, height: 1920 }
        : { width: 1920, height: 1080 };

      // Resize the photo
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log(resizedPhoto);

      //const processedPhoto = await applyOverlay(resizedPhoto.uri);
      navigation.navigate('PhotoConfirmation', { photoUri: resizedPhoto.uri });
    }
  }

  const handleClose = () => {
    navigation.navigate('Map');
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
        ratio = "16:9"
      />
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePicture} 
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  flashButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});