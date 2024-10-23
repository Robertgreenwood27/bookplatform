// src/app/page.tsx
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'

interface Author {
  _id: string
  name: string
}

interface Book {
  _id: string
  title: string
  slug: {
    current: string
  }
  coverImage: any
  description?: string
  author?: Author
}

async function getBooks() {
  try {
    // First, verify connection by fetching count of both draft and published documents
    const booksCount = await client.fetch(`count(*[_type == "book" && !(_id in path("drafts.**"))])`)
    console.log('Total number of published books in Sanity:', booksCount)

    // Fetch full book data, explicitly excluding drafts
    const books = await client.fetch(`
      *[_type == "book" && !(_id in path("drafts.**"))] {
        _id,
        title,
        slug,
        coverImage,
        description,
        "author": author->{
          _id,
          name
        }
      }
    `)
    
    // Detailed logging
    console.log('Raw books data:', JSON.stringify(books, null, 2))
    
    // Verify each book has required fields
    books?.forEach((book: any, index: number) => {
      console.log(`\nBook ${index + 1} validation:`)
      console.log('- Has _id:', !!book?._id)
      console.log('- Has title:', !!book?.title)
      console.log('- Has slug:', !!book?.slug?.current)
      console.log('- Has coverImage:', !!book?.coverImage)
    })

    return books
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

export default async function Home() {
  const books = await getBooks()

  // Add debug logging
  console.log('Number of books:', books?.length)

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-bold text-center mb-12">Your Library</h1>
        
        {books?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <Link 
                href={`/books/${book.slug.current}`} 
                key={book._id}
                className="group relative block"
              >
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-xl transition-all duration-300 group-hover:scale-105 bg-zinc-900">
                  {book.coverImage && (
                    <Image
                      src={urlForImage(book.coverImage)?.url() || ''}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                  <div className="absolute bottom-0 w-full p-6 space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      {book.title}
                    </h2>
                    {book.author && (
                      <p className="text-sm text-gray-300">
                        by {book.author.name}
                      </p>
                    )}
                    {book.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {book.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No books found</p>
          </div>
        )}
      </main>
    </div>
  )
}
