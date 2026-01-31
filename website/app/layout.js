import './globals.css'

export const metadata = {
  title: 'La Petite Annonce - Petites annonces gratuites en France',
  description: 'Publiez et consultez des annonces gratuites : voitures, motos, immobilier, location. Simple, gratuit et sécurisé.',
  keywords: 'petites annonces, gratuit, voiture, moto, immobilier, location, France',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}