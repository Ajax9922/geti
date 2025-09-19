// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

// Simplified Users tab: single organization-wide users view (no inner tabs or workspace selector)
import { RESOURCE_TYPE, User } from '@geti/core/src/users/users.interface';
import { Flex } from '@geti/ui';

import { Users } from './users.component';
import { OrganizationUserActions } from './actions/organization-user-actions.component';

interface UsersTabProps {
    activeUser: User | undefined;
}

export const UsersTab = ({ activeUser }: UsersTabProps) => {
    if (!activeUser) return <></>;

    return (
        <Flex direction={'column'} height={'100%'}>
            <Users activeUser={activeUser} resourceType={[RESOURCE_TYPE.ORGANIZATION, RESOURCE_TYPE.WORKSPACE]} resourceId={undefined} UserActions={OrganizationUserActions}/>
        </Flex>
    );
};
