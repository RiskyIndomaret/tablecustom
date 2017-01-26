import { ITableSorterColumn, ITableSorterRow, ITableSorterConfiguration, ITableSorterLayoutColumn, IColorSettings } from "../models";
/**
 * Indicates that a lower number rank is actually of higher value
 * i.e. Positions in a race, #1 is better than #5
 */
export declare const LOWER_NUMBER_HIGHER_VALUE: boolean;
/**
 * Generates a table sorter compatible configuration from a dataView
 * @param dataView The dataView to generate the configuration from
 * @param data The set of data parsed from the data view
 * @param colorSettings The color settings to use when coloring rank columns
 * @param resetRankLayout If true the generated rank column layouts will be reset
 * @param reverseRankingColumns If true, the generated rank column order will be reversed
 */
export default function (dataView: powerbi.DataView, data: ITableSorterRow[], colorSettings: IColorSettings, resetRankLayout?: boolean, reverseRankingColumns?: boolean): ITableSorterConfiguration;
/**
 * Processes the existing config, removing unnecessary columns, and does some additional processing
 * @param config The config to process
 * @param columns The set of valid columns
 */
export declare function processExistingConfig(config: ITableSorterConfiguration, columns: ITableSorterColumn[]): void;
/**
 * Synchronizes the layout columns with the actual set of columns to ensure that it only has real columns,
 * and the filters are bounded appropriately
 */
export declare function syncLayoutColumns(layoutCols: ITableSorterLayoutColumn[], newCols: ITableSorterColumn[], oldCols: ITableSorterColumn[]): ITableSorterLayoutColumn[];
/**
 * Calculates the domain of the given column
 */
export declare function calcDomain(data: any[], name: string): number[];
/**
 * Calculates all of the ranking values from the given dataview
 * @param dataView The dataView to calculate the ranking info for
 */
export declare function calculateRankingInfo(dataView: powerbi.DataView): {
    column: powerbi.DataViewMetadataColumn;
    values: number[];
};
/**
 * Calculates the rank colors from a set of ranks
 */
export declare function calculateRankColors(ranks: number[], colorSettings?: IColorSettings): {};
/**
 * Determines if the given powerbi metadata column is the rank column
 */
export declare function isRankColumn(column: powerbi.DataViewMetadataColumn): boolean;
