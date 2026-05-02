/**
 * lib/mentorKnowledge.ts
 * A static knowledge base to map world IDs to concepts learned,
 * so we can feed this into the AI mentor context.
 */

export const WORLD_CONCEPTS: Record<number, string[]> = {
  1: ['Pawn movement', 'Pawn chains', 'Passed pawns'],
  2: ['Knight movement', 'Outposts', 'Knight forks'],
  3: ['Bishop movement', 'Open diagonals', 'Bishop pairs'],
  4: ['Rook movement', 'Open files', 'Rook on 7th rank'],
  5: ['Queen power', 'King safety', 'Active king'],
  6: ['Pins', 'Skewers', 'Discovered attacks', 'Double checks'],
  7: ['Opening principles', 'Center control', 'Development'],
  8: ['Basic endgames', 'Opposition', 'Pawn races'],
  9: ['Piece activity', 'Weak squares', 'Prophylaxis'],
  10: ['Calculation', 'Time management', 'Game analysis']
};

export function getConceptsLearned(currentWorldId: number): string[] {
  const concepts: string[] = [];
  for (let i = 1; i <= currentWorldId; i++) {
    if (WORLD_CONCEPTS[i]) {
      concepts.push(...WORLD_CONCEPTS[i]);
    }
  }
  return concepts;
}
