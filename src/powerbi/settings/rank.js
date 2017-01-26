/*
 * MIT License
 *
 * Copyright (c) 2016 Microsoft
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var pbi_base_1 = require("@essex/pbi-base");
var models_1 = require("../../models");
var ConfigBuilder_1 = require("../ConfigBuilder");
/**
 * Creates a unique id for the given column and rank
 */
function getRankObjectId(column, rank) {
    "use strict";
    return "RANK_" + rank;
}
/**
 * Determines if the given dataview has rank information
 */
function hasRankInfo(dataView) {
    "use strict";
    // The dataView has "rank" information, if the user passed in a field as a "Rank" field
    var cols = pbi_base_1.get(dataView, function (v) { return v.metadata.columns; }, []);
    return cols.filter(function (n) { return n.roles["Rank"]; }).length > 0;
}
exports.hasRankInfo = hasRankInfo;
/**
 * Represents a set of gradient settings
 */
var GradientSettings = (function () {
    function GradientSettings() {
    }
    return GradientSettings;
}());
__decorate([
    pbi_base_1.colorSetting({
        displayName: "Start color",
        description: "The start color of the gradient",
        defaultValue: "#bac2ff",
    })
], GradientSettings.prototype, "startColor", void 0);
__decorate([
    pbi_base_1.colorSetting({
        displayName: "End color",
        description: "The end color of the gradient",
        defaultValue: "#0229bf",
    })
], GradientSettings.prototype, "endColor", void 0);
__decorate([
    pbi_base_1.numberSetting({
        displayName: "Start Value",
        description: "The value to use as the start color",
    })
], GradientSettings.prototype, "startValue", void 0);
__decorate([
    pbi_base_1.numberSetting({
        displayName: "End Value",
        description: "The value to use as the end color",
    })
], GradientSettings.prototype, "endValue", void 0);
exports.GradientSettings = GradientSettings;
/**
 * Settings related to ranking
 */
var RankSettings = (function () {
    function RankSettings() {
    }
    return RankSettings;
}());
__decorate([
    pbi_base_1.enumSetting(models_1.ColorMode, {
        displayName: "Color Mode",
        defaultValue: models_1.ColorMode.Gradient,
    })
], RankSettings.prototype, "colorMode", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Reverse Columns",
        description: "If enabled, the order of the generated rank columns will be reversed",
        defaultValue: false,
    })
], RankSettings.prototype, "reverseBars", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Histogram",
        description: "If true, a histogram will be shown across the rank columns",
        defaultValue: false,
    })
], RankSettings.prototype, "histogram", void 0);
__decorate([
    pbi_base_1.settings(GradientSettings, {
        enumerable: function (s) { return s.colorMode === models_1.ColorMode.Gradient; },
    })
], RankSettings.prototype, "rankGradients", void 0);
__decorate([
    pbi_base_1.colorSetting({
        displayName: "Ranks",
        enumerable: function (s) { return s.colorMode === models_1.ColorMode.Instance; },
        parse: function (value, descriptor, dataView, setting) {
            var ci = ConfigBuilder_1.calculateRankingInfo(dataView);
            if (ci) {
                return ci.values.reduce(function (confidenceMap, n) {
                    var objId = getRankObjectId(ci.column, n);
                    var pbiValue = pbi_base_1.getObjectsForColumn(ci.column, setting, objId);
                    confidenceMap[n] = pbi_base_1.get(pbiValue, function (v) { return v.solid.color; }, "#cccccc");
                    return confidenceMap;
                }, {});
            }
        },
        compose: function (value, descriptor, dataView, setting) {
            var ci = ConfigBuilder_1.calculateRankingInfo(dataView);
            if (ci) {
                return ci.values.map(function (n) {
                    var objId = getRankObjectId(ci.column, n);
                    var selector = pbi_base_1.createObjectSelectorForColumn(ci.column, objId);
                    return pbi_base_1.composeInstance(setting, selector, n + "", value[n] || "#cccccc");
                });
            }
        },
    })
], RankSettings.prototype, "rankInstanceColors", void 0);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RankSettings;
