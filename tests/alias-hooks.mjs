import { registerHooks } from "node:module"

// Resolve the app's `@/` alias to TypeScript source, as the bundler does, so
// tests can import real modules (Node strips the types). Import this module
// before dynamically importing anything under lib/.
const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(
        new URL(`${specifier.slice(2)}.ts`, root).href,
        context
      )
    }
    return nextResolve(specifier, context)
  },
})
