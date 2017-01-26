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
/* tslint:disable */
require("@essex/pbi-base/dist/spec/visualHelpers");
// import "../base/testSetup";
/* tslint:enable */
var chai_1 = require("chai");
var sinon = require("sinon");
var $ = require("jquery");
var es6_promise_1 = require("es6-promise");
var TableSorter_1 = require("./TableSorter");
var tableSorterMock = require("inject!./TableSorter"); // tslint:disable-line
var conversion_1 = require("./conversion");
// let TableSorterImpl = require("./TableSorter").TableSorter; // tslint:disable-line
describe("TableSorter", function () {
    var parentEle;
    var instances = [];
    beforeEach(function () {
        parentEle = $("<div></div>");
    });
    afterEach(function () {
        instances.forEach(function (n) {
            if (n.lineupImpl && n.lineupImpl.destroy) {
                n.destroy();
            }
        });
        instances.length = 0;
        parentEle = undefined;
    });
    describe("unit", function () {
        /**
         * Returns the given string with px values into a number: 240px => 240
         */
        var pxStrToNum = function (pxStr) {
            return pxStr && parseFloat(pxStr.split(/(px)|%/)[0]);
        };
        /**
         * Creates a new instance of the table sorter
         */
        var createInstance = function (dataProvider) {
            var element = $("<div>");
            var myFakeLineupEle = $("<div><div class='lu-wrapper'></div></div>");
            var mockLineup = {
                clearSelection: sinon.stub(),
                scrolled: sinon.stub(),
                changeInteractionOption: sinon.stub(),
                changeRenderingOption: sinon.stub(),
                changeDataStorage: sinon.stub(),
                select: sinon.stub(),
                sortBy: sinon.stub(),
                updateBody: sinon.stub(),
                addNewSingleColumnDialog: sinon.stub(),
                addNewStackedColumnDialog: sinon.stub(),
                listeners: {
                    on: sinon.stub(),
                },
                $container: {
                    node: sinon.stub(),
                },
            };
            mockLineup.$container.node.returns(myFakeLineupEle);
            var storage = sinon.stub();
            var conversionStubs = {
                convertFilters: sinon.stub(),
                convertConfiguration: sinon.stub(),
                convertSort: sinon.stub(),
                convertFiltersFromLayout: sinon.stub(),
            };
            var ctor = tableSorterMock({
                "./conversion": conversionStubs,
                "lineup-v1": {
                    create: function () {
                        return mockLineup;
                    },
                    createLocalStorage: function () {
                        return storage;
                    },
                },
            }).TableSorter;
            parentEle.append(element);
            var result = {
                instance: (new ctor(element, dataProvider)),
                element: element,
                mockLineup: mockLineup,
                stubs: {
                    conversion: conversionStubs,
                },
            };
            // For cleaning up
            instances.push(result.instance);
            // result.instance.dimensions = { width: 800, height: 20000 };
            result.instance.settings = {
                presentation: {
                    animation: false,
                    values: true,
                    numberFormatter: function (n) { return n + ""; },
                },
            };
            return result;
        };
        /**
         * Creates a fake data provider
         */
        var createProvider = function (data) {
            var resolver;
            var fakeProvider = {
                shouldResolve: true,
                alwaysResolve: true,
                canQuery: function (options) {
                    return es6_promise_1.Promise.resolve(fakeProvider.alwaysResolve || fakeProvider.shouldResolve);
                },
                generateHistogram: function () {
                    return es6_promise_1.Promise.resolve([]);
                },
                query: function (options) {
                    return new es6_promise_1.Promise(function (resolve2) {
                        resolve2({
                            total: data.length,
                            results: data,
                            replace: true,
                        });
                        fakeProvider.shouldResolve = false;
                        // Ghetto hax, 50 because it tries to checkLoadMoreData after 10 seconds.
                        setTimeout(function () {
                            resolver();
                        }, 50);
                    });
                },
            };
            return {
                instanceInitialized: new es6_promise_1.Promise(function (resolve) {
                    resolver = resolve;
                }),
                provider: fakeProvider,
            };
        };
        var loadInstanceWithProvider = function (data, columns) {
            var _a = createInstance(), mockLineup = _a.mockLineup, instance = _a.instance, element = _a.element, stubs = _a.stubs;
            if (columns) {
                // Fake the configuration coming from lineup
                stubs.conversion.convertConfiguration.returns({
                    columns: columns,
                    layout: {
                        primary: [],
                    },
                });
            }
            instance.dimensions = { width: 800, height: 1000 };
            // let data = createFakeData();
            var providerInfo = createProvider(data || []);
            instance.dataProvider = providerInfo.provider;
            return {
                instance: instance,
                element: element,
                mockLineup: mockLineup,
                stubs: stubs,
                columns: columns,
                data: data,
                provider: providerInfo.provider,
                ready: providerInfo.instanceInitialized,
            };
        };
        var testColumns = function () {
            return [{
                    column: "col1",
                    label: "Column",
                    type: "string",
                }, {
                    column: "col2",
                    label: "Column2",
                    type: "number",
                }, {
                    column: "col3",
                    label: "Column3",
                    type: "number",
                }];
        };
        /**
         * Creates a set of fake data
         */
        var createFakeData = function () {
            var rows = [];
            var _loop_1 = function (i) {
                (function (myId) {
                    rows.push({
                        id: myId,
                        col1: myId,
                        col2: i * (Math.random() * 100),
                        col3: i,
                        selected: false,
                        equals: function (other) { return (myId) === other["col1"]; },
                    });
                })("FAKE_" + i);
            };
            for (var i = 0; i < 100; i++) {
                _loop_1(i);
            }
            var cols = testColumns();
            return {
                data: rows,
                columns: cols,
                stringColumns: cols.filter(function (n) { return n.type === "string"; }),
                numberColumns: cols.filter(function (n) { return n.type === "number"; }),
            };
        };
        /**
         * Gets a table sorter listener on a lineup event
         */
        var getLineupEventListener = function (mockLineup, eventName) {
            var callArgs = mockLineup.listeners.on.args.filter(function (n) { return n[0].indexOf(eventName) >= 0; })[0];
            return callArgs[1];
        };
        /**
         * Simulates a sort occuring within lineup
         */
        var simulateLineupSort = function (sort, providerInfo) {
            var stubs = providerInfo.stubs, columns = providerInfo.columns, mockLineup = providerInfo.mockLineup;
            // Update the new configuration to include our fake filter
            stubs.conversion.convertSort.returns(sort);
            stubs.conversion.convertConfiguration.returns({
                columns: columns,
                layout: {
                    primary: [],
                },
                sort: sort,
            });
            // Call TableSorter's listener to let it know about the fake filters
            var listener = getLineupEventListener(mockLineup, "change-sortcriteria");
            listener(undefined, {
                column: {
                    id: sort.column,
                    column: sort.column,
                },
            }, false /* DESC */);
        };
        /**
         * Simulates a sort occuring within lineup
         */
        var simulateLineupFilter = function (filter, providerInfo) {
            var stubs = providerInfo.stubs, columns = providerInfo.columns, mockLineup = providerInfo.mockLineup;
            // Update the new configuration to include our fake filter
            stubs.conversion.convertFilters.returns([filter]);
            stubs.conversion.convertConfiguration.returns({
                columns: columns,
                layout: {
                    primary: [{
                            column: filter.column,
                            filter: filter.value,
                        }],
                },
            });
            // Call TableSorter's listener to let it know about the fake filters
            var listener = getLineupEventListener(mockLineup, "change-filter");
            listener(undefined, {
                column: {
                    column: filter.column,
                },
                filter: filter.value,
            });
        };
        /**
         * Simulates an infinite load event from lineup
         */
        var simulateLineupInfiniteLoad = function (providerInfo) {
            var mockLineup = providerInfo.mockLineup;
            // HACKY: This mimics a scroll event
            var scrollable = parentEle.find(".lu-wrapper");
            scrollable.scrollTop(scrollable.height());
            mockLineup.scrolled();
        };
        /**
         * Loads a tablesorter instance with the given settings
         */
        var loadInstanceWithSettings = function (settings) {
            var _a = createInstance(), instance = _a.instance, element = _a.element, mockLineup = _a.mockLineup;
            var data = createFakeData();
            var _b = createProvider(data.data), provider = _b.provider, instanceInitialized = _b.instanceInitialized;
            instance.dataProvider = provider;
            // Set the settings
            instance.settings = $.extend(true, {}, settings, {
                presentation: {
                    animation: false,
                },
            });
            return {
                instance: instance,
                element: element,
                mockLineup: mockLineup,
                instanceInitialized: instanceInitialized,
                data: data,
            };
        };
        /**
         * Loads the lineup instance with some data
         */
        var loadInstanceWithData = function () {
            var _a = createInstance(), stubs = _a.stubs, mockLineup = _a.mockLineup, instance = _a.instance, element = _a.element;
            instance.dimensions = { width: 800, height: 1000 };
            var data = createFakeData();
            // Fake the configuration coming from lineup
            stubs.conversion.convertConfiguration.returns({
                columns: data.columns,
                layout: {
                    primary: [],
                },
            });
            var providerInfo = createProvider(data.data);
            instance.dataProvider = providerInfo.provider;
            return {
                instance: instance,
                element: element,
                data: data,
                columns: data.columns,
                stubs: stubs,
                mockLineup: mockLineup,
                provider: providerInfo.provider,
                instanceInitialized: providerInfo.instanceInitialized,
            };
        };
        it("should create its element when it is constructed", function () {
            var element = createInstance().element;
            chai_1.expect(element.find(".lineup-component").length).to.be.equal(1);
        });
        it("should be loading when it is first constructed", function () {
            var element = createInstance().element;
            chai_1.expect(element.find(".lineup-component.loading").length).to.be.equal(1);
        });
        it("should set the data provider if a provider is passed via the constructor", function () {
            var provider = createProvider([]).provider;
            var instance = createInstance(provider).instance;
            chai_1.expect(instance.dataProvider).to.equal(provider);
        });
        it("should define the 'events' property on load", function () {
            var instance = createInstance().instance;
            chai_1.expect(instance.events).to.not.be.undefined;
        });
        describe("dimensions", function () {
            it("should not crash/set the dimensions on lineup if there is no lineup", function () {
                var instance = createInstance().instance;
                instance.dimensions = { width: 111, height: 200 };
                chai_1.expect(instance.dimensions).to.be.deep.equal({
                    width: 111,
                    height: 200,
                });
            });
            it("should set the dimensions on lineup", function () {
                var _a = loadInstanceWithProvider(), instance = _a.instance, mockLineup = _a.mockLineup, ready = _a.ready;
                return ready.then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        instance.dimensions = { width: 200, height: 400 };
                        var wrapper = mockLineup.$container.node().find(".lu-wrapper");
                        // This one is different, cause it just fills this container
                        // expect(pxStrToNum(wrapper.css("width"))).to.be.equal(200);
                        chai_1.expect(pxStrToNum(wrapper.css("height"))).to.be.closeTo(400, 20);
                        // We need to wait for the debounce
                        // TODO: Thing about this more...kinda ghetto
                        setTimeout(function () {
                            chai_1.expect(mockLineup.updateBody.called).to.be.true;
                            resolve();
                        }, 150);
                    });
                });
            });
        });
        describe("dataProvider", function () {
            it("should set the dataProvider property", function () {
                var provider = createProvider([]).provider;
                var instance = createInstance().instance;
                instance.dataProvider = provider;
                chai_1.expect(instance.dataProvider).to.equal(provider);
            });
            it("should attempt to load data when the data provider is set", function () {
                var provider = createProvider([]).provider;
                var instance = createInstance().instance;
                var canQuery = provider.canQuery = sinon.stub();
                var query = provider.query = sinon.stub();
                var canQueryPromise = es6_promise_1.Promise.resolve(true);
                // Make sure it returns true
                canQuery.returns(canQueryPromise);
                // Set the provider
                instance.dataProvider = provider;
                return canQueryPromise.then(function () {
                    // expect
                    chai_1.expect(canQuery.calledOnce).to.be.true;
                    chai_1.expect(query.calledOnce).to.be.true;
                });
            });
            it("should raise the loadMoreData event when the dataProvider is set", function () {
                var provider = createProvider([]).provider;
                var instance = createInstance().instance;
                var canQuery = provider.canQuery = sinon.stub();
                var canQueryPromise = es6_promise_1.Promise.resolve(true);
                var called = false;
                instance.events.on(TableSorter_1.TableSorter.EVENTS.LOAD_MORE_DATA, function () {
                    called = true;
                });
                // Make sure it returns true
                canQuery.returns(canQueryPromise);
                // Set the provider
                instance.dataProvider = provider;
                return canQueryPromise.then(function () {
                    chai_1.expect(called).to.be.true;
                });
            });
            it("should attempt to load the data with the correct query options when set", function () {
                var provider = createProvider([]).provider;
                var instance = createInstance().instance;
                var canQuery = provider.canQuery = sinon.stub();
                var canQueryPromise = es6_promise_1.Promise.resolve(true);
                // Make sure it returns true
                canQuery.returns(canQueryPromise);
                instance.dataProvider = provider;
                // Make sure the query options are empty, cause there are no filters/sorts
                chai_1.expect(canQuery.firstCall.args[0]).to.be.deep.equal({});
            });
            it("should attempt to load the data with the correct query options when set and a filter is applied", function () {
                var _a = createFakeData(), data = _a.data, stringColumns = _a.stringColumns, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, provider = providerInfo.provider;
                // After lineup has been initially loaded
                return ready.then(function () {
                    var query = provider.query = sinon.stub();
                    // Mock canQuery so we can check the query options
                    var canQueryPromise = es6_promise_1.Promise.resolve(true);
                    var canQuery = sinon.stub().returns(canQueryPromise);
                    provider.canQuery = canQuery;
                    var FAKE_FILTER = {
                        column: stringColumns[0].column,
                        value: "SOME STRING FILTER",
                    };
                    // Simulate lineup filter call
                    simulateLineupFilter(FAKE_FILTER, providerInfo);
                    // Check to see if it is passing the right filter to canQuery
                    var canQueryOptions = canQuery.lastCall.args[0];
                    chai_1.expect(canQueryOptions.query).to.be.deep.equal([FAKE_FILTER]);
                    // Eventually check the query call
                    return canQueryPromise.then(function () {
                        var queryOptions = query.lastCall.args[0];
                        chai_1.expect(queryOptions.query).to.be.deep.equal([FAKE_FILTER]);
                    });
                });
            });
            it("should attempt to load the data with the correct query options when set and a sort is applied", function () {
                var _a = createFakeData(), data = _a.data, stringColumns = _a.stringColumns, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, provider = providerInfo.provider;
                // After lineup has been initially loaded
                return ready.then(function () {
                    var FAKE_SORT = {
                        column: stringColumns[0].column,
                        asc: false,
                    };
                    var query = provider.query = sinon.stub();
                    // Mock canQuery so we can check the query options
                    var canQueryPromise = es6_promise_1.Promise.resolve(true);
                    var canQuery = sinon.stub().returns(canQueryPromise);
                    provider.canQuery = canQuery;
                    // Simulate the sort
                    simulateLineupSort(FAKE_SORT, providerInfo);
                    // Check to see if it is passing the right filter to canQuery
                    var canQueryOptions = canQuery.lastCall.args[0];
                    chai_1.expect(canQueryOptions.sort).to.be.deep.equal([FAKE_SORT]);
                    // Eventually check the query call
                    return canQueryPromise.then(function () {
                        var queryOptions = query.lastCall.args[0];
                        chai_1.expect(queryOptions.sort).to.be.deep.equal([FAKE_SORT]);
                    });
                });
            });
            it("should replace data, if the DataProvider indicates that it is should be replaced", function () {
                var _a = createFakeData(), data = _a.data, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, provider = providerInfo.provider, instance = providerInfo.instance;
                return ready.then(function () {
                    return new es6_promise_1.Promise(function (done) {
                        provider.query = (function () {
                            var newFakeData = createFakeData();
                            return new es6_promise_1.Promise(function (resolve) {
                                resolve({
                                    replace: true,
                                    results: newFakeData.data,
                                });
                                // SetTimeout is necessary because when you resolve, it doesn't immediately call listeners,
                                // it delays first.
                                setTimeout(function () {
                                    chai_1.expect(instance.data).to.be.deep.equal(newFakeData.data);
                                    done();
                                }, 20);
                            });
                        });
                        var resolved = false;
                        provider.canQuery = function (options) {
                            var promise = es6_promise_1.Promise.resolve(!resolved);
                            resolved = true;
                            return promise;
                        };
                        instance.dataProvider = provider;
                    });
                });
            });
            it("should append data, if the DataProvider indicates that it should be appended", function () {
                var _a = createFakeData(), data = _a.data, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, provider = providerInfo.provider, instance = providerInfo.instance;
                return ready.then(function () {
                    return new es6_promise_1.Promise(function (done) {
                        provider.query = (function () {
                            var newFakeData = createFakeData();
                            return new es6_promise_1.Promise(function (resolve) {
                                resolve({
                                    replace: false,
                                    results: newFakeData.data,
                                });
                                // SetTimeout is necessary because when you resolve, it doesn't immediately call listeners,
                                // it delays first.
                                setTimeout(function () {
                                    chai_1.expect(instance.data).to.be.deep.equal(data.concat(newFakeData.data));
                                    done();
                                }, 20);
                            });
                        });
                        var resolved = false;
                        provider.canQuery = function (options) {
                            var promise = es6_promise_1.Promise.resolve(!resolved);
                            resolved = true;
                            return promise;
                        };
                        simulateLineupInfiniteLoad(providerInfo);
                    });
                });
            });
            it("should call the dataProvider for a histogram when lineup asks for it", function () {
                var _a = createFakeData(), data = _a.data, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, instance = providerInfo.instance, provider = providerInfo.provider;
                return ready.then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        var colToCheck = columns[0];
                        var generateHistogramPromise = es6_promise_1.Promise.resolve([.5, .7, .8, .9]);
                        provider.generateHistogram = function (col, options) {
                            // Make sure the correct column was passed to it
                            chai_1.expect(col).to.be.deep.equal(colToCheck);
                            return generateHistogramPromise;
                        };
                        // TODO: Fix this
                        var lineUpConfig = instance["lineUpConfig"];
                        lineUpConfig.histograms.generator({
                            column: {
                                column: colToCheck.column,
                            },
                        }, function (values) {
                            chai_1.expect(values).to.be.deep.equal([
                                { x: 0, y: 0.5, dx: 0.25 },
                                { x: 0.25, y: 0.7, dx: 0.25 },
                                { x: 0.5, y: 0.8, dx: 0.25 },
                                { x: 0.75, y: 0.9, dx: 0.25 },
                            ]);
                            resolve();
                        }); // tslint:disable-line
                    });
                });
            });
        });
        describe("data", function () {
            it("should initially be empty", function () {
                var instance = createInstance().instance;
                chai_1.expect(instance.data).to.satisfy(function () { return typeof instance.data === "undefined" || instance.data.length === 0; });
            });
            it("should return the last loaded set of data from the dataProvider", function () {
                var _a = createFakeData(), data = _a.data, columns = _a.columns;
                var _b = loadInstanceWithProvider(data, columns), instance = _b.instance, ready = _b.ready;
                return ready.then(function () {
                    chai_1.expect(instance.data).to.be.deep.equal(data);
                });
            });
        });
        describe("settings", function () {
            it("should load some default settings on create", function () {
                var instance = createInstance().instance;
                chai_1.expect(instance.settings).to.not.be.undefined;
            });
            it("should load some merge new settings", function () {
                var instance = createInstance().instance;
                var newSettings = {
                    presentation: {
                        histograms: false,
                    },
                };
                // Set the new settings
                instance.settings = newSettings;
                // Make sure that something that wasn't touched is still there
                chai_1.expect(instance.settings.presentation.values).to.equal(false);
                // Make sure our new value is still there
                chai_1.expect(instance.settings.presentation.histograms).to.eq(false);
            });
            it("should pass rendering settings to lineup", function () {
                var _a = loadInstanceWithSettings({
                    presentation: {
                        histograms: false,
                    },
                }), instanceInitialized = _a.instanceInitialized, mockLineup = _a.mockLineup;
                return instanceInitialized.then(function () {
                    var histogramsChanges = mockLineup.changeRenderingOption.args.filter(function (n) { return n[0] === "histograms"; });
                    // Make sure the last histogram rendering change is the correct one
                    chai_1.expect(histogramsChanges[histogramsChanges.length - 1]).to.be.deep.equal(["histograms", false]);
                });
            });
            it("should pass interaction settings to lineup", function () {
                var _a = loadInstanceWithSettings({
                    presentation: {
                        tooltips: true,
                    },
                }), instanceInitialized = _a.instanceInitialized, mockLineup = _a.mockLineup;
                return instanceInitialized.then(function () {
                    var tooltipChanges = mockLineup.changeInteractionOption.args.filter(function (n) { return n[0] === "tooltips"; });
                    // Make sure the last histogram rendering change is the correct one
                    chai_1.expect(tooltipChanges[tooltipChanges.length - 1]).to.be.deep.equal(["tooltips", true]);
                });
            });
            it("multiSelect should be true by default", function () {
                var instance = createInstance().instance;
                chai_1.expect(instance.settings.selection.multiSelect).to.be.false;
            });
            it("singleSelect should be true by default", function () {
                var instance = createInstance().instance;
                chai_1.expect(instance.settings.selection.singleSelect).to.be.true;
            });
        });
        describe("configuration", function () {
            it("should restore filters from a configuration", function () {
                var _a = loadInstanceWithData(), instance = _a.instance, data = _a.data, instanceInitialized = _a.instanceInitialized, stubs = _a.stubs;
                var cols = data.stringColumns;
                return instanceInitialized
                    .then(function () {
                    var FAKE_FILTER = {
                        column: cols[0].column,
                        value: "SOME_FAKE_FILTER",
                    };
                    // Set up the fake conversion from lineup
                    stubs.conversion.convertFiltersFromLayout.returns([FAKE_FILTER]);
                    // Set the new config
                    instance.configuration = {
                        columns: data.columns.slice(0),
                        layout: {
                            // Go through all the columns and apply a "filter to them"
                            primary: [{
                                    column: FAKE_FILTER.column,
                                    filter: FAKE_FILTER.value,
                                }],
                        },
                        primaryKey: "primary",
                    };
                    // Make sure the existing query options are updated
                    chai_1.expect(instance.getQueryOptions().query).to.be.deep.equal([FAKE_FILTER]);
                });
            });
            it("should restore sorts from a configuration", function () {
                var _a = loadInstanceWithData(), instance = _a.instance, data = _a.data, instanceInitialized = _a.instanceInitialized, mockLineup = _a.mockLineup;
                var cols = data.stringColumns;
                return instanceInitialized
                    .then(function () {
                    var FAKE_SORT = {
                        column: cols[0].column,
                        asc: false,
                    };
                    // Set the new config
                    instance.configuration = {
                        columns: data.columns.slice(0),
                        layout: {
                            // Go through all the columns and apply a "filter to them"
                            primary: [],
                        },
                        sort: {
                            column: FAKE_SORT.column,
                            asc: FAKE_SORT.asc,
                        },
                        primaryKey: "primary",
                    };
                    // Make sure the existing query options are updated
                    chai_1.expect(instance.getQueryOptions().sort).to.be.deep.equal([FAKE_SORT]);
                    // Make sure it is up to date on lineup
                    chai_1.expect(mockLineup.sortBy.lastCall.args).to.be.deep.equal([FAKE_SORT.column, FAKE_SORT.asc]);
                });
            });
        });
        describe("getQueryOptions", function () {
            it("should be empty by default", function () {
                var instance = createInstance().instance;
                chai_1.expect(instance.getQueryOptions()).to.be.deep.equal({});
            });
            // This is an issue, because if you switch data providers (with a different dataset), then it will try to
            // reuse the same filters/sorts from the previous dataset, which is incorrect.
            it("should clear filters if the dataProvider is changed", function () {
                var _a = loadInstanceWithData(), instance = _a.instance, data = _a.data, instanceInitialized = _a.instanceInitialized, stubs = _a.stubs;
                var cols = data.stringColumns;
                return instanceInitialized
                    .then(function () {
                    var FAKE_FILTER = {
                        column: cols[0].column,
                        value: "SOME_FAKE_FILTER",
                    };
                    // Set up the fake conversion from lineup
                    stubs.conversion.convertFiltersFromLayout.returns([FAKE_FILTER]);
                    // Set the new config
                    instance.configuration = {
                        columns: data.columns.slice(0),
                        layout: {
                            // Go through all the columns and apply a "filter to them"
                            primary: [{
                                    column: FAKE_FILTER.column,
                                    filter: FAKE_FILTER.value,
                                }],
                        },
                        primaryKey: "primary",
                    };
                    instance.dataProvider = createProvider([]).provider;
                    // Make sure the existing query options are updated
                    chai_1.expect(instance.getQueryOptions().query).to.be.empty;
                });
            });
        });
        describe("rerenderValues", function () {
            it("should not crash if lineup hasn't been loaded yet", function () {
                var instance = createInstance().instance;
                // Call the method
                instance.rerenderValues();
            });
            it("should tell lineup to rerender the values in its rows", function () {
                var _a = loadInstanceWithProvider(), mockLineup = _a.mockLineup, ready = _a.ready, instance = _a.instance;
                return ready.then(function () {
                    instance.settings = {
                        presentation: {
                            values: true,
                        },
                    };
                    // Clear the original calls
                    mockLineup.changeRenderingOption.reset();
                    // Call the method
                    instance.rerenderValues();
                    chai_1.expect(mockLineup.changeRenderingOption.lastCall.args).to.be.deep.equal(["values", true]);
                });
            });
        });
        describe("eventing", function () {
            it("should raise the 'configurationChanged' event if lineup changes its sort", function () {
                var _a = createFakeData(), data = _a.data, stringColumns = _a.stringColumns, columns = _a.columns;
                var providerInfo = loadInstanceWithProvider(data, columns);
                var ready = providerInfo.ready, instance = providerInfo.instance;
                // After lineup has been initially loaded
                return ready.then(function () {
                    var FAKE_SORT = {
                        column: stringColumns[0].column,
                        asc: false,
                    };
                    // Setup the event listener for the configuration changed
                    var called = false;
                    instance.events.on(TableSorter_1.TableSorter.EVENTS.CONFIG_CHANGED, function () {
                        called = true;
                    });
                    simulateLineupSort(FAKE_SORT, providerInfo);
                    chai_1.expect(called).to.be.true;
                });
            });
            it("should filter the data provider if the filter has changed in lineup", function () {
                var providerInfo = loadInstanceWithData();
                var stubs = providerInfo.stubs, columns = providerInfo.columns, data = providerInfo.data, instanceInitialized = providerInfo.instanceInitialized, provider = providerInfo.provider;
                var col = data.stringColumns[0];
                var colName = col.column;
                var value = data.data[1][colName];
                stubs.conversion.convertConfiguration.returns({
                    columns: columns,
                    layout: {
                        primary: [],
                    },
                });
                var called = false;
                return instanceInitialized
                    .then(function () {
                    provider.filter = function (filter) {
                        called = true;
                        chai_1.expect(filter.column).to.be.equal(colName);
                        chai_1.expect(filter.value).to.be.equal(value);
                    };
                })
                    .then(function () {
                    simulateLineupFilter({
                        column: colName,
                        value: value,
                    }, providerInfo);
                }) // Basically set the filter to the value in the second row
                    .then(function () {
                    chai_1.expect(called).to.be.true;
                });
            });
            it("should sort the data provider if the sort has changed in lineup", function () {
                var providerInfo = loadInstanceWithData();
                var data = providerInfo.data, instanceInitialized = providerInfo.instanceInitialized, provider = providerInfo.provider;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        provider.sort = function (sort) {
                            chai_1.expect(sort.column).to.be.equal(colName);
                            chai_1.expect(sort.asc).to.be.true;
                            resolve();
                        };
                        simulateLineupSort({
                            column: colName,
                            asc: true,
                        }, providerInfo);
                    });
                });
            });
            it("should sort desc the data provider if the sort has changed in lineup to desc", function () {
                var providerInfo = loadInstanceWithData();
                var data = providerInfo.data, instanceInitialized = providerInfo.instanceInitialized, provider = providerInfo.provider;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        provider.sort = function (sort) {
                            chai_1.expect(sort.column).to.be.equal(colName);
                            chai_1.expect(sort.asc).to.be.false;
                            resolve();
                        };
                        simulateLineupSort({
                            column: colName,
                            asc: false,
                        }, providerInfo);
                    });
                });
            });
            it("should raise the sortChanged event when the sort is changed through lineup", function () {
                var providerInfo = loadInstanceWithData();
                var data = providerInfo.data, instance = providerInfo.instance, instanceInitialized = providerInfo.instanceInitialized;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        var FAKE_SORT = {
                            column: colName,
                            asc: false,
                        };
                        instance.events.on(TableSorter_1.TableSorter.EVENTS.SORT_CHANGED, function (changedCol, asc) {
                            // Make sure table sorter relays this event
                            chai_1.expect(changedCol).to.be.deep.equal(FAKE_SORT.column);
                            chai_1.expect(asc).to.be.deep.equal(FAKE_SORT.asc);
                            resolve();
                        });
                        // Simulate the sort
                        simulateLineupSort(FAKE_SORT, providerInfo);
                    });
                });
            });
            it("should raise the filterChanged event when the filter is changed through lineup", function () {
                var providerInfo = loadInstanceWithData();
                var data = providerInfo.data, instance = providerInfo.instance, instanceInitialized = providerInfo.instanceInitialized;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        var FAKE_FILTER = {
                            column: colName,
                            value: "SOME STRING FILTER",
                        };
                        instance.events.on(TableSorter_1.TableSorter.EVENTS.FILTER_CHANGED, function (filter) {
                            // Make sure table sorter relays this event
                            chai_1.expect(filter).to.be.deep.equal(FAKE_FILTER);
                            resolve();
                        });
                        // Simulate lineup filter call
                        simulateLineupFilter(FAKE_FILTER, providerInfo);
                    });
                });
            });
        });
        describe("UI", function () {
            it("should clear the selection when the clear selection button is clicked", function () {
                var _a = loadInstanceWithProvider(), mockLineup = _a.mockLineup, element = _a.element, ready = _a.ready;
                return ready.then(function () {
                    element.find(".clear-selection").click();
                    chai_1.expect(mockLineup.clearSelection.calledOnce).to.be.true;
                });
            });
            it("should fire the selectionChanged event when the clear selection button is clicked", function () {
                var _a = loadInstanceWithProvider(), instance = _a.instance, element = _a.element, ready = _a.ready;
                return ready.then(function () {
                    return new es6_promise_1.Promise(function (resolve, reject) {
                        // Set up the event listener
                        instance.events.on(TableSorter_1.TableSorter.EVENTS.CLEAR_SELECTION, function () {
                            resolve();
                        });
                        // Perform the click operation
                        element.find(".clear-selection").click();
                    });
                });
            });
            it("should show the add column dialog when the add column button is clicked on", function () {
                var _a = loadInstanceWithProvider(), mockLineup = _a.mockLineup, element = _a.element, ready = _a.ready;
                return ready.then(function () {
                    element.find(".add-column").click();
                    chai_1.expect(mockLineup.addNewSingleColumnDialog.calledOnce).to.be.true;
                });
            });
            it("should show the add stacked column dialog when the add stacked column button is clicked on", function () {
                var _a = loadInstanceWithProvider(), mockLineup = _a.mockLineup, element = _a.element, ready = _a.ready;
                return ready.then(function () {
                    element.find(".add-stacked-column").click();
                    chai_1.expect(mockLineup.addNewStackedColumnDialog.calledOnce).to.be.true;
                });
            });
        });
    });
    describe("e2e", function () {
        var getHeaders = function () {
            return parentEle.find(".header").toArray().reverse();
        };
        var getHeader = function (colName) {
            return $(getHeaders().filter(function (ele) { return $(ele).is(":contains('" + colName + "')"); })[0]);
        };
        var getHeaderNames = function () {
            return getHeaders().map(function (n) { return $(n).find(".headerLabel").text(); }).filter(function (n) { return n !== "Rank"; });
        };
        var getFilterEle = function (colName) {
            return getHeader(colName).find(".singleColumnFilter");
        };
        var getColumnValues = function (col) {
            var headerNames = getHeaders().map(function (n) { return $(n).find(".headerLabel").text(); });
            var colIdx = headerNames.indexOf(col); // Returns the index that this header is in the list of headers
            // Find all the row values, and make sure they match
            return parentEle.find(".row")
                .map(function (i, ele) { return $(ele).find(".text,.valueonly")[colIdx]; })
                .map(function (i, ele) { return $(ele).text(); }).toArray();
        };
        var createInstance = function () {
            var ele = $("<div>");
            parentEle.append(ele);
            var result = {
                instance: new TableSorter_1.TableSorter(ele),
                element: ele,
            };
            // For cleaning up
            instances.push(result.instance);
            // result.instance.dimensions = { width: 800, height: 20000 };
            result.instance.settings = {
                presentation: {
                    animation: false,
                    values: true,
                    numberFormatter: function (n) { return n + ""; },
                },
            };
            return result;
        };
        var testColumns = function () {
            return [{
                    column: "col1",
                    label: "Column",
                    type: "string",
                }, {
                    column: "col2",
                    label: "Column2",
                    type: "number",
                }, {
                    column: "col3",
                    label: "Column3",
                    type: "number",
                }];
        };
        var createProvider = function (data) {
            var resolver;
            var fakeProvider = {
                shouldResolve: true,
                alwaysResolve: true,
                canQuery: function (options) {
                    return es6_promise_1.Promise.resolve(fakeProvider.alwaysResolve || fakeProvider.shouldResolve);
                },
                generateHistogram: function () {
                    return es6_promise_1.Promise.resolve([]);
                },
                query: function (options) {
                    return new es6_promise_1.Promise(function (resolve2) {
                        resolve2({
                            total: data.length,
                            results: data,
                            replace: true,
                        });
                        fakeProvider.shouldResolve = false;
                        // Ghetto hax, 50 because it tries to checkLoadMoreData after 10 seconds.
                        setTimeout(function () {
                            resolver();
                        }, 50);
                    });
                },
            };
            return {
                instanceInitialized: new es6_promise_1.Promise(function (resolve) {
                    resolver = resolve;
                }),
                provider: fakeProvider,
            };
        };
        var createFakeData = function () {
            var rows = [];
            var _loop_2 = function (i) {
                (function (myId) {
                    rows.push({
                        id: myId,
                        col1: myId,
                        col2: i * (Math.random() * 100),
                        col3: i,
                        selected: false,
                        equals: function (other) { return (myId) === other["col1"]; },
                    });
                })("FAKE_" + i);
            };
            for (var i = 0; i < 100; i++) {
                _loop_2(i);
            }
            var cols = testColumns();
            return {
                data: rows,
                columns: cols,
                stringColumns: cols.filter(function (n) { return n.type === "string"; }),
                numberColumns: cols.filter(function (n) { return n.type === "number"; }),
            };
        };
        var loadInstanceWithStackedColumns = function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            var data = createFakeData();
            var providerInfo = createProvider(data.data);
            instance.dataProvider = providerInfo.provider;
            providerInfo.instanceInitialized.then(function () {
                var desc = {
                    label: "STACKED_COLUMN",
                    width: 10,
                    children: [
                        { column: "col2", type: "number", weight: 100 },
                    ],
                };
                var inst = instance.lineupImpl;
                inst.storage.addStackedColumn(desc);
                inst.headerUpdateRequired = true;
                inst.updateAll();
            });
            return {
                instance: instance,
                element: element,
                data: data,
                instanceInitialized: providerInfo.instanceInitialized,
            };
        };
        var performClick = function (e) {
            if (e.length === 0) {
                chai_1.expect.fail(1, 0, "No elements found to click");
            }
            if (typeof MouseEvent !== "undefined") {
                /* tslint:disable */
                var ev = new Event("click", { "bubbles": true, "cancelable": false });
                e[0].dispatchEvent(ev);
            }
            else {
                e.click();
            }
        };
        var setStringFilter = function (colName, value) {
            var filterEle = getFilterEle(colName);
            instances[0].dataProvider["shouldResolve"] = true;
            performClick(filterEle); // Normal .click() will not work with d3
            return new es6_promise_1.Promise(function (resolve, reject) {
                var popup = parentEle.find(".lu-popup2");
                var inputEle = popup.find("input");
                inputEle.val(value);
                popup.find(".ok").click();
                setTimeout(resolve, 100);
            });
        };
        var setNumericalFilter = function (colName, value) {
            var filterEle = getFilterEle(colName);
            performClick(filterEle); // Normal .click() will not work with d3
            return new es6_promise_1.Promise(function (resolve, reject) {
                var popup = parentEle.find(".lu-popup2");
                var inputEle = popup.find("input");
                inputEle.val(value);
                popup.find(".ok").click();
                setTimeout(resolve, 100);
            });
        };
        var loadInstanceWithData = function () {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            instance.dimensions = { width: 800, height: 1000 };
            var data = createFakeData();
            var providerInfo = createProvider(data.data);
            instance.dataProvider = providerInfo.provider;
            return {
                instance: instance,
                element: element,
                data: data,
                provider: providerInfo.provider,
                instanceInitialized: providerInfo.instanceInitialized,
            };
        };
        var loadInstanceWithStackedColumnsAndClick = function () {
            var _a = loadInstanceWithStackedColumns(), instance = _a.instance, element = _a.element, data = _a.data, instanceInitialized = _a.instanceInitialized;
            instanceInitialized = instanceInitialized.then(function (result) {
                var headerEle = element.find(".header:contains('STACKED_COLUMN')");
                performClick(headerEle);
                return result;
            });
            return {
                instance: instance,
                element: element,
                data: data,
                instanceInitialized: instanceInitialized,
            };
        };
        var loadInstanceWithSettings = function (settings) {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            var data = createFakeData();
            var _b = createProvider(data.data), provider = _b.provider, instanceInitialized = _b.instanceInitialized;
            instance.dataProvider = provider;
            // Set the settings
            instance.settings = $.extend(true, {}, settings, {
                presentation: {
                    animation: false,
                },
            });
            return {
                instance: instance,
                element: element,
                instanceInitialized: instanceInitialized,
                data: data,
            };
        };
        var loadInstanceWithConfiguration = function (config) {
            var _a = createInstance(), instance = _a.instance, element = _a.element;
            instance.dimensions = { width: 800, height: 1000 };
            var data = createFakeData();
            var _b = createProvider(data.data), provider = _b.provider, instanceInitialized = _b.instanceInitialized;
            provider["shouldResolve"] = true;
            provider["alwaysResolve"] = true;
            instance.dataProvider = provider;
            instance.configuration = config;
            return {
                instance: instance,
                element: element,
                instanceInitialized: instanceInitialized,
                data: data,
            };
        };
        /**
         * sorts the given column
         */
        function sortColumn(column, asc) {
            if (asc === void 0) { asc = true; }
            var headerEle = getHeader(column.column);
            performClick(headerEle);
            if (!asc) {
                performClick(headerEle);
            }
        }
        /**
         * Creates an instance with a filter on it
         */
        function loadInstanceWithFilter() {
            var _a = loadInstanceWithData(), data = _a.data, instanceInitialized = _a.instanceInitialized, provider = _a.provider, element = _a.element, instance = _a.instance;
            var col = data.stringColumns[0];
            var filterColName = col.column;
            var filterVal = data.data[1][filterColName];
            instanceInitialized = instanceInitialized
                .then(function () { return setStringFilter(filterColName, filterVal); }); // Basically set the filter to the value in the second row
            return { filterColName: filterColName, filterVal: filterVal, ready: instanceInitialized, provider: provider, element: element, instance: instance, data: data };
        }
        /**
         * Performs the infinite load
         */
        function performInfiniteLoad() {
            // HACKY: This mimics a scroll event
            var scrollable = parentEle.find(".lu-wrapper");
            scrollable.scrollTop(scrollable.height());
            instances[0].lineupImpl.scrolled();
        }
        describe("events", function () {
            describe("sortChanged", function () {
                it("should call the event when a column header is clicked", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var called = false;
                    instance.events.on(TableSorter_1.TableSorter.EVENTS.SORT_CHANGED, function (item) {
                        called = true;
                    });
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.instanceInitialized.then(function () {
                        // Click on de header
                        var headerEle = element.find(".header:contains('col1')");
                        performClick(headerEle);
                        chai_1.expect(called).to.be.true;
                    });
                });
                it("should call the event with the correct params", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    instance.events.on(TableSorter_1.TableSorter.EVENTS.SORT_CHANGED, function (colName) {
                        chai_1.expect(colName).to.equal("col1");
                    });
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.instanceInitialized.then(function () {
                        // // Click on de header
                        var headerEle = element.find(".header:contains('col1')");
                        performClick(headerEle);
                    });
                });
            });
            describe("selectionChanged", function () {
                it("should call the event when a row is clicked", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var called = false;
                    instance.events.on(TableSorter_1.TableSorter.EVENTS.SELECTION_CHANGED, function (selection) {
                        called = true;
                        chai_1.expect(selection.length).to.be.equal(1);
                        chai_1.expect(selection[0].col1).to.be.equal("FAKE_0"); // Very first row
                    });
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.instanceInitialized.then(function () {
                        var row = element.find(".row").first();
                        performClick(row);
                        chai_1.expect(called).to.be.true;
                    });
                });
                it("should call the event when a row is clicked twice", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.instanceInitialized.then(function () {
                        var row = element.find(".row").first();
                        performClick(row);
                        var called = false;
                        instance.events.on(TableSorter_1.TableSorter.EVENTS.SELECTION_CHANGED, function (selection) {
                            called = true;
                            chai_1.expect(selection.length).to.be.equal(0);
                        });
                        performClick(row);
                        chai_1.expect(called).to.be.true;
                    });
                });
            });
            describe("selection", function () {
                it("should clear the selection when the clear button is pressed", function () {
                    var _a = createInstance(), instance = _a.instance, element = _a.element;
                    var providerInfo = createProvider(createFakeData().data);
                    instance.dataProvider = providerInfo.provider;
                    return providerInfo.instanceInitialized.then(function () {
                        var called = false;
                        instance["lineupImpl"].clearSelection = function () {
                            called = true;
                        };
                        instance.selection = [{
                                id: "SomeSelectedItem",
                            }];
                        chai_1.expect(called).to.be.false;
                        performClick(element.find(".clear-selection"));
                        chai_1.expect(called).to.be.true;
                    });
                });
                describe("multi", function () {
                    it("should update when a row is clicked on", function () {
                        var _a = createInstance(), instance = _a.instance, element = _a.element;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(createFakeData().data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var row = element.find(".row").first();
                            performClick(row);
                            chai_1.expect(instance.selection[0]["col1"]).to.be.equal(data[0]["col1"]);
                        });
                    });
                    it("should deselect a row that was selected twice", function () {
                        var _a = createInstance(), instance = _a.instance, element = _a.element;
                        var providerInfo = createProvider(createFakeData().data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var row = element.find(".row").first();
                            performClick(row);
                            performClick(row);
                            chai_1.expect(instance.selection.length).to.be.equal(0);
                        });
                    });
                    it("should select multiple rows", function () {
                        var _a = loadInstanceWithSettings({
                            selection: {
                                singleSelect: false,
                                multiSelect: true,
                            },
                        }), instance = _a.instance, element = _a.element;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var rows = element.find(".row");
                            performClick($(rows[0]));
                            performClick($(rows[1]));
                            chai_1.expect(instance.selection.length).to.be.equal(2);
                            chai_1.expect(instance.selection.map(function (row) { return row["col1"]; })).to.be.deep.equal(data.slice(0, 2).map(function (r) { return r["col1"]; }));
                        });
                    });
                    it("should retain selection when set", function () {
                        var instance = createInstance().instance;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(createFakeData().data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            instance.selection = [data[0]];
                            chai_1.expect(instance.selection[0]["col1"]).to.be.equal(data[0]["col1"]);
                        });
                    });
                });
                describe("single", function () {
                    var createInstanceWithSingleSelect = function () {
                        return loadInstanceWithSettings({
                            selection: {
                                singleSelect: true,
                                multiSelect: false,
                            },
                        });
                    };
                    it("should update when a row is clicked on", function () {
                        var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(createFakeData().data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var row = element.find(".row").first();
                            performClick(row);
                            chai_1.expect(instance.selection[0]["col1"]).to.be.equal(data[0]["col1"]);
                        });
                    });
                    it("should deselect a row that was selected twice", function () {
                        var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                        var providerInfo = createProvider(createFakeData().data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var row = element.find(".row").first();
                            performClick(row);
                            performClick(row);
                            chai_1.expect(instance.selection.length).to.be.equal(0);
                        });
                    });
                    it("should select the last row when multiple rows are clicked", function () {
                        var _a = createInstanceWithSingleSelect(), instance = _a.instance, element = _a.element;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            var rows = element.find(".row");
                            performClick($(rows[0]));
                            performClick($(rows[1]));
                            chai_1.expect(instance.selection.length).to.be.equal(1);
                            chai_1.expect(instance.selection[0]["col1"]).to.be.deep.equal(data[1]["col1"]);
                        });
                    });
                    it("should retain selection when set", function () {
                        var instance = createInstanceWithSingleSelect().instance;
                        var data = createFakeData().data;
                        var providerInfo = createProvider(data);
                        instance.dataProvider = providerInfo.provider;
                        return providerInfo.instanceInitialized.then(function () {
                            instance.selection = [data[0]];
                            chai_1.expect(instance.selection[0]["col1"]).to.be.equal(data[0]["col1"]);
                        });
                    });
                });
            });
            describe("getSortFromLineUp", function () {
                it("does not crash when sorting a stacked column", function () {
                    var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, instanceInitialized = _a.instanceInitialized;
                    return instanceInitialized.then(function () {
                        chai_1.expect(conversion_1.convertSort(instance.lineupImpl)).not.to.throw;
                    });
                });
                it("returns a 'stack' property when a stack is cliked on", function () {
                    var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, instanceInitialized = _a.instanceInitialized;
                    return instanceInitialized.then(function () {
                        var result = conversion_1.convertSort(instance.lineupImpl);
                        chai_1.expect(result.stack.name).to.equal("STACKED_COLUMN");
                        chai_1.expect(result.column).to.be.undefined;
                    });
                });
            });
            it("should sort the data provider if the sort has changed in lineup", function () {
                var _a = loadInstanceWithData(), data = _a.data, instanceInitialized = _a.instanceInitialized, provider = _a.provider;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        provider.sort = function (sort) {
                            chai_1.expect(sort.column).to.be.equal(colName);
                            chai_1.expect(sort.asc).to.be.true;
                            resolve();
                        };
                        sortColumn(col);
                    });
                });
            });
            it("should sort desc the data provider if the sort has changed in lineup to desc", function () {
                var _a = loadInstanceWithData(), data = _a.data, instanceInitialized = _a.instanceInitialized, provider = _a.provider;
                var col = data.stringColumns[0];
                var colName = col.column;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        var count = 0;
                        provider.sort = function (sort) {
                            count++;
                            if (count === 2) {
                                chai_1.expect(sort.column).to.be.equal(colName);
                                chai_1.expect(sort.asc).to.be.false;
                                resolve();
                            }
                        };
                        sortColumn(col, false);
                    });
                });
            });
            // it("should allow for the user filtering a numerical, and then allow for the user to scroll to load more data");
            it("should allow string column filtering through the UI", function () {
                var _a = loadInstanceWithData(), data = _a.data, instanceInitialized = _a.instanceInitialized;
                var col = data.stringColumns[0];
                var colName = col.column;
                var value = data.data[1][colName];
                return instanceInitialized
                    .then(function () { return setStringFilter(colName, value); }) // Basically set the filter to the value in the second row
                    .then(function () { return getColumnValues(colName); })
                    .then(function (rowValues) {
                    chai_1.expect(rowValues.length).to.be.gte(1);
                    rowValues.forEach(function (n) { return chai_1.expect(n).to.contain(value); });
                });
            });
            it.skip("should allow numerical column filtering through the UI", function () {
                var _a = loadInstanceWithData(), data = _a.data, instanceInitialized = _a.instanceInitialized;
                var col = data.numberColumns[0];
                var colName = col.column;
                var value = data.data[1][colName];
                return instanceInitialized
                    .then(function () { return setNumericalFilter(colName, value); }) // Basically set the filter to the value in the second row
                    .then(function () { return getColumnValues(colName); })
                    .then(function (rowValues) {
                    chai_1.expect(rowValues.length).to.be.gte(1);
                    rowValues.forEach(function (n) { return chai_1.expect(n).to.be.equal(value); });
                });
            });
            // it("should allow for the user filtering a numerical, and then allow for the user to scroll to load more data");
            it("should allow for infinite scrolling without a filter");
            it("should check to see if there is more data when infinite scrolling", function () {
                var _a = loadInstanceWithData(), instanceInitialized = _a.instanceInitialized, provider = _a.provider;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve, reject) {
                        setTimeout(function () {
                            provider.query = (function () {
                                reject(new Error("Should not be called"));
                            });
                            provider.canQuery = function (options) {
                                setTimeout(resolve, 10);
                                return es6_promise_1.Promise.resolve(false);
                            };
                            performInfiniteLoad();
                        }, 1000);
                    });
                });
            });
            // it("should allow for the user filtering a numerical, and then allow for the user to scroll to load more data");
            it("should check to see if there is more data when infinite scrolling and there is a filter", function () {
                var _a = loadInstanceWithFilter(), filterColName = _a.filterColName, filterVal = _a.filterVal, ready = _a.ready, provider = _a.provider;
                return ready
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve, reject) {
                        // Make sure query isn't called
                        provider.query = (function () {
                            reject(new Error("Should not be called"));
                        });
                        // make sure canQuery is called with the correct filter
                        provider.canQuery = function (options) {
                            var filter = options.query.filter(function (n) { return n.column === filterColName; })[0];
                            chai_1.expect(filter).to.be.deep.equal({
                                column: filterColName,
                                value: filterVal,
                            });
                            // Resolve it after a delay (ie after TableSorter gets it and has time to call query)
                            setTimeout(resolve, 10);
                            return es6_promise_1.Promise.resolve(false);
                        };
                        // Start the infinite load process
                        performInfiniteLoad();
                    });
                });
            });
            it("should attempt to load more data when infinite scrolling", function () {
                var _a = loadInstanceWithData(), instanceInitialized = _a.instanceInitialized, provider = _a.provider;
                return instanceInitialized
                    .then(function () {
                    return new es6_promise_1.Promise(function (resolve) {
                        provider.query = resolve;
                        provider.canQuery = function () { return es6_promise_1.Promise.resolve(true); };
                        // Start the infinite load process
                        performInfiniteLoad();
                    });
                });
            });
            describe("integration", function () {
                it("saves the configuration when a stacked column is sorted", function () {
                    var _a = loadInstanceWithStackedColumnsAndClick(), instance = _a.instance, instanceInitialized = _a.instanceInitialized;
                    return instanceInitialized.then(function () {
                        chai_1.expect(instance.configuration.sort).to.not.be.undefined;
                        chai_1.expect(instance.configuration.sort.stack.name).to.be.equal("STACKED_COLUMN");
                        chai_1.expect(instance.configuration.sort.column).to.be.undefined;
                    });
                });
                it("saves the configuration when the column layout has been changed", function () {
                    var _a = loadInstanceWithStackedColumns(), instance = _a.instance, instanceInitialized = _a.instanceInitialized;
                    return instanceInitialized.then(function () {
                        var called = false;
                        instance.events.on(TableSorter_1.TableSorter.EVENTS.CONFIG_CHANGED, function () {
                            called = true;
                        });
                        // Ghetto: Manually say that the columns have changed, usually happens if you drag/drop add columns
                        instance.lineupImpl.listeners["columns-changed"]();
                        chai_1.expect(called).to.be.true;
                    });
                });
                it("loads lineup with a sorted stacked column", function () {
                    var _a = loadInstanceWithStackedColumns(), instance = _a.instance, data = _a.data, instanceInitialized = _a.instanceInitialized;
                    return instanceInitialized.then(function () {
                        instance.configuration = {
                            primaryKey: "col1",
                            columns: data.columns,
                            sort: {
                                stack: {
                                    name: "STACKED_COLUMN",
                                },
                                asc: true,
                            },
                        };
                        var result = conversion_1.convertSort(instance.lineupImpl);
                        chai_1.expect(result.stack.name).to.equal("STACKED_COLUMN");
                        chai_1.expect(result.column).to.be.undefined;
                    });
                });
                it("loads lineup with a filtered numerical column if it intially is filtered", function () {
                    var instance = loadInstanceWithConfiguration({
                        primaryKey: "primary",
                        columns: testColumns(),
                        layout: {
                            primary: [{
                                    column: "col3",
                                    domain: [1, 1],
                                }],
                        },
                    }).instance;
                    var q = instance.getQueryOptions().query;
                    chai_1.expect(q).to.be.deep.equal([{ column: "col3", value: { domain: [1, 1], range: undefined } }]);
                });
                it("loads lineup with a sorted stacked column and allows for filtering", function () {
                    var _a = loadInstanceWithStackedColumns(), data = _a.data, instanceInitialized = _a.instanceInitialized, instance = _a.instance;
                    var col = data.stringColumns[0];
                    var filterColName = col.column;
                    var filterVal = data.data[1][filterColName];
                    return instanceInitialized
                        .then(function () { return setStringFilter(filterColName, filterVal); })
                        .then(function () { return getColumnValues(filterColName); })
                        .then(function (rowValues) {
                        // Validate that the row values are correct
                        chai_1.expect(rowValues.length).to.be.gte(1);
                        rowValues.forEach(function (n) { return chai_1.expect(n).to.contain(filterVal); });
                    })
                        .then(function () {
                        return new es6_promise_1.Promise(function (resolve) {
                            var config = instance.configuration;
                            var cols = config.layout.primary
                                .map(function (n) { return n.column || n.label; })
                                .filter(function (n) { return !!n && n !== "id"; });
                            chai_1.expect(cols).to.be.deep.equal(["col1", "STACKED_COLUMN", "col2", "col3"]);
                            resolve();
                        });
                    });
                });
                it("correctly loads the ordering of columns from a configuration", function () {
                    var cols = testColumns();
                    var instanceInitialized = loadInstanceWithConfiguration({
                        primaryKey: "primary",
                        columns: cols.slice(0),
                        layout: {
                            primary: cols.reverse(),
                        },
                    }).instanceInitialized;
                    return instanceInitialized.then(function () {
                        var headers = getHeaderNames();
                        chai_1.expect(headers).to.be.deep.equal(cols.map(function (n) { return n.label; }));
                    });
                });
            });
        });
    });
});
