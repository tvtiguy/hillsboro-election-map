"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for artifact preview when CSV isn't available
const createSampleElectionData = () => {
  const samplePrecincts = [303, 304, 307, 308, 309, 310, 313, 314, 315, 316, 317, 318, 319, 322, 326, 327, 328, 329, 330, 332, 333, 334, 335, 336, 337, 338, 341, 343, 344, 345, 346, 356, 369, 370, 373, 374, 382, 422, 426, 430, 431, 439, 440, 446, 450, 451];
  
  const races = [];
  const raceConfigs = [
    { seat: 'Seat 1', candidates: ['Sidney S Thompson', 'Yesenia Hardin-Mercado'] },
    { seat: 'Seat 2', candidates: ['Mark Watson', 'Maureen Barnhart'] },
    { seat: 'Seat 4', candidates: ['Nancy Thomas'] },
    { seat: 'Seat 6', candidates: ['Katie Rhyne', 'Rebecca Descombes'] }
  ];
  
  raceConfigs.forEach(config => {
    const data = samplePrecincts.map(precinctNum => {
      const ballotsCast = Math.floor(Math.random() * 500) + 100;
      const regVoters = Math.floor(ballotsCast * (1.2 + Math.random() * 0.5));
      const totalVotes = Math.floor(ballotsCast * 0.9);
      
      const candidates = config.candidates.map((name, index) => {
        const baseVotes = index === 0 ? Math.floor(totalVotes * 0.4) : Math.floor(totalVotes * 0.6);
        const votes = baseVotes + Math.floor(Math.random() * totalVotes * 0.2);
        return {
          name,
          votes: Math.max(0, Math.min(votes, totalVotes)),
          percentage: totalVotes > 0 ? (votes / totalVotes * 100) : 0
        };
      });
      
      return {
        precinct: `Precinct ${precinctNum}`,
        precinctNumber: precinctNum,
        ballotsCast,
        regVoters,
        totalVotes,
        turnoutRate: regVoters > 0 ? (ballotsCast / regVoters * 100) : 0,
        candidates
      };
    });
    
    races.push({
      seat: config.seat,
      data,
      candidates: config.candidates,
      colors: getColorsForRace(config.seat)
    });
  });
  
  return { races };
};

// ArcGIS REST Service integration for precinct boundaries
const fetchPrecinctBoundaries = async () => {
  try {
    console.log('Fetching precinct boundaries from ArcGIS...');
    
    // Query the Washington County precinct boundaries layer
    const baseUrl = 'https://gispub.co.washington.or.us/server/rest/services/Intermap/GE_Geosearch/MapServer/400/query';
    const params = new URLSearchParams({
      'where': '1=1', // Get all precincts
      'outFields': '*', // Get all fields
      'outSR': '4326', // WGS84 lat/lng
      'f': 'geojson' // Return as GeoJSON
    });
    
    const queryUrl = `${baseUrl}?${params.toString()}`;
    console.log('Querying:', queryUrl);
    
    const response = await fetch(queryUrl);
    if (!response.ok) {
      throw new Error(`ArcGIS query failed: ${response.statusText}`);
    }
    
    const geoJsonData = await response.json();
    console.log('Received GeoJSON data:', geoJsonData);
    
    if (geoJsonData.features && geoJsonData.features.length > 0) {
      console.log('Sample precinct feature:', geoJsonData.features[0]);
      console.log('Available properties:', Object.keys(geoJsonData.features[0].properties || {}));
    }
    
    return geoJsonData;
    
  } catch (error) {
    console.error('Error fetching precinct boundaries:', error);
    return null;
  }
};

