# Members 2-4 Backend Handoff

## Scope

This change completes the modules assigned to members 2, 3, and 4 in
`backend实现指南.md`:

- Member 2: `paper`
- Member 3: `library`, `comment`, `learning`
- Member 4: `reader`, `note`

No personal database configuration is included in this document.

## Implemented APIs

### Paper

- `GET /api/papers`
- `GET /api/papers/{id}`
- `POST /api/papers`
- `POST /api/papers/{paperId}/upload-pdf`
- `GET /api/papers/{paperId}/pdf`
- `GET /api/papers/proxy?url=...`

### Library

- `GET /api/library/favorites`
- `POST /api/library/favorites`
- `DELETE /api/library/favorites/{paperId}`
- `POST /api/library/stars`

### Comment

- `GET /api/papers/{paperId}/comments`
- `POST /api/papers/{paperId}/comments`
- `PUT /api/papers/{paperId}/comments/{commentId}`
- `DELETE /api/papers/{paperId}/comments/{commentId}`

### Learning

- `GET /api/learning/stats`
- `GET /api/learning/records?period=weekly|monthly|all`
- `POST /api/learning/knowledge-graph?period=weekly|monthly|all`

### Reader and Note

- `GET /api/papers/{paperId}/progress`
- `POST /api/papers/{paperId}/progress?currentPage=...&totalPages=...`
- `GET /api/papers/{paperId}/annotations`
- `POST /api/papers/{paperId}/annotations`
- `PUT /api/papers/{paperId}/annotations/{annotationId}`
- `DELETE /api/papers/{paperId}/annotations/{annotationId}`

The earlier `/api/papers/{paperId}/notes` frontend contract remains available
through a compatibility controller. It reuses the annotation service and does
not create a duplicate note table.

## Conventions

- JSON controllers return `Result<T>`.
- Request bodies use request DTOs and `@Valid`.
- Current-user data comes from `SecurityUtil`.
- Controllers do not expose JPA entities.
- Cross-module access goes through services or the `PaperStatusProvider` SPI.
- Paper status and library paper details use batch lookups to avoid N+1 queries.
- Comment and annotation updates are restricted to their owner.
- Annotation requests support the PDF coordinate fields used by the current
  frontend: `pdfX`, `pdfY`, `pdfWidth`, and `pdfHeight`.

## Tests

The following unit tests cover search, arXiv deduplication, favorites, stars,
comment ownership, learning aggregation, knowledge graph generation, reading
progress, annotation validation, and PDF coordinates:

- `PaperServiceTest`
- `LibraryServiceTest`
- `CommentServiceTest`
- `LearningServiceTest`
- `ReaderServiceTest`
- `NoteServiceTest`

Latest result: `17 passed, 0 failed` with JDK 17.

Run from the `backend` directory:

```powershell
mvn "-Dtest=PaperServiceTest,LibraryServiceTest,CommentServiceTest,LearningServiceTest,ReaderServiceTest,NoteServiceTest" test
```

## Commit Scope

Stage only these paths for this handoff:

```powershell
git add backend/src/main/java/com/papermate/paper
git add backend/src/main/java/com/papermate/library
git add backend/src/main/java/com/papermate/comment
git add backend/src/main/java/com/papermate/learning
git add backend/src/main/java/com/papermate/reader
git add backend/src/main/java/com/papermate/note
git add backend/src/test/java/com/papermate
git add docs/members-2-3-4-backend-handoff.md
```
