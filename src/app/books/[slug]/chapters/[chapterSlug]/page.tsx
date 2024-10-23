// src/app/books/[slug]/chapters/[chapterSlug]/page.tsx
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Chapter {
  _id: string
  title: string
  content: any[]
  audioFile?: {
    asset: {
      url: string
    }
  }
}

interface Book {
  title: string
  author: {
    name: string
  }
}

async function getChapter(bookSlug: string, chapterSlug: string) {
  try {
    const data = await client.fetch(`{
      "chapter": *[_type == "chapter" && slug.current == $chapterSlug][0] {
        _id,
        title,
        content,
        audioFile {
          asset-> {
            url
          }
        }
      },
      "book": *[_type == "book" && slug.current == $bookSlug][0] {
        title,
        "author": author->{ name }
      }
    }`, { bookSlug, chapterSlug })

    console.log('Fetched chapter data:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('Error fetching chapter:', error)
    throw error
  }
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterSlug: string }
}) {
  const { chapter, book } = await getChapter(params.slug, params.chapterSlug)

  if (!chapter || !book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href={`/books/${params.slug}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to {book.title}
          </Link>
        </div>

        {/* Chapter Content */}
        <article className="max-w-prose mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{chapter.title}</h1>
            {book.author && (
              <p className="text-gray-400">from {book.title} by {book.author.name}</p>
            )}
          </header>

          {/* Audio Player (if available) */}
          {chapter.audioFile?.asset?.url && (
            <div className="mb-8">
              <audio 
                controls 
                className="w-full"
                src={chapter.audioFile.asset.url}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Chapter Text Content */}
          <div className="prose prose-invert prose-lg">
            {chapter.content?.map((block: any) => {
              if (block._type === 'block') {
                return (
                  <p key={block._key} className="mb-4">
                    {block.children
                      .map((child: any) => child.text)
                      .join('')}
                  </p>
                )
              }
              // Handle other block types as needed
              return null
            })}
          </div>
        </article>
      </main>
    </div>
  )
}