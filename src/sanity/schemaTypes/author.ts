// src/sanity/schemaTypes/author.ts
import { Rule } from '@sanity/types'

export const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: Rule) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      }
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text'
    }
  ]
}

// Type definitions for other schemas that might need them
interface SanitySchema {
  name: string
  title: string
  type: string
  fields: SchemaField[]
}

interface SchemaField {
  name: string
  title: string
  type: string
  validation?: (rule: Rule) => Rule
  options?: {
    [key: string]: unknown
  }
}

// Export the schema types for use in other schema files
export type { SanitySchema, SchemaField }