import axios from 'axios';
import { URLSearchParams } from 'url';
import CacheNow from 'cachenow';

import { getToken } from '../auth/autorouter';
import { INotam } from '../types';
import { padDigits, convertCoord, formatNotamDate } from './utils';

const baseUrl = 'https://api.autorouter.aero/v1.0';
const notamCache = new CacheNow<INotam[]>(7 * 60 * 1000);

export async function getNotams(icao: string): Promise<INotam[] | null> {
  if (notamCache.get(icao)) 
    return notamCache.get(icao);

  const qs = new URLSearchParams({
    itemas: `["${icao.toUpperCase()}"]`,
    offset: '0',
  });

  try {
    const { data } = await axios.get(`${baseUrl}/notam?${qs}`, {
      headers: {
        'authorization': `Bearer ${await getToken()}`,
      }
    });

    data.rows.map((n: INotam) => {
      n.lat *= 90 / (1 << 30);
      n.lon *= 90 / (1 << 30);
      n.radius = `00${n.radius}`.slice(-3);
      n.lower = `00${n.lower}`.slice(-3);
      n.upper = `00${n.upper}`.slice(-3);
      return n;
    });

    notamCache.set(icao, data.rows);

    return data.rows;
  } catch (e) {    
    return null;
  }
}

export function formatNotam(notam: INotam): string {
  return `
    ☆ ${notam.series} ${padDigits(notam.number, 4)}/${notam.year} NOTAM
    Q) ${notam.fir}/${notam.code23}${notam.code45}/${notam.traffic}/${notam.purpose}/${notam.scope}/${notam.lower}/${notam.upper}/${convertCoord(notam.lat, notam.lon)}${notam.radius}
    A) ${notam.itema.join(' ')}
    B) ${formatNotamDate(notam.startvalidity)} C) ${formatNotamDate(notam.endvalidity)}
    ${notam.itemd ? `D) ${notam.itemd}` : ''}
    E) ${notam.iteme}
    ${notam.itemf ? `F) ${notam.itemf}` : ''}
    ${notam.itemg ? `G) ${notam.itemg}` : ''}
  `.trim().replace(/^\s*\n/gm, '').split('    ').join('');
}