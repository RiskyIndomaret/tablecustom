import { JSONDataProvider, IColumnDomainInfo } from "../providers/JSONDataProvider";
import { IQueryOptions, IQueryResult } from "../models";
/**
 * The data provider for our table sorter
 */
export default class MyDataProvider extends JSONDataProvider {
    private hasMoreData;
    constructor(data: any[], domains: IColumnDomainInfo, hasMoreData: (newQuery: boolean) => boolean, onLoadMoreData: (options: IQueryOptions, newQuery: boolean, sort: boolean, filter: boolean) => PromiseLike<any[]>);
    /**
     * Determines if the dataset can be queried again
     * @param options The query options to control how the query is performed
     */
    canQuery(options: IQueryOptions): PromiseLike<boolean>;
    /**
     * Runs a query against the server
     * @param options The query options to control how the query is performed
     */
    query(options: IQueryOptions): PromiseLike<IQueryResult>;
}
