// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useFeatureFlags } from '@geti/core/src/feature-flags/hooks/use-feature-flags.hook';
import { useActiveUser } from '@geti/core/src/users/hook/use-users.hook';
import { isOrganizationAdmin } from '@geti/core/src/users/user-role-utils';
import { RESOURCE_TYPE } from '@geti/core/src/users/users.interface';
import { useWorkspacesApi } from '@geti/core/src/workspaces/hooks/use-workspaces.hook';
import { WorkspaceEntity } from '@geti/core/src/workspaces/services/workspaces.interface';
import { ActionButton, Loading, Tooltip, TooltipTrigger } from '@geti/ui';
import { Add } from '@geti/ui/icons';
import { useOverlayTriggerState } from 'react-stately';

import { useOrganizationIdentifier } from '../../../hooks/use-organization-identifier/use-organization-identifier.hook';
import { CustomTabItem } from '../../../shared/components/custom-tab-item/custom-tab-item.component';
import { HasPermission } from '../../../shared/components/has-permission/has-permission.component';
import { OPERATION } from '../../../shared/components/has-permission/has-permission.interface';
import { ManagedTabs } from '../../../shared/components/managed-tabs/managed-tabs.component';
import { CreateWorkspaceDialog } from '../../user-management/workspaces/create-workspace-dialog/create-workspace-dialog.component';
import { LandingPageWorkspace as Workspace } from '../landing-page-workspace/landing-page-workspace.component';
import { NoPermissionPlaceholder } from './components/no-permission-placeholder.component';
import { CustomTabItemWithMenu } from './custom-tab-item-with-menu.component';
import { useWorkspacesTabs } from './hooks/use-pinned-collapsed-workspace.hook';

const WorkspaceTabItem = ({ workspace }: { workspace: WorkspaceEntity }) => {
    const { organizationId } = useOrganizationIdentifier();
    const { data: activeUser } = useActiveUser(organizationId);
    const { workspaces, selectWorkspace, selectedWorkspaceId } = useWorkspacesTabs();
    const { FEATURE_FLAG_WORKSPACE_ACTIONS } = useFeatureFlags();

    const isSelected = workspace.id === selectedWorkspaceId;

    if (isSelected && FEATURE_FLAG_WORKSPACE_ACTIONS) {
        return (
            <HasPermission
                operations={[OPERATION.WORKSPACE_MANAGEMENT]}
                resources={[{ type: RESOURCE_TYPE.WORKSPACE, id: workspace.id }]}
                specialCondition={activeUser !== undefined && isOrganizationAdmin(activeUser, organizationId)}
                Fallback={<CustomTabItem name={workspace.name} isMoreIconVisible={false} />}
            >
                <CustomTabItemWithMenu
                    workspace={workspace}
                    isMoreIconVisible={true}
                    workspaces={workspaces}
                    selectWorkspace={selectWorkspace}
                />
            </HasPermission>
        );
    }

    return <CustomTabItem name={workspace.name} isMoreIconVisible={false} />;
};

export const WorkspacesTabs = () => {
    const { organizationId } = useOrganizationIdentifier();
    const { workspaces, selectedWorkspaceId, handleSelectWorkspace } = useWorkspacesTabs();
    const { FEATURE_FLAG_WORKSPACE_ACTIONS } = useFeatureFlags();
    const createWorkspaceDialogState = useOverlayTriggerState({});

    const { useCreateWorkspaceMutation } = useWorkspacesApi(organizationId);
    const createWorkspace = useCreateWorkspaceMutation();
    const workspacesNames = workspaces.map((workspace) => workspace.name);

    return (
        <>
            <ManagedTabs<WorkspaceEntity>
                id='page-layout-id'
                items={workspaces}
                selectedKey={selectedWorkspaceId}
                onSelectionChange={handleSelectWorkspace}
                renderTabItem={(workspace) => <WorkspaceTabItem workspace={workspace} />}
                addButton={
                    FEATURE_FLAG_WORKSPACE_ACTIONS ? (
                        <TooltipTrigger placement='bottom'>
                            <ActionButton
                                isQuiet
                                id={'create-new-workspace-id'}
                                onPress={createWorkspaceDialogState.open}
                                isDisabled={createWorkspace.isPending}
                                aria-label={'Create new workspace'}
                            >
                                {createWorkspace.isPending ? <Loading mode='inline' size='S' /> : <Add />}
                            </ActionButton>
                            <Tooltip>Create a new workspace</Tooltip>
                        </TooltipTrigger>
                    ) : undefined
                }
                ariaLabel={'Workspaces tabs'}
            >
                <HasPermission
                    operations={[OPERATION.CAN_SEE_WORKSPACE]}
                    specialCondition={!FEATURE_FLAG_WORKSPACE_ACTIONS || undefined}
                    Fallback={<NoPermissionPlaceholder />}
                >
                    <Workspace />
                </HasPermission>
            </ManagedTabs>
            <CreateWorkspaceDialog
                triggerState={createWorkspaceDialogState}
                names={workspacesNames}
                nameLimitations={{ maxLength: 64, minLength: 1 }}
            />
        </>
    );
};
