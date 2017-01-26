import { IGradient } from "@essex/pbi-base";
import { IColorSettings, ColorMode } from "../../models";
/**
 * Determines if the given dataview has rank information
 */
export declare function hasRankInfo(dataView: powerbi.DataView): boolean;
/**
 * Represents a set of gradient settings
 */
export declare class GradientSettings implements IGradient {
    /**
     * If the gradient color scheme should be used when coloring the values in the slicer
     */
    startColor?: string;
    /**
     * If the gradient color scheme should be used when coloring the values in the slicer
     */
    endColor?: string;
    /**
     * The value to use as the start color
     */
    startValue?: number;
    /**
     * The value to use as the end color
     */
    endValue?: number;
}
/**
 * Settings related to ranking
 */
export default class RankSettings implements IColorSettings {
    /**
     * Represents the color mode to use
     */
    colorMode: ColorMode;
    /**
     * If true, the bar ordering for the ranks will be reversed
     */
    reverseBars: boolean;
    /**
     * If true, a histogram will be shown across the bars indicating
     */
    histogram: boolean;
    /**
     * The gradient settings
     */
    rankGradients: GradientSettings;
    /**
     * Provides a mapping from ranks to colors
     */
    rankInstanceColors: {
        [rank: string]: string;
    };
}
