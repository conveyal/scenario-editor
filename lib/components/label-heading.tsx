import {Heading, HeadingProps} from '@chakra-ui/react'

export default function LabelHeading({
  children,
  ...p
}: {
  children: React.ReactNode
} & HeadingProps) {
  return (
    <Heading
      color='gray.500'
      fontWeight='normal'
      size='md'
      style={{fontVariant: 'small-caps'}}
      {...p}
    >
      {children}
    </Heading>
  )
}
