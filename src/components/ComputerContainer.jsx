export default function ComputerContainer({ children, full }) {
    return (
        <div
            className="relative w-full h-full CascadiaCode select-none bg-[#b1a484]"
            style={{
                ...(full
                    ? { padding: '3.5rem' }
                    : { padding: '3.5rem', paddingBottom: '6rem', width: 840, height: 640, borderRadius: 18 }
                ),
                boxShadow: `
                    inset 0  3px 0   rgba(255,255,255,0.35),
                    inset 3px 0  0   rgba(255,255,255,0.18),
                    inset 0 -3px 0   rgba(0,0,0,0.25),
                    inset -3px 0 0   rgba(0,0,0,0.18),
                    inset 0  0  40px rgba(0,0,0,0.12),
                    0 8px 32px rgba(0,0,0,0.7),
                    0 2px 4px  rgba(0,0,0,0.5)
                `
            }}
        >
            <div className="pointer-events-none absolute inset-0 rounded-[18px] z-10"
                style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
            />

            <div
                className="relative w-full h-full rounded-md p-1.5 bg-[#2a2420]"
                style={{
                    boxShadow: `
                        inset 0 2px 8px rgba(0,0,0,0.8),
                        inset 0 0 0 1px rgba(0,0,0,0.6),
                        0 1px 0 rgba(255,255,255,0.1)
                    `
                }}
            >
                <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#121010]">
                    <div
                        className="crt-flicker pointer-events-none absolute inset-0 z-30"
                        style={{ background: 'rgba(18,16,16,0.1)', opacity: 0 }}
                    />

                    <div
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(18,16,16,0) 50%, rgba(8,6,6,0.25) 50%),
                                linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))
                            `,
                            backgroundSize: '100% 2px, 3px 100%'
                        }}
                    />

                    <div
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{ boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)' }}
                    />

                    <div className="relative z-0 h-full p-5 flex flex-col gap-y-2">
                        {children}
                    </div>
                </div>
            </div>

            {!full &&
                <div className="absolute bottom-0 left-0 right-0 h-24 flex flex-row-reverse items-center justify-between gap-6 px-20">
                    <div className="w-3 h-3 rounded-full bg-[#22ff55]" style={{ boxShadow: '0 0 6px #22ff55' }} />

                    <div className="flex gap-1">
                        {[...Array(70)].map((_, i) => (
                            <div key={i} className="w-0.5 h-5 rounded-full bg-[#8a7a64]" />
                        ))}
                    </div>

                    <div className="w-4 h-4 rounded-full bg-[#9a8a74]" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.5)' }} />
                </div>
            }
        </div >
    );
}