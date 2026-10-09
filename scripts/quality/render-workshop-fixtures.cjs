// Render real TSX outside Playwright's component-placeholder JSX transform.
// Fixtures live only in this process; no test routes or catalogue writes.
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const root = path.resolve(__dirname, "../..")
function compile(module, filename) {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })
  module._compile(
    outputText.replace(
      /require\("@\/([^"\n]+)"\)/g,
      (_, name) => `require(${JSON.stringify(path.join(root, "src", name))})`
    ),
    filename
  )
}
require.extensions[".ts"] = compile
require.extensions[".tsx"] = compile
const { Children, createElement } = require("react")
const { renderToStaticMarkup } = require("react-dom/server")
const { WORKSHOPS } = require("../../src/lib/workshops.ts")
const {
  WorkshopTagFilter,
} = require("../../src/app/_components/workshop-tag-filter.tsx")
const {
  WorkshopsCalendar,
} = require("../../src/app/_components/workshops-calendar.tsx")
const {
  RegistrationDialog,
} = require("../../src/app/workshops/[slug]/_sections/registration-dialog.tsx")
const {
  default: RegisteredPage,
  generateMetadata,
} = require("../../src/app/workshops/[slug]/registered/page.tsx")
async function main() {
  const original = WORKSHOPS[0]
  const result = []
  for (const seatsLeft of [0, -1, 1]) {
    WORKSHOPS[0] = { ...original, seatsLeft }
    const trigger = renderToStaticMarkup(
      createElement(RegistrationDialog, {
        workshop: WORKSHOPS[0],
        triggerLabel: "Register fixture",
      })
    )
    const params = Promise.resolve({ slug: original.slug })
    const page = seatsLeft === 1 ? null : await RegisteredPage({ params })
    // Render the actual main branch without Next's navbar routing context.
    const main =
      page &&
      Children.toArray(page.props.children).find(
        (child) => child.type === "main"
      )
    result.push({
      seatsLeft,
      trigger,
      confirmation: main ? renderToStaticMarkup(main) : null,
      metadata: await generateMetadata({ params }),
    })
  }
  process.stdout.write(
    JSON.stringify({
      capacity: result,
      emptyList: renderToStaticMarkup(
        createElement(WorkshopTagFilter, { workshops: [] })
      ),
      emptyCalendar: renderToStaticMarkup(
        createElement(WorkshopsCalendar, { workshops: [] })
      ),
    })
  )
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
