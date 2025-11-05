// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Key, ReactNode } from 'react';

import { Flex, Item, Picker, TabList, TabPanels, Tabs } from '@geti/ui';

import { TabItem } from '../tabs/tabs.interface';

import classes from './managed-tabs.module.scss';

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
    children?: ReactNode;
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
    children,
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

                        {overflow && collapsedItems.length > 0 && (
                            <Picker
                                isQuiet
                                items={collapsedPickerItems}
                                aria-label={overflow.pickerAriaLabel}
                                onSelectionChange={(key) => overflow.onCollapsedItemSelect(String(key))}
                                placeholder={`${collapsedItems.length} more`}
                                UNSAFE_className={[
                                    classes.collapsedItemsPicker,
                                    !hasSelectedCollapsedItem ? classes.selected : '',
                                ].join(' ')}
                            >
                                {(item) => <Item>{item.name}</Item>}
                            </Picker>
                        )}
                    </div>

                    {addButton && addButton}
                </Flex>

                <TabPanels>{(item: TabItem) => <Item key={item.key}>{children}</Item>}</TabPanels>
            </Tabs>
        </Flex>
    );
};
