export default function downloadObjectAsJson(data: any, filename: string) {
  try {
    const out = JSON.stringify(data, null, '\t')
    const uri = `data:application/json;base64,${window.btoa(out)}`
    const a = document.createElement('a')
    a.setAttribute('href', uri)
    a.setAttribute('target', '_blank')
    a.setAttribute('download', filename)
    a.click()
  } catch (e) {
    window.alert(`Can not download filename:\n${e.message}`)
    throw e
  }
}
