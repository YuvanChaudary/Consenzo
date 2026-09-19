import { AgentTurnResponse } from './types';
import { CanonicalConstraint } from '@shared/types/preferences';

export interface DynamicExtractionOptions {
  category?: string;
  roomTitle?: string;
}

export function extractDynamicPreferences(
  transcript: string,
  options?: DynamicExtractionOptions
): AgentTurnResponse {
  const constraints: CanonicalConstraint[] = [];
  const thinkingSteps: string[] = [];

  // Isolate actual user speech from system prompts/instructions
  let userSpeech = transcript;
  if (transcript.includes("User's Latest Message:")) {
    const parts = transcript.split("User's Latest Message:");
    const latest = (parts[1] || '').split('Instructions:')[0].trim();
    const historyMatch = parts[0].match(/Current Transcript:\s*([\s\S]*?)(?:User's Latest Message:|$)/i);
    const history = historyMatch ? historyMatch[1].trim() : '';
    userSpeech = `${history}\n${latest}`.trim();
  } else if (transcript.includes('Transcript:')) {
    const parts = transcript.split('Transcript:');
    userSpeech = (parts[1] || '').split('Directives:')[0].split('Instructions:')[0].trim();
  }

  // 1. Detect Category Context
  let detectedCategory = (options?.category || '').toLowerCase().trim();
  if (!detectedCategory || detectedCategory === 'smart_tvs' || detectedCategory === 'general') {
    if (/\b(?:laptop|notebook|macbook|thinkpad|workstation|ram|gb ram|rtx|cpu|gpu|ssd|intel|ryzen|coding|programming)\b/i.test(userSpeech) || /\b(?:laptop|workstation)\b/i.test(transcript)) {
      detectedCategory = 'laptops';
    } else if (/\b(?:soundbar|audio|speaker|subwoofer|dolby\s*atmos|atmos|surround|earc|bass)\b/i.test(userSpeech) || /\b(?:soundbar|audio)\b/i.test(transcript)) {
      detectedCategory = 'soundbars';
    } else if (/\b(?:tv|television|oled|qled|inch|refresh rate|120hz|webos|google tv)\b/i.test(userSpeech) || /\b(?:smart_tvs|tv)\b/i.test(transcript)) {
      detectedCategory = 'smart_tvs';
    } else {
      detectedCategory = options?.category || 'general';
    }
  }

  const categoryName = 
    detectedCategory.includes('laptop') ? 'Laptop' :
    detectedCategory.includes('soundbar') || detectedCategory.includes('audio') ? 'Soundbar & Audio System' :
    detectedCategory.includes('tv') || detectedCategory.includes('display') ? 'Smart TV' : 'Product';

  thinkingSteps.push(`Analyzed natural human language intent for category: ${categoryName}.`);

  // 2. Budget Ceiling Detection on user speech
  const budgetKMatch = userSpeech.match(/(?:under|below|max|budget|ceiling|within|around|₹|rs\.?|inr)?\s*([0-9]{1,3})\s*(?:k|thousand)\b/i);
  const budgetNumMatch = userSpeech.match(/(?:under|below|max|budget|ceiling|within|around|₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})/i);
  const plainNumMatch = userSpeech.match(/\b([0-9]{2,3}(?:,[0-9]{3}))\b/);

  let budgetVal: number | null = null;
  if (budgetKMatch && parseInt(budgetKMatch[1], 10) <= 500) {
    budgetVal = parseInt(budgetKMatch[1], 10) * 1000;
  } else if (budgetNumMatch) {
    const raw = parseInt(budgetNumMatch[1].replace(/,/g, ''), 10);
    budgetVal = raw < 1000 ? raw * 1000 : raw;
  } else if (plainNumMatch) {
    budgetVal = parseInt(plainNumMatch[1].replace(/,/g, ''), 10);
  }

  if (budgetVal && budgetVal >= 5000) {
    constraints.push({
      attribute: 'priceInr',
      operator: 'LTE',
      value: budgetVal,
      type: 'HARD_CONSTRAINT',
      weight: 1.0,
    });
    thinkingSteps.push(`Extracted explicit budget ceiling: ₹${budgetVal.toLocaleString('en-IN')} (Hard Constraint).`);
  }

  // 3. Brand Affinities
  const brands = [
    'Apple', 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer', 'MSI',
    'Samsung', 'LG', 'Sony', 'TCL', 'Xiaomi', 'Hisense', 'OnePlus',
    'JBL', 'Bose', 'Boat', 'Zebronics', 'Sennheiser', 'Yamaha'
  ];
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(userSpeech)) {
      constraints.push({
        attribute: 'brand',
        operator: 'EQ',
        value: b,
        type: 'PREFERENCE',
        weight: 0.85,
      });
      thinkingSteps.push(`Identified brand preference: ${b} (Weight: 0.85).`);
      break;
    }
  }

  // 4. Laptop Specific Attributes
  if (detectedCategory.includes('laptop') || /\b(?:laptop|ram|gpu|ssd|intel|ryzen|coding)\b/i.test(userSpeech)) {
    // RAM
    const ramMatch = userSpeech.match(/\b(8|16|24|32|64)\s*(?:gb)?\s*ram\b/i) || userSpeech.match(/\b(8|16|24|32|64)\s*gb\b/i);
    if (ramMatch) {
      const ram = parseInt(ramMatch[1], 10);
      constraints.push({
        attribute: 'ramGb',
        operator: 'GTE',
        value: ram,
        type: ram >= 16 ? 'HARD_CONSTRAINT' : 'PREFERENCE',
        weight: 0.9,
      });
      thinkingSteps.push(`Extracted RAM requirement: >= ${ram}GB.`);
    } else if (/\b(?:multitasking|heavy|future proof)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'ramGb',
        operator: 'GTE',
        value: 16,
        type: 'PREFERENCE',
        weight: 0.8,
      });
      thinkingSteps.push('Inferred minimum 16GB RAM for heavy multitasking.');
    }

    // Gaming / Dedicated GPU
    if (/\b(?:gaming|rtx|nvidia|gpu|graphic card|graphics|games|steam)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'gamingCapable',
        operator: 'EQ',
        value: true,
        type: 'PREFERENCE',
        weight: 0.9,
      });
      thinkingSteps.push('Prioritized dedicated graphics & high thermal headroom for gaming.');
    }

    // Coding / Development
    if (/\b(?:code|coding|programming|developer|software|vscode|docker)\b/i.test(userSpeech)) {
      thinkingSteps.push('Noted primary usage profile: Software Development & Multitasking.');
    }

    // Battery / Portability
    if (/\b(?:battery|portable|travel|lightweight|thin|long battery)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'batteryLifeHours',
        operator: 'GTE',
        value: 8,
        type: 'PREFERENCE',
        weight: 0.85,
      });
      thinkingSteps.push('Prioritized all-day battery life (>= 8 hours) and portability.');
    }
  }

  // 5. Soundbar Specific Attributes
  if (detectedCategory.includes('soundbar') || /\b(?:soundbar|atmos|subwoofer|surround|earc)\b/i.test(userSpeech)) {
    if (/\b(?:dolby\s*atmos|atmos|3d audio|spatial)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'dolbyAtmos',
        operator: 'EQ',
        value: true,
        type: 'PREFERENCE',
        weight: 0.95,
      });
      thinkingSteps.push('Prioritized spatial immersive audio: Dolby Atmos.');
    }
    if (/\b(?:subwoofer|bass|boom|deep low)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'wirelessSubwoofer',
        operator: 'EQ',
        value: true,
        type: 'PREFERENCE',
        weight: 0.85,
      });
      thinkingSteps.push('Identified requirement for dedicated wireless subwoofer.');
    }
    if (/\b(?:earc|hdmi|tv connection)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'hasHdmiEarc',
        operator: 'EQ',
        value: true,
        type: 'PREFERENCE',
        weight: 0.8,
      });
      thinkingSteps.push('Flagged HDMI eARC requirement for lossless TV passthrough.');
    }
  }

  // 6. Smart TV Specific Attributes
  if (detectedCategory.includes('tv') || /\b(?:oled|qled|refresh rate|120hz)\b/i.test(userSpeech)) {
    if (/\b(?:120hz|ps5|xbox|high refresh)\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'refreshRateHz',
        operator: 'GTE',
        value: 120,
        type: 'HARD_CONSTRAINT',
        weight: 0.95,
      });
      thinkingSteps.push('Extracted native 120Hz high refresh rate requirement.');
    }
    if (/\boled\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'panelType',
        operator: 'EQ',
        value: 'OLED',
        type: 'PREFERENCE',
        weight: 0.9,
      });
      thinkingSteps.push('Prioritized OLED infinite contrast panel.');
    } else if (/\bqled\b/i.test(userSpeech)) {
      constraints.push({
        attribute: 'panelType',
        operator: 'EQ',
        value: 'QLED',
        type: 'PREFERENCE',
        weight: 0.85,
      });
      thinkingSteps.push('Prioritized high-brightness QLED display.');
    }

    const screenMatch = userSpeech.match(/\b(43|50|55|65|75|85)\s*(?:inch|"|'')\b/i);
    if (screenMatch) {
      const size = parseInt(screenMatch[1], 10);
      constraints.push({
        attribute: 'screenSizeInches',
        operator: 'GTE',
        value: size,
        type: 'PREFERENCE',
        weight: 0.8,
      });
      thinkingSteps.push(`Extracted screen size target: >= ${size}" display.`);
    }
  }

  // Generate empathetic, human conversational reply
  let reply = '';
  const priceConstraint = constraints.find(c => c.attribute === 'priceInr');
  const priceText = priceConstraint ? `under ₹${priceConstraint.value.toLocaleString('en-IN')}` : '';

  if (detectedCategory.includes('laptop')) {
    if (priceConstraint && constraints.length === 1) {
      reply = `Got it! I've recorded your hard budget ceiling of ₹${priceConstraint.value.toLocaleString('en-IN')} for the laptop. To help match the best model for the group, what are your must-haves for RAM (e.g., 16GB for smooth multitasking/coding), dedicated graphics for gaming, or battery life?`;
    } else if (constraints.length > 1) {
      const otherAttrs = constraints.filter(c => c.attribute !== 'priceInr').map(c => c.attribute).join(', ');
      reply = `Understood! I've captured your priorities for the laptop${priceText ? ` (${priceText})` : ''} including ${otherAttrs}. We'll balance these against the rest of the group's wishlist. Is there any specific brand or screen size you prefer?`;
    } else {
      reply = `I'm listening! What are your primary priorities for the laptop (e.g. software development, gaming, RAM, lightweight portability, or your maximum budget ceiling)?`;
    }
  } else if (detectedCategory.includes('soundbar') || detectedCategory.includes('audio')) {
    if (priceConstraint && constraints.length === 1) {
      reply = `Got it! I've noted your target budget of ₹${priceConstraint.value.toLocaleString('en-IN')} for the soundbar. Are you looking for Dolby Atmos 3D audio, a wireless subwoofer for deep bass, or HDMI eARC?`;
    } else if (constraints.length > 1) {
      reply = `Great! I've noted your sound preferences${priceText ? ` (${priceText})` : ''}. We'll balance your audio requirements with the group's wishlist!`;
    } else {
      reply = `What acoustic features matter most for your soundbar setup (e.g., Dolby Atmos, deep wireless bass, TV dialogue clarity, or budget limits)?`;
    }
  } else if (detectedCategory.includes('tv')) {
    if (priceConstraint && constraints.length === 1) {
      reply = `Understood! I've locked in your budget ceiling of ₹${priceConstraint.value.toLocaleString('en-IN')} for the Smart TV. Do you have a preferred screen size (like 55") or display type (OLED/QLED)?`;
    } else if (constraints.length > 1) {
      reply = `I've captured your priorities for the Smart TV${priceText ? ` (${priceText})` : ''}. We will balance these constraints against the group's wishlist!`;
    } else {
      reply = `What features are most important for your Smart TV (e.g., screen size, 4K/OLED clarity, 120Hz gaming, or budget ceiling)?`;
    }
  } else {
    reply = `I've noted your requirements${priceText ? ` (${priceText})` : ''}. I will make sure your preferences are fairly represented in the group consensus!`;
  }

  thinkingSteps.push(`Synthesized ${constraints.length} structured constraints to balance against group preferences.`);

  return {
    reply,
    thinking: thinkingSteps.join('\n'),
    thinkingSteps,
    extractedPreferences: {
      constraints,
    } as any,
    isReadyForSummary: constraints.length > 0,
  };
}
