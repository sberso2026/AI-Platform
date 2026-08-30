const CAUSAL_ASSERTION = /\b(caused|causing|cause of|cause the|because of this change|this change delayed|this risk delayed)\b/i;

export function requestsCausalAssertion(question: string): boolean {
  return CAUSAL_ASSERTION.test(question);
}

export function causalSafetyClaim(hasExplicitLink: boolean): string {
  if (hasExplicitLink) {
    return "These items are explicitly linked in authorized project evidence. That link does not by itself prove that one item caused the other.";
  }
  return "These signals occur together in the current intelligence. There is no authorized evidence that one caused the other.";
}
