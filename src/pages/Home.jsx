import { useEffect, useState } from "react";
import PurpleButton from "../components/PurpleButton";

export default function Home() {
  const [pageState, setPageState] = useState(0);

  useEffect(() => {
    const handleAction = (e) => {
      setPageState(1);
    }

    window.addEventListener("keydown", handleAction)
    window.addEventListener("mousedown", handleAction)

    return () => {
      window.removeEventListener("keydown", handleAction)
      window.removeEventListener("mousedown", handleAction)
    }
  }, [])

  return (
    <div className="w-full h-screen flex flex-col items-center gap-y-15 justify-center background-pattern bg-gray-900 text-white">
      { pageState == 0 &&
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

      { pageState == 1 &&
        <div className="w-50">
          <PurpleButton onClick={() => setPageState(0)}>Back</PurpleButton>
        </div>
      }
    </div>
  )
}