import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Refs para animações ao fazer scroll
  const heroRef = useScrollAnimation({ threshold: 0.1 });
  const featuresRef = useScrollAnimation({ threshold: 0.1 });
  const statsRef = useScrollAnimation({ threshold: 0.1 });
  const ctaRef = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Lotaria Portugal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  size="sm"
                  className="transition-all hover:scale-105"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                size="sm"
                className="transition-all hover:scale-105"
              >
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden py-20 sm:py-32 opacity-0 translate-y-10 transition-all duration-700 ease-out animate-in:opacity-100 animate-in:translate-y-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight">
                Análise Completa de{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Sorteios
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore estatísticas, verifique suas chaves e receba sugestões inteligentes para EuroMilhões e Totoloto.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="transition-all hover:scale-105 hover:shadow-lg"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="transition-all hover:scale-105"
              >
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 sm:py-32 opacity-0 translate-y-10 transition-all duration-700 ease-out animate-in:opacity-100 animate-in:translate-y-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Funcionalidades Principais</h3>
            <p className="text-lg text-muted-foreground">Tudo que precisa para analisar seus jogos favoritos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Verificador de Chaves",
                description: "Verifique se sua chave foi sorteada e descubra quando."
              },
              {
                icon: Zap,
                title: "Estatísticas Avançadas",
                description: "Números mais e menos frequentes com análise detalhada."
              },
              {
                icon: Sparkles,
                title: "Sugestões Inteligentes",
                description: "Receba chaves sugeridas com base em estratégias comprovadas."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-xl border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-20 sm:py-32 opacity-0 translate-y-10 transition-all duration-700 ease-out animate-in:opacity-100 animate-in:translate-y-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-2xl p-12 sm:p-16 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { number: "1000+", label: "Sorteios Analisados" },
                { number: "50K+", label: "Utilizadores Ativos" },
                { number: "99.9%", label: "Precisão Garantida" }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-20 sm:py-32 opacity-0 translate-y-10 transition-all duration-700 ease-out animate-in:opacity-100 animate-in:translate-y-0"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h3 className="text-3xl sm:text-4xl font-bold">
            Pronto para começar?
          </h3>
          <p className="text-lg text-muted-foreground">
            Junte-se a milhares de utilizadores que já estão a maximizar suas chances com análises inteligentes.
          </p>
          <Button 
            size="lg"
            className="transition-all hover:scale-105 hover:shadow-lg"
          >
            Aceder Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Lotaria Portugal</h4>
              <p className="text-sm text-muted-foreground">Análise inteligente de sorteios.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2026 Lotaria Portugal. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
