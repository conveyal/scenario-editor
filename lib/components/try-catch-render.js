// @flow
import React from 'react'

export default function tryCatchRender (Component: any) {
  const render = Component.prototype.render

  if (process.env.NODE_ENV !== 'production') {
    Component.prototype.render = function tryRender () {
      try {
        return render.apply(this, arguments)
      } catch (e) {
        console.error(e)
        return <div className='alert alert-danger'>
          <strong>Error Rendering {Component.displayName || Component.name || 'Component'}:</strong> {e.message}
        </div>
      }
    }
  }

  return Component
}
