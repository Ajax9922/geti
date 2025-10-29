// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { ComponentProps, FormEvent, useMemo, useState } from 'react';

import { useWorkspacesApi } from '@geti/core/src/workspaces/hooks/use-workspaces.hook';
import {
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Flex,
    Form,
    Heading,
    Text,
    TextField,
} from '@geti/ui';
import { OverlayTriggerState } from '@react-stately/overlays';

import { useOrganizationIdentifier } from '../../../../hooks/use-organization-identifier/use-organization-identifier.hook';
import { isYupValidationError } from '../../profile-page/utils';
import { WORKSPACE_NAME_REQUIRED_VALIDATION_MESSAGE, WorkspaceNameErrorPath, workspaceNameSchema } from '../utils';

interface CreateWorkspaceDialogProps {
    triggerState: OverlayTriggerState;
    names: string[];
    nameLimitations?: Partial<Pick<ComponentProps<typeof TextField>, 'maxLength' | 'minLength'>>;
}

export const CreateWorkspaceDialog = ({ names, triggerState, nameLimitations = {} }: CreateWorkspaceDialogProps) => {
    const [workspaceName, setWorkspaceName] = useState<string>('');

    const trimmedWorkspaceName = useMemo(() => workspaceName.trim(), [workspaceName]);
    const workspaceNameYupSchema = useMemo(() => workspaceNameSchema(names), [names]);

    const workspaceNameValidationError = useMemo(() => {
        try {
            workspaceNameYupSchema.validateSync({ name: workspaceName }, { abortEarly: false });
            return undefined;
        } catch (error: unknown) {
            if (isYupValidationError(error)) {
                const fieldError = error.inner.find(
                    (validationError) => validationError.path === WorkspaceNameErrorPath.NAME
                );
                return fieldError?.message ?? error.message ?? WORKSPACE_NAME_REQUIRED_VALIDATION_MESSAGE;
            }

            return WORKSPACE_NAME_REQUIRED_VALIDATION_MESSAGE;
        }
    }, [workspaceName, workspaceNameYupSchema]);

    const isConfirmButtonDisabled = Boolean(workspaceNameValidationError);
    const { organizationId } = useOrganizationIdentifier();
    const { useCreateWorkspaceMutation } = useWorkspacesApi(organizationId);
    const createWorkspace = useCreateWorkspaceMutation();

    const handleOnChange = (name: string) => {
        setWorkspaceName(name);
    };

    const handleConfirm = (event: FormEvent) => {
        event.preventDefault();
        const newName = trimmedWorkspaceName;

        if (workspaceNameValidationError) {
            return;
        }

        createWorkspace.mutate(
            { name: newName },
            {
                onSuccess: () => {
                    triggerState.close();
                    setWorkspaceName('');
                },
                onError: () => {
                    throw new Error('Failed to create workspace. Please try again.');
                },
            }
        );
    };

    return (
        <DialogContainer onDismiss={triggerState.close}>
            {triggerState.isOpen && (
                <Dialog size='S'>
                    <Heading>
                        <Flex alignItems='center' gap='size-100'>
                            <Text>Create a new workspace</Text>
                        </Flex>
                    </Heading>
                    <Divider />
                    <Content>
                        <Form onSubmit={handleConfirm}>
                            <TextField
                                id={`create-workspace-name`}
                                data-testid={`create-workspace-name`}
                                width={'100%'}
                                value={workspaceName}
                                onChange={handleOnChange}
                                label={'Workspace name'}
                                validationState={workspaceNameValidationError ? 'invalid' : undefined}
                                errorMessage={workspaceNameValidationError}
                                maxLength={nameLimitations?.maxLength}
                                minLength={nameLimitations?.minLength}
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <ButtonGroup align={'end'} marginTop={'size-325'}>
                                <Button variant='secondary' onPress={triggerState.close} id={`cancel-create-workspace`}>
                                    Cancel
                                </Button>
                                <Button
                                    variant='accent'
                                    isDisabled={isConfirmButtonDisabled}
                                    type='submit'
                                    id={`confirm-create-workspace`}
                                    data-testid={`confirm-create-workspace`}
                                    isPending={createWorkspace.isPending}
                                >
                                    Confirm
                                </Button>
                            </ButtonGroup>
                        </Form>
                    </Content>
                </Dialog>
            )}
        </DialogContainer>
    );
};
