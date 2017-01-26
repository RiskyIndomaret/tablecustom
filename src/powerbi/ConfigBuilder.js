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
var models_1 = require("../models");
var pbi_base_1 = require("@essex/pbi-base");
var _ = require("lodash");
var d3 = require("d3");
var naturalSort = require("javascript-natural-sort"); // tslint:disable-line
var ldget = require("lodash/get"); // tslint:disable-line
/**
 * The prefix for the generated rank column names
 */
var GENERATED_COLUMN_NAME_PREFIX = "GENERATED_RANK_LEVEL_";
/**
 * Indicates that a lower number rank is actually of higher value
 * i.e. Positions in a race, #1 is better than #5
 */
exports.LOWER_NUMBER_HIGHER_VALUE = true;
/**
 * Generates a table sorter compatible configuration from a dataView
 * @param dataView The dataView to generate the configuration from
 * @param data The set of data parsed from the data view
 * @param colorSettings The color settings to use when coloring rank columns
 * @param resetRankLayout If true the generated rank column layouts will be reset
 * @param reverseRankingColumns If true, the generated rank column order will be reversed
 */
function default_1(dataView, data, colorSettings, resetRankLayout, reverseRankingColumns) {
    "use strict";
    if (resetRankLayout === void 0) { resetRankLayout = true; }
    if (reverseRankingColumns === void 0) { reverseRankingColumns = false; }
    if (dataView) {
        // Initially parse all of the columns from the data view so we know the valid columns
        var validColumns = parseColumnsFromDataView(dataView, data);
        // Attempt to load the existing table sorter config from powerbi
        var config = void 0;
        if (dataView.metadata && dataView.metadata.objects && dataView.metadata.objects["layout"]) {
            var configStr = dataView.metadata.objects["layout"]["layout"];
            if (configStr) {
                config = JSON.parse(configStr);
            }
        }
        // Generate the "rank" columns and append them to the set of valid columns
        var rankResult_1 = parseRankColumns(dataView, colorSettings, reverseRankingColumns);
        if (rankResult_1) {
            validColumns.some(function (c) {
                if (c.column === rankResult_1.info.column.displayName) {
                    c.type = "string";
                    delete c["domain"];
                    return true;
                }
            });
            validColumns = validColumns.concat(rankResult_1.columns);
        }
        // If we don't have a config, then just create a simple one
        if (!config) {
            config = {
                primaryKey: validColumns[0].label,
                columns: validColumns,
            };
        }
        else {
            // Otherwise we need to do some additional processing
            processExistingConfig(config, validColumns);
        }
        // Process the configuration with the current rank information
        processConfigWithRankResult(config, rankResult_1, resetRankLayout);
        return config;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
/**
 * Parses the rank columns from the dataview (if necessary)
 * @param dataView The DataView to parse the rank columns from
 * @param colorSettings The settings to use when coloring the rank columns
 * @param reverseRankingColumns If true, the generated rank columns will be reversed
 */
function parseRankColumns(dataView, colorSettings, reverseRankingColumns) {
    "use strict";
    if (reverseRankingColumns === void 0) { reverseRankingColumns = false; }
    var ci = calculateRankingInfo(dataView);
    if (ci) {
        var colors_1 = calculateRankColors(ci.values, colorSettings);
        if (reverseRankingColumns) {
            ci.values.reverse();
        }
        var toCompare_1 = d3.extent(ci.values)[exports.LOWER_NUMBER_HIGHER_VALUE ? 0 : 1];
        return {
            columns: ci.values.map(function (n, i) {
                return {
                    label: (n !== toCompare_1 ? "≥" : "") + " " + n,
                    column: "" + GENERATED_COLUMN_NAME_PREFIX + n,
                    bucket: n,
                    type: "string",
                    width: 60,
                    color: colors_1[n],
                    filterable: false,
                    sortable: false,
                    isConfidence: true,
                };
            }),
            info: ci,
        };
    }
}
/**
 * Parses columns from a data view
 * @param dataView The dataView to get the columns from
 * @param data The data set that is being loaded
 */
function parseColumnsFromDataView(dataView, data) {
    "use strict";
    var dataViewTable = dataView.table;
    // Sometimes columns come in undefined
    return dataViewTable.columns.slice(0)
        .filter(function (n) { return !!n; })
        .map(function (c) {
        var base = {
            label: c.displayName,
            column: c.displayName,
            type: c.type.numeric ? "number" : "string",
        };
        if (c.type.numeric) {
            _.merge(base, {
                domain: calcDomain(data, base.column),
            });
        }
        return base;
    });
}
/**
 * Processes the configuration with the given rank result
 * @param config The configuration being loaded
 * @param rankResult The result from the rank generation
 * @param resetRankLayout If true, the layout for the generated rank columns will be reset
 */
function processConfigWithRankResult(config, rankResult, resetRankLayout) {
    "use strict";
    // If we have rank columns, then augment the layout config to take them into account
    // Important we do this here, after the processExistingConfig as it removes missing columns.
    if (rankResult) {
        // Create an empty layout if necessary
        if (!config.layout || !config.layout.primary) {
            config.layout = {
                primary: config.columns.slice(0),
            };
        }
        config.layout.primary = config.layout.primary.filter(function (c) {
            // Find the column that is mapped by the user as the "Rank" field/column, and set its type to "string".
            if (c.column === rankResult.info.column.displayName) {
                c.type = "string";
                delete c.domain;
                delete c.histogram;
            }
            else if (resetRankLayout) {
                // If we are resetting the rank layout, then remove all the "Rank" columns
                var rankColumn = rankResult.columns.filter(function (n) { return n.column === c.column; })[0];
                if (rankColumn) {
                    return false;
                }
            }
            return true;
        });
        // We removed the rank columns, readd them
        if (resetRankLayout) {
            config.layout.primary = config.layout.primary.concat(rankResult.columns);
        }
    }
}
/**
 * Processes the existing config, removing unnecessary columns, and does some additional processing
 * @param config The config to process
 * @param columns The set of valid columns
 */
function processExistingConfig(config, columns) {
    "use strict";
    var newColNames = columns.map(function (c) { return c.column; });
    var oldConfig = _.merge({}, config);
    var oldCols = config.columns || [];
    // Filter out any columns that don't exist anymore
    config.columns = oldCols.filter(function (c) {
        return newColNames.indexOf(c.column) >= 0;
    });
    // Override the domain, with the newest data
    oldCols.forEach(function (n) {
        var newCol = columns.filter(function (m) { return m.column === n.column; })[0];
        if (newCol) {
            if (newCol.domain) {
                // Reset the domain, cause we now have a new set of data
                n.domain = newCol.domain.slice(0);
            }
            n.color = newCol.color;
        }
    });
    // Sort contains a missing column
    if (config.sort && newColNames.indexOf(config.sort.column) < 0 && !config.sort.stack) {
        config.sort = undefined;
    }
    // If we have a layout
    if (config.layout && config.layout.primary) {
        config.layout.primary = syncLayoutColumns(config.layout.primary, config.columns, oldConfig.columns);
    }
    removeMissingColumns(config, columns);
}
exports.processExistingConfig = processExistingConfig;
/**
 * Removes all missing columns from the configuration
 * @param config The config to remove columns from
 * @param columns The set of valid columns
 */
function removeMissingColumns(config, columns) {
    "use strict";
    pbi_base_1.listDiff(config.columns.slice(0), columns, {
        /**
         * Returns true if item one equals item two
         */
        equals: function (one, two) { return one.column === two.column; },
        /**
         * Gets called when the given item was removed
         */
        onRemove: function (item) {
            for (var i = 0; i < config.columns.length; i++) {
                if (config.columns[i].column === item.column) {
                    config.columns.splice(i, 1);
                    break;
                }
            }
        },
        /**
         * Gets called when the given item was added
         */
        onAdd: function (item) {
            config.columns.push(item);
            if (config.layout && config.layout.primary) {
                // If it is a confidence column, then try to find the best spot
                var idx_1;
                if (item["isConfidence"]) {
                    config.layout.primary.some(function (c, i) {
                        // The column may not have a 'column' property if it is a stacked column
                        if (c.column && c.column.indexOf(GENERATED_COLUMN_NAME_PREFIX) >= 0) {
                            var bucket = parseFloat(c.column.split(GENERATED_COLUMN_NAME_PREFIX)[1]);
                            if (bucket >= item["bucket"]) {
                                idx_1 = i;
                                return true;
                            }
                        }
                    });
                }
                var newLayoutCol = {
                    // color: item.color,
                    width: item.width || 100,
                    column: item.column,
                    type: item.type,
                };
                if (idx_1) {
                    config.layout.primary.splice(idx_1, 0, newLayoutCol);
                }
                else {
                    config.layout.primary.push(newLayoutCol);
                }
            }
        },
    });
}
/**
 * Synchronizes the layout columns with the actual set of columns to ensure that it only has real columns,
 * and the filters are bounded appropriately
 */
function syncLayoutColumns(layoutCols, newCols, oldCols) {
    "use strict";
    newCols = newCols || [];
    oldCols = oldCols || [];
    layoutCols = layoutCols || [];
    var columnFilter = function (c) {
        // If this column exists in the new sets of columns, pass the filter
        var newCol = newCols.filter(function (m) { return m.column === c.column; })[0];
        var result = !!newCol;
        if (newCol) {
            // Bound the filted domain to the actual domain (in case they set a bad filter)
            var oldCol = oldCols.filter(function (m) { return m.column === c.column; })[0];
            if (c.domain) {
                // It is filtered if the "filter" domain is different than the actual domain
                var isFiltered = isValidDomain(c.domain) && isValidDomain(oldCol.domain) &&
                    (c.domain[0] !== oldCol.domain[0] || c.domain[1] !== oldCol.domain[1]);
                var lowerBound = newCol.domain[0];
                var upperBound = newCol.domain[1];
                // If it was filtered before, then copy over the filter, but bound it to the new domain
                if (isFiltered) {
                    lowerBound = Math.max(newCol.domain[0], c.domain[0]);
                    upperBound = Math.min(newCol.domain[1], c.domain[1]);
                }
                c.domain = [lowerBound, upperBound];
            }
        }
        if (c.children) {
            c.children = c.children.filter(columnFilter);
            return c.children.length > 0;
        }
        return result;
    };
    return layoutCols.filter(columnFilter);
}
exports.syncLayoutColumns = syncLayoutColumns;
/**
 * Returns true if the given domain is valid
 */
function isValidDomain(domain) {
    "use strict";
    return domain && domain.length === 2 && domain[0] !== null && domain[0] !== undefined && domain[1] !== null && domain[1] !== undefined; // tslint:disable-line
}
/**
 * Calculates the domain of the given column
 */
function calcDomain(data, name) {
    "use strict";
    var min;
    var max;
    data.forEach(function (m) {
        var val = m[name];
        if (val !== null && val !== undefined) {
            if (typeof min === "undefined" || val < min) {
                min = val;
            }
            if (typeof max === "undefined" || val > max) {
                max = val;
            }
        }
    });
    return [min || 0, max || 0];
}
exports.calcDomain = calcDomain;
;
/**
 * Calculates all of the ranking values from the given dataview
 * @param dataView The dataView to calculate the ranking info for
 */
function calculateRankingInfo(dataView) {
    "use strict";
    if (dataView && dataView.table && dataView.table.rows) {
        var rankingColumnInfo_1 = dataView.table.columns
            .map(function (n, i) { return ({
            column: n,
            idx: i,
        }); })
            .filter(function (n) { return n && isRankColumn(n.column); })[0]; // Do the filter after, so the index is retained correctly
        if (rankingColumnInfo_1) {
            var values = Object.keys(dataView.table.rows
                .reduce(function (a, b) {
                a[b[rankingColumnInfo_1.idx]] = 1;
                return a;
            }, {}))
                .map(function (n) { return parseFloat(n); })
                .sort(naturalSort);
            return {
                column: rankingColumnInfo_1.column,
                values: values,
            };
        }
    }
}
exports.calculateRankingInfo = calculateRankingInfo;
/**
 * Calculates the rank colors from a set of ranks
 */
function calculateRankColors(ranks, colorSettings) {
    "use strict";
    var min = d3.min(ranks);
    var max = d3.max(ranks);
    colorSettings = colorSettings || {};
    var gradientScale;
    if (colorSettings.colorMode === models_1.ColorMode.Gradient) {
        var gradientInfo = ldget(colorSettings, "rankGradients", {});
        var finalMin = ldget(gradientInfo, "startValue", min);
        var finalMax = ldget(gradientInfo, "endValue", max);
        var finalStartColor = ldget(gradientInfo, "startColor", "#bac2ff");
        var finalEndColor = ldget(gradientInfo, "endColor", "#0229bf");
        gradientScale = d3.scale.linear()
            .domain([finalMin, finalMax])
            .interpolate(d3.interpolateRgb)
            .range([finalStartColor, finalEndColor]);
    }
    return (ranks || []).reduce(function (a, b) {
        a[b] = gradientScale ? gradientScale(b) : ldget(colorSettings, "rankInstanceColors[\"" + b + "\"]", "#cccccc");
        return a;
    }, {});
}
exports.calculateRankColors = calculateRankColors;
/**
 * Determines if the given powerbi metadata column is the rank column
 */
function isRankColumn(column) {
    "use strict";
    return !!(column && column.roles["Rank"] && column.type.numeric);
}
exports.isRankColumn = isRankColumn;
