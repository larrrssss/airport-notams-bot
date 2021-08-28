import { CommandInteraction } from 'discord.js';

export interface ICommand {
  name: string,
  executor: (interaction: CommandInteraction) => Promise<void>,
}

export interface INotam {
  id: number;
  modified: number;
  nof: string;
  series: string;
  number: number;
  year: number;
  type: string;
  referredseries?: string;
  referrednumber?: string;
  referredyear?: string;
  fir: string;
  code23: string;
  code45: string;
  traffic: string;
  purpose: string;
  scope: string;
  lower: string;
  upper: string;
  lon: number;
  lat: number;
  radius: string;
  nelon: number;
  nelat: number;
  swlon: number;
  swlat: number;
  startvalidity: number;
  endvalidity: number;
  estimation?: string;
  itema: string[];
  itemd?: string;
  iteme: string;
  itemf?: string;
  itemg?: string;
  suppressed: boolean;
}