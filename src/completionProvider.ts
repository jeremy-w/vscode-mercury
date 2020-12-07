import * as vscode from "vscode";

/**
 Responsible for returning completions on demand.

 Mercury's `mtags` tool recognizes the following kinds of items, which we can roughly map to VS Code completion kinds:

 - `pred' for predicate declarations => method
 - `func' for function declarations => function
 - `type' for type definitions => struct
 - `cons' for type constructors => constructor (arity gt 0) or enum member (arity 0)
 - `fld'  for field names => field
 - `inst' for inst definitions => interface
 - `mode' for mode definitions => interface
 - `tc'   for typeclass declarations => class
 - `tci'  for typeclass instance declarations => class
 - `tcm'  for typeclass methods => method
 - `tcim' for typeclass instance methods => method


 Other things we should complete:

 - the names available within a predicate
 - the type parameters available within a type class
 - keywords, e.g. type or else

 To begin with, we will focus on supplying completions only from within the document,
 then augment it with siblings and values from the stdlib.

 It would be great to attach docs, but commenting styles sometimes put docs before, and sometimes after,
 and often before a group of documented items, so supplying the appropriate text could be a challenge.
 */
export class MercuryCompletionProvider
  implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    console.log("XXX: Asked to complete!");
    const fullText = document.getText();
    const declarations = decls(fullText);
    // TODO: const locals = locals(fullText, position);
    // TODO: const keywords = keywords(fullText, position);
    return declarations;
  }
}

/** Regexes used to match out various kinds of items. */
export const matchers = () => [
  {
    name: "pred",
    re: /:-\s*pred\s*(?<name>[^(]+)\(/g,
    kind: vscode.CompletionItemKind.Method,
  },
  {
    name: "func",
    re: /:-\s*func\s*(?<name>[^(=]+)\(/g,
    kind: vscode.CompletionItemKind.Function,
  },
  // decl, versus a use/import
  {
    name: "module_decl",
    re: /:-\s*module\s*(?<name>[^.]+)\(/g,
    kind: vscode.CompletionItemKind.Module,
  },
];

export const matchToCompletion = (
  { name, match }: { name: string; match: RegExpExecArray },
  kind: vscode.CompletionItemKind
): vscode.CompletionItem => {
  const c = new vscode.CompletionItem(name, kind);
  c.detail = match[0];
  return c;
};

export const allMatches = (
  re: RegExp,
  str: string
): { name: string; match: RegExpExecArray }[] => {
  const matches = [];
  let m;
  while ((m = re.exec(str))) {
    if (m.groups?.name) {
      matches.push({ name: m.groups.name, match: m });
    }
  }
  return matches;
};

export function decls(module: string): vscode.CompletionItem[] {
  console.log("searching module:", module);
  const completions = matchers().flatMap((it) =>
    allMatches(it.re, module).map((match) => {
      console.log(`match for ${it.name}:`, match);
      return matchToCompletion(match, it.kind);
    })
  );
  return completions;
}

export default MercuryCompletionProvider;
