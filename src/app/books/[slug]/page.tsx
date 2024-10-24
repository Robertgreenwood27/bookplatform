// src/app/books/[slug]/page.tsx
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SanityAsset } from '@sanity/image-url/lib/types/types'

interface Chapter {
  _id: string
  title: string
  slug: {
    current: string
  }
  order: number
}

interface SanityImage {
  _type: 'image'
  asset: SanityAsset
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

interface Book {
  _id: string
  title: string
  description?: string
  coverImage: SanityImage
  author?: {
    name: string
  }
  chapters: Chapter[]
}

async function getBook(slug: string) {
  try {
    // First, let's get all chapters for this book directly
    const allChapters = await client.fetch(`
      *[_type == "chapter" && references(*[_type == "book" && slug.current == $slug]._id)] {
        _id,
        title,
        slug,
        order
      } | order(order asc)
    `, { slug })
    
    console.log('All available chapters:', JSON.stringify(allChapters, null, 2))

    // Now get the book with its chapters array
    const book = await client.fetch<Book>(`
      *[_type == "book" && slug.current == $slug][0] {
        _id,
        title,
        description,
        coverImage,
        "author": author->{name},
        "chapters": *[_type == "chapter" && _id in ^.chapters[]._ref] | order(order asc) {
          _id,
          title,
          slug,
          order
        }
      }
    `, { slug })

    console.log('Book data:', JSON.stringify(book, null, 2))

    if (book?._id) {
      // Get raw chapters array from book document
      const rawBookData = await client.fetch(`
        *[_type == "book" && slug.current == $slug][0] {
          chapters
        }
      `, { slug })
      console.log('Raw chapters array from book:', JSON.stringify(rawBookData, null, 2))
    }

    return book
  } catch (error) {
    console.error('Error fetching book:', error)
    throw error
  }
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug)

  if (!book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            ← Back to Library
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
            {book.coverImage && (
              <Image
                src={urlForImage(book.coverImage)?.url() || ''}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{book.title}</h1>
            {book.author && (
              <p className="text-xl text-gray-400">by {book.author.name}</p>
            )}
            {book.description && (
              <p className="text-gray-300">{book.description}</p>
            )}

            {/* Chapters */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Chapters</h2>
              <div className="space-y-2">
                {book.chapters && book.chapters.length > 0 ? (
                  book.chapters.map((chapter) => (
                    <Link
                      key={chapter._id}
                      href={`/books/${params.slug}/chapters/${chapter.slug.current}`}
                      className="block p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{chapter.title}</span>
                        <span className="text-gray-500">→</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500">No chapters found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}