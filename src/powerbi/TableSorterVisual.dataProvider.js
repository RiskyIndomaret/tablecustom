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
var JSONDataProvider_1 = require("../providers/JSONDataProvider");
var TableSorterVisual_defaults_1 = require("./TableSorterVisual.defaults");
/**
 * The data provider for our table sorter
 */
var MyDataProvider = (function (_super) {
    __extends(MyDataProvider, _super);
    function MyDataProvider(data, domains, hasMoreData, onLoadMoreData) {
        var _this = _super.call(this, data, domains, true, true, TableSorterVisual_defaults_1.LOAD_COUNT) || this;
        _this.hasMoreData = hasMoreData;
        return _this;
    }
    /**
     * Determines if the dataset can be queried again
     * @param options The query options to control how the query is performed
     */
    MyDataProvider.prototype.canQuery = function (options) {
        return _super.prototype.canQuery.call(this, options);
    };
    /**
     * Runs a query against the server
     * @param options The query options to control how the query is performed
     */
    MyDataProvider.prototype.query = function (options) {
        return _super.prototype.query.call(this, options);
    };
    ;
    return MyDataProvider;
}(JSONDataProvider_1.JSONDataProvider));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MyDataProvider;
