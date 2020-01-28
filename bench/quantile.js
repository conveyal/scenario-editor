/**
 * Why: I was unsure if our manual way of finding the 99th percentile was slower
 * than the SS method. Initial results proved SS to be 10x faster for datasets
 * that have more than 1000 values.
 * @trevorgerhardt
 */
const XorShift = require('xorshift').constructor
const ss = require('simple-statistics')

const RUNS = Array(1).fill(0)
const VALS = Array(100000).fill(0)
const RANG = 10000
const SEED = [1, 2, 3, 4]

const percentiles = [0.1, 0.15, 0.5, 0.85, 0.99, 0.999]

function findPercentile(fn) {
  const times = []
  const results = []

  const generator = new XorShift(SEED)
  RUNS.forEach(() => {
    const values = VALS.map(() => generator.random() * RANG)
    const now = Date.now()
    results.push(percentiles.map(p => fn(values, p)))
    times.push(Date.now() - now)
  })

  return [ss.mean(times), results[0]]
}

// Simple Statistics
const ssResults = findPercentile((v, p) => ss.quantile(v, p))
console.log('Simple Statistics')
console.log(ssResults[0])
console.log(ssResults[1])

// Manual
const mResults = findPercentile((v, p) => {
  const distinct = Int32Array.from(new Set(v))
  distinct.sort()
  return distinct[(distinct.length * p) | 0]
})
console.log('Manual')
console.log(mResults[0])
console.log(mResults[1])
