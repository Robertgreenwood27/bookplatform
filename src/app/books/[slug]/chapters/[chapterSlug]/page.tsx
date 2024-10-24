import { client } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import type { TypedObject } from '@portabletext/types'
import type { 
  PortableTextBlock, 
  PortableTextMarkDefinition,
  PortableTextComponentProps
} from '@portabletext/react'

interface CodeBlock extends TypedObject {
  _type: 'code'
  code: string
  language?: string
  filename?: string
}

interface SanityImageBlock extends TypedObject {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
}

interface Chapter {
  _id: string
  title: string
  content: TypedObject[]
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

const components: PortableTextComponents = {
  types: {
    code: ({ value }: PortableTextComponentProps<CodeBlock>) => {
      return (
        <pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm font-mono" data-language={value.language}>
            {value.code}
          </code>
        </pre>
      )
    },
    image: ({ value }: PortableTextComponentProps<SanityImageBlock>) => {
      const imageUrl = urlForImage(value)?.url()
      return (
        <figure className="my-8">
          {imageUrl && (
            <div className="relative aspect-video w-full">
              <Image
                src={imageUrl}
                alt={value.alt || ''}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h1: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>
    ),
    blockquote: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <blockquote className="border-l-4 border-zinc-700 pl-4 my-4 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
  },
  marks: {
    code: ({ children }: PortableTextComponentProps<PortableTextMarkDefinition>) => (
      <code className="bg-zinc-800 rounded px-1 py-0.5 font-mono text-sm">
        {children}
      </code>
    ),
    link: ({ children, value }: PortableTextComponentProps<PortableTextMarkDefinition & { href: string }>) => (
      <a 
        href={value?.href} 
        className="text-blue-400 hover:text-blue-300 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: PortableTextComponentProps<PortableTextMarkDefinition>) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: PortableTextComponentProps<PortableTextMarkDefinition>) => (
      <em className="italic">{children}</em>
    ),
    underline: ({ children }: PortableTextComponentProps<PortableTextMarkDefinition>) => (
      <span className="underline">{children}</span>
    ),
    'strike-through': ({ children }: PortableTextComponentProps<PortableTextMarkDefinition>) => (
      <span className="line-through">{children}</span>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-2">{children}</li>,
    number: ({ children }) => <li className="mb-2">{children}</li>,
  },
}

async function getChapterData(bookSlug: string, chapterSlug: string): Promise<PageData> {
  try {
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
      (ch: ChapterNavigation) => ch.slug.current === chapterSlug
    )

    const previousChapter = currentIndex > 0 ? data.allChapters[currentIndex - 1] : null
    const nextChapter = currentIndex < data.allChapters.length - 1 
      ? data.allChapters[currentIndex + 1] 
      : null

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
            <PortableText 
              value={chapter.content} 
              components={components}
            />
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
