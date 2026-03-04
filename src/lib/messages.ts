export interface AaisMessage {
  id: number;
  category: string;
  message: string;
  file_base64?: string;
  file_type?: string;
  file_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'solved' | 'unsolved';
  created_at: string;
  processed_at?: string;
}

const STORAGE_KEY = 'aais_messages';

export function getMessages(): AaisMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: AaisMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(msg: Omit<AaisMessage, 'id' | 'status' | 'created_at'>): AaisMessage {
  const messages = getMessages();
  const newMsg: AaisMessage = {
    ...msg,
    id: Date.now(),
    status: 'pending',
    created_at: new Date().toLocaleDateString('en-US'),
  };
  messages.unshift(newMsg);
  saveMessages(messages);
  return newMsg;
}

export function updateMessageStatus(id: number, status: AaisMessage['status']) {
  const messages = getMessages();
  const idx = messages.findIndex(m => m.id === id);
  if (idx !== -1) {
    messages[idx].status = status;
    messages[idx].processed_at = new Date().toISOString();
    saveMessages(messages);
  }
  return messages;
}

export function deleteMessage(id: number) {
  const messages = getMessages().filter(m => m.id !== id);
  saveMessages(messages);
  return messages;
}

export function purgeOldProcessed(days = 7) {
  const messages = getMessages();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = messages.filter(m => {
    if (m.status === 'pending') return true;
    if (!m.processed_at) return true;
    return new Date(m.processed_at).getTime() > cutoff;
  });
  if (filtered.length !== messages.length) {
    saveMessages(filtered);
  }
  return filtered;
}
