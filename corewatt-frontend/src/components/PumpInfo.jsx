import { useEffect, useState } from "react";
import config from "../../config.js"


export default function PumpInfo() {
  const [configData, setConfigData] = useState({
    BasicTempOn: "--",
    ExpensiveTemp: "--",
    CheapTemp: "--",
    UpTimeInDay: "--",
  });

  useEffect(() => {
    const fetchData = () => {
      fetch(`${config.apiUrl}showConfig`)
        .then((res) => res.json())
        .then((data) => setConfigData(data))
        .catch((err) => {
          console.error("Config fetch error:", err);
        });
    };

    // hae heti kun komponentti latautuu
    fetchData();

    // hae jatkossa joka sekunti
    const interval = setInterval(fetchData, 1000);

    // siivoa kun komponentti poistetaan
    return () => clearInterval(interval);
  }, []);

  const hours =
    configData.UpTimeInDay !== "--" ? configData.UpTimeInDay / 4 : "--";

  return (
    <div className="flex justify-between items-center p-6 text-white bg-neutral-800">
      <div className="font-light">
        <h1>Lämmitys: </h1>
        <h1>Ylläpitolämmitys: </h1>
        <h1>Erityisen halvan ajan lämmitys</h1>
        <br />
        <h1>Lämmitystunteja:</h1>
      </div>
      <div className="text-right">
        <h1>{configData.BasicTempOn} °C</h1>
        <h1>{configData.ExpensiveTemp} °C</h1>
        <h1>{configData.CheapTemp} °C</h1>
        <br />
        <h1>{hours} h/vrk</h1>
      </div>
    </div>
  );
}
