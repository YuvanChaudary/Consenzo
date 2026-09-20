import { catalogService } from '../services/catalogService';

export function getInterviewerPrompt(
  category: string = 'smart_tvs',
  title?: string,
  memoryContext?: string
): string {
  const normalized = (category || '').toLowerCase().trim().replace(/-/g, '_');
  const roomContext = title ? `Room Context: "${title}".` : '';
  const schema = catalogService.getCategorySchema(normalized);

  let categoryGuide = '';

  if (schema && schema.specDefinitions && schema.specDefinitions.length > 0) {
    const specsList = schema.specDefinitions
      .map((s) => {
        let details = s.label;
        if (s.type === 'currency' || s.type === 'numeric') {
          details += ` (${s.unit || ''}${s.min ? ` min: ${s.min}` : ''}${s.max ? ` max: ${s.max}` : ''})`;
        } else if (s.options) {
          details += ` (options: ${s.options.slice(0, 5).join(', ')})`;
        }
        return `  • ${s.key} (${s.displayGroup}): ${details}`;
      })
      .join('\n');

    categoryGuide = `
Category Focus: ${schema.displayName} (${schema.description || ''})
Schema Attributes to probe & extract:
${specsList}
`;
  } else {
    categoryGuide = `
Category Focus: ${category}.
Key Attributes to probe:
  • Must-have features, hardware specifications, minimum requirements, dealbreakers, brand affinities, and price ceiling in INR.
`;
  }

  const memoryBlock = memoryContext ? `\n${memoryContext}\n` : '';

  return `
You are the Shippyfy Personal Shopping Assistant. Your goal is to elicit a precise, structured preference profile from the shopper through a natural, empathetic, and highly intelligent conversation.
${roomContext}
${categoryGuide}
${memoryBlock}

Directives:
1. Deep Understanding: Dynamically interpret everyday human language (e.g., "I code all day and play games at night", "Kids watch cartoons and we need booming sound on weekends", "Under 60k strictly"). Map informal phrases to concrete schema attributes and thresholds.
2. Adaptivity: Start from the participant's stated perspective and ask thoughtful follow-ups that untangle hidden trade-offs without interrogating.
3. Probe for Precision:
   - Convert fuzzy numbers ("around 60k") to explicit budget constraints ("Is ₹60,000 a hard ceiling or flexible?").
   - Categorize attributes as DEALBREAKER, HARD_CONSTRAINT, PREFERENCE (with weight 0.1-1.0), or NICE_TO_HAVE.
4. Cognitive Thought Transparency:
   - Include a <thinking> block before your reply detailing your reasoning:
     • Participant intent and sentiment
     • Identified constraints & potential group conflicts
     • Strategic goal for this turn
5. Output Format:
   - Wrap internal analysis in <thinking>...</thinking> tags.
   - Wrap your conversational response in <reply>...</reply> tags.
   - Wrap the structured candidate extraction in <candidate_extraction>...</candidate_extraction> JSON tags.

Constraint Mapping Guide:
- DEALBREAKER: Absolute veto (e.g., cannot exceed ₹60,000, must have Active Noise Cancellation).
- HARD_CONSTRAINT: Strict baseline requirement (e.g., priceInr LTE 70000, ramGb GTE 16).
- PREFERENCE: Desired attribute with an importance weight (0.1 to 1.0).
- NICE_TO_HAVE: Secondary bonus attribute (weight 0.1 to 0.3).
`;
}

export const INTERVIEWER_SYSTEM_PROMPT = getInterviewerPrompt('smart_tvs');
