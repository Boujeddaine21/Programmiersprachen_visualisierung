import type { Node, Link } from '../types.ts';
import { PARADIGM_COLORS } from '../data/dataLoader.ts';
import { renderGraph, highlightNodes } from '../graph/graphRenderer.ts';

export function initFilters(
  allNodes: Node[],
  allLinks: Link[],
  container: HTMLElement
): void {

  const paradigms = new Set<string>();
  allNodes.forEach(n => n.paradigms.forEach(p => {
    if (PARADIGM_COLORS[p]) paradigms.add(p);
  }));

  const select = document.getElementById('paradigm-filter') as HTMLSelectElement;
  paradigms.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p;
    select.appendChild(option);
  });

  function updateStats(nodeCount: number, linkCount: number): void {
    const stats = document.getElementById('stats');
    if (stats) {
      stats.innerHTML = `
        <div style="margin-top:8px; font-size:0.85rem; color:#666">
          ${nodeCount} Sprachen · ${linkCount} Verbindungen
        </div>
      `;
    }
  }

  function getConnectedIds(nodeId: string, mode: 'all' | 'predecessors' | 'successors'): Set<string> {
    const connected = new Set<string>();
    connected.add(nodeId);

    allLinks.forEach(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as Node).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as Node).id;

      if (mode === 'all' || mode === 'predecessors') {
        if (targetId === nodeId) connected.add(sourceId);
      }
      if (mode === 'all' || mode === 'successors') {
        if (sourceId === nodeId) connected.add(targetId);
      }
    });

    return connected;
  }

  function applyFilters(): void {
    const search   = (document.getElementById('search-input') as HTMLInputElement).value.toLowerCase().trim();
    const paradigm = select.value;
    const yearMin  = parseInt((document.getElementById('year-min') as HTMLInputElement).value);
    const yearMax  = parseInt((document.getElementById('year-max') as HTMLInputElement).value);

    // Meldung entfernen
    const existing = document.getElementById('no-result-msg');
    if (existing) existing.remove();

    const filteredNodes = allNodes.filter(n => {
      const matchParadigm = !paradigm || n.paradigms.includes(paradigm);
      const matchYear     = !n.year || (n.year >= yearMin && n.year <= yearMax);
      return matchParadigm && matchYear;
    });

    const filteredIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = allLinks.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as Node).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as Node).id;
      return filteredIds.has(sourceId) && filteredIds.has(targetId);
    });

    renderGraph(container, filteredNodes, filteredLinks);

    if (search) {
      const matchedNodes = filteredNodes.filter(n =>
        n.label.toLowerCase().startsWith(search)
      );

      if (matchedNodes.length > 0) {
        const predecessors = (document.getElementById('filter-predecessors') as HTMLInputElement).checked;
        const successors   = (document.getElementById('filter-successors') as HTMLInputElement).checked;

        let mode: 'all' | 'predecessors' | 'successors' = 'all';
        if (predecessors && !successors) mode = 'predecessors';
        if (!predecessors && successors) mode = 'successors';

        const activeIds = new Set<string>();
        matchedNodes.forEach(n => {
          getConnectedIds(n.id, mode).forEach(id => activeIds.add(id));
        });

        // Kanten zwischen aktiven Knoten zählen
        const activeLinks = filteredLinks.filter(l => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as Node).id;
          const targetId = typeof l.target === 'string' ? l.target : (l.target as Node).id;
          return activeIds.has(sourceId) && activeIds.has(targetId);
        });

        setTimeout(() => {
          highlightNodes(activeIds);
          updateStats(activeIds.size, activeLinks.length);
        }, 100);

      } else {
        setTimeout(() => {
          highlightNodes(new Set());
          updateStats(0, 0);
          const msg = document.createElement('div');
          msg.id = 'no-result-msg';
          msg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px 24px;
            font-size: 14px;
            color: #666;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          `;
          msg.textContent = 'Keine Sprache gefunden';
          container.appendChild(msg);
        }, 100);
      }
    } else {
      setTimeout(() => highlightNodes(null), 50);
      updateStats(filteredNodes.length, filteredLinks.length);
    }
  }

  document.getElementById('filter-predecessors')?.addEventListener('change', applyFilters);
  document.getElementById('filter-successors')?.addEventListener('change', applyFilters);
  document.getElementById('search-input')?.addEventListener('input', applyFilters);
  select.addEventListener('change', applyFilters);
  document.getElementById('year-min')?.addEventListener('change', applyFilters);
  document.getElementById('year-max')?.addEventListener('change', applyFilters);

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    (document.getElementById('search-input') as HTMLInputElement).value = '';
    (document.getElementById('year-min') as HTMLInputElement).value = '1940';
    (document.getElementById('year-max') as HTMLInputElement).value = '2020';
    select.value = '';
    const existing = document.getElementById('no-result-msg');
    if (existing) existing.remove();
    renderGraph(container, allNodes, allLinks);
    setTimeout(() => highlightNodes(null), 100);
    updateStats(allNodes.length, allLinks.length);
  });

  /*document.getElementById('export-svg-btn')?.addEventListener('click', () => {
    const svg = document.getElementById('graph-svg');
    if (!svg) return;

    // SVG Namespace hinzufügen
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialisieren
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'programmiersprachen-graph.svg';
    a.click();
    URL.revokeObjectURL(url);
});*/

  updateStats(allNodes.length, allLinks.length);
}