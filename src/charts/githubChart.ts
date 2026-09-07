import * as d3 from 'd3';

interface GithubEntry {
  language: string;
  count: number;
}

export async function renderGithubChart(container: HTMLElement): Promise<void> {
  const data: GithubEntry[] = await fetch('/data/github_data.json').then(r => r.json());

  const margin = { top: 80, right: 150, bottom: 40, left: 150 };
  const width  = container.clientWidth  - margin.left - margin.right;
  const height = data.length * 30;

  const svg = d3.select(container)
    .append('svg')
    .attr('id', 'github-svg')
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Y-Skala
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.language))
    .range([0, height])
    .padding(0.3);

  // X-Skala
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)!])
    .range([0, width]);

  // X-Achse oben
  g.append('g')
  .attr('transform', 'translate(0,0)')
  .call(d3.axisTop(xScale).tickFormat(d => 
    `${(+d / 1000).toFixed(0)}K`))
  .selectAll('text')
  .attr('font-size', '11px');

  // Y-Achse
  g.append('g')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .attr('font-size', '11px');

  // Titel
  g.append('text')
    .attr('x', width / 2)
    .attr('y', -55)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .text('GitHub - Anzahl der Repositories pro Programmiersprache (August 2026)');

  // X-Achsen Beschriftung
  g.append('text')
    .attr('x', width / 2)
    .attr('y', -35)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#666')
    .text('Anzahl Repositories (in Tausend)');

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'white')
    .style('border', '1px solid #ddd')
    .style('border-radius', '8px')
    .style('padding', '8px 12px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)');

  // Balken
  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('y', d => yScale(d.language)!)
    .attr('x', 0)
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d.count))
    .attr('fill', '#16a34a')
    .attr('rx', 4)
    .on('mouseover', (event: MouseEvent, d: GithubEntry) => {
      tooltip
        .style('opacity', '1')
        .html(`<strong>${d.language}</strong><br/>
               Repositories: ${d.count.toLocaleString('de-DE')}`)
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

  // Werte rechts neben Balken
  g.selectAll('text.bar-label')
  .data(data)
  .join('text')
  .attr('class', 'bar-label')
  .attr('x', d => xScale(d.count) + 5)
  .attr('y', d => yScale(d.language)! + yScale.bandwidth() / 2)
  .attr('dominant-baseline', 'middle')
  .attr('font-size', '10px')
  .attr('fill', '#333')
  .text(d => `${(d.count / 1000).toFixed(0)}K`);
}