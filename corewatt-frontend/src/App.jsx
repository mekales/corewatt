import { useState } from "react";
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import ScheduleRing from './components/ScheduleRing';
import PumpInfo from './components/PumpInfo';
import ControlButton from './components/ControlButton';

function App() {
  const [reloadStatus, setReloadStatus] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />

      {/* Mobile-first: grid-cols-1 (eli alkuperäinen pinottu järjestys).
          Desktopilla (md:) kaksi saraketta ja oikealle ScheduleRing joka span-taa kaikki rivit. */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 md:max-w-6xl md:mx-auto md:p-6">

        {/* 1) Mobiilissa ensimmäinen: StatusPanel */}
        <div className="md:col-start-1 md:row-start-1">
          <StatusPanel reloadTrigger={reloadStatus} />
        </div>

        {/* 2) Mobiilissa toisena: ScheduleRing
            Desktopilla sijoitetaan oikealle ja span-ataan 3 riviä, jotta se on keskitetty vasemman sisällön vieressä */}
        <div className="md:col-start-2 md:row-start-1 md:row-span-3 md:flex md:items-center md:justify-center">
          <ScheduleRing />
        </div>

        {/* 3) Mobiilissa kolmantena: PumpInfo (desktopissa vasemmalla, 2. rivi) */}
        <div className="md:col-start-1 md:row-start-2">
          <PumpInfo />
        </div>

        {/* 4) Mobiilissa viimeisenä: ControlButton (desktopissa vasemmalla, 3. rivi) */}
        <div className="md:col-start-1 md:row-start-3">
          <ControlButton onPauseToggle={() => setReloadStatus(v => v + 1)} />
        </div>
      </div>
    </div>
  );
}

export default App;
