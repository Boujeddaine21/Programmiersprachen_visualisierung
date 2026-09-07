import * as d3 from 'd3';

interface TiobeEntry {
  rank: number;
  language: string;
  rating: number;
}

export async function renderBarChart(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const data: TiobeEntry[] = await fetch('/data/tiobe_data.json').then(r => r.json());

  const margin = { top: 80, right: 100, bottom: 60, left: 150 };
  const width  = container.clientWidth  - margin.left - margin.right;
  const height = data.length * 30;

  const svg = d3.select(container)
    .append('svg')
    .attr('id', 'stats-svg')
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Y-Skala (Sprachen)
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.language))
    .range([0, height])
    .padding(0.3);

  // X-Skala (Rating)
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.rating)! + 1])
    .range([0, width]);

  // X-Achse oben
g.append('g')
    .attr('transform', `translate(0,0)`)
    .call(d3.axisTop(xScale).tickFormat(d => `${d}%`))

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
    .text('TIOBE Index - Beliebtheit der Programmiersprachen (August 2026)');

  // X-Achsen Beschriftung
  g.append('text')
    .attr('x', width / 2)
    .attr('y', -35)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#666')
    .text('Beliebtheit (%)');

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
    .attr('width', d => xScale(d.rating))
    .attr('fill', '#2563eb')
    .attr('rx', 4)
    .on('mouseover', (event: MouseEvent, d: TiobeEntry) => {
      tooltip
        .style('opacity', '1')
        .html(`<strong>${d.language}</strong><br/>Rang: ${d.rank}<br/>Beliebtheit: ${d.rating}%`)
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
    .attr('x', d => xScale(d.rating) + 5)
    .attr('y', d => yScale(d.language)! + yScale.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#333')
    .text(d => `${d.rating}%`);

 /*  
    // Trennlinie
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width + margin.left)
      .attr('y1', height + margin.top + margin.bottom + 20)
      .attr('y2', height + margin.top + margin.bottom + 20)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);

    // Liniendiagramm Titel
    svg.append('text')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + margin.bottom + 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('TIOBE Index – Historische Entwicklung');*/
}



/*
interface HistoryEntry {
  year: number;
  rank: number;
}

interface LanguageHistory {
  language: string;
  history: HistoryEntry[];
}

export async function renderLineChart(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const data: LanguageHistory[] = await fetch('/data/tiobe_history.json').then(r => r.json());

  const margin = { top: 60, right: 150, bottom: 60, left: 60 };
  const width  = container.clientWidth  - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append('svg')
    .attr('id', 'line-svg')
    .attr('width',  width  + margin.left + margin.right)
    .attr('height', height + margin.top  + margin.bottom);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Farben
  const colors = d3.schemeTableau10;

  // X-Skala (Jahre)
  const allYears = [...new Set(data.flatMap(d => d.history.map(h => h.year)))].sort();
  const xScale = d3.scalePoint()
    .domain(allYears.map(String))
    .range([0, width]);

  // Y-Skala (Rang — umgekehrt, 1 ist oben)
  const maxRank = d3.max(data, d => d3.max(d.history, h => h.rank))!;
  const yScale = d3.scaleLinear()
    .domain([1, maxRank + 2])
    .range([0, height]);

  // X-Achse
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('font-size', '12px');

  // Y-Achse
  g.append('g')
    .call(d3.axisLeft(yScale).tickFormat(d => `#${d}`))
    .selectAll('text')
    .attr('font-size', '12px');

  // Y-Achsen Beschriftung
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -45)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#666')
    .text('Rang');

  // Titel
  g.append('text')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('fill', '#333')
    .text('TIOBE Index – Historische Entwicklung der Programmiersprachen');

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

  // Linien zeichnen
  data.forEach((lang, i) => {
    const color = colors[i % colors.length];

    const line = d3.line<HistoryEntry>()
      .x(d => xScale(String(d.year))!)
      .y(d => yScale(d.rank));

    // Linie
    g.append('path')
      .datum(lang.history)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Punkte
    g.selectAll(`.dot-${i}`)
      .data(lang.history)
      .join('circle')
      .attr('class', `dot-${i}`)
      .attr('cx', d => xScale(String(d.year))!)
      .attr('cy', d => yScale(d.rank))
      .attr('r', 5)
      .attr('fill', color)
      .on('mouseover', (event: MouseEvent, d: HistoryEntry) => {
        tooltip
          .style('opacity', '1')
          .html(`<strong>${lang.language}</strong><br/>Jahr: ${d.year}<br/>Rang: #${d.rank}`)
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

    // Legende rechts
    g.append('circle')
      .attr('cx', width + 10)
      .attr('cy', i * 20)
      .attr('r', 6)
      .attr('fill', color);

    g.append('text')
      .attr('x', width + 22)
      .attr('y', i * 20 + 4)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text(lang.language);
  });
}*/