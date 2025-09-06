import { Router as WouterRouter, Route, Switch, useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SettingsPage from "@/pages/SettingsPage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";
import PerfilPage from "@/pages/PerfilPage";
import SeguridadPage from "@/pages/SeguridadPage";
import NotificacionesPage from "@/pages/NotificacionesPage";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseServices from "@/pages/browse-services";
import PostTask from "@/pages/post-task";
import TaskDetails from "@/pages/task-details";
import TaskerProfile from "@/pages/tasker-profile";
import Dashboard from "@/pages/dashboard";
import Payment from "@/pages/payment";
import HowItWorks from "@/pages/how-it-works";
import OfferServices from "@/pages/offer-services";
import CategoryPage from "@/pages/CategoryPage";
import CategoriesPage from "@/pages/CategoriesPage";
import ArticuloPage from "@/pages/ArticuloPage";

import Login from "@/pages/login";
import Register from "@/pages/register";

import ChatPage from "@/pages/ChatPage";

import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Contact from "@/pages/contact";
import EliminarCuentaPage from "@/pages/configuracion/EliminarCuentaPage";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirige en el useEffect
  }

  return <Component />;
}

function PrivateRouteWrapper(Component: React.ComponentType) {
  return function WrappedComponent() {
    return <PrivateRoute component={Component} />;
  };
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/home");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Redirige en el useEffect
  }

  return <Component />;
}

function RedirectBrowseToCanonical() {
  const [, params] = useRoute("/browse/category/:slug");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const slug = params?.slug;
    if (slug) setLocation(`/categories/${slug}`);
  }, [params, setLocation]);

  return null;
}

function RedirectIdToCanonical() {
  const [, params] = useRoute("/categories/:id");
  const [, setLocation] = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const id = params?.id;
        if (!id) return;
        const res = await fetch(`/api/categories/id/${id}`, { credentials: "include" });
        const cat = await res.json();
        if (alive && cat?.slug) {
          setLocation(`/categories/${cat.slug}`);
        } else if (alive) {
          setLocation("/categories");
        }
      } catch {
        if (alive) setLocation("/categories");
      }
    })();
    return () => {
      alive = false;
    };
  }, [params, setLocation]);

  return null;
}

const LoginPublic = () => <PublicRoute component={Login} />;
const RegisterPublic = () => <PublicRoute component={Register} />;
const HomePrivate = () => <PrivateRoute component={Home} />;
const PostTaskPrivate = () => <PrivateRoute component={PostTask} />;
const DashboardPrivate = () => <PrivateRoute component={Dashboard} />;
const PaymentPrivate = () => <PrivateRoute component={Payment} />;

function AppRouter() {
  return (
    <WouterRouter>
      <Switch>
        {/* Rutas públicas */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={LoginPublic} />
        <Route path="/register" component={RegisterPublic} />
        <Route path="/browse" component={BrowseServices} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/contact" component={Contact} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/offer-services" component={OfferServices} />
        <Route path="/configuracion" component={PrivateRouteWrapper(ConfiguracionPage)} />
        <Route path="/configuracion/perfil" component={PrivateRouteWrapper(PerfilPage)} />
        <Route path="/configuracion/seguridad" component={PrivateRouteWrapper(SeguridadPage)} />
        <Route path="/configuracion/notificaciones" component={PrivateRouteWrapper(NotificacionesPage)} />
        <Route path="/articulos/:slug" component={ArticuloPage} />

        {/* Ruta canónica por slug */}
        <Route path="/categories/:slug" component={CategoryPage} />

        {/* Redirecciones desde rutas antiguas */}
        <Route path="/browse/category/:slug" component={RedirectBrowseToCanonical} />
        <Route path="/categories/:id" component={RedirectIdToCanonical} />

        {/* Listado de categorías */}
        <Route path="/categories" component={CategoriesPage} />

        <Route path="/tasks/:id" component={TaskDetails} />
        <Route path="/taskers/:id" component={TaskerProfile} />

        {/* Ruta pública para perfil */}
        <Route path="/profile/:id" component={TaskerProfile} />

        {/* Rutas privadas */}
        <Route path="/home" component={HomePrivate} />
        <Route path="/post-task" component={PostTaskPrivate} />
        <Route path="/dashboard" component={DashboardPrivate} />
        <Route path="/payment" component={PaymentPrivate} />
        <Route path="/configuracion/eliminar-cuenta" component={EliminarCuentaPage} />

        {/* Nueva ruta privada para chat */}
        <Route path="/chat/:userId" component={PrivateRouteWrapper(ChatPage)} />

        {/* Nueva ruta privada para configuración */}
        <Route path="/configuracion" component={PrivateRouteWrapper(SettingsPage)} />

        {/* Ruta catch-all */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
              <AppRouter />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;




