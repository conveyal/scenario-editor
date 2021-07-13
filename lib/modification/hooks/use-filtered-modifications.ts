import {useMemo, useState} from 'react'

export default function useFilteredModifications(
  modifications: CL.Modification[],
  projectId: string
) {
  const [value, set] = useState('')
  const filteredModificationsByType = useMemo(() => {
    return filterModifications(value, modifications, projectId)
  }, [value, modifications, projectId])

  return {
    modifications: filteredModificationsByType,
    set,
    value
  }
}

function filterModifications(
  filter: string,
  modifications: CL.Modification[],
  projectId: string
) {
  const filterLcase = filter != null ? filter.toLowerCase() : ''
  const filteredModificationsByType: {[key: string]: CL.Modification[]} = {}

  modifications
    .filter((m) => m.projectId === projectId)
    .filter(
      (m) => filter === null || m.name?.toLowerCase().indexOf(filterLcase) > -1
    )
    .forEach((m) => {
      filteredModificationsByType[m.type] = [
        ...(filteredModificationsByType[m.type] || []),
        m
      ]
    })

  return filteredModificationsByType
}
