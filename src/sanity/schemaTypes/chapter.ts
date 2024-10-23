// src/sanity/schemaTypes/chapter.ts
export const chapter = {
    name: 'chapter',
    title: 'Chapter',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 96
        },
        validation: (Rule: any) => Rule.required()
      },
      {
        name: 'content',
        title: 'Content',
        type: 'array',
        of: [
          {
            type: 'block'
          },
          {
            type: 'image',
            fields: [
              {
                name: 'alt',
                type: 'string',
                title: 'Alternative text',
                description: 'Important for SEO and accessibility.',
                validation: (Rule: any) => Rule.required()
              }
            ]
          }
        ]
      },
      {
        name: 'audioFile',
        title: 'Audio File',
        type: 'file',
        options: {
          accept: 'audio/*'
        }
      },
      {
        name: 'order',
        title: 'Chapter Order',
        type: 'number',
        validation: (Rule: any) => Rule.required()
      }
    ],
    orderings: [
      {
        title: 'Chapter Order',
        name: 'chapterOrder',
        by: [
          {field: 'order', direction: 'asc'}
        ]
      }
    ]
  }