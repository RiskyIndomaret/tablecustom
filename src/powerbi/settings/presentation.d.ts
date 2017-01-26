/**
 * Settings related to presentation
 */
export default class PresentationSettings {
    /**
     * The display units for the values
     */
    labelDisplayUnits: number;
    /**
     * The precision to use with the values
     */
    labelPrecision: number;
    /**
     * If true, when columns are combined, the all columns will be displayed stacked
     */
    stacked: boolean;
    /**
     * If the actual values should be displayed under the bars
     */
    values: boolean;
    /**
     * Show histograms in the column headers
     */
    histograms: boolean;
    /**
     * Should the grid be animated when sorting
     */
    animation: boolean;
    /**
     * Should the grid show tooltips on hover of a row
     */
    tooltips: boolean;
}
