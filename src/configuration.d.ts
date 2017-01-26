import { ITableSorterConfiguration, ITableSorterRow } from "./models";
/**
 * Derives the table sorter configuration from the given set of data
 * @param data The data to derive the configuration from
 */
export declare function createConfigurationFromData(data: ITableSorterRow[]): ITableSorterConfiguration;
/**
 * Determines if the two different column sets have changed between two configurations
 */
export declare function haveColumnsChanged(oldCfg: ITableSorterConfiguration, newCfg: ITableSorterConfiguration): boolean;
/**
 * Determines if the two different layouts have changed between two configurations
 */
export declare function hasLayoutChanged(oldCfg: ITableSorterConfiguration, newCfg: ITableSorterConfiguration): boolean;
/**
 * Returns true if the new table sorter configuration has changed between two configurations
 */
export declare function hasConfigurationChanged(nc: ITableSorterConfiguration, oc: ITableSorterConfiguration): boolean;