// CSV PARSER - Reads the accurate election data from CSV
const parseElectionCSV = async (csvFileName) => {
  try {
    console.log('Attempting to fetch:', `/data/${csvFileName}`);
    // Try to read the CSV content from public folder
    let response;
    try {
      response = await fetch(`/data/${csvFileName}`);
    } catch (fetchError) {
      // Fallback for artifact environment - use placeholder data
      console.log('Fetch failed, using sample data for artifact preview');
      return createSampleElectionData();
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvContent = await response.text();
    console.log('CSV content length:', csvContent.length);
    
    // Parse standard CSV format
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    console.log('CSV Headers:', headers);
    console.log('Total lines:', lines.length);
    
    const rawData = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rawData.push(row);
    }
    
    console.log('Sample row:', rawData[0]);
    console.log('Total rows:', rawData.length);
    
    // Group by position/race
    const raceGroups = {};
    rawData.forEach(row => {
      const position = row.Position || row.position;
      if (!raceGroups[position]) {
        raceGroups[position] = [];
      }
      raceGroups[position].push(row);
    });
    
    console.log('Race groups:', Object.keys(raceGroups));
    Object.keys(raceGroups).forEach(position => {
      console.log(`${position}: ${raceGroups[position].length} precincts`);
      if (raceGroups[position].length > 0) {
        console.log('Sample data:', raceGroups[position][0]);
      }
    });
    
    // Convert to the format expected by the dashboard
    const races = [];
    
    Object.entries(raceGroups).forEach(([position, precinctData]) => {
      if (precinctData.length === 0) return;
      
      // Map position names to seat names
      let seatName;
      if (position.includes('Position 1') || position.includes('1')) seatName = 'Seat 1';
      else if (position.includes('Position 2') || position.includes('2')) seatName = 'Seat 2';
      else if (position.includes('Position 3') || position.includes('3')) seatName = 'Seat 4';
      else if (position.includes('Position 6') || position.includes('6')) seatName = 'Seat 6';
      else seatName = position;
      
      // Get candidate names from first row
      const firstRow = precinctData[0];
      const candidates = [];
      if (firstRow.Candidate1Name && firstRow.Candidate1Name !== '') {
        candidates.push(firstRow.Candidate1Name);
      }
      if (firstRow.Candidate2Name && firstRow.Candidate2Name !== '') {
        candidates.push(firstRow.Candidate2Name);
      }
      
      console.log(`Processing ${seatName}: candidates = ${candidates.join(', ')}`);
      
      // Process each precinct
      const processedData = precinctData.map(row => {
        const precinctNumber = parseInt(row.Precinct) || 0;
        const ballotsCast = parseInt(row.BallotsCast) || 0;
        const regVoters = parseInt(row.RegisteredVoters) || 0;
        const totalVotes = parseInt(row.TotalVotes) || 0;
        const turnoutRate = regVoters > 0 ? (ballotsCast / regVoters * 100) : 0;
        
        const candidateResults = [];
        if (row.Candidate1Name && row.Candidate1Name !== '') {
          candidateResults.push({
            name: row.Candidate1Name,
            votes: parseInt(row.Candidate1Votes) || 0,
            percentage: parseFloat(row.Candidate1Percentage) || 0
          });
        }
        if (row.Candidate2Name && row.Candidate2Name !== '') {
          candidateResults.push({
            name: row.Candidate2Name,
            votes: parseInt(row.Candidate2Votes) || 0,
            percentage: parseFloat(row.Candidate2Percentage) || 0
          });
        }
        
        return {
          precinct: `Precinct ${precinctNumber}`,
          precinctNumber,
          ballotsCast,
          regVoters,
          totalVotes,
          turnoutRate,
          candidates: candidateResults
        };
      });
      
      races.push({
        seat: seatName,
        data: processedData,
        candidates: candidates,
        colors: getColorsForRace(seatName)
      });
      
      console.log(`Processed ${seatName}: ${processedData.length} precincts, candidates: ${candidates.join(', ')}`);
    });
    
    return { races };
    
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

const getColorsForRace = (raceName) => {
  // Red and blue color scheme based on candidate preferences
  const candidateColors = {
    // Red candidates
    'Sidney S Thompson': '#DC2626', // red-600
    'Sidney S. Thompson': '#DC2626',
    'Maureen Barnhart': '#DC2626',
    'Rebecca Descombes': '#DC2626',
    'Rebecca Denison': '#DC2626', // In case of name variation
    
    // Blue candidates  
    'Yesenia Hardin-Mercado': '#2563EB', // blue-600
    'Yessica Hardin-Mercado': '#2563EB', // In case of name variation
    'Mark Watson': '#2563EB',
    'Nancy Thomas': '#2563EB',
    'Katie Rhyne': '#2563EB'
  };
  
  return candidateColors;
};

// Geographic Map Component - renders actual precinct boundaries
const GeographicMapView = ({ raceData, viewMode, onPrecinctClick, selectedPrecinct, precinctBoundaries }) => {
  const mapRef = React.useRef(null);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });

  const getPrecinctColor = (precinctNumber) => {
    const precinctData = raceData.data.find(p => p.precinctNumber === precinctNumber);
    if (!precinctData) return '#E5E7EB';

    if (viewMode === 'turnout') {
      const rate = precinctData.turnoutRate;
      if (rate < 15) return '#FEF3C7';
      if (rate < 25) return '#FDE047'; 
      if (rate < 35) return '#EAB308';
      if (rate < 45) return '#CA8A04';
      return '#92400E';
    }

    if (precinctData.candidates.length === 0) return '#E5E7EB';
    
    let winner = precinctData.candidates[0];
    for (let candidate of precinctData.candidates) {
      if (candidate.votes > winner.votes) {
        winner = candidate;
      }
    }

    // Use candidate-specific colors
    const candidateColors = getColorsForRace();
    return candidateColors[winner.name] || '#6B7280';
  };

  const handleZoomIn = () => {
    console.log('Zoom in clicked! Current zoom:', zoomLevel);
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.5, 5);
      console.log('Setting zoom from', prev, 'to', newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    console.log('Zoom out clicked! Current zoom:', zoomLevel);
    setZoomLevel(prev => {
      const newZoom = Math.max(prev / 1.5, 0.5);
      console.log('Setting zoom from', prev, 'to', newZoom);
      return newZoom;
    });
  };

  const handleResetView = () => {
    console.log('Reset view clicked!');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePanUp = () => {
    console.log('Pan up clicked!');
    setPanOffset(prev => ({ ...prev, y: prev.y + 50 }));
  };

  const handlePanDown = () => {
    console.log('Pan down clicked!');
    setPanOffset(prev => ({ ...prev, y: prev.y - 50 }));
  };

  const handlePanLeft = () => {
    console.log('Pan left clicked!');
    setPanOffset(prev => ({ ...prev, x: prev.x + 50 }));
  };

  const handlePanRight = () => {
    console.log('Pan right clicked!');
    setPanOffset(prev => ({ ...prev, x: prev.x - 50 }));
  };

  // Simple centroid calculation for labeling
  const calculateCentroid = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    
    let x = 0, y = 0;
    coordinates.forEach(([lng, lat]) => {
      x += lng;
      y += lat;
    });
    
    return [x / coordinates.length, y / coordinates.length];
  };

  // Simple SVG-based map renderer
  React.useEffect(() => {
    if (!precinctBoundaries || !precinctBoundaries.features || !mapRef.current) return;
    
    console.log('Rendering geographic map with zoom:', zoomLevel, 'pan:', panOffset);
    
    // Debug: Check what properties are available in the GIS data
    if (precinctBoundaries.features.length > 0) {
      const sampleFeature = precinctBoundaries.features[0];
      console.log('Sample GIS feature properties:', sampleFeature.properties);
    }
    
    // Debug: Show what precinct numbers we have in our CSV data
    console.log('CSV precinct numbers:', raceData.data.map(p => p.precinctNumber).sort((a, b) => a - b));
    
    // Clear previous content
    mapRef.current.innerHTML = '';
    
    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let validCoordinatesFound = false;
    
    precinctBoundaries.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates[0]; // First ring of polygon
        if (coords && coords.length > 0) {
          coords.forEach(([lng, lat]) => {
            if (typeof lng === 'number' && typeof lat === 'number' && 
                !isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
              minX = Math.min(minX, lng);
              maxX = Math.max(maxX, lng);
              minY = Math.min(minY, lat);
              maxY = Math.max(maxY, lat);
              validCoordinatesFound = true;
            }
          });
        }
      }
    });
    
    if (!validCoordinatesFound || minX === Infinity || maxX === -Infinity) {
      console.error('No valid coordinates found in GIS data');
      mapRef.current.innerHTML = '<div class="p-4 text-center text-red-500">Error: Invalid coordinate data</div>';
      return;
    }
    
    console.log(`Map bounds: X(${minX}, ${maxX}), Y(${minY}, ${maxY})`);
    
    const width = 600;
    const height = 400;
    const padding = 20;
    
    // Add small buffer to prevent edge cases
    const bufferX = (maxX - minX) * 0.05;
    const bufferY = (maxY - minY) * 0.05;
    minX -= bufferX;
    maxX += bufferX;
    minY -= bufferY;
    maxY += bufferY;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.background = '#f8fafc';
    svg.style.border = '1px solid #e2e8f0';
    svg.style.borderRadius = '8px';
    
    // Scale functions with zoom and pan applied correctly
    const baseWidth = width - 2 * padding;
    const baseHeight = height - 2 * padding;
    
    const scaleX = (lng) => {
      const normalized = (lng - minX) / (maxX - minX);
      const basePos = normalized * baseWidth + padding;
      // Apply zoom from center and add pan offset
      const centerX = width / 2;
      return centerX + (basePos - centerX) * zoomLevel + panOffset.x;
    };
    
    const scaleY = (lat) => {
      const normalized = (lat - minY) / (maxY - minY);
      const basePos = height - (normalized * baseHeight + padding);
      // Apply zoom from center and add pan offset  
      const centerY = height / 2;
      return centerY + (basePos - centerY) * zoomLevel + panOffset.y;
    };
    
    console.log(`Applying zoom: ${zoomLevel}x, pan: (${panOffset.x}, ${panOffset.y}) to SVG coordinates`);
    
    let matchedCount = 0;
    
    // Render each precinct
    precinctBoundaries.features.forEach(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return;
      
      // Try to match precinct from properties - check all possible field names
      const props = feature.properties || {};
      console.log('Checking properties for matching:', props);
      
      // Try various possible precinct identifier fields (both upper and lowercase)
      let precinctNumber = 0;
      const possibleFields = [
        'precinctid', 'precinct_id', 'prec_id', 'name', 'id', 'precinct_no', 'prec_no', 'number',
        'PRECINCTID', 'PRECINCT_ID', 'PREC_ID', 'NAME', 'ID', 'PRECINCT_NO', 'PREC_NO', 'NUMBER',
        'PRECINCT', 'precinct'
      ];
      
      for (const field of possibleFields) {
        if (props[field]) {
          const value = props[field];
          // Try to extract number from the value
          const extracted = parseInt(value) || parseInt(value.toString().replace(/\D/g, ''));
          if (extracted > 0) {
            precinctNumber = extracted;
            console.log(`✓ Found precinct ${precinctNumber} using field ${field} with value ${value}`);
            break;
          }
        }
      }
      
      if (precinctNumber === 0) {
        console.log('Could not extract precinct number from:', props);
        return; // Skip if we can't identify the precinct
      }
      
      // Check if this precinct exists in our election data
      const matchingData = raceData.data.find(p => p.precinctNumber === precinctNumber);
      if (matchingData) {
        matchedCount++;
        console.log(`Successfully matched precinct ${precinctNumber}`);
      } else {
        console.log(`No election data found for precinct ${precinctNumber}`);
      }
      
      const coords = feature.geometry.coordinates[0]; // First ring
      const pathData = coords.map(([lng, lat], index) => {
        const x = scaleX(lng);
        const y = scaleY(lat);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ') + ' Z';
      
      // Create path element
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      
      // Color based on whether we have election data
      if (matchingData) {
        path.setAttribute('fill', getPrecinctColor(precinctNumber));
      } else {
        path.setAttribute('fill', '#f3f4f6'); // Light gray for no data
      }
      
      path.setAttribute('stroke', selectedPrecinct?.precinctNumber === precinctNumber ? '#1f2937' : '#9ca3af');
      path.setAttribute('stroke-width', selectedPrecinct?.precinctNumber === precinctNumber ? '2' : '0.5');
      path.style.cursor = 'pointer';
      path.style.transition = 'all 0.2s ease';
      
      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke', '#374151');
        path.setAttribute('stroke-width', '1.5');
      });
      
      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke', selectedPrecinct?.precinctNumber === precinctNumber ? '#1f2937' : '#9ca3af');
        path.setAttribute('stroke-width', selectedPrecinct?.precinctNumber === precinctNumber ? '2' : '0.5');
      });
      
      // Add click handler
      path.addEventListener('click', () => {
        if (matchingData && onPrecinctClick) {
          onPrecinctClick(matchingData);
        }
      });
      
      svg.appendChild(path);
      
      // Add precinct label
      const centroid = calculateCentroid(coords);
      if (centroid) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', scaleX(centroid[0]));
        text.setAttribute('y', scaleY(centroid[1]));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '8');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', matchingData ? '#374151' : '#9ca3af');
        text.setAttribute('pointer-events', 'none');
        text.textContent = precinctNumber;
        svg.appendChild(text);
      }
    });
    
    console.log(`Geographic map: ${matchedCount} precincts matched out of ${precinctBoundaries.features.length} GIS features and ${raceData.data.length} CSV records`);
    mapRef.current.appendChild(svg);
    
  }, [precinctBoundaries, raceData, viewMode, selectedPrecinct, zoomLevel, panOffset]);

  if (!precinctBoundaries) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center text-gray-500">
          <div>Loading precinct boundaries...</div>
          <div className="text-sm mt-1">Fetching from Washington County GIS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-800">
            {raceData.seat} - Geographic View
          </h4>
          <div className="text-xs text-gray-600">
            {precinctBoundaries.features.length} boundaries loaded • Click precincts for details
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="p-4 relative">
        {/* Zoom and Pan Controls */}
        <div className="absolute top-6 right-6 z-10 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Zoom Controls */}
          <div className="flex flex-col">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded-t-lg"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors border-t border-gray-200"
              title="Zoom Out"
            >
              −
            </button>
          </div>
          
          {/* Pan Controls */}
          <div className="border-t border-gray-200 p-1">
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <button
                onClick={handlePanUp}
                className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded"
                title="Pan Up"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={handlePanLeft}
                className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded"
                title="Pan Left"
              >
                ←
              </button>
              <button
                onClick={handleResetView}
                className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded"
                title="Reset View"
              >
                ⌂
              </button>
              <button
                onClick={handlePanRight}
                className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded"
                title="Pan Right"
              >
                →
              </button>
              <div></div>
              <button
                onClick={handlePanDown}
                className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors rounded"
                title="Pan Down"
              >
                ↓
              </button>
              <div></div>
            </div>
          </div>
        </div>
        
        <div ref={mapRef} className="w-full flex justify-center">
          {/* SVG will be inserted here */}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        {viewMode === 'turnout' ? (
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">Turnout Rate:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
                <span>&lt;15%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FDE047' }}></div>
                <span>15-25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EAB308' }}></div>
                <span>25-35%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CA8A04' }}></div>
                <span>35-45%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#92400E' }}></div>
                <span>45%+</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">Winning Candidate:</span>
            <div className="flex items-center gap-3">
              {raceData.candidates.map((candidate) => {
                const candidateColors = getColorsForRace();
                const color = candidateColors[candidate] || '#6B7280';
                return (
                  <div key={candidate} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="max-w-20 truncate">{candidate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced precinct grid component (fallback)
const InteractiveMapView = ({ raceData, viewMode, onPrecinctClick, selectedPrecinct }) => {
  if (!raceData || !raceData.data) return <div>No data available</div>;

  const getPrecinctColor = (precinctNumber) => {
    const precinctData = raceData.data.find(p => p.precinctNumber === precinctNumber);
    if (!precinctData) return '#E5E7EB';

    if (viewMode === 'turnout') {
      const rate = precinctData.turnoutRate;
      if (rate < 15) return '#FEF3C7';
      if (rate < 25) return '#FDE047'; 
      if (rate < 35) return '#EAB308';
      if (rate < 45) return '#CA8A04';
      return '#92400E';
    }

    if (precinctData.candidates.length === 0) return '#E5E7EB';
    
    let winner = precinctData.candidates[0];
    for (let candidate of precinctData.candidates) {
      if (candidate.votes > winner.votes) {
        winner = candidate;
      }
    }

    // Use candidate-specific colors
    const candidateColors = getColorsForRace();
    return candidateColors[winner.name] || '#6B7280';
  };

  const allPrecincts = raceData.data.map(p => p.precinctNumber).sort((a, b) => a - b);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-gray-200 relative overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-white bg-opacity-90 p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-800">
            {raceData.seat} - {viewMode === 'results' ? 'Results' : 'Turnout'} by Precinct
          </h4>
          <div className="text-xs text-gray-600">
            {raceData.data.length} precincts • Click for details
          </div>
        </div>
      </div>

      {/* Map Area - Simple grid layout */}
      <div className="p-4 h-[450px] overflow-auto">
        <div className="grid grid-cols-8 gap-2">
          {allPrecincts.map(precinctNum => {
            const precinctData = raceData.data.find(p => p.precinctNumber === precinctNum);
            const isSelected = selectedPrecinct?.precinctNumber === precinctNum;
            
            return (
              <div
                key={precinctNum}
                className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg flex items-center justify-center relative ${
                  isSelected 
                    ? 'border-gray-800 shadow-xl ring-2 ring-blue-400' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ 
                  backgroundColor: getPrecinctColor(precinctNum)
                }}
                onClick={() => onPrecinctClick && onPrecinctClick(precinctData)}
              >
                {/* Precinct Number */}
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-800 leading-none">
                    {precinctNum}
                  </div>
                  {precinctData && (
                    <div className="text-xs text-gray-700 leading-none mt-0.5">
                      {viewMode === 'turnout' 
                        ? `${precinctData.turnoutRate.toFixed(0)}%`
                        : `${precinctData.ballotsCast}`
                      }
                    </div>
                  )}
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white bg-opacity-95 p-3 border-t border-gray-200">
        {viewMode === 'turnout' ? (
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">Turnout Rate:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
                <span>&lt;15%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FDE047' }}></div>
                <span>15-25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EAB308' }}></div>
                <span>25-35%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CA8A04' }}></div>
                <span>35-45%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#92400E' }}></div>
                <span>45%+</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">Winning Candidate:</span>
            <div className="flex items-center gap-3">
              {raceData.candidates.map((candidate) => {
                const candidateColors = getColorsForRace();
                const color = candidateColors[candidate] || '#6B7280';
                return (
                  <div key={candidate} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="max-w-20 truncate">{candidate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main dashboard component
const CSVDashboard = () => {
  const [electionData, setElectionData] = useState(null);
  const [precinctBoundaries, setPrecinctBoundaries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState('Seat 1');
  const [viewMode, setViewMode] = useState('results');
  const [selectedPrecinct, setSelectedPrecinct] = useState(null);
  const [mapType, setMapType] = useState('auto');

  // Load both CSV data and GIS boundaries on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load election CSV data
        console.log('Loading election data...');
        const parsedData = await parseElectionCSV('electionresults.csv');
        console.log('Parsed CSV election data:', parsedData);
        setElectionData(parsedData);
        
        // Set default race to first available race
        if (parsedData.races && parsedData.races.length > 0) {
          setSelectedRace(parsedData.races[0].seat);
        }
        
        // Fetch precinct boundaries from ArcGIS
        console.log('Loading precinct boundaries...');
        const boundaryData = await fetchPrecinctBoundaries();
        if (boundaryData) {
          console.log('Successfully loaded precinct boundaries');
          setPrecinctBoundaries(boundaryData);
          setMapType('geographic');
        } else {
          console.log('Using enhanced grid fallback');
          setMapType('grid');
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setMapType('grid');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const currentRace = useMemo(() => {
    if (!electionData) return null;
    return electionData.races.find(race => race.seat === selectedRace);
  }, [electionData, selectedRace]);

  const raceOverview = useMemo(() => {
    if (!currentRace) return null;
    
    const totalVotes = currentRace.data.reduce((sum, precinct) => sum + precinct.totalVotes, 0);
    const totalBallots = currentRace.data.reduce((sum, precinct) => sum + precinct.ballotsCast, 0);
    const totalRegVoters = currentRace.data.reduce((sum, precinct) => sum + precinct.regVoters, 0);
    
    const candidateTotals = currentRace.candidates.map((name, index) => {
      const total = currentRace.data.reduce((sum, precinct) => {
        const candidateVotes = precinct.candidates[index]?.votes || 0;
        return sum + candidateVotes;
      }, 0);
      return { 
        name, 
        votes: total, 
        percentage: totalVotes > 0 ? (total / totalVotes * 100).toFixed(1) : 0 
      };
    }).sort((a, b) => b.votes - a.votes); // Sort by votes descending - winner first

    console.log(`\n=== TOTALS FOR ${currentRace.seat} (FROM CSV) ===`);
    console.log(`Total votes across all precincts: ${totalVotes}`);
    console.log(`Total ballots cast: ${totalBallots}`);
    console.log(`Number of precincts: ${currentRace.data.length}`);
    candidateTotals.forEach(candidate => {
      console.log(`${candidate.name}: ${candidate.votes} votes (${candidate.percentage}%)`);
    });

    return { 
      totalVotes, 
      totalBallots, 
      totalRegVoters, 
      candidateTotals, 
      overallTurnout: totalRegVoters > 0 ? (totalBallots / totalRegVoters * 100).toFixed(1) : 0
    };
  }, [currentRace]);

  const handlePrecinctClick = (precinctData) => {
    setSelectedPrecinct(precinctData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">Loading Election Data...</div>
          <div className="text-sm text-gray-500">
            Loading CSV data and fetching geographic boundaries
          </div>
          <div className="mt-4 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <div className="text-xl font-semibold text-red-700 mb-2">Error Loading Data</div>
          <div className="text-sm text-red-600 mb-4">{error}</div>
          <div className="text-sm text-gray-600">
            Make sure electionresults.csv is in your public/data/ folder
          </div>
        </div>
      </div>
    );
  }

  if (!electionData || !currentRace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">No Election Data Found</div>
          <div className="text-sm text-gray-500 mt-2">
            Available races: {electionData?.races?.map(r => r.seat).join(', ') || 'None'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hillsboro School District Election Results
          </h1>
          <p className="text-lg text-gray-600">May 2025 Election - Official Washington County Results</p>
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
                {electionData.races.map(race => (
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

            {/* Map Type Selector */}
            {precinctBoundaries && (
              <div className="flex gap-2">
                <label className="text-sm font-medium text-gray-700">Map:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMapType('geographic')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      mapType === 'geographic' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Geographic
                  </button>
                  <button
                    onClick={() => setMapType('grid')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      mapType === 'grid' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Precinct View
                  </button>
                </div>
              </div>
            )}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRace} - {viewMode === 'results' ? 'Results' : 'Turnout'} by Precinct
              {mapType === 'geographic' && <span className="text-sm font-normal text-green-600 ml-2">(Geographic View)</span>}
              {mapType === 'grid' && <span className="text-sm font-normal text-blue-600 ml-2">(Grid View)</span>}
            </h3>
            
            {/* Conditional Map Rendering */}
            {mapType === 'geographic' && precinctBoundaries ? (
              <GeographicMapView 
                raceData={currentRace}
                viewMode={viewMode}
                onPrecinctClick={handlePrecinctClick}
                selectedPrecinct={selectedPrecinct}
                precinctBoundaries={precinctBoundaries}
              />
            ) : (
              <InteractiveMapView 
                raceData={currentRace}
                viewMode={viewMode}
                onPrecinctClick={handlePrecinctClick}
                selectedPrecinct={selectedPrecinct}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{selectedRace} Results</h3>
              {raceOverview && (
                <div className="space-y-3">
                  {raceOverview.candidateTotals.map((candidate) => {
                    const candidateColors = getColorsForRace();
                    const color = candidateColors[candidate.name] || '#6B7280';
                    return (
                      <div key={candidate.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-sm font-medium">{candidate.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{candidate.votes.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">{candidate.percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Precinct Details */}
            {selectedPrecinct && (
              <div className="bg-white rounded-lg shadow-sm p-6">
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
                  {selectedPrecinct.candidates.map((candidate, index) => (
                    <div key={candidate.name} className="flex justify-between text-sm">
                      <span>{candidate.name}:</span>
                      <span className="font-medium">{candidate.votes} ({candidate.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVDashboard;