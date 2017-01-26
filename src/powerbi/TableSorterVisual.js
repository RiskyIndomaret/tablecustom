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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var pbi_base_1 = require("@essex/pbi-base");
var $ = require("jquery");
var d3 = require("d3");
var TableSorter_1 = require("../TableSorter");
var Utils_1 = require("./Utils");
var es6_promise_1 = require("es6-promise");
var TableSorterVisual_capabilities_1 = require("./TableSorterVisual.capabilities");
var TableSorterVisual_dataProvider_1 = require("./TableSorterVisual.dataProvider");
var ConfigBuilder_1 = require("./ConfigBuilder");
var TableSorter_defaults_1 = require("../TableSorter.defaults");
var _ = require("lodash");
var SelectionId = powerbi.visuals.SelectionId;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var SQExprBuilder = powerbi.data.SQExprBuilder;
var valueFormatterFactory = powerbi.visuals.valueFormatter.create;
var settings_1 = require("./settings");
/* tslint:disable */
var log = pbi_base_1.logger("essex:widget:TableSorterVisual");
var CSS_MODULE = require("!css!sass!./css/TableSorterVisual.scss");
var vendorPrefix = (function getVendorPrefix() {
    var styles = window.getComputedStyle(document.documentElement, "");
    return (Array.prototype.slice
        .call(styles)
        .join("")
        .match(/-(moz|webkit|ms)-/) || (styles["OLink"] === "" && ["", "-o-"]))[0];
})();
/* tslint:enable */
/**
 * The visual which wraps TableSorter
 */
var TableSorterVisual = TableSorterVisual_1 = (function (_super) {
    __extends(TableSorterVisual, _super);
    /**
     * The constructor for the visual
     * @param noCss If true, no css will be loaded
     * @param initialSettings The initial set of settings to use
     * @param updateTypeGetterOverride An override for the update type gettter.
     */
    function TableSorterVisual(noCss, initialSettings, updateTypeGetterOverride) {
        if (noCss === void 0) { noCss = false; }
        var _this = _super.call(this, "TableSorter", noCss) || this;
        /**
         * The list of listeners on the table sorter
         */
        _this.listeners = [];
        _this.destroyed = false;
        /**
         * A simple debounced function to update the configuration
         */
        _this.configurationUpdater = _.debounce(function () {
            var config = _this.tableSorter.configuration;
            var objects = {
                merge: [
                    {
                        objectName: "layout",
                        properties: {
                            "layout": JSON.stringify(config),
                        },
                        selector: undefined,
                    },
                ],
            };
            log("Updating Config");
            _this.propertyPersister.persist(false, objects);
        }, 100);
        /**
         * A debounced version of the selection changed event listener
         * @param rows The rows that are selected
         */
        _this.onSelectionChanged = _.debounce(function (rows) {
            var filter;
            var multiSelect = _this.tableSorter.settings.selection.multiSelect;
            if (rows && rows.length) {
                var expr_1 = rows[0].filterExpr;
                // If we are allowing multiSelect
                if (rows.length > 0 && multiSelect) {
                    rows.slice(1).forEach(function (r) {
                        expr_1 = powerbi.data.SQExprBuilder.or(expr_1, r.filterExpr);
                    });
                }
                filter = powerbi.data.SemanticFilter.fromSQExpr(expr_1);
            }
            // rows are what are currently selected in lineup
            if (rows && rows.length) {
                // HACK
                _this.selectionManager.clear();
                rows.forEach(function (r) { return _this.selectionManager.select(r.identity, true); });
            }
            else {
                _this.selectionManager.clear();
            }
            var operation = "merge";
            if (!filter) {
                operation = "remove";
            }
            _this.propertyPersister.persist(true, (_a = {},
                _a[operation] = [
                    {
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter,
                        },
                    },
                ],
                _a));
            var _a;
        }, 100);
        _this.initialSettings = initialSettings || {
            presentation: {
                numberFormatter: function (numVal, row, col) {
                    var colName = col && col.column && col.column.column;
                    var actualVal = colName && row[colName];
                    if (colName && (actualVal === null || actualVal === undefined)) {
                        numVal = actualVal;
                    }
                    //return this.numberFormatter.format(numVal);
                    return d3.format(",")(numVal);
                },
                cellFormatter: _this.cellFormatter.bind(_this),
            },
        };
        var className = CSS_MODULE && CSS_MODULE.locals && CSS_MODULE.locals.className;
        if (className) {
            _this.element.addClass(className);
        }
        _this.numberFormatter = valueFormatterFactory({
            value: 0,
            format: "0",
        });
        _this.updateType = updateTypeGetterOverride ? updateTypeGetterOverride : pbi_base_1.updateTypeGetter(_this);
        _this.visualSettings = settings_1.default.create();
        return _this;
    }
    Object.defineProperty(TableSorterVisual.prototype, "template", {
        /* tslint:disable */
        get: function () {
            return "\n            <div>\n                <div class=\"lineup\"></div>\n            </div>\n        ".trim().replace(/\n/g, "");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorterVisual.prototype, "dimensions", {
        /**
         * Getter for dimensions
         */
        get: function () {
            return this._dimensions;
        },
        set: function (value) {
            this._dimensions = value;
            if (this.tableSorter) {
                this.tableSorter.dimensions = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Converts the data from power bi to a data we can use
     * @param view The dataview to load
     * @param selectedIds The list of selected ids
     * @param settings The color settings to use when converting the dataView
     */
    TableSorterVisual.converter = function (view, selectedIds, settings) {
        var data = [];
        var cols;
        var rankingInfo;
        if (view && view.table) {
            var table_1 = view.table;
            var baseRi = ConfigBuilder_1.calculateRankingInfo(view);
            if (baseRi) {
                rankingInfo = baseRi;
                rankingInfo.colors = ConfigBuilder_1.calculateRankColors(baseRi.values, settings);
            }
            var dateCols_1 = table_1.columns.map(function (n, i) { return ({ idx: i, col: n }); }).filter(function (n) { return n.col.type.dateTime; }).map(function (n) {
                return {
                    idx: n.idx,
                    col: n.col,
                    calculator: Utils_1.dateTimeFormatCalculator(),
                };
            });
            cols = table_1.columns.filter(function (n) { return !!n; }) /*.filter(n => !n.roles["Confidence"])*/.map(function (n) { return n.displayName; });
            table_1.rows.forEach(function (row, rowIndex) {
                var identity;
                var newId;
                if (view.categorical && view.categorical.categories && view.categorical.categories.length) {
                    identity = view.categorical.categories[0].identity[rowIndex];
                    newId = SelectionId.createWithId(identity);
                }
                else {
                    newId = SelectionId.createNull();
                }
                // The below is busted > 100
                // let identity = SelectionId.createWithId(this.dataViewTable.identity[rowIndex]);
                var result = {
                    id: newId.key + rowIndex,
                    identity: newId,
                    equals: function (b) { return b.identity.equals(newId); },
                    filterExpr: identity && identity.expr,
                    selected: !!_.find(selectedIds, function (id) { return id.equals(newId); }),
                };
                // Copy over column data
                row.forEach(function (colInRow, i) { return result[table_1.columns[i].displayName] = colInRow; });
                dateCols_1.forEach(function (c) {
                    c.calculator.addToCalculation(result[c.col.displayName]);
                });
                data.push(result);
            });
            dateCols_1.forEach(function (n) {
                var formatter = valueFormatterFactory({
                    format: n.col.format || n.calculator.getFormat(),
                });
                data.forEach(function (result) {
                    result[n.col.displayName] = formatter.format(result[n.col.displayName]);
                });
            });
        }
        return {
            data: data,
            cols: cols,
            rankingInfo: rankingInfo,
        };
    };
    /**
     * The IVIsual.init function
     * Called when the visual is being initialized
     */
    TableSorterVisual.prototype.init = function (options) {
        var _this = this;
        if (!this.destroyed) {
            _super.prototype.init.call(this, options);
            var className = this.myCssModule && this.myCssModule.locals && this.myCssModule.locals.className;
            if (className) {
                this.element.addClass(className);
            }
            this.host = options.host;
            this.propertyPersister = pbi_base_1.createPropertyPersister(this.host, 100);
            this.selectionManager = new SelectionManager({
                hostServices: options.host,
            });
            this.tableSorter = new TableSorter_1.TableSorter(this.element.find(".lineup"));
            this.tableSorter.settings = this.initialSettings;
            this.listeners = [
                this.tableSorter.events.on("selectionChanged", function (rows) { return _this.onSelectionChanged(rows); }),
                this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.CLEAR_SELECTION, function () { return _this.onSelectionChanged(); }),
                this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.LOAD_LINEUP, function () {
                    // We use this.tableSorter.data where because this data is after it has been sorted/filtered...
                    updateRankingColumns(_this._data.rankingInfo, _this.tableSorter.data);
                }),
                this.tableSorter.events.on("configurationChanged", function (config) {
                    if (!_this.handlingUpdate) {
                        _this.configurationUpdater();
                    }
                })
            ];
            this.dimensions = { width: options.viewport.width, height: options.viewport.height };
        }
    };
    /**
     * The IVisual.update function
     * Called when the visual is being initialized.
     * Update is called for data updates, resizes & formatting changes
     */
    TableSorterVisual.prototype.update = function (options) {
        if (!this.destroyed) {
            var updateType = this.updateType();
            this.handlingUpdate = true;
            this.dataView = options.dataViews && options.dataViews[0];
            this.dataViewTable = this.dataView && this.dataView.table;
            log("Update Type: ", updateType);
            _super.prototype.update.call(this, options);
            var oldSettings = this.visualSettings;
            this.visualSettings = this.visualSettings.receiveFromPBI(this.dataView);
            // Assume that data updates won't happen when resizing
            var newDims = { width: options.viewport.width, height: options.viewport.height };
            if ((updateType & pbi_base_1.UpdateType.Resize)) {
                this.dimensions = newDims;
            }
            if (updateType & pbi_base_1.UpdateType.Settings) {
                this.loadSettingsFromPowerBI(oldSettings, this.visualSettings);
            }
            if (updateType & pbi_base_1.UpdateType.Data ||
                // If the layout has changed, we need to reload table sorter
                this.hasLayoutChanged(updateType, options) ||
                // The data may not have changed, but we are loading
                // Necessary because sometimes the user "changes" the filter, but it doesn't actually change the dataset.
                // ie. If the user selects the min value and the max value of the dataset as a filter.
                this.loadResolver ||
                // If the color settings have changed, we need to rerender
                hasColorSettingsChanged(oldSettings, this.visualSettings)) {
                // If we explicitly are loading more data OR If we had no data before, then data has been loaded
                this.waitingForMoreData = false;
                this.waitingForSort = false;
                this.loadDataFromPowerBI(oldSettings, updateType);
            }
            this.handlingUpdate = false;
        }
    };
    /**
     * The IVisual.enumerateObjectInstances function
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    TableSorterVisual.prototype.enumerateObjectInstances = function (options) {
        var instances = (_super.prototype.enumerateObjectInstances.call(this, options) || []);
        var otherInstances = this.visualSettings.buildEnumerationObjects(options.objectName, this.dataView, false);
        if (otherInstances && otherInstances.length) {
            instances = instances.concat(otherInstances);
        }
        return options.objectName === "layout" ? {} : instances.filter(function (n) { return Object.keys(n.properties).length > 0; });
    };
    /**
     * The IVisual.destroy function
     * Destroys this visual
     */
    TableSorterVisual.prototype.destroy = function () {
        if (!this.destroyed) {
            if (this.listeners) {
                this.listeners.forEach(function (n) { return n.destroy(); });
                this.listeners.length = 0;
            }
            if (this.tableSorter) {
                this.tableSorter.destroy();
                delete this.tableSorter;
            }
            this.destroyed = true;
        }
    };
    /**
     * Gets the css used for this element
     */
    TableSorterVisual.prototype.getCss = function () {
        return (_super.prototype.getCss.call(this) || []).concat(CSS_MODULE);
    };
    /**
     * Returns true if the layout has changed in the PBI settings
     * @param updateType The current update type that caused this check
     * @param options The update options that caused this check
     */
    TableSorterVisual.prototype.hasLayoutChanged = function (updateType, options) {
        if (updateType & pbi_base_1.UpdateType.Settings &&
            options.dataViews && options.dataViews.length) {
            if (this.dataView.metadata && this.dataView.metadata.objects && this.dataView.metadata.objects["layout"]) {
                // Basically string compares the two layouts to see if anything has changed
                var layoutChanged = this.dataView.metadata.objects["layout"]["layout"] !== JSON.stringify(this.tableSorter.configuration);
                if (layoutChanged) {
                    log("Layout changed!");
                }
                return layoutChanged;
            }
        }
        return false;
    };
    /**
     * Handles all of the data loading required from power bi during an update call
     * @param oldSettings The settings before the update
     * @param updateType The type of update being performed
     */
    TableSorterVisual.prototype.loadDataFromPowerBI = function (oldSettings, updateType) {
        if (this.dataViewTable) {
            var rankSettings = this.visualSettings.rankSettings;
            var oldRankSettings = oldSettings.rankSettings;
            var newData = TableSorterVisual_1.converter(this.dataView, this.selectionManager.getSelectionIds(), rankSettings);
            var config = ConfigBuilder_1.default(this.dataView, newData.data, rankSettings, 
            // We really only want to reset the rank columns IF the user is JUST toggling the reverse option,
            // Otherwise, this can just be true if we are loading from a refresh
            oldRankSettings.reverseBars !== rankSettings.reverseBars && updateType === pbi_base_1.UpdateType.Settings, rankSettings.reverseBars);
            var selectedRows = newData.data.filter(function (n) { return n.selected; });
            this.tableSorter.configuration = config;
            this._data = newData;
            if (this.loadResolver) {
                log("Resolving additional data");
                var resolver = this.loadResolver;
                delete this.loadResolver;
                resolver(newData.data);
            }
            else {
                log("Loading data into MyDataProvider");
                var domainInfo = config.columns
                    .filter(function (n) { return !!n.domain; })
                    .reduce(function (a, b) { a[b.column] = b.domain; return a; }, {});
                this.tableSorter.dataProvider = this.createDataProvider(newData, domainInfo);
            }
            this.tableSorter.selection = selectedRows;
        }
    };
    /**
     * Loads the settings object from PBI during an update call
     * @param oldState The state before the update call
     * @param newState The state during the update call
     */
    TableSorterVisual.prototype.loadSettingsFromPowerBI = function (oldState, newState) {
        if (this.dataView) {
            // Make sure we have the default values
            var updatedSettings = $.extend(true, {}, this.tableSorter.settings, TableSorterVisual_1.VISUAL_DEFAULT_SETTINGS, this.initialSettings || {}, newState.toJSONObject());
            var doRender = false;
            if (oldState.presentation.labelPrecision !== newState.presentation.labelPrecision ||
                oldState.presentation.labelDisplayUnits !== newState.presentation.labelDisplayUnits) {
                this.numberFormatter = valueFormatterFactory({
                    value: newState.presentation.labelDisplayUnits || 0,
                    format: "0",
                    precision: newState.presentation.labelPrecision || undefined,
                });
                doRender = true;
            }
            doRender = doRender || (oldState.rankSettings.histogram !== newState.rankSettings.histogram);
            if (doRender) {
                this.tableSorter.rerenderValues();
            }
            this.tableSorter.settings = updatedSettings;
        }
    };
    /**
     * Creates a data provider with the given set of data
     * @param newData The data to load
     */
    TableSorterVisual.prototype.createDataProvider = function (newData, domainInfo) {
        var _this = this;
        var firstLoad = true;
        return new TableSorterVisual_dataProvider_1.default(newData.data, domainInfo, function (newQuery) {
            // If it is a new query
            var canLoadMore = firstLoad || newQuery || !!_this.dataView.metadata.segment;
            log("CanLoadMore: " + canLoadMore);
            return canLoadMore;
        }, function (options, newQuery, sortChanged, filterChanged) {
            firstLoad = false;
            _this.waitingForMoreData = true;
            return new es6_promise_1.Promise(function (resolve, reject) {
                if (newQuery) {
                    if (filterChanged) {
                        _this.propertyPersister.persist(false, _this.buildSelfFilter(options.query));
                    }
                    if (sortChanged) {
                        _this.handleSort(options.sort[0]);
                    }
                }
                else {
                    _this.host.loadMoreData();
                }
                _this.loadResolver = resolve;
            });
        });
    };
    /**
     * Handles the sort from the data provider by emitting it to powerbi
     * * Note * Not currently used
     * @param rawSort The sort being performed
     */
    TableSorterVisual.prototype.handleSort = function (rawSort) {
        var _this = this;
        /* tslint:disable */
        var args = null;
        /* tslint:enable */
        if (rawSort) {
            var sorts = [rawSort];
            if (rawSort.stack) {
                sorts = rawSort.stack.columns.map(function (n) {
                    // TODO: Add Weighting Somehow
                    return {
                        column: n.column,
                        asc: rawSort.asc,
                    };
                });
            }
            var sortDescriptors = sorts.map(function (sort) {
                var pbiCol = _this.dataViewTable.columns.filter(function (c) { return !!c && c.displayName === sort.column; })[0];
                return {
                    queryName: pbiCol.queryName,
                    sortDirection: sort.asc ? 1 /* Ascending */ : 2 /* Descending */,
                };
            });
            args = {
                sortDescriptors: sortDescriptors,
            };
        }
        this.waitingForSort = true;
        this.host.onCustomSort(args);
    };
    /**
     * Builds a self filter for PBI from the list of filters
     * @param filters The set of filters that table sorter has applied
     */
    TableSorterVisual.prototype.buildSelfFilter = function (filters) {
        var _this = this;
        var operation = "remove";
        var filter;
        if (filters && filters.length) {
            operation = "replace";
            var finalExpr_1;
            filters.forEach(function (m) {
                var col = _this.dataViewTable.columns.filter(function (n) { return n.displayName === m.column; })[0];
                var colExpr = col.expr;
                var currExpr;
                if (typeof m.value === "string") {
                    currExpr = SQExprBuilder.contains(colExpr, SQExprBuilder.text(m.value));
                }
                else if (m.value.domain) {
                    var numFilter = m.value;
                    currExpr = powerbi.data.SQExprBuilder.between(colExpr, powerbi.data.SQExprBuilder.decimal(numFilter.domain[0]), powerbi.data.SQExprBuilder.decimal(numFilter.domain[1]));
                }
                finalExpr_1 = finalExpr_1 ? powerbi.data.SQExprBuilder.and(finalExpr_1, currExpr) : currExpr;
            });
            filter = powerbi.data.SemanticFilter.fromSQExpr(finalExpr_1);
        }
        return _a = {},
            _a[operation] = [
                {
                    objectName: "general",
                    selector: undefined,
                    properties: {
                        "selfFilter": filter,
                    },
                },
            ],
            _a;
        var _a;
    };
    /**
     * The cell formatter for TableSorter
     * @param selection The d3 selection for the cells being formatted.
     */
    TableSorterVisual.prototype.cellFormatter = function (selection) {
        var _this = this;
        var getColumnColor = function (d) {
            if (_this._data && _this._data.rankingInfo) {
                var _a = _this._data.rankingInfo, values = _a.values, column = _a.column, colors_1 = _a.colors;
                var cellColName = d.column && d.column.column && d.column.column.column;
                var rankColName = column.displayName;
                // If this is  the column we are ranking, then color it
                return cellColName === rankColName ? colors_1[d.row[rankColName]] : undefined;
            }
        };
        var rankHistogram = this.visualSettings.rankSettings.histogram;
        var isConfidence = function (d) {
            // Path: Object -> Layout Column -> Lineup Column -> Config
            var config = pbi_base_1.get(d, function (v) { return v.column.column.config; }, {});
            return config.isConfidence;
        };
        selection
            .style({
            "background": function (d) {
                return rankHistogram && isConfidence(d) && d.label > 1 ?
                    vendorPrefix + ("linear-gradient(bottom, rgba(0,0,0,.2) " + d.label + "%, rgba(0,0,0,0) " + d.label + "%)") :
                    getColumnColor(d);
            },
            "width": function (d) { return d["width"] + (rankHistogram && isConfidence(d) ? 2 : 0) + "px"; },
            "margin-left": function (d) { return rankHistogram && isConfidence(d) ? "-1px" : undefined; },
            "color": function (d) {
                var color = getColumnColor(d) || "#ffffff";
                var d3Color = d3.hcl(color);
                return d3Color.l <= 60 ? "#ececec" : "#333333";
            },
        })
            .text(function (d) { return isConfidence(d) && (d.label + "") === "0" ? " - " : d.label; });
    };
    return TableSorterVisual;
}(pbi_base_1.VisualBase));
/**
 * The set of capabilities for the visual
 */
TableSorterVisual.capabilities = TableSorterVisual_capabilities_1.default;
/**
 * The default settings for the visual
 */
TableSorterVisual.VISUAL_DEFAULT_SETTINGS = $.extend(true, {}, TableSorter_defaults_1.DEFAULT_TABLESORTER_SETTINGS, {
    presentation: {
        columnColors: function (idx) {
            return pbi_base_1.colors[idx % pbi_base_1.colors.length];
        },
    },
    experimental: {
        serverSideSorting: false,
        serverSideFiltering: false,
    },
});
TableSorterVisual = TableSorterVisual_1 = __decorate([
    pbi_base_1.Visual(require("../build.json").output.PowerBI)
], TableSorterVisual);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TableSorterVisual;
/**
 * Updates the data to have the current values of the ranking info, by taking into account filtering and sorting.
 * @param rankingInfo The ranking info to use when updating the column values
 * @param data The current set of data
 */
function updateRankingColumns(rankingInfo, data) {
    "use strict";
    if (rankingInfo) {
        // const data = this._data.data;
        var ranks_1 = rankingInfo.values.slice(0).reverse();
        var runningRankTotal_1 = {};
        var rankCounts_1 = {};
        data.forEach(function (result) {
            var itemRank = result[rankingInfo.column.displayName];
            ranks_1.forEach(function (rank) {
                if (ConfigBuilder_1.LOWER_NUMBER_HIGHER_VALUE ? (itemRank <= rank) : (itemRank >= rank)) {
                    rankCounts_1[rank] = (rankCounts_1[rank] || 0) + 1;
                }
            });
        });
        var precision_1 = Math.max((data.length + "").length - 2, 0);
        data.forEach(function (result, j) {
            // The bucket that this item belongs to
            var itemRank = result[rankingInfo.column.displayName];
            // Go through each bucket in the entire dataset
            for (var i = 0; i < ranks_1.length; i++) {
                var rank = ranks_1[i];
                var positionInBucket = runningRankTotal_1[rank] = runningRankTotal_1[rank] || 0;
                var propName = "GENERATED_RANK_LEVEL_" + rank;
                var value = 0;
                if (ConfigBuilder_1.LOWER_NUMBER_HIGHER_VALUE ? (itemRank <= rank) : (itemRank >= rank)) {
                    var position = ((rankCounts_1[rank] - runningRankTotal_1[rank]) / rankCounts_1[rank]) * 100;
                    value = parseFloat(position.toFixed(precision_1));
                    runningRankTotal_1[rank] = positionInBucket + 1;
                }
                result[propName] = value;
            }
        });
    }
}
/**
 * Returns true if any of the color settings have changed.
 * @param state The previous state
 * @param newState The new state
 */
function hasColorSettingsChanged(state, newState) {
    "use strict";
    if (state && newState) {
        var oldSettings = pbi_base_1.get(state, function (v) { return v.rankSettings; }, {});
        var newSettings = pbi_base_1.get(newState, function (v) { return v.rankSettings; }, {});
        var oldGradient = pbi_base_1.get(state, function (v) { return v.rankSettings.rankGradients; }, {});
        var newGradient = pbi_base_1.get(newState, function (v) { return v.rankSettings.rankGradients; }, {});
        var changed = oldSettings.reverseBars !== newSettings.reverseBars ||
            oldSettings.colorMode !== newSettings.colorMode ||
            oldGradient.endColor !== newGradient.endColor ||
            oldGradient.startColor !== newGradient.startColor ||
            oldGradient.endValue !== newGradient.endValue ||
            oldGradient.startValue !== newGradient.startValue;
        if (!changed) {
            var oldSeriesColors_1 = oldSettings.rankInstanceColors || {};
            var newSeriesColors_1 = newSettings.rankInstanceColors || {};
            // If the entries are different, or any of the values are different
            return !_.isEqual(Object.keys(oldSeriesColors_1), Object.keys(newSeriesColors_1)) ||
                Object.keys(oldSeriesColors_1).filter(function (n) { return newSeriesColors_1[n] !== oldSeriesColors_1[n]; }).length > 0;
        }
        return changed;
    }
    return true;
}
var TableSorterVisual_1;
