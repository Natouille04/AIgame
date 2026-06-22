import { useEffect, useState } from "react";

import PurpleButton from "../components/PurpleButton";
import Loading from "../components/Loading";
import ComputerContainer from "../components/ComputerContainer";

import { createLobby, onPlayerListUpdate, offPlayerListUpdate } from "../scripts/socket.js";

export default function Home() {
  const [pageState, setPageState] = useState(0);
  const [computerState, setComputerState] = useState("base");
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleAction = () => setPageState(1);
    window.addEventListener("keydown", handleAction);
    window.addEventListener("mousedown", handleAction);
    return () => {
      window.removeEventListener("keydown", handleAction);
      window.removeEventListener("mousedown", handleAction);
    };
  }, []);

  useEffect(() => {
    const onPageLoad = () => {
      console.log("page loaded");
      setLoading(false);
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, false);
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  useEffect(() => {
    onPlayerListUpdate((player) => {
      setPlayers((prev) => [...prev, player]);
    });
    return () => offPlayerListUpdate();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen p-5 flex flex-col items-center gap-y-15 justify-center background-pattern bg-gray-900 text-white">
      {pageState == 0 &&
        <>
          <div className="w-70 flex flex-col select-none">
            <p className="text-5xl font-bold CascadiaCode self-start">Promptly</p>
            <p className="text-5xl font-bold CascadiaCode self-end">Executed</p>
          </div>

          <div className="flex flex-col justify-between h-20 mt-10 animate-pulse">
            <p className="text-xl font-bold select-none">PRESS ANY BUTTON</p>
          </div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tracking-wide opacity-80 font-light">
            Copyright Nouille and Mania © {new Date().getFullYear()}
          </p>
        </>
      }

      {pageState == 1 &&
        <ComputerContainer>
          {computerState == "base" &&
            <div>
              <p className="w-full h-8 flex justify-start items-center text-green-600 text-2xl">C:\&gt; show menu</p>
              <p className="w-full h-8"></p>
              <p className="w-full h-8 flex justify-start items-center text-green-600 text-2xl">Select an options below :</p>

              <button
                onClick={async () => {
                  setComputerState("play");
                  const code = await createLobby();
                  console.log(code);
                  setRoomCode(code);
                }}

                className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">
                ⠀&gt; PLAY
              </button>

              <button onClick={() => { setComputerState("settings") }} className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">⠀&gt; SETTINGS</button>
              <button onClick={() => { setPageState(0) }} className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">⠀&gt; BACK</button>
            </div>
          }

          {computerState == "play" &&
            <div className="flex flex-col justify-between h-full">
              <p className="w-full h-8 flex justify-start items-center text-green-600 text-2xl">C:\&gt; run lobby</p>
              <p className="w-full h-8"></p>

              <div className="h-full text-green-600 text-2xl">
                {!roomCode
                  ? <p className="animate-pulse">Création du lobby...</p>
                  : <div>
                    <p>Room code : <span className="font-bold select-text">{roomCode}</span></p>
                    <p>Players : </p>
                    <div className="overflow-y-auto">
                      {players.length === 0
                        ? <p className="opacity-50">⠀En attente de joueurs...</p>
                        : players.map((p) => (
                          <p key={p.id}>⠀&gt; {p.name}</p>
                        ))
                      }
                    </div>
                  </div>
                }
              </div>

              {players.length > 1 &&
                <button className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">&gt; START</button>
              }
              <button onClick={() => { setComputerState("base"); setRoomCode(null); setPlayers([]); }} className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">&gt; BACK</button>
            </div>
          }

          {computerState == "settings" &&
            <form className="flex flex-col justify-between h-full">
              <div>
                <p className="w-full h-8 flex justify-start items-center text-green-600 text-2xl">C:\&gt; edit Setting.cfg</p>
                <p className="w-full h-8"></p>
                <p className="w-full h-8 flex justify-start items-center text-white bg-green-600 text-2xl">Editing "Setting.cfg" :</p>
              </div>

              <div className="h-full overflow-auto scrollbar-none flex flex-col justify-start">
                { /* Options a placée ici plus tard */}
              </div>

              <div className="flex flex-col">
                <button className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">&gt; SAVE</button>
                <button onClick={() => { setComputerState("base") }} className="w-full h-8 flex justify-start items-center text-green-600 hover:text-white hover:bg-green-600 text-2xl">&gt; BACK</button>
              </div>
            </form>
          }
        </ComputerContainer>
      }
    </div>
  )
}