import {
  Box,
  Button,
  Collapse,
  Heading,
  Icon,
  Link,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Stack,
  Text
} from '@chakra-ui/core'
import get from 'lodash/get'
import React from 'react'
import {connect} from 'react-redux'

import {clearError} from 'lib/actions'
import message from 'lib/message'
import createLogError from 'lib/utils/log-error'

const logError = createLogError()

const ExternalLink = ({children, href}) => (
  <Link isExternal color='blue.500' href={href}>
    {children} <Icon name='external-link' mx='2px' />
  </Link>
)

function mapState(state, ownProps) {
  if (ownProps.error) {
    return {
      error:
        ownProps.error.environment === 'server'
          ? 'Server Error'
          : 'Application Error',
      errorMessage: ownProps.error.message || ownProps.error,
      stack: ownProps.error.stack
    }
  } else {
    const error = get(state, 'network.error')
    return {
      error: get(error, 'error'),
      errorMessage: get(error, 'detailMessage'),
      url: get(error, 'url'),
      stack: get(error, 'stack')
    }
  }
}

function mapDispatch(dispatch) {
  return {
    clearError: () => dispatch(clearError())
  }
}

function StackTrace({stackTrace, ...p}) {
  // Hide the stack trace in production
  const [show, setShow] = React.useState(process.env.NODE_ENV !== 'production')
  const handleToggle = () => setShow(show => !show)

  return stackTrace ? (
    <Stack spacing={4} {...p}>
      <Button onClick={handleToggle} variantColor='blue'>
        {show ? 'Hide' : 'Show'} stack trace
      </Button>
      <Collapse
        borderRadius='2px'
        fontFamily='mono'
        isOpen={show}
        overflowX='scroll'
        whiteSpace='pre'
        padding={2}
        backgroundColor='#333'
        color='#fff'
      >
        {stackTrace}
      </Collapse>
    </Stack>
  ) : null
}

export class ErrorModal extends React.Component {
  // Ensure that the Error Modal isn't the cause of a crash
  componentDidCatch(err, info) {
    logError(err, info)
  }

  _onClose = () => {
    this.props.clearError() // dispatch
    this.props.clear() // from _app error
  }

  render() {
    const p = this.props
    const {error, errorMessage, url, stack} = this.props
    return (
      <Modal
        isOpen={error}
        onClose={this._onClose}
        scrollBehavior='inside'
        size='2xl'
      >
        <ModalOverlay />
        <ModalContent borderRadius='4px'>
          <ModalHeader>{message('error.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Heading size='lg'>{error}</Heading>
              <Text>{errorMessage}</Text>
              {p.url && <Text>{url}</Text>}
              <StackTrace stackTrace={p.stack} />
              <Box>
                {message('error.report') + ' '}
                <ExternalLink
                  href={
                    'mailto:' +
                    `${message('error.supportEmail')}` +
                    '?subject=Conveyal Analysis Error&body=' +
                    encodeURIComponent(`${url}`) +
                    ' ' +
                    encodeURIComponent(`${stack}`.substring(0, 350))
                  }
                >
                  {message('error.supportEmail')}.
                </ExternalLink>
              </Box>
              <List styleType='disc'>
                <ListItem>
                  <ExternalLink href='https://support.apple.com/en-us/HT201361'>
                    How to take a screenshot on a Mac
                  </ExternalLink>
                </ListItem>
                <ListItem>
                  <ExternalLink href='https://www.howtogeek.com/226280/how-to-take-screenshots-in-windows-10/'>
                    How to take a screenshot on a PC
                  </ExternalLink>
                </ListItem>
              </List>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              block
              leftIcon='arrow-back'
              onClick={() => {
                window.history.back()
                p.clearError()
              }}
              variantColor='yellow'
            >
              {message('error.back')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
}

export default connect(mapState, mapDispatch)(ErrorModal)
