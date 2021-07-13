import message from 'lib/message'

/** conversions from km/h to appropriate units */
const conversions = {
  kmh: 1,
  mph: 1 / 1.609,
  ff: 4.907 * 24 * 14 // furlongs per fortnight
}

/**
 * Render speed in appropriate units
 */
export default function Speed({
  kmh,
  units = ['kmh', 'mph']
}: {
  kmh: number
  units?: string[]
}) {
  const main = `${Math.round(kmh * conversions[units[0]] * 10) / 10} ${message(
    `report.units.${units[0]}`
  )}`

  const addl = units
    .slice(1)
    .map(
      (unit) =>
        `${Math.round(kmh * conversions[unit] * 10) / 10} ${message(
          `report.units.${unit}`
        )}`
    )
    .join(',')

  return (
    <>
      {main} ({addl})
    </>
  )
}
