import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Heart, Sparkles, Globe, Gift } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import { mockTemplates } from '../../data/mockTemplates'

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
  const startFreePath = `/login?next=${encodeURIComponent('/principal')}&template=ivory`

  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative flex min-h-[88svh] items-center justify-center overflow-hidden md:min-h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80"
            alt="Casal celebrando o casamento"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-md sm:mb-8">
              <Check size={12} />
              <span>Gratuito. Colaboração opcional.</span>
            </div>
            <h1 className="mb-5 font-serif text-4xl leading-tight text-white sm:mb-6 sm:text-6xl md:text-7xl">
              O site que seu <br />
              <em>amor merece</em>
            </h1>
            <p className="mx-auto mb-7 max-w-xl text-base leading-relaxed text-white/90 sm:mb-10 sm:text-xl">
              Reúna os detalhes do casamento, presentes e confirmações de presença em um só lugar.
            </p>

            <div className="flex items-center justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/ana-e-pedro?example=1')}
                className="!bg-white !text-stone-900 shadow-xl hover:!bg-stone-100"
              >
                Ver exemplo
              </Button>
            </div>
            <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-white/75 sm:text-sm">
              Não há cobrança para criar, editar ou compartilhar o site.
            </p>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 hidden h-10 w-6 -translate-x-1/2 items-start justify-center rounded-full border-2 border-white/40 pt-2 sm:flex"
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
              { icon: Heart, title: 'Confirmação de presença', desc: 'Seus convidados confirmam pelo próprio site, de forma simples.' },
              { icon: Gift, title: 'Lista de presentes', desc: 'Organize ideias de presentes com facilidade.' },
              { icon: Sparkles, title: 'Galeria de fotos', desc: 'Compartilhe momentos especiais.' },
              { icon: Check, title: 'Contagem regressiva', desc: 'Acompanhe quanto falta para o grande dia.' },
              { icon: Globe, title: 'Mobile-first', desc: 'Perfeito em qualquer dispositivo.' },
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
              Escolha um template, personalize os detalhes e compartilhe com seus convidados.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button variant="primary" size="xl" onClick={() => navigate(startFreePath)}>
                Criar meu site
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
