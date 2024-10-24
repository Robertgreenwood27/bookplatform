import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from './schemaTypes'
import { projectId, dataset } from './env'
import type { StructureBuilder } from 'sanity/desk'

// Define the structure builder function with proper typing
const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items(S.documentTypeListItems())

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    deskTool({
      structure
    }),
    visionTool(),
    codeInput(),
  ],
})