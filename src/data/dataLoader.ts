import type { RawLanguage, Node, Link } from '../types.ts';

export const LABEL_MAP: Record<string, string> = {
  Q15777:  "C",
  Q2407:   "C++",
  Q2370:   "C#",
  Q2005:   "JavaScript",
  Q42478:  "Perl",
  Q42979:  "BASIC",
  Q81571:  "Pascal",
  Q161053: "Ruby",
  Q213970: "AWK",
  Q460584: "Scala",
  Q575650: "Rust",
};

export const PARADIGM_COLORS: Record<string, string> = {
  "Objektorientiert": "#e74c3c",
  "Funktional": "#9b59b6",
  "Imperativ": "#3498db",
  "Prozedural": "#2ecc71",
  "Multi-Paradigma": "#1abc9c",
  "default": "#78909c",
};

const YEAR_MAP: Record<string, number> = {
  Q1209759: 1960, // ALGOL 60
  Q1094499: 1958, // ALGOL 58
};

const PARADIGM_TRANSLATION: Record<string, string> = {
  'object-oriented programming': 'Objektorientiert',
  'functional programming':      'Funktional',
  'imperative programming':      'Imperativ',
  'procedural programming':      'Prozedural',
  'declarative programming':     'Deklarativ',
  'multi-paradigm programming':  'Multi-Paradigma',
  'structured programming':      'Strukturiert',
  'generic programming':         'Generisch',
  'logic programming':           'Logisch',
  'array programming':           'Array',
  'metaprogramming':             'Metaprogrammierung',
  'reflective programming':      'Reflektiv',
  'concurrent programming':      'Nebenläufig',
  'event-driven programming':    'Ereignisgesteuert',
};

const PRIMARY_PARADIGM: Record<string, string> = {
  'C':                'Imperativ',
  'C++':              'Objektorientiert',
  'C#':               'Objektorientiert',
  'Java':             'Objektorientiert',
  'Python':           'Objektorientiert',
  'JavaScript':       'Objektorientiert',
  'TypeScript':       'Objektorientiert',
  'PHP':              'Objektorientiert',
  'Ruby':             'Objektorientiert',
  'Perl':             'Multi-Paradigma',
  'Go':               'Imperativ',
  'Rust':             'Imperativ',
  'Swift':            'Objektorientiert',
  'Kotlin':           'Objektorientiert',
  'Scala':            'Objektorientiert',
  'Fortran':          'Imperativ',
  'Lisp':             'Funktional',
  'Smalltalk':        'Objektorientiert',
  'Simula':           'Objektorientiert',
  'ALGOL 58':         'Imperativ',
  'ALGOL 60':         'Imperativ',
  'BASIC':            'Imperativ',
  'Pascal':           'Prozedural',
  'AWK':              'Imperativ',
  'B':                'Prozedural',
  'Crystal':          'Objektorientiert',
  'Carbon':           'Objektorientiert',
  'Mojo':             'Funktional',
};

export function getColor(paradigms: string[]): string {
  for (const p of paradigms) {
    if (PARADIGM_COLORS[p]) return PARADIGM_COLORS[p];
  }
  return PARADIGM_COLORS['default'];
}

export async function loadData(): Promise<{ nodes: Node[]; links: Link[] }> {
  const res = await fetch('/data/query_data.json');
  const raw: RawLanguage[] = await res.json();

  const map = new Map<string, Node>();
  const links: Link[] = [];
  

  for (const item of raw) {
    const id = item.language.split('/').pop()!;
    const label = LABEL_MAP[item.languageLabel] ?? item.languageLabel;

    if (!map.has(id)) {
      map.set(id, {
        id,
        label,
        inception: item.inception ?? undefined,
        year: YEAR_MAP[id] || (item.inception ? parseInt(item.inception.substring(0, 4)) : null),
        paradigms: item.paradigmList 
          ? item.paradigmList.split(', ').map(p => 
            PARADIGM_TRANSLATION[p.trim()] ?? p.trim()
        ): [],
        primaryParadigm: PRIMARY_PARADIGM[label] ?? 'default',
        developers: item.developerList 
          ? item.developerList.split(', ').map(d => d.trim())
        : [],
        officialWebsite: item.officialWebsite ?? undefined,
        logo: item.logo ?? undefined, 
      });
    }

    if (item.influencedByIds) {
      for (const targetId of item.influencedByIds.split(', ')) {
        links.push({ source: targetId.trim(), target: id });
      }
    }
  }

  return { nodes: Array.from(map.values()), links };
}