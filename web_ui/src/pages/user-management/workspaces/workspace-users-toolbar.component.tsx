// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useFeatureFlags } from '@geti/core/src/feature-flags/hooks/use-feature-flags.hook';
import { useActiveUser } from '@geti/core/src/users/hook/use-users.hook';
import { isOrganizationAdmin } from '@geti/core/src/users/user-role-utils';
import { RESOURCE_TYPE } from '@geti/core/src/users/users.interface';
import { useWorkspacesApi } from '@geti/core/src/workspaces/hooks/use-workspaces.hook';
import { WorkspaceEntity } from '@geti/core/src/workspaces/services/workspaces.interface';
import { ActionButton, Flex, Loading, Tooltip, TooltipTrigger } from '@geti/ui';
import { Add } from '@geti/ui/icons';
import { useOverlayTriggerState } from 'react-stately';

import { useOrganizationIdentifier } from '../../../hooks/use-organization-identifier/use-organization-identifier.hook';
import { CustomTabItem } from '../../../shared/components/custom-tab-item/custom-tab-item.component';
import { EditNameDialog } from '../../../shared/components/edit-name-dialog/edit-name-dialog.component';
import { HasPermission } from '../../../shared/components/has-permission/has-permission.component';
import { OPERATION } from '../../../shared/components/has-permission/has-permission.interface';
import { ManagedTabs } from '../../../shared/components/managed-tabs/managed-tabs.component';
import { WorkspaceDeleteDialog } from '../../landing-page/workspaces-tabs/components/workspace-delete-dialog.component';
import { CustomTabItemWithMenu } from '../../landing-page/workspaces-tabs/custom-tab-item-with-menu.component';
import { useWorkspaceActions } from '../../landing-page/workspaces-tabs/hooks/use-workspace-actions.hook';
import { CreateWorkspaceDialog } from './create-workspace-dialog/create-workspace-dialog.component';

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
    const createWorkspaceDialogState = useOverlayTriggerState({});
    const { organizationId } = useOrganizationIdentifier();
    const { data: activeUser } = useActiveUser(organizationId);
    const { useCreateWorkspaceMutation } = useWorkspacesApi(organizationId);
    const createWorkspace = useCreateWorkspaceMutation();

    const { FEATURE_FLAG_WORKSPACE_ACTIONS } = useFeatureFlags();

    const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);

    const { deleteDialog, editDialog } = useWorkspaceActions(workspaces.length, selectedWorkspaceId);

    const workspacesNames = workspaces.map((workspace) => workspace.name);

    return (
        <Flex direction={'column'} gap={'size-150'}>
            <ManagedTabs<WorkspaceEntity>
                items={workspaces}
                selectedKey={selectedWorkspaceId || ''}
                onSelectionChange={(key) => onSelectWorkspace(String(key))}
                renderTabItem={(workspace) => {
                    const isSelected = workspace.id === selectedWorkspaceId;

                    if (isSelected && FEATURE_FLAG_WORKSPACE_ACTIONS) {
                        return (
                            <HasPermission
                                operations={[OPERATION.WORKSPACE_MANAGEMENT]}
                                resources={[{ type: RESOURCE_TYPE.WORKSPACE, id: workspace.id }]}
                                specialCondition={
                                    activeUser !== undefined && isOrganizationAdmin(activeUser, organizationId)
                                }
                                Fallback={<CustomTabItem name={workspace.name} isMoreIconVisible={false} />}
                            >
                                <CustomTabItemWithMenu
                                    workspace={workspace}
                                    isMoreIconVisible={true}
                                    workspaces={workspaces}
                                    selectWorkspace={onSelectWorkspace}
                                />
                            </HasPermission>
                        );
                    }

                    return <CustomTabItem isMoreIconVisible={false} name={workspace.name} />;
                }}
                addButton={
                    FEATURE_FLAG_WORKSPACE_ACTIONS ? (
                        <TooltipTrigger placement='bottom'>
                            <ActionButton
                                isQuiet
                                id={'create-workspace-toolbar-btn'}
                                onPress={createWorkspaceDialogState.open}
                                isDisabled={createWorkspace.isPending}
                                aria-label={'Create workspace'}
                            >
                                {createWorkspace.isPending ? <Loading mode='inline' size='S' /> : <Add />}
                            </ActionButton>
                            <Tooltip>Create workspace</Tooltip>
                        </TooltipTrigger>
                    ) : undefined
                }
                ariaLabel={'Workspace tabs'}
            />
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
                    workspaceId={selectedWorkspace.id}
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
            <CreateWorkspaceDialog
                triggerState={createWorkspaceDialogState}
                names={workspacesNames}
                nameLimitations={{ maxLength: 64, minLength: 1 }}
            />
        </Flex>
    );
};
