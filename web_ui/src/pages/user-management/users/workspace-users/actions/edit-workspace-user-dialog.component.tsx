// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { FormEvent, useState } from 'react';

import { useFeatureFlags } from '@geti/core/src/feature-flags/hooks/use-feature-flags.hook';
import { useUsers } from '@geti/core/src/users/hook/use-users.hook';
import { getRoleCreationPayload, getRoleDeletionPayload } from '@geti/core/src/users/services/utils';
import { isOrganizationAdmin } from '@geti/core/src/users/user-role-utils';
import { RESOURCE_TYPE, User, USER_ROLE, WorkspaceRole } from '@geti/core/src/users/users.interface';
import { WorkspaceIdentifier } from '@geti/core/src/workspaces/services/workspaces.interface';
import { Button, ButtonGroup, Content, Dialog, Divider, Form, Heading } from '@geti/ui';
import { isEqual } from 'lodash-es';

import { useWorkspaces } from '../../../../../providers/workspaces-provider/workspaces-provider.component';
import { RolePicker } from '../../old-project-users/role-picker.component';
import { getAvailableWorkspaceRoles } from './roles-validation';
import { UserSummary } from './user-summary.component';
import { mapRolesToWorkspaceRoles } from './workspace-roles/utils';

import classes from './edit-user-dialog.module.scss';

interface EditWorkspaceUserDialogProps extends Omit<WorkspaceIdentifier, 'workspaceId'> {
    user: User;
    activeUser: User;
    users: User[];
    isSaasEnvironment: boolean; // kept for API consistency (unused after trimming)
    closeDialog: () => void;
    workspaceId: WorkspaceIdentifier['workspaceId'];
}

export const EditWorkspaceUserDialog = ({
    organizationId,
    workspaceId,
    user,
    activeUser,
    closeDialog,
    isSaasEnvironment: _isSaasEnvironment,
    users,
}: EditWorkspaceUserDialogProps) => {
    const { workspaces } = useWorkspaces();
    const isOrgAdmin = isOrganizationAdmin(activeUser, organizationId);
    const { useUpdateUserRoles } = useUsers();
    const updateRoles = useUpdateUserRoles();
    useFeatureFlags();
    const [workspaceRoles, setWorkspaceRoles] = useState<WorkspaceRole[]>(() =>
        mapRolesToWorkspaceRoles(user.roles, workspaces).filter((wr) => wr.workspace.id === workspaceId)
    );

    const rolesOptions = getAvailableWorkspaceRoles({
        activeMember: activeUser,
        targetMember: user,
        members: users,
        workspaceId,
        organizationId,
    });

    const areRolesEqual = isEqual(
        workspaceRoles,
        mapRolesToWorkspaceRoles(user.roles, workspaces).filter((wr) => wr.workspace.id === workspaceId)
    );
    const isSaveButtonDisabled = areRolesEqual;

    const changeRoleHandler = (role: WorkspaceRole['role']) => {
        const targetWorkspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
        setWorkspaceRoles([
            {
                role,
                workspace: targetWorkspace,
            },
        ]);
    };

    const updateUserRoles = async () => {
        const editableIds = isOrgAdmin
            ? workspaces.map((w) => w.id)
            : activeUser.roles
                  .filter(({ resourceType, role }) =>
                      resourceType === RESOURCE_TYPE.WORKSPACE ? role === USER_ROLE.WORKSPACE_ADMIN : false
                  )
                  .map(({ resourceId }) => resourceId);

        const editedRoles = workspaceRoles
            .filter((wr) => editableIds.includes(wr.workspace.id))
            .map((role) => ({
                role: role.role,
                resourceId: role.workspace.id,
                resourceType: RESOURCE_TYPE.WORKSPACE,
            }));

        const oldRoles = user.roles
            .filter(
                ({ resourceType, resourceId }) =>
                    resourceType === RESOURCE_TYPE.WORKSPACE && editableIds.includes(resourceId)
            )
            .map((role) => getRoleDeletionPayload(role));
        const roles = editedRoles.map((role) => getRoleCreationPayload(role));

        if (oldRoles.length === 0 && roles.length === 0) return;

        return updateRoles.mutateAsync({ newRoles: [...oldRoles, ...roles], userId: user.id, organizationId });
    };

    const handleOnSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!areRolesEqual) {
            await updateUserRoles();
        }
        closeDialog();
    };

    return (
        <Dialog minHeight='size-3600' isDismissable>
            <Heading id='edit-user-title' UNSAFE_className={classes.editUserTitle}>
                Edit user
            </Heading>
            <Divider />
            <Content>
                <UserSummary user={user} />
                <Form onSubmit={handleOnSubmit}>
                    <RolePicker
                        roles={rolesOptions}
                        selectedRole={workspaceRoles[0]?.role}
                        setSelectedRole={changeRoleHandler}
                        isDisabled={rolesOptions.length === 0}
                    />
                    <ButtonGroup align={'end'} marginTop={'size-350'}>
                        <Button variant='secondary' onPress={closeDialog} id={'cancel-edit-user'}>
                            Cancel
                        </Button>
                        <Button
                            id={'save-edit-user'}
                            variant='accent'
                            type={'submit'}
                            isPending={updateRoles.isPending}
                            isDisabled={isSaveButtonDisabled}
                        >
                            Save
                        </Button>
                    </ButtonGroup>
                </Form>
            </Content>
        </Dialog>
    );
};
