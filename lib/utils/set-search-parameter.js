export default function setSearchParameter(name, value) {
  if (typeof window === 'undefined') return

  const search = new URLSearchParams(window.location.search)
  if (value != null) search.set(name, value)
  else search.delete(name)

  const newUrl = window.location.pathname + '?' + search.toString()
  window.history.replaceState(null, document.title, newUrl)
}
