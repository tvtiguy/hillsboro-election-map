"use client"
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

// Simplified grid-based visualization (no Leaflet complexity)
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

  const allPrecincts = [303, 304, 307, 310, 318, 327, 329, 330, 334, 339, 341, 373];

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border relative overflow-hidden">
      <div className="absolute inset-0 p-4">
        <div className="grid grid-cols-4 gap-2 h-full">
          {allPrecincts.map(precinctNum => {
            const precinctData = raceData.data.find(p => p.precinctNumber === precinctNum);
            const isSelected = selectedPrecinct?.precinctNumber === precinctNum;
            
            return (
              <div
                key={precinctNum}
                className={`rounded border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'border-gray-800 shadow-lg' : 'border-gray-400'
                }`}
                style={{ 
                  backgroundColor: getPrecinctColor(precinctNum),
                  minHeight: '60px'
                }}
                onClick={() => onPrecinctClick && onPrecinctClick(precinctData)}
              >
                <div className="p-2 text-center">
                  <div className="text-sm font-semibold text-gray-800">
                    P{precinctNum}
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
        Hillsboro School District Precincts
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hillsboro School District Election Results
          </h1>
          <p className="text-lg text-gray-600">May 2025 Election - Interactive Analysis</p>
        </div>

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
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRace} - {viewMode === 'results' ? 'Results' : 'Turnout'} by Precinct
            </h3>
            <SimpleMapView 
              raceData={currentRace}
              viewMode={viewMode}
              onPrecinctClick={handlePrecinctClick}
              selectedPrecinct={selectedPrecinct}
            />
          </div>

          <div className="space-y-4">
            <MapLegend raceData={currentRace} viewMode={viewMode} />
            
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
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Click on a precinct to view details</p>
            )}
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default CompleteDashboard;