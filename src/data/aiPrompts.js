export const AI_PROMPT_TEMPLATES = [
  {
    id: 'VISUAL_PACK',
    title: 'Generate Visual Asset Pack',
    category: 'Visuals',
    description: 'Produces 20 4K archival shot concepts with lighting & composition rules.',
    targetTool: 'Midjourney / DALL-E 3',
    estimatedOutput: '20 Image Cards',
    promptText:
      'Generate 20 cinematic 4K archival render concepts for El Dorado lost gold temple ruins with atmospheric lighting, 35mm lens depth, and wet gold reflections.',
  },
  {
    id: 'NARRATION',
    title: 'Generate Charlie Voiceover Script',
    category: 'Narration',
    description:
      'Drafts a 60-second or 10-minute documentary voiceover script formatted for Charlie narrator.',
    targetTool: 'ElevenLabs Charlie Model',
    estimatedOutput: '150 Words (60s)',
    promptText:
      'Draft a tense, authoritative 60-second documentary narration script exploring the 1888 Patagonia expedition journals. Use dramatic pauses [pause] and focus on unresolved gold relics.',
  },
  {
    id: 'CASE_DOSSIER',
    title: 'Synthesize Case Dossier',
    category: 'Research',
    description:
      'Compiles raw telemetry, maps, and historical citations into a structured case dossier.',
    targetTool: 'Atlas Research Engine',
    estimatedOutput: 'Structured Markdown Brief',
    promptText:
      'Synthesize all available hydrophone records, satellite magnetometry, and 1946 Admiral Byrd log excerpts into an executive investigation dossier for Operation Highjump.',
  },
];
