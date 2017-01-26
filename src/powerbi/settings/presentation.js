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
/**
 * Settings related to presentation
 */
var PresentationSettings = (function () {
    function PresentationSettings() {
    }
    return PresentationSettings;
}());
__decorate([
    pbi_base_1.setting({
        displayName: "Unit",
        description: "descripsi nilai ",
        config: {
            type: powerbi.visuals.StandardObjectProperties.labelDisplayUnits.type,
        },
        defaultValue: 0,
    })
], PresentationSettings.prototype, "labelDisplayUnits", void 0);
__decorate([
    pbi_base_1.setting({
        displayName: "Presisi",
        description: "Presisi nilai desimal",
        config: {
            type: powerbi.visuals.StandardObjectProperties.labelPrecision.type,
        },
    })
], PresentationSettings.prototype, "labelPrecision", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Stacked",
        description: "If true, when columns are combined, the all columns will be displayed stacked",
        defaultValue: true,
    })
], PresentationSettings.prototype, "stacked", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Nilai",
        description: "If the actual values should be displayed under the bars",
        defaultValue: true,
    })
], PresentationSettings.prototype, "values", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Histograms",
        description: "Show histograms in the column headers",
        defaultValue: true,
    })
], PresentationSettings.prototype, "histograms", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Animation",
        description: "Should the grid be animated when sorting",
        defaultValue: true,
    })
], PresentationSettings.prototype, "animation", void 0);
__decorate([
    pbi_base_1.boolSetting({
        displayName: "Table tooltips",
        description: "Should the grid show tooltips on hover of a row",
        defaultValue: false,
    })
], PresentationSettings.prototype, "tooltips", void 0);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PresentationSettings;
