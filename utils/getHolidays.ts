/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();


export interface Holiday {
  date: string;
  dayofWeek: number;
  name: string;
  isHoliday: boolean;
};

const API_KEY = process.env.API_KEY!;
const baseUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo`;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const year = new Date().getFullYear().toString();
  const months = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12' ];

  const url = new URL(baseUrl);
  url.searchParams.append('serviceKey', API_KEY);
  url.searchParams.append('_type', 'json');
  url.searchParams.append('numOfRows', '1000');
  url.searchParams.append('solYear', year);

  const holidays: Holiday[] = [];
  for (const month of months) {
    url.searchParams.delete('solMonth');
    url.searchParams.append('solMonth', month);
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Error fetching data for ${year}-${month}: ${response.statusText}`);
      continue;
    }
    const data = await response.json();
    let items: unknown[] = [];
    if (data.response?.body?.items?.item) {
      if(Array.isArray(data.response.body.items.item)) {
        items = data.response.body.items.item;
      }
    }

    for(const item of items) {
      const { dateKind, dateName, isHoliday, locdate } = item as unknown as any;

      const locdateStr = locdate.toString();

      if (isHoliday === 'Y') {
        const y = locdateStr.substring(0, 4);
        const m = locdateStr.substring(4, 6);
        const d = locdateStr.substring(6, 8);
        const dateObj = new Date(`${y}-${m}-${d}`)
        const isoDate = dateObj.toISOString().split('T')[0];
        const dayOfWeek = dateObj.getDay();
        const holiday: Holiday = {
          date: isoDate,
          dayofWeek: dayOfWeek,
          name: dateName,
          isHoliday: dateKind === '1' || dateKind === '2'
        };
        holidays.push(holiday);
      }
    }

    console.log(`Fetched ${items.length} holidays for ${year}-${month}`);
    await delay(500);
  }

  fs.writeFileSync(`data/holidays-${year}.json`, JSON.stringify(holidays, null, 2), 'utf-8');
}

main();
