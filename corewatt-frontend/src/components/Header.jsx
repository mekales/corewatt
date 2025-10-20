import { useEffect, useState } from "react";
import config from "../../config.js"



export default function Header() {
  const [connected, setConnected] = useState(false);

  
  useEffect(() => {
    const fetchStatus = () =>{
    fetch(`${config.apiUrl}showConfig`)
      .then((res) => {
        res.json()
        if (!res.ok) throw new Error("Palvelin ei vastannut oikein");
      })
      .then((data) => {
        setConnected(true)
      })
      .catch((err) => {
        console.error("Config fetch error:", err);
        setConnected(false)
      });
      }

      fetchStatus();

      const interval = setInterval(fetchStatus, 1000);

      return () => clearInterval(interval);

  },[]);



  
  return (
    <div className="flex justify-between items-center p-6 bg-blue-600 text-white">
      <h1 className="text-2xl font-sans font-light">CoreWatt</h1>
      <div className={`w-4 h-4 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
    </div>
  );
}
