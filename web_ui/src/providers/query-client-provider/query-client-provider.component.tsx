// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';

import { getErrorMessage } from '@geti/core/src/services/utils';
import {
    DefaultOptions,
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { isAxiosError } from 'axios';

import { NOTIFICATION_TYPE } from '../../notification/notification-toast/notification-type.enum';
import { AddNotificationProps, useNotification } from '../../notification/notification.component';

export const createGetiQueryClient = ({
    defaultQueryOptions,
    addNotification,
}: {
    defaultQueryOptions?: DefaultOptions;
    addNotification: (props: AddNotificationProps) => string;
}): QueryClient => {
    const notify = { current: addNotification };

    const queryCache = new QueryCache({
        onError: (error, query) => {
            if (isAxiosError(error) && query.meta && 'notifyOnError' in query.meta) {
                const message = query.meta.errorMessage;
                if (query.meta.notifyOnError === true) {
                    notify.current({
                        message: typeof message === 'string' ? message : getErrorMessage(error),
                        type: NOTIFICATION_TYPE.ERROR,
                    });
                }
            }

            if (query.meta && 'disableGlobalErrorHandling' in query.meta) {
                if (query.meta.disableGlobalErrorHandling === true) {
                    return;
                }
            }
        },
    });

    const mutationCache = new MutationCache({
        onError: (error) => {
            // TODO: If we decide to add an "opt-out" mechanism we can use the same logic
            // as query cache and use the `meta` field
            if (isAxiosError(error)) {
                const message = error.message;
                notify.current({
                    message: typeof message === 'string' ? message : getErrorMessage(error),
                    type: NOTIFICATION_TYPE.ERROR,
                });
            }
        },
    });

    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
            },
            ...defaultQueryOptions,
        },
        queryCache,
        mutationCache,
    });
};

declare module '@tanstack/react-query' {
    interface Register {
        queryMeta: {
            notifyOnError?: boolean;
            errorMessage?: string;
            disableGlobalErrorHandling?: boolean;
        };
        mutationMeta: {
            notifyOnError?: boolean;
        };
    }
}

export const QueryClientProvider = ({
    children,
    defaultQueryOptions,
    customQueryClient,
}: {
    children: ReactNode;
    defaultQueryOptions?: DefaultOptions;
    customQueryClient?: QueryClient;
}) => {
    const { addNotification } = useNotification();

    // We want to make sure that query cache always uses the latest notification handler,
    // but we don't want to reset the cache every time this happens so we keep a ref instead
    const notify = useRef(addNotification);
    useLayoutEffect(() => {
        notify.current = addNotification;
    }, [addNotification]);

    const queryClient = useMemo(() => {
        if (customQueryClient) {
            return customQueryClient;
        }

        return createGetiQueryClient({ addNotification, defaultQueryOptions });
    }, [addNotification, customQueryClient, defaultQueryOptions]);

    return (
        <TanstackQueryClientProvider client={queryClient}>
            {children}

            {process.env.REACT_APP_REACT_QUERY_TOOL === 'true' && <ReactQueryDevtools initialIsOpen={false} />}
        </TanstackQueryClientProvider>
    );
};
