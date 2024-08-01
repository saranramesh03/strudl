import React, { useRef, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Button, SafeAreaView, Linking, Platform, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { StatusBar } from 'expo-status-bar';

import styles from '../HelperJsFiles/styles';
import useLocation from '../HelperJsFiles/locationPerms';
import ShroudContainer from '../HelperJsFiles/shroud.js';

import viennaStorage from '../HelperJsFiles/viennaStorage';
import { vienna } from '../HelperJsFiles/city';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import refreshIfFocused from '../HelperJsFiles/screenRerender';
import { getCompletedLandmarks } from '../HelperJsFiles/completedLandmarks';
import locations from '../HelperJsonFiles/quests.json';
import * as Location from 'expo-location'; // Included from file1

const GOOGLE_MAPS_APIKEY = 'INSERT-API-KEY-HERE'

export const MAP_SCREEN_ID = "MapScreen";

export function MapScreen() {
  const [myLocation, setMyLocation] = useState(null); // Use the approach from file1 for myLocation initialization
  const [initialRegion, setInitialRegion] = useState(null);
  const [zoomLevel, setZoomLevel] = useState({ latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
  const isFocused = useIsFocused();
  const [forceRenderValue, forceRenderFunction] = useState(0);
  const [directions, setDirectionsState] = useState(null);
  const [location, setLocation] = useState(null); // State from file1 for location
  const [errorMsg, setErrorMsg] = useState(null); // State from file1 for errorMsg
  const [completedLandmarks, setCompletedLandmarks] = useState({});
  const [showLandmarkDialog, setShowLandmarkDialog] = useState(false);
  const [landmark, setLandmark] = useState(null);

  const navigation = useNavigation();
  const mapViewRef = useRef(null);
  const shroudContainerRef = useRef(null); // ShroudContainer ref

  const forceRender = () => {
    if (forceRenderValue + 1 === Number.MAX_VALUE) {
      forceRenderValue = 0;
    }
    forceRenderFunction(forceRenderValue + 1);
  };

  refreshIfFocused(isFocused, MAP_SCREEN_ID, forceRender);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setMyLocation(loc.coords);
      setLocation(loc.coords);
    })();
    const intervalId = setInterval(async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setMyLocation(loc.coords);
      setLocation(loc.coords);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (myLocation && myLocation.latitude && myLocation.longitude) {
      updateDirections(myLocation, { latitude: 48.2081743, longitude: 16.3738189 });
    }

    const fetchCompletedLandmarks = async () => {
      const completed = await getCompletedLandmarks();
      setCompletedLandmarks(completed);
    };
    fetchCompletedLandmarks();
  }, [myLocation]);

  useEffect(() => {
    if (location && mapViewRef.current) {
      if (!initialRegion) {
        // Save initial region and zoom level
        setInitialRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
      // Animate to current location with saved zoom level
 } );

  const updateDirections = (origin, destination) => {
    if (origin.latitude && origin.longitude) {
      setDirectionsState({
        origin: { latitude: origin.latitude, longitude: origin.longitude },
        destination: { latitude: destination.latitude, longitude: destination.longitude },
      });
    }
  };

  const openDirections = (destination) => {
    if (Platform.OS === 'ios') {
      const url = `http://maps.apple.com/?saddr=${location.latitude},${location.longitude}&daddr=${destination.latitude},${destination.longitude}`;
      Linking.openURL(url);
    } else {
      Linking.openURL(`google.navigation:q=${destination.latitude},${destination.longitude}`);
    }
  };

  const handleRegionChangeComplete = (newRegion) => {
    // Save zoom level when region changes
    //setZoomLevel({ latitudeDelta: newRegion.latitudeDelta, longitudeDelta: newRegion.longitudeDelta });
  };

  const handleMarkerPress = (location) => {
    setLandmark(location);

    if (myLocation.latitude && myLocation.longitude) {
      updateDirections(myLocation, { latitude: location.latitude, longitude: location.longitude });
    } else {
      console.error('Current location is not available');
    }
  };

  // Renderer for the callout pop-up
  const renderCallout = (location) => (
    <Callout onPress={() => setShowLandmarkDialog(true)}>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{location.questName}</Text>
        <Text style={styles.calloutDescription}>{location.questDescription}</Text>
        <Button 
          title="Open Landmark" 
          onPress={() => setShowLandmarkDialog(true)}
          style={styles.calloutButton}
        />
      </View>
    </Callout>
  );

  // Renders the dialog for a landmark dialog
  const renderLandmarkDialog = () => 
    (<View style={styles.landmarkDialog}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setShowLandmarkDialog(false)}>
        <Text>X</Text>
      </TouchableOpacity>
      <Text style={styles.landmarkTitle}>
        {completedLandmarks[landmark.questName] ? '✅ ' : '❌ '}
        {landmark.questName}
      </Text>
      <Image 
        source={landmark.image ? {uri: landmark.image} : require('../assets/images/placeholder.jpg')}
        style={styles.landmarkImage}
      />
      <Text>{calculateDistance(myLocation, landmark)}km from your location</Text>
      <View style={styles.objectivesContainer}>
        <Text style={styles.objectivesTitle}>Objectives</Text>
        <Text>{landmark.questDescription}</Text>
      </View>
      {completedLandmarks[landmark.questName] ? (
        <View style={styles.completedBox}>
          <Text>Your Postcard has been saved to your photo album</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.landmarkButton} 
          onPress={() => navigation.navigate('Camera', { landmarkTitle: landmark.questName })}
        >
          <Text
          style={styles.headerText}
          >Take Postcard</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.landmarkButton} onPress={() => openDirections(landmark)}>
        <Text>Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );

  // Calculates the distance to the location
  const calculateDistance = (location1, location2) => {
    const toRadians = (degree) => degree * (Math.PI / 180);

    const lat1 = toRadians(location1.latitude);
    const lon1 = toRadians(location1.longitude);
    const lat2 = toRadians(location2.latitude);
    const lon2 = toRadians(location2.longitude);
  
    const R = 6371; 
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
    return distance.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
   
       // onRegionChangeComplete={handleRegionChangeComplete}
        ref={mapViewRef}
      >
        {myLocation && (
          <Marker
            coordinate={myLocation}
            title="You are here"
            description="This is your current location"
            pinColor="blue"
          />
        )}
        {locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={location.questName}
            description={location.questDescription}
            onPress={() => handleMarkerPress(location)}
          >
            <Image
      source={require('../assets/landmark.png')} 
      style={{
        position: 'absolute',
        top: -25, // Adjust vertical offset based on image size
        left: -12, // Adjust horizontal offset based on image size
        width: 35,
        height: 35,
      }}
    />
            {renderCallout(location)}
          </Marker>
        ))}
        {directions && (
          <MapViewDirections
            origin={directions.origin}
            destination={directions.destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="hotpink"
          />
        )}
        <ShroudContainer ref={shroudContainerRef} />
      </MapView>
      {landmark && showLandmarkDialog && renderLandmarkDialog()}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default MapScreen;
