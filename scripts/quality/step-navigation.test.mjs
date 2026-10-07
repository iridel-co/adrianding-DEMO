import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import vm from "node:vm"
import ts from "typescript"

const source = readFileSync(
  new URL("../../src/app/_lib/use-step-navigation.ts", import.meta.url),
  "utf8"
)
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText

// Inject a minimal hook adapter to exercise the actual async navigation code.
// This proves lifecycle guards and state commits, not React rendering or DOM behavior.
function fixture(blocked = false) {
  const states = [],
    effects = []
  let stateIndex = 0
  const react = {
    useState(initial) {
      const index = stateIndex++
      states[index] = initial
      return [
        initial,
        (value) => {
          states[index] = value
        },
      ]
    },
    useRef(value) {
      return { current: value }
    },
    useEffect(effect) {
      effects.push(effect)
    },
  }
  const context = {
    exports: {},
    require(name) {
      assert.equal(name, "react")
      return react
    },
  }
  vm.runInNewContext(code, context)
  const navigation = context.exports.useStepNavigation(4, blocked)
  const cleanups = effects.map((effect) => effect()).filter(Boolean)
  return {
    navigation,
    states,
    unmount() {
      cleanups.forEach((cleanup) => cleanup())
    },
  }
}

function deferred() {
  let resolve
  const promise = new Promise((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

test("delayed validation serializes Continue and Back and commits one captured step", async () => {
  const { navigation, states } = fixture()
  await navigation.next(async () => true)
  const validation = deferred()
  let calls = 0
  const pending = navigation.next(() => {
    calls++
    return validation.promise
  })
  await navigation.next(async () => {
    calls++
    return true
  })
  navigation.back()
  assert.equal(calls, 1)
  assert.deepEqual(states, [1, true])
  validation.resolve(true)
  await pending
  assert.deepEqual(states, [2, false])
  navigation.back()
  assert.equal(states[0], 1)
})

test("rejected validation releases pending and permits a successful retry", async () => {
  const { navigation, states } = fixture()
  await navigation.next(async () => {
    throw new Error("validator unavailable")
  })
  assert.deepEqual(states, [0, false])
  await navigation.next(async () => true)
  assert.deepEqual(states, [1, false])
})

test("invalid validation retains the step and releases pending", async () => {
  const { navigation, states } = fixture()
  await navigation.next(async () => false)
  assert.deepEqual(states, [0, false])
})

test("validation cannot commit navigation or pending state after unmount", async () => {
  const { navigation, states, unmount } = fixture()
  const validation = deferred()
  const pending = navigation.next(() => validation.promise)
  unmount()
  const before = [...states]
  validation.resolve(true)
  await pending
  assert.deepEqual(states, before)
})

test("blocked navigation does not validate or move Back", async () => {
  const { navigation, states } = fixture(true)
  let called = false
  await navigation.next(async () => {
    called = true
    return true
  })
  navigation.back()
  assert.equal(called, false)
  assert.deepEqual(states, [0, false])
})
