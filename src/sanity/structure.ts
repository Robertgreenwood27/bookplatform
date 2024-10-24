// src/sanity/structure.ts
import type { StructureBuilder, DefaultDocumentNodeResolver } from 'sanity/desk'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items(S.documentTypeListItems())

// Optional: Add custom document node resolution
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document()
}