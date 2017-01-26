"use strict";
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
var chai_1 = require("chai");
var JSONDataProvider_1 = require("./JSONDataProvider");
var d3 = require("d3");
describe("JSONDataProvider", function () {
    //
    var TEST_CASE_ONE = [
        {
            "id": 1,
            "num_hashtags": 3,
            "num_mentions": 2,
            "num_tweets": 1,
        },
        {
            "id": 2,
            "num_hashtags": 10,
            "num_mentions": 0,
            "num_tweets": 1,
        },
        {
            "id": 3,
            "num_hashtags": 4,
            "num_mentions": 1,
            "num_tweets": 4,
        },
        {
            "id": 4,
            "num_hashtags": 0,
            "num_mentions": 0,
            "num_tweets": 9,
        },
    ];
    var TEST_CASE_WITH_NEGATIVES_AND_ZERO = [
        {
            "id": 1,
            "some_value": 2,
            "negative_numbers": 5,
        },
        {
            "id": 2,
            "some_value": 2,
            "negative_numbers": 0,
        },
        {
            "id": 3,
            "some_value": 2,
            "negative_numbers": -5,
        },
        {
            "id": 4,
            "some_value": 2,
            "negative_numbers": -1,
        },
    ];
    var NUMERIC_SAME_DOMAIN = [
        {
            "id": 1,
            "num_hashtags": 3,
            "num_mentions": 100,
        },
        {
            "id": 2,
            "num_hashtags": 3,
            "num_mentions": 200,
        },
        {
            "id": 3,
            "num_hashtags": 3,
            "num_mentions": 50,
        },
    ];
    /* tslint:disable */
    var TEST_DATA_WITH_ALL_NULLS = [{
            id: 1,
            col1: 12,
            null_col: null
        }, {
            id: 2,
            col1: 45,
            null_col: null
        }, {
            id: 3,
            col1: 10,
            null_col: null
        }];
    /* tslint:enable */
    /* tslint:disable */
    var TEST_DATA_WITH_ALL_SOME_NULLS = [{
            id: 1,
            col1: 12,
            some_null_col: null // 0
        }, {
            id: 2,
            col1: 45,
            some_null_col: null // 0
        }, {
            id: 3,
            col1: 10,
            some_null_col: 1 // 1
        }];
    /* tslint:enable */
    /* tslint:disable */
    var TEST_DATA_WITH_ALL_SOME_NULLS_BUT_SAME_VALUES = [{
            id: 1,
            col1: 1,
            some_null_col: null
        }, {
            id: 2,
            col1: 1,
            some_null_col: null
        }, {
            id: 3,
            col1: 1,
            some_null_col: 1
        }];
    /* tslint:enable */
    var createInstance = function (data) {
        var domainInfo = {};
        if (data && data.length) {
            Object.keys(data[0]).forEach(function (prop) {
                var getter = function (i) { return i[prop]; };
                domainInfo[prop] = [d3.min(data, getter), d3.max(data, getter)];
            });
        }
        var result = {
            instance: new JSONDataProvider_1.JSONDataProvider(data, domainInfo),
        };
        return result;
    };
    it("should load", function () {
        createInstance(TEST_DATA_WITH_ALL_NULLS);
    });
    describe("canQuery", function () {
        it("should return true on the initial load, with data", function () {
            var instance = createInstance(NUMERIC_SAME_DOMAIN).instance;
            return instance.canQuery({}).then(function (result) { return chai_1.expect(result).to.be.true; });
        });
        it("should return true on the initial load, with empty data", function () {
            var instance = createInstance([]).instance;
            return instance.canQuery({}).then(function (result) { return chai_1.expect(result).to.be.true; });
        });
        it("should return false after it has been queried, and it has returned all of its data, and it is empty", function () {
            var instance = createInstance([]).instance;
            return instance.canQuery({})
                .then(function (result) { return chai_1.expect(result).to.be.true; }) // First time should be true
                .then(function (result) { return instance.query({}); }) // Query for the first set of data
                .then(function (result) { return instance.canQuery({}); }) // Try to query for the next set of data
                .then(function (result) { return chai_1.expect(result).to.be.false; });
            // It has no more data, and should return false, because it returned the entire set in the first query call
        });
        it("should return false after it has been queried, and it has returned all of its data", function () {
            var instance = createInstance(NUMERIC_SAME_DOMAIN).instance;
            return instance.canQuery({})
                .then(function (result) { return chai_1.expect(result).to.be.true; }) // First time should be true
                .then(function (result) { return instance.query({}); }) // Query for the first set of data
                .then(function (result) { return instance.canQuery({}); }) // Try to query for the next set of data
                .then(function (result) { return chai_1.expect(result).to.be.false; });
            // It has no more data, and should return false, because it returned the entire set in the first query call
        });
        it("should return true after it has been queried, but the filter has been changed", function () {
            var instance = createInstance(NUMERIC_SAME_DOMAIN).instance;
            var FAKE_FILTER = {
                column: "WHATEVER",
                value: "WHATEVER",
            };
            return instance.canQuery({})
                .then(function (result) { return chai_1.expect(result).to.be.true; }) // First time should be true
                .then(function (result) { return instance.query({}); }) // Query for the first set of data
                .then(function (result) { return instance.filter(FAKE_FILTER); }) // Pretend we did a filter
                .then(function (result) { return instance.canQuery({
                query: [FAKE_FILTER],
            }); }) // Try to query for the next set of data
                .then(function (result) { return chai_1.expect(result).to.be.true; });
            // It should return true, because now we are quering for a different set of data (because we changed the filter)
        });
        it("should return true after it has been queried, but the filter has been changed, and empty", function () {
            var instance = createInstance([]).instance;
            var FAKE_FILTER = {
                column: "WHATEVER",
                value: "WHATEVER",
            };
            return instance.canQuery({})
                .then(function (result) { return chai_1.expect(result).to.be.true; }) // First time should be true
                .then(function (result) { return instance.query({}); }) // Query for the first set of data
                .then(function (result) { return instance.filter(FAKE_FILTER); }) // Pretend we did a filter
                .then(function (result) { return instance.canQuery({
                query: [FAKE_FILTER],
            }); }) // Try to query for the next set of data
                .then(function (result) { return chai_1.expect(result).to.be.true; });
            // It should return true, because now we are quering for a different set of data (because we changed the filter)
        });
    });
    describe("query", function () {
        it("should correctly filter columns with negative values and the filter is 0", function () {
            var instance = createInstance(TEST_CASE_WITH_NEGATIVES_AND_ZERO).instance;
            var result = instance.query({
                query: [{
                        column: "negative_numbers",
                        value: {
                            domain: [0, 5],
                            range: [1, 1],
                        },
                    }],
            });
            return result.then(function (r) {
                // There should only be the first two items, since those are the only two between 0 and 5
                chai_1.expect(r.results).to.be.deep.equal(TEST_CASE_WITH_NEGATIVES_AND_ZERO.slice(0, 2));
            });
        });
        it("should not filter out 'null' values if the filtered domain isn't different from the actual domain", function () {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                query: [{
                        column: "some_null_col",
                        value: {
                            domain: [1, 1],
                            range: [1, 1],
                        },
                    }],
            });
            return result.then(function (r) {
                // There should be NO missing elements
                chai_1.expect(r.results).to.be.deep.equal(TEST_DATA_WITH_ALL_SOME_NULLS);
            });
        });
        it("should filter out 'null' values if the filtered domain is different from the actual domain", function () {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                query: [{
                        column: "some_null_col",
                        value: {
                            domain: [0, 1],
                            range: [1, 1],
                        },
                    }],
            });
            return result.then(function (r) {
                // Only the last item has no null values
                chai_1.expect(r.results).to.be.deep.equal([TEST_DATA_WITH_ALL_SOME_NULLS[2]]);
            });
        });
        it("should not include 'null' values if the filtered domain's minimum is 0", function () {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                query: [{
                        column: "some_null_col",
                        value: {
                            domain: [0, 1],
                            range: [1, 1],
                        },
                    }],
            });
            return result.then(function (r) {
                // Only the last item has no null values
                chai_1.expect(r.results).to.be.deep.equal([TEST_DATA_WITH_ALL_SOME_NULLS[2]]);
            });
        });
        it("should not crash if passed an empty column in a filter", function () {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                query: [{
                        column: undefined,
                        value: {
                            domain: [0, 1],
                            range: [1, 1],
                        },
                    }],
            });
            return result
                .then(function (r) {
                chai_1.expect(r.results).to.be.ok;
            }) /*
            .catch(e => { throw e; })*/;
        });
    });
    describe("stacked sorting", function () {
        it("should sort correctly with a column with null values", function (done) {
            var instance = createInstance(TEST_DATA_WITH_ALL_NULLS).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        asc: true,
                        stack: {
                            name: "someName",
                            columns: [{
                                    column: "col1",
                                    weight: .5,
                                }, {
                                    column: "null_col",
                                    weight: .5,
                                }],
                        },
                    }],
            });
            result.then(function (sorted) {
                var mappedResult = sorted.results.map(function (n) { return n.col1; });
                var mapped = TEST_DATA_WITH_ALL_NULLS.map(function (n) { return n.col1; });
                chai_1.expect(mappedResult).to.be.deep.equal([
                    mapped[2],
                    mapped[0],
                    mapped[1],
                ]);
                done();
            })
                .catch(done);
        });
        it("should sort correctly with a column with some null values", function (done) {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        asc: true,
                        stack: {
                            name: "someName",
                            columns: [{
                                    column: "col1",
                                    weight: .5,
                                }, {
                                    column: "some_null_col",
                                    weight: .5,
                                }],
                        },
                    }],
            });
            result.then(function (sorted) {
                var mappedResult = sorted.results.map(function (n) { return n.col1; });
                var mapped = TEST_DATA_WITH_ALL_SOME_NULLS.map(function (n) { return n.col1; });
                chai_1.expect(mappedResult).to.be.deep.equal([
                    mapped[0],
                    mapped[1],
                    mapped[2],
                ]);
                done();
            })
                .catch(done);
        });
        it("should sort correctly with a column with some null values in descending", function (done) {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        asc: false,
                        stack: {
                            name: "someName",
                            columns: [{
                                    column: "col1",
                                    weight: .5,
                                }, {
                                    column: "some_null_col",
                                    weight: .5,
                                }],
                        },
                    }],
            });
            result.then(function (sorted) {
                var mappedResult = sorted.results.map(function (n) { return n.col1; });
                var mapped = TEST_DATA_WITH_ALL_SOME_NULLS.map(function (n) { return n.col1; });
                chai_1.expect(mappedResult).to.be.deep.equal([
                    mapped[1],
                    mapped[2],
                    mapped[0],
                ]);
                done();
            })
                .catch(done);
        });
        it("should sort correctly with a column with some null values but with all other equal values", function (done) {
            var instance = createInstance(TEST_DATA_WITH_ALL_SOME_NULLS_BUT_SAME_VALUES).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        asc: true,
                        stack: {
                            name: "someName",
                            columns: [{
                                    column: "col1",
                                    weight: 1,
                                }, {
                                    column: "some_null_col",
                                    weight: 1,
                                }],
                        },
                    }],
            });
            result.then(function (sorted) {
                var mappedResult = sorted.results.map(function (n) { return n.col1; });
                var mapped = TEST_DATA_WITH_ALL_SOME_NULLS_BUT_SAME_VALUES.map(function (n) { return n.col1; });
                chai_1.expect(mappedResult).to.be.deep.equal([
                    mapped[2],
                    mapped[0],
                    mapped[1],
                ]);
                done();
            })
                .catch(done);
            // Sorting the opposite direction should result in the opposite
            result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        asc: false,
                        stack: {
                            name: "someName",
                            columns: [{
                                    column: "col1",
                                    weight: 1,
                                }, {
                                    column: "some_null_col",
                                    weight: 1,
                                }],
                        },
                    }],
            });
            result.then(function (sorted) {
                var mappedResult = sorted.results.map(function (n) { return n.col1; });
                var mapped = TEST_DATA_WITH_ALL_SOME_NULLS_BUT_SAME_VALUES.map(function (n) { return n.col1; });
                chai_1.expect(mappedResult).to.be.deep.equal([
                    mapped[1],
                    mapped[0],
                    mapped[2],
                ]);
                done();
            })
                .catch(done);
        });
        it("should sort TEST_CASE_1 correctly", function () {
            var instance = createInstance(TEST_CASE_ONE).instance;
            var result = instance.query({
                sort: [{
                        "stack": {
                            "name": "Stacked",
                            "columns": [{
                                    "column": "num_hashtags",
                                    "weight": 1,
                                }, {
                                    "column": "num_mentions",
                                    "weight": 1,
                                }, {
                                    "column": "num_tweets",
                                    "weight": 1,
                                }]
                        },
                        "asc": true,
                    }],
            });
            return result.then(function (resp) {
                var ids = resp.results.map(function (n) { return n.id; });
                chai_1.expect(ids).to.deep.equal([2, 4, 3, 1]);
            });
        });
        it("should sort correctly with negatives and zeros", function () {
            var instance = createInstance(TEST_CASE_WITH_NEGATIVES_AND_ZERO).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        "stack": {
                            "name": "Stacked",
                            "columns": [{
                                    "column": "some_value",
                                    "weight": 1,
                                }, {
                                    "column": "negative_numbers",
                                    "weight": 1,
                                }]
                        },
                        "asc": true,
                    }],
            });
            return result.then(function (resp) {
                var ids = resp.results.map(function (n) { return n.id; });
                chai_1.expect(ids).to.deep.equal([3, 4, 2, 1]);
            });
        });
        it("should sort correctly when a numerical column's min === max", function () {
            var instance = createInstance(NUMERIC_SAME_DOMAIN).instance;
            var result = instance.query({
                // offset: 0,
                // count: 100,
                sort: [{
                        "stack": {
                            "name": "Stacked",
                            "columns": [{
                                    "column": "num_hashtags",
                                    "weight": 1,
                                }, {
                                    "column": "num_mentions",
                                    "weight": 1,
                                }]
                        },
                        "asc": true,
                    }],
            });
            return result.then(function (resp) {
                var ids = resp.results.map(function (n) { return n.id; });
                chai_1.expect(ids).to.deep.equal([3, 1, 2]);
            });
        });
    });
});
