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
    messages[idx].processed_at = new Date().toLocaleDateString('en-US');
    saveMessages(messages);
  }
  return messages;
}
