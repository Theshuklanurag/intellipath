import { Zap, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    Product: ['Features', 'How It Works', 'For Students', 'For Teachers'],
    Resources: ['Documentation', 'API Reference', 'Changelog', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  }

  return (
    <footer className="relative border-t border-blue-900/20 pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-syne font-bold text-xl">
                Intelli<span className="gradient-text">Path</span>
              </span>
            </a>
            <p className="text-slate-500 text-sm font-dm leading-relaxed mb-5 max-w-xs">
              AI-powered study and career guidance platform. Bridging the gap between academic learning and professional readiness.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(function(entry) {
            return (
              <div key={entry[0]}>
                <h4 className="font-syne font-semibold text-white text-sm mb-4">{entry[0]}</h4>
                <ul className="space-y-2.5">
                  {entry[1].map(function(link) {
                    return (
                      <li key={link}>
                        <a href="#" className="text-slate-500 hover:text-slate-300 text-sm font-dm transition-colors">{link}</a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="border-t border-blue-900/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-sm font-dm">© 2025 IntelliPath. Built with ❤️ for students, by students.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-600 text-xs font-dm">All systems operational</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs font-dm">
            <span>Powered by</span>
            <span className="text-blue-400 font-medium">Gemini</span>
            <span>+</span>
            <span className="text-purple-400 font-medium">Groq</span>
          </div>
        </div>
      </div>
    </footer>
  )
}