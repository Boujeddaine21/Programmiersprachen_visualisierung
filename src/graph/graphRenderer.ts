import * as d3 from 'd3';
import type { Node, Link } from '../types.ts';
import { getColor } from '../data/dataLoader.ts';

export function renderGraph(
  container: HTMLElement,
  nodes: Node[],
  links: Link[]
): void {
  container.innerHTML = '';

  const width  = container.clientWidth;
  const height = container.clientHeight;
  const margin = { left: 80, right: 40, top: 40, bottom: 60 };

  const svg = d3.select(container)
    .append('svg')
    .attr('id', 'graph-svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');
  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform))
  );

  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#aaa');

  svg.append('text')
  .attr('x', width / 2)
  .attr('y', 20)
  .attr('text-anchor', 'middle')
  .attr('font-size', '15px')
  .attr('font-weight', 'bold')
  .attr('fill', '#333')
  .text('Historische Entwicklung und gegenseitige Beeinflussung von Programmiersprachen');

svg.append('text')
  .attr('x', width / 2)
  .attr('y', 40)
  .attr('text-anchor', 'middle')
  .attr('font-size', '12px')
  .attr('fill', '#666')
  .text('Ein Pfeil von A nach B bedeutet: B wurde von A beeinflusst');
  
  const years = nodes.map(n => n.year).filter(y => y !== null) as number[];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const xScale = d3.scaleLinear()
    .domain([minYear - 5, maxYear + 5])
    .range([margin.left, width - margin.right]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d => `${d}`)
    .ticks(10);

  g.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .attr('font-size', '12px')
    .attr('fill', '#666');

  g.append('g')
    .selectAll('line.grid')
    .data(xScale.ticks(10))
    .join('line')
    .attr('class', 'grid')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', margin.top)
    .attr('y2', height - margin.bottom)
    .attr('stroke', '#f0f0f0')
    .attr('stroke-width', 1);

  const simulation = d3.forceSimulation<Node>(nodes)
    .force('link', d3.forceLink<Node, Link>(links)
      .id(d => d.id)
      .distance(80)
      .strength(0.1))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('collision', d3.forceCollide(50))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force('x', d3.forceX<Node>(d =>
      d.year ? xScale(d.year) : width / 2
    ).strength(1));
  
  const fixedY: Record<string, number> = {
    'Basic': height * 0.8,
    'Rust': height * 0.1,
    'Simula': height * 0.2,
    'C++': height * 0.1,
    'C#': height * 0.1,
    'Perl': height * 0.8,
    'Smalltalk': height * 0.7,
    'JavaScript': height * 0.7,
    'Python': height * 0.8,
    'Go': height * 0.8,
    'Lisp': height * 0.7,
  };

nodes.forEach(d => {
  if (fixedY[d.label] !== undefined) {
    d.fy = fixedY[d.label];
  }
});
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('class', 'edge')
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#arrow)');

  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, Node>('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .call(
      d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

  node.each(function(d) {
    const el = d3.select(this);
    const paradigm = d.primaryParadigm ?? d.paradigms[0] ?? 'default';
    const color = getColor(d.paradigms);

    if (paradigm === 'Objektorientiert') {
      el.append('circle')
        .attr('r', 18)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else if (paradigm === 'Funktional') {
      el.append('polygon')
        .attr('points', '0,-20 18,0 0,20 -18,0')
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else if (paradigm === 'Imperativ') {
      el.append('rect')
        .attr('x', -16).attr('y', -16)
        .attr('width', 32).attr('height', 32)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else if (paradigm === 'Prozedural') {
      el.append('polygon')
        .attr('points', '0,-20 18,17 -18,17')
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else if (paradigm === 'Multi-Paradigma') {
      el.append('polygon')
        .attr('points', '0,-20 12,-8 20,8 0,20 -20,8 -12,-8')
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else {
      el.append('circle')
        .attr('r', 18)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }
  });

  node.append('text')
    .text(d => d.label)
    .attr('text-anchor', 'middle')
    .attr('dy', 32)
    .attr('font-size', '11px')
    .attr('fill', '#333');

  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '8px')
    .style('padding', '10px 14px')
    .style('font-size', '13px')
    .style('pointer-events', 'auto')
    .style('opacity', '0')
    .style('max-width', '220px')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
    .style('transition', 'opacity 0.2s');

  node
    .on('mouseover', (event: MouseEvent, d: Node) => {
      tooltip
        .style('opacity', '1')
        .html(`
          <div>
            ${d.logo ? `
            <div style="text-align:center; margin-bottom:8px;">
              <img src="${d.logo}" style="max-width:60px; max-height:40px; object-fit:contain;"/>
            </div>` : ''}
            <div style="font-size:14px; font-weight:bold; margin-bottom:8px; 
                        border-bottom:1px solid #eee; padding-bottom:6px;">
              ${d.label}
            </div>
            <div style="margin-bottom:4px;">
              <span style="font-size:14px; font-weight:bold; color:#000; font-size:11px;">ERSCHEINUNGSDATUM</span><br/>
              <span style=" color:#888; font-size:12px;">${d.inception 
                ? new Date(d.inception).toLocaleDateString('de-DE', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric'
                  })
                : '-'
              }</span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="font-size:14px; font-weight:bold; color:#000; font-size:11px;">PARADIGMEN</span><br/>
              <span style=" color:#888; font-size:12px;">${d.paradigms.join(', ') || '-'}</span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="font-size:14px; font-weight:bold; color:#000; font-size:11px;">ENTWICKLER</span><br/>
              <span style=" color:#888; font-size:12px;">${d.developers?.slice(0,3).join(', ') || '-'}</span>
            </div>
            ${d.officialWebsite ? `
            <div style="margin-top:8px; border-top:1px solid #eee; padding-top:6px;">
              <a href="${d.officialWebsite}" target="_blank" 
                style="color:#2563eb; text-decoration:none; font-size:12px;">
                🔗 Offizielle Webseite
              </a>
            </div>` : ''}
          </div>
        `)
        .style('left', (event.offsetX + 15) + 'px')
        .style('top',  (event.offsetY - 10) + 'px');
    })
    .on('mousemove', (event: MouseEvent) => {
      tooltip
        .style('left', (event.offsetX + 15) + 'px')
        .style('top',  (event.offsetY - 10) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', '0');
    });

  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as Node).x!)
      .attr('y1', d => (d.source as Node).y!)
      .attr('x2', d => (d.target as Node).x!)
      .attr('y2', d => (d.target as Node).y!);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}

export function highlightNodes(activeIds: Set<string> | null): void {
  const svgEl = document.getElementById('graph-svg');
  if (!svgEl) return;

  d3.select(svgEl).selectAll<SVGGElement, Node>('g.node')
    .attr('opacity', function(d) {
      if (activeIds === null) return 1;
      if (activeIds.size === 0) return 0.1;
      return activeIds.has(d.id) ? 1 : 0.1;
    });

  d3.select(svgEl).selectAll<SVGLineElement, Link>('line.edge')
    .attr('opacity', function(l: any) {
      if (activeIds === null) return 1;
      if (activeIds.size === 0) return 0.05;
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
      const targetId = typeof l.target === 'string' ? l.target : l.target.id;
      return activeIds.has(sourceId) && activeIds.has(targetId) ? 1 : 0.05;
    });
}