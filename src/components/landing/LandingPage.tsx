'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Award, 
  Globe, 
  Smartphone, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  Mail,
  Check,
  MessageCircle,
  Phone
} from 'lucide-react'
import PaymentLogos from '@/components/ui/PaymentLogos'
import ReviewModal from '@/components/ui/ReviewModal'
import TestimonialsCarousel from '@/components/ui/TestimonialsCarousel'

const translations = {
  en: {
    nav: {
      trading: 'Trading',
      education: 'Education',
      tournaments: 'Tournaments',
      about: 'About',
      contact: 'Contact',
      login: 'Log In',
      register: 'Sign Up'
    },
    hero: {
      title: 'Trade Binary Options with Confidence',
      subtitle: 'Join millions of traders worldwide and start your trading journey with the most trusted platform',
      cta1: 'Start Trading Now',
      cta2: 'Try Demo Account',
      watchVideo: 'Watch How It Works'
    },
    stats: {
      users: 'Active Users',
      trades: 'Daily Trades',
      countries: 'Countries',
      payout: 'Max Payout'
    },
    features: {
      title: 'Why Choose PocketOption?',
      subtitle: 'Experience the best trading platform with cutting-edge features',
      items: [
        {
          title: 'Fast Execution',
          description: 'Lightning-fast order execution with minimal slippage'
        },
        {
          title: 'Secure Trading',
          description: 'Bank-level security with SSL encryption and fund protection'
        },
        {
          title: 'Multiple Assets',
          description: 'Trade forex, crypto, stocks, and commodities in one platform'
        },
        {
          title: 'Expert Support',
          description: '24/7 multilingual customer support from trading experts'
        },
        {
          title: 'High Returns',
          description: 'Up to 96% profit potential on successful trades'
        },
        {
          title: 'Mobile Trading',
          description: 'Trade anywhere with our advanced mobile applications'
        }
      ]
    },
    partnerships: {
      title: 'Trusted Payment Partners',
      subtitle: 'Secure deposits and withdrawals with leading payment providers'
    },
    testimonials: {
      title: 'What Our Traders Say',
      subtitle: 'Real feedback from successful traders worldwide',
      items: [
        {
          name: 'Sarah Johnson',
          country: 'United States',
          rating: 5,
          text: 'PocketOption has transformed my trading experience. The platform is intuitive and the support team is exceptional.'
        },
        {
          name: 'Miguel Rodriguez',
          country: 'Spain',
          rating: 5,
          text: 'Fast withdrawals and excellent trading conditions. I\'ve been trading here for 2 years and couldn\'t be happier.'
        },
        {
          name: 'Chen Wei',
          country: 'Singapore',
          rating: 5,
          text: 'The mobile app is fantastic. I can trade on the go and never miss an opportunity.'
        },
        {
          name: 'Emma Thompson',
          country: 'United Kingdom',
          rating: 5,
          text: 'Great platform for beginners. The educational resources helped me become a profitable trader.'
        }
      ]
    },
    newsletter: {
      title: 'Stay Updated',
      subtitle: 'Get the latest market insights and trading tips',
      placeholder: 'Enter your email address',
      button: 'Subscribe'
    }
  },
  es: {
    nav: {
      trading: 'Trading',
      education: 'Educación',
      tournaments: 'Torneos',
      about: 'Acerca de',
      contact: 'Contacto',
      login: 'Iniciar Sesión',
      register: 'Registrarse'
    },
    hero: {
      title: 'Opera Opciones Binarias con Confianza',
      subtitle: 'Únete a millones de traders en todo el mundo y comienza tu viaje de trading con la plataforma más confiable',
      cta1: 'Comenzar a Operar',
      cta2: 'Probar Cuenta Demo',
      watchVideo: 'Ver Cómo Funciona'
    },
    stats: {
      users: 'Usuarios Activos',
      trades: 'Operaciones Diarias',
      countries: 'Países',
      payout: 'Pago Máximo'
    },
    features: {
      title: '¿Por Qué Elegir PocketOption?',
      subtitle: 'Experimenta la mejor plataforma de trading con características de vanguardia',
      items: [
        {
          title: 'Ejecución Rápida',
          description: 'Ejecución de órdenes ultrarrápida con deslizamiento mínimo'
        },
        {
          title: 'Trading Seguro',
          description: 'Seguridad de nivel bancario con cifrado SSL y protección de fondos'
        },
        {
          title: 'Múltiples Activos',
          description: 'Opera forex, crypto, acciones y commodities en una plataforma'
        },
        {
          title: 'Soporte Experto',
          description: 'Soporte al cliente multilingüe 24/7 de expertos en trading'
        },
        {
          title: 'Altos Retornos',
          description: 'Hasta 96% de potencial de ganancia en operaciones exitosas'
        },
        {
          title: 'Trading Móvil',
          description: 'Opera desde cualquier lugar con nuestras aplicaciones móviles avanzadas'
        }
      ]
    },
    partnerships: {
      title: 'Socios de Pago Confiables',
      subtitle: 'Depósitos y retiros seguros con proveedores de pago líderes'
    },
    testimonials: {
      title: 'Lo Que Dicen Nuestros Traders',
      subtitle: 'Comentarios reales de traders exitosos en todo el mundo',
      items: [
        {
          name: 'Sarah Johnson',
          country: 'Estados Unidos',
          rating: 5,
          text: 'PocketOption ha transformado mi experiencia de trading. La plataforma es intuitiva y el equipo de soporte es excepcional.'
        },
        {
          name: 'Miguel Rodriguez',
          country: 'España',
          rating: 5,
          text: 'Retiros rápidos y excelentes condiciones de trading. He estado operando aquí por 2 años y no podría estar más feliz.'
        },
        {
          name: 'Chen Wei',
          country: 'Singapur',
          rating: 5,
          text: 'La aplicación móvil es fantástica. Puedo operar sobre la marcha y nunca perder una oportunidad.'
        },
        {
          name: 'Emma Thompson',
          country: 'Reino Unido',
          rating: 5,
          text: 'Gran plataforma para principiantes. Los recursos educativos me ayudaron a convertirme en un trader rentable.'
        }
      ]
    },
    newsletter: {
      title: 'Mantente Actualizado',
      subtitle: 'Obtén las últimas perspectivas del mercado y consejos de trading',
      placeholder: 'Ingresa tu dirección de email',
      button: 'Suscribirse'
    }
  },
  fr: {
    nav: {
      trading: 'Trading',
      education: 'Éducation',
      tournaments: 'Tournois',
      about: 'À Propos',
      contact: 'Contact',
      login: 'Se Connecter',
      register: 'S\'inscrire'
    },
    hero: {
      title: 'Tradez les Options Binaires en Toute Confiance',
      subtitle: 'Rejoignez des millions de traders dans le monde et commencez votre parcours de trading avec la plateforme la plus fiable',
      cta1: 'Commencer à Trader',
      cta2: 'Essayer le Compte Démo',
      watchVideo: 'Voir Comment Ça Marche'
    },
    stats: {
      users: 'Utilisateurs Actifs',
      trades: 'Trades Quotidiens',
      countries: 'Pays',
      payout: 'Paiement Max'
    },
    features: {
      title: 'Pourquoi Choisir PocketOption?',
      subtitle: 'Découvrez la meilleure plateforme de trading avec des fonctionnalités de pointe',
      items: [
        {
          title: 'Exécution Rapide',
          description: 'Exécution d\'ordres ultra-rapide avec un glissement minimal'
        },
        {
          title: 'Trading Sécurisé',
          description: 'Sécurité de niveau bancaire avec cryptage SSL et protection des fonds'
        },
        {
          title: 'Actifs Multiples',
          description: 'Tradez forex, crypto, actions et matières premières sur une plateforme'
        },
        {
          title: 'Support Expert',
          description: 'Support client multilingue 24/7 d\'experts en trading'
        },
        {
          title: 'Rendements Élevés',
          description: 'Jusqu\'à 96% de potentiel de profit sur les trades réussis'
        },
        {
          title: 'Trading Mobile',
          description: 'Tradez partout avec nos applications mobiles avancées'
        }
      ]
    },
    partnerships: {
      title: 'Partenaires de Paiement de Confiance',
      subtitle: 'Dépôts et retraits sécurisés avec les principaux fournisseurs de paiement'
    },
    testimonials: {
      title: 'Ce Que Disent Nos Traders',
      subtitle: 'Vrais commentaires de traders prospères dans le monde entier',
      items: [
        {
          name: 'Sarah Johnson',
          country: 'États-Unis',
          rating: 5,
          text: 'PocketOption a transformé mon expérience de trading. La plateforme est intuitive et l\'équipe de support est exceptionnelle.'
        },
        {
          name: 'Miguel Rodriguez',
          country: 'Espagne',
          rating: 5,
          text: 'Retraits rapides et excellentes conditions de trading. Je trade ici depuis 2 ans et je ne pourrais pas être plus heureux.'
        },
        {
          name: 'Chen Wei',
          country: 'Singapour',
          rating: 5,
          text: 'L\'application mobile est fantastique. Je peux trader en déplacement et ne jamais manquer une opportunité.'
        },
        {
          name: 'Emma Thompson',
          country: 'Royaume-Uni',
          rating: 5,
          text: 'Excellente plateforme pour les débutants. Les ressources éducatives m\'ont aidé à devenir un trader rentable.'
        }
      ]
    },
    newsletter: {
      title: 'Restez Informé',
      subtitle: 'Obtenez les dernières perspectives du marché et conseils de trading',
      placeholder: 'Entrez votre adresse email',
      button: 'S\'abonner'
    }
  }
}

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  const [email, setEmail] = useState('')
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  // Navigation handler for protected routes
  const handleNavigation = (section: string) => {
    if (section === 'about' || section === 'contact') {
      // Scroll to section for About and Contact
      const element = document.getElementById(section)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Redirect to login for other sections
      router.push('/auth')
    }
    setIsMobileMenuOpen(false) // Close mobile menu
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  }

  const t = translations[language]

  const stats = [
    { value: 50000000, suffix: '+', label: t.stats.users },
    { value: 2000000, suffix: '+', label: t.stats.trades },
    { value: 100, suffix: '+', label: t.stats.countries },
    { value: 96, suffix: '%', label: t.stats.payout }
  ]

  const paymentLogos = [
    { name: 'Visa', logo: '💳' },
    { name: 'Mastercard', logo: '💳' },
    { name: 'Skrill', logo: '🏦' },
    { name: 'Neteller', logo: '💰' },
    { name: 'Perfect Money', logo: '💎' },
    { name: 'Bitcoin', logo: '₿' },
    { name: 'Ethereum', logo: 'Ξ' },
    { name: 'PayPal', logo: '💙' }
  ]

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PocketOption
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => handleNavigation('trading')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.trading}
              </button>
              <button 
                onClick={() => handleNavigation('education')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.education}
              </button>
              <button 
                onClick={() => handleNavigation('tournaments')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.tournaments}
              </button>
              <button 
                onClick={() => handleNavigation('about')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.about}
              </button>
              <button 
                onClick={() => handleNavigation('contact')}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.contact}
              </button>
            </div>

            {/* Language Selector & Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {languageOptions.find(lang => lang.code === language)?.flag}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'es' | 'fr')
                          setIsLanguageDropdownOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-200 text-white"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {t.nav.login}
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                {t.nav.register}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 shadow-xl z-50">
              <div className="px-6 py-6 space-y-4">
                <button 
                  onClick={() => handleNavigation('trading')}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
                >
                  {t.nav.trading}
                </button>
                <button 
                  onClick={() => handleNavigation('education')}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
                >
                  {t.nav.education}
                </button>
                <button 
                  onClick={() => handleNavigation('tournaments')}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
                >
                  {t.nav.tournaments}
                </button>
                <button 
                  onClick={() => handleNavigation('about')}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
                >
                  {t.nav.about}
                </button>
                <button 
                  onClick={() => handleNavigation('contact')}
                  className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-800/50"
                >
                  {t.nav.contact}
                </button>
                
                <div className="border-t border-gray-800 pt-4 mt-6">
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={() => {
                        router.push('/auth')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      {t.nav.login}
                    </button>
                    <button 
                      onClick={() => {
                        router.push('/auth')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      {t.nav.register}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Professional Hero Section - Corporate Grade */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 pt-20 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Content Side */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="animate-fade-in-up">
                {/* Professional Badge */}
                <div className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4 lg:mb-6">
                  <Award className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400 mr-2" />
                  <span className="text-blue-400 text-xs lg:text-sm font-medium">Regulated & Licensed Platform</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight px-2 lg:px-0">
                  {t.hero.title}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 lg:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 lg:px-0">
                  {t.hero.subtitle}
                </p>
                
                {/* Professional CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 px-4 sm:px-0">
                  <button 
                    onClick={() => router.push('/auth')}
                    className="group px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl border border-blue-500/20 w-full sm:w-auto"
                  >
                    {t.hero.cta1}
                    <ArrowRight className="inline-block ml-2 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-6 py-3 lg:px-8 lg:py-4 border-2 border-white/30 hover:border-white/50 hover:bg-white/5 rounded-lg font-semibold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm w-full sm:w-auto">
                    <Play className="inline-block mr-2 w-4 h-4 lg:w-5 lg:h-5" />
                    {t.hero.cta2}
                  </button>
                </div>
                
                {/* Trust Indicators - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-6 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">10M+ Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">100+ Countries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Video Side - Mobile Optimized */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-white/10 mx-4 lg:mx-0">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px] object-cover"
                >
                  <source src="/Ehan_Khan.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                
                {/* Professional Overlay */}
                <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 lg:px-3 lg:py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs lg:text-sm font-medium">LIVE</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating Stats - Mobile Optimized */}
              <div className="absolute -bottom-4 -left-2 lg:-bottom-6 lg:-left-6 bg-white/10 backdrop-blur-md rounded-lg lg:rounded-xl p-4 lg:p-6 border border-white/20 shadow-xl">
                <div className="space-y-1 lg:space-y-2">
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold text-sm lg:text-base">Live Trading</span>
                  </div>
                  <p className="text-gray-300 text-xs lg:text-sm">Real-time market data</p>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-2 lg:-top-6 lg:-right-6 bg-blue-500/10 backdrop-blur-md rounded-lg lg:rounded-xl p-4 lg:p-6 border border-blue-500/20 shadow-xl">
                <div className="text-center">
                  <p className="text-blue-400 font-bold text-xl lg:text-2xl">96%</p>
                  <p className="text-gray-300 text-xs lg:text-sm">Max Payout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <p className="text-slate-400 mt-2 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-fade-in-up">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-400 animate-fade-in-up animation-delay-200">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  {index === 0 && <Zap className="w-6 h-6 text-white" />}
                  {index === 1 && <Shield className="w-6 h-6 text-white" />}
                  {index === 2 && <BarChart3 className="w-6 h-6 text-white" />}
                  {index === 3 && <Users className="w-6 h-6 text-white" />}
                  {index === 4 && <Target className="w-6 h-6 text-white" />}
                  {index === 5 && <Smartphone className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Tools & Features Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Professional Trading Tools
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Access advanced trading tools and features designed for both beginners and professional traders
            </p>
          </div>
          
          {/* Trading Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Technical Analysis</h3>
              <p className="text-gray-300 text-sm">Advanced charting with 100+ indicators, drawing tools, and timeframes</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Risk Management</h3>
              <p className="text-gray-300 text-sm">Stop-loss, take-profit, and position sizing tools to protect your capital</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">One-Click Trading</h3>
              <p className="text-gray-300 text-sm">Execute trades instantly with customizable one-click trading interface</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 12.344l7.071 7.071M9.414 7.414l7.071 7.071M4.343 12.344L11.414 5.273M9.414 7.414L2.343 0.343" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Market Signals</h3>
              <p className="text-gray-300 text-sm">Real-time trading signals and market analysis from expert traders</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Educational Resources</h3>
              <p className="text-gray-300 text-sm">Comprehensive trading courses, webinars, and market analysis</p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Demo Account</h3>
              <p className="text-gray-300 text-sm">Practice trading with virtual funds in real market conditions</p>
            </div>
          </div>

          {/* Trading Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400 text-sm">Trading Assets</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">0.1s</div>
              <div className="text-gray-400 text-sm">Execution Speed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">96%</div>
              <div className="text-gray-400 text-sm">Max Payout</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">$10</div>
              <div className="text-gray-400 text-sm">Min Deposit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade on Any Device Section - PocketOption Style */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="order-2 lg:order-1 space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Trade on 
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    any device
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Access your trading account from anywhere with our professional mobile and desktop applications. 
                  Experience seamless trading with real-time charts and instant execution.
                </p>
              </div>
              
              {/* Platform Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Android</p>
                  <p className="text-xs text-gray-500">Download</p>
                </div>
                <div className="group text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">APK Download</p>
                  <p className="text-xs text-gray-500">Direct</p>
                </div>
                <div className="group text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Web App</p>
                  <p className="text-xs text-gray-500">Instant</p>
                </div>
                <div className="group text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Telegram Bot</p>
                  <p className="text-xs text-gray-500">Subscribe</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => router.push('/register')}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Trading Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => router.push('/demo')}
                  className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg"
                >
                  Try Demo Account
                </button>
              </div>
            </div>

            {/* Phone Mockup Side */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]" style={{
                animation: 'fadeInUp 1s ease-out 0.5s forwards'
              }}>
                {/* Main Phone Container with Realistic Shadow */}
                <div className="relative transform hover:scale-105 transition-transform duration-500">
                  {/* Shadow */}
                  <div className="absolute inset-0 bg-black/20 blur-2xl transform translate-y-8 scale-95 rounded-[3rem]"></div>
                  
                  {/* Phone Image */}
                  <div className="relative z-10 w-80 h-auto">
                    <img 
                      src="/phone 1.avif" 
                      alt="PocketOption Mobile App" 
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))'
                      }}
                    />
                  </div>
                  
                  {/* Floating Success Badge */}
                  <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce z-20">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>+96% Profit</span>
                    </div>
                  </div>
                  
                  {/* Floating Real-time Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl z-20">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Real-time Data</span>
                    </div>
                  </div>
                  
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full transform scale-150 -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What people say about us - Professional Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What people say about us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More than 10 million customers worldwide trust us and earn daily
            </p>
          </div>

          {/* Testimonials Carousel */}
          <TestimonialsCarousel />

          {/* Review Actions */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-lg mx-auto shadow-lg border border-blue-100">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your feedback helps us to improve our platform and provide you with the best trading experience possible. We appreciate your reviews and suggestions.
                </p>
              </div>
              
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 w-full"
              >
                <Star className="w-5 h-5" />
                <span>SUBMIT A REVIEW</span>
              </button>
              
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                The reviews are published with no changes to the original text.
                All submissions are reviewed before publication.
              </p>
            </div>
            
            <div className="mt-8">
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center space-x-1">
                <span>View all reviews</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="container-responsive">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-fade-in-up">
              {t.newsletter.title}
            </h2>
            <p className="text-xl text-gray-400 mb-8 animate-fade-in-up animation-delay-200">
              {t.newsletter.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                <Mail className="inline-block mr-2 w-5 h-5" />
                {t.newsletter.button}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About PocketOption
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Leading the future of binary options trading with innovative technology and unmatched user experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  To democratize financial trading by providing accessible, innovative, and secure trading solutions for everyone.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Security First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced encryption and regulatory compliance ensure your funds and data are always protected.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Global Community</h3>
                <p className="text-gray-300 leading-relaxed">
                  Join millions of traders worldwide in our supportive and educational trading community.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">Why Choose PocketOption?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Regulated & Licensed</h4>
                    <p className="text-gray-300 text-sm">Fully regulated by international financial authorities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Advanced Technology</h4>
                    <p className="text-gray-300 text-sm">Cutting-edge trading platform with real-time data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">24/7 Support</h4>
                    <p className="text-gray-300 text-sm">Round-the-clock customer support in multiple languages</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Fast Withdrawals</h4>
                    <p className="text-gray-300 text-sm">Quick and secure withdrawal processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Contact Us
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Get in touch with our expert team. We're here to help you succeed in your trading journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Email Support</h3>
                <p className="text-gray-300 mb-4">Get help via email</p>
                <a href="mailto:support@pocketoption.com" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  support@pocketoption.com
                </a>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Live Chat</h3>
                <p className="text-gray-300 mb-4">24/7 instant support</p>
                <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Start Live Chat
                </button>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Phone Support</h3>
                <p className="text-gray-300 mb-4">Speak with our experts</p>
                <a href="tel:+1-800-POCKET" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  +1-800-POCKET
                </a>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-white placeholder-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-white placeholder-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    rows={5}
                    placeholder="Your Message"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-white placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Professional Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  PocketOption
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Professional binary options trading platform trusted by millions of traders worldwide. 
                Start your trading journey with advanced tools and comprehensive market analysis.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Trading */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Trading</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Binary Options</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Forex Trading</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Crypto Trading</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Stock Trading</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Commodities</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Market Analysis</a></li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Platform</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Web Platform</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Mobile App</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Desktop App</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Trading Tools</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Educational Resources</a></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support & Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Risk Disclosure</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Regulatory Info</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media & Community Section */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-3">Join Our Community</h4>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Connect with us on social media for trading tips, market updates, and community discussions
              </p>
              
              {/* Social Media Links */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
                <div className="flex flex-wrap justify-center items-center gap-6">
                  {/* Twitter */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-blue-500/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-blue-600/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-pink-500/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-pink-400 group-hover:text-pink-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.248 7.053 7.758 8.35 7.758s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.897-1.387-2.048-1.387-3.345s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.897.897 1.387 2.048 1.387 3.345s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-blue-700/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-blue-600 group-hover:text-blue-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-red-600/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-red-500 group-hover:text-red-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* Telegram */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-blue-400/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>

                  {/* Discord */}
                  <a href="#" className="group flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl hover:bg-indigo-500/20 transition-all duration-300 hover:scale-110">
                    <svg className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                    </svg>
                  </a>
                </div>
                
                {/* Call to Action */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-blue-200 font-medium mb-4">Stay updated with market insights and trading strategies</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="#" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300">
                      Follow Us
                    </a>
                    <a href="#" className="px-6 py-3 bg-transparent border border-blue-400 hover:bg-blue-400/10 text-blue-400 rounded-lg font-medium transition-all duration-300">
                      Join Community
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                <p>&copy; 2024 PocketOption. All rights reserved. | Regulated by International Financial Commission</p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Risk Warning: Trading involves substantial risk</span>
                <span>•</span>
                <span>18+ Only</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
    </div>
  )
}

export { LandingPage }