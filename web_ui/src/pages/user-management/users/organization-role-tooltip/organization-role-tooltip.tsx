// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Text, View } from '@geti/ui';

export const OrganizationRoleTooltipContent = () => (
    <View width={350} maxWidth={720}>
        <Text>
            Organization admin has full view, access, and edit rights (can manage all workspaces and all projects
            created by themselves or others). Org admins are the only users who can add new users to the org. Org admins
            can assign other users as org admin as well, with the same permissions. Org admin accounts can only be
            deleted if there is another org admin user.
        </Text>
        <Text marginTop={'size-150'}>
            Organization contributor can be workspace admin or workspace contributor. They can&apos;t create workspaces
            themselves. View, access and edit rights depend on their workspace role.
        </Text>
    </View>
);
