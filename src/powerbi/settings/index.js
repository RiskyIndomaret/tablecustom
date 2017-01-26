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
var rank_1 = require("./rank");
var presentation_1 = require("./presentation");
var selection_1 = require("./selection");
/**
 * Represents the TableSorterVisual settings
 */
var TableSorterVisualSettings = (function (_super) {
    __extends(TableSorterVisualSettings, _super);
    function TableSorterVisualSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TableSorterVisualSettings;
}(pbi_base_1.HasSettings));
__decorate([
    pbi_base_1.settings(rank_1.default, {
        category: "Rank",
        enumerable: function (s, dv) { return rank_1.hasRankInfo(dv); },
    })
], TableSorterVisualSettings.prototype, "rankSettings", void 0);
__decorate([
    pbi_base_1.settings(presentation_1.default, {
        category: "Presentation",
    })
], TableSorterVisualSettings.prototype, "presentation", void 0);
__decorate([
    pbi_base_1.settings(selection_1.default, {
        category: "Selection",
    })
], TableSorterVisualSettings.prototype, "selection", void 0);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TableSorterVisualSettings;
