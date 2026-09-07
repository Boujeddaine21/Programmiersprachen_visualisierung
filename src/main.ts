import './style.css';
import { loadData } from './data/dataLoader.ts';
import { renderGraph } from './graph/graphRenderer.ts';
import { initFilters } from './filters/filters.ts';
import { renderBarChart } from './charts/barChart.ts';
import { renderGithubChart } from './charts/githubChart.ts';

async function main(): Promise<void> {
  const container      = document.getElementById('dag-container')   as HTMLDivElement;
  const statsContainer = document.getElementById('stats-container') as HTMLDivElement;
  const loading        = document.getElementById('loading')         as HTMLDivElement;
  const viewSelect     = document.getElementById('view-select')     as HTMLSelectElement;

  const { nodes, links } = await loadData();
  renderGraph(container, nodes, links);
  initFilters(nodes, links, container);
  loading.style.display = 'none';

  viewSelect.addEventListener('change', () => {
  statsContainer.innerHTML = '';
  if (viewSelect.value === 'graph') {
    container.style.display      = 'block';
    statsContainer.style.display = 'none';
  } else if (viewSelect.value === 'tiobe') {
    container.style.display      = 'none';
    statsContainer.style.display = 'block';
    renderBarChart(statsContainer);
  } else if (viewSelect.value === 'github') {
    container.style.display      = 'none';
    statsContainer.style.display = 'block';
    renderGithubChart(statsContainer);
  }
});

  // SVG Export
  document.getElementById('export-svg-btn')?.addEventListener('click', () => {
    const isGraph = viewSelect.value === 'graph';
    const svgEl = viewSelect.value === 'graph'
      ? document.getElementById('graph-svg')
      : viewSelect.value === 'tiobe'
      ? document.getElementById('stats-svg')
      : document.getElementById('github-svg');

    if (!svgEl) {
      alert('Kein SVG gefunden. Bitte zuerst die Ansicht laden!');
      return;
    }

    const svgClone = svgEl.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const serializer = new XMLSerializer();
    const svgString  = serializer.serializeToString(svgClone);
    const blob       = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url        = URL.createObjectURL(blob);
    const a          = document.createElement('a');
    a.href           = url;
    a.download       = isGraph
      ? 'programmiersprachen-graph.svg'
      : 'programmiersprachen-statistik.svg';
    a.click();
    URL.revokeObjectURL(url);
  });
}

main();