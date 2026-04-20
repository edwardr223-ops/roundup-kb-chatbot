export const invokeBedrockAgent = async (
  prompt,
  sessionId,
  credentials,
  onChunk = null,
  options = {}
) => {
  const apiUrl = import.meta.env.VITE_CHAT_API_URL;

  if (!apiUrl) {
    throw new Error('VITE_CHAT_API_URL is not configured');
  }

  const {
    modelKey = null,
    caseId = null,
    documentType = null,
    deponentName = null
  } = options;

  try {
    const payload = {
      message: prompt,
      sessionId: sessionId || null,
      modelKey: modelKey,
      case_id: caseId,
      document_type: documentType,
      deponent_name: deponentName
    };

    console.log('Payload to Lambda:', payload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Chat API request failed');
    }

    const answer = result.answer || '';

    if (onChunk) {
      onChunk(answer);
    }

    return {
      sessionId: result.sessionId || sessionId,
      completion: answer,
      citations: result.citations || [],
      modelKey: result.modelKey || modelKey
    };
  } catch (err) {
    console.error('Invoke Bedrock agent error:', sanitizeForLog(err.message));
    throw err;
  }
};

export const invokeBedrockRetrieveAndGenerateStreamCommand = async (
  prompt,
  files,
  sessionId,
  credentials,
  modelId,
  conversationHistory = [],
  onChunk,
  options = {}
) => {
  const apiUrl = import.meta.env.VITE_CHAT_API_URL;

  if (!apiUrl) {
    throw new Error('VITE_CHAT_API_URL is not configured');
  }

  const {
    modelKey = null,
    caseId = null,
    documentType = null,
    deponentName = null
  } = options;

  try {
    const payload = {
      message: prompt,
      sessionId: sessionId || null,
      modelKey: modelKey,
      case_id: caseId,
      document_type: documentType,
      deponent_name: deponentName
    };

    console.log('Payload to Lambda:', payload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Chat API request failed');
    }

    const answer = result.answer || '';

    if (onChunk) {
      onChunk(answer);
    }

    return {
      sessionId: result.sessionId || sessionId,
      citations: result.citations || [],
      modelKey: result.modelKey || modelKey,
      fullResponse: {
        metrics: {
          inputTokenCount: 0,
          outputTokenCount: 0
        }
      },
      body: answer
    };
  } catch (err) {
    console.error('Invoke Bedrock RetrieveAndGenerate error:', sanitizeForLog(err.message));
    throw err;
  }
};