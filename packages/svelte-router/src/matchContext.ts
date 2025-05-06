import { getContext, setContext } from 'svelte'

const matchContextKey = Symbol()

export function getMatchContext(): string {
  return getContext(matchContextKey)
}

export function setMatchContext(value: string) {
  setContext(matchContextKey, value)
}

// N.B. this only exists so we can conditionally call useContext on it when we are not interested in the nearest match
const dummyMatchContextKey = Symbol()

export function getDummyMatchContext(): string {
  return getContext(dummyMatchContextKey)
}

export function setDummyMatchContext(value: string) {
  setContext(dummyMatchContextKey, value)
}
