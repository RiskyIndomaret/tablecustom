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
require("@essex/pbi-base/dist/spec/visualHelpers");
var ConfigBuilder_1 = require("./ConfigBuilder");
var chai_1 = require("chai");
describe("ConfigBuilder", function () {
    describe("processExistingConfig", function () {
        it("should not crash if a column has been removed", function () {
            ConfigBuilder_1.processExistingConfig({
                columns: [{
                        column: "SOME_COLUMN",
                    }],
            }, [{
                    column: "SOME_MISSING_COLUMN",
                }]);
        });
    });
    describe("syncLayoutColumns", function () {
        var SIMPLE_COLUMNS = function () { return ([{
                column: "SOME_COLUMN",
                type: "string",
            }]); };
        var SIMPLE_LAYOUT_COLUMNS = function () { return [{
                column: "SOME_COLUMN",
                type: "string",
            }]; };
        var SIMPLE_NUMERICAL_COLUMNS = function () { return ([{
                column: "SOME_COLUMN",
                type: "number",
                domain: [2, 5],
            }]); };
        var SIMPLE_NUMERICAL_LAYOUT_COLUMNS = function () { return [{
                column: "SOME_COLUMN",
                type: "number",
                domain: [2, 5],
            }]; };
        var SIMPLE_NUMERICAL_2_LAYOUT_COLUMNS = function () { return [{
                column: "SOME_COLUMN",
                type: "number",
                domain: [1, 3],
            }]; };
        var SIMPLE_2_COLUMNS = function () { return ([{
                column: "DIFFERENT_COLUMN",
                type: "string",
            }]); };
        var SIMPLE_2_STACKED_COLUMNS = function () { return [{
                column: "STACK",
                type: "string",
                children: [{
                        column: "SOME_COLUMN_2",
                        type: "string",
                    }],
            }]; };
        var SIMPLE_STACKED_MULTIPLE_COLUMNS = function () { return [{
                column: "STACK",
                type: "string",
                children: [{
                        column: "SOME_COLUMN",
                        type: "string",
                    }, {
                        column: "SOME_COLUMN_2",
                        type: "string",
                    }],
            }]; };
        it("should remove missing columns", function () {
            // We switched from "SIMPLE_COLUMNS" to "SIMPLE_2_COLUMNS", with no common columns, so the layout is scrubbed
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_LAYOUT_COLUMNS(), SIMPLE_2_COLUMNS(), SIMPLE_COLUMNS());
            chai_1.expect(result).to.be.deep.equal([]);
        });
        it("should NOT remove columns that still exist", function () {
            // No columns have changed, so it shouldn't change anything
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_LAYOUT_COLUMNS(), SIMPLE_COLUMNS(), SIMPLE_COLUMNS());
            chai_1.expect(result.map(function (n) { return n.column; })).to.be.deep.equal(SIMPLE_COLUMNS().map(function (n) { return n.column; }));
        });
        it("should update the domains (filters) of the layout to be equal to the columns new domain, when not filtered", function () {
            // Sync the new layout columns
            // We indicate that is was not filtered, by the CONFIG_WITH_UNFILTERED_NUMERICAL_COLUMNS
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_NUMERICAL_LAYOUT_COLUMNS(), SIMPLE_NUMERICAL_COLUMNS(), SIMPLE_NUMERICAL_COLUMNS());
            chai_1.expect(result[0].domain).to.be.deep.equal(SIMPLE_NUMERICAL_COLUMNS()[0].domain);
        });
        it("should update the domains (filters) of the layout to be bound to the columns new domain, when filtered", function () {
            // It should bound correctly
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_NUMERICAL_2_LAYOUT_COLUMNS(), SIMPLE_NUMERICAL_COLUMNS(), SIMPLE_NUMERICAL_COLUMNS());
            // [2, 3] is not magical, it is the bounded domain of SIMPLE_NUMERICAL_COLUMNS and SIMPLE_NUMERICAL_2_LAYOUT_COLUMNS
            chai_1.expect(result[0].domain).to.be.deep.equal([2, 3]);
        });
        it("should scrub a stacked column if all the child columns are missing", function () {
            // It should bound correctly
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_2_STACKED_COLUMNS(), SIMPLE_COLUMNS(), SIMPLE_COLUMNS());
            chai_1.expect(result).to.be.deep.equal([]);
        });
        it("should remove child columns from a stacked column if a child column is missing", function () {
            // It should bound correctly
            var result = ConfigBuilder_1.syncLayoutColumns(SIMPLE_STACKED_MULTIPLE_COLUMNS(), SIMPLE_COLUMNS(), SIMPLE_COLUMNS());
            chai_1.expect(result[0].children).to.be.deep.equal(SIMPLE_COLUMNS());
        });
    });
    describe("calcDomain", function () {
        it("should not include 'null' in the min max calculation", function () {
            var result = ConfigBuilder_1.calcDomain([{ a: 10 }, { a: null }, { a: 100 }], "a"); // tslint:disable-line
            chai_1.expect(result).to.be.deep.equal([10, 100]);
        });
        it("should not include 'undefined' in the min max calculation", function () {
            var result = ConfigBuilder_1.calcDomain([{ a: 10 }, { a: undefined }, { a: 100 }], "a"); // tslint:disable-line
            chai_1.expect(result).to.be.deep.equal([10, 100]);
        });
        it("should work with negative numbers", function () {
            var result = ConfigBuilder_1.calcDomain([{ a: -10 }, { a: undefined }, { a: 100 }], "a"); // tslint:disable-line
            chai_1.expect(result).to.be.deep.equal([-10, 100]);
        });
        it("should work with fractions", function () {
            var result = ConfigBuilder_1.calcDomain([{ a: .01 }, { a: undefined }, { a: .102 }], "a"); // tslint:disable-line
            chai_1.expect(result).to.be.deep.equal([.01, .102]);
        });
        it("should work out of order values", function () {
            var result = ConfigBuilder_1.calcDomain([{ a: 100 }, { a: undefined }, { a: 10 }], "a"); // tslint:disable-line
            chai_1.expect(result).to.be.deep.equal([10, 100]);
        });
    });
});
