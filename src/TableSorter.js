/*
 * Copyright (C) 2016 Microsoft
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
var EventEmitter_1 = require("../base/EventEmitter");
var _ = require("lodash");
var d3 = require("d3");
var $ = require("jquery");
var configuration_1 = require("./configuration");
var conversion_1 = require("./conversion");
var tablesorter_tmpl_1 = require("./templates/tablesorter.tmpl");
var TableSorter_defaults_1 = require("./TableSorter.defaults");
/* tslint:disable */
var LineUpLib = require("lineup-v1");
/* tslint:enable */
var EVENTS_NS = ".lineup";
/**
 * A wrapper around the lineup library
 */
var TableSorter = (function () {
    /**
     * Constructor for the table sorter
     * @param element The element to attach the table sorter to
     * @param dataProvider The data provider to use when querying for data
     */
    function TableSorter(element, dataProvider) {
        var _this = this;
        /**
         * The set of options used to query for new data
         */
        this.queryOptions = {};
        /**
         * A boolean indicating whehter or not we are currently loading more data
         */
        this._loadingData = false;
        /**
         * Setter for if we are loading data
         */
        this._toggleClass = _.debounce(function () {
            if (!_this.destroyed) {
                _this.element.toggleClass("loading", _this.loadingData);
            }
        }, 100);
        this._selectedRows = [];
        this._settings = $.extend(true, {}, TableSorter_defaults_1.DEFAULT_TABLESORTER_SETTINGS);
        /**
         * The configuration for the lineup viewer
         */
        this.lineUpConfig = {
            svgLayout: {
                mode: "separate",
            },
            numberformat: function (d, row, column) {
                var formatter = (_this.settings.presentation.numberFormatter || TableSorter_defaults_1.DEFAULT_NUMBER_FORMATTER);
                return formatter(d, row, column);
            },
            interaction: {
                multiselect: function () { return _this.settings.selection.multiSelect; },
            },
            sorting: {
                external: true,
            },
            filtering: {
                external: true,
            },
            histograms: {
                generator: function (columnImpl, callback) { return _this.generateHistogram(columnImpl, callback); },
            },
        };
        /* tslint:disable */
        /**
         * Resizer function to update lineups rendering
         */
        this.bodyUpdater = _.debounce(function () {
            if (_this.lineupImpl && !_this.destroyed) {
                _this.lineupImpl.updateBody();
            }
        }, 100);
        this.element = $(tablesorter_tmpl_1.default());
        this.element.find(".clear-selection").on("click", function () {
            _this.lineupImpl.clearSelection();
            _this.raiseClearSelection();
        });
        this.element.find(".add-column").on("click", function () {
            _this.lineupImpl.addNewSingleColumnDialog();
        });
        this.element.find(".add-stacked-column").on("click", function () {
            _this.lineupImpl.addNewStackedColumnDialog();
        });
        this._eventEmitter = new EventEmitter_1.default();
        element.append(this.element);
        this.loadingData = true;
        if (dataProvider) {
            this.dataProvider = dataProvider;
        }
    }
    Object.defineProperty(TableSorter.prototype, "loadingData", {
        get: function () {
            return this._loadingData;
        },
        set: function (value) {
            this._loadingData = value;
            if (value) {
                this.element.addClass("loading");
            }
            this._toggleClass();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "dimensions", {
        /**
         * getter for the dimensions
         */
        get: function () {
            return this._dimensions;
        },
        /* tslint:enable */
        /**
         * setter for the dimensions
         */
        set: function (value) {
            this._dimensions = value;
            if (this.lineupImpl && this.lineupImpl.$container && value) {
                var wrapper = $(this.lineupImpl.$container.node()).find("div.lu-wrapper");
                var headerHeight = wrapper.offset().top - this.element.offset().top;
                wrapper.css({
                    height: (value.height - headerHeight - 2) + "px",
                    width: "100%",
                });
            }
            this.bodyUpdater();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "dataProvider", {
        get: function () {
            return this._dataProvider;
        },
        /**
         * Sets the data provider to use
         * TODO: Evaluate whether or not this should just be a ctor arg
         */
        set: function (dataProvider) {
            // Reset query vars
            this.loadingData = false;
            this.lastQuery = undefined;
            this.queryOptions = {};
            this._dataProvider = dataProvider;
            if (this._dataProvider) {
                this.runQuery(true);
            }
            else if (this.lineupImpl) {
                this.lineupImpl.destroy();
                delete this.lineupImpl;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "data", {
        /**
         * Gets the current set of data loaded into tablesorter
         */
        get: function () {
            return this._data && this._data.slice(0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "events", {
        /**
         * Gets the events object
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "settings", {
        /**
         * Gets the settings
         */
        get: function () {
            return this._settings;
        },
        /**
         * Sets the settings
         */
        set: function (value) {
            var newSettings = $.extend(true, {}, TableSorter_defaults_1.DEFAULT_TABLESORTER_SETTINGS, value);
            newSettings.selection.singleSelect = !newSettings.selection.multiSelect;
            this.lineUpConfig["cellFormatter"] = newSettings.presentation.cellFormatter;
            /** Apply the settings to lineup */
            if (this.lineupImpl) {
                var presProps = newSettings.presentation;
                for (var key in presProps) {
                    if (presProps.hasOwnProperty(key)) {
                        this.lineupImpl.changeRenderingOption(key, presProps[key]);
                    }
                }
                this.lineupImpl.changeInteractionOption("tooltips", newSettings.presentation.tooltips);
            }
            this.lineUpConfig["columnColors"] = newSettings.presentation.columnColors;
            // Sets the tooltips configuration
            this.lineUpConfig["interaction"].tooltips = newSettings.presentation.tooltips;
            this._settings = newSettings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "selection", {
        /**
         * Gets the current selection
         */
        get: function () {
            return this._selectedRows;
        },
        /**
         * Sets the selection of lineup
         */
        set: function (value) {
            this._selectedRows = this.updateRowSelection(value);
            if (this.lineupImpl) {
                this.lineupImpl.select(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "configuration", {
        /**
         * Gets this configuration
         */
        get: function () {
            return this._configuration;
        },
        /**
         * Sets the column configuration that is used
         * *NOTE* This does not cause a data fetch, because it is just restoring state,
         * if required, set the dataProvider property to refetch data.
         */
        set: function (value) {
            this._configuration = value;
            if (value && value.sort) {
                this.queryOptions.sort = [value.sort];
            }
            var primary = value && value.layout && value.layout.primary;
            if (primary) {
                this.queryOptions.query = conversion_1.convertFiltersFromLayout(primary);
            }
            this.applyConfigurationToLineup();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the current set of query options
     */
    TableSorter.prototype.getQueryOptions = function () {
        return _.merge({}, this.queryOptions);
    };
    /**
     * Rerenders the values of the rows
     */
    TableSorter.prototype.rerenderValues = function () {
        if (this.lineupImpl) {
            // Sort of hacky, toggle the values to get it to rerender
            var values = this.settings.presentation.values;
            this.lineupImpl.changeRenderingOption("values", !values);
            this.lineupImpl.changeRenderingOption("values", values);
        }
    };
    /**
     * Function to destroy itself
     */
    TableSorter.prototype.destroy = function () {
        if (this.lineupImpl) {
            /* tslint:disable */
            if (this.lineupImpl.listeners) {
                this.lineupImpl.listeners.on(EVENTS_NS, null);
            }
            this.lineupImpl.scrolled = function () { };
            /* tslint:enable */
            this.lineupImpl.destroy();
            delete this.lineupImpl;
        }
        this.destroyed = true;
    };
    /**
     * Checks to see if more data should be loaded based on the viewport
     * @param scroll If true, a scrolling behavior caused this check
     */
    TableSorter.prototype.checkLoadMoreData = function (scroll) {
        if (!this.destroyed) {
            var scrollElement = $(this.lineupImpl.$container.node()).find("div.lu-wrapper")[0];
            var sizeProp = "Height";
            var posProp = "Top";
            var scrollSize = scrollElement["scroll" + sizeProp];
            var scrollPos = scrollElement["scroll" + posProp];
            var shouldScrollLoad = scrollSize - (scrollPos + scrollElement["client" + sizeProp]) < 200;
            if (shouldScrollLoad && !this.loadingData) {
                return this.runQuery(false);
            }
        }
    };
    /**
     * Runs the current query against the data provider
     * @param newQuery If true, a change in the query (filter/sort) caused this run, as opposed to infinite scrolling
     */
    TableSorter.prototype.runQuery = function (newQuery) {
        var _this = this;
        // If there is already a thing goin, stop it
        if (newQuery && this.loadingPromise) {
            this.loadingPromise["cancel"] = true;
        }
        if (!this.dataProvider) {
            return;
        }
        // Let everyone know we are loading more data
        this.raiseLoadMoreData();
        // We should only attempt to load more data, if we don't already have data loaded, or there is more to be loaded
        return this.dataProvider.canQuery(this.queryOptions).then(function (value) {
            if (value) {
                _this.loadingData = true;
                var promise_1 = _this.loadingPromise = _this.dataProvider.query(_this.queryOptions).then(function (r) {
                    // if this promise hasn't been cancelled
                    if ((!promise_1 || !promise_1["cancel"]) && !_this.destroyed) {
                        _this.loadingPromise = undefined;
                        _this.loadDataFromQueryResult(r);
                        _this.loadingData = false;
                        // make sure we don't need to load more after this, in case it doesn't all fit on the screen
                        setTimeout(function () {
                            _this.checkLoadMoreData(false);
                            if (!_this.loadingPromise) {
                                _this.loadingData = false;
                            }
                        }, 10);
                    }
                }, function () { return _this.loadingData = false; })
                    .then(undefined, function (err) {
                    console.log(err.message);
                    console.error(err);
                    throw err;
                });
                return promise_1;
            }
            else {
                _this.loadingData = false;
            }
        });
    };
    /**
     * Loads data from a query result
     * @param r The query result to load the data from
     */
    TableSorter.prototype.loadDataFromQueryResult = function (r) {
        this._data = this._data || [];
        this._data = r.replace ? r.results : this._data.concat(r.results);
        // derive a description file
        var config = this.configuration ?
            $.extend(true, {}, this.configuration) : configuration_1.createConfigurationFromData(this._data);
        // Primary Key needs to always be ID
        config.primaryKey = "id";
        this.loadLineup(config);
        // Update the selection
        this.selection = this._data.filter(function (n) { return n.selected; });
        // Reapply the configuration to lineup
        this.applyConfigurationToLineup();
        // Store the configuration after it was possibly changed by load data
        this.updateConfigurationFromLineup();
    };
    /**
     * Loads the actual lineup impl from the given spec document
     * @param config The configuration to use when loading lineup
     */
    TableSorter.prototype.loadLineup = function (config) {
        this.raiseLoadLineup(config);
        var spec = {};
        // spec.name = name;
        spec.dataspec = config;
        delete spec.dataspec.file;
        delete spec.dataspec.separator;
        spec.dataspec.data = this._data;
        spec.storage = LineUpLib.createLocalStorage(this._data, config.columns, config.layout, config.primaryKey);
        if (this.lineupImpl) {
            this.lineupImpl.changeDataStorage(spec);
        }
        else {
            var finalOptions = $.extend(true, this.lineUpConfig, {
                renderingOptions: $.extend(true, {}, this.settings.presentation),
            });
            this.lineupImpl = LineUpLib.create(spec, d3.select(this.element.find(".grid")[0]), finalOptions);
            this.dimensions = this.dimensions;
            this.attachLineupListeners();
            this.settings = this.settings;
        }
    };
    /**
     * Attaches our event listeners to lineup
     */
    TableSorter.prototype.attachLineupListeners = function () {
        var _this = this;
        this.lineupImpl.listeners.on("change-sortcriteria" + EVENTS_NS, function (ele, column, asc) {
            // This only works for single columns and not grouped columns
            _this.onLineUpSorted(column && column.column && column.column.id, asc);
        });
        this.lineupImpl.listeners.on("multiselected" + EVENTS_NS, function (rows) {
            if (_this.settings.selection.multiSelect) {
                _this._selectedRows = _this.updateRowSelection(rows);
                _this.raiseSelectionChanged(rows);
            }
        });
        this.lineupImpl.listeners.on("selected" + EVENTS_NS, function (row) {
            if (!_this.settings.selection.multiSelect) {
                _this._selectedRows = _this.updateRowSelection(row ? [row] : []);
                _this.raiseSelectionChanged(_this.selection);
            }
        });
        this.lineupImpl.listeners.on("columns-changed" + EVENTS_NS, function () { return _this.onLineUpColumnsChanged(); });
        this.lineupImpl.listeners.on("change-filter" + EVENTS_NS, function (x, column) { return _this.onLineUpFiltered(column); });
        var scrolled = this.lineupImpl.scrolled;
        var me = this;
        // The use of `function` here is intentional, we need to pass along the correct scope
        this.lineupImpl.scrolled = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            me.checkLoadMoreData(true);
            return scrolled.apply(this, args);
        };
    };
    /**
     * Generates the histogram for lineup
     * @param columnImpl The lineup column to generate the histogram for
     * @param callback The callback for when the generation is complete
     */
    TableSorter.prototype.generateHistogram = function (columnImpl, callback) {
        var column = this.getColumnByName(columnImpl.column.column);
        this.dataProvider.generateHistogram(column, this.queryOptions).then(function (h) {
            var perc = 1 / h.length;
            var values = h.map(function (v, i) { return ({
                x: perc * i,
                y: v,
                dx: perc,
            }); });
            callback(values);
        });
    };
    /**
     * Retrieves our columns by name
     */
    TableSorter.prototype.getColumnByName = function (colName) {
        return this.configuration && this.configuration.columns && this.configuration.columns.filter(function (c) { return c.column === colName; })[0];
    };
    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    TableSorter.prototype.updateRowSelection = function (sels) {
        if (this._data) {
            this._data.forEach(function (d) { return d.selected = false; });
        }
        return sels && sels.length ? sels.filter(function (d) { return d.selected = true; }) : [];
    };
    /**
     * Saves the current layout
     * @param filteredColumn The column that is being filtered
     */
    TableSorter.prototype.updateConfigurationFromLineup = function (filteredColumn) {
        if (!this.savingConfiguration) {
            this.savingConfiguration = true;
            var nc = conversion_1.convertConfiguration(this.lineupImpl, filteredColumn);
            var oc = this.configuration;
            if (configuration_1.hasConfigurationChanged(nc, oc)) {
                this.configuration = nc;
                this.raiseConfigurationChanged(this.configuration);
            }
            this.savingConfiguration = false;
        }
    };
    /**
     * Applies our external config to lineup
     */
    TableSorter.prototype.applyConfigurationToLineup = function () {
        if (this.lineupImpl) {
            var currentSort = conversion_1.convertSort(this.lineupImpl);
            if (this.configuration && this.configuration.sort && (!currentSort || !_.isEqual(currentSort, this.configuration.sort))) {
                this.sortingFromConfig = true;
                var sort = this.configuration.sort;
                this.lineupImpl.sortBy(sort.stack ? sort.stack.name : sort.column, sort.asc);
                this.sortingFromConfig = false;
            }
        }
    };
    /**
     * Listener for when the lineup columns are changed.
     */
    TableSorter.prototype.onLineUpColumnsChanged = function () {
        this.updateConfigurationFromLineup();
    };
    /**
     * Listener for line up being sorted
     * @param column The column being sorted
     * @param asc If true the sort is ascending
     */
    TableSorter.prototype.onLineUpSorted = function (column, asc) {
        if (!this.sortingFromConfig) {
            this.updateConfigurationFromLineup();
            this.raiseSortChanged(column, asc);
            var newSort = conversion_1.convertSort(this.lineupImpl);
            // Set the new sort value
            this.queryOptions.sort = newSort ? [newSort] : undefined;
            if (this.dataProvider && this.dataProvider.sort) {
                this.dataProvider.sort(newSort);
            }
            // We are starting over since we sorted
            this.runQuery(true);
        }
    };
    /**
     * Listener for lineup being filtered
     * @param column The lineup column being filtered
     */
    TableSorter.prototype.onLineUpFiltered = function (column) {
        var colName = column.column && column.column.column;
        var ourColumn = this.configuration.columns.filter(function (n) { return n.column === colName; })[0];
        var filter;
        if (ourColumn.type === "number") {
            filter = {
                column: colName,
                value: {
                    domain: column.scale.domain(),
                    range: column.scale.range(),
                    values: column.filter,
                },
            };
        }
        else {
            filter = {
                column: colName,
                value: column.filter || undefined,
            };
        }
        var newFilters = conversion_1.convertFilters(this.lineupImpl, column);
        if (!_.isEqual(newFilters, this.queryOptions.query)) {
            this.updateConfigurationFromLineup(column);
            this.raiseFilterChanged(filter);
            // Set the new filter value
            this.queryOptions.query = newFilters;
            if (this.dataProvider && this.dataProvider.filter) {
                this.dataProvider.filter(filter);
            }
            // We are starting over since we filtered
            this.runQuery(true);
        }
    };
    /**
     * Raises the configuration changed event
     */
    TableSorter.prototype.raiseConfigurationChanged = function (configuration) {
        this.events.raiseEvent(TableSorter.EVENTS.CONFIG_CHANGED, configuration);
    };
    /**
     * Raises the filter changed event
     */
    TableSorter.prototype.raiseSortChanged = function (column, asc) {
        this.events.raiseEvent(TableSorter.EVENTS.SORT_CHANGED, column, asc);
    };
    /**
     * Raises the filter changed event
     */
    TableSorter.prototype.raiseFilterChanged = function (filter) {
        this.events.raiseEvent(TableSorter.EVENTS.FILTER_CHANGED, filter);
    };
    /**
     * Raises the selection changed event
     */
    TableSorter.prototype.raiseSelectionChanged = function (rows) {
        this.events.raiseEvent(TableSorter.EVENTS.SELECTION_CHANGED, rows);
    };
    /**
     * Raises the load more data event
     */
    TableSorter.prototype.raiseLoadMoreData = function () {
        this.events.raiseEvent(TableSorter.EVENTS.LOAD_MORE_DATA);
    };
    /**
     * Raises the load more data event
     */
    TableSorter.prototype.raiseClearSelection = function () {
        this.events.raiseEvent(TableSorter.EVENTS.CLEAR_SELECTION);
    };
    /**
     * Raises the event when loading lineup
     */
    TableSorter.prototype.raiseLoadLineup = function (config) {
        this.events.raiseEvent(TableSorter.EVENTS.LOAD_LINEUP, config);
    };
    return TableSorter;
}());
/**
 * The list of events that we expose
 */
TableSorter.EVENTS = {
    SORT_CHANGED: "sortChanged",
    FILTER_CHANGED: "filterChanged",
    CONFIG_CHANGED: "configurationChanged",
    SELECTION_CHANGED: "selectionChanged",
    LOAD_MORE_DATA: "loadMoreData",
    CLEAR_SELECTION: "clearSelection",
    LOAD_LINEUP: "loadLineup",
};
exports.TableSorter = TableSorter;
