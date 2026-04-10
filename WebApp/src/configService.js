// Copyright 2026 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const CONFIG_STORAGE_KEY = 'appConfig';

const LOCAL_CONFIG = {
  bedrockConfig: {
    region: 'us-east-1',
    ragEnabled: true,
    knowledgeBaseId: 'BCJ9FNX552',
    dataSourceId: '',
    defaultModel: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    maxTokens: 4096,
    temperature: 0.2,
    topP: 0.9,
    useGuardrails: false,
    guardrailId: '',
    guardrailVersion: '',
    promptTemplate: ''
  },
  dynamoConfig: {},
  vpceEndpoints: {}
};

export async function fetchConfig(jwtToken) {
  sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(LOCAL_CONFIG));
  return LOCAL_CONFIG;
}

export function getConfig() {
  const cached = sessionStorage.getItem(CONFIG_STORAGE_KEY);
  if (!cached) {
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(LOCAL_CONFIG));
    return LOCAL_CONFIG;
  }
  try {
    return JSON.parse(cached);
  } catch {
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(LOCAL_CONFIG));
    return LOCAL_CONFIG;
  }
}

export function clearConfig() {
  sessionStorage.removeItem(CONFIG_STORAGE_KEY);
}
