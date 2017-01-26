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
var $ = require("jquery");
var d3 = require("d3");
var _ = require("lodash");
/**
 * Converts the current set of lineup filters into ones compatible with table sorter
 */
function convertFilters(lineupImpl, filteredColumn) {
    "use strict";
    if (lineupImpl) {
        var fDesc_1 = filteredColumn && filteredColumn.description();
        var descs = lineupImpl.storage.getColumnLayout()
            .map((function (d) {
            // Because of how we reload the data while filtering, the columns can get out of sync
            var base = d.description();
            if (fDesc_1 && fDesc_1.column === base.column) {
                base = fDesc_1;
                d = filteredColumn;
            }
            if (d.scale) {
                base.domain = d.scale.domain();
            }
            return base;
        }));
        var filters_1 = [];
        descs.forEach(function (n) {
            var filter = convertFilterFromDesc(n);
            if (filter) {
                filters_1.push(filter);
            }
        });
        return filters_1;
    }
}
exports.convertFilters = convertFilters;
/**
 * Converts the current set of lineup filters on the layout object into ones compatible with table sorter
 * @param layoutObj The layout object to extract the filters from
 */
function convertFiltersFromLayout(layoutObj) {
    "use strict";
    if (layoutObj) {
        var filters_2 = [];
        layoutObj.forEach(function (n) {
            var filter = convertFilterFromDesc(n);
            if (filter) {
                filters_2.push(filter);
            }
        });
        return filters_2;
    }
}
exports.convertFiltersFromLayout = convertFiltersFromLayout;
/**
 * Converts a filter from the given lineup description
 * @param desc The description to get the filter from
 */
function convertFilterFromDesc(desc) {
    "use strict";
    // A filter without a column is kind of useless
    if (desc && desc.column) {
        if (desc.filter) {
            // These can be arrays or strings
            if (typeof desc.filter === "string") {
                return {
                    column: desc.column,
                    value: desc.filter || undefined,
                };
            }
            else {
                return {
                    column: desc.column,
                    value: {
                        values: desc.filter || undefined,
                    },
                };
            }
        }
        else if (desc.domain) {
            return {
                column: desc.column,
                value: {
                    domain: desc.domain,
                    range: desc.range,
                },
            };
        }
    }
}
exports.convertFilterFromDesc = convertFilterFromDesc;
/**
 * Converts a table sorter compatible configuration from the given lineup instance
 * @param lineupImpl The lineup instance to create from
 * @param filteredColumn The filtered column that caused this conversion to occur.
 */
function convertConfiguration(lineupImpl, filteredColumn) {
    "use strict";
    // TODO: filteredColumn is not a great fix.  The problem is when we filter a column, we reload lineup with new data/columns
    // but the UI remains open, and has a reference to an old column. filteredColumn is that old column.
    // full spec
    var dataSpec = lineupImpl.spec.dataspec;
    var s = $.extend(true, {}, {
        columns: dataSpec.columns.map(function (n) {
            return _.merge({}, n, {});
        }),
        primaryKey: dataSpec.primaryKey,
    });
    // create current layout
    var descs = lineupImpl.storage.getColumnLayout()
        .map(function (d) {
        var base = d.description();
        if (filteredColumn) {
            var fDesc = filteredColumn.description();
            if (fDesc.column === base.column) {
                base = fDesc;
                d = filteredColumn;
            }
        }
        var result = _.merge({}, base, {
            domain: d.scale ? d.scale.domain() : undefined,
        });
        // If it is set to false or whatever, just remove it
        if (!result.filter) {
            delete result.filter;
        }
        return result;
    });
    // s.filters = this.getFiltersFromLineup();
    s.layout = _.groupBy(descs, function (d) { return d.columnBundle || "primary"; });
    s.sort = convertSort(lineupImpl);
    return s;
}
exports.convertConfiguration = convertConfiguration;
/**
 * Converts the current lineup sort into one compatible with table sorter
 * @param lineupImpl The lineup instance to get the sort from
 */
function convertSort(lineupImpl) {
    "use strict";
    if (lineupImpl && lineupImpl.storage) {
        var primary = lineupImpl.storage.config.columnBundles.primary;
        var col_1 = primary.sortedColumn;
        if (col_1) {
            if (col_1.column) {
                return {
                    column: col_1.column.column,
                    asc: primary.sortingOrderAsc,
                };
            }
            var totalWidth_1 = d3.sum(col_1.childrenWidths);
            return {
                stack: {
                    name: col_1.label,
                    columns: col_1.children.map(function (a, i) {
                        return {
                            column: a.column.column,
                            weight: col_1.childrenWidths[i] / totalWidth_1,
                        };
                    }),
                },
                asc: primary.sortingOrderAsc,
            };
        }
    }
}
exports.convertSort = convertSort;
