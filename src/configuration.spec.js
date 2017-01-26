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
var configuration_1 = require("./configuration");
var chai_1 = require("chai");
describe("configuration", function () {
    var CONFIG_WITH_LAYOUT_COLUMN_NAME = "HELLO";
    var CONFIG_WITH_LAYOUT_FILTER_TEXT = "FILTER_TEXT";
    var CONFIG_WITH_LAYOUT = function () { return ({
        layout: {
            primary: [{
                    column: CONFIG_WITH_LAYOUT_COLUMN_NAME,
                }],
        },
    }); };
    var CONFIG_WITH_LAYOUT_AND_FILTER = function () { return ({
        layout: {
            primary: [{
                    column: CONFIG_WITH_LAYOUT_COLUMN_NAME,
                    filter: CONFIG_WITH_LAYOUT_FILTER_TEXT,
                }],
        },
    }); };
    describe("hasLayoutChanged", function () {
        it("should return false if only the rank column has changed", function () {
            var rankConfig = CONFIG_WITH_LAYOUT();
            // Add a rank column, otherwise identical
            rankConfig.layout.primary.push({
                type: "rank",
            });
            var result = configuration_1.hasLayoutChanged(rankConfig, CONFIG_WITH_LAYOUT());
            chai_1.expect(result).to.be.false;
        });
        it("should return true if the old layout is undefined", function () {
            var result = configuration_1.hasLayoutChanged(undefined, CONFIG_WITH_LAYOUT());
            chai_1.expect(result).to.be.true;
        });
        it("should return true if the new layout is undefined", function () {
            var result = configuration_1.hasLayoutChanged(CONFIG_WITH_LAYOUT(), undefined);
            chai_1.expect(result).to.be.true;
        });
        it("should return false if both are undefined", function () {
            var result = configuration_1.hasLayoutChanged(undefined, undefined);
            chai_1.expect(result).to.be.false;
        });
        it("should return true if the filters have changed", function () {
            var result = configuration_1.hasLayoutChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT_AND_FILTER());
            chai_1.expect(result).to.be.true;
        });
        it("should return false if nothing has changed", function () {
            var result = configuration_1.hasLayoutChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT());
            chai_1.expect(result).to.be.false;
        });
    });
    describe("hasConfigurationChanged", function () {
        it("should return true if the old configuration is undefined", function () {
            var result = configuration_1.hasConfigurationChanged(undefined, CONFIG_WITH_LAYOUT());
            chai_1.expect(result).to.be.true;
        });
        it("should return true if the new configuration is undefined", function () {
            var result = configuration_1.hasConfigurationChanged(CONFIG_WITH_LAYOUT(), undefined);
            chai_1.expect(result).to.be.true;
        });
        it("should return false if both are undefined", function () {
            var result = configuration_1.hasConfigurationChanged(undefined, undefined);
            chai_1.expect(result).to.be.false;
        });
        it("should return true if the filters have changed within the layout", function () {
            var result = configuration_1.hasConfigurationChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT_AND_FILTER());
            chai_1.expect(result).to.be.true;
        });
        it("should return false if nothing has changed within the layout", function () {
            var result = configuration_1.hasConfigurationChanged(CONFIG_WITH_LAYOUT(), CONFIG_WITH_LAYOUT());
            chai_1.expect(result).to.be.false;
        });
    });
});
