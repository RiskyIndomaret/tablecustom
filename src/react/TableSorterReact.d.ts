/// <reference types="react" />
import * as React from "react";
import { ITableSorterRow, ITableSorterColumn, IDataProvider } from "../models";
import "../css/TableSorter.scss";
export interface TableSorterProps {
    cols: ITableSorterColumn[];
    provider: IDataProvider;
    width?: number;
    height?: number;
    multiSelect?: boolean;
    count?: number;
    singleSelect?: boolean;
    inferColumnTypes?: boolean;
    showHistograms?: boolean;
    showValues?: boolean;
    showAnimations?: boolean;
    showStacked?: boolean;
    onSortChanged?: (column: string, asc: boolean) => void;
    onSelectionChanged?: (selectedRows: ITableSorterRow[]) => void;
    onFilterChanged?: (filter: {
        column: string;
        value: string | {
            domain: [number, number];
            range: [number, number];
        };
    }) => void;
    onLoadMoreData?: () => void;
}
export interface TableSorterState {
}
/**
 * Thin wrapper around TableSorter
 */
export declare class TableSorter extends React.Component<TableSorterProps, TableSorterState> {
    props: TableSorterProps;
    private tableSorter;
    private node;
    componentDidMount(): void;
    componentWillReceiveProps(newProps: TableSorterProps): void;
    /**
     * Renders this component
     */
    render(): JSX.Element;
    /**
     * Attaches the events
     */
    private attachEvents();
    private renderContent(props?);
    /**
     * Converts the tablesorter props to settings
     */
    private getSettingsFromProps(props);
}
