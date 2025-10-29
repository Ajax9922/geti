// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import * as yup from 'yup';

export const MIN_LENGTH_OF_WORKSPACE_NAME = 1;
export const MAX_LENGTH_OF_WORKSPACE_NAME = 50;

export const WORKSPACE_NAME_REQUIRED_VALIDATION_MESSAGE = 'Workspace name cannot be empty';
export const WORKSPACE_NAME_UNIQUE_VALIDATION_MESSAGE = 'Workspace name must be unique';

export enum WorkspaceNameErrorPath {
    NAME = 'name',
}

export const workspaceNameSchema = (existingNames: string[] = []): yup.Schema<{ name: string }> => {
    const normalizedExistingNames = existingNames.map((name) => name.trim().toLocaleLowerCase());

    return yup.object({
        name: yup
            .string()
            .trim()
            .required(WORKSPACE_NAME_REQUIRED_VALIDATION_MESSAGE)
            .test('unique', WORKSPACE_NAME_UNIQUE_VALIDATION_MESSAGE, (value?: string | null) => {
                if (!value) {
                    return true;
                }

                return !normalizedExistingNames.includes(value.trim().toLocaleLowerCase());
            }),
    });
};
