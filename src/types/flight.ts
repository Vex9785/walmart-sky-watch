export interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  sensors: number[];
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
}

export interface Aircraft {
  icao24: string;
  registration: string;
  manufacturericao: string;
  manufacturername: string;
  model: string;
  typecode: string;
  serialnumber: string;
  linenumber: string;
  icaoaircrafttype: string;
  operator: string;
  operatorcallsign: string;
  operatoricao: string;
  operatoriata: string;
  owner: string;
  testreg: string;
  registered: string;
  reguntil: string;
  status: string;
  built: string;
  firstflightdate: string;
  seatconfiguration: string;
  engines: string;
  modes: boolean;
  adsb: boolean;
  acars: boolean;
  notes: string;
  categoryDescription: string;
}

export interface FlightAlert {
  id: string;
  flight: Flight;
  aircraft: Aircraft;
  timestamp: number;
  alertType: 'heading_to_minnesota' | 'in_minnesota';
  destination?: string;
}