import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function Page() {
  return (
    <div className="relative h-screen w-screen bg-[#121212] flex items-center justify-center overflow-hidden font-sans antialiased">
      
      {/* --- Ambient Background Glow --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
        <SignIn 
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case shadow-none border-none transition-all active:scale-95",
              card: 
                "bg-[#18181b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-white font-bold tracking-tight",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: 
                "bg-white/5 border-white/10 hover:bg-white/10 transition-colors text-white",
              socialButtonsBlockButtonText: "text-white font-medium",
              formFieldLabel: "text-slate-400 font-medium",
              formFieldInput: 
                "bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-500/40 rounded-xl transition-all",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-500"
            }
          }}
        />
      </div>

      {/* --- Subtle Branding --- */}
      <div className="absolute bottom-8 text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
        Secure Creative Space
      </div>
    </div>
  )
}