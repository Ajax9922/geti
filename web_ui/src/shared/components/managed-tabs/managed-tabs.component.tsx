// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Key, ReactNode } from 'react';

import { Flex, Item, TabList, TabPanels, Tabs } from '@geti/ui';

import { CollapsedItemsPicker } from '../collapsed-items-picker/collapsed-items-picker.component';
import { TabItem } from '../tabs/tabs.interface';

import classes from './managed-tabs.module.scss';

export interface AddButtonConfig {
    ariaLabel: string;
    tooltipText: string;
    onPress: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
    id?: string;
}

export interface OverflowConfig {
    maxVisibleTabs: number;
    pickerAriaLabel: string;
    onCollapsedItemSelect: (key: string) => void;
}

export interface ManagedTabsProps<T extends { id: string; name: string }> {
    id?: string;
    items: T[];
    selectedKey: string;
    onSelectionChange: (key: Key) => void;
    renderTabItem: (item: T) => ReactNode;
    renderTabPanel: (item: T) => ReactNode;
    addButton?: ReactNode;
    overflow?: OverflowConfig;
    orientation?: 'horizontal' | 'vertical';
    wrapperClassName?: string;
    tabListClassName?: string;
    ariaLabel: string;
}

export const ManagedTabs = <T extends { id: string; name: string }>({
    id,
    items,
    selectedKey,
    onSelectionChange,
    renderTabItem,
    renderTabPanel,
    addButton,
    overflow,
    orientation = 'vertical',
    wrapperClassName,
    tabListClassName,
    ariaLabel,
}: ManagedTabsProps<T>) => {
    const hasOverflow = overflow && items.length > overflow.maxVisibleTabs;

    const visibleItems = hasOverflow ? items.slice(0, overflow.maxVisibleTabs) : items;
    const collapsedItems = hasOverflow ? items.slice(overflow.maxVisibleTabs) : [];
    const hasSelectedCollapsedItem = collapsedItems.some((item) => item.id === selectedKey);

    const tabItems = visibleItems.map((item) => ({
        id: item.id,
        key: item.id,
        name: item.name,
        children: renderTabPanel(item),
        originalItem: item,
    }));

    const collapsedPickerItems = collapsedItems.map((item) => ({ id: item.id, name: item.name }));

    return (
        <Flex
            id={id}
            direction={orientation === 'vertical' ? 'row' : 'column'}
            height='100%'
            width='100%'
            UNSAFE_className={`${classes.componentWrapper} ${wrapperClassName || ''}`}
        >
            <Tabs
                orientation={orientation}
                selectedKey={selectedKey}
                items={tabItems}
                aria-label={ariaLabel}
                height='100%'
                width='100%'
                onSelectionChange={onSelectionChange}
            >
                <Flex
                    alignItems='center'
                    width='100%'
                    position='relative'
                    gap='size-200'
                    UNSAFE_className={classes.tabWrapper}
                >
                    <div className={classes.tabListScrollContainer}>
                        <TabList UNSAFE_className={tabListClassName || classes.tabList}>
                            {(item: TabItem & { originalItem: T }) => (
                                <Item textValue={String(item.name)} key={item.key}>
                                    {renderTabItem(item.originalItem)}
                                </Item>
                            )}
                        </TabList>
                    </div>

                    {overflow && collapsedItems.length > 0 && (
                        <CollapsedItemsPicker
                            items={collapsedPickerItems}
                            ariaLabel={overflow.pickerAriaLabel}
                            onSelectionChange={overflow.onCollapsedItemSelect}
                            hasSelectedPinnedItem={!hasSelectedCollapsedItem}
                            numberOfCollapsedItems={collapsedItems.length}
                        />
                    )}

                    {addButton && addButton}
                </Flex>

                <TabPanels>{(item: TabItem) => <Item key={item.key}>{item.children}</Item>}</TabPanels>
            </Tabs>
        </Flex>
    );
};
