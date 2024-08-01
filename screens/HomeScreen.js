import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';

const MyComponent = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();

    const intervalId = setInterval(async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }, 7000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location.coords);
  }

  return (
    <View>
      <Text>Current Location: {text}</Text>
    </View>
  );
};

export default MyComponent;
