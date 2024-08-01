import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export default function PhotoConfirmationScreen({ route, navigation }) {
  const { photoUri} = route.params;
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(4/3);
  
  useEffect(() => {
    Image.getSize(photoUri, (width, height) => {
      setImageAspectRatio(width / height);
    });
  }, [photoUri]);
  
  useEffect(() => {
    if (permissionResponse?.granted) {
      setPermissionGranted(true);
    } else if (permissionResponse === null) {
      requestPermission();
    }
  }, [permissionResponse]);

  useEffect(() => {
    if (permissionResponse && !permissionResponse.granted) {
      Alert.alert(
        'Permission Required',
        'We need your permission to access photos',
        [{ text: 'Grant Permission', onPress: requestPermission }]
      );
    }
  }, [permissionResponse]);

  const handleConfirm = async () => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
      navigation.navigate('Map');
      setTimeout(() => {
        navigation.pop();
      }, 100);
    } catch (error) {
      console.error('Error saving photo or marking landmark as completed:', error);
      Alert.alert('Error', 'Failed to save the photo or mark the landmark as completed. Please try again.');
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  if (!permissionResponse) {
    return <View style={styles.container} />;
  }

  

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const containerWidth = screenWidth * 0.8;
  const containerHeight = screenHeight * 0.8;
  
  let imageWidth, imageHeight;
  
  {
    imageHeight = containerHeight * 0.6;
    imageWidth = imageHeight * imageAspectRatio;
    if (imageWidth > containerWidth * 0.9) {
      imageWidth = containerWidth * 0.9;
      imageHeight = imageWidth / imageAspectRatio;
    }
  }
  
  const imageStyle = {
    width: imageWidth,
    height: imageHeight,
  };


  return (
    <View style={styles.container}>
      <View style={styles.postcardContainer}>
        <Text style={styles.title}>Your Postcard</Text>
        <Text style={styles.subtitle}>Confirmation</Text>
        <Text style={styles.instruction}>
          Pick a good photo, once the postcard is set, it can't be changed.
        </Text>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoUri }}
            style={[styles.image, imageStyle]}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={!permissionGranted}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postcardContainer: {
    backgroundColor: '#FF6B6B',
    width: '110%',
    height: '110%',
    borderRadius: 20,
    padding: 20,
    zIndex: 1,

    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    bottom: -30
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    bottom:5
  },
  instruction: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    bottom: -30
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    top : -40
  },
  retakeButton: {
    backgroundColor: '#DDDDDD',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
    top:-30
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});