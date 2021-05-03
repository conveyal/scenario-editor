import {Heading, HeadingProps} from '@chakra-ui/react'

export default function LabelHeading({
  children,
  ...p
}: {
  children: React.ReactNode
} & HeadingProps) {
  return (
    <Heading
      fontWeight='normal'
      opacity={0.6}
      size='md'
      style={{fontVariant: 'small-caps'}}
      {...p}
    >
      {children}
    </Heading>
  )
}
