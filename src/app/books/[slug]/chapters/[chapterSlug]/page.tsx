// src/app/books/[slug]/chapters/[chapterSlug]/page.tsx
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PortableTextBlock } from '@portabletext/types'

// Refined types for Sanity content
interface SanityReference {
  _ref: string
  _type: 'reference'
}

interface SanitySlug {
  current: string
  _type: 'slug'
}

interface ChapterContent extends PortableTextBlock {
  children: Array<{
    text: string
    _type: 'span'
    _key: string
  }>
  _type: 'block'
  _key: string
}

interface Chapter {
  _id: string
  title: string
  content: ChapterContent[]
  order: number
  audioFile?: {
    asset: {
      url: string
    }
  }
}

interface ChapterNavigation {
  _id: string
  title: string
  slug: SanitySlug
  order: number
}

interface Author {
  name: string
}

interface Book {
  _id: string
  title: string
  author: Author
  chapters: SanityReference[]
}

interface PageData {
  chapter: Chapter
  book: Book
  previousChapter?: ChapterNavigation
  nextChapter?: ChapterNavigation
}

async function getChapterData(bookSlug: string, chapterSlug: string): Promise<PageData> {
  try {
    const data = await client.fetch<{
      chapter: Chapter
      book: Book
      allChapters: ChapterNavigation[]
    }>(`{
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
        "author": author->{ name },
        chapters
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
      (ch) => ch.slug.current === chapterSlug
    )

    const previousChapter = currentIndex > 0 ? data.allChapters[currentIndex - 1] : undefined
    const nextChapter = currentIndex < data.allChapters.length - 1 
      ? data.allChapters[currentIndex + 1] 
      : undefined

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

interface PageProps {
  params: { 
    slug: string
    chapterSlug: string 
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapter, book, previousChapter, nextChapter } = await getChapterData(
    params.slug,
    params.chapterSlug
  )

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

          {/* Audio Player */}
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
            {chapter.content?.map((block) => {
              if (block._type === 'block') {
                return (
                  <p key={block._key} className="mb-4">
                    {block.children
                      .map((child) => child.text)
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
              <div></div>
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
              <div></div>
            )}
          </nav>
        </article>
      </main>
    </div>
  )
}