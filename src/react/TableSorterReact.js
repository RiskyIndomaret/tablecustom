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
var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var TableSorter_1 = require("../TableSorter");
require("../css/TableSorter.scss");
;
/**
 * Thin wrapper around TableSorter
 */
var TableSorter = (function (_super) {
    __extends(TableSorter, _super);
    function TableSorter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TableSorter.prototype.componentDidMount = function () {
        this.node = ReactDOM.findDOMNode(this);
        this.tableSorter = new TableSorter_1.TableSorter($(this.node));
        this.attachEvents();
        this.renderContent();
    };
    TableSorter.prototype.componentWillReceiveProps = function (newProps) {
        this.renderContent(newProps);
    };
    /**
     * Renders this component
     */
    TableSorter.prototype.render = function () {
        return React.createElement("div", { className: "tablesorter-react" });
    };
    /**
     * Attaches the events
     */
    TableSorter.prototype.attachEvents = function () {
        var _this = this;
        var guardedEventer = function (evtName) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (_this.props[evtName]) {
                    _this.props[evtName].apply(_this, args);
                }
            };
        };
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.SELECTION_CHANGED, guardedEventer("onSelectionChanged"));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.LOAD_MORE_DATA, guardedEventer("onLoadMoreData"));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.FILTER_CHANGED, guardedEventer("onFilterChanged"));
        this.tableSorter.events.on(TableSorter_1.TableSorter.EVENTS.SORT_CHANGED, guardedEventer("onSortChanged"));
    };
    TableSorter.prototype.renderContent = function (props) {
        // if called from `componentWillReceiveProps`, then we use the new
        // props, otherwise use what we already have.
        props = props || this.props;
        this.tableSorter.settings = this.getSettingsFromProps(props);
        // this.tableSorter.count = props.count || 100;
        if (props.provider && props.cols) {
            var config = this.tableSorter.configuration || {
                primaryKey: props.cols[0].column,
                columns: [],
            };
            config.columns = props.cols;
            this.tableSorter.configuration = config;
        }
        this.tableSorter.dataProvider = props.provider;
        if (props.width || props.height) {
            this.tableSorter.dimensions = { width: props.width, height: props.height };
        }
    };
    /**
     * Converts the tablesorter props to settings
     */
    TableSorter.prototype.getSettingsFromProps = function (props) {
        return {
            selection: {
                singleSelect: props.singleSelect,
                multiSelect: props.multiSelect,
            },
            presentation: {
                values: props.showValues,
                stacked: props.showStacked,
                histograms: props.showHistograms,
                animation: props.showAnimations,
            },
        };
    };
    return TableSorter;
}(React.Component));
exports.TableSorter = TableSorter;
