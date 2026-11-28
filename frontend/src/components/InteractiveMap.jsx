import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';

const PIN_HTML = `
  <div style="position: relative; width: 38px; height: 46px; display: flex; flex-direction: column; align-items: center; cursor: grab;">
    <div style="background: linear-gradient(135deg, #e11d48, #be123c); color: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(190, 18, 60, 0.45); border: 2.5px solid white; margin-top: 2px;">
      <div style="width: 11px; height: 11px; background: white; border-radius: 50%;"></div>
    </div>
    <div style="width: 12px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px); margin-top: 3px;"></div>
  </div>
`;

const customPinIcon = L.divIcon({
  className: '!border-0 !bg-transparent',
  html: PIN_HTML,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
});

export default function InteractiveMap({ lat, lng, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);

  // Reverse geocode para obtener calle y localidad
  const reverseGeocode = async (newLat, newLng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.neighbourhood || '';
        const houseNumber = data.address.house_number || '';
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || 'Mendoza';
        const postcode = data.address.postcode || '';
        onLocationChange({
          lat: newLat,
          lng: newLng,
          street: road,
          number: houseNumber,
          city: city,
          postalCode: postcode,
          fromMap: true,
        });
      } else {
        onLocationChange({ lat: newLat, lng: newLng, fromMap: true });
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode error:', e);
      onLocationChange({ lat: newLat, lng: newLng, fromMap: true });
    }
  };

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = lat || -32.92588;
    const initialLng = lng || -68.84568;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Capa de tiles CARTO Voyager (calles nítidas, en español, sin bloqueos de dominio ni cuotas)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: customPinIcon,
      draggable: true,
      title: 'Arrastra este pin a tu ubicación de entrega',
    }).addTo(map);

    // Evento al arrastrar el pin
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    // Evento al hacer clic en cualquier parte del mapa
    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      reverseGeocode(clickLat, clickLng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Asegurar redimensionamiento fluido
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Actualizar marcador y vista si cambian lat/lng externamente (ej: botón GPS)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lng) {
      const currentPos = markerRef.current.getLatLng();
      const dist = Math.hypot(currentPos.lat - lat, currentPos.lng - lng);
      // Solo actualizar si hay un cambio apreciable (> 5 metros aprox)
      if (dist > 0.00005) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      }
    }
  }, [lat, lng]);

  // Búsqueda rápida de dirección en el mapa
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchFeedback(null);

    try {
      // Agregar contexto de Argentina/Mendoza si no está incluido
      let query = searchQuery.trim();
      if (!query.toLowerCase().includes('argentina')) {
        query += ', Mendoza, Argentina';
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      const results = await res.json();

      if (results && results.length > 0) {
        const item = results[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          mapInstanceRef.current.flyTo([newLat, newLng], 17, { duration: 1.2 });
        }

        const road = item.address.road || item.address.pedestrian || item.address.neighbourhood || searchQuery;
        const houseNumber = item.address.house_number || '';
        const city = item.address.city || item.address.town || item.address.village || item.address.suburb || 'Mendoza';
        const postcode = item.address.postcode || '';

        onLocationChange({
          lat: newLat,
          lng: newLng,
          street: road,
          number: houseNumber,
          city: city,
          postalCode: postcode,
          fromMap: true,
        });

        setSearchFeedback({ type: 'success', text: `Ubicado: ${item.display_name.split(',').slice(0, 3).join(',')}` });
      } else {
        setSearchFeedback({ type: 'error', text: 'No se encontró la dirección exacta. Puedes buscar otra o mover el pin en el mapa.' });
      }
    } catch (err) {
      console.error(err);
      setSearchFeedback({ type: 'error', text: 'Error al buscar dirección. Mueve el pin en el mapa.' });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Barra de búsqueda interactiva sobre el mapa */}
      <form onSubmit={handleSearchAddress} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar calle, barrio o lugar en el mapa (ej: San Martín 1500, Mendoza)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all shadow-xs"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
        >
          {searching ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span>Buscar</span>
          )}
        </button>
      </form>

      {searchFeedback && (
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
            searchFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {searchFeedback.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span className="truncate">{searchFeedback.text}</span>
        </div>
      )}

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100 z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Guía visual flotante */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none z-[1000]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>📍 <strong>Haz clic o arrastra el pin rojo</strong> en el mapa para fijar tu entrega</span>
        </div>
      </div>
    </div>
  );
}
