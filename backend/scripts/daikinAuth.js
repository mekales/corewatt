
import open from 'open';
import fs from 'fs';
import sls from 'single-line-string';
import qs from 'qs';
import dotenv from 'dotenv';
import axios from 'axios';
import { resolve } from 'path';

function removeSpaces (text){
    return text
    .replaceAll(' ', '');
}

async function refreshAccessToken() {
    dotenv.config();
    const client_secret = process.env.CLIENT_SECRET;

    try {
        const configData =  fs.readFileSync('./config.json', 'utf-8');
        const config = JSON.parse(configData);

        const tokenData =  fs.readFileSync('./token.json', 'utf-8');
        const token = JSON.parse(tokenData);

        const authdata = {
            'client_id': config.clientID,
            'client_secret': client_secret,
            'refresh_token': token.refresh_token,
            'grant_type': 'refresh_token',
        };

        const authdatacoded = new URLSearchParams(authdata).toString();
        const response = await axios.post(
            'https://idp.onecta.daikineurope.com/v1/oidc/token?',
            authdatacoded,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // console.log('Onnistui:', response.data);

        const newToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        const expiryTime = new Date().getTime() + (response.data.expires_in - 60) * 1000;

         fs.writeFileSync(
            './token.json',
            JSON.stringify({ access_token: newToken, expiry_time: expiryTime, refresh_token: refreshToken })
        );

        return newToken;
    } catch (error) {
        //console.error('Error refreshing token:', error);
        throw error;
    }
}

function isTokenExpired(expiryTime){
    const currentTime = new Date().getTime();
    return currentTime > expiryTime;
}

async function getAccesToken() {
    try {
        const tokenData = JSON.parse(fs.readFileSync('./token.json', 'utf-8'));

        if (isTokenExpired(tokenData.expiry_time)) {
            console.log('Token expired, trying to refresh...');
            const newToken = await refreshAccessToken();
             //console.log('New token:', newToken);
            return newToken;
        } else {
             //console.log('Token is still valid.');
            return tokenData.access_token;
        }
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

function openUrl (req, res){
    fs.readFile('./config.json', function(err,data){
        if (err) throw err;
        // res.writeHead(200);
        // res.end('Moving to auth page');

        const config = JSON.parse(data);
        //console.log(config.clientID)
        //console.log(config.URI)
        const url = sls`
        https://idp.onecta.daikineurope.com/v1/oidc/authorize?
        response_type=code
        &client_id=${config.clientID}
        &redirect_uri=${config.URI}
        &scope=openid%20onecta:basic.integration`;
    
        //console.log(removeSpaces(url));
        // open(removeSpaces(url))
        const urlWorking = removeSpaces(url)
        console.log('')
        console.log('Jos selain ei auennut voit avata linkin itse:')
        console.log(urlWorking)
        console.log('')

        // Lähetetään HTML-vastaus, joka avaa URL:in asiakkaan selaimessa
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
                <head>
                    <script type="text/javascript">
                        // Tämä avaa autentikointisivun asiakkaan selaimessa
                        window.location.href = '${urlWorking}';
                    </script>
                </head>
                <body>
                    <p>Redirecting you to the authentication page...</p>
                </body>
            </html>
        `);
    })
}
function code (req, res){
    const authcode = req.url.split('?code=')[1];
    if (authcode){
        dotenv.config()
        const client_secret = process.env.CLIENT_SECRET;
        
        fs.readFile('./config.json', function(err,data){
            if (err) throw err;
            const config = JSON.parse(data);

            const authdata = ({
                'grant_type': 'authorization_code',
                'client_id': config.clientID,
                'client_secret': client_secret,
                'code': authcode,
                'redirect_uri': config.URI  
            });
            
            const authdatacoded = new URLSearchParams(authdata).toString();
            //console.log(authdatacoded)

            axios.post('https://idp.onecta.daikineurope.com/v1/oidc/token', authdatacoded, {
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(response => {
                // console.log(response.data);
                const newToken = response.data.access_token
                const refreshToken = response.data.refresh_token
                const expiryTime = new Date().getTime() + (response.data.expires_in - 60) * 1000;
                fs.writeFileSync('./token.json', JSON.stringify({ access_token: newToken, expiry_time: expiryTime, refresh_token: refreshToken}));

                res.writeHead(200)
                res.end('Login succes')
            })
            .catch(error =>{
                res.writeHead(500)
                res.end('')
                //console.error(error)
            })
        }) 
    }
    else{
        res.writeHead(500)
        res.end('')
    }
}


export { openUrl, code, getAccesToken};
