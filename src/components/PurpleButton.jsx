export default function ({ children, onClick }) {
    return (
        <div className="h-[46px] w-full">
            <button
                onClick={onClick}
                className="text-[17px] px-[25px] py-[10px] rounded-[0.7rem] bg-linear-to-b from-[rgb(214,202,254)] to-[rgb(158,129,254)] border-2 border-[rgb(50,50,50)] border-b-[5px] shadow-[0px_1px_6px_0px_rgb(158,129,254)] -translate-y-[3px] cursor-pointer transition-all duration-50 ease-linear active:translate-y-0 active:border-b-2 focus:outline-none w-full"
            >
                {children}
            </button>
        </div>
    );
}