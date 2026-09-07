import { writeFileSync } from 'fs';

const TOKEN = 'XXXXXXXXX'; // ← Ihre Token einfügen

const languages = [
  { name: "Python",            query: "python" },
  { name: "C",                 query: "c" },
  { name: "C++",               query: "cpp" },
  { name: "Java",              query: "java" },
  { name: "C#",                query: "csharp" },
  { name: "JavaScript",        query: "javascript" },
  { name: "Visual Basic",      query: "visual-basic" },
  { name: "SQL",               query: "sql" },
  { name: "R",                 query: "r" },
  { name: "Rust",              query: "rust" },
  { name: "Delphi",            query: "delphi" },
  { name: "Scratch",           query: "scratch" },
  { name: "PHP",               query: "php" },
  { name: "Go",                query: "go" },
  { name: "Fortran",           query: "fortran" },
  { name: "Ruby",              query: "ruby" },
  { name: "Swift",             query: "swift" },
  { name: "Perl",              query: "perl" },
  { name: "COBOL",             query: "cobol" },
  { name: "Assembly language", query: "assembly" },
  { name: "Ada",               query: "ada" },
  { name: "Objective-C",       query: "objective-c" },
  { name: "MATLAB",            query: "matlab" },
  { name: "Julia",             query: "julia" },
  { name: "Kotlin",            query: "kotlin" },
  { name: "OCaml",             query: "ocaml" },
  { name: "Dart",              query: "dart" },
  { name: "Lua",               query: "lua" },
  { name: "VHDL",              query: "vhdl" },
  { name: "Prolog",            query: "prolog" },
  { name: "PowerShell",        query: "powershell" },
  { name: "Lisp",              query: "lisp" },
  { name: "Zig",               query: "zig" },
  { name: "TypeScript",        query: "typescript" },
  { name: "Haskell",           query: "haskell" },
  { name: "Scala",             query: "scala" },
  { name: "D",                 query: "d" },
  { name: "Groovy",            query: "groovy" },
  { name: "Elixir",            query: "elixir" },
  { name: "Clojure",           query: "clojure" },
  { name: "Erlang",            query: "erlang" },
  { name: "F#",                query: "fsharp" },
  { name: "Scheme",            query: "scheme" },
  { name: "Crystal",           query: "crystal" },
  { name: "Nim",               query: "nim" },
  { name: "Racket",            query: "racket" },
  { name: "Smalltalk",         query: "smalltalk" },
  { name: "BASIC",             query: "basic" },
  { name: "Pascal",            query: "pascal" },
  { name: "Tcl",               query: "tcl" },
];

const results = [];

for (const lang of languages) {
  try {
    const url = `https://api.github.com/search/repositories?q=language:${lang.query}&sort=stars`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const data = await res.json();
    
    if (data.total_count !== undefined) {
      results.push({
        language: lang.name,
        count: data.total_count
      });
      console.log(`${lang.name}: ${data.total_count.toLocaleString()} Repositories`);
    } else {
      console.log(`${lang.name}: Fehler — ${data.message}`);
      await new Promise(r => setTimeout(r, 60000));
    }
    
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (error) {
    console.log(`${lang.name}: ${error}`);
  }
}

results.sort((a, b) => b.count - a.count);

writeFileSync('public/data/github_data.json', JSON.stringify(results, null, 2));
console.log('\nFertig! github_data.json wurde erstellt.');