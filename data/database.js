// lib/database.js - SQLite database setup and utilities
import Database from 'better-sqlite3';
import path from 'path';

let db = null;

// Initialize database connection
export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'elections.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Initialize database schema
export function initDatabase() {
  const db = getDatabase();
  
  // Create tables
  db.exec(`
    -- Elections table
    CREATE TABLE IF NOT EXISTS elections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      election_date DATE NOT NULL,
      election_type TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Races table
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER REFERENCES elections(id),
      race_name TEXT NOT NULL,
      race_type TEXT NOT NULL,
      district TEXT,
      position TEXT,
      seats_available INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Candidates table
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id INTEGER REFERENCES races(id),
      full_name TEXT NOT NULL,
      display_name TEXT,
      party_affiliation TEXT,
      incumbent BOOLEAN DEFAULT false,
      candidate_order INTEGER,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Precincts table
    CREATE TABLE IF NOT EXISTS precincts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER REFERENCES elections(id),
      precinct_number INTEGER NOT NULL,
      precinct_name TEXT NOT NULL,
      registered_voters INTEGER,
      geographical_area TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(election_id, precinct_number)
    );

    -- Vote results table
    CREATE TABLE IF NOT EXISTS vote_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      precinct_id INTEGER REFERENCES precincts(id),
      candidate_id INTEGER REFERENCES candidates(id),
      votes INTEGER NOT NULL DEFAULT 0,
      percentage DECIMAL(5,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(precinct_id, candidate_id)
    );

    -- Precinct statistics table
    CREATE TABLE IF NOT EXISTS precinct_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      precinct_id INTEGER REFERENCES precincts(id),
      race_id INTEGER REFERENCES races(id),
      ballots_cast INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      over_votes INTEGER DEFAULT 0,
      under_votes INTEGER DEFAULT 0,
      write_in_votes INTEGER DEFAULT 0,
      turnout_rate DECIMAL(5,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(precinct_id, race_id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_races_election ON races(election_id);
    CREATE INDEX IF NOT EXISTS idx_candidates_race ON candidates(race_id);
    CREATE INDEX IF NOT EXISTS idx_precincts_election ON precincts(election_id);
    CREATE INDEX IF NOT EXISTS idx_vote_results_precinct ON vote_results(precinct_id);
    CREATE INDEX IF NOT EXISTS idx_vote_results_candidate ON vote_results(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_precinct_stats_precinct ON precinct_stats(precinct_id);
    CREATE INDEX IF NOT EXISTS idx_precinct_stats_race ON precinct_stats(race_id);
  `);

  console.log('Database schema initialized successfully');
}

