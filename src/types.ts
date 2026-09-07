import type * as d3 from 'd3';

export interface RawLanguage {
  language: string;
  languageLabel: string;
  inception?: string;
  logo?: string;
  officialWebsite?: string;
  basedOnList?: string;
  developerList?: string;
  developerBirthDates?: string;
  influencedByIds?: string;
  influencedByList?: string;
  paradigmList?: string;
}

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  year: number | null;
  inception?: string;
  logo?: string;
  paradigms: string[];
  primaryParadigm: string;
  developers: string[];    
  officialWebsite?: string; 
  x?: number;
  y?: number;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}