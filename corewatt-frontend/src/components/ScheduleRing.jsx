import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import config from "../../config.js"


export default function HeatingRing() {
  const [scheduleData, setScheduleData] = useState({ today: [] });
  const [configData, setConfigData] = useState({
    CheapTemp: 23,
    BasicTempOn: 22,
  });

  // Parsitaan "HH:MM" string kellonajaksi
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    const fetchData = () => {
      // Haetaan schedule
      fetch(`${config.apiUrl}schedule`)
        .then((res) => res.json())
        .then((data) => setScheduleData(data))
        .catch((err) => console.error("Schedule fetch error:", err));

      // Haetaan config
      fetch(`${config.apiUrl}showConfig`)
        .then((res) => res.json())
        .then((data) => setConfigData(data))
        .catch((err) => console.error("Config fetch error:", err));
    };

    fetchData(); // hae heti
    const interval = setInterval(fetchData, 1000); // hae joka sekunti

    return () => clearInterval(interval); // siivoa
  }, []);

  const now = new Date();

  // Värit lämpötilan mukaan
  const getColor = (temp) => {
    if (temp >= configData.CheapTemp) return "oklch(50.5% 0.213 27.518)"; // punainen
    if (temp === configData.BasicTempOn) return "oklch(70.4% 0.191 22.216)"; // harmaa
    return "oklch(88.5% 0.062 18.334)"; // sininen
  };

  // Tehdään lookup schedulesta
  const mockMap = {};
  scheduleData.today.forEach((entry) => {
    const timeStr = entry.aikaleima_suomi.split("T")[1]; // "HH:MM"
    const minutes = parseTime(timeStr);
    mockMap[minutes] = entry.setTempValue;
  });

  // Rakennetaan 24h aikajana (96 × 15min slot)
  const data = [];
  for (let i = 0; i < 24 * 4; i++) {
    const minutes = i * 15;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const temp = mockMap[minutes] ?? 22;
    data.push({ name: label, value: 1, fill: getColor(temp) });
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const angleDeg = (currentHour / 24) * 360;

  return (
    <div>
      <div className="relative flex flex-col items-center pointer-events-none">
        <PieChart width={350} height={350}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={140}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.fill}
                style={{ pointerEvents: "none" }}
              />
            ))}
          </Pie>
        </PieChart>

        {/* Viisari */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "3px",
            height: "90px",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -100%) rotate(${angleDeg}deg)`,
            transformOrigin: "bottom center",
            background:
              "linear-gradient(to top, transparent 20%, oklch(54.6% 0.245 262.881))",
            transition: "height 1s ease-out",
          }}
        />

        {/* Kellotaulu */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {hours.map((h) => {
            const angle = 90 - (h / 24) * 360;
            const rad = (angle * Math.PI) / 180;
            const r = 160;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            return (
              <div
                key={h}
                className="absolute text-xs text-neutral-500"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% - ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {h}
              </div>
            );
          })}
        </div>

        {/* Päivämäärä */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-lg font-light">
            {now.toLocaleDateString("fi-FI")}
          </h1>
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 flex flex-row text-xs font-light justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4"
            style={{ background: "oklch(50.5% 0.213 27.518)" }}
          ></div>
          <span>Halpa lämmitys</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4"
            style={{ background: "oklch(70.4% 0.191 22.216)" }}
          ></div>
          <span>Lämmitys</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4"
            style={{ background: "oklch(88.5% 0.062 18.334)" }}
          ></div>
          <span>Ylläpito</span>
        </div>
      </div>
    </div>
  );
}
