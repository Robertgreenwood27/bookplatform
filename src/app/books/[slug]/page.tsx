// src/app/books/[slug]/page.tsx
import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Chapter {
  _id: string
  title: string
  slug: {
    current: string
  }
  order: number
}

interface Book {
  _id: string
  title: string
  description?: string
  coverImage: any
  author?: {
    name: string
  }
  chapters: Chapter[]
}

async function getBook(slug: string) {
  const book = await client.fetch<Book>(`
    *[_type == "book" && slug.current == $slug][0] {
      _id,
      title,
      description,
      coverImage,
      "author": author->{name},
      "chapters": chapters[]-> {
        _id,
        title,
        slug,
        order
      }
    }
  `, { slug })

  console.log('Fetched book data:', JSON.stringify(book, null, 2))
  return book
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug)

  if (!book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
            {book.coverImage && (
              <Image
                src={urlForImage(book.coverImage).url()}
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
            {book.chapters && book.chapters.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Chapters</h2>
                <div className="space-y-2">
                  {book.chapters.map((chapter) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}