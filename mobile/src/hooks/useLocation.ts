import { useState } from 'react';

import * as Location from 'expo-location';

export const useLocation = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const getLocation = async () => {
        // 1. Request permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Location permission denied');
            return;
        }

        try {
            // 2. Get current position
            const location = await Location.getCurrentPositionAsync({});

            // 3. Reverse geocode to get address
            const addresses = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addresses.length > 0) {
                const addr = addresses[0];
                // Format address components
                const area = [
                    addr.street,
                    addr.city,
                    addr.region,
                    addr.postalCode
                ].filter(Boolean).join(', ');

                setAddress(area);
            }
        } catch (error) {
            setErrorMsg('Failed to get location or address');
            console.error(error);
        }
    };
    return {
        getLocation,
        address,
        errorMsg
    }

}