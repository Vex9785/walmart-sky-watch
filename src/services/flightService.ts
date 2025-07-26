import { Flight, Aircraft, FlightAlert } from '../types/flight';

class FlightService {
  private readonly OPENSKY_BASE_URL = 'https://opensky-network.org/api';
  private readonly WALMART_AIRCRAFT_ICAO = [
    // Known Walmart aircraft ICAO24 codes
    'a0b2c3', 'a1b2c4', 'a2b3c5' // These would need to be actual Walmart aircraft codes
  ];
  
  private monitoringInterval: number | null = null;
  private alertCallback: ((alert: FlightAlert) => void) | null = null;

  // Minnesota bounding box coordinates
  private readonly MINNESOTA_BOUNDS = {
    north: 49.384, // Northern border with Canada
    south: 43.499, // Southern border with Iowa
    east: -89.491, // Eastern border with Wisconsin
    west: -97.239  // Western border with North Dakota
  };

  async getAllFlights(): Promise<Flight[]> {
    try {
      const response = await fetch(`${this.OPENSKY_BASE_URL}/states/all`);
      const data = await response.json();
      
      if (!data.states) return [];
      
      return data.states.map((state: any[]) => ({
        icao24: state[0],
        callsign: state[1]?.trim() || '',
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        true_track: state[10],
        vertical_rate: state[11],
        sensors: state[12],
        geo_altitude: state[13],
        squawk: state[14],
        spi: state[15],
        position_source: state[16]
      }));
    } catch (error) {
      console.error('Error fetching flights:', error);
      return [];
    }
  }

  async getAircraftInfo(icao24: string): Promise<Aircraft | null> {
    try {
      // This would typically use a real aircraft database API
      // For demo purposes, we'll simulate Walmart aircraft
      if (this.WALMART_AIRCRAFT_ICAO.includes(icao24)) {
        return {
          icao24,
          registration: `N${icao24.toUpperCase()}WMT`,
          manufacturericao: 'BOEING',
          manufacturername: 'Boeing',
          model: '737-800',
          typecode: 'B738',
          serialnumber: '12345',
          linenumber: '1',
          icaoaircrafttype: 'L2J',
          operator: 'Walmart Inc',
          operatorcallsign: 'WALMART',
          operatoricao: 'WMT',
          operatoriata: 'WM',
          owner: 'Walmart Inc',
          testreg: '',
          registered: '2020-01-01',
          reguntil: '2030-01-01',
          status: 'Valid',
          built: '2020',
          firstflightdate: '2020-01-15',
          seatconfiguration: '',
          engines: '2',
          modes: true,
          adsb: true,
          acars: true,
          notes: 'Corporate aircraft',
          categoryDescription: 'Large'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching aircraft info:', error);
      return null;
    }
  }

  isHeadingToMinnesota(flight: Flight): boolean {
    if (!flight.longitude || !flight.latitude || !flight.true_track) return false;

    // Check if already in Minnesota
    if (this.isInMinnesota(flight.latitude, flight.longitude)) {
      return false; // Already there
    }

    // Calculate if the flight track is generally northward towards Minnesota
    const { latitude, longitude, true_track } = flight;
    
    // Simple heuristic: if the aircraft is south/southwest of Minnesota and heading north/northeast
    const isApproachingFromSouth = latitude < this.MINNESOTA_BOUNDS.south;
    const isApproachingFromWest = longitude < this.MINNESOTA_BOUNDS.west;
    const isHeadingNorth = true_track >= 315 || true_track <= 45; // North-ish direction
    const isHeadingEast = true_track >= 45 && true_track <= 135; // East-ish direction

    return (isApproachingFromSouth && isHeadingNorth) || 
           (isApproachingFromWest && isHeadingEast);
  }

  isInMinnesota(latitude: number, longitude: number): boolean {
    return latitude >= this.MINNESOTA_BOUNDS.south &&
           latitude <= this.MINNESOTA_BOUNDS.north &&
           longitude >= this.MINNESOTA_BOUNDS.west &&
           longitude <= this.MINNESOTA_BOUNDS.east;
  }

  async checkWalmartFlights(): Promise<FlightAlert[]> {
    const allFlights = await this.getAllFlights();
    const alerts: FlightAlert[] = [];

    for (const flight of allFlights) {
      if (!flight.icao24) continue;

      const aircraft = await this.getAircraftInfo(flight.icao24);
      
      if (aircraft && aircraft.operator === 'Walmart Inc') {
        let alertType: 'heading_to_minnesota' | 'in_minnesota' | null = null;

        if (this.isInMinnesota(flight.latitude, flight.longitude)) {
          alertType = 'in_minnesota';
        } else if (this.isHeadingToMinnesota(flight)) {
          alertType = 'heading_to_minnesota';
        }

        if (alertType) {
          alerts.push({
            id: `${flight.icao24}-${Date.now()}`,
            flight,
            aircraft,
            timestamp: Date.now(),
            alertType
          });
        }
      }
    }

    return alerts;
  }

  startMonitoring(onAlert: (alert: FlightAlert) => void) {
    this.alertCallback = onAlert;
    
    const monitor = async () => {
      try {
        const alerts = await this.checkWalmartFlights();
        alerts.forEach(alert => {
          if (this.alertCallback) {
            this.alertCallback(alert);
          }
        });
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    };

    // Check every 5 minutes
    this.monitoringInterval = window.setInterval(monitor, 5 * 60 * 1000);
    
    // Initial check
    monitor();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.alertCallback = null;
  }
}

export const flightService = new FlightService();