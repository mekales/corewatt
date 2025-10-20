import { useEffect, useState } from "react";
import config from "../../config.js"


export default function ControlButton({onPauseToggle}) {
  const [configData, setConfigData] = useState({ Pause: { Start: "", End: "" } });
  const [loading, setLoading] = useState(false);

  // Hae config aluksi ja kun nappia painetaan
  const fetchConfig = () => {
    fetch(`${config.apiUrl}showConfig`)
      .then((res) => res.json())
      .then((data) => setConfigData(data))
      .catch((err) => console.error("Config fetch error:", err));
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const isPaused = configData.Pause && configData.Pause.Start !== "";
  const handleClick = () => {
    setLoading(true);
    const url = isPaused
      ? `${config.apiUrl}removePause`
      : `${config.apiUrl}setPause`

    fetch(url, { method: "POST" }) // POST oletettavasti toimii, muuten GET
      .then(() => {
        fetchConfig();
        if(onPauseToggle) onPauseToggle();
      }) // päivitä config
      .catch((err) => console.error("Pause toggle error:", err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex justify-center items-center p-6 text-white">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`p-6 rounded-xl w-full ${isPaused ? "bg-blue-800" : "bg-blue-600"}`}
      >
        {loading
          ? "..."
          : isPaused
          ? "Kytke automaattiohjaus päälle"
          : "Sammuta automaattiohjaus 2 tunniksi"}
      </button>
    </div>
  );
}
