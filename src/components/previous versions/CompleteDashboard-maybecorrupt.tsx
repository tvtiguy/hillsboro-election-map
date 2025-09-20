import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Complete election data from your CSV
const COMPLETE_ELECTION_DATA = {
  races: [
    {
      seat: 'Seat 1',
      candidates: ['Sidney S Thomason', 'Yessica Hardin-Mercado'],
      colors: ['#3B82F6', '#EF4444'],
      data: [
        { precinct: 'Precinct 303', precinctNumber: 303, ballotsCast: 36, regVoters: 960, totalVotes: 30, turnoutRate: 3.75, candidates: [{ name: 'Sidney S Thomason', votes: 18, percentage: 60.00 }, { name: 'Yessica Hardin-Mercado', votes: 12, percentage: 40.00 }] },
        { precinct: 'Precinct 304', precinctNumber: 304, ballotsCast: 220, regVoters: 1428, totalVotes: 216, turnoutRate: 15.41, candidates: [{ name: 'Sidney S Thomason', votes: 107, percentage: 49.54 }, { name: 'Yessica Hardin-Mercado', votes: 107, percentage: 49.54 }] },
        { precinct: 'Precinct 307', precinctNumber: 307, ballotsCast: 10, regVoters: 116, totalVotes: 10, turnoutRate: 8.62, candidates: [{ name: 'Sidney S Thomason', votes: 5, percentage: 50.00 }, { name: 'Yessica Hardin-Mercado', votes: 5, percentage: 50.00 }] },
        { precinct: 'Precinct 310', precinctNumber: 310, ballotsCast: 122, regVoters: 1148, totalVotes: 119, turnoutRate: 10.63, candidates: [{ name: 'Sidney S Thomason', votes: 10, percentage: 8.40 }, { name: 'Yessica Hardin-Mercado', votes: 108, percentage: 90.76 }] },
        { precinct: 'Precinct 318', precinctNumber: 318, ballotsCast: 929, regVoters: 6505, totalVotes: 909, turnoutRate: 14.28, candidates: [{ name: 'Sidney S Thomason', votes: 333, percentage: 36.63 }, { name: 'Yessica Hardin-Mercado', votes: 575, percentage: 63.26 }] },
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1205, turnoutRate: 16.62, candidates: [{ name: 'Sidney S Thomason', votes: 763, percentage: 63.32 }, { name: 'Yessica Hardin-Mercado', votes: 439, percentage: 36.43 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 2045, turnoutRate: 20.10, candidates: [{ name: 'Sidney S Thomason', votes: 599, percentage: 29.29 }, { name: 'Yessica Hardin-Mercado', votes: 1418, percentage: 69.34 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1366, turnoutRate: 25.75, candidates: [{ name: 'Sidney S Thomason', votes: 551, percentage: 40.34 }, { name: 'Yessica Hardin-Mercado', votes: 813, percentage: 59.52 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1058, turnoutRate: 12.19, candidates: [{ name: 'Sidney S Thomason', votes: 373, percentage: 35.26 }, { name: 'Yessica Hardin-Mercado', votes: 684, percentage: 64.65 }] }
      ]
    },
    {
      seat: 'Seat 2',
      candidates: ['Mark Watson', 'Maureen Barnhart'],
      colors: ['#10B981', '#F59E0B'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1188, turnoutRate: 16.62, candidates: [{ name: 'Mark Watson', votes: 717, percentage: 60.35 }, { name: 'Maureen Barnhart', votes: 468, percentage: 39.39 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1983, turnoutRate: 20.10, candidates: [{ name: 'Mark Watson', votes: 1281, percentage: 64.60 }, { name: 'Maureen Barnhart', votes: 680, percentage: 34.29 }] },
        { precinct: 'Precinct 330', precinctNumber: 330, ballotsCast: 486, regVoters: 2781, totalVotes: 433, turnoutRate: 17.48, candidates: [{ name: 'Mark Watson', votes: 378, percentage: 87.30 }, { name: 'Maureen Barnhart', votes: 54, percentage: 12.47 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1366, turnoutRate: 25.75, candidates: [{ name: 'Mark Watson', votes: 773, percentage: 56.59 }, { name: 'Maureen Barnhart', votes: 590, percentage: 43.19 }] },
        { precinct: 'Precinct 373', precinctNumber: 373, ballotsCast: 465, regVoters: 3736, totalVotes: 455, turnoutRate: 12.45, candidates: [{ name: 'Mark Watson', votes: 353, percentage: 77.58 }, { name: 'Maureen Barnhart', votes: 100, percentage: 21.98 }] }
      ]
    },
    {
      seat: 'Seat 4',
      candidates: ['Nancy Thomas'],
      colors: ['#8B5CF6'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1176, turnoutRate: 16.62, candidates: [{ name: 'Nancy Thomas', votes: 1173, percentage: 99.74 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1728, turnoutRate: 20.10, candidates: [{ name: 'Nancy Thomas', votes: 1691, percentage: 97.86 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1118, turnoutRate: 25.75, candidates: [{ name: 'Nancy Thomas', votes: 1069, percentage: 95.62 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1022, turnoutRate: 12.19, candidates: [{ name: 'Nancy Thomas', votes: 1013, percentage: 99.12 }] }
      ]
    },
    {
      seat: 'Seat 6',
      candidates: ['Katie Rhyne', 'Rebecca Denison'],
      colors: ['#EC4899', '#06B6D4'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1176, turnoutRate: 16.62, candidates: [{ name: 'Katie Rhyne', votes: 777, percentage: 66.07 }, { name: 'Rebecca Denison', votes: 399, percentage: 33.93 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1960, turnoutRate: 20.10, candidates: [{ name: 'Katie Rhyne', votes: 1368, percentage: 69.80 }, { name: 'Rebecca Denison', votes: 573, percentage: 29.23 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1316, turnoutRate: 25.75, candidates: [{ name: 'Katie Rhyne', votes: 953, percentage: 72.42 }, { name: 'Rebecca Denison', votes: 363, percentage: 27.58 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1056, turnoutRate: 12.19, candidates: [{ name: 'Katie Rhyne', votes: 776, percentage: 73.48 }, { name: 'Rebecca Denison', votes: 280, percentage: 26.52 }] },
        { precinct: 'Precinct 341', precinctNumber: 341, ballotsCast: 731, regVoters: 3408, totalVotes: 731, turnoutRate: 21.45, candidates: [{ name: 'Katie Rhyne', votes: 507, percentage: 69.36 }, { name: 'Rebecca Denison', votes: 224, percentage: 30.64 }] }
      ]
    }
  ]
};

// Approximate precinct boundaries for demo
const PRECINCT_BOUNDARIES = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "precinctNumber": 303, "name": "Precinct 303", "area": "Southwest Hillsboro" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9950, 45.5180], [-122.9900, 45.5180], [-122.9900, 45.5220], [-122.9950, 45.5220], [-122.9950, 45.5180]]] }
    },
    {
      "type": "Feature", 
      "properties": { "precinctNumber": 304, "name": "Precinct 304", "area": "Central Hillsboro" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9900, 45.5180], [-122.9850, 45.5180], [-122.9850, 45.5220], [-122.9900, 45.5220], [-122.9900, 45.5180]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 307, "name": "Precinct 307", "area": "Northeast Hillsboro" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9850, 45.5180], [-122.9800, 45.5180], [-122.9800, 45.5220], [-122.9850, 45.5220], [-122.9850, 45.5180]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 310, "name": "Precinct 310", "area": "South Central" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9900, 45.5140], [-122.9850, 45.5140], [-122.9850, 45.5180], [-122.9900, 45.5180], [-122.9900, 45.5140]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 318, "name": "Precinct 318", "area": "Central East" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9850, 45.5140], [-122.9750, 45.5140], [-122.9750, 45.5220], [-122.9850, 45.5220], [-122.9850, 45.5140]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 327, "name": "Precinct 327", "area": "North Central" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9950, 45.5220], [-122.9850, 45.5220], [-122.9850, 45.5280], [-122.9950, 45.5280], [-122.9950, 45.5220]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 329, "name": "Precinct 329", "area": "Northwest" },
      "geometry": { "type": "Polygon", "coordinates": [[[-123.0050, 45.5220], [-122.9950, 45.5220], [-122.9950, 45.5320], [-123.0050, 45.5320], [-123.0050, 45.5220]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 330, "name": "Precinct 330", "area": "Far Northwest" },
      "geometry": { "type": "Polygon", "coordinates": [[[-123.0100, 45.5280], [-123.0050, 45.5280], [-123.0050, 45.5320], [-123.0100, 45.5320], [-123.0100, 45.5280]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 334, "name": "Precinct 334", "area": "East Hillsboro" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9750, 45.5180], [-122.9650, 45.5180], [-122.9650, 45.5260], [-122.9750, 45.5260], [-122.9750, 45.5180]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 339, "name": "Precinct 339", "area": "Southeast" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9750, 45.5100], [-122.9650, 45.5100], [-122.9650, 45.5180], [-122.9750, 45.5180], [-122.9750, 45.5100]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 341, "name": "Precinct 341", "area": "South Hillsboro" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9900, 45.5100], [-122.9800, 45.5100], [-122.9800, 45.5140], [-122.9900, 45.5140], [-122.9900, 45.5100]]] }
    },
    {
      "type": "Feature",
      "properties": { "precinctNumber": 373, "name": "Precinct 373", "area": "Far Southeast" },
      "geometry": { "type": "Polygon", "coordinates": [[[-122.9650, 45.5060], [-122.9550, 45.5060], [-122.9550, 45.5140], [-122.9650, 45.5140], [-122.9650, 45.5060]]] }
    }
  ]
};

// Real Leaflet Map Component
const InteractiveMap = ({ raceData, viewMode, selectedPrecinct, onPrecinctClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      
      // Load CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      setMapLoaded(true);
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      center: [45.5200, -122.9800],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update precinct layers
  useEffect(() => {
    if (!mapInstanceRef.current || !raceData || !window.L) return;

    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = window.L.geoJSON(PRECINCT_BOUNDARIES, {
      style: (feature) => getPrecinctStyle(feature, raceData, viewMode),
      onEachFeature: (feature, layer) => {
        const precinctData = raceData.data.find(p => p.precinctNumber === feature.properties.precinctNumber);
        
        let popupContent = `<div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${feature.properties.name}</h3>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">${feature.properties.area}</p>`;

        if (precinctData) {
          popupContent += `
            <div style="margin: 8px 0;">
              <p style="margin: 2px 0;"><strong>Turnout:</strong> ${precinctData.turnoutRate.toFixed(1)}%</p>
              <p style="margin: 2px 0;"><strong>Ballots:</strong> ${precinctData.ballotsCast.toLocaleString()}</p>
              <p style="margin: 2px 0;"><strong>Total Votes:</strong> ${precinctData.totalVotes.toLocaleString()}</p>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #ccc;">`;
          
          precinctData.candidates.forEach((candidate, index) => {
            const candidateColor = raceData.colors[index] || '#666';
            popupContent += `
              <div style="display: flex; justify-content: space-between; margin: 4px 0; align-items: center;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 12px; height: 12px; background: ${candidateColor}; border-radius: 50%; margin-right: 8px;"></div>
                  <span style="font-size: 14px;">${candidate.name.split(' ').slice(-1)[0]}</span>
                </div>
                <span style="font-weight: bold;">${candidate.votes} (${candidate.percentage}%)</span>
              </div>`;
          });
          
          popupContent += `</div>`;
        } else {
          popupContent += `<p style="color: #999;">No election data available</p>`;
        }
        
        popupContent += `</div>`;

        layer.bindPopup(popupContent, { maxWidth: 300 });

        layer.on({
          click: (e) => {
            if (onPrecinctClick && precinctData) {
              onPrecinctClick(precinctData);
            }
          },
          mouseover: (e) => {
            layer.setStyle({ weight: 3, color: '#374151', fillOpacity: 0.9 });
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          }
        });
      }
    });

    geoJsonLayer.addTo(mapInstanceRef.current);
    geoJsonLayerRef.current = geoJsonLayer;
    mapInstanceRef.current.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });

  }, [raceData, viewMode]);

  const getPrecinctStyle = (feature, raceData, viewMode) => {
    const precinctData = raceData.data.find(p => p.precinctNumber === feature.properties.precinctNumber);
    
    if (!precinctData) {
      return {
        fillColor: '#E5E7EB',
        weight: 1,
        opacity: 0.8,
        color: '#9CA3AF',
        fillOpacity: 0.5
      };
    }

    let fillColor;
    if (viewMode === 'turnout') {
      fillColor = getTurnoutColor(precinctData.turnoutRate);
    } else {
      fillColor = getWinnerColor(precinctData, raceData);
    }

    return {
      fillColor: fillColor,
      weight: 2,
      opacity: 0.8,
      color: '#374151',
      fillOpacity: 0.7
    };
  };

  const getTurnoutColor = (turnoutRate) => {
    if (turnoutRate < 5) return '#FEF3C7';    // Very light yellow
    if (turnoutRate < 10) return '#FDE68A';   // Light yellow  
    if (turnoutRate < 15) return '#FBBF24';   // Medium yellow
    if (turnoutRate < 20) return '#F59E0B';   // Orange
    if (turnoutRate < 25) return '#D97706';   // Dark orange
    return '#92400E';                         // Very dark orange
  };

  const getWinnerColor = (precinctData, raceData) => {
    if (!precinctData.candidates || precinctData.candidates.length === 0) {
      return '#E5E7EB';
    }

    let winner = precinctData.candidates[0];
    for (let candidate of precinctData.candidates) {
      if (candidate.votes > winner.votes) {
        winner = candidate;
      }
    }

    const candidateIndex = raceData.candidates.indexOf(winner.name);
    return candidateIndex !== -1 ? raceData.colors[candidateIndex] : '#E5E7EB';
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">Loading Interactive Map...</div>
            <div className="text-sm text-gray-500">Hillsboro School District Precincts</div>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        🗺️ Demo with Approximate Boundaries
      </div>
    </div>
  );
};

// Map legend component
const MapLegend = ({ raceData, viewMode }) => {
  if (viewMode === 'turnout') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-3">Turnout Rate</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
            <span className="text-sm">0-5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FBBF24' }}></div>
            <span className="text-sm">10-15%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-sm">15-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#92400E' }}></div>
            <span className="text-sm">25%+</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold mb-3">Candidates</h4>
      <div className="space-y-2">
        {raceData.candidates.map((candidate, index) => (
          <div key={candidate} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: raceData.colors[index] }}
            ></div>
            <span className="text-sm">{candidate.split(' ').slice(-1)[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main dashboard component
const CompleteDashboard = () => {
  const [selectedRace, setSelectedRace] = useState('Seat 1');
  const [viewMode, setViewMode] = useState('results');
  const [selectedPrecinct, setSelectedPrecinct] = useState(null);

  const currentRace = useMemo(() => {
    return COMPLETE_ELECTION_DATA.races.find(race => race.seat === selectedRace);
  }, [selectedRace]);

  const raceOverview = useMemo(() => {
    if (!currentRace) return null;
    
    const totalVotes = currentRace.data.reduce((sum, precinct) => sum + precinct.totalVotes, 0);
    const totalBallots = currentRace.data.reduce((sum, precinct) => sum + precinct.ballotsCast, 0);
    const totalRegVoters = currentRace.data.reduce((sum, precinct) => sum + precinct.regVoters, 0);
    
    const candidateTotals = currentRace.candidates.map((name, index) => {
      const total = currentRace.data.reduce((sum, precinct) => {
        return sum + (precinct.candidates[index]?.votes || 0);
      }, 0);
      return { 
        name, 
        votes: total, 
        percentage: totalVotes > 0 ? (total / totalVotes * 100).toFixed(1) : 0 
      };
    });

    return { 
      totalVotes, 
      totalBallots, 
      totalRegVoters, 
      candidateTotals, 
      overallTurnout: totalRegVoters > 0 ? (totalBallots / totalRegVoters * 100).toFixed(1) : 0
    };
  }, [currentRace]);

  const chartData = useMemo(() => {
    if (!currentRace) return [];
    
    return currentRace.data.map(precinct => {
      if (viewMode === 'turnout') {
        return {
          precinct: `P${precinct.precinctNumber}`,
          turnout: precinct.turnoutRate.toFixed(1),
          value: precinct.turnoutRate
        };
      }
      
      const result = { precinct: `P${precinct.precinctNumber}` };
      precinct.candidates.forEach((candidate, index) => {
        result[currentRace.candidates[index].split(' ').slice(-1)[0]] = candidate.votes;
      });
      return result;
    });
  }, [currentRace, viewMode]);

  const handlePrecinctClick = (precinctData) => {
    setSelectedPrecinct(precinctData);
  };

  if (!currentRace) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hillsboro School District Election Results
          </h1>
          <p className="text-lg text-gray-600">May 2025 Election - Interactive Geographic Analysis</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Race:</label>
              <select 
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                {COMPLETE_ELECTION_DATA.races.map(race => (
                  <option key={race.seat} value={race.seat}>{race.seat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('results')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'results' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Vote Results
                </button>
                <button
                  onClick={() => setViewMode('turnout')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'turnout' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Turnout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {raceOverview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{raceOverview.totalVotes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Votes Cast</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{raceOverview.totalBallots.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Ballots</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{raceOverview.overallTurnout}%</div>
              <div className="text-sm text-gray-600">Overall Turnout</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-700">{currentRace.data.length}</div>
              <div className="text-sm text-gray-600">Precincts Reporting</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRace} - {viewMode === 'results' ? 'Results' : 'Turnout'} by Precinct
            </h3>
            <InteractiveMap 
              raceData={currentRace}
              viewMode={viewMode}
              onPrecinctClick={handlePrecinctClick}
              selectedPrecinct={selectedPrecinct}
            />
          </div>

          {/* Map Legend */}
          <div className="space-y-4">
            <MapLegend raceData={currentRace} viewMode={viewMode} />
            
            {/* Race Results Summary */}
            {raceOverview && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">{selectedRace} Results</h3>
                <div className="space-y-3">
                  {raceOverview.candidateTotals.map((candidate, index) => (
                    <div key={candidate.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: currentRace.colors[index] }}
                        ></div>
                        <span className="text-sm font-medium">{candidate.name.split(' ').slice(-1)[0]}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{candidate.votes.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{candidate.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Precinct Details Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Precinct Details</h3>
            {selectedPrecinct ? (
              <div>
                <h4 className="font-medium text-blue-600 mb-3">{selectedPrecinct.precinct}</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {selectedPrecinct.turnoutRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Turnout</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {selectedPrecinct.ballotsCast}
                    </div>
                    <div className="text-xs text-gray-600">Ballots</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Results:</h5>
                  {selectedPrecinct.candidates.map((candidate, index) => {
                    const isWinner = selectedPrecinct.candidates.every(c => candidate.votes >= c.votes);
                    return (
                      <div 
                        key={candidate.name} 
                        className={`flex justify-between p-2 rounded ${
                          isWinner ? 'bg-yellow-50 border border-yellow-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: currentRace.colors[index] }}
                          ></div>
                          <span className="text-sm">{candidate.name.split(' ').slice(-1)[0]}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{candidate.votes}</div>
                          <div className="text-xs text-gray-500">{candidate.percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Reg. Voters:</span>
                    <span>{selectedPrecinct.regVoters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Votes:</span>
                    <span>{selectedPrecinct.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Click on a precinct to view details</p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {viewMode === 'results' ? 'Vote Distribution' : 'Turnout Analysis'} - {selectedRace}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="precinct" />
              <YAxis />
              <Tooltip />
              {viewMode === 'results' ? (
                currentRace.candidates.map((candidate, index) => (
                  <Bar 
                    key={candidate} 
                    dataKey={candidate.split(' ').slice(-1)[0]} 
                    fill={currentRace.colors[index]} 
                    name={candidate}
                  />
                ))
              ) : (
                <Bar dataKey="value" fill="#3B82F6" name="Turnout %" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Highest Turnout</h4>
            {currentRace.data
              .sort((a, b) => b.turnoutRate - a.turnoutRate)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-blue-600">
                    {precinct.turnoutRate.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Largest Precincts</h4>
            {currentRace.data
              .sort((a, b) => b.ballotsCast - a.ballotsCast)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-green-600">
                    {precinct.ballotsCast} ballots
                  </span>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Competitive Areas</h4>
            {currentRace.data
              .filter(p => p.candidates.length > 1)
              .map(precinct => {
                const sorted = [...precinct.candidates].sort((a, b) => b.votes - a.votes);
                const margin = sorted.length > 1 ? sorted[0].percentage - sorted[1].percentage : 100;
                return { ...precinct, margin };
              })
              .sort((a, b) => a.margin - b.margin)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-orange-600">
                    {precinct.margin.toFixed(1)}% margin
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteDashboard;
        </div>
      </div>
    </div>
  );
};

export default CompleteDashboard;import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Complete election data from your CSV
const COMPLETE_ELECTION_DATA = {
  races: [
    {
      seat: 'Seat 1',
      candidates: ['Sidney S Thomason', 'Yessica Hardin-Mercado'],
      colors: ['#3B82F6', '#EF4444'],
      data: [
        { precinct: 'Precinct 303', precinctNumber: 303, ballotsCast: 36, regVoters: 960, totalVotes: 30, turnoutRate: 3.75, candidates: [{ name: 'Sidney S Thomason', votes: 18, percentage: 60.00 }, { name: 'Yessica Hardin-Mercado', votes: 12, percentage: 40.00 }] },
        { precinct: 'Precinct 304', precinctNumber: 304, ballotsCast: 220, regVoters: 1428, totalVotes: 216, turnoutRate: 15.41, candidates: [{ name: 'Sidney S Thomason', votes: 107, percentage: 49.54 }, { name: 'Yessica Hardin-Mercado', votes: 107, percentage: 49.54 }] },
        { precinct: 'Precinct 307', precinctNumber: 307, ballotsCast: 10, regVoters: 116, totalVotes: 10, turnoutRate: 8.62, candidates: [{ name: 'Sidney S Thomason', votes: 5, percentage: 50.00 }, { name: 'Yessica Hardin-Mercado', votes: 5, percentage: 50.00 }] },
        { precinct: 'Precinct 310', precinctNumber: 310, ballotsCast: 122, regVoters: 1148, totalVotes: 119, turnoutRate: 10.63, candidates: [{ name: 'Sidney S Thomason', votes: 10, percentage: 8.40 }, { name: 'Yessica Hardin-Mercado', votes: 108, percentage: 90.76 }] },
        { precinct: 'Precinct 318', precinctNumber: 318, ballotsCast: 929, regVoters: 6505, totalVotes: 909, turnoutRate: 14.28, candidates: [{ name: 'Sidney S Thomason', votes: 333, percentage: 36.63 }, { name: 'Yessica Hardin-Mercado', votes: 575, percentage: 63.26 }] },
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1205, turnoutRate: 16.62, candidates: [{ name: 'Sidney S Thomason', votes: 763, percentage: 63.32 }, { name: 'Yessica Hardin-Mercado', votes: 439, percentage: 36.43 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 2045, turnoutRate: 20.10, candidates: [{ name: 'Sidney S Thomason', votes: 599, percentage: 29.29 }, { name: 'Yessica Hardin-Mercado', votes: 1418, percentage: 69.34 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1366, turnoutRate: 25.75, candidates: [{ name: 'Sidney S Thomason', votes: 551, percentage: 40.34 }, { name: 'Yessica Hardin-Mercado', votes: 813, percentage: 59.52 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1058, turnoutRate: 12.19, candidates: [{ name: 'Sidney S Thomason', votes: 373, percentage: 35.26 }, { name: 'Yessica Hardin-Mercado', votes: 684, percentage: 64.65 }] }
      ]
    },
    {
      seat: 'Seat 2',
      candidates: ['Mark Watson', 'Maureen Barnhart'],
      colors: ['#10B981', '#F59E0B'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1188, turnoutRate: 16.62, candidates: [{ name: 'Mark Watson', votes: 717, percentage: 60.35 }, { name: 'Maureen Barnhart', votes: 468, percentage: 39.39 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1983, turnoutRate: 20.10, candidates: [{ name: 'Mark Watson', votes: 1281, percentage: 64.60 }, { name: 'Maureen Barnhart', votes: 680, percentage: 34.29 }] },
        { precinct: 'Precinct 330', precinctNumber: 330, ballotsCast: 486, regVoters: 2781, totalVotes: 433, turnoutRate: 17.48, candidates: [{ name: 'Mark Watson', votes: 378, percentage: 87.30 }, { name: 'Maureen Barnhart', votes: 54, percentage: 12.47 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1366, turnoutRate: 25.75, candidates: [{ name: 'Mark Watson', votes: 773, percentage: 56.59 }, { name: 'Maureen Barnhart', votes: 590, percentage: 43.19 }] },
        { precinct: 'Precinct 373', precinctNumber: 373, ballotsCast: 465, regVoters: 3736, totalVotes: 455, turnoutRate: 12.45, candidates: [{ name: 'Mark Watson', votes: 353, percentage: 77.58 }, { name: 'Maureen Barnhart', votes: 100, percentage: 21.98 }] }
      ]
    },
    {
      seat: 'Seat 4',
      candidates: ['Nancy Thomas'],
      colors: ['#8B5CF6'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1176, turnoutRate: 16.62, candidates: [{ name: 'Nancy Thomas', votes: 1173, percentage: 99.74 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1728, turnoutRate: 20.10, candidates: [{ name: 'Nancy Thomas', votes: 1691, percentage: 97.86 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1118, turnoutRate: 25.75, candidates: [{ name: 'Nancy Thomas', votes: 1069, percentage: 95.62 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1022, turnoutRate: 12.19, candidates: [{ name: 'Nancy Thomas', votes: 1013, percentage: 99.12 }] }
      ]
    },
    {
      seat: 'Seat 6',
      candidates: ['Katie Rhyne', 'Rebecca Denison'],
      colors: ['#EC4899', '#06B6D4'],
      data: [
        { precinct: 'Precinct 327', precinctNumber: 327, ballotsCast: 1216, regVoters: 7317, totalVotes: 1176, turnoutRate: 16.62, candidates: [{ name: 'Katie Rhyne', votes: 777, percentage: 66.07 }, { name: 'Rebecca Denison', votes: 399, percentage: 33.93 }] },
        { precinct: 'Precinct 329', precinctNumber: 329, ballotsCast: 2045, regVoters: 10173, totalVotes: 1960, turnoutRate: 20.10, candidates: [{ name: 'Katie Rhyne', votes: 1368, percentage: 69.80 }, { name: 'Rebecca Denison', votes: 573, percentage: 29.23 }] },
        { precinct: 'Precinct 334', precinctNumber: 334, ballotsCast: 1387, regVoters: 5387, totalVotes: 1316, turnoutRate: 25.75, candidates: [{ name: 'Katie Rhyne', votes: 953, percentage: 72.42 }, { name: 'Rebecca Denison', votes: 363, percentage: 27.58 }] },
        { precinct: 'Precinct 339', precinctNumber: 339, ballotsCast: 1078, regVoters: 8846, totalVotes: 1056, turnoutRate: 12.19, candidates: [{ name: 'Katie Rhyne', votes: 776, percentage: 73.48 }, { name: 'Rebecca Denison', votes: 280, percentage: 26.52 }] },
        { precinct: 'Precinct 341', precinctNumber: 341, ballotsCast: 731, regVoters: 3408, totalVotes: 731, turnoutRate: 21.45, candidates: [{ name: 'Katie Rhyne', votes: 507, percentage: 69.36 }, { name: 'Rebecca Denison', votes: 224, percentage: 30.64 }] }
      ]
    }
  ]
};

// Mock precinct boundaries for demonstration
const MOCK_PRECINCT_BOUNDARIES = [
  { precinctNumber: 303, name: "Precinct 303", center: [45.5240, -122.9874], color: "#FFE4E1" },
  { precinctNumber: 304, name: "Precinct 304", center: [45.5280, -122.9820], color: "#E6F3FF" },
  { precinctNumber: 307, name: "Precinct 307", center: [45.5200, -122.9900], color: "#F0FFF0" },
  { precinctNumber: 310, name: "Precinct 310", center: [45.5320, -122.9850], color: "#FFF8DC" },
  { precinctNumber: 318, name: "Precinct 318", center: [45.5180, -122.9750], color: "#F5F5DC" },
  { precinctNumber: 327, name: "Precinct 327", center: [45.5260, -122.9930], color: "#E0E6FF" },
  { precinctNumber: 329, name: "Precinct 329", center: [45.5300, -122.9800], color: "#FFF0F5" },
  { precinctNumber: 330, name: "Precinct 330", center: [45.5340, -122.9780], color: "#F0F8FF" },
  { precinctNumber: 334, name: "Precinct 334", center: [45.5220, -122.9700], color: "#FFFAF0" },
  { precinctNumber: 339, name: "Precinct 339", center: [45.5160, -122.9680], color: "#FDF5E6" },
  { precinctNumber: 341, name: "Precinct 341", center: [45.5380, -122.9720], color: "#F0FFFF" },
  { precinctNumber: 373, name: "Precinct 373", center: [45.5140, -122.9650], color: "#F5FFFA" }
];

// Simple map visualization component
const SimpleMapView = ({ raceData, viewMode, onPrecinctClick, selectedPrecinct }) => {
  const getPrecinctColor = (precinctNumber) => {
    const precinctData = raceData.data.find(p => p.precinctNumber === precinctNumber);
    if (!precinctData) return '#E5E7EB';

    if (viewMode === 'turnout') {
      const rate = precinctData.turnoutRate;
      if (rate < 10) return '#DBEAFE';
      if (rate < 20) return '#93C5FD';
      if (rate < 30) return '#3B82F6';
      return '#1E3A8A';
    }

    // Find winner
    if (precinctData.candidates.length === 0) return '#E5E7EB';
    
    let winner = precinctData.candidates[0];
    for (let candidate of precinctData.candidates) {
      if (candidate.votes > winner.votes) {
        winner = candidate;
      }
    }

    const candidateIndex = raceData.candidates.indexOf(winner.name);
    return candidateIndex !== -1 ? raceData.colors[candidateIndex] : '#E5E7EB';
  };

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border relative overflow-hidden">
      <div className="absolute inset-0 p-4">
        <div className="grid grid-cols-4 gap-2 h-full">
          {MOCK_PRECINCT_BOUNDARIES.map(precinct => {
            const precinctData = raceData.data.find(p => p.precinctNumber === precinct.precinctNumber);
            const isSelected = selectedPrecinct === precinct.precinctNumber;
            
            return (
              <div
                key={precinct.precinctNumber}
                className={`rounded border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'border-gray-800 shadow-lg' : 'border-gray-400'
                }`}
                style={{ 
                  backgroundColor: getPrecinctColor(precinct.precinctNumber),
                  minHeight: '60px'
                }}
                onClick={() => onPrecinctClick && onPrecinctClick(precinctData)}
              >
                <div className="p-2 text-center">
                  <div className="text-sm font-semibold text-gray-800">
                    P{precinct.precinctNumber}
                  </div>
                  {precinctData && (
                    <div className="text-xs text-gray-600 mt-1">
                      {viewMode === 'turnout' 
                        ? `${precinctData.turnoutRate.toFixed(1)}%`
                        : `${precinctData.totalVotes} votes`
                      }
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        Hillsboro School District Precincts (Simplified View)
      </div>
    </div>
  );
};

// Map legend component
const MapLegend = ({ raceData, viewMode }) => {
  if (viewMode === 'turnout') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-3">Turnout Rate</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DBEAFE' }}></div>
            <span className="text-sm">0-10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93C5FD' }}></div>
            <span className="text-sm">10-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-sm">20-30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E3A8A' }}></div>
            <span className="text-sm">30%+</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold mb-3">Candidates</h4>
      <div className="space-y-2">
        {raceData.candidates.map((candidate, index) => (
          <div key={candidate} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: raceData.colors[index] }}
            ></div>
            <span className="text-sm">{candidate.split(' ').slice(-1)[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main dashboard component
const CompleteDashboard = () => {
  const [selectedRace, setSelectedRace] = useState('Seat 1');
  const [viewMode, setViewMode] = useState('results');
  const [selectedPrecinct, setSelectedPrecinct] = useState(null);

  const currentRace = useMemo(() => {
    return COMPLETE_ELECTION_DATA.races.find(race => race.seat === selectedRace);
  }, [selectedRace]);

  const raceOverview = useMemo(() => {
    if (!currentRace) return null;
    
    const totalVotes = currentRace.data.reduce((sum, precinct) => sum + precinct.totalVotes, 0);
    const totalBallots = currentRace.data.reduce((sum, precinct) => sum + precinct.ballotsCast, 0);
    const totalRegVoters = currentRace.data.reduce((sum, precinct) => sum + precinct.regVoters, 0);
    
    const candidateTotals = currentRace.candidates.map((name, index) => {
      const total = currentRace.data.reduce((sum, precinct) => {
        return sum + (precinct.candidates[index]?.votes || 0);
      }, 0);
      return { 
        name, 
        votes: total, 
        percentage: totalVotes > 0 ? (total / totalVotes * 100).toFixed(1) : 0 
      };
    });

    return { 
      totalVotes, 
      totalBallots, 
      totalRegVoters, 
      candidateTotals, 
      overallTurnout: totalRegVoters > 0 ? (totalBallots / totalRegVoters * 100).toFixed(1) : 0
    };
  }, [currentRace]);

  const chartData = useMemo(() => {
    if (!currentRace) return [];
    
    return currentRace.data.map(precinct => {
      if (viewMode === 'turnout') {
        return {
          precinct: `P${precinct.precinctNumber}`,
          turnout: precinct.turnoutRate.toFixed(1),
          value: precinct.turnoutRate
        };
      }
      
      const result = { precinct: `P${precinct.precinctNumber}` };
      precinct.candidates.forEach((candidate, index) => {
        result[currentRace.candidates[index].split(' ').slice(-1)[0]] = candidate.votes;
      });
      return result;
    });
  }, [currentRace, viewMode]);

  const handlePrecinctClick = (precinctData) => {
    setSelectedPrecinct(precinctData);
  };

  if (!currentRace) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hillsboro School District Election Results
          </h1>
          <p className="text-lg text-gray-600">May 2025 Election - Geographic Analysis</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Race:</label>
              <select 
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                {COMPLETE_ELECTION_DATA.races.map(race => (
                  <option key={race.seat} value={race.seat}>{race.seat}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('results')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'results' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Vote Results
                </button>
                <button
                  onClick={() => setViewMode('turnout')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'turnout' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Turnout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {raceOverview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{raceOverview.totalBallots.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Ballots</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{raceOverview.overallTurnout}%</div>
              <div className="text-sm text-gray-600">Overall Turnout</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-gray-700">{currentRace.data.length}</div>
              <div className="text-sm text-gray-600">Precincts Reporting</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRace} - {viewMode === 'results' ? 'Results' : 'Turnout'} by Precinct
            </h3>
            <SimpleMapView 
              raceData={currentRace}
              viewMode={viewMode}
              onPrecinctClick={handlePrecinctClick}
              selectedPrecinct={selectedPrecinct?.precinctNumber}
            />
          </div>

          {/* Map Legend */}
          <div className="space-y-4">
            <MapLegend raceData={currentRace} viewMode={viewMode} />
            
            {/* Race Results Summary */}
            {raceOverview && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">{selectedRace} Results</h3>
                <div className="space-y-3">
                  {raceOverview.candidateTotals.map((candidate, index) => (
                    <div key={candidate.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: currentRace.colors[index] }}
                        ></div>
                        <span className="text-sm font-medium">{candidate.name.split(' ').slice(-1)[0]}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{candidate.votes.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{candidate.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Precinct Details Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Precinct Details</h3>
            {selectedPrecinct ? (
              <div>
                <h4 className="font-medium text-blue-600 mb-3">{selectedPrecinct.precinct}</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {selectedPrecinct.turnoutRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Turnout</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {selectedPrecinct.ballotsCast}
                    </div>
                    <div className="text-xs text-gray-600">Ballots</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Results:</h5>
                  {selectedPrecinct.candidates.map((candidate, index) => {
                    const isWinner = selectedPrecinct.candidates.every(c => candidate.votes >= c.votes);
                    return (
                      <div 
                        key={candidate.name} 
                        className={`flex justify-between p-2 rounded ${
                          isWinner ? 'bg-yellow-50 border border-yellow-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: currentRace.colors[index] }}
                          ></div>
                          <span className="text-sm">{candidate.name.split(' ').slice(-1)[0]}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{candidate.votes}</div>
                          <div className="text-xs text-gray-500">{candidate.percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Reg. Voters:</span>
                    <span>{selectedPrecinct.regVoters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Votes:</span>
                    <span>{selectedPrecinct.totalVotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Click on a precinct to view details</p>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {viewMode === 'results' ? 'Vote Distribution' : 'Turnout Analysis'} - {selectedRace}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="precinct" />
              <YAxis />
              <Tooltip />
              {viewMode === 'results' ? (
                currentRace.candidates.map((candidate, index) => (
                  <Bar 
                    key={candidate} 
                    dataKey={candidate.split(' ').slice(-1)[0]} 
                    fill={currentRace.colors[index]} 
                    name={candidate}
                  />
                ))
              ) : (
                <Bar dataKey="value" fill="#3B82F6" name="Turnout %" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Highest Turnout</h4>
            {currentRace.data
              .sort((a, b) => b.turnoutRate - a.turnoutRate)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-blue-600">
                    {precinct.turnoutRate.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Largest Precincts</h4>
            {currentRace.data
              .sort((a, b) => b.ballotsCast - a.ballotsCast)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-green-600">
                    {precinct.ballotsCast} ballots
                  </span>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Competitive Areas</h4>
            {currentRace.data
              .filter(p => p.candidates.length > 1)
              .map(precinct => {
                const sorted = [...precinct.candidates].sort((a, b) => b.votes - a.votes);
                const margin = sorted.length > 1 ? sorted[0].percentage - sorted[1].percentage : 100;
                return { ...precinct, margin };
              })
              .sort((a, b) => a.margin - b.margin)
              .slice(0, 3)
              .map(precinct => (
                <div key={precinct.precinct} className="flex justify-between py-1">
                  <span className="text-sm">{precinct.precinct}</span>
                  <span className="text-sm font-medium text-orange-600">
                    {precinct.margin.toFixed(1)}% margin
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteDashboard;