export default function Loading() {
    return (
        <div className="w-full h-screen background-pattern bg-gray-900 text-white flex items-end justify-end p-5">
            <img src="/loading.svg" className="animate-spin w-20"/>
        </div>
    )
}