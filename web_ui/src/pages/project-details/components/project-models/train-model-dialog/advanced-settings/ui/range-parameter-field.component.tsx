// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { FC, useEffect, useState } from 'react';

import { Flex, NumberField, RangeSlider, RangeValue } from '@geti/ui';

import { ArrayParameter } from '../../../../../../../core/configurable-parameters/services/configuration.interface';
import { getFloatingPointStep } from '../utils';

type RangeParameterFieldProps = Pick<ArrayParameter, 'type' | 'value' | 'name' | 'defaultValue'> & {
    onChange: (value: number[]) => void;
    isDisabled?: boolean;
    step?: number;
};

const getStep = ({ step, maxValue, minValue }: { step?: number; minValue: number; maxValue: number }): number => {
    if (step !== undefined) {
        return step;
    }

    const abc = getFloatingPointStep(minValue, maxValue);
    if (isNaN(abc)) {
        return 1;
    }
    return abc;
};

export const RangeParameterField: FC<RangeParameterFieldProps> = ({
    defaultValue,
    value,
    onChange,
    isDisabled,
    name,
    step,
}) => {
    const [parameterValue, setParameterValue] = useState<RangeValue<number>>({
        start: value[0],
        end: value[1],
    });

    const fieldStep = getStep({ step, maxValue: value[1], minValue: value[0] });

    const handleRangeChange = (inputValue: RangeValue<number>): void => {
        setParameterValue(inputValue);
        onChange([inputValue.start, inputValue.end]);
    };

    const handleNumberChange = (start: number, end: number): void => {
        setParameterValue({ start, end });
        onChange([start, end]);
    };

    useEffect(() => {
        setParameterValue({
            start: value[0],
            end: value[1],
        });
    }, [value]);

    return (
        <Flex gap={'size-100'}>
            <NumberField
                isQuiet
                step={fieldStep}
                value={parameterValue.start}
                minValue={defaultValue[0]}
                maxValue={defaultValue[1]}
                onChange={(start) => handleNumberChange(start, parameterValue.end)}
                isDisabled={isDisabled}
                aria-label={`Change ${name} start range value`}
            />
            <RangeSlider
                value={parameterValue}
                minValue={defaultValue[0]}
                maxValue={defaultValue[1]}
                defaultValue={{ start: defaultValue[0], end: defaultValue[1] }}
                onChange={setParameterValue}
                onChangeEnd={handleRangeChange}
                step={fieldStep}
                flex={1}
                isDisabled={isDisabled}
                aria-label={`Change ${name} range value`}
            />
            <NumberField
                isQuiet
                step={fieldStep}
                value={parameterValue.end}
                minValue={defaultValue[0]}
                maxValue={defaultValue[1]}
                onChange={(end) => handleNumberChange(parameterValue.start, end)}
                isDisabled={isDisabled}
                aria-label={`Change ${name} end range value`}
            />
        </Flex>
    );
};
