import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://api.autorouter.aero/v1.0/oauth2';
const filePath = path.join(process.env.TOKEN_PATH || '');
let auth: IAuth | undefined = undefined;

interface IAuth {
  token: string,
  expires_in: number,
}

async function requestToken(): Promise<IAuth | null> {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/token`, 
      {
        grant_type: 'client_credentials',
        client_id: process.env.AUTOROUTER_EMAIL,
        client_secret: process.env.AUTOROUTER_PASSWORD
      }, 
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    );    

    const payload = {
      token: data.access_token,
      expires_in: Date.now() + 604800,
    };

    await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2));

    return payload;
  } catch (e) {    
    return null;
  }
}

export async function getToken(): Promise<string> {
  if (!auth) {
    if (fs.existsSync(filePath))
      auth = (await import(filePath)).default;      

    if (!auth || Date.now() >= auth.expires_in)
      auth = await requestToken() as IAuth;
  }

  return auth?.token || '';
}
