import './globals.css'

export const metadata = {
  title: 'Spiritual Reflections',
  description: 'Transform news into spiritual wisdom in the style of Maulana Wahiduddin Khan',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        {/* Header */}
        <header className="border-b border-gold/20 bg-dark-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <span className="text-2xl">&#9672;</span>
                <h1 className="text-xl font-semibold heading-gold">Spiritual Reflections</h1>
              </a>
              <div className="flex gap-6">
                <a href="/" className="text-cream/70 hover:text-gold transition-colors">Home</a>
                <a href="/favorites" className="text-cream/70 hover:text-gold transition-colors">Favorites</a>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gold/20 mt-16 py-8 text-center text-cream/50">
          <p className="text-sm">
            Inspired by the teachings of <span className="text-gold">Maulana Wahiduddin Khan</span> (1925-2021)
          </p>
          <p className="text-xs mt-2">
            Transforming material news into spiritual reflections through Tafakkur
          </p>
        </footer>
      </body>
    </html>
  )
}
