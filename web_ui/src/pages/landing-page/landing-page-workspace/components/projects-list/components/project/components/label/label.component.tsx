// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex, TruncatedTextWithTooltip, View } from '@geti/ui';
import { idMatchingFormat } from '@geti/ui/utils';

import { Label as LabelInterface } from '../../../../../../../../../core/labels/label.interface';
import { LabelColorThumb } from '../../../../../../../../../shared/components/label-color-thumb/label-color-thumb.component';

export const Label = ({ label, projectName }: { label: LabelInterface; projectName: string }) => {
    return (
        <Flex direction={'row'} alignItems={'center'}>
            <View marginX={'size-100'}>
                <LabelColorThumb
                    id={`project-labels-${idMatchingFormat(projectName)}-${idMatchingFormat(label.name)}-color-thumb`}
                    label={label}
                />
            </View>
            <Flex>
                <TruncatedTextWithTooltip
                    id={`project-labels-${idMatchingFormat(projectName)}-label-${idMatchingFormat(label.name)}`}
                    maxWidth={'size-2400'}
                >
                    {label.name}
                </TruncatedTextWithTooltip>
            </Flex>
        </Flex>
    );
};
