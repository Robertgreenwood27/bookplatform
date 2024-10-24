// src/app/books/[slug]/chapters/[chapterSlug]/page.tsx
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Chapter {
  _id: string
  title: string
  content: any[]
  order: number
  audioFile?: {
    asset: {
      url: string
    }
  }
}

interface ChapterNavigation {
  title: string
  slug: {
    current: string
  }
}

interface Book {
  _id: string
  title: string
  author: {
    name: string
  }
}

interface PageData {
  chapter: Chapter
  book: Book
  previousChapter?: ChapterNavigation
  nextChapter?: ChapterNavigation
}

async function getChapterData(bookSlug: string, chapterSlug: string): Promise<PageData> {
  try {
    // Get complete data in a single query
    const data = await client.fetch(`{
      "chapter": *[_type == "chapter" && slug.current == $chapterSlug][0] {
        _id,
        title,
        content,
        order,
        audioFile {
          asset-> {
            url
          }
        }
      },
      "book": *[_type == "book" && slug.current == $bookSlug][0] {
        _id,
        title,
        "author": author->{ name }
      },
      "allChapters": *[
        _type == "chapter" && 
        _id in *[_type == "book" && slug.current == $bookSlug][0].chapters[]._ref
      ] | order(order asc) {
        _id,
        title,
        slug,
        order
      }
    }`, { bookSlug, chapterSlug })

    const currentIndex = data.allChapters.findIndex(
      (ch: any) => ch.slug.current === chapterSlug
    )

    const previousChapter = currentIndex > 0 ? data.allChapters[currentIndex - 1] : null
    const nextChapter = currentIndex < data.allChapters.length - 1 
      ? data.allChapters[currentIndex + 1] 
      : null

    console.log('Navigation Debug:', {
      currentChapterSlug: chapterSlug,
      totalChapters: data.allChapters.length,
      allChapterOrders: data.allChapters.map((ch: any) => ({
        title: ch.title,
        order: ch.order,
        slug: ch.slug.current
      })),
      currentIndex,
      hasPrevious: !!previousChapter,
      hasNext: !!nextChapter,
      previousChapter: previousChapter ? {
        title: previousChapter.title,
        order: previousChapter.order,
        slug: previousChapter.slug.current
      } : null,
      nextChapter: nextChapter ? {
        title: nextChapter.title,
        order: nextChapter.order,
        slug: nextChapter.slug.current
      } : null
    })

    return {
      chapter: data.chapter,
      book: data.book,
      previousChapter,
      nextChapter
    }
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
  const { chapter, book, previousChapter, nextChapter } = await getChapterData(
    params.slug,
    params.chapterSlug
  )

  if (!chapter || !book) {
    notFound()
  }

  // Debug logging in the component
  console.log('Navigation links state:', {
    hasPreviousChapter: !!previousChapter,
    previousChapterTitle: previousChapter?.title,
    hasNextChapter: !!nextChapter,
    nextChapterTitle: nextChapter?.title
  })

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
              return null
            })}
          </div>

          {/* Chapter Navigation */}
          <nav className="mt-12 flex justify-between items-center border-t border-zinc-800 pt-6">
            {previousChapter ? (
              <Link
                href={`/books/${params.slug}/chapters/${previousChapter.slug.current}`}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ChevronLeft size={20} />
                <div>
                  <div className="text-sm text-gray-400">Previous</div>
                  <div>{previousChapter.title}</div>
                </div>
              </Link>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}

            {nextChapter ? (
              <Link
                href={`/books/${params.slug}/chapters/${nextChapter.slug.current}`}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors ml-auto"
              >
                <div className="text-right">
                  <div className="text-sm text-gray-400">Next</div>
                  <div>{nextChapter.title}</div>
                </div>
                <ChevronRight size={20} />
              </Link>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
          </nav>
        </article>
      </main>
    </div>
  )
}
