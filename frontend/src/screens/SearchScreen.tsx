import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { placesApi, PlaceSuggestion } from '../api/places';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { BlurView } from 'expo-blur';

export default function SearchScreen() {
  const [searchParams, setSearchParams] = useState({
    origin: null as any,
    destination: null as any,
    date: new Date(),
  });
  const [focusedInput, setFocusedInput] = useState<'origin' | 'destination' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [, setLocationPermission] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceSuggestion[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Request location permissions and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        try {
          let location = await Location.getCurrentPositionAsync({});
          const currentLoc = {
            name: 'Current Location',
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setCurrentLocation(currentLoc);
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } catch (error) {
          console.log('Error getting current location:', error);
        }
      }
    })();
  }, []);

  // Get autocomplete suggestions based on search query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 2 && focusedInput) {
        const suggestions = await placesApi.getAutocompleteSuggestions(searchQuery);
        setSearchResults(suggestions);
        setDropdownVisible(true);
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setSearchResults([]);
        setDropdownVisible(false);
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300); // Debounce API calls
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, focusedInput]);

  // Animate card on mount
  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const selectLocation = async (suggestion: PlaceSuggestion) => {
    try {
      const placeDetails = await placesApi.getPlaceDetails(suggestion.place_id);
      if (placeDetails) {
        const location = placesApi.convertToLocation(placeDetails);

        if (focusedInput === 'origin') {
          setSearchParams(prev => ({ ...prev, origin: location }));
          setMapRegion({
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else if (focusedInput === 'destination') {
          setSearchParams(prev => ({ ...prev, destination: location }));
          setMapRegion({
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
        setFocusedInput(null);
        setSearchQuery('');
        setDropdownVisible(false);
        Keyboard.dismiss();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Toast.show({
          type: 'success',
          text1: 'Location Selected',
          text2: focusedInput === 'origin' ? 'Pickup location set' : 'Drop location set',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to get location details',
      });
    }
  };

  const selectDateTime = (dateTime: Date) => {
    setSearchParams(prev => ({ ...prev, date: dateTime }));
  };

  const handleSearch = () => {
    if (!searchParams.origin) {
      Toast.show({
        type: 'error',
        text1: 'Origin Required',
        text2: 'Please select a starting location',
      });
      return;
    }

    if (!searchParams.destination) {
      Toast.show({
        type: 'error',
        text1: 'Destination Required',
        text2: 'Please select a destination',
      });
      return;
    }

    // Navigate to search results with parameters
    router.push({
      pathname: '/search-results',
      params: {
        origin: JSON.stringify(searchParams.origin),
        destination: JSON.stringify(searchParams.destination),
        date: searchParams.date.toISOString(),
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            title="Current Location"
            pinColor="#276EF1"
          />
        )}
        {searchParams.origin && (
          <Marker
            coordinate={{
              latitude: searchParams.origin.lat,
              longitude: searchParams.origin.lng,
            }}
            title="Pickup"
            pinColor="#34C759"
          />
        )}
        {searchParams.destination && (
          <Marker
            coordinate={{
              latitude: searchParams.destination.lat,
              longitude: searchParams.destination.lng,
            }}
            title="Drop"
            pinColor="#FF3B30"
          />
        )}
      </MapView>

      <Animated.View
        style={[
          styles.floatingCard,
          {
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <View style={styles.cardContent}>
            {/* Origin Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="radio-button-on" size={20} color="#34C759" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter pickup location"
                  value={focusedInput === 'origin' ? searchQuery : searchParams.origin?.name || ''}
                  onFocus={() => {
                    setFocusedInput('origin');
                    setSearchQuery(searchParams.origin?.name || '');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onChangeText={setSearchQuery}
                  onBlur={() => {
                    if (!dropdownVisible) setFocusedInput(null);
                  }}
                />
                {searchParams.origin && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchParams(prev => ({ ...prev, origin: null }));
                      if (focusedInput === 'origin') {
                        setSearchQuery('');
                        setFocusedInput(null);
                      }
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Destination Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="location" size={20} color="#FF3B30" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter destination"
                  value={focusedInput === 'destination' ? searchQuery : searchParams.destination?.name || ''}
                  onFocus={() => {
                    setFocusedInput('destination');
                    setSearchQuery(searchParams.destination?.name || '');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onChangeText={setSearchQuery}
                  onBlur={() => {
                    if (!dropdownVisible) setFocusedInput(null);
                  }}
                />
                {searchParams.destination && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchParams(prev => ({ ...prev, destination: null }));
                      if (focusedInput === 'destination') {
                        setSearchQuery('');
                        setFocusedInput(null);
                      }
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Date & Time */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setShowDatePicker(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.dateText}>
                {searchParams.date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              style={[
                styles.searchButton,
                (!searchParams.origin || !searchParams.destination) && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={!searchParams.origin || !searchParams.destination}
            >
              <Text style={styles.searchButtonText}>Find Rides</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Autocomplete Dropdown */}
      {dropdownVisible && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: dropdownAnim,
              transform: [
                {
                  translateY: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView intensity={90} style={styles.dropdownBlur}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => selectLocation(item)}
                >
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <View style={styles.dropdownItemContent}>
                    <Text style={styles.dropdownItemMain}>
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.dropdownItemSecondary}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Animated.View>
      )}

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        date={searchParams.date}
        minimumDate={new Date()}
        onConfirm={(selectedDate) => {
          selectDateTime(selectedDate);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blurContainer: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  searchButton: {
    backgroundColor: '#276EF1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    maxHeight: 300,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownBlur: {
    borderRadius: 12,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dropdownItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownItemMain: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  dropdownItemSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});