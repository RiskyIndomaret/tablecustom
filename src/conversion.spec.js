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
var chai_1 = require("chai");
var _ = require("lodash");
var conversion_1 = require("./conversion");
describe("conversion", function () {
    var STRING_FILTER_DESC_LINEUP = [{
            description: function () { return ({
                column: "FAKE_COLUMN",
                filter: "FAKE_FILTER",
            }); },
        }];
    var STRING_FILTER = [{
            column: "FAKE_COLUMN",
            value: "FAKE_FILTER",
        }];
    var STACKED_NUMERICAL_FILTER_DESC_LINEUP = [{
            description: function () { return ({
                children: [{
                        column: "FAKE_COLUMN",
                        domain: [12, 43],
                        range: [122, 423],
                    }],
                domain: [12, 43],
                range: [122, 423],
            }); },
        }];
    var NUMERICAL_FILTER_DESC_LINEUP = [{
            description: function () { return ({
                column: "FAKE_COLUMN",
                domain: [12, 43],
                range: [122, 423],
            }); },
        }];
    var NUMERICAL_FILTER = [{
            column: "FAKE_COLUMN",
            value: {
                domain: [12, 43],
                range: [122, 423],
            },
        }];
    var FAKE_LINEUP_WITH_STRING_FILTER = { storage: {
            getColumnLayout: function () { return STRING_FILTER_DESC_LINEUP; },
        } };
    describe("convertFilters", function () {
        it("should return an empty object, if undefined is passed to it", function () {
            var result = conversion_1.convertFilters(undefined);
            chai_1.expect(result).to.be.undefined;
        });
        it("should return string filters", function () {
            var result = conversion_1.convertFilters(FAKE_LINEUP_WITH_STRING_FILTER);
            chai_1.expect(result).to.be.deep.equal(STRING_FILTER);
        });
        it("should return numerical filters", function () {
            var result = conversion_1.convertFilters({ storage: {
                    getColumnLayout: function () { return NUMERICAL_FILTER_DESC_LINEUP; },
                } });
            chai_1.expect(result).to.be.deep.equal(NUMERICAL_FILTER);
        });
        it("should return a combination of numerical and string filters", function () {
            var result = conversion_1.convertFilters({ storage: {
                    getColumnLayout: function () { return [NUMERICAL_FILTER_DESC_LINEUP[0], STRING_FILTER_DESC_LINEUP[0]]; },
                } });
            chai_1.expect(result).to.be.deep.equal([NUMERICAL_FILTER[0], STRING_FILTER[0]]);
        });
        it("should return an empty array if there are no columns", function () {
            var result = conversion_1.convertFilters({ storage: {
                    getColumnLayout: function () { return []; },
                } });
            chai_1.expect(result).to.be.deep.equal([]);
        });
    });
    describe("convertFiltersFromLayout", function () {
        it("should return an empty object, if undefined is passed to it", function () {
            var result = conversion_1.convertFiltersFromLayout(undefined);
            chai_1.expect(result).to.be.undefined;
        });
        it("should return a string filter if a layout with a string filter is passed to it", function () {
            var result = conversion_1.convertFiltersFromLayout([STRING_FILTER_DESC_LINEUP[0].description()]);
            chai_1.expect(result).to.be.deep.equal(STRING_FILTER);
        });
        it("should return a numerical filter if a layout with a numerical filter is passed to it", function () {
            var result = conversion_1.convertFiltersFromLayout([NUMERICAL_FILTER_DESC_LINEUP[0].description()]);
            chai_1.expect(result).to.be.deep.equal(NUMERICAL_FILTER);
        });
        it("should not return a filter on a stacked column", function () {
            var result = conversion_1.convertFiltersFromLayout([STACKED_NUMERICAL_FILTER_DESC_LINEUP[0].description()]);
            chai_1.expect(result).to.be.deep.equal([]);
        });
    });
    var SORT_LINEUP = {
        sortingOrderAsc: false,
        sortedColumn: {
            column: {
                column: "FAKE_COLUMN",
            },
        },
    };
    var STACK_SORT_LINEUP = {
        sortingOrderAsc: false,
        sortedColumn: {
            label: "FAKE_LABEL",
            children: [{
                    column: {
                        column: "FAKE_COLUMN",
                    },
                }, {
                    column: {
                        column: "FAKE_COLUMN_2",
                    },
                }],
            childrenWidths: [100, 100],
        },
    };
    var FAKE_LINEUP_WITH_NO_SORT = { storage: { config: { columnBundles: { primary: {} } } } };
    var FAKE_LINEUP_WITH_SORT = { storage: { config: { columnBundles: { primary: SORT_LINEUP } } } };
    var FAKE_LINEUP_WITH_STACK_SORT = { storage: { config: { columnBundles: { primary: STACK_SORT_LINEUP } } } };
    describe("convertSort", function () {
        it("should return an empty sort if there are no columns in lineup", function () {
            var lineupImpl = FAKE_LINEUP_WITH_NO_SORT;
            var result = conversion_1.convertSort(lineupImpl);
            chai_1.expect(result).to.be.deep.equal(undefined);
        });
        it("should return sort for a single column", function () {
            var lineupImpl = FAKE_LINEUP_WITH_SORT;
            var result = conversion_1.convertSort(lineupImpl);
            chai_1.expect(result).to.be.deep.equal({
                column: "FAKE_COLUMN",
                asc: false,
            });
        });
        it("should return sort for a stacked column", function () {
            var lineupImpl = FAKE_LINEUP_WITH_STACK_SORT;
            var result = conversion_1.convertSort(lineupImpl);
            chai_1.expect(result).to.be.deep.equal({
                stack: {
                    name: "FAKE_LABEL",
                    columns: [{
                            column: "FAKE_COLUMN",
                            weight: .5,
                        }, {
                            column: "FAKE_COLUMN_2",
                            weight: .5,
                        }],
                },
                asc: false,
            });
        });
    });
    describe("convertConfiguration", function () {
        it("should return a layout with a filter and a sort", function () {
            var result = conversion_1.convertConfiguration(_.merge({
                spec: {
                    dataspec: {
                        columns: [{
                                column: "FAKE_COLUMN",
                            }],
                        primaryKey: "primary",
                    },
                },
            }, FAKE_LINEUP_WITH_SORT, FAKE_LINEUP_WITH_STRING_FILTER));
            chai_1.expect(result).to.be.deep.equal({
                columns: [{
                        column: "FAKE_COLUMN",
                    }],
                primaryKey: "primary",
                layout: {
                    primary: [{
                            column: "FAKE_COLUMN",
                            filter: "FAKE_FILTER",
                        }],
                },
                sort: {
                    column: "FAKE_COLUMN",
                    asc: false,
                },
            });
        });
    });
});
