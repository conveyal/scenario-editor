import React from 'react'

export default function Debug() {
  return (
    <button
      onClick={() => {
        throw new Error('testing errors')
      }}
    >
      Click to throw error
    </button>
  )
}
