// ============================================================
// api.js — AI provider connector
// Sends messages to Claude, OpenAI, or custom webhooks
// via the local proxy server (/api/proxy/*)
// ============================================================

'use strict';

const AgentAPI = (() => {

  // ── Get global keys (set via Settings modal) ─────────────────
  function getGlobalKey(provider) {
    try {
      const keys = JSON.parse(localStorage.getItem('ao_api_keys') || '{}');
      if (provider === 'claude')  return keys.anthropic || '';
      if (provider === 'openai')  return keys.openai    || '';
      return '';
    } catch (_) { return ''; }
  }

  function saveGlobalKeys(anthropic, openai) {
    try {
      localStorage.setItem('ao_api_keys', JSON.stringify({ anthropic, openai }));
    } catch (_) {}
  }

  function loadGlobalKeys() {
    try {
      return JSON.parse(localStorage.getItem('ao_api_keys') || '{}');
    } catch (_) { return {}; }
  }

  // ── Check if an agent has a usable API config ─────────────────
  function isConfigured(agent) {
    const cfg = agent.apiConfig || {};
    const key = cfg.apiKey || getGlobalKey(cfg.provider);
    if (cfg.provider === 'custom') return !!cfg.endpoint;
    return !!key;
  }

  // ── Main call function ────────────────────────────────────────
  async function callAgent(agent, userMessage) {
    const cfg = agent.apiConfig || {};
    const provider = cfg.provider || 'claude';

    // Build conversation history
    const history = (agent.chatHistory || []).map(m => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));
    history.push({ role: 'user', content: userMessage });

    switch (provider) {
      case 'claude':  return callClaude(cfg, history);
      case 'openai':  return callOpenAI(cfg, history);
      case 'custom':  return callCustom(cfg, history, agent, userMessage);
      default:        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ── Claude ────────────────────────────────────────────────────
  async function callClaude(cfg, messages) {
    const apiKey = cfg.apiKey || getGlobalKey('claude');
    if (!apiKey) {
      throw new Error(
        'No Anthropic API key configured. Open Settings (⚙) to add your key, or edit this agent.'
      );
    }

    const resp = await fetch('/api/proxy/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        model:      cfg.model || 'claude-sonnet-4-6',
        system:     cfg.systemPrompt || '',
        messages,
        max_tokens: 1024
      })
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Claude API error');
    return data.content;
  }

  // ── OpenAI ────────────────────────────────────────────────────
  async function callOpenAI(cfg, messages) {
    const apiKey = cfg.apiKey || getGlobalKey('openai');
    if (!apiKey) {
      throw new Error(
        'No OpenAI API key configured. Open Settings (⚙) to add your key, or edit this agent.'
      );
    }

    // OpenAI uses "system" as the first message
    const oaiMessages = [];
    if (cfg.systemPrompt) {
      oaiMessages.push({ role: 'system', content: cfg.systemPrompt });
    }
    oaiMessages.push(...messages);

    const resp = await fetch('/api/proxy/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        model:      cfg.model || 'gpt-4o-mini',
        messages:   oaiMessages,
        max_tokens: 1024
      })
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'OpenAI API error');
    return data.content;
  }

  // ── Custom Webhook ────────────────────────────────────────────
  async function callCustom(cfg, messages, agent, userMessage) {
    if (!cfg.endpoint) {
      throw new Error('No endpoint URL configured for this agent.');
    }

    // Generic payload — custom endpoints can expect different shapes.
    // We send a flexible body that most agent APIs understand.
    const payload = {
      message:  userMessage,
      messages,
      agent: {
        id:       agent.id,
        name:     agent.name,
        role:     agent.role,
        company:  agent.company
      },
      system: cfg.systemPrompt || ''
    };

    const resp = await fetch('/api/proxy/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: cfg.endpoint,
        apiKey:   cfg.apiKey || '',
        payload
      })
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Custom endpoint error');

    // Normalize response — try common response shapes
    return (
      data.content          ||
      data.message          ||
      data.response         ||
      data.reply            ||
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text            ||
      JSON.stringify(data)
    );
  }

  // ── Public API ────────────────────────────────────────────────
  return { callAgent, isConfigured, getGlobalKey, saveGlobalKeys, loadGlobalKeys };
})();
