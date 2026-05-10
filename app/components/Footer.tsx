export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-gray-400">

        <p className="font-semibold text-white mb-2">
          Cast To Cast Baloncesto
        </p>

        <a
          href="mailto:cast2cast.sports@gmail.com"
          className="block text-white hover:text-orange-400 transition-colors mb-4"
        >
          cast2cast.sports@gmail.com
        </a>

        <p className="text-xs text-gray-500">
          © 2026 Cast To Cast Baloncesto. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}