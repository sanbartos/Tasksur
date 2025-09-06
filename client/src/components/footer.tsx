import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"> {/* padding reducido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold">TaskSur</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              La plataforma líder en servicios domésticos y profesionales en Uruguay y Argentina. 
              Conectamos personas que necesitan servicios con proveedores confiables.
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-300">ðŸ‡ºðŸ‡¾ Uruguay</span>
              <span className="text-gray-300">ðŸ‡¦ðŸ‡· Argentina</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/browse?category=1" className="hover:text-white transition-colors">Limpieza</Link></li>
              <li><Link href="/browse?category=2" className="hover:text-white transition-colors">Mantenimiento</Link></li>
              <li><Link href="/browse?category=3" className="hover:text-white transition-colors">Jardinería</Link></li>
              <li><Link href="/browse?category=4" className="hover:text-white transition-colors">Delivery</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Â© 2024 TaskSur. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Pagos seguros con</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-semibold">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}




