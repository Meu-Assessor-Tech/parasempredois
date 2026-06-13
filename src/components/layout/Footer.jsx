import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={18} className="text-sand-400 fill-sand-400" />
              <span className="font-serif text-lg text-white">Para sempre dois</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              Crie o site do seu casamento com elegância e simplicidade. Um projeto gratuito, feito para casais celebrarem com leveza.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">Produto</h4>
            <ul className="space-y-3">
              {['Templates', 'Funcionalidades', 'Colaboração opcional', 'Exemplos'].map(item => (
                <li key={item}><a href="#" className="text-sm hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">Projeto</h4>
            <ul className="space-y-3">
              {['Sobre', 'Contato', 'Privacidade'].map(item => (
                <li key={item}><a href="#" className="text-sm hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600">© 2026 Para sempre dois. Todos os direitos reservados.</p>
          <p className="text-xs text-stone-600 flex items-center gap-1">
            Feito com <Heart size={12} className="text-sand-500 fill-sand-500" /> para casais apaixonados
          </p>
        </div>
      </div>
    </footer>
  )
}
