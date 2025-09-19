import { useEffect, useState } from "react";

export default function Navbar() {
  const [connected, setConnected] = useState<boolean>(false);
  useEffect(()=>{
    const CheckServer = async ()=>{
        const response  = await fetch(import.meta.env.VITE_SERVER_API_URL);
        const data = await response.json();
        setConnected(data.success);
    }

    CheckServer();
  })
  
  return (
    <div className="h-14 px-6 border-b border-gray-800 bg-[#0f1117] flex items-center justify-between shadow-sm">

      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-white tracking-tight">
          Open<span className="text-emerald-400">Mic</span>
        </div>
      </div>

      {connected ? (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
          <span className="animate-pulse bg-emerald-400 rounded-full w-2 h-2 inline-block" />

          <span className="text-sm font-medium">Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950 text-red-400 border border-red-800">
          <span className="animate-pulse bg-red-400 rounded-full w-2 h-2 inline-block" />

          <span className="text-sm font-medium">Disconnected</span>
        </div>
      )}
    </div>
  );
}
