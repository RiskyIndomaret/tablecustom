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

import {
     setting,
     boolSetting as bool,
} from "@essex/pbi-base";

/**
 * Settings related to presentation
 */
export default class PresentationSettings {

    /**
     * The display units for the values
     */
    @setting({
        displayName: "Unit",
        description: "descripsi nilai ",
        config: {
            type: powerbi.visuals.StandardObjectProperties.labelDisplayUnits.type,
        },
        defaultValue: 0,
    })
    public labelDisplayUnits: number;

    /**
     * The precision to use with the values
     */
    @setting({
        displayName: "Presisi",
        description: "Presisi nilai desimal",
        config: {
            type: powerbi.visuals.StandardObjectProperties.labelPrecision.type,
        },
    })
    public labelPrecision: number;

    /**
     * If true, when columns are combined, the all columns will be displayed stacked
     */
    @bool({
        displayName: "Stacked",
        description: "If true, when columns are combined, the all columns will be displayed stacked",
        defaultValue: true,
    })
    public stacked: boolean;

    /**
     * If the actual values should be displayed under the bars
     */
    @bool({
        displayName: "Nilai",
        description: "If the actual values should be displayed under the bars",
        defaultValue: true,
    })
    public values: boolean;

    /**
     * Show histograms in the column headers
     */
    @bool({
        displayName: "Histograms",
        description: "Show histograms in the column headers",
        defaultValue: true,
    })
    public histograms: boolean;

    /**
     * Should the grid be animated when sorting
     */
    @bool({
        displayName: "Animation",
        description: "Should the grid be animated when sorting",
        defaultValue: true,
    })
    public animation: boolean;

    /**
     * Should the grid show tooltips on hover of a row
     */
    @bool({
        displayName: "Table tooltips",
        description: "Should the grid show tooltips on hover of a row",
        defaultValue: false,
    })
    public tooltips: boolean;
}
