// Copyright (C) 2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Key, useMemo } from 'react';

import { WorkspaceEntity } from '@geti/core/src/workspaces/services/workspaces.interface';
import { ActionButton, Flex, Item, Loading, TabList, TabPanels, Tabs, Tooltip, TooltipTrigger } from '@geti/ui';
import { Add } from '@geti/ui/icons';

import { useOrganizationIdentifier } from '../../../hooks/use-organization-identifier/use-organization-identifier.hook';
import { useProjectActions } from '../../../core/projects/hooks/use-project-actions.hook';
import { HasPermission } from '../../../shared/components/has-permission/has-permission.component';
import { OPERATION } from '../../../shared/components/has-permission/has-permission.interface';
import { ActionMenu } from '../../../shared/components/action-menu/action-menu.component';
import { useWorkspaceActions } from '../../landing-page/workspaces-tabs/hooks/use-workspace-actions.hook';
import { WorkspaceMenuActions } from '../../landing-page/workspaces-tabs/utils';
import { WorkspaceDeleteDialog } from '../../landing-page/workspaces-tabs/components/workspace-delete-dialog.component';
import { EditNameDialog } from '../../../shared/components/edit-name-dialog/edit-name-dialog.component';
import { getUniqueNameFromArray } from '../../../shared/utils';
import { useWorkspacesApi } from '@geti/core/src/workspaces/hooks/use-workspaces.hook';

interface WorkspaceUsersToolbarProps {
    workspaces: WorkspaceEntity[];
    selectedWorkspaceId: string | undefined;
    onSelectWorkspace: (id: string) => void;
}

export const WorkspaceUsersToolbar = ({
    workspaces,
    selectedWorkspaceId,
    onSelectWorkspace,
}: WorkspaceUsersToolbarProps) => {
    const { organizationId } = useOrganizationIdentifier();
    const { useCreateWorkspaceMutation } = useWorkspacesApi(organizationId);
    const createWorkspace = useCreateWorkspaceMutation();

    const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);

    // Query projects to know if workspace empty (for delete enablement)
    const { useGetProjectNames } = useProjectActions();
    const projectsQuery = selectedWorkspaceId
        ? useGetProjectNames({ organizationId, workspaceId: selectedWorkspaceId })
        : undefined;
    const isWorkspaceEmpty = projectsQuery?.data?.projects.length === 0;

    const { items, handleMenuAction, deleteDialog, editDialog, grayedOutKeys, disabledKeys } = useWorkspaceActions(
        workspaces.length,
        isWorkspaceEmpty ?? false,
        selectedWorkspaceId
    );

    const actionItems = items.map((i) => ({ id: i, name: i }));

    const tabItems = useMemo(
        () => workspaces.map((w) => ({ key: w.id, name: w.name })),
        [workspaces]
    );

    const handleSelection = (key: Key) => {
        onSelectWorkspace(key.toString());
    };

    const handleCreateWorkspace = () => {
        const unique = getUniqueNameFromArray(
            workspaces.map((w) => w.name),
            'Workspace '
        );
        createWorkspace.mutate({ name: unique });
    };

    return (
        <Flex direction={'column'} gap={'size-150'}>
            <Tabs
                selectedKey={selectedWorkspaceId}
                onSelectionChange={handleSelection}
                aria-label={'Workspace tabs'}
                items={tabItems}
            >
                <Flex alignItems={'center'} gap={'size-200'}>
                    <TabList>
                        {(item: { key: string; name: string }) => <Item key={item.key}>{item.name}</Item>}
                    </TabList>
                    <HasPermission operations={[OPERATION.WORKSPACE_CREATION]}>
                        <TooltipTrigger placement={'bottom'}>
                            <ActionButton
                                isQuiet
                                aria-label={'Create workspace'}
                                id={'create-workspace-toolbar-btn'}
                                onPress={handleCreateWorkspace}
                                isDisabled={createWorkspace.isPending}
                            >
                                {createWorkspace.isPending ? <Loading mode='inline' size={'S'} /> : <Add />}
                            </ActionButton>
                            <Tooltip>Create workspace</Tooltip>
                        </TooltipTrigger>
                    </HasPermission>
                    {selectedWorkspace && actionItems.length > 0 && (
                        <HasPermission
                            operations={[OPERATION.WORKSPACE_MANAGEMENT]}
                            resources={[{ type: 'WORKSPACE', id: selectedWorkspace.id }] as any}
                        >
                            <ActionMenu<WorkspaceMenuActions>
                                id={`${selectedWorkspace.id}-workspace-actions-menu`}
                                items={actionItems}
                                onAction={handleMenuAction}
                                grayedOutKeys={grayedOutKeys}
                                disabledKeys={disabledKeys}
                            />
                        </HasPermission>
                    )}
                </Flex>
                <TabPanels>
                    {(item: { key: string }) => (
                        <Item key={item.key}>
                            {/* Placeholder panel content: actual workspace users content rendered outside Tabs. */}
                            <div aria-hidden={'true'} style={{ display: 'none' }} />
                        </Item>
                    )}
                </TabPanels>
            </Tabs>
            {/* Dialogs for selected workspace */}
            {selectedWorkspace && deleteDialog.deleteWorkspaceDialogState.isOpen && (
                <WorkspaceDeleteDialog
                    name={selectedWorkspace.name}
                    onAction={() => {
                        deleteDialog.deleteWorkspaceMutation.mutate(
                            { id: selectedWorkspace.id },
                            { onSuccess: () => deleteDialog.deleteWorkspaceDialogState.close() }
                        );
                    }}
                    triggerState={deleteDialog.deleteWorkspaceDialogState}
                    isWorkspaceEmpty={isWorkspaceEmpty ?? false}
                />
            )}
            {selectedWorkspace && editDialog.editWorkspaceDialogState.isOpen && (
                <EditNameDialog
                    isLoading={editDialog.editWorkspaceMutation.isPending}
                    triggerState={editDialog.editWorkspaceDialogState}
                    onAction={(newName) =>
                        editDialog.editWorkspaceMutation.mutate(
                            { ...selectedWorkspace, name: newName },
                            { onSuccess: () => editDialog.editWorkspaceDialogState.close() }
                        )
                    }
                    defaultName={selectedWorkspace.name}
                    names={workspaces.map((w) => w.name).filter((n) => n !== selectedWorkspace.name)}
                    title={'workspace name'}
                    nameLimitations={{ maxLength: 64, minLength: 1 }}
                />
            )}
        </Flex>
    );
};
