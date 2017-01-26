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
var d3 = require("d3");
var _ = require("lodash");
/**
 * Returns true if the given object is numeric
 */
var isNumeric = function (obj) { return (obj - parseFloat(obj) + 1) >= 0; };
/**
 * Derives the table sorter configuration from the given set of data
 * @param data The data to derive the configuration from
 */
function createConfigurationFromData(data) {
    "use strict";
    var EXCLUDED_DATA_COLS = {
        selected: true,
        equals: true,
    };
    function getDataColumnNames() {
        if (data && data.length) {
            return Object.keys(data[0]).filter(function (k) { return !EXCLUDED_DATA_COLS[k]; });
        }
        return [];
    }
    function updateMinMax(minMax, value) {
        if (+value > minMax.max) {
            minMax.max = value;
        }
        else if (+value < minMax.min) {
            minMax.min = +value;
        }
    }
    function isNumericValue(v) {
        // Assume that if null or undefined, it is numeric
        /* tslint:disable */
        return v === 0 || v === null || v === undefined || isNumeric(v);
        /* tslint:enable */
    }
    function analyzeColumn(columnName) {
        var minMax = { min: Number.MAX_VALUE, max: 0 };
        var allNumeric = data.every(function (row) { return isNumericValue(row[columnName]); });
        if (allNumeric) {
            data.forEach(function (row) { return updateMinMax(minMax, row[columnName]); });
        }
        return { allNumeric: allNumeric, minMax: minMax };
    }
    function createLineUpColumn(colName) {
        var result = { column: colName, type: "string" };
        var _a = analyzeColumn(colName), allNumeric = _a.allNumeric, minMax = _a.minMax;
        if (allNumeric) {
            result.type = "number";
            result.domain = [minMax.min, minMax.max];
        }
        // If is a string, try to see if it is a category
        if (result.type === "string") {
            var sset = d3.set(data.map(function (row) { return row[colName]; }));
            if (sset.size() <= Math.max(20, data.length * 0.2)) {
                result.type = "categorical";
                result.categories = sset.values().sort();
            }
        }
        return result;
    }
    var columns = getDataColumnNames().map(createLineUpColumn);
    return {
        primaryKey: "id",
        columns: columns,
    };
}
exports.createConfigurationFromData = createConfigurationFromData;
/**
 * Determines if the two different column sets have changed between two configurations
 */
function haveColumnsChanged(oldCfg, newCfg) {
    "use strict";
    var oldCols = oldCfg && oldCfg.columns;
    var newCols = oldCfg && oldCfg.columns;
    if (!oldCols && !newCols) {
        return false;
    }
    else if (!oldCols || !newCols) {
        return true;
    }
    else {
        if (oldCols.length !== newCols.length) {
            return true;
        }
        var colMapper = function (col) { return _.pick(col, ["column", "label", "type"]); };
        return !_.isEqual(oldCols.map(colMapper), newCols.map(colMapper));
    }
}
exports.haveColumnsChanged = haveColumnsChanged;
/**
 * Determines if the two different layouts have changed between two configurations
 */
function hasLayoutChanged(oldCfg, newCfg) {
    "use strict";
    var rankColumnFilter = function (col) { return col && col.type !== "rank"; }; // Filter out the rank column
    var oldLayout = (oldCfg && oldCfg.layout && oldCfg.layout.primary || []).filter(rankColumnFilter);
    var newLayout = (newCfg && newCfg.layout && newCfg.layout.primary || []).filter(rankColumnFilter);
    return !_.isEqual(oldLayout, newLayout);
}
exports.hasLayoutChanged = hasLayoutChanged;
/**
 * Returns true if the new table sorter configuration has changed between two configurations
 */
function hasConfigurationChanged(nc, oc) {
    "use strict";
    if (!nc && !oc) {
        return false;
    }
    else if (!nc || !oc) {
        return true;
    }
    return !_.isEqual(oc.sort, nc.sort) ||
        haveColumnsChanged(oc, nc) ||
        hasLayoutChanged(oc, nc);
}
exports.hasConfigurationChanged = hasConfigurationChanged;
