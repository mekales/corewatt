import { useEffect, useState } from "react";
import config from "../../config.js"

export default function StatusPanel({ reloadTrigger }) {
  const [pumpStatus, setPumpStatus] = useState({
    state: "--",
    nextChange: "--",
    outsideTemp: "--",
    insideTemp: "--",
  });
  //   /pumpStatus
  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${config.apiUrl}pumpStatus`)
        .then((res) => res.json())
        .then((data) => setPumpStatus(data))
        .catch((err) => console.error("API fetch error:", err));
    };

    // hae heti kun komponentti ladataan tai reloadTrigger muuttuu
    fetchStatus();

    // hae jatkossa 1s välein
    const interval = setInterval(fetchStatus, 1000);

    // siivoa kun komponentti poistuu tai reloadTrigger vaihtuu
    return () => clearInterval(interval);
  }, [reloadTrigger]);

  return (
    <div className="flex justify-between items-center p-6 text-white">
      <div>
        <h1 className="text-xl font-bold">{pumpStatus.state}</h1>
        <h1 className="text-lg">klo {pumpStatus.nextChange} saakka</h1>
      </div>
      <div className="text-right">
        <h1 className="text-lg">Ulkona: {pumpStatus.outsideTemp} °C</h1>
        <h1 className="text-lg">Sisällä: {pumpStatus.insideTemp} °C</h1>
      </div>
    </div>
  );
}
