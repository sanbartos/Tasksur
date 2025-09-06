// src/components/Header.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu, Search, Plus, User, Settings, LogOut, Home, Bell, MessageCircle, CreditCard, HelpCircle, Eye } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function Header() {
  const { user, logout } = useAuth(); // Eliminado isAuthenticated y isLoading
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading: notificationsLoading,
  } = useNotifications(user?.id || '');

  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Determinar si el usuario está autenticado basado en la existencia del usuario
  const isAuthenticated = !!user;
  // Determinar si está cargando basado en la existencia del usuario (ajusta según tu implementación)
  const isLoading = user === undefined;

  function handleLogout() {
    logout();
    setLocation("/");
  }

  // Cerrar menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setIsCategoriesOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categories = [
    "Contadores",
    "Administración",
    "Arreglos",
    "Electrodomésticos",
    "Montaje",
    "Electricistas de Autos",
    "Panaderos",
    "Barberos",
    "Esteticistas",
    "Servicio de Bicicletas",
    "Albañilería",
    "Construcción",
    "Negocios",
    "Carrocería",
    "Detalle de Autos",
    "Reparación de Autos",
    "Servicio de Autos",
    "Carpintería",
    "Cuidado de Gatos",
    "Catering",
    "Chef",
    "Revestimientos",
    "Limpieza",
    "Computadoras y TI",
    "Hormigón",
    "Terrazas",
    "Delivery",
    "Diseño",
    "Cuidado de Perros",
    "Delineante",
    "Conducción",
    "Electricistas",
    "Entretenimiento",
    "Eventos",
    "Cercas",
    "Pisos",
    "Floristería",
    "Montaje de Muebles",
    "Jardinería",
    "Instalación de Portones",
    "Peluqueros",
    "Manitas",
    "Calefacción y Refrigeración",
    "Domótica y Seguridad",
    "Home Theatre",
    "Diseñador de Interiores",
    "Paisajismo",
    "Lavandería",
    "Cuidado de Césped",
    "Clases",
    "Cerrajería",
    "Maquillaje",
    "Marketing",
    "Mecánico Móvil",
    "Pintura",
    "Pavimentación",
    "Control de Plagas",
    "Cuidado de Mascotas",
    "Fotógrafos",
    "Yesero",
    "Plomería",
    "Mantenimiento de Piscinas",
    "Mudanzas",
    "Techos",
    "Afilado",
    "Personal",
    "Sastres",
    "Tatuadores",
    "Albañiles",
    "Tutorías",
    "Colgado de Paredes",
    "Papel Tapiz",
    "Impermeabilización",
    "Web",
    "Servicio de Ruedas y Neumáticos",
    "Redacción",
  ];

  const isActive = (path: string) => location === path;

  // Corregido: usar solo el id de la notificación
  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setNotificationsOpen(false);
    // Redirigir a una página genérica de notificaciones o dashboard
    setLocation("/notificaciones");
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>Cargando...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-tasksur-primary rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-tasksur-dark">TaskSur</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center relative">
            {isAuthenticated ? (
              <>
                <Link
                  href="/offer-services"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  Ofrecer Tareas
                </Link>

                <Link
                  href="/browse"
                  className={`text-tasksur-neutral hover:text-tasksur-primary transition-colors ${
                    isActive("/browse") ? "text-tasksur-primary font-medium" : ""
                  }`}
                >
                  Encontrar Servicios
                </Link>

                {/* Categorías con menú desplegable grande */}
                <div
                  ref={categoriesRef}
                  className="relative"
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <button
                    aria-haspopup="true"
                    aria-expanded={isCategoriesOpen}
                    className={`text-tasksur-neutral hover:text-tasksur-primary transition-colors ${
                      isCategoriesOpen ? "text-tasksur-primary font-medium" : ""
                    }`}
                  >
                    Categorías
                  </button>

                  <div
                    className={`absolute top-full left-0 mt-2 w-[600px] bg-white border border-gray-200 rounded shadow-lg z-50
                      transform transition-all duration-200 origin-top
                      ${
                        isCategoriesOpen
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      }
                    `}
                  >
                    <div className="p-6 grid grid-cols-3 gap-6 text-sm text-gray-700">
                      {/* Sección 1 */}
                      <div>
                        <h3 className="font-semibold mb-2">¿Qué estás buscando?</h3>
                        <p className="mb-4">Elige un tipo de tarea.</p>

                        <h4 className="font-semibold">Como Tasker</h4>
                        <p className="mb-4">Busco trabajo en ...</p>

                        <h4 className="font-semibold">Como Publicante</h4>
                        <p>Busco contratar a alguien para ...</p>
                      </div>

                      {/* Sección 2: Lista de categorías */}
                      <div className="col-span-2">
                        <h3 className="font-semibold mb-2">Categorías</h3>
                        <ul className="columns-2 gap-4 max-h-96 overflow-y-auto">
                          {categories.map((cat, i) => (
                            <li key={i} className="mb-1">
                              <Link
                                href={`/browse?category=${encodeURIComponent(cat)}`}
                                className="hover:text-tasksur-primary block"
                              >
                                {cat}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <Link
                            href="/browse"
                            className="text-tasksur-primary font-semibold hover:underline"
                          >
                            Ver todas →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/post-task"
                  className={`text-tasksur-neutral hover:text-tasksur-primary transition-colors ${
                    isActive("/post-task") ? "text-tasksur-primary font-medium" : ""
                  }`}
                >
                  Publicar Tarea
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-tasksur-neutral hover:text-tasksur-primary transition-colors ${
                    isActive("/dashboard") ? "text-tasksur-primary font-medium" : ""
                  }`}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                {/* Desktop Navigation para no autenticados */}
                <Link href="/browse" className="text-tasksur-neutral hover:text-tasksur-primary transition-colors">
                  Encontrar Trabajos
                </Link>
                <Link href="/categories" className="text-tasksur-neutral hover:text-tasksur-primary transition-colors">
                  Categorías
                </Link>
                <Link href="/offer-services" className="text-tasksur-neutral hover:text-tasksur-primary transition-colors">
                  Ofrecer Trabajos
                </Link>
                <Link href="/how-it-works" className="text-tasksur-neutral hover:text-tasksur-primary transition-colors">
                  Cómo Funciona
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Dropdown de Notificaciones */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                    aria-label="Notificaciones"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center p-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>

                      {notificationsLoading ? (
                        <p className="p-4 text-center text-gray-500">Cargando...</p>
                      ) : notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">No tienes notificaciones</p>
                      ) : (
                        // Corregido: usar propiedades correctas de Notification
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            className="cursor-pointer hover:bg-gray-50 p-3 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">{notification.title}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Dropdown de Usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.firstName ?? undefined} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {/* Navegación principal */}
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")} className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>

                    {/* Opciones según el rol - Corregido: usar isTasker en lugar de role */}
                    {user?.isTasker ? (
                      <DropdownMenuItem onClick={() => setLocation("/mis-tareas")} className="cursor-pointer flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Mis Tareas</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setLocation("/mis-publicaciones")} className="cursor-pointer flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Mis Publicaciones</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => setLocation("/mensajes")} className="cursor-pointer flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Mensajes</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setLocation("/pagos")} className="cursor-pointer flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Historial de Pagos</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Perfil y soporte */}
                    <DropdownMenuItem onClick={() => setLocation(`/perfil/${user?.id}`)} className="cursor-pointer flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Ver Perfil Público</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setLocation("/ayuda")} className="cursor-pointer flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Ayuda y Soporte</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Configuración y cierre de sesión */}
                    <DropdownMenuItem onClick={() => setLocation("/configuracion")} className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <button onClick={handleLogout} className="cursor-pointer flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-tasksur-neutral hover:text-tasksur-primary">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-tasksur-primary text-white hover:bg-blue-700">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                {/* âœ… Añadido título y descripción accesibles */}
                <SheetTitle>
                  <VisuallyHidden>Menú de navegación</VisuallyHidden>
                </SheetTitle>
                <SheetDescription>
                  <VisuallyHidden>Accede a las opciones de navegación y configuración</VisuallyHidden>
                </SheetDescription>

                <div className="flex flex-col space-y-4 mt-8">
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center space-x-3 pb-4 border-b">
                        <Avatar>
                          <AvatarImage src={user?.profileImageUrl ?? undefined} />
                          <AvatarFallback>
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-2">
                        <Link href="/offer-services">
                          <Button
                            className="w-full bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Ofrecer Tareas
                          </Button>
                        </Link>
                        <Link href="/browse">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Search className="mr-2 h-4 w-4" />
                            Encontrar Servicios
                          </Button>
                        </Link>
                        <Link href="/post-task">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Publicar Tarea
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation("/dashboard");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </div>

                      {/* Nuevas opciones móviles */}
                      <div className="pt-4 border-t space-y-2">
                        {/* Opciones según el rol - Corregido: usar isTasker */}
                        {user?.isTasker ? (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setLocation("/mis-tareas");
                              setMobileMenuOpen(false);
                            }}
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Mis Tareas
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setLocation("/mis-publicaciones");
                              setMobileMenuOpen(false);
                            }}
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Mis Publicaciones
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation("/mensajes");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Mensajes
                        </Button>

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation("/pagos");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Historial de Pagos
                        </Button>

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation(`/perfil/${user?.id}`);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Perfil Público
                        </Button>

                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation("/ayuda");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Ayuda y Soporte
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setLocation("/configuracion");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Menú móvil para no autenticados */}
                      <div className="space-y-2">
                        <Link href="/browse">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            Encontrar Servicios
                          </Button>
                        </Link>
                        <Link href="/offer-services">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            Ofrecer Servicios
                          </Button>
                        </Link>
                        <Link href="/how-it-works">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                            Cómo Funciona
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <Link href="/login">
                          <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                            Iniciar Sesión
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button className="w-full bg-tasksur-primary hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>
                            Registrarse
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}




