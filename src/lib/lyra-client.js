const STORAGE_KEY = 'tactical-atlas:lyra-conversation:v1';
const MAX_HISTORY = 10;

function emptyConversation() {
  return { conversationId: crypto.randomUUID(), history: [] };
}

export function loadLyraConversation() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.conversationId && Array.isArray(saved.history)) {
      return { conversationId: saved.conversationId, history: saved.history.slice(-MAX_HISTORY) };
    }
  } catch {
    // Corrupt or unavailable browser storage starts a fresh personal conversation.
  }
  return emptyConversation();
}

export function saveLyraExchange(conversation, message, reply) {
  const next = {
    conversationId: conversation.conversationId,
    history: [
      ...conversation.history,
      { sender: 'USER', text: message },
      { sender: 'LYRA', text: reply },
    ].slice(-MAX_HISTORY),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Chat remains usable when storage is blocked or full.
  }
  return next;
}

export async function sendLyraChat({ message, conversation, signal }) {
  const response = await fetch('/api/lyra/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      message,
      history: conversation.history,
      conversationId: conversation.conversationId,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'LYRA command channel unavailable.');
  return data;
}
