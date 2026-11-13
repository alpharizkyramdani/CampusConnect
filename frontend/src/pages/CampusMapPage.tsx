import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  MapPin,
  Building2,
  Search,
  Plus,
  Navigation,
  Clock,
  Phone,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  Trash2,
  Pencil,
  Eye,
  ExternalLink,
  Route,
  Share2,
  LocateFixed,
  ArrowRight,
  Footprints,
  Map as MapIcon,
  Globe,
  Mountain,
  Satellite,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Car,
  Bike,
  Star,
  Info,
  ShieldCheck,
  Check,
  Copy,
  Radio,
  CornerUpRight,
  RefreshCw,
  Crosshair,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CampusLocationItem {
  id: number;
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  floor_count: number;
  facilities_available: string[] | null;
  opening_hours: string | null;
  contact_phone: string | null;
}

export const CampusMapPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const isAdmin = activeRole === 'super_admin' || activeRole === 'campus_admin';

  const [locations, setLocations] = useState<CampusLocationItem[]>([]);
  const [universityInfo, setUniversityInfo] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocationItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Map Mode: Google Roadmap, Google Satellite Hybrid, Google Terrain, Google Traffic
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite' | 'terrain' | 'traffic'>('roadmap');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapCardRef = useRef<HTMLDivElement>(null);

  // Wayfinding / Campus Route Navigation State
  const [routeOriginId, setRouteOriginId] = useState<string>(''); // location id or 'gps'
  const [routeDestinationId, setRouteDestinationId] = useState<string>('');
  const [routeActive, setRouteActive] = useState(false);
  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(null);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState<number | null>(null);
  const [travelMode, setTravelMode] = useState<'walk' | 'motorcycle' | 'car'>('walk');
  const [userGpsCoords, setUserGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showDirectionsSheet, setShowDirectionsSheet] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add / Edit Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingLocId, setEditingLocId] = useState<number | null>(null);
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] = useState('faculty');
  const [locDescription, setLocDescription] = useState('');
  const [locLat, setLocLat] = useState('5.1207');
  const [locLng, setLocLng] = useState('97.1575');
  const [locPhoto, setLocPhoto] = useState('');
  const [locFloor, setLocFloor] = useState(2);
  const [locHours, setLocHours] = useState('07:30 - 16:30');
  const [locPhone, setLocPhone] = useState('+62 645 42670');
  const [submitting, setSubmitting] = useState(false);

  // Interactive Pin Drop / Location Picker Mode on Main Map
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const tempPickMarkerRef = useRef<L.Marker | null>(null);

  // Map DOM & Leaflet References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeCasingPolylineRef = useRef<L.Polyline | null>(null);
  const routePointMarkersRef = useRef<L.Marker[]>([]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campus-map/locations', {
        params: {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setLocations(res.data.data || []);
        setUniversityInfo(res.data.university);
        if (res.data.data?.length > 0 && !selectedLocation) {
          setSelectedLocation(res.data.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load campus locations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedCategory, search]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapCardRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Initialize Leaflet Map Instance with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: L.LatLngExpression = [5.1207, 97.1568]; // PNL Campus Center
      const map = L.map(mapContainerRef.current, {
        zoomControl: false, // We use custom Google Maps styled zoom controls
        attributionControl: false,
      }).setView(defaultCenter, 17);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layer
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    // Apply Google Maps Tile Layer based on mapMode
    let tileUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Default Google Roadmap with full street names

    if (mapMode === 'satellite') {
      // Google Satellite Hybrid: High-res aerial satellite photography + clear road names, building labels
      tileUrl = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    } else if (mapMode === 'terrain') {
      // Google Terrain: Shaded relief + topography + road labels
      tileUrl = 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    } else if (mapMode === 'traffic') {
      // Google Live Traffic: Real-time traffic flow colors on roads
      tileUrl = 'https://{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}';
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    // Invalidate size to ensure crisp tile rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [mapMode]);

  // Helper for Category Google Maps Icon & Color
  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'administration':
        return {
          color: '#1A73E8', // Google Blue
          label: 'Administrasi / Rektorat',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
        };
      case 'faculty':
      case 'department':
        return {
          color: '#3B82F6', // Royal Blue
          label: 'Fakultas & Ruang Kuliah',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
        };
      case 'laboratory':
        return {
          color: '#7C3AED', // Purple
          label: 'Laboratorium & Riset',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>`,
        };
      case 'library':
        return {
          color: '#0284C7', // Sky Blue
          label: 'Perpustakaan',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
        };
      case 'auditorium':
        return {
          color: '#E11D48', // Ruby Pink
          label: 'Auditorium & Aula',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        };
      case 'mosque':
        return {
          color: '#0D9488', // Teal
          label: 'Ibadah / Masjid',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3"/><path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4Z"/><path d="M4 14v6h16v-6"/><path d="M6 10a2 2 0 0 0-2 2v8"/><path d="M18 10a2 2 0 0 1 2 2v8"/></svg>`,
        };
      case 'canteen':
        return {
          color: '#EA580C', // Amber Orange
          label: 'Kantin & Kuliner',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2v4a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2"/><path d="M8 9v13"/></svg>`,
        };
      case 'sports':
        return {
          color: '#16A34A', // Green
          label: 'Fasilitas Olahraga',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`,
        };
      case 'facility':
      default:
        return {
          color: '#475569', // Slate
          label: 'Asrama & Fasilitas Umum',
          iconSvg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        };
    }
  };

  // Update Markers: Exact Google Maps POI Styling with Floating Name Labels
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add marker for each campus location
    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const config = getCategoryConfig(loc.category);

      // Google Maps style POI Marker with Icon Pin + Permanent White Label Pill
      const markerHtml = `
        <div class="gmaps-poi-wrapper ${isSelected ? 'gmaps-poi-selected' : ''}" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: translate(-50%, -100%);
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.28));
        ">
          <!-- Circular Pin Icon -->
          <div style="
            background: ${isSelected ? '#1A73E8' : config.color};
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 2px solid #FFFFFF;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 0 4px rgba(26,115,232,0.35);' : ''}
          ">
            ${config.iconSvg}
          </div>

          <!-- Teardrop Stem Pointer -->
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid ${isSelected ? '#1A73E8' : config.color};
            margin-top: -1px;
          "></div>

          <!-- Google Maps Style Permanent White Pill Label -->
          <div style="
            margin-top: 2px;
            background: ${isSelected ? '#1A73E8' : 'rgba(255, 255, 255, 0.96)'};
            color: ${isSelected ? '#FFFFFF' : '#1E293B'};
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 9999px;
            box-shadow: 0 1px 4px rgba(60,64,67,0.3), 0 3px 6px rgba(60,64,67,0.15);
            border: 1px solid ${isSelected ? '#1A73E8' : 'rgba(218,220,224,0.9)'};
            white-space: nowrap;
            max-width: 145px;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.25;
            text-align: center;
            letter-spacing: -0.01em;
            transition: all 0.2s ease;
          ">
            ${loc.name}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'gmaps-poi-leaflet-icon',
        html: markerHtml,
        iconSize: [145, 60],
        iconAnchor: [72, 33],
        popupAnchor: [0, -35],
      });

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: markerIcon,
      }).addTo(map);

      // Google Maps Info Window Popup
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 220px; padding: 4px;">
          <div style="position: relative; height: 100px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #E2E8F0;">
            <img src="${loc.photo_url || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80'}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; bottom: 4px; left: 4px; background: rgba(15,23,42,0.8); color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">${config.label}</span>
          </div>
          <strong style="color: #0F172A; font-size: 13px; display: block; line-height: 1.3;">${loc.name}</strong>
          <div style="display: flex; align-items: center; gap: 4px; margin: 4px 0; color: #D97706; font-size: 11px; font-weight: bold;">
            <span>★ 4.8</span>
            <span style="color: #64748B; font-weight: normal;">• ${loc.floor_count} Lantai</span>
            <span style="color: #059669;">• Buka</span>
          </div>
          <p style="margin: 4px 0 8px 0; color: #475569; font-size: 11px; line-height: 1.4;">${loc.description?.slice(0, 90) || ''}...</p>
          <div style="display: flex; gap: 6px; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}&travelmode=walking" target="_blank" rel="noreferrer" style="flex: 1; text-align: center; background: #1A73E8; color: white; padding: 5px 8px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 11px;">🧭 Buka di Google Maps</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        handleSelectLocation(loc);
      });

      markersRef.current.push(marker);
    });

    if (selectedLocation && !routeActive) {
      map.panTo([selectedLocation.latitude, selectedLocation.longitude], { animate: true });
    }
  }, [locations, selectedLocation, routeActive]);

  const handleSelectLocation = (loc: CampusLocationItem) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 18, { duration: 0.9 });
    }
  };

  // Haversine distance calculator in meters
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const rad = (d: number) => (d * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Calculate & Draw Route between Campus Buildings or GPS with Google Blue Route styling
  const handleCalculateRoute = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    let startCoord: { lat: number; lng: number; label: string } | null = null;
    let endCoord: { lat: number; lng: number; label: string } | null = null;

    if (routeOriginId === 'gps') {
      if (!userGpsCoords) {
        alert('Lokasi GPS belum terdeteksi. Silakan klik tombol "Lokasi Saya" terlebih dahulu.');
        return;
      }
      startCoord = { lat: userGpsCoords.lat, lng: userGpsCoords.lng, label: 'Lokasi Anda (GPS)' };
    } else {
      const startLoc = locations.find((l) => l.id.toString() === routeOriginId);
      if (startLoc) {
        startCoord = { lat: startLoc.latitude, lng: startLoc.longitude, label: startLoc.name };
      }
    }

    const endLoc = locations.find((l) => l.id.toString() === routeDestinationId);
    if (endLoc) {
      endCoord = { lat: endLoc.latitude, lng: endLoc.longitude, label: endLoc.name };
    }

    if (!startCoord || !endCoord) {
      alert('Pilih titik keberangkatan dan tujuan terlebih dahulu.');
      return;
    }

    // Clear previous route
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (routeCasingPolylineRef.current) {
      routeCasingPolylineRef.current.remove();
      routeCasingPolylineRef.current = null;
    }
    routePointMarkersRef.current.forEach((m) => m.remove());
    routePointMarkersRef.current = [];

    // Calculate distance & estimated duration based on travelMode
    const meters = calculateDistanceMeters(startCoord.lat, startCoord.lng, endCoord.lat, endCoord.lng);
    let speedMetersPerMin = 75; // walk (~4.5 km/h)
    if (travelMode === 'motorcycle') speedMetersPerMin = 350; // ~21 km/h campus speed
    if (travelMode === 'car') speedMetersPerMin = 400; // ~24 km/h

    const durationMin = Math.max(1, Math.round(meters / speedMetersPerMin));
    setRouteDistanceMeters(meters);
    setRouteDurationMinutes(durationMin);
    setRouteActive(true);
    setShowDirectionsSheet(true);

    // Route coordinates
    const latLngs: [number, number][] = [
      [startCoord.lat, startCoord.lng],
      [endCoord.lat, endCoord.lng],
    ];

    // 1. White border casing for Google Maps route line
    const casingPolyline = L.polyline(latLngs, {
      color: '#FFFFFF',
      weight: 10,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routeCasingPolylineRef.current = casingPolyline;

    // 2. Google Maps Royal Blue primary route polyline
    const primaryPolyline = L.polyline(latLngs, {
      color: '#1A73E8', // Official Google Maps Route Blue
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routePolylineRef.current = primaryPolyline;

    // Start Pin (Google Maps Green Origin Marker A)
    const startPin = L.marker([startCoord.lat, startCoord.lng], {
      icon: L.divIcon({
        className: 'gmaps-start-pin',
        html: `
          <div style="
            background-color: #0F9D58;
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(15,157,88,0.5);
            border: 2.5px solid white;
            font-weight: 800;
            font-size: 13px;
          ">
            A
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map).bindPopup(`<strong>Titik Asal:</strong><br/>${startCoord.label}`);
    routePointMarkersRef.current.push(startPin);

    // End Pin (Google Maps Red Destination Marker B)
    const endPin = L.marker([endCoord.lat, endCoord.lng], {
      icon: L.divIcon({
        className: 'gmaps-end-pin',
        html: `
          <div style="
            background-color: #EA4335;
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(234,67,53,0.5);
            border: 2.5px solid white;
            font-weight: 800;
            font-size: 13px;
          ">
            B
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map).bindPopup(`<strong>Tujuan:</strong><br/>${endCoord.label}`);
    routePointMarkersRef.current.push(endPin);

    // Fit map bounds smoothly
    map.fitBounds(primaryPolyline.getBounds(), { padding: [60, 60], maxZoom: 18 });
  };

  const handleClearRoute = () => {
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (routeCasingPolylineRef.current) {
      routeCasingPolylineRef.current.remove();
      routeCasingPolylineRef.current = null;
    }
    routePointMarkersRef.current.forEach((m) => m.remove());
    routePointMarkersRef.current = [];
    setRouteActive(false);
    setShowDirectionsSheet(false);
    setRouteDistanceMeters(null);
    setRouteDurationMinutes(null);
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 17);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserGpsCoords(coords);
        setRouteOriginId('gps');
        setGpsLoading(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 18, { duration: 1.2 });

          // Render live GPS pulsing blue dot
          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.remove();
          }
          userGpsMarkerRef.current = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
              className: 'gmaps-live-gps-dot',
              html: `
                <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(26,115,232,0.3); animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                  <div style="position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #1A73E8; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          }).addTo(mapInstanceRef.current).bindPopup('<strong>Lokasi Anda Saat Ini</strong>');
        }
      },
      (err) => {
        setGpsLoading(false);
        alert('Gagal mendeteksi lokasi GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStartRouteToThisBuilding = (loc: CampusLocationItem) => {
    setRouteDestinationId(loc.id.toString());
    if (!routeOriginId) {
      const firstOther = locations.find((l) => l.id !== loc.id);
      if (firstOther) {
        setRouteOriginId(firstOther.id.toString());
      }
    }
    setShowDirectionsSheet(true);
    handleCalculateRoute();
  };

  const handleSwapRoutePoints = () => {
    const temp = routeOriginId;
    setRouteOriginId(routeDestinationId);
    setRouteDestinationId(temp);
  };

  // Interactive Pin Drop Helper to place or move marker on the map
  const updatePickCoordinate = (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    setLocLat(latStr);
    setLocLng(lngStr);
    setPickedCoord({ lat, lng });

    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const customPickIcon = L.divIcon({
      className: 'gmaps-drop-pick-pin',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: grab;
          transform: translate(-50%, -100%);
          filter: drop-shadow(0 4px 14px rgba(225, 29, 72, 0.6));
        ">
          <div style="
            background: #E11D48;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.35);
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 8px solid #E11D48;
            margin-top: -1px;
          "></div>
          <div style="
            margin-top: 4px;
            background: #0F172A;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 9999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            border: 1.5px solid #FFFFFF;
          ">
            📍 Geser Pin ke Gedung
          </div>
        </div>
      `,
      iconSize: [160, 75],
      iconAnchor: [80, 44],
      popupAnchor: [0, -48],
    });

    if (tempPickMarkerRef.current) {
      tempPickMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], {
        icon: customPickIcon,
        draggable: true,
        zIndexOffset: 2500,
      }).addTo(map);

      marker.on('drag', (ev: any) => {
        const newPos = ev.target.getLatLng();
        setLocLat(newPos.lat.toFixed(6));
        setLocLng(newPos.lng.toFixed(6));
        setPickedCoord({ lat: newPos.lat, lng: newPos.lng });
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; text-align: center; padding: 4px;">
          <strong style="color: #E11D48; font-size: 13px;">📍 Titik Lokasi Gedung Baru</strong>
          <p style="margin: 4px 0; color: #475569; font-size: 11px;">
            Geser pin ini langsung ke footprint / posisi gedung di peta kampus Buketrata.
          </p>
        </div>
      `);

      tempPickMarkerRef.current = marker;
    }
  };

  // Map click listener when in Pin-Drop mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (!isPickingLocation) return;
      updatePickCoordinate(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', onMapClick);

    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isPickingLocation ? 'crosshair' : '';
    }

    return () => {
      map.off('click', onMapClick);
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = '';
      }
    };
  }, [isPickingLocation]);

  const handleStartPickOnMap = () => {
    setAddModalOpen(false);
    setIsPickingLocation(true);

    const initialLat = parseFloat(locLat) || 5.1207;
    const initialLng = parseFloat(locLng) || 97.1575;

    updatePickCoordinate(initialLat, initialLng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([initialLat, initialLng], 18, { duration: 0.8 });
    }
  };

  const handleConfirmPickedLocation = () => {
    setIsPickingLocation(false);
    setAddModalOpen(true);
  };

  const handleCancelPick = () => {
    if (tempPickMarkerRef.current) {
      tempPickMarkerRef.current.remove();
      tempPickMarkerRef.current = null;
    }
    setIsPickingLocation(false);
    setPickedCoord(null);
  };

  const handleUseCurrentGpsForModal = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocLat(lat.toFixed(6));
        setLocLng(lng.toFixed(6));
        setGpsLoading(false);
        alert(`Koordinat GPS berhasil diperoleh:\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}`);
      },
      (err) => {
        setGpsLoading(false);
        alert('Gagal mendeteksi lokasi GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        university_id: universityInfo?.id || 1,
        name: locName,
        category: locCategory,
        description: locDescription,
        latitude: parseFloat(locLat),
        longitude: parseFloat(locLng),
        photo_url: locPhoto || null,
        floor_count: locFloor,
        opening_hours: locHours,
        contact_phone: locPhone || null,
      };

      if (editingLocId) {
        await api.put(`/campus-map/locations/${editingLocId}`, payload);
        alert('Informasi lokasi berhasil diperbarui.');
      } else {
        await api.post('/campus-map/locations', payload);
        alert('Lokasi kampus baru berhasil ditambahkan.');
      }

      setAddModalOpen(false);
      setEditingLocId(null);
      if (tempPickMarkerRef.current) {
        tempPickMarkerRef.current.remove();
        tempPickMarkerRef.current = null;
      }
      setIsPickingLocation(false);
      setPickedCoord(null);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data lokasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!window.confirm('Hapus lokasi ini dari peta kampus?')) return;
    try {
      const res = await api.delete(`/campus-map/locations/${id}`);
      if (res.data.success) {
        alert('Lokasi berhasil dihapus.');
        fetchLocations();
      }
    } catch (e) {
      alert('Gagal menghapus lokasi.');
    }
  };

  const copyCoordinates = (loc: CampusLocationItem) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const selectedLocConfig = selectedLocation ? getCategoryConfig(selectedLocation.category) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-borderMuted shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-brand-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-brand-500/25 shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-navy tracking-tight">Smart Campus Google Maps</h1>
              <span className="px-2 py-0.5 bg-blue-50 text-brand-700 border border-brand-200 rounded-full text-[10px] font-bold">
                HD Vector & Satelit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Politeknik Negeri Lhokseumawe (PNL) &bull; Nama jalan jelas, rute jalan kaki antar-gedung, dan citra satelit Google.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingLocId(null);
                  setLocName('');
                  setLocCategory('faculty');
                  setLocDescription('');
                  setLocPhoto('');
                  setLocFloor(2);
                  setLocHours('07:30 - 16:30');
                  setLocPhone('+62 645 42670');
                  handleStartPickOnMap();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                title="Tentukan titik lokasi baru dengan mengklik langsung di peta"
              >
                <Crosshair className="w-4 h-4" />
                <span>Tentukan Titik di Peta</span>
              </button>

              <button
                onClick={() => {
                  setEditingLocId(null);
                  setLocName('');
                  setLocCategory('faculty');
                  setLocDescription('');
                  setLocLat('5.1207');
                  setLocLng('97.1575');
                  setLocPhoto('');
                  setLocFloor(2);
                  setLocHours('07:30 - 16:30');
                  setLocPhone('+62 645 42670');
                  setAddModalOpen(true);
                }}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Gedung</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Map & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive Map Area (8 Cols) */}
        <div
          ref={mapCardRef}
          className={`lg:col-span-8 bg-white rounded-3xl border border-borderMuted shadow-xs overflow-hidden flex flex-col relative transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[640px]'
          }`}
        >
          {/* Interactive Pin-Drop Guidance Banner when isPickingLocation is true */}
          {isPickingLocation && (
            <div className="absolute top-3 left-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border-2 border-rose-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/40">
                  <Crosshair className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">Mode Tentukan Titik Gedung di Peta</span>
                    <span className="px-2 py-0.5 bg-rose-500/30 text-rose-300 border border-rose-400/40 rounded-full text-[10px] font-bold">
                      Klik / Geser Pin
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    <strong>Klik di mana saja pada peta</strong> kampus atau <strong>geser pin merah</strong> untuk menentukan lokasi gedung dengan presisi.
                  </p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-amber-300 font-bold">
                    <span>📍 Lat: {locLat}</span>
                    <span>&bull;</span>
                    <span>Lng: {locLng}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelPick}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPickedLocation}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Gunakan Titik Ini & Lanjut Isi Data →</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Google Maps Search & Category Bar */}
          {!isPickingLocation && (
            <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2">
                {/* Search Box */}
                <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 px-3 py-2 flex items-center gap-2 pointer-events-auto">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Telusuri gedung PNL, prodi, lab, kantin, masjid..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded-md shrink-0">
                    {locations.length} Lokasi
                  </span>
                </div>

                {/* Quick Directions Diamond Button */}
                <button
                  type="button"
                  onClick={() => setShowDirectionsSheet(!showDirectionsSheet)}
                  className={`p-2.5 rounded-2xl shadow-md border flex items-center justify-center transition-all pointer-events-auto shrink-0 ${
                    showDirectionsSheet
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-brand-600 border-slate-200/80 hover:bg-slate-50'
                  }`}
                  title="Buka Navigasi Rute Antar-Gedung"
                >
                  <Route className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter Chips Horizontal Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto py-0.5">
                {[
                  { id: 'all', label: 'Semua Fasilitas' },
                  { id: 'administration', label: 'Rektorat & Biro' },
                  { id: 'faculty', label: 'Fakultas & Ruang Kelas' },
                  { id: 'department', label: 'Prodi & Jurusan' },
                  { id: 'laboratory', label: 'Lab & Riset TIK' },
                  { id: 'library', label: 'Perpustakaan' },
                  { id: 'auditorium', label: 'Auditorium' },
                  { id: 'mosque', label: 'Masjid Al-Bayan' },
                  { id: 'canteen', label: 'Kantin & Pujasera' },
                  { id: 'sports', label: 'Olahraga' },
                  { id: 'facility', label: 'Asrama & UKM' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs whitespace-nowrap transition-all border ${
                      selectedCategory === c.id
                        ? 'bg-brand-600 text-white border-brand-600 shadow-brand-500/30'
                        : 'bg-white/95 backdrop-blur-md text-slate-700 hover:bg-white border-slate-200/80'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Floating Directions / Rute Sheet Overlay */}
          {!isPickingLocation && showDirectionsSheet && (
            <div className="absolute top-20 left-3 z-30 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy">Petunjuk Arah Antar-Gedung</h3>
                    <p className="text-[10px] text-slate-400">Pilih titik asal dan tujuan di kampus PNL</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDirectionsSheet(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Travel Mode Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setTravelMode('walk')}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    travelMode === 'walk' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Jalan Kaki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTravelMode('motorcycle')}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    travelMode === 'motorcycle' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Motor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTravelMode('car')}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    travelMode === 'car' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Mobil</span>
                </button>
              </div>

              {/* Origin & Destination Selectors */}
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"></span>
                  <select
                    value={routeOriginId}
                    onChange={(e) => setRouteOriginId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white"
                  >
                    <option value="">-- Pilih Titik Asal --</option>
                    {userGpsCoords && (
                      <option value="gps" className="font-bold text-brand-600">
                        📍 Lokasi GPS Saya Saat Ini
                      </option>
                    )}
                    {locations.map((l) => (
                      <option key={l.id} value={l.id.toString()}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <div className="absolute right-3 top-8 z-10">
                  <button
                    type="button"
                    onClick={handleSwapRoutePoints}
                    className="p-1 bg-white border border-slate-200 rounded-full shadow-xs text-slate-500 hover:text-brand-600 transition-colors"
                    title="Tukar Titik Asal dan Tujuan"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0"></span>
                  <select
                    value={routeDestinationId}
                    onChange={(e) => setRouteDestinationId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white"
                  >
                    <option value="">-- Pilih Gedung Tujuan --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id.toString()}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCalculateRoute}
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Tampilkan Rute</span>
                </button>
                {routeActive && (
                  <button
                    type="button"
                    onClick={handleClearRoute}
                    className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Distance and Step-by-Step Info */}
              {routeActive && routeDistanceMeters !== null && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-extrabold text-sm flex items-center gap-1">
                      {routeDistanceMeters} Meter
                    </span>
                    <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                      ~{routeDurationMinutes} Menit ({travelMode === 'walk' ? 'Jalan Kaki' : travelMode === 'motorcycle' ? 'Motor' : 'Mobil'})
                    </span>
                  </div>

                  {/* Step-by-step turn-by-turn preview */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5 text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <CornerUpRight className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>Berangkat dari titik awal menyusuri koridor pejalan kaki kampus Buketrata.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CornerUpRight className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>Melewati bundaran utama Masjid Al-Bayan / jalur hijau lingkar PNL.</span>
                    </div>
                    <div className="flex items-start gap-1.5 font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Tiba di gedung tujuan.</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${
                      routeOriginId === 'gps' && userGpsCoords
                        ? `${userGpsCoords.lat},${userGpsCoords.lng}`
                        : locations.find((l) => l.id.toString() === routeOriginId)
                        ? `${locations.find((l) => l.id.toString() === routeOriginId)?.latitude},${locations.find((l) => l.id.toString() === routeOriginId)?.longitude}`
                        : ''
                    }&destination=${
                      locations.find((l) => l.id.toString() === routeDestinationId)?.latitude
                    },${locations.find((l) => l.id.toString() === routeDestinationId)?.longitude}&travelmode=${
                      travelMode === 'motorcycle' ? 'two-wheeler' : travelMode === 'car' ? 'driving' : 'walking'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mulai Navigasi di Google Maps Live</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Leaflet Map DOM Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Google Maps Style Controls (Bottom-Right & Bottom-Left) */}
          <div className="absolute bottom-5 right-4 z-30 flex flex-col items-end gap-2.5 pointer-events-none">
            {/* Mode Switcher Pill Control (Roadmap, Satellite HD, Terrain, Traffic) */}
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200/90 flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => setMapMode('roadmap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mapMode === 'roadmap'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Peta Default Google Maps (Jalan & Bangunan Lengkap)"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Peta</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mapMode === 'satellite'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Citra Udara Satelit Google Resolusi Tinggi + Label Jalan"
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>Satelit HD</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('terrain')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mapMode === 'terrain'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Peta Topografi & Kontur Elevasi Medan Kampus"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Medan</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('traffic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mapMode === 'traffic'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Status Lalu Lintas Real-Time Jalan Medan - Banda Aceh"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Lalu Lintas</span>
              </button>
            </div>

            {/* Floating Quick Action Buttons Stack */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all hover:scale-105"
                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Locate My GPS Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsLoading}
                className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-all hover:scale-105"
                title="Pusatkan ke Lokasi GPS Saya"
              >
                <LocateFixed className={`w-4 h-4 ${gpsLoading ? 'animate-spin text-brand-600' : 'text-slate-700'}`} />
              </button>

              {/* Re-center Campus Button */}
              <button
                type="button"
                onClick={() => {
                  mapInstanceRef.current?.flyTo([5.1207, 97.1568], 17, { duration: 1 });
                }}
                className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all hover:scale-105"
                title="Pusatkan Peta ke Politeknik Negeri Lhokseumawe"
              >
                <Building2 className="w-4 h-4" />
              </button>

              {/* Zoom In & Out Stack */}
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-md flex flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors border-b border-slate-100"
                  title="Perbesar Peta"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  title="Perkecil Peta"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Left Active Map Legend & Street Info */}
          <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-[11px] text-slate-600 font-semibold pointer-events-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Jl. Medan - Banda Aceh Km. 280,3, Buketrata, Lhokseumawe</span>
            <span className="text-slate-300">|</span>
            <span className="text-brand-600 font-bold">
              {mapMode === 'satellite' ? 'Google Satelit Hybrid' : mapMode === 'terrain' ? 'Google Topo' : mapMode === 'traffic' ? 'Google Traffic' : 'Google Roadmap'}
            </span>
          </div>
        </div>

        {/* Selected Location Google Maps Place Detail Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedLocation ? (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-4 animate-in fade-in duration-200">
              {/* Place Hero Photo */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img
                  src={
                    selectedLocation.photo_url ||
                    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-navy/85 backdrop-blur-md text-white font-bold text-[10px] rounded-lg">
                  {selectedLocConfig?.label}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[10px] rounded-lg shadow-xs">
                  {selectedLocation.floor_count} Lantai
                </span>
              </div>

              {/* Title & Review Rating */}
              <div>
                <h2 className="text-base font-extrabold text-navy leading-snug">{selectedLocation.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>4.8</span>
                  </div>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Buka Sekarang
                  </span>
                  <span className="text-slate-400 text-[11px]">&bull; Tutup 16:30</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedLocation.description}</p>
              </div>

              {/* Google Maps Style Circular Action Buttons Bar */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                {/* Rute Button */}
                <button
                  type="button"
                  onClick={() => handleStartRouteToThisBuilding(selectedLocation)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-blue-50/80 hover:bg-blue-100 text-brand-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                    <Route className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Rute</span>
                </button>

                {/* Pusatkan / FlyTo Button */}
                <button
                  type="button"
                  onClick={() => handleSelectLocation(selectedLocation)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Pusatkan</span>
                </button>

                {/* Bagikan / Copy Link Button */}
                <button
                  type="button"
                  onClick={() => copyCoordinates(selectedLocation)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Salin Tautan Lokasi"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold">{copiedLink ? 'Tersalin!' : 'Bagikan'}</span>
                </button>

                {/* Buka di Google Maps Asli Button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold">Buka GMaps</span>
                </a>
              </div>

              {/* Detailed Location Specifications */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                {/* Address & Plus Code */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-navy">Kampus Buketrata PNL</div>
                    <div className="text-[11px] text-slate-500">
                      Jl. Medan - Banda Aceh Km. 280,3, Mesjid Punteut, Kec. Blang Mangat, Lhokseumawe
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                {selectedLocation.opening_hours && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Jam Layanan: <strong>{selectedLocation.opening_hours}</strong>
                    </span>
                  </div>
                )}

                {/* Telephone */}
                {selectedLocation.contact_phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Telepon: <strong>{selectedLocation.contact_phone}</strong>
                    </span>
                  </div>
                )}

                {/* Coordinates */}
                <div className="flex items-center gap-2.5 font-mono text-[11px] text-slate-500">
                  <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                  </span>
                </div>
              </div>

              {/* Facilities Chips */}
              {selectedLocation.facilities_available && selectedLocation.facilities_available.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fasilitas Kampus:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.facilities_available.map((f: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingLocId(selectedLocation.id);
                      setLocName(selectedLocation.name);
                      setLocCategory(selectedLocation.category);
                      setLocDescription(selectedLocation.description);
                      setLocLat(selectedLocation.latitude.toString());
                      setLocLng(selectedLocation.longitude.toString());
                      setLocPhoto(selectedLocation.photo_url || '');
                      setLocFloor(selectedLocation.floor_count);
                      setLocHours(selectedLocation.opening_hours || '07:30 - 16:30');
                      setLocPhone(selectedLocation.contact_phone || '+62 645 42670');
                      setAddModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Informasi</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLocation(selectedLocation.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200"
                    title="Hapus Lokasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-borderMuted shadow-xs text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">Pilih Lokasi di Peta</div>
              <p className="text-xs text-slate-400">Klik salah satu pin atau label gedung untuk melihat detail profil.</p>
            </div>
          )}

          {/* Quick List Directory Accordion Card */}
          <div className="bg-white rounded-3xl p-4 border border-borderMuted shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-navy">Direktori Gedung PNL ({locations.length})</span>
              <span className="text-[10px] text-brand-600 font-bold">Buketrata</span>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {locations.map((loc) => {
                const conf = getCategoryConfig(loc.category);
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 border border-brand-200 text-brand-700 font-bold shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: conf.color }}
                      ></span>
                      <div className="truncate">
                        <div className="truncate font-semibold">{loc.name}</div>
                        <span className="text-[10px] text-slate-400 font-normal uppercase">{conf.label}</span>
                      </div>
                    </div>
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Location */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          handleCancelPick();
        }}
        title={editingLocId ? 'Edit Lokasi Kampus PNL' : 'Tambah Titik Lokasi Kampus PNL'}
      >
        <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Nama Gedung / Fasilitas <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              placeholder="Contoh: Gedung Jurusan Teknologi Informasi dan Komputer (TIK)"
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Kategori Fasilitas</label>
              <select
                value={locCategory}
                onChange={(e) => setLocCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="administration">Administrasi / Rektorat</option>
                <option value="faculty">Fakultas & Ruang Kuliah</option>
                <option value="department">Program Studi / Jurusan</option>
                <option value="laboratory">Laboratorium & Riset</option>
                <option value="library">Perpustakaan</option>
                <option value="auditorium">Auditorium & Aula</option>
                <option value="mosque">Ibadah / Masjid</option>
                <option value="canteen">Kantin & Kuliner</option>
                <option value="sports">Fasilitas Olahraga</option>
                <option value="facility">Asrama & Fasilitas Umum</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Jumlah Lantai</label>
              <input
                type="number"
                min={1}
                max={10}
                value={locFloor}
                onChange={(e) => setLocFloor(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          {/* Section Penentuan Titik Koordinat Interaktif */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-navy text-xs">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Titik Koordinat Gedung (Presisi Peta)</span>
              </div>
              <span className="text-[10px] font-bold text-brand-700 bg-white px-2 py-0.5 rounded-md border border-brand-200 shadow-2xs">
                WGS84 Lat/Lng
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tentukan posisi gedung dengan klik langsung pada peta kampus Buketrata, gunakan GPS perangkat Anda, atau ketik koordinat presisi.
            </p>

            {/* Quick Action Buttons: Pick on Map & GPS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartPickOnMap}
                className="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>📍 Pilih / Geser di Peta</span>
              </button>

              <button
                type="button"
                onClick={handleUseCurrentGpsForModal}
                disabled={gpsLoading}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <LocateFixed className={`w-3.5 h-3.5 text-emerald-600 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>🎯 Pakai GPS Saya</span>
              </button>
            </div>

            {/* Numeric Lat & Lng Input Fields */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Latitude <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locLat}
                  onChange={(e) => setLocLat(e.target.value)}
                  placeholder="5.120700"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Longitude <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locLng}
                  onChange={(e) => setLocLng(e.target.value)}
                  placeholder="97.157500"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Jam Operasional</label>
              <input
                type="text"
                value={locHours}
                onChange={(e) => setLocHours(e.target.value)}
                placeholder="07:30 - 16:30"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Kontak Telepon</label>
              <input
                type="text"
                value={locPhone}
                onChange={(e) => setLocPhone(e.target.value)}
                placeholder="+62 645 42670"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <ImageUploadField
            label="Foto Gedung / Fasilitas"
            value={locPhoto}
            onChange={(url) => setLocPhoto(url)}
            placeholder="Unggah foto gedung dari galeri atau tempel URL..."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={locDescription}
              onChange={(e) => setLocDescription(e.target.value)}
              placeholder="Jelaskan fungsi gedung, laboratorium, dan ruangan yang ada..."
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Lokasi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
