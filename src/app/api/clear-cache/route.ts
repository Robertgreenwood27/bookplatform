// src/app/api/clear-cache/route.ts
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Get the secret token from the request
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  // Check if the token matches your secret token
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json(
      { 
        revalidated: false, 
        message: 'Invalid token' 
      }, 
      { status: 401 }
    )
  }

  try {
    // Revalidate the main paths
    revalidatePath('/')
    revalidatePath('/books/[slug]')
    revalidatePath('/books/[slug]/chapters/[chapterSlug]')
    
    // Log the cache clear (optional)
    console.log(`Cache cleared at ${new Date().toISOString()}`)
    
    return NextResponse.json({ 
      revalidated: true,
      now: Date.now()
    })
  } catch (err) {
    // Log any errors (optional)
    console.error('Error revalidating:', err)
    return NextResponse.json({
      revalidated: false,
      message: err instanceof Error ? err.message : 'An unknown error occurred'
    }, { status: 500 })
  }
}