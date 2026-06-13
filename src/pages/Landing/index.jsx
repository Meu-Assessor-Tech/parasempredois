import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Check, Heart, Sparkles, Globe, Gift, HandHeart } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import { mockTemplates } from '../../data/mockTemplates'
import { mockTestimonials } from '../../data/mockTestimonials'

const PIX_KEY = 'adicione-sua-chave-pix'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80"
            alt="Casal celebrando o casamento"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/25 rounded-full px-4 py-2 text-white text-xs mb-8 shadow-lg">
              <Sparkles size={12} />
              <span>Para sempre dois é gratuito e sem fins lucrativos</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6">
              O site que seu <br />
              <em>amor merece</em>
            </h1>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              Crie um site de casamento bonito, simples e gratuito, com templates elegantes, lista de presentes e RSVP para compartilhar com seus convidados.
            </p>

            <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-white/20 bg-white/12 px-5 py-4 text-left backdrop-blur-md shadow-xl sm:flex sm:items-start sm:gap-4">
              <HandHeart size={22} className="mb-3 flex-shrink-0 text-white sm:mb-0" />
              <div>
                <p className="text-sm font-medium text-white">Uma colaboração opcional mantém o projeto vivo.</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">
                  O site não cobra para criar ou publicar. Se algum casal quiser apoiar o desenvolvimento, pode contribuir voluntariamente por Pix.
                </p>
                <p className="mt-3 text-xs text-white/70">
                  Chave Pix: <span className="font-medium text-white">{PIX_KEY}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/templates')}
                className="!bg-white !text-stone-900 hover:!bg-stone-100 shadow-xl"
              >
                Criar meu site grátis
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/site/ana-e-pedro')}
                className="!text-white hover:!bg-white/10"
              >
                Ver exemplo
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-sand-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold text-sand-600 uppercase tracking-widest mb-3">
              Como funciona
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl text-stone-900">
              Simples. Rápido. <em>Bonito.</em>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Escolha um template',
                desc: 'Selecione um visual elegante para combinar com o estilo do casal.',
                icon: Sparkles,
              },
              {
                step: '02',
                title: 'Personalize com amor',
                desc: 'Adicione fotos, textos, cores e todos os detalhes do grande dia.',
                icon: Heart,
              },
              {
                step: '03',
                title: 'Compartilhe com todos',
                desc: 'Envie o link para seus convidados confirmarem presença e verem os presentes.',
                icon: Globe,
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="text-center p-8">
                <item.icon size={28} className="mb-4 inline-flex text-sand-600" />
                <div className="text-xs font-mono text-stone-400 mb-3">{item.step}</div>
                <h3 className="font-serif text-xl text-stone-900 mb-3">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold text-sand-600 uppercase tracking-widest mb-3">
              Templates
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl text-stone-900 mb-4">
              Elegância para cada casal
            </motion.h2>
            <motion.p variants={fadeUp} className="text-stone-500 max-w-md mx-auto">
              Templates criados com atenção aos detalhes, para que o site reflita a personalidade de vocês.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {mockTemplates.map((template) => (
              <motion.div
                key={template.id}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm cursor-pointer group"
                onClick={() => navigate('/templates')}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg text-stone-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-stone-500">{template.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => navigate('/templates')}>
              Ver todos os templates
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl mb-4">
              Tudo que vocês precisam
            </motion.h2>
            <motion.p variants={fadeUp} className="text-stone-400 max-w-md mx-auto">
              Uma plataforma completa para organizar e compartilhar as informações do casamento.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Globe, title: 'Site personalizado', desc: 'URL exclusiva com o nome de vocês.' },
              { icon: Heart, title: 'RSVP elegante', desc: 'Confirmação de presença para seus convidados.' },
              { icon: Gift, title: 'Lista de presentes', desc: 'Organize ideias de presentes com facilidade.' },
              { icon: Sparkles, title: 'Galeria de fotos', desc: 'Compartilhe momentos especiais.' },
              { icon: Check, title: 'Contagem regressiva', desc: 'Acompanhe quanto falta para o grande dia.' },
              { icon: HandHeart, title: 'Grátis por propósito', desc: 'Sem cobrança, planos pagos ou cartão de crédito.' },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-stone-700 hover:border-stone-500 transition-colors"
              >
                <feature.icon size={20} className="text-sand-400 mb-4" />
                <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-sand-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold text-sand-600 uppercase tracking-widest mb-3">
              Depoimentos
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl text-stone-900">
              Casais que <em>amaram</em>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {mockTestimonials.map((t) => (
              <motion.div
                key={t.id}
                variants={fadeUp}
                className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Heart size={32} className="text-sand-600 fill-sand-600 mx-auto mb-6" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl text-stone-900 mb-6">
              Comece a criar <br />o site de vocês hoje
            </motion.h2>
            <motion.p variants={fadeUp} className="text-stone-500 mb-10 text-lg">
              Gratuito de verdade. Contribuições por Pix são opcionais e ajudam o projeto a continuar.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button variant="primary" size="xl" onClick={() => navigate('/templates')}>
                Criar meu site agora
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
