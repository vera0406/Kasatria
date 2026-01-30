/**
 * Data Management Module
 * Handles data loading from Google Sheets and placeholder data
 */

class DataManager {
  constructor() {
    this.data = [];
    this.isLoaded = false;
  }

  /**
   * Initialize and load data
   */
  async init() {
    try {
      // Try to load from Google Sheets first
      await this.loadFromGoogleSheets();
    } catch (error) {
      console.warn('Could not load from Google Sheets, using placeholder data:', error);
      // Fallback to placeholder data
      this.loadPlaceholderData();
    }
    this.isLoaded = true;
    return this.data;
  }

  /**
   * Load data from Google Sheets
   * This will be implemented once the Google Sheet is available
   */
  async loadFromGoogleSheets() {
    if (!CONFIG.GOOGLE_SHEET_ID || CONFIG.GOOGLE_SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
      throw new Error('Google Sheet ID not configured');
    }
    const spreadsheetId = CONFIG.GOOGLE_SHEET_ID;

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    // Get CSV text (not JSON!)
    const csvText = await response.text();

    if (!csvText || csvText.length === 0) {
      throw new Error('No data found in sheet');
    }

    // Parse CSV using PapaParse if available
    let rows;
    if (typeof Papa !== 'undefined') {
      const parsed = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true
      });
      rows = parsed.data;
    } else {
      // Fallback simple CSV parser
      rows = this.parseCSV(csvText);
    }

    if (!rows || rows.length <= 1) {
      throw new Error('No data rows found in sheet');
    }

    // Parse the data (skip first row which is header)
    // Expected columns: Name, Photo, Age, Country, Interest, Net Worth
    this.data = rows.slice(1).map((row, index) => {
      // Skip empty rows
      if (!row || !row[0]) return null;

      return {
        id: index + 1,
        name: row[0] || `Person ${index + 1}`,
        photoUrl: row[1] || 'https://via.placeholder.com/60',
        age: row[2] || '',
        country: row[3] || '',
        interest: row[4] || '',
        netWorth: this.parseNetWorth(row[5] || '0'),
        initials: this.getInitials(row[0] || `P${index + 1}`)
      };
    }).filter(item => item !== null);

    console.log(`✅ Loaded ${this.data.length} items from Google Sheets`);
    return this.data;
  }

  /**
   * Simple CSV parser (fallback if PapaParse not available)
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const rows = [];

    for (let line of lines) {
      if (!line.trim()) continue;

      const row = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse net worth string to number
   */
  parseNetWorth(netWorthStr) {
    if (typeof netWorthStr === 'number') return netWorthStr;

    // Remove currency symbols and convert to number
    const cleaned = netWorthStr.replace(/[$,]/g, '');

    // Handle K (thousands) and M (millions) suffixes
    if (cleaned.includes('K') || cleaned.includes('k')) {
      return parseFloat(cleaned) * 1000;
    }
    if (cleaned.includes('M') || cleaned.includes('m')) {
      return parseFloat(cleaned) * 1000000;
    }

    return parseFloat(cleaned) || 0;
  }

  /**
   * Get initials from name
   */
  getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Load placeholder data for testing
   * Generates 200 items (20x10 for table layout)
   */
  loadPlaceholderData() {
    const interests = ['Writing', 'Cooking', 'Traveling', 'Painting', 'Hiking', 'Gardening'];
    const countries = ['MY', 'CN', 'IN', 'US'];
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Reese'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    this.data = [];
    for (let i = 0; i < 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;

      // Generate net worth with proper distribution
      let netWorth;
      const rand = Math.random();
      if (rand < 0.33) {
        // Red: < $100K
        netWorth = Math.floor(Math.random() * 99000) + 1000;
      } else if (rand < 0.66) {
        // Orange: $100K - $200K
        netWorth = Math.floor(Math.random() * 100000) + 100000;
      } else {
        // Green: > $200K
        netWorth = Math.floor(Math.random() * 800000) + 200000;
      }

      this.data.push({
        id: i + 1,
        name: name,
        age: Math.floor(Math.random() * 40) + 20,
        country: countries[Math.floor(Math.random() * countries.length)],
        interest: interests[Math.floor(Math.random() * interests.length)],
        netWorth: netWorth,
        photoUrl: `https://i.pravatar.cc/60?img=${(i % 70) + 1}`,
        initials: this.getInitials(name)
      });
    }

    return this.data;
  }

  /**
   * Get color class based on net worth
   */
  getColorClass(netWorth) {
    if (netWorth < 100000) {
      return 'low-worth'; // Red
    } else if (netWorth <= 200000) {
      return 'medium-worth'; // Orange
    } else {
      return 'high-worth'; // Green
    }
  }

  /**
   * Format net worth for display
   */
  formatNetWorth(netWorth) {
    if (netWorth >= 1000000) {
      return `$${(netWorth / 1000000).toFixed(2)}M`;
    } else if (netWorth >= 1000) {
      return `$${(netWorth / 1000).toFixed(0)}K`;
    } else {
      return `$${netWorth.toFixed(0)}`;
    }
  }

  /**
   * Get all data
   */
  getData() {
    return this.data;
  }
}

// Create global data manager instance
const dataManager = new DataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}