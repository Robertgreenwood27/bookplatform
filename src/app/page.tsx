// src/app/page.tsx
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { SanityImageAsset, SanityImageCrop, SanityImageHotspot } from '@sanity/image-url/lib/types/types'

interface SanityImage {
  _type: 'image'
  asset: SanityImageAsset
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

interface SanitySlug {
  current: string
  _type: 'slug'
}

interface Author {
  _id: string
  name: string
}

interface BookDocument {
  _id: string
  title: string
  slug: SanitySlug
  coverImage: SanityImage
  description?: string
  author?: Author
  _createdAt: string
  _updatedAt: string
}

interface BookValidation extends BookDocument {
  publishedAt?: string
}

async function getBooks() {
  try {
    // First, check for ALL documents of type "book", including drafts
    const allBooksCount = await client.fetch<number>(`count(*[_type == "book"])`)
    console.log('Total number of books (including drafts):', allBooksCount)

    // Check specifically for published books
    const publishedBooksCount = await client.fetch<number>(`count(*[_type == "book" && !(_id in path("drafts.**"))])`)
    console.log('Number of published books:', publishedBooksCount)

    // Check for draft books
    const draftBooksCount = await client.fetch<number>(`count(*[_type == "book" && _id in path("drafts.**")])`)
    console.log('Number of draft books:', draftBooksCount)

    // Fetch ALL books first (including drafts) to see what's available
    const allBooks = await client.fetch<BookValidation[]>(`
      *[_type == "book"] {
        _id,
        title,
        slug,
        _createdAt,
        _updatedAt,
        "publishedAt": coalesce(publishedAt, _createdAt)
      }
    `)
    console.log('All available books:', JSON.stringify(allBooks, null, 2))

    // Now fetch the published books with full data
    const books = await client.fetch<BookDocument[]>(`
      *[_type == "book" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
        _id,
        title,
        slug,
        coverImage,
        description,
        _createdAt,
        _updatedAt,
        "author": author->{
          _id,
          name
        }
      }
    `)
    
    // Detailed validation for each book
    books?.forEach((book, index) => {
      console.log(`\nBook ${index + 1} (${book._id}) validation:`)
      console.log('- Title:', book?.title)
      console.log('- Slug:', book?.slug?.current)
      console.log('- Created:', book?._createdAt)
      console.log('- Updated:', book?._updatedAt)
      console.log('- Has coverImage:', !!book?.coverImage)
      console.log('- Has author:', !!book?.author)
    })

    return books
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

export default async function Home() {
  const books = await getBooks()
  console.log('Final number of books rendered:', books?.length)

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-bold text-center mb-12">Robbie's Stuff</h1>
        
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