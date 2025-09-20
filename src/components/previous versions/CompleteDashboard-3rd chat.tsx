"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ElectionResult {
  Precinct: string;
  'Contest Name': string;
  'Candidate Name': string;
  Votes: number;
}

interface PrecinctPath {
  id: string;
  path: string;
  hasElectionData: boolean;
  geometryType: string;
  coordinateCount: number;
}

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const CompleteDashboard: React.FC = () => {
  const [data, setData] = useState<ElectionResult[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'grid' | 'map'>('grid');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [mapPaths, setMapPaths] = useState<PrecinctPath[]>([]);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  // Fetch and parse CSV data
  const fetchElectionData = async () => {
    try {
      const response = await fetch('/data/electionresults.csv');
      const text = await response.text();
      
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const parsedData: ElectionResult[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            if (header === 'Votes') {
              row[header] = parseInt(values[index]) || 0;
            } else {
              row[header] = values[index] || '';
            }
          });
          parsedData.push(row as ElectionResult);
        }
      }
      
      console.log(`Loaded ${parsedData.length} election results`);
      return parsedData;
    } catch (err) {
      console.error('Error loading election data:', err);
      throw new Error('Failed to load election data');
    }
  };

  // Fetch precinct boundaries
  const fetchPrecinctBoundaries = async () => {
    try {
      const response = await fetch('/data/precinct-boundaries.geojson');
      const geoJson = await response.json();
      
      // Filter for Washington County only
      const washingtonFeatures = geoJson.features.filter((feature: any) => {
        const countyName = feature.properties.COUNTY || 
                          feature.properties.CountyName || 
                          feature.properties.County;
        return countyName === 'W';
      });
      
      console.log(`Filtered to ${washingtonFeatures.length} Washington County precincts from ${geoJson.features.length} total`);
      
      return {
        type: 'FeatureCollection',
        features: washingtonFeatures
      };
    } catch (err) {
      console.error('Error loading GeoJSON:', err);
      throw new Error('Failed to load precinct boundaries');
    }
  };

  // Fixed coordinate extraction function
  const extractAllValidCoordinates = (geometry: any) => {
    const isValidCoordinate = (coord: any) => {
      if (!Array.isArray(coord) || coord.length !== 2) return false;
      const [lng, lat] = coord;
      if (typeof lng !== 'number' || typeof lat !== 'number') return false;
      if (isNaN(lng) || isNaN(lat)) return false;
      
      // Oregon bounds - lenient
      return lng >= -125 && lng <= -120 && lat >= 44 && lat <= 47;
    };

    let allCoordinates: [number, number][] = [];

    try {
      if (geometry.type === 'Polygon') {
        // For Polygon: coordinates[0] is the outer ring
        const outerRing = geometry.coordinates[0];
        allCoordinates = outerRing.filter(isValidCoordinate);
        
      } else if (geometry.type === 'MultiPolygon') {
        // For MultiPolygon: iterate through all polygons and all their rings
        geometry.coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any, ringIndex: number) => {
            // Usually only use outer rings (ringIndex === 0) for visualization
            if (ringIndex === 0) { // Only outer rings
              const validRingCoords = ring.filter(isValidCoordinate);
              allCoordinates = allCoordinates.concat(validRingCoords);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error extracting coordinates:', error);
    }

    return allCoordinates;
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [electionData, boundaries] = await Promise.all([
          fetchElectionData(),
          fetchPrecinctBoundaries()
        ]);
        
        setData(electionData);
        setGeoData(boundaries);
        
        // Set default race
        const races = [...new Set(electionData.map(d => d['Contest Name']))];
        if (races.length > 0) {
          setSelectedRace(races[0]);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process geographic data when geoData or election data changes
  useEffect(() => {
    if (!geoData || !data) return;

    const bounds = { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity };
    const precinctPaths: PrecinctPath[] = [];

    geoData.features.forEach((feature: any) => {
      const precinctId = feature.properties.PRECINCT || 
                        feature.properties.PRECINCTID || 
                        feature.properties.NAME;
      
      // Use the fixed coordinate extraction
      const coords = extractAllValidCoordinates(feature.geometry);
      
      if (coords.length === 0) {
        console.log(`Skipping precinct ${precinctId} - no valid coordinates`);
        return;
      }

      console.log(`Precinct ${precinctId} (${feature.geometry.type}): ${coords.length} valid coordinates`);

      // Update bounds
      coords.forEach(([lng, lat]) => {
        bounds.minLat = Math.min(bounds.minLat, lat);
        bounds.maxLat = Math.max(bounds.maxLat, lat);
        bounds.minLng = Math.min(bounds.minLng, lng);
        bounds.maxLng = Math.max(bounds.maxLng, lng);
      });

      // Create SVG path
      const pathData = coords.map(([lng, lat], coordIndex) => {
        const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 800;
        const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 600;
        return `${coordIndex === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ') + ' Z';

      // Check if this precinct has election data
      const hasElectionData = data.some(d => 
        d.Precinct && d.Precinct.toString() === precinctId.toString()
      );

      precinctPaths.push({
        id: precinctId,
        path: pathData,
        hasElectionData,
        geometryType: feature.geometry.type,
        coordinateCount: coords.length
      });
    });

    setMapPaths(precinctPaths);
    setMapBounds(bounds);
    
    console.log(`Processed ${precinctPaths.length} precincts total`);
    console.log(`Precincts with election data: ${precinctPaths.filter(p => p.hasElectionData).length}`);
    
  }, [geoData, data]);

  // Get unique races
  const races = [...new Set(data.map(d => d['Contest Name']))];

  // Get data for selected race
  const getRaceData = () => {
    if (!selectedRace) return [];
    
    const raceData = data.filter(d => d['Contest Name'] === selectedRace);
    const candidateVotes = raceData.reduce((acc, curr) => {
      if (!acc[curr['Candidate Name']]) {
        acc[curr['Candidate Name']] = 0;
      }
      acc[curr['Candidate Name']] += curr.Votes;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(candidateVotes).map(([name, votes]) => ({
      candidate: name,
      votes
    }));
  };

  // Get precinct-level data for selected race
  const getPrecinctData = () => {
    if (!selectedRace) return [];
    
    const raceData = data.filter(d => d['Contest Name'] === selectedRace);
    const precinctVotes = raceData.reduce((acc, curr) => {
      if (!acc[curr.Precinct]) {
        acc[curr.Precinct] = {};
      }
      if (!acc[curr.Precinct][curr['Candidate Name']]) {
        acc[curr.Precinct][curr['Candidate Name']] = 0;
      }
      acc[curr.Precinct][curr['Candidate Name']] += curr.Votes;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return Object.entries(precinctVotes).map(([precinct, candidates]) => ({
      precinct,
      ...candidates,
      total: Object.values(candidates).reduce((sum, votes) => sum + votes, 0)
    }));
  };

  const GridView = () => {
    const chartData = getRaceData();
    const precinctData = getPrecinctData();

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overall Results - {selectedRace}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="candidate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Precinct-by-Precinct Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Precinct</th>
                  {getRaceData().map(candidate => (
                    <th key={candidate.candidate} className="px-4 py-2 text-left">
                      {candidate.candidate}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {precinctData.map(precinct => (
                  <tr key={precinct.precinct} className="border-b">
                    <td className="px-4 py-2 font-medium">{precinct.precinct}</td>
                    {getRaceData().map(candidate => (
                      <td key={candidate.candidate} className="px-4 py-2">
                        {precinct[candidate.candidate] || 0}
                      </td>
                    ))}
                    <td className="px-4 py-2 font-medium">{precinct.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const GeographicMapView = () => {
    if (!mapBounds || mapPaths.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Geographic View - {selectedRace}</h3>
          <div className="text-center py-8">
            <p>Loading map data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Geographic View - {selectedRace}</h3>
        <div className="border border-gray-300 rounded">
          <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-auto">
            {mapPaths.map(precinct => (
              <path
                key={precinct.id}
                d={precinct.path}
                fill={precinct.hasElectionData ? "#8884d8" : "#e5e7eb"}
                stroke="#374151"
                strokeWidth="0.5"
                opacity={precinct.hasElectionData ? 0.8 : 0.3}
              >
                <title>
                  Precinct {precinct.id} ({precinct.geometryType})
                  {precinct.hasElectionData ? " - Has election data" : " - No election data"}
                  {'\n'}{precinct.coordinateCount} coordinates
                </title>
              </path>
            ))}
          </svg>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 opacity-80 mr-2"></div>
              <span>Precincts with election data ({mapPaths.filter(p => p.hasElectionData).length})</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 opacity-30 mr-2"></div>
              <span>Other Washington County precincts ({mapPaths.filter(p => !p.hasElectionData).length})</span>
            </div>
          </div>
          <p className="mt-2">
            Total precincts rendered: {mapPaths.length}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            2025 Hillsboro School District Election Results
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Race:</label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {races.map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedView === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setSelectedView('map')}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedView === 'map'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Geographic View
              </button>
            </div>
          </div>
        </div>

        {selectedView === 'grid' ? <GridView /> : <GeographicMapView />}
      </div>
    </div>
  );
};

export default CompleteDashboard;