import axios from 'axios'
import * as daikinAuth from './daikinAuth.js'
import * as daikin from './daikinPump.js'
import * as test from './testPump.js'
import fs from 'fs';
import path from 'path';
import { get } from 'http';


async function getDevices(req, res) {
    try{
        daikin.getDevices(req,res)
    }
    catch (error){
        // console.error(error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'API request failed' }));
    }
    
}

async function saveGetDevices() {
    try{
        const data = await daikin.getDevices()
        fs.writeFile('devicesData.json', JSON.stringify(data, null, 2), (err) =>{
            if (err){
              console.error('Cant save file', err)
              return;
            }
        })
    }
    catch (error){
        // console.error(error);
        throw error;
    }
    
}


async function setTemp(initial = false) {
    try {
        const jsonData = JSON.parse(fs.readFileSync('./schedule.json', 'utf8'));
        const configData = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

        const now = new Date();

        // Pyöristetään aika lähimpään alempaan varttiin (esim. 15:02 → 15:00)
        const roundedMinutes = Math.floor(now.getMinutes() / 15) * 15;
        now.setMinutes(roundedMinutes, 0, 0);

        const startTime = new Date(configData.Pause.Start);
        const endTime = new Date(configData.Pause.End);

        // Jos ollaan tauolla
        if (now >= startTime && now < endTime) {
            console.log("Tauko päällä");
            return;
        }

        // Muodostetaan aikaleima muodossa YYYY-MM-DDTHH:MM
        const pad = (n) => String(n).padStart(2, '0');
        const currentTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        console.log("\nAika:", currentTime);

        // Etsitään nykyinen entry
        const currentEntry = jsonData.today.find(e => e.aikaleima_suomi === currentTime);

        if (!currentEntry) {
            console.log("Ei lämpötilatietoja tälle ajalle.");
            return;
        }

        // Jos initial = true → tee pyyntö heti
        if (initial) {
            console.log("Ensimmäinen käynnistys – asetetaan lämpötila:", currentEntry.setTempValue);
            daikin.setDaikinTemp(currentEntry);
            return;
        }

        // Etsitään edellinen vartti
        const prev = new Date(now.getTime() - 15 * 60 * 1000);
        const prevTime = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}-${pad(prev.getDate())}T${pad(prev.getHours())}:${pad(prev.getMinutes())}`;

        const prevEntry = jsonData.today.find(e => e.aikaleima_suomi === prevTime);

        // Jos ei löydy (esim. klo 00:00) → tee pyyntö joka tapauksessa
        if (!prevEntry) {
            console.log("Edellistä varttia ei löytynyt – asetetaan lämpötila:", currentEntry.setTempValue);
            daikin.setDaikinTemp(currentEntry);
            return;
        }

        // Vertaa nykyistä ja edellistä
        if (currentEntry.setTempValue !== prevEntry.setTempValue) {
            console.log(`Lämpötila muuttuu (${prevEntry.setTempValue} → ${currentEntry.setTempValue}) – asetetaan uusi.`);
            daikin.setDaikinTemp(currentEntry);
        } else {
            console.log(`Lämpötila pysyy samana (${currentEntry.setTempValue}), ei tehdä mitään.`);
        }

    } catch (error) {
        console.error("Virhe lämpötilan asetuksessa:", error.message);
    }
}




async function showSchedule(req,res){
    try{
        fs.readFile('./schedule.json', 'utf8', (err, data)=>{
            if(err){
              console.error('Cant read file', err);
              return;
            }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end((data))
        })
    }
    catch{
        console.error('Virhe aikataulun näyttämisessä:', error.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end("Virhe aikataulun näyttämisessä")
    }
}

async function setPause(req,res){
    try{
        fs.readFile('./config.json', 'utf8', (err, data)=>{
            if(err){
                console.error('Cant read file', err);
                return;
            }
        let config = JSON.parse(data)
        const startTime = new Date();
        const endTime = new Date(startTime)
        endTime.setHours(startTime.getHours()+2)
        config.Pause.Start = startTime
        config.Pause.End = endTime

        fs.writeFile('config.json', JSON.stringify(config, null, 2), (err) =>{
            if (err){
              console.error('Cant save file', err)
              return;
            }
        })
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end((JSON.stringify(config)))
        })
    }
    catch{
        console.error('Virhe tauon luonnissa:', error.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end("Virhe tauon luonnissa")
    }
}
async function removePause(req,res){
    try{
        fs.readFile('./config.json', 'utf8', (err, data)=>{
            if(err){
                console.error('Cant read file', err);
                return;
            }
        let config = JSON.parse(data)
        config.Pause.Start = ""
        config.Pause.End = ""

        fs.writeFile('config.json', JSON.stringify(config, null, 2), (err) =>{
            if (err){
              console.error('Cant save file', err)
              return;
            }
        })
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end((JSON.stringify(config)))
        })
    }
    catch{
        console.error('Virhe tauon poistossa:', error.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end("Virhe tauon poistossa")
    }
}
async function showConfig(req,res){
    try{
        fs.readFile('./config.json', 'utf8', (err, data)=>{
            if(err){
                console.error('Cant read file', err);
                return;
            }
        let config = JSON.parse(data)
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end((JSON.stringify(config)))
        })
    }
    catch{
        console.error('Virhe configin näytössä:', error.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end("Virhe configin näytössä")
    }
}
async function pumpStatus(req, res) {
  try {
    const schedule = JSON.parse(fs.readFileSync("./schedule.json", "utf8"));
    const config = JSON.parse(fs.readFileSync("./config.json", "utf8")); 

    const now = new Date();

    // Tarkistetaan tauko
    let state;
    let nextChange;
    if (config.Pause.Start && config.Pause.End) {
      const startTime = new Date(config.Pause.Start);
      const endTime = new Date(config.Pause.End);

      if (now >= startTime && now < endTime) {
        state = "Tauko";
        // Näytetään tauon loppumisaika muodossa HH:mm
        nextChange = endTime.toTimeString().slice(0,5);
      }
    }

    // Jos ei taukoa, lasketaan nykyinen slotti normaalisti
    if (!state) {
      // Haetaan päivän slotit
      let slots = schedule.today.map(s => ({
        ...s,
        aika: new Date(s.aikaleima_suomi)
      }));

      slots.sort((a, b) => a.aika - b.aika);

      // Nykyinen slotti
      let currentSlot = slots[0];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].aika <= now) currentSlot = slots[i];
        else break;
      }

      // Seuraava muutos
      nextChange = null;
      for (let i = slots.indexOf(currentSlot) + 1; i < slots.length; i++) {
        if (slots[i].setTempValue !== currentSlot.setTempValue) {
          nextChange = slots[i].aikaleima_suomi.slice(11,16);
          break;
        }
      }
      if (!nextChange) nextChange = slots[0].aikaleima_suomi.slice(11,16);

      // Määritetään tila configin perusteella
      if (currentSlot.setTempValue === config.CheapTemp) state = "Halpa lämmitys";
      else if (currentSlot.setTempValue === config.BasicTempOn) state = "Lämmitys";
      else if (currentSlot.setTempValue === config.ExpensiveTemp) state = "Ylläpito";
      else state = "Tuntematon";
    }

    const temps= await daikin.getRoomAndOutdoorTemp()
    let outsideTemp = (temps.outdoorTemp).toString();
    let insideTemp = (temps.roomTemp).toString();


    const response = {
      state,
      nextChange,
      outsideTemp,
      insideTemp,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));

  } catch (error) {
    console.error("Virhe pumpStatus-funktiossa:", error.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Virhe pumpStatus-funktiossa" }));
  }
}


export {getDevices, setTemp,showSchedule,setPause, removePause, showConfig, pumpStatus, saveGetDevices}