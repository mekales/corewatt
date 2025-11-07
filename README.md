Ohjelma on suunniteltu toimimaan kotirverkossa eikä sitä sellaisenaan ole turvallista avata juliseen verkkoon.

Backend hakee päivän pörssisähkön hintatiedot ja lähettää joka vartti ilmalämpöpumpulle lämpötilan johon pumppu halutaan.
Ohjelma toimii ensisijaisesti Daikinin ilmalämpöpumpuilla ja Daikin APIn toimintaan saamisesta löytyy dokumentaatio Daikinin sivuilta
Ohjelman voi muokata toimimaan myös muilla merkeillä kunhan niihin saadaan luotua vastaava API yhteys. 

Frontend käyttää react + vite yhdistelmää, joka luo sivun, josta näkee visuaalisesti milloin pumppu lämmittää, ylläpitää ja teholämmittää.
backend ei ole riippuvainen frontendistä eli frontendiä ei ole pakko käyttää, jos haluaa vain suorittaa ohjelman päätehtävää.


# Ohjelman käyttöönotto

## Backend:

1. Mene oikeaan hakemistoon
    `cd backend`

2. Lataa riippuvuudet
    `npm install`

3. Luo HTTPS-tiedostot
    Backendin juureen täytyy tehdä tiedostot selfsigned.crt ja selfsigned.key, jotta https yhteys palvelimeen saadaan onnistumaan. 
    Ainakin Daikinin API vaatii tätä https yhteyttä.

4. Luo .env tiedosto .env.example mukaisesti
    siihen laitetaan Daikinin Developer Portalista saatava secret key.

5. Muokkaa config.json tiedosto
  `"clientID": "YOUR_CLIENT_ID",`                 Tähän kohtaan Daikinin Developer Portalista saatava Reference ID
  `"URI": "https://192.168.XXX.XXX:3443/",`       Tähän palvelimen kotiverkon IP 
                                                sen täytyy olla sama kuin Daikinin Developer Portalissa Redirect URI.

Lisäksi:
  `"UpTimeInDay": 40,`                // Kuinka monta varttia pumppu vuorokaudessa lämmittää 40 varttia on 10 tuntia
  `"AlwaysHighBelowPrice": 1,`        // Jos sähkön hinta on alle tämän niin pumppu lämmittää lämpötilalla CheapTemp
  `"AlwaysLowAbovePrice": 30,`        // Jos sähkön hinta on yli tämän niin pumppu on aina tilassa ExpensiveTemp
  `"ExpensiveTemp": 19,`              // Kalliin ajana lämmitys
  `"BasicTempOn": 22,`                // Lämmitysaste jota pumppu käyttää kun kyseessä on UpTimeInDay halvimmat ajat.
  `"CheapTemp": 23,`                  // Lämmitysaste jota käytetään kun sähkö on erityisen halpaa (AlwaysHighBelowPrice)

(Ainakin Daikinilla lämpötilat ovat määritettävissä 0.5 asteen välein)


6. Aja autentikointi
    `node auth.js`

7. Kun login onnistuu, sulje auth.js ja käynnistä palvelin
    `node index.js`

VALMIS

## Frontend:

1. Mene frontend hakemistoon
    `cd corewatt-frontend`

2. Lataa riippuvuudet
    `npm install`

3. Muokkaa config.js
    Kotiverkon apiUrl tulee olla sama kuin backendissä
    Tailnetin apiUrl voi pysyä oletuksena tai vaihtaa oikeaksi

Nyt frontendin voi ajaa kehittäjätilassa tai rakentaa tuotantoversion.

4. Kehittäjätilassa
    `npm run dev`

