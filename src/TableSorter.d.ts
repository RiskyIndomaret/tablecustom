/// <reference types="jquery" />
import { default as EventEmitter } from "../base/EventEmitter";
import { IQueryOptions, IDataProvider, ITableSorterRow, ITableSorterSettings, ITableSorterConfiguration, ILineupImpl } from "./models";
/**
 * A wrapper around the lineup library
 */
export declare class TableSorter {
    /**
     * The list of events that we expose
     */
    static EVENTS: {
        SORT_CHANGED: string;
        FILTER_CHANGED: string;
        CONFIG_CHANGED: string;
        SELECTION_CHANGED: string;
        LOAD_MORE_DATA: string;
        CLEAR_SELECTION: string;
        LOAD_LINEUP: string;
    };
    /**
     * My lineup instance
     */
    lineupImpl: ILineupImpl;
    /**
     * The dimensions
     */
    private _dimensions;
    /**
     * The currently loading promise
     */
    private loadingPromise;
    /**
     * The set of options used to query for new data
     */
    private queryOptions;
    /**
     * Represents the last query that we performed
     */
    private lastQuery;
    /**
     * My element
     */
    private element;
    /**
     * THe current set of data in this lineup
     */
    private _data;
    /**
     * The current configuration of the LineUp instance
     */
    private _configuration;
    /**
     * Whether or not we are currently saving the configuration
     */
    private savingConfiguration;
    /**
     * True if we are currently sorting lineup per the grid
     */
    private sortingFromConfig;
    /**
     * Whether or not this is destroyed
     */
    private destroyed;
    /**
     * A boolean indicating whehter or not we are currently loading more data
     */
    private _loadingData;
    private loadingData;
    /**
     * Setter for if we are loading data
     */
    private _toggleClass;
    private _selectedRows;
    private _eventEmitter;
    private _settings;
    /**
     * The configuration for the lineup viewer
     */
    private lineUpConfig;
    /**
     * Constructor for the table sorter
     * @param element The element to attach the table sorter to
     * @param dataProvider The data provider to use when querying for data
     */
    constructor(element: JQuery, dataProvider?: IDataProvider);
    /**
     * getter for the dimensions
     */
    /**
     * setter for the dimensions
     */
    dimensions: {
        width: number;
        height: number;
    };
    /**
     * Resizer function to update lineups rendering
     */
    private bodyUpdater;
    /**
     * Gets the data provider
     */
    private _dataProvider;
    /**
     * Sets the data provider to use
     * TODO: Evaluate whether or not this should just be a ctor arg
     */
    dataProvider: IDataProvider;
    /**
     * Gets the current set of data loaded into tablesorter
     */
    readonly data: ITableSorterRow[];
    /**
     * Gets the events object
     */
    readonly events: EventEmitter;
    /**
     * Gets the settings
     */
    /**
     * Sets the settings
     */
    settings: ITableSorterSettings;
    /**
     * Gets the current selection
     */
    /**
     * Sets the selection of lineup
     */
    selection: ITableSorterRow[];
    /**
     * Gets this configuration
     */
    /**
     * Sets the column configuration that is used
     * *NOTE* This does not cause a data fetch, because it is just restoring state,
     * if required, set the dataProvider property to refetch data.
     */
    configuration: ITableSorterConfiguration;
    /**
     * Gets the current set of query options
     */
    getQueryOptions(): {} & IQueryOptions;
    /**
     * Rerenders the values of the rows
     */
    rerenderValues(): void;
    /**
     * Function to destroy itself
     */
    destroy(): void;
    /**
     * Checks to see if more data should be loaded based on the viewport
     * @param scroll If true, a scrolling behavior caused this check
     */
    protected checkLoadMoreData(scroll: boolean): PromiseLike<boolean>;
    /**
     * Runs the current query against the data provider
     * @param newQuery If true, a change in the query (filter/sort) caused this run, as opposed to infinite scrolling
     */
    private runQuery(newQuery);
    /**
     * Loads data from a query result
     * @param r The query result to load the data from
     */
    private loadDataFromQueryResult(r);
    /**
     * Loads the actual lineup impl from the given spec document
     * @param config The configuration to use when loading lineup
     */
    private loadLineup(config);
    /**
     * Attaches our event listeners to lineup
     */
    private attachLineupListeners();
    /**
     * Generates the histogram for lineup
     * @param columnImpl The lineup column to generate the histogram for
     * @param callback The callback for when the generation is complete
     */
    private generateHistogram(columnImpl, callback);
    /**
     * Retrieves our columns by name
     */
    private getColumnByName(colName);
    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    private updateRowSelection(sels);
    /**
     * Saves the current layout
     * @param filteredColumn The column that is being filtered
     */
    private updateConfigurationFromLineup(filteredColumn?);
    /**
     * Applies our external config to lineup
     */
    private applyConfigurationToLineup();
    /**
     * Listener for when the lineup columns are changed.
     */
    private onLineUpColumnsChanged();
    /**
     * Listener for line up being sorted
     * @param column The column being sorted
     * @param asc If true the sort is ascending
     */
    private onLineUpSorted(column, asc);
    /**
     * Listener for lineup being filtered
     * @param column The lineup column being filtered
     */
    private onLineUpFiltered(column);
    /**
     * Raises the configuration changed event
     */
    private raiseConfigurationChanged(configuration);
    /**
     * Raises the filter changed event
     */
    private raiseSortChanged(column, asc);
    /**
     * Raises the filter changed event
     */
    private raiseFilterChanged(filter);
    /**
     * Raises the selection changed event
     */
    private raiseSelectionChanged(rows);
    /**
     * Raises the load more data event
     */
    private raiseLoadMoreData();
    /**
     * Raises the load more data event
     */
    private raiseClearSelection();
    /**
     * Raises the event when loading lineup
     */
    private raiseLoadLineup(config);
}
