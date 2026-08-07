import { determineLyraProfile } from '../../server/lyra/lyra.permissions.js';
import { LYRA_PROMPTS } from '../../server/lyra/lyra.prompts.js';
import { executeReadOnlyTool } from '../../server/lyra/lyra.tools.js';
import { runAtlasCore } from '../../server/atlas-core/atlas.core.js';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 10;

const COMMANDER_TOOLS = new Set([
  'getSystemStatus',
  'getMissionStatus',
  'searchTAIN',
  'getHeadquartersStatus',
  'getRecentActivity'
]);

const STANDARD_TOOLS = new Set([
  'getSystemStatus',
  'getRecentActivity'
]);

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-MAX_HISTORY)
    .map((item) => {
      const sender = String(item?.sender || '').toUpperCase();
      const text = String(item?.text || '').trim().slice(0, 2000);

      if (!text) return null;

      return {
        role: sender === 'USER' ? 'user' : 'assistant',
        content: text
      };
    })
    .filter(Boolean);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const message =
      typeof req.body?.message === 'string'
        ? req.body.message.trim()
        : '';

    const history = normalizeHistory(req.body?.history);
    const requestTool = req.body?.requestTool || null;

    if (!message && !requestTool) {
      return res.status(400).json({
        error: 'Message or tool request required.'
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.`
      });
    }

    const identity = determineLyraProfile(req);

    let toolData = null;

    if (requestTool) {
      const toolName = String(requestTool?.name || '');
      const permittedTools = identity.isCommander
        ? COMMANDER_TOOLS
        : STANDARD_TOOLS;

      if (!permittedTools.has(toolName)) {
        return res.status(403).json({
          error: 'Tool unavailable at current clearance level.'
        });
      }

      toolData = await executeReadOnlyTool(
        toolName,
        requestTool?.params || {}
      );
    }

    const atlasDecision = runAtlasCore({
      message,
      identity,
      toolData
    });

    const systemPrompt =
      LYRA_PROMPTS[identity.profile] ||
      LYRA_PROMPTS.LYRA_STANDARD;

    const gatewayToken =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN;

    if (!gatewayToken) {
      return res.status(200).json({
        success: true,
        profile: identity.profile,
        clearance: identity.clearance,
        isCommander: identity.isCommander,
        reply: identity.isCommander
          ? 'Commander, LYRA Command Core is authenticated. Intelligence provider connection is not configured in this environment.'
          : 'Operator, LYRA is online. Intelligence provider connection is not configured in this environment.',
        toolData,
        providerConnected: false,
        timestamp: new Date().toISOString()
      });
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'system',
        content:
          'ATLAS CORE ROUTING DECISION:\n' +
          JSON.stringify(atlasDecision, null, 2) +
          '\nFollow this routing decision. Never exceed its clearance or execution mode.'
      },
      ...history
    ];

    if (toolData) {
      messages.push({
        role: 'system',
        content:
          'READ-ONLY ATLAS TOOL RESULT:\n' +
          JSON.stringify(toolData, null, 2) +
          '\nTreat disconnected or unverified values exactly as reported.'
      });
    }

    if (message) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    const gatewayResponse = await fetch(
      'https://ai-gateway.vercel.sh/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gatewayToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model:
            process.env.LYRA_MODEL ||
            'openai/gpt-5.6-luna',
          messages,
          temperature: 0.3,
          max_tokens: 700
        })
      }
    );

    const data = await gatewayResponse.json();

    if (!gatewayResponse.ok) {
      throw new Error(
        data?.error?.message ||
        'AI Gateway rejected the request.'
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('LYRA returned an empty response.');
    }

    return res.status(200).json({
      success: true,
      profile: identity.profile,
      clearance: identity.clearance,
      isCommander: identity.isCommander,
      reply,
      toolData,
      providerConnected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[LYRA_COMMAND_CORE_ERROR]', error);

    return res.status(502).json({
      error: 'LYRA Command Core processing failure.'
    });
  }
}
