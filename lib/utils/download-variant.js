import convertToR5Modification from '../utils/convert-to-r5-modification'

export default function download ({
  description,
  feeds,
  modifications
}) {
  try {
    const feedChecksums = {}
    feeds.forEach((f) => {
      feedChecksums[f.id] = f.checksum
    })

    const filename = `${description}.json`.replace(/[^a-zA-Z0-9]/, '-')

    // pretty print the json
    const out = JSON.stringify({
      id: 0,
      description,
      feedChecksums,
      modifications: modifications.map((m) => convertToR5Modification(m))
    }, null, '\t')

    const uri = `data:application/json;base64,${window.btoa(out)}`
    const a = document.createElement('a')
    a.setAttribute('href', uri)
    a.setAttribute('target', '_blank')
    a.setAttribute('download', filename)
    a.click()
  } catch (e) {
    window.alert(`Can not export variant:\n${e.message}`)
    throw e
  }
}
