import fs from 'node:fs'
import ts from 'typescript'
export function loadFunctions(path, names, globals = {}) {
  const source = fs.readFileSync(path, 'utf8')
  const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
  const selected = parsed.statements.filter(node => ts.isFunctionDeclaration(node) && names.includes(node.name?.text))
  if (selected.length !== names.length) throw new Error(`Missing function in ${path}`)
  const code = selected.map(node => node.getText(parsed).replace(/^export /, '')).join('\n')
  const js = ts.transpileModule(code, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}}).outputText
  return new Function(...Object.keys(globals), `${js}; return {${names.join(',')}}`)(...Object.values(globals))
}
