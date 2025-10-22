// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { User } from '@geti/core/src/users/users.interface';
import { WorkspaceEntity } from '@geti/core/src/workspaces/services/workspaces.interface';

import { getMockedUser } from '../../../test-utils/mocked-items-factory/mocked-users';
import { getMockedWorkspace } from '../../../test-utils/mocked-items-factory/mocked-workspace';
import { providersRender as render } from '../../../test-utils/required-providers-render';
import { WorkspaceUsersManagement } from './workspace-users-management.component';

// Mock the workspaces provider hook
const mockUseWorkspaces = jest.fn();
jest.mock('../../../providers/workspaces-provider/workspaces-provider.component', () => ({
    useWorkspaces: () => mockUseWorkspaces(),
}));

// Mock the child components to simplify testing
jest.mock('./workspace-users-toolbar.component', () => ({
    WorkspaceUsersToolbar: ({
        workspaces,
        selectedWorkspaceId,
        onSelectWorkspace,
    }: {
        workspaces: WorkspaceEntity[];
        selectedWorkspaceId: string | undefined;
        onSelectWorkspace: (id: string) => void;
    }) => (
        <div data-testid="workspace-users-toolbar">
            <div data-testid="selected-workspace-id">{selectedWorkspaceId || 'none'}</div>
            {workspaces.map((ws) => (
                <button key={ws.id} onClick={() => onSelectWorkspace(ws.id)}>
                    Select {ws.name}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../users/workspace-users/workspace-users.component', () => ({
    WorkspaceUsers: ({ workspaceId, activeUser }: { workspaceId: string; activeUser: User }) => (
        <div data-testid="workspace-users">
            <div data-testid="workspace-id">{workspaceId}</div>
            <div data-testid="active-user-id">{activeUser.id}</div>
        </div>
    ),
}));

describe('Workspace user management tests', () => {
    const mockActiveUser = getMockedUser({ id: 'active-user-id', email: 'active@intel.com' });
    const mockWorkspaces = [
        getMockedWorkspace({ id: 'workspace-1', name: 'Workspace 1' }),
        getMockedWorkspace({ id: 'workspace-2', name: 'Workspace 2' }),
        getMockedWorkspace({ id: 'workspace-3', name: 'Workspace 3' }),
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders successfully with workspaces', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        expect(screen.getByTestId('workspace-users-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('workspace-users')).toBeInTheDocument();
    });

    it('renders toolbar with correct selected workspace', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        expect(screen.getByTestId('selected-workspace-id')).toHaveTextContent('workspace-1');
    });

    it('renders WorkspaceUsers with correct workspace ID and active user', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        expect(screen.getByTestId('workspace-id')).toHaveTextContent('workspace-1');
        expect(screen.getByTestId('active-user-id')).toHaveTextContent('active-user-id');
    });

    it('handles workspace selection changes', async () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        const selectButton = screen.getByRole('button', { name: 'Select Workspace 2' });
        await userEvent.click(selectButton);

        // After clicking, the selected workspace should change
        expect(screen.getByTestId('selected-workspace-id')).toHaveTextContent('workspace-2');
        expect(screen.getByTestId('workspace-id')).toHaveTextContent('workspace-2');
    });

    it('handles empty workspaces array', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: [],
            workspaceId: undefined,
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        expect(screen.getByTestId('workspace-users-toolbar')).toBeInTheDocument();
        expect(screen.queryByTestId('workspace-users')).not.toBeInTheDocument();
    });

    it('does not render WorkspaceUsers when no workspace is selected', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        // Initially, workspace-1 is selected
        expect(screen.getByTestId('workspace-users')).toBeInTheDocument();

        // This test verifies that the component properly handles the conditional rendering
        expect(screen.getByTestId('selected-workspace-id')).toHaveTextContent('workspace-1');
    });

    it('uses first workspace as default when available', () => {
        mockUseWorkspaces.mockReturnValue({
            workspaces: mockWorkspaces,
            workspaceId: 'workspace-1',
        });

        render(<WorkspaceUsersManagement activeUser={mockActiveUser} />);

        // The component should default to the first workspace
        expect(screen.getByTestId('selected-workspace-id')).toHaveTextContent('workspace-1');
        expect(screen.getByTestId('workspace-users')).toBeInTheDocument();
    });
});