// Seed initial data
export function seedDatabase() {
  const db = getDatabase();
  
  try {
    db.transaction(() => {
      // Insert election
      const insertElection = db.prepare(`
        INSERT OR IGNORE INTO elections (id, name, election_date, election_type, jurisdiction, description)
        VALUES (1, 'May 2025 Special District Election', '2025-05-20', 'special', 'Washington County', 'Hillsboro School District director positions')
      `);
      insertElection.run();

      // Insert races
      const insertRace = db.prepare(`
        INSERT OR IGNORE INTO races (id, election_id, race_name, race_type, district, position)
        VALUES (?, 1, ?, 'school_board', 'Hillsboro School District 1J', ?)
      `);
      
      insertRace.run(1, 'Hillsboro School District 1J, Director, Position 1', 'Position 1');
      insertRace.run(2, 'Hillsboro School District 1J, Director, Position 2', 'Position 2');
      insertRace.run(3, 'Hillsboro School District 1J, Director, Position 4', 'Position 4');
      insertRace.run(4, 'Hillsboro School District 1J, Director, Position 6', 'Position 6');

      // Insert candidates
      const insertCandidate = db.prepare(`
        INSERT OR IGNORE INTO candidates (race_id, full_name, candidate_order)
        VALUES (?, ?, ?)
      `);
      
      // Seat 1 candidates
      insertCandidate.run(1, 'Sidney S Thomason', 1);
      insertCandidate.run(1, 'Yessica Hardin-Mercado', 2);
      
      // Seat 2 candidates  
      insertCandidate.run(2, 'Mark Watson', 1);
      insertCandidate.run(2, 'Maureen Barnhart', 2);
      
      // Seat 4 candidate
      insertCandidate.run(3, 'Nancy Thomas', 1);
      
      // Seat 6 candidates
      insertCandidate.run(4, 'Katie Rhyne', 1);
      insertCandidate.run(4, 'Rebecca Denison', 2);

      console.log('Database seeded successfully');
    })();
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Import real election data from PDF
export function importElectionData() {
  const db = getDatabase();
  
  // This is the official data from your Washington County PDF
  const officialData = {
    precincts: [
      { number: 303, name: 'Precinct 303', regVoters: 440 },
      { number: 304, name: 'Precinct 304', regVoters: 1428 },
      { number: 307, name: 'Precinct 307', regVoters: 6321 },
      { number: 308, name: 'Precinct 308', regVoters: 149 },
      { number: 309, name: 'Precinct 309', regVoters: 5849 },
      { number: 310, name: 'Precinct 310', regVoters: 146 },
      { number: 313, name: 'Precinct 313', regVoters: 3 },
      { number: 314, name: 'Precinct 314', regVoters: 385 },
      { number: 315, name: 'Precinct 315', regVoters: 585 },
      { number: 316, name: 'Precinct 316', regVoters: 595 },
      { number: 317, name: 'Precinct 317', regVoters: 273 },
      { number: 318, name: 'Precinct 318', regVoters: 5271 },
      { number: 319, name: 'Precinct 319', regVoters: 6505 },
      { number: 322, name: 'Precinct 322', regVoters: 233 },
      { number: 326, name: 'Precinct 326', regVoters: 413 },
      { number: 327, name: 'Precinct 327', regVoters: 7317 },
      { number: 328, name: 'Precinct 328', regVoters: 1223 },
      { number: 329, name: 'Precinct 329', regVoters: 10173 },
      { number: 330, name: 'Precinct 330', regVoters: 2781 },
      // Add more precincts from the PDF...
    ],
    
    results: {
      // Seat 1 results (Position 1)
      1: {
        precinct_stats: [
          { precinct: 303, ballots: 96, totalVotes: 96, writeIns: 0, overVotes: 0, underVotes: 0 },
          { precinct: 304, ballots: 220, totalVotes: 216, writeIns: 0, overVotes: 0, underVotes: 4 },
          { precinct: 307, ballots: 1165, totalVotes: 1147, writeIns: 10, overVotes: 0, underVotes: 18 },
          // ... more precincts
        ],
        vote_results: [
          // Precinct 303: Sidney 53, Yessica 43
          { precinct: 303, candidate: 'Sidney S Thomason', votes: 53, percentage: 55.21 },
          { precinct: 303, candidate: 'Yessica Hardin-Mercado', votes: 43, percentage: 44.79 },
          // Precinct 304: Sidney 100, Yessica 116  
          { precinct: 304, candidate: 'Sidney S Thomason', votes: 100, percentage: 46.30 },
          { precinct: 304, candidate: 'Yessica Hardin-Mercado', votes: 116, percentage: 53.70 },
          // Add all precinct results from PDF...
        ]
      }
      // Add results for races 2, 3, 4...
    }
  };

  try {
    db.transaction(() => {
      // Insert precincts
      const insertPrecinct = db.prepare(`
        INSERT OR REPLACE INTO precincts (election_id, precinct_number, precinct_name, registered_voters)
        VALUES (1, ?, ?, ?)
      `);
      
      officialData.precincts.forEach(precinct => {
        insertPrecinct.run(precinct.number, precinct.name, precinct.regVoters);
      });

      // Insert vote results and precinct stats
      // This would be expanded with the full data from your PDF
      console.log('Official election data imported successfully');
    })();
  } catch (error) {
    console.error('Error importing election data:', error);
  }
}

// Query helpers
export function getElections() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM elections ORDER BY election_date DESC').all();
}

export function getRaces(electionId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, COUNT(c.id) as candidate_count
    FROM races r
    LEFT JOIN candidates c ON r.id = c.race_id
    WHERE r.election_id = ? AND r.is_active = true
    GROUP BY r.id
    ORDER BY r.position
  `).all(electionId);
}

export function getRaceResults(raceId) {
  const db = getDatabase();
  
  // Get race info
  const race = db.prepare('SELECT * FROM races WHERE id = ?').get(raceId);
  
  // Get candidates
  const candidates = db.prepare(`
    SELECT * FROM candidates 
    WHERE race_id = ? AND is_active = true 
    ORDER BY candidate_order
  `).all(raceId);
  
  // Get precincts with results
  const precincts = db.prepare(`
    SELECT 
      p.*,
      ps.ballots_cast,
      ps.total_votes,
      ps.turnout_rate,
      ps.over_votes,
      ps.under_votes,
      ps.write_in_votes
    FROM precincts p
    LEFT JOIN precinct_stats ps ON p.id = ps.precinct_id AND ps.race_id = ?
    WHERE p.election_id = (SELECT election_id FROM races WHERE id = ?)
    ORDER BY p.precinct_number
  `).all(raceId, raceId);
  
  // Get vote results
  const voteResults = db.prepare(`
    SELECT 
      vr.*,
      c.full_name as candidate_name,
      p.precinct_number
    FROM vote_results vr
    JOIN candidates c ON vr.candidate_id = c.id
    JOIN precincts p ON vr.precinct_id = p.id
    WHERE c.race_id = ?
    ORDER BY p.precinct_number, c.candidate_order
  `).all(raceId);
  
  return {
    race,
    candidates,
    precincts,
    voteResults
  };
}