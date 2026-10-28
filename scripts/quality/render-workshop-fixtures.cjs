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
const { createElement } = require("react")
const { renderToStaticMarkup } = require("react-dom/server")
const { PrimerPlayer } = require("../../src/app/_components/primer-player.tsx")
const { CmsImage } = require("../../src/app/_components/cms-image.tsx")

const {
  WorkshopTagFilter,
} = require("../../src/app/_components/workshop-tag-filter.tsx")
const {
  WorkshopsCalendar,
} = require("../../src/app/_components/workshops-calendar.tsx")
const {
  RegistrationDialog,
} = require("../../src/app/workshops/[slug]/_sections/registration-dialog.tsx")
const capacity = [
  {
    seatsLeft: 0,
    registrationOpen: true,
    label: "Fully booked",
    enabled: false,
  },
  {
    seatsLeft: 9,
    registrationOpen: false,
    label: "Registration closed",
    enabled: false,
  },
  {
    seatsLeft: 1,
    registrationOpen: true,
    label: "Register fixture",
    enabled: true,
  },
].map((fixture) => ({
  ...fixture,
  trigger: renderToStaticMarkup(
    createElement(RegistrationDialog, {
      workshop: {
        slug: "fixture",
        title: "Fixture",
        status: "open",
        seatsTotal: 40,
        ...fixture,
      },
      triggerLabel: "Register fixture",
    })
  ),
}))
process.stdout.write(
  JSON.stringify({
    decorativeImage: renderToStaticMarkup(
      createElement(CmsImage, { src: null, alt: "" })
    ),
    informativeImage: renderToStaticMarkup(
      createElement(CmsImage, { src: null, alt: "Coach portrait" })
    ),
    videos: [null, "", "invalid", "https://www.youtube.com/watch?v=abc123"].map(
      (videoUrl) =>
        renderToStaticMarkup(
          createElement(PrimerPlayer, {
            title: "Workshop video",
            blurb: "Primer",
            videoUrl,
          })
        )
    ),
    capacity,
    emptyList: renderToStaticMarkup(
      createElement(WorkshopTagFilter, { workshops: [] })
    ),
    emptyCalendar: renderToStaticMarkup(
      createElement(WorkshopsCalendar, { workshops: [] })
    ),
  })
)
