export function padDigits(number: number, digits: number): string {
  return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
}

export function toDegreesMinutesAndSeconds(coordinate: number): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);

  return `${degrees < 10 ? `0${degrees}` : degrees}${minutes < 10 ? `0${minutes}` : minutes}`;
}

export function convertCoord(lat: number, lng: number): string {
  const latitude = toDegreesMinutesAndSeconds(lat);
  const latitudeCardinal = lat >= 0 ? 'N' : 'S';

  const longitude = toDegreesMinutesAndSeconds(lng);
  const longitudeCardinal = lng >= 0 ? 'E' : 'W';

  return `${latitude}${latitudeCardinal}${longitude}${longitudeCardinal}`;
}

export function formatNotamDate(date: number): string {
  const d = new Date(0);
  d.setUTCSeconds(date);

  const day = d.getUTCDate() < 10 ? `0${d.getUTCDate()}` : d.getUTCDate();
  const month = d.getUTCMonth() + 1 < 10 ? `0${d.getUTCMonth() + 1}` : d.getUTCMonth() + 1;
  const hours = d.getUTCHours() < 10 ? `0${d.getUTCHours()}` : d.getUTCHours();
  const min = d.getUTCMinutes() < 10 ? `0${d.getUTCMinutes()}` : d.getUTCMinutes();
  return `${d.getUTCFullYear()}-${month}-${day} ${hours}:${min}`;
}

