// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { ActionButton, Flex, Loading, Tooltip, TooltipTrigger } from '@geti/ui';
import { Add } from '@geti/ui/icons';

import { Dataset } from '../../../../core/projects/dataset.interface';
import { isAnomalyDomain } from '../../../../core/projects/domains';
import { TUTORIAL_CARD_KEYS } from '../../../../core/user-settings/dtos/user-settings.interface';
import { useDataset } from '../../../../providers/dataset-provider/dataset-provider.component';
import { ManagedTabs } from '../../../../shared/components/managed-tabs/managed-tabs.component';
import { TutorialCardBuilder } from '../../../../shared/components/tutorial-card/tutorial-card-builder.component';
import { useProject } from '../../providers/project-provider/project-provider.component';
import { DatasetTabPanel } from './dataset-tab-panel.component';
import { ExportDatasetDialog } from './export-dataset/export-dataset-dialog.component';
import { useExportImportDatasetDialogStates } from './export-dataset/export-import-dataset-dialog-provider.component';
import { ProjectDatasetTabActions } from './project-dataset-tab-actions.component';
import { MAX_NUMBER_OF_DISPLAYED_DATASETS } from './utils';

import classes from './project-dataset.module.scss';

/*
    We display MAX_NUMBER_OF_DISPLAYED_DATASETS tabs and once we have more datasets
    we populate the picker with the extra datasets.
    So basically if the user adds MAX_NUMBER_OF_DISPLAYED_DATASETS datasets, we display all in tabs.
    But if the user adds one more, we will show MAX_NUMBER_OF_DISPLAYED_DATASETS dataset tabs and move the extra
    datasets to the Picker. The new dataset is placed at the end of pinned datasets.
*/
export const ProjectDataset = () => {
    const { isSingleDomainProject } = useProject();
    const {
        handleSelectDataset,
        selectedDataset,
        createDataset,
        handleCreateDataset,
        pinnedDatasets,
        collapsedDatasets,
    } = useDataset();
    const { exportDialogState } = useExportImportDatasetDialogStates();

    const isAnomalyProject = isSingleDomainProject(isAnomalyDomain);
    const allDatasets = [...pinnedDatasets, ...collapsedDatasets];

    return (
        <Flex direction={'column'} UNSAFE_className={classes.componentWrapper} height={'100%'}>
            {isAnomalyProject && (
                <TutorialCardBuilder
                    cardKey={TUTORIAL_CARD_KEYS.ANOMALY_TUTORIAL}
                    styles={{ fontSize: 'var(--spectrum-global-dimension-font-size-350)' }}
                />
            )}
            <ManagedTabs<Dataset>
                items={allDatasets}
                selectedKey={selectedDataset.id}
                onSelectionChange={(key) => handleSelectDataset(String(key))}
                renderTabItem={(dataset) => <ProjectDatasetTabActions dataset={dataset} />}
                renderTabPanel={(dataset) => <DatasetTabPanel dataset={dataset} />}
                addButton={
                    <TooltipTrigger placement='bottom'>
                        <ActionButton
                            isQuiet
                            id={'create-dataset-button-id'}
                            onPress={handleCreateDataset}
                            isDisabled={createDataset.isPending}
                            aria-label={'Create dataset'}
                        >
                            {createDataset.isPending ? <Loading mode='inline' size='S' /> : <Add />}
                        </ActionButton>
                        <Tooltip>Create new testing set</Tooltip>
                    </TooltipTrigger>
                }
                overflow={{
                    maxVisibleTabs: MAX_NUMBER_OF_DISPLAYED_DATASETS,
                    pickerAriaLabel: 'Collapsed datasets',
                    onCollapsedItemSelect: handleSelectDataset,
                }}
                ariaLabel={'Dataset page tabs'}
            />
            <ExportDatasetDialog triggerState={exportDialogState} datasetName={selectedDataset.name} />
        </Flex>
    );
};
