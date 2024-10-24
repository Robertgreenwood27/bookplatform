// src/sanity/schemaTypes/book.ts
import { Rule, SchemaTypeDefinition } from 'sanity'

export const book: SchemaTypeDefinition = {
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }]
    },
    {
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'chapter' }] }]
    }
  ]
}