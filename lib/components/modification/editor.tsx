import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Stack,
  useToast,
  AlertDescription,
  useDisclosure
} from '@chakra-ui/react'
import {dequal} from 'dequal/lite'
import get from 'lodash/get'
import {useCallback, useMemo, useState} from 'react'

import {useModification} from 'lib/hooks/use-model'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import copyModification from 'lib/modification/mutations/copy'
import ScenariosSelector from 'lib/scenario/components/selector'

import {ConfirmDialog} from '../confirm-button'
import Editable from '../editable'
import IconButton from '../icon-button'
import {
  ChevronLeft,
  CodeIcon,
  CopyIcon,
  DeleteIcon,
  MouseIcon,
  SaveIcon,
  UndoIcon
} from '../icons'
import InnerDock from '../inner-dock'
import AllModificationsMapDisplay from '../modifications-map/display-all'

import FitBoundsButton from './fit-bounds'
import JSONEditor from './json-editor'
import ModificationType from './type'
import TipButton from '../tip-button'

// Test modification name is valid
const nameIsValid = (s) => s && s.length > 0

/**
 * Show this toast when a modification has been copied.
 */
function CopiedModificationToast({
  modificationId,
  onClose,
  projectId,
  regionId
}) {
  const goToModificationEdit = useRouteTo('modificationEdit', {
    modificationId,
    projectId,
    regionId
  })

  return (
    <Alert
      status='success'
      variant='solid'
      mt={2}
      cursor='pointer'
      onClick={() => {
        goToModificationEdit()
        onClose()
      }}
    >
      <AlertIcon />
      <AlertDescription>
        <Box _hover={{textDecoration: 'underline'}}>
          Modification has been copied successfully. Click here to go to the new
          copy.
        </Box>
      </AlertDescription>
    </Alert>
  )
}

export default function ModificationEditor(p: {
  bundle: CL.Bundle
  modification: CL.Modification
  project: CL.Project
  query: CL.Query
}) {
  const visualEditor = useDisclosure({defaultIsOpen: true})
  const toast = useToast({position: 'top', isClosable: true, status: 'success'})
  const {remove, update} = useModification(p.modification._id, {
    initialData: p.modification
  })
  const [modification, setLocalModification] = useState(p.modification)
  const unsavedChanges = useMemo<boolean>(
    () => !dequal(modification, p.modification),
    [modification, p.modification]
  )

  const goToAllModifications = useRouteTo('modifications', {
    regionId: p.query.regionId,
    projectId: p.query.projectId
  })

  const updateLocally = useCallback(
    (p) =>
      setLocalModification((m) => ({
        ...m,
        ...p
      })),
    [setLocalModification]
  )

  const _save = useCallback(async () => {
    const res = await update(modification)
    if (res.ok === true) setLocalModification(res.data)
  }, [modification, update])

  const _remove = useCallback(async () => {
    // Delete the modification
    const res = await remove()
    if (res.ok === true) {
      // Go to the all modifications page
      goToAllModifications()
      // Show a toast confirming deletion
      toast({
        title: `Modification "${modification.name}" deleted successfully`
      })
    }
  }, [modification, goToAllModifications, remove, toast])

  const _copyModification = useCallback(async () => {
    const res = await copyModification(modification._id)
    if (res.ok) {
      toast({
        position: 'top',
        render: ({onClose}) => (
          <CopiedModificationToast
            modificationId={res.data._id}
            onClose={onClose}
            projectId={p.query.projectId}
            regionId={p.query.regionId}
          />
        )
      })
    }
  }, [modification, p.query, toast])

  return (
    <>
      <AllModificationsMapDisplay isEditingId={modification._id} />

      <FitBoundsButton bundle={p.bundle} modification={modification} />

      <Flex align='center' p={2} width='320px'>
        <IconButton
          isDisabled={unsavedChanges}
          label='Modifications'
          onClick={goToAllModifications}
        >
          <ChevronLeft />
        </IconButton>

        <Box flex='1' fontSize='xl' fontWeight='bold' ml={2} overflow='hidden'>
          <Editable
            isValid={nameIsValid}
            onChange={async (name) => updateLocally({name})}
            value={modification.name}
          />
        </Box>

        <Flex>
          {visualEditor.isOpen ? (
            <IconButton
              label='Edit JSON'
              onClick={() => visualEditor.onClose()}
            >
              <CodeIcon />
            </IconButton>
          ) : (
            <IconButton
              label='Edit value'
              onClick={() => visualEditor.onOpen()}
            >
              <MouseIcon />
            </IconButton>
          )}
          <IconButton
            isDisabled={unsavedChanges}
            label={message('modification.copyModification')}
            onClick={() => _copyModification()}
          >
            <CopyIcon />
          </IconButton>
          <ConfirmDialog
            description={message('modification.deleteConfirmation')}
            onConfirm={_remove}
          >
            <IconButton
              label={message('modification.deleteModification')}
              colorScheme='red'
            >
              <DeleteIcon />
            </IconButton>
          </ConfirmDialog>
        </Flex>
      </Flex>
      {visualEditor.isOpen ? (
        <VisualEditor
          bundle={p.bundle}
          modification={modification}
          project={p.project}
          save={_save}
          saveDisabled={!unsavedChanges}
          undo={() => setLocalModification(p.modification)}
          updateLocally={updateLocally}
        />
      ) : (
        <JSONEditor modification={modification} save={_save} />
      )}
    </>
  )
}

function VisualEditor({
  bundle,
  modification,
  project,
  save,
  saveDisabled,
  undo,
  updateLocally
}: {
  bundle: CL.Bundle
  modification: CL.Modification
  project: CL.Project
  save: () => void
  saveDisabled: boolean
  undo: () => void
  updateLocally: (updates: Partial<CL.Modification>) => void
}) {
  return (
    <>
      <Stack isInline spacing={0} width='100%'>
        <TipButton
          colorScheme='green'
          onClick={save}
          isDisabled={saveDisabled}
          isFullWidth
          label='Save changes'
          leftIcon={<SaveIcon />}
          rounded={0}
        >
          Save changes
        </TipButton>
        <TipButton
          colorScheme='blue'
          isDisabled={saveDisabled}
          label='Undo changes'
          onClick={undo}
          rounded={0}
        >
          <UndoIcon />
        </TipButton>
      </Stack>
      <InnerDock>
        <Stack px={4} pt={4} spacing={2}>
          <Box>
            <Editable
              onChange={async (description) => updateLocally({description})}
              placeholder={message('modification.addDescription')}
              value={modification.description}
            />
          </Box>

          {get(modification, 'routes.length') > 1 && (
            <Alert status='warning'>
              {message('modification.onlyOneRoute')}
            </Alert>
          )}

          <Box>
            <ModificationType
              bundle={bundle}
              modification={modification}
              update={updateLocally}
              type={modification.type}
            />
          </Box>

          <ScenariosSelector modification={modification} project={project} />
        </Stack>
      </InnerDock>
    </>
  )
}
