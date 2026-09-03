# Query planner

`packages/project-intelligence/src/documents/query-plan.ts`

Outputs: intent, subject/subjects (OR-alternatives), property, constraint, qualifier, unitExpectation, relationship, expectedAnswerType, distinctiveTerms, retrievalQueries.

Supports questions, commands, fragments, design/review statements, and inverted “shall … at what …” forms. No document-specific phrases.
