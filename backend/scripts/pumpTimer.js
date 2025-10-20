import fs from 'fs/promises';
import fetch from 'node-fetch';

async function getData() {
  const day = new Date();
  const datePart = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
  const url = `https://www.sahkohinta-api.fi/api/vartti/v1/halpa?vartit=96&tulos=haja&aikaraja=${datePart}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  return await response.json();
}

async function createSchedule() {
  try {
    const priceToday = await getData();

    // Ladataan olemassa oleva tiedosto tai luodaan uusi
    let pricesJson = {};
    try { 
      const data = await fs.readFile('./schedule.json','utf8');
      pricesJson = JSON.parse(data);
    } catch {}

    pricesJson.today = priceToday;
    await fs.writeFile('./schedule.json', JSON.stringify(pricesJson, null, 2));

    // Päivitetään setTempValue
    await createSetTemps();
  } catch (err) {
    throw new Error('createSchedule failed: ' + err.message);
  }
}

async function createSetTemps() {
  try {
    const data = await fs.readFile('./schedule.json','utf8');
    const configData = await fs.readFile('./config.json','utf8');

    const schedule = JSON.parse(data);
    const config = JSON.parse(configData);

    function getSetTempCheapestHours(hinta){ return config.BasicTempOn; }
    function getSetTempOthersHours(hinta){ return config.ExpensiveTemp; }

    function findCheapestHours(day){
      const sorted = [...day].sort((a,b)=> parseFloat(a.hinta)-parseFloat(b.hinta));
      return sorted.slice(0, config.UpTimeInDay);
    }
    function findOthersHours(day){
      const sorted = [...day].sort((a,b)=> parseFloat(a.hinta)-parseFloat(b.hinta));
      return sorted.slice(config.UpTimeInDay, 96);
    }

    const cheapestToday = findCheapestHours(schedule.today);
    const othersToday = findOthersHours(schedule.today);

    cheapestToday.forEach(hour => hour.setTempValue = getSetTempCheapestHours(parseFloat(hour.hinta)));
    othersToday.forEach(hour => hour.setTempValue = getSetTempOthersHours(parseFloat(hour.hinta)));

    // Tallennetaan välitulos
    await fs.writeFile('./schedule.json', JSON.stringify(schedule, null, 2));

    // Seuraava vaihe: AlwaysHigh / AlwaysLow logiikka
    const lowOrHighToday = [...schedule.today].sort((a,b)=> parseFloat(a.hinta)-parseFloat(b.hinta)).slice(0,24);

    lowOrHighToday.forEach((hour, index) => {
      if (hour.hinta <= config.AlwaysHighBelowPrice) hour.setTempValue = config.CheapTemp;
      else if (hour.hinta >= config.AlwaysLowAbovePrice) hour.setTempValue = config.ExpensiveTemp;
      // muuten säilyy aikaisempi setTempValue
    });

    await fs.writeFile('./schedule.json', JSON.stringify(schedule, null, 2));
    console.log('New schedule.json (00.00/first open)');

  } catch (err) {
    throw new Error('createSetTemps failed: ' + err.message);
  }
}

export { createSchedule };
