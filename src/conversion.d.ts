import { ITableSorterFilter, ILineupImpl, ITableSorterConfiguration, ITableSorterSort } from "./models";
/**
 * Converts the current set of lineup filters into ones compatible with table sorter
 */
export declare function convertFilters(lineupImpl: ILineupImpl, filteredColumn?: any): ITableSorterFilter[];
/**
 * Converts the current set of lineup filters on the layout object into ones compatible with table sorter
 * @param layoutObj The layout object to extract the filters from
 */
export declare function convertFiltersFromLayout(layoutObj: any): ITableSorterFilter[];
/**
 * Converts a filter from the given lineup description
 * @param desc The description to get the filter from
 */
export declare function convertFilterFromDesc(desc: any): {
    column: any;
    value: any;
};
/**
 * Converts a table sorter compatible configuration from the given lineup instance
 * @param lineupImpl The lineup instance to create from
 * @param filteredColumn The filtered column that caused this conversion to occur.
 */
export declare function convertConfiguration(lineupImpl: ILineupImpl, filteredColumn?: any): ITableSorterConfiguration;
/**
 * Converts the current lineup sort into one compatible with table sorter
 * @param lineupImpl The lineup instance to get the sort from
 */
export declare function convertSort(lineupImpl: ILineupImpl): ITableSorterSort;
