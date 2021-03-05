import {Button, useColorModeValue} from '@chakra-ui/react'

export default function ListGroupItem({children, ...p}) {
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  return (
    <Button
      isFullWidth
      borderColor={borderColor}
      borderRadius='4px'
      justifyContent='left'
      height='unset'
      py={4}
      textAlign='left'
      whiteSpace='break-spaces'
      variant='outline'
      colorScheme='blue'
      _notLast={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: 0
      }}
      _notFirst={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
      }}
      {...p}
    >
      {children}
    </Button>
  )
}
