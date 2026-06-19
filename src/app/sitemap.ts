import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pustaka.manhajsalafinsights.com'

  const { data: books } = await supabase
    .from('books')
    .select('id, updated_at')
    .in('status', ['published', 'scheduled'])
    .order('created_at', { ascending: false })

  const bookUrls: MetadataRoute.Sitemap = (books || []).map((book: { id: string; updated_at: string | null }) => ({
    url: `${baseUrl}/book/${book.id}`,
    lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/rekomendasi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...bookUrls,
  ]
}
