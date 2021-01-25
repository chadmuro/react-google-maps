import React, { useState, useCallback, useRef } from 'react';
import {
	GoogleMap,
	useLoadScript,
	Marker,
	InfoWindow,
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	ComboboxList,
	ComboboxOption,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import { mapStyles } from './mapStyles';
import usePlacesAutocomplete from 'use-places-autocomplete';

const libraries = ['places'];
const mapContainerStyle = {
	width: '100vw',
	height: '100vh',
};
const center = {
	lat: 35.689487,
	lng: 139.691711,
};
const options = {
	styles: mapStyles,
	disableDefaultUI: true,
	zoomControl: true,
};

function App() {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries: libraries,
	});
	const [markers, setMarkers] = useState([]);
	const [selected, setSelected] = useState(null);

	const onMapClick = useCallback(e => {
		setMarkers(current => [
			...current,
			{
				lat: e.latLng.lat(),
				lng: e.latLng.lng(),
				time: new Date(),
			},
		]);
	}, []);

	const mapRef = useRef();
	const onMapLoad = useCallback(map => {
		mapRef.current = map;
	}, []);

	if (loadError) return 'Error loading maps';
	if (!isLoaded) return 'Loading Maps';

	return (
		<div className="App">
			<Search />

			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				zoom={8}
				center={center}
				options={options}
				onClick={onMapClick}
				onLoad={onMapLoad}
			>
				{markers.map(marker => (
					<Marker
						key={marker.time.toISOString()}
						position={{ lat: marker.lat, lng: marker.lng }}
						icon={{
							url: '/dog.svg',
							scaledSize: new window.google.maps.Size(30, 30),
							origin: new window.google.maps.Point(0, 0),
							anchor: new window.google.maps.Point(15, 15),
						}}
						onClick={() => setSelected(marker)}
					/>
				))}

				{selected ? (
					<InfoWindow
						position={{ lat: selected.lat, lng: selected.lng }}
						onCloseClick={() => setSelected(null)}
					>
						<div>
							<h2>Dog Run</h2>
							<p>Time {formatRelative(selected.time, new Date())}</p>
						</div>
					</InfoWindow>
				) : null}
			</GoogleMap>
		</div>
	);
}

export default App;

function Search() {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			location: { lat: () => 35.689487, lng: () => 139.691711 },
			radius: 200 * 1000,
		},
	});

	return (
		<Combobox
			onSelect={address => {
				console.log(address);
			}}
		>
			<ComboboxInput value={value} onChange={e => setValue(e.target.value)} disabled={!ready} placeholder="Enter an address" />
		</Combobox>
	);
}
