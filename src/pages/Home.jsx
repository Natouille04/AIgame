export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col items-center gap-y-15 justify-center background-pattern bg-gray-900 text-white">
      <div className="w-70 flex flex-col select-none">
        <p className="text-5xl font-bold CascadiaCode self-start">Promptly</p>
        <p className="text-5xl font-bold CascadiaCode self-end">Executed</p>
      </div>

      <div className="flex flex-col gap-4">
        <button className="w-50 h-10 transition cursor-pointer CourierPrime font-bold text-white tracking-widest py-1 px-4 rounded-xl bg-linear-to-b from-[#1a1433] to-[#470bb8] border-2 border-violet-400">CREATE ROOM</button>
        <button className="w-50 h-10 transition cursor-pointer CourierPrime font-bold text-white tracking-widest py-1 px-4 rounded-xl bg-linear-to-b from-[#1a1433] to-[#470bb8] border-2 border-violet-400">JOIN ROOM</button>
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tracking-wide opacity-80 font-light">
        Copyright Nouille and Mania © {new Date().getFullYear()}
      </p>
    </div>
  )
}