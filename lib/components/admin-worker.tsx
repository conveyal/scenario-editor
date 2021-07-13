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

import {BoltIcon} from './icons'
import {ExternalLink} from './text-link'

function createWorkerUrl(instanceId, region) {
  return `https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#Instances:instanceId=${instanceId};sort=tag:Name`
}

export default function Worker({worker}: {worker: CL.RegionalWorker}) {
  const bundle = worker.bundles[0]
  return (
    <Popover trigger='hover'>
      <PopoverTrigger>
        <Box>
          <Tag rounded='full' colorScheme='green' whiteSpace='nowrap'>
            <BoltIcon style={{display: 'inline-block'}} />{' '}
            {worker.ec2instanceId}
          </Tag>
        </Box>
      </PopoverTrigger>
      <PopoverContent maxWidth='500px' zIndex={4}>
        <PopoverArrow />
        <PopoverHeader>
          <ExternalLink
            href={createWorkerUrl(worker.ec2instanceId, worker.ec2region)}
          >
            Inspect EC2 Instance in AWS
          </ExternalLink>
        </PopoverHeader>
        <PopoverBody>
          <SimpleGrid columns={2} spacing={1}>
            {Object.keys(worker)
              .filter((k) => typeof worker[k] === 'string')
              .map((k) => (
                <Text key={k} mr='2' isTruncated title={worker[k]}>
                  {k} <strong>{worker[k]}</strong>
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
