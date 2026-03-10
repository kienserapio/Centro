export default function LoginPage() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-white font-sans text-slate-900 dark:bg-[#161d15] dark:text-slate-100">
      <style>{`
        @keyframes fadeInRight {
          0%   { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-panel  { animation: fadeInRight 0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-logo   { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .anim-title  { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.5s both; }
        .anim-desc   { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.65s both; }
        .anim-field1 { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.8s both; }
        .anim-field2 { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.95s both; }
        .anim-btn    { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 1.1s both; }
        .anim-footer { animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 1.25s both; }
      `}</style>

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Side: Hero Image */}
        <div className="relative hidden w-full lg:block lg:w-1/2">
          <div
            className="h-full w-full bg-cover bg-center"
            aria-label="Modern suburban luxury houses with green lawns"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3u7078x0UVpnYCDySSKFB7f85eS_og4DQl7WQzTg0XcId5XoAyE06ranbgzzQTfbmSH-wCJxsfLEwt0R0RgoxnjI-JQ5xDkB842nPclHgMv-9JxuFo_e7FAvltGuS333J5PjNO4RIS4m-JyhV3b-DbeArsh9BLYuh3MOFNU3vRcTXn3rYoblpePtE36qqf5TBAd-uAQdVPqD_-0uiaiYBFkTKw0MGKHu5BxJljb00WRRPja0b0tWqEWhGU763FIcAkE8cYtcqwMI')",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(74,100,65,0.72) 0%, rgba(85,110,70,0.82) 100%)" }}
          />
        </div>

        {/* Right Side: Login Panel */}
        <div
          className="anim-panel relative z-10 flex w-full flex-col bg-white dark:bg-[#E8E8E7] lg:-ml-[10%] lg:w-3/5 lg:[clip-path:polygon(15%_0,100%_0,100%_100%,0%_100%)]"
          style={{ filter: "drop-shadow(-20px 0px 15px rgba(0,0,0,0.6)) drop-shadow(-35px 0px 35px rgba(0,0,0,0.4)) drop-shadow(-5px 0px 8px rgba(0,0,0,0.8))" }}
        >
          {/* House scattered background pattern */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.045]">
            {[
              { top: "5%",  left: "18%", size: 90,  rotate: 0   },
              { top: "8%",  left: "60%", size: 55,  rotate: 10  },
              { top: "18%", left: "80%", size: 75,  rotate: -8  },
              { top: "22%", left: "35%", size: 45,  rotate: 5   },
              { top: "35%", left: "70%", size: 100, rotate: -5  },
              { top: "40%", left: "20%", size: 60,  rotate: 12  },
              { top: "52%", left: "50%", size: 50,  rotate: -10 },
              { top: "58%", left: "82%", size: 80,  rotate: 3   },
              { top: "65%", left: "30%", size: 70,  rotate: -6  },
              { top: "72%", left: "65%", size: 45,  rotate: 8   },
              { top: "80%", left: "15%", size: 95,  rotate: -3  },
              { top: "85%", left: "48%", size: 55,  rotate: 15  },
              { top: "90%", left: "78%", size: 65,  rotate: -12 },
            ].map((h, i) => (
              <svg
                key={i}
                width={h.size}
                height={h.size}
                viewBox="0 0 64 64"
                fill="#2d5327"
                style={{
                  position: "absolute",
                  top: h.top,
                  left: h.left,
                  transform: `rotate(${h.rotate}deg)`,
                }}
              >
                <polygon points="32,4 60,28 4,28" />
                <rect x="10" y="28" width="44" height="30" />
                <rect x="26" y="40" width="12" height="18" fill="#fff" opacity="0.4" />
                <rect x="14" y="33" width="10" height="10" fill="#fff" opacity="0.4" />
                <rect x="40" y="33" width="10" height="10" fill="#fff" opacity="0.4" />
              </svg>
            ))}
          </div>

          {/* Top Navigation */}
          <header className="flex items-center justify-between px-8 py-6 lg:px-20">
            <div></div>
            <div className="anim-logo flex items-center gap-4">
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: "#2d5327" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: "#2d5327" }}>Centro</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-48">
            <div className="mx-auto w-full max-w-md lg:mx-0">
              <div className="mb-12">
                <h1 className="anim-title relative font-serif text-5xl text-[#0F172A] leading-tight">
                  Welcome to{" "}
                  <span style={{ color: "#2d5327" }}>Centro</span>
                  <span className="block mt-2 h-[3px] w-full max-w-[160px] bg-[#2d5327]" />
                </h1>
                <p className="anim-desc mt-8 text-sm text-slate-600">
                  Access the Centro Subdivision Bulletin portal to stay updated
                  with your community.
                </p>
              </div>

              <form className="space-y-8">
                <div className="anim-field1 space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2d5327] focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="anim-field2 space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#475569]">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2d5327] focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="anim-btn">
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, rgba(45,83,39,0.85) 0%, rgba(45,83,39,0.65) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 8px 32px rgba(45,83,39,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                    className="w-full rounded-lg py-4 text-sm font-bold tracking-wide text-white transition-all hover:brightness-110"
                  >
                    LOG IN
                  </button>
                </div>
              </form>
            </div>
          </main>

          {/* Footer */}
          <footer className="anim-footer px-8 py-8 text-center lg:px-20">
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              © 2024 Centro Subdivision Bulletin. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}