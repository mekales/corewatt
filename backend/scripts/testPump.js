import axios from 'axios'
import fs from 'fs';
import path from 'path';


async function setTestTemp(currentEntry) {
    try {
        console.log(`!! TEST PUMP !!`);
        console.log(`Temp: ${currentEntry.setTempValue}°C`);
        }
    catch (error) {
        console.error(error);
        throw error;
    }
}

export { setTestTemp};