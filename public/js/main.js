// ============================================================
// main.js — Application entry point
// Wires together Game, Renderer, and UI
// ============================================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

  // 1. Init renderer (sets up canvas + resize handler)
  Renderer.init(canvas);

  // 2. Init UI (binds all DOM events)
  UI.init();

  // 3. Init game (spawns agents, starts loop)
  Game.init({
    // Called when the user clicks an agent on the canvas
    onAgentClick(agent) {
      if (agent) {
        UI.openChat(agent);
        Game.selectAgent(agent);
      } else {
        UI.closeChat();
      }
    },

    // Called when the mouse moves over / away from an agent
    onHoverChange(agent, clientX, clientY) {
      UI.showTooltip(agent, clientX, clientY);
    }
  });

  // 4. Render the initial agent list in the sidebar
  UI.renderAgentList(Game.getAgents());

  // 5. Re-render agent list whenever the window regains focus
  //    (agents may have been added/removed elsewhere)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      UI.renderAgentList(Game.getAgents());
    }
  });

  console.log(
    '%c🏢 Agentic Office loaded',
    'color: #58a6ff; font-weight: bold; font-size: 14px'
  );
  console.log(
    '%cClick an agent on the canvas to start chatting!',
    'color: #8b949e'
  );
});
