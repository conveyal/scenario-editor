import React from 'react'

import { basicRenderTest } from '../../testUtils/unitUtils'

import { Checkbox, File, Group, Input, Number, Select, SelectMultiple, Text } from '../../lib/components/input'

const mockOptions = [1, 2].map((n) => { return (<option key={n + ''} value={n + ''}>{n}</option>) })

basicRenderTest([
  {
    component: Checkbox,
    name: 'Checkbox',
    props: {
      label: 'Do the thing?',
      checked: true
    }
  }, {
    component: File,
    name: 'File',
    props: {
      label: 'Select files',
      multiple: true,
      name: 'files',
      value: undefined
    }
  }, {
    component: Group,
    name: 'Group'
  }, {
    component: Input,
    name: 'Input',
    props: {
      name: 'someInput',
      placeholder: 'Enter Text',
      value: ''
    }
  }, {
    component: Number,
    name: 'Number',
    props: {
      name: 'someNumber',
      placeholder: 'Enter Number',
      value: 12345
    }
  }, {
    children: mockOptions,
    component: Select,
    name: 'Select',
    props: {
      label: 'Select an option',
      value: ''
    }
  }, {
    children: mockOptions,
    component: SelectMultiple,
    name: 'SelectMultiple',
    props: {
      label: 'Select multiple options',
      value: ''
    }
  }, {
    component: Text,
    name: 'Text',
    props: {
      label: 'Enter text',
      name: 'someText',
      value: 'blah'
    }
  }
])
