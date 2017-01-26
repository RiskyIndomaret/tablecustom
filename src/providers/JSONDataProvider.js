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
var es6_promise_1 = require("es6-promise");
var d3 = require("d3");
var _ = require("lodash");
var debug = require("debug"); // tslint:disable-line
var log = debug("essex:widget:tablesorter:JSONDataProvider");
/**
 * A Data provider for lineup that uses a data array as its store
 */
var JSONDataProvider = (function () {
    /**
     * Constructor for the JSONDataProvider
     */
    function JSONDataProvider(data, domains, handleSort, handleFilter, count) {
        if (handleSort === void 0) { handleSort = true; }
        if (handleFilter === void 0) { handleFilter = true; }
        if (count === void 0) { count = 100; }
        this.handleSort = true;
        this.handleFilter = true;
        this.count = 100;
        this.offset = 0;
        this.initialQuery = true;
        this.data = data;
        this.domains = domains;
        this.handleSort = handleSort;
        this.handleFilter = handleFilter;
        this.count = count;
    }
    /**
     * A filter for string values
     * @param data The data item to check
     * @param filter The filter being applied
     */
    JSONDataProvider.checkStringFilter = function (data, filter) {
        return ((data[filter.column] || "") + "").match(new RegExp(filter.value));
    };
    /**
     * A filter for numeric values
     * @param data The data item to check
     * @param filter The filter being applied
     */
    JSONDataProvider.checkNumberFilter = function (data, filter) {
        var value = data[filter.column];
        return (value === null || value === undefined) ? false : value >= filter.value.domain[0] && value <= filter.value.domain[1]; // tslint:disable-line
    };
    /**
     * A filter for explicit items
     * @param data The data item to check
     * @param filter The filter being applied
     */
    JSONDataProvider.checkExplicitFilter = function (data, filter) {
        var value = data[filter.column] || 0;
        return (filter.value.values || []).indexOf(value) >= 0;
    };
    /**
     * Determines if the dataset can be queried again
     * @param options The options to use when querying
     */
    JSONDataProvider.prototype.canQuery = function (options) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve) { return resolve(_this.initialQuery || (_this.offset < _this.data.length)); });
    };
    /**
     * Runs a query against the data provider
     * @param options The options to use when querying
     */
    JSONDataProvider.prototype.query = function (options) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this.initialQuery = false;
            var newData;
            var replace = _this.offset === 0;
            try {
                _this.filteredData = _this.getFilteredData(options);
                newData = _this.filteredData.slice(_this.offset, _this.offset + _this.count);
                _this.offset += _this.count;
                log("Returning " + newData.length + " results from query");
            }
            catch (e) {
                log("Error Returning: " + e);
                throw e;
            }
            setTimeout(function () {
                resolve({
                    results: newData,
                    replace: replace,
                });
            }, 0);
        });
    };
    ;
    /**
     * Called when the data is about to be sorted
     * @param sort The sort being applied
     */
    JSONDataProvider.prototype.sort = function (sort) {
        if (this.handleSort) {
            this.offset = 0;
        }
        this.initialQuery = true;
    };
    /**
     * Called when the data is about to be filtered
     * @param filter The filter being applied
     */
    JSONDataProvider.prototype.filter = function (filter) {
        if (this.handleFilter) {
            this.offset = 0;
        }
        this.initialQuery = true;
    };
    /**
     * Generates a histogram for the dataset formed by using the given query options
     * @param column The column to generate the histogram for
     * @param options The query to use when generating the histogram.
     */
    JSONDataProvider.prototype.generateHistogram = function (column, options) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve) {
            var final = _this.filteredData; // this.getFilteredData(options);
            var values = final.map(function (n) { return n[column.column]; });
            var max = d3.max(values);
            var min = d3.min(values);
            var histgenerator = d3.layout.histogram();
            histgenerator.range([min, max]);
            var histValues = histgenerator(values).map(function (bin) { return bin.y; });
            var maxHist = d3.max(histValues);
            // Make the values a percentage
            resolve(histValues.map(function (n) { return maxHist === 0 || n === 0 || _.isNaN(n) || _.isNaN(maxHist) ? 0 : n / maxHist; }));
        });
    };
    /**
     * Gets a subset of the data that has been filtered by the given query options
     * @param options The query being performed
     */
    JSONDataProvider.prototype.getFilteredData = function (options) {
        var _this = this;
        var final = this.data.slice(0);
        // If we are handling filtering, and their is a filter being applied
        if (this.handleFilter && options.query && options.query.length) {
            options.query.forEach(function (filter) {
                var filterMethod = JSONDataProvider.checkStringFilter;
                // There HAS to be some value and a column for us to be able to filter correctly
                if (filter.value && filter.column) {
                    var explictValues = filter.value && filter.value.values;
                    var filteredDomain = filter.value && filter.value.domain;
                    if (explictValues) {
                        filterMethod = JSONDataProvider.checkExplicitFilter;
                    }
                    else if (filteredDomain) {
                        var actualDomain = _this.domains[filter.column];
                        // If the filtered domain is ACTUALLY different from the full domain, then filter
                        // This case is specifically for null values, if the dataset contains null values
                        // and we apply a filter with the same domain as the actual domain, then null values get filtered
                        // out since they don't actually fall within the domain
                        if (filteredDomain[0] !== actualDomain[0] || filteredDomain[1] !== actualDomain[1]) {
                            filterMethod = JSONDataProvider.checkNumberFilter;
                        }
                        else {
                            // Otherwise, we don't need a filter
                            filterMethod = undefined;
                        }
                    }
                    final = final.filter(function (item) { return !filterMethod || filterMethod(item, filter); });
                }
            });
        }
        // If we are handling sort, and there is a sort applied to tablesorter
        if (this.handleSort && options.sort && options.sort.length) {
            var sortItem_1 = options.sort[0];
            var basicSort_1 = function (aValue, bValue, asc) {
                var dir = asc ? 1 : -1;
                /* tslint:disable */
                if (aValue == bValue) {
                    /* tslint:enable */
                    return 0;
                }
                return (aValue > bValue ? 1 : -1) * dir;
            };
            var calcStackedValue_1 = function (item, sortToCheck, minMax) {
                var columns = sortToCheck.stack.columns;
                if (columns) {
                    var sortVal = columns.reduce(function (a, v) {
                        /**
                         * This calculates the percent that this guy is of the max value
                         */
                        var min = minMax[v.column].min || 0;
                        var max = minMax[v.column].max || min;
                        var value = item[v.column];
                        // We only need to do the actual weighting with items that have values
                        if (value !== null && value !== undefined) {
                            // The max is the min, in this case, the value should be 100% (or 1)
                            if (max === min) {
                                value = 1;
                            }
                            else {
                                value = ((value - min) / (max - min));
                            }
                            return a + (value * v.weight);
                        }
                        // Null/undefined values have no value, so just ignore them
                        return a;
                    }, 0);
                    return sortVal;
                }
                return 0;
            };
            var maxValues_1;
            if (sortItem_1.stack) {
                maxValues_1 = sortItem_1.stack.columns.reduce(function (a, b) {
                    var _a = _this.domains[b.column], min = _a[0], max = _a[1];
                    a[b.column] = {
                        max: max,
                        min: min,
                    };
                    return a;
                }, {});
            }
            final.sort(function (a, b) {
                if (sortItem_1.stack) {
                    return basicSort_1(calcStackedValue_1(a, sortItem_1, maxValues_1), calcStackedValue_1(b, sortItem_1, maxValues_1), sortItem_1.asc);
                }
                return basicSort_1(a[sortItem_1.column], b[sortItem_1.column], sortItem_1.asc);
            });
        }
        return final;
    };
    return JSONDataProvider;
}());
exports.JSONDataProvider = JSONDataProvider;
