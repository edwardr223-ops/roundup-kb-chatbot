import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'roundup_kb_chat_history';

const readHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeHistory = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const convHistory = {
  saveConversation: async (record) => {
    const history = readHistory();

    const item = {
      userID: record.userID || 'local-user',
      timestamp: record.timestamp || Date.now(),
      sessionID: record.sessionID || uuidv4(),
      question: record.question || '',
      response: record.response || '',
      inputTokens: record.inputTokens || 0,
      outputTokens: record.outputTokens || 0,
      modelId: record.modelId || 'kb-api',
      chatType: record.chatType || 'RAG',
      citations: record.citations || [],
      personaId: record.personaId || null,
      documentContext: record.documentContext || null,
      feedback: record.feedback || null
    };

    history.push(item);
    writeHistory(history);
    return item;
  },

  loadUserHistory: async (userId) => {
    const history = readHistory();
    const targetUser = userId || 'local-user';
    return history
      .filter(x => x.userID === targetUser)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  loadSessionHistory: async (userId, sessionId) => {
    const history = readHistory();
    const targetUser = userId || 'local-user';
    return history
      .filter(x => x.userID === targetUser && x.sessionID === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  deleteSessionHistory: async (userId, sessionId) => {
    const history = readHistory();
    const targetUser = userId || 'local-user';
    const filtered = history.filter(x => !(x.userID === targetUser && x.sessionID === sessionId));
    writeHistory(filtered);
    return true;
  },

  updateFeedback: async (userId, timestamp, feedbackType, credentials, sessionId) => {
    const history = readHistory();
    const targetUser = userId || 'local-user';

    const index = history.findIndex(x =>
      x.userID === targetUser &&
      x.timestamp === timestamp &&
      (!sessionId || x.sessionID === sessionId)
    );

    if (index >= 0) {
      history[index].feedback = feedbackType;
      writeHistory(history);
      return history[index];
    }

    throw new Error('No matching conversation record found');
  }
};
