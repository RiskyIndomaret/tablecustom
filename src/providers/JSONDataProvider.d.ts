import { IDataProvider, IQueryOptions, IQueryResult, ITableSorterColumn, ITableSorterSort, ITableSorterFilter } from "../models";
/**
 * A Data provider for lineup that uses a data array as its store
 */
export declare class JSONDataProvider implements IDataProvider {
    protected data: any[];
    protected domains: IColumnDomainInfo;
    protected filteredData: any[];
    private handleSort;
    private handleFilter;
    private count;
    private offset;
    private initialQuery;
    /**
     * A filter for string values
     * @param data The data item to check
     * @param filter The filter being applied
     */
    private static checkStringFilter(data, filter);
    /**
     * A filter for numeric values
     * @param data The data item to check
     * @param filter The filter being applied
     */
    private static checkNumberFilter(data, filter);
    /**
     * A filter for explicit items
     * @param data The data item to check
     * @param filter The filter being applied
     */
    private static checkExplicitFilter(data, filter);
    /**
     * Constructor for the JSONDataProvider
     */
    constructor(data: any[], domains: IColumnDomainInfo, handleSort?: boolean, handleFilter?: boolean, count?: number);
    /**
     * Determines if the dataset can be queried again
     * @param options The options to use when querying
     */
    canQuery(options: IQueryOptions): PromiseLike<boolean>;
    /**
     * Runs a query against the data provider
     * @param options The options to use when querying
     */
    query(options: IQueryOptions): PromiseLike<IQueryResult>;
    /**
     * Called when the data is about to be sorted
     * @param sort The sort being applied
     */
    sort(sort?: ITableSorterSort): void;
    /**
     * Called when the data is about to be filtered
     * @param filter The filter being applied
     */
    filter(filter?: ITableSorterFilter): void;
    /**
     * Generates a histogram for the dataset formed by using the given query options
     * @param column The column to generate the histogram for
     * @param options The query to use when generating the histogram.
     */
    generateHistogram(column: ITableSorterColumn, options: IQueryOptions): PromiseLike<number[]>;
    /**
     * Gets a subset of the data that has been filtered by the given query options
     * @param options The query being performed
     */
    private getFilteredData(options);
}
/**
 * A mapping between columns and domains
 */
export interface IColumnDomainInfo {
    [column: string]: [number, number];
}
