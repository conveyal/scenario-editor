/**
 * CKMeans runs very slow on datasets larger than 10000 numbers.
 * Ex: 100,000 numbers took 32 seconds to run. We currently use a random sample
 * up to 10,000 values. This will show the performance differences and result
 * differences from different sample size numbers.
 */

const ss = require('simple-statistics')
const XorShift = require('xorshift').constructor

const RUNS = 10
const BREAKS = 6
const SAMPLES = [6, 100, 1000, 2000, 5000, 10000, 20000]
const VALUES = 100000
const SEED = [1, 2, 3, 4]
const RANGE = 10000 // 0 - 10000

const generator = new XorShift(SEED)
const values = Array(VALUES)
  .fill(0)
  .map(() => generator.random() * RANGE)
SAMPLES.forEach(sampleSize => {
  const times = []
  const results = []
  const sampleGenerator = new XorShift(SEED)
  const samples = ss.sample(values, sampleSize, () => sampleGenerator.random())
  for (let i = 0; i < RUNS; i++) {
    let now = Date.now()
    results.push(ss.ckmeans(samples, BREAKS))
    times.push(Date.now() - now)
  }
  const clusters = results[0].map(c => c[c.length - 1] | 0)
  console.log('Sample Size:', sampleSize)
  console.log(ss.mean(times))
  console.log(JSON.stringify(clusters))
  console.log('\n')
})
