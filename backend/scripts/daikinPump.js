import axios from 'axios'
import * as auth from './daikinAuth.js'
import fs from 'fs';
import path from 'path';








async function getDevices(req, res) {
    try{
        const access_token =  await auth.getAccesToken()
        const response =  await axios.get('https://api.onecta.daikineurope.com/v1/gateway-devices', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'accept': 'application/json'
            }
        })
        if(res){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response.data))
        }
        return response.data;
    }
    catch (error){
        // console.error(error);
        if(res){
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'API request failed' }));
        }
        throw error;
    }
}


async function getDevicesForPatch(){
    try{
        const access_token =  await auth.getAccesToken()
        
        const response =  await axios.get('https://api.onecta.daikineurope.com/v1/gateway-devices', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'accept': 'application/json'
            }
        })
        return response.data;
    }
    catch (error){
        // console.error(error);
    }
}

async function setTemperature(gatewayDeviceId, embeddedId, characteristicName, temperature) {
    try {
        const access_token = await auth.getAccesToken();

        //const url = `https://api.onecta.daikineurope.com/v1/gateway-devices/${gatewayDeviceId}/management-points/${embeddedId}/characteristics/${characteristicName}/operationModes/heating/setpoints/roomTemperature`;
        // const url = 'https://api.onecta.daikineurope.com/v1/gateway-devices/652a63b8-3ff3-4bfc-a594-0a6495d07220/management-points/climateControl/characteristics/temperatureControl'
        const url = `https://api.onecta.daikineurope.com/v1/gateway-devices/${gatewayDeviceId}/management-points/${embeddedId}/characteristics/${characteristicName}`

        const response = await axios.patch(
            url,
            {
                "path": "/operationModes/heating/setpoints/roomTemperature",
                "value": temperature
              }, 
            // "{\"value\":\"off\"}",
            // Toimi fitsin pönttö

            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'                
                },
            }
        );

        // console.log('Temperature updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating temperature:', error.response?.data || error.message);
    }
}

async function setDaikinTemp(currentEntry) {
    try {
        const devicesData = await getDevicesForPatch();
        if (devicesData && devicesData.length > 0) {
            const device = devicesData[0];
            const gatewayDeviceId = device.id;
            const embeddedId = 'climateControl';
            const characteristicName = 'temperatureControl';
            
            // Aseta lämpötila
            await setTemperature(gatewayDeviceId, embeddedId, characteristicName, currentEntry.setTempValue);
            console.log(`Temp: ${currentEntry.setTempValue}°C`);
        } else {
            console.log('Ei löytynyt laitteita.');
        }
        }
    catch (error) {
        console.error(error);
        throw error;
    }
}


async function getRoomAndOutdoorTemp() {
    try {
        const devicesData = JSON.parse(fs.readFileSync('./devicesData.json', 'utf8'));
        if (devicesData && devicesData.length > 0) {
            const device = devicesData[0];
            const climate = device.managementPoints.find(mp => mp.sensoryData);
            const roomTemp = climate?.sensoryData?.value?.roomTemperature?.value;
            const outdoorTemp = climate?.sensoryData?.value?.outdoorTemperature?.value;
            return {roomTemp,outdoorTemp};
        } else {
            console.log('Ei löytynyt laitteita.');
            return;
        }
        }
    catch (error) {
        console.error(error);
        throw error;
    }
}


export { setDaikinTemp,getDevices, getRoomAndOutdoorTemp};



