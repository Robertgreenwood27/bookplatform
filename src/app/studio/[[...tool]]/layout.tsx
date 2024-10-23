// src/app/studio/[[...tool]]/layout.tsx
export const metadata = {
    title: 'Sanity Studio',
    description: 'Backend for your book platform',
  }
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    )
  }