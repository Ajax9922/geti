// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useQueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';

import { getMockedWorkspaceIdentifier } from '../../../test-utils/mocked-items-factory/mocked-identifiers';
import { getMockedJob } from '../../../test-utils/mocked-items-factory/mocked-jobs';
import { renderHookWithProviders } from '../../../test-utils/render-hook-with-providers';
import { JobState } from '../jobs.const';
import { Job } from '../jobs.interface';
import { useInvalidateBalanceOnNewJob } from './utils';

const getMockedResponse = (jobs: Job[]) => ({
    pages: [
        {
            nextPage: '',
            jobs,
            jobsCount: {
                numberOfRunningJobs: jobs.length,
                numberOfFinishedJobs: 0,
                numberOfScheduledJobs: 0,
                numberOfCancelledJobs: 0,
                numberOfFailedJobs: 0,
            },
        },
    ],
    pageParams: [undefined],
});

const workspaceIdentifier = getMockedWorkspaceIdentifier({ workspaceId: 'workspaceId' });

describe('Use jobs hook utils', () => {
    beforeAll(() => {
        jest.resetAllMocks();
    });

    it('Should not invalidate balance if feature flag is disabled', async () => {
        const queryClient = renderHookWithProviders(useQueryClient);
        queryClient.result.current.invalidateQueries = jest.fn();

        renderHookWithProviders(
            () => {
                return useInvalidateBalanceOnNewJob(
                    workspaceIdentifier,
                    getMockedResponse([getMockedJob({ cost: { leaseId: '123', requests: [], consumed: [] } })]),
                    { jobState: JobState.SCHEDULED }
                );
            },
            {
                providerProps: { featureFlags: { FEATURE_FLAG_CREDIT_SYSTEM: false } },
            }
        );

        await waitFor(() => {
            expect(queryClient.result.current.invalidateQueries).not.toHaveBeenCalled();
        });
    });

    it('Should invalidate balance if feature flag is enabled', async () => {
        let invalidateSpy: jest.SpyInstance | undefined;

        const { rerender } = renderHookWithProviders(
            ({ jobs }) => {
                const queryClient = useQueryClient();
                invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

                return useInvalidateBalanceOnNewJob(workspaceIdentifier, getMockedResponse(jobs), {});
            },
            {
                providerProps: { featureFlags: { FEATURE_FLAG_CREDIT_SYSTEM: true } },
                initialProps: {
                    jobs: [
                        getMockedJob({
                            state: JobState.SCHEDULED,
                            cost: { leaseId: '123', requests: [], consumed: [] },
                        }),
                    ],
                },
            }
        );

        rerender({
            jobs: [
                getMockedJob({
                    state: JobState.SCHEDULED,
                    cost: { leaseId: '123', requests: [], consumed: [] },
                }),
                getMockedJob({
                    state: JobState.CANCELLED,
                    cost: { leaseId: '123', requests: [], consumed: [] },
                }),
            ],
        });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
        });
    });

    it('Should not invalidate balance if there are no jobs', async () => {
        const queryClient = renderHookWithProviders(useQueryClient);
        queryClient.result.current.invalidateQueries = jest.fn();

        renderHookWithProviders(
            () =>
                useInvalidateBalanceOnNewJob(workspaceIdentifier, getMockedResponse([]), {
                    jobState: JobState.SCHEDULED,
                }),
            { providerProps: { featureFlags: { FEATURE_FLAG_CREDIT_SYSTEM: true } } }
        );

        await waitFor(() => {
            expect(queryClient.result.current.invalidateQueries).not.toHaveBeenCalled();
        });
    });

    it('Should not invalidate balance if there are no jobs with cost', async () => {
        const queryClient = renderHookWithProviders(useQueryClient);
        queryClient.result.current.invalidateQueries = jest.fn();
        renderHookWithProviders(
            () =>
                useInvalidateBalanceOnNewJob(workspaceIdentifier, getMockedResponse([getMockedJob()]), {
                    jobState: JobState.SCHEDULED,
                }),
            { providerProps: { featureFlags: { FEATURE_FLAG_CREDIT_SYSTEM: true } } }
        );

        await waitFor(() => {
            expect(queryClient.result.current.invalidateQueries).not.toHaveBeenCalled();
        });
    });

    it('Should invalidate balance if there is a job with new id or a new job', async () => {
        let invalidateSpy: jest.SpyInstance | undefined;

        const { rerender } = renderHookWithProviders(
            ({ jobs }) => {
                const queryClient = useQueryClient();
                invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

                return useInvalidateBalanceOnNewJob(workspaceIdentifier, getMockedResponse(jobs), {
                    jobState: JobState.SCHEDULED,
                });
            },
            {
                providerProps: {
                    featureFlags: { FEATURE_FLAG_CREDIT_SYSTEM: true },
                },
                initialProps: {
                    jobs: [
                        getMockedJob({
                            state: JobState.SCHEDULED,
                            cost: { leaseId: '123', requests: [], consumed: [] },
                        }),
                    ],
                },
            }
        );

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledTimes(1);
        });

        rerender({
            jobs: [
                getMockedJob({
                    id: 'newId',
                    state: JobState.SCHEDULED,
                    cost: { leaseId: '123', requests: [], consumed: [] },
                }),
            ],
        });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledTimes(2);
        });

        rerender({
            jobs: [
                getMockedJob({
                    id: 'newId',
                    state: JobState.SCHEDULED,
                    cost: { leaseId: '123', requests: [], consumed: [] },
                }),
                getMockedJob({ state: JobState.SCHEDULED, cost: { leaseId: '123', requests: [], consumed: [] } }),
            ],
        });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledTimes(3);
        });
    });
});
