import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  PopoverContent,
  SimpleGrid,
  Tag,
  Text
} from '@chakra-ui/react'
import get from 'lodash/get'
import React from 'react'

import {BoltIcon} from './icons'
import {ExternalLink} from './text-link'

function createWorkerUrl(instanceId, region) {
  return `https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#Instances:instanceId=${instanceId};sort=tag:Name`
}

export default function Worker(p) {
  const bundle = get(p, 'bundles[0]')
  return (
    <Popover trigger='hover'>
      <PopoverTrigger>
        <Box>
          <Tag rounded='full' colorScheme='green' whiteSpace='nowrap'>
            <BoltIcon style={{display: 'inline-block'}} /> {p.ec2instanceId}
          </Tag>
        </Box>
      </PopoverTrigger>
      <PopoverContent maxWidth='500px' zIndex={4}>
        <PopoverArrow />
        <PopoverHeader>
          <ExternalLink href={createWorkerUrl(p.ec2instanceId, p.ec2region)}>
            Inspect EC2 Instance in AWS
          </ExternalLink>
        </PopoverHeader>
        <PopoverBody>
          <SimpleGrid columns={2} spacing={1}>
            {Object.keys(p)
              .filter((k) => typeof p[k] === 'string')
              .map((k) => (
                <Text key={k} mr='2' isTruncated title={p[k]}>
                  {k} <strong>{p[k]}</strong>
                </Text>
              ))}
          </SimpleGrid>
          {bundle && (
            <>
              <Text mt={2}>bundle</Text>
              <SimpleGrid columns={2} spacing={1}>
                {Object.keys(bundle)
                  .filter((k) => typeof bundle[k] === 'string')
                  .map((k) => (
                    <Text key={k} mr='2' isTruncated title={bundle[k]}>
                      .{k} <strong>{bundle[k]}</strong>
                    </Text>
                  ))}
              </SimpleGrid>
            </>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
