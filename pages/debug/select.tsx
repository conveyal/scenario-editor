import {Box, Center, HStack} from '@chakra-ui/react'
import NewSelect from 'lib/components/combobox'
import Select from 'lib/components/select'

interface Option {
  name: string
  _id: string
}

const options: Option[] = []

for (let i = 0; i < 50; i++) {
  options.push({
    name: 'Hello ' + i,
    _id: `${i}`
  })
}

export default function SelectPage() {
  return (
    <Center pt={10}>
      <HStack spacing={10}>
        <Box width='300px'>
          <Select options={options} />
        </Box>
        <Box>
          <NewSelect<Option>
            onChange={async (e) => console.log('Selected', e)}
            options={options}
            placeholder='Select a destination opportunity layer'
            variant='ghost'
          />
        </Box>
      </HStack>
    </Center>
  )
}
