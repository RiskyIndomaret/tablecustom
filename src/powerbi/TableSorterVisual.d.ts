import { VisualBase, UpdateType } from "@essex/pbi-base";
import { TableSorter } from "../TableSorter";
import { ITableSorterSettings } from "../models";
import IVisual = powerbi.IVisual;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
/**
 * The visual which wraps TableSorter
 */
export default class TableSorterVisual extends VisualBase implements IVisual {
    /**
     * The set of capabilities for the visual
     */
    static capabilities: VisualCapabilities;
    /**
     * The default settings for the visual
     */
    private static VISUAL_DEFAULT_SETTINGS;
    tableSorter: TableSorter;
    private dataViewTable;
    /**
     * The list of listeners on the table sorter
     */
    private listeners;
    private dataView;
    private host;
    private selectionManager;
    private waitingForMoreData;
    private waitingForSort;
    private handlingUpdate;
    private updateType;
    private propertyPersister;
    private destroyed;
    private _data;
    /**
     * My css module
     */
    private myCssModule;
    /**
     * The initial set of settings to use
     */
    private initialSettings;
    /**
     * The formatter to use for numbers
     */
    private numberFormatter;
    /**
     * The current load promise
     */
    private loadResolver;
    private visualSettings;
    /**
     * A simple debounced function to update the configuration
     */
    private configurationUpdater;
    /**
     * A debounced version of the selection changed event listener
     * @param rows The rows that are selected
     */
    private onSelectionChanged;
    /**
     * The constructor for the visual
     * @param noCss If true, no css will be loaded
     * @param initialSettings The initial set of settings to use
     * @param updateTypeGetterOverride An override for the update type gettter.
     */
    constructor(noCss?: boolean, initialSettings?: ITableSorterSettings, updateTypeGetterOverride?: () => UpdateType);
    readonly template: string;
    /**
     * Setter for dimensions
     */
    private _dimensions;
    /**
     * Getter for dimensions
     */
    dimensions: {
        width: number;
        height: number;
    };
    /**
     * Converts the data from power bi to a data we can use
     * @param view The dataview to load
     * @param selectedIds The list of selected ids
     * @param settings The color settings to use when converting the dataView
     */
    private static converter(view, selectedIds, settings?);
    /**
     * The IVIsual.init function
     * Called when the visual is being initialized
     */
    init(options: VisualInitOptions): void;
    /**
     * The IVisual.update function
     * Called when the visual is being initialized.
     * Update is called for data updates, resizes & formatting changes
     */
    update(options: VisualUpdateOptions): void;
    /**
     * The IVisual.enumerateObjectInstances function
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[];
    /**
     * The IVisual.destroy function
     * Destroys this visual
     */
    destroy(): void;
    /**
     * Gets the css used for this element
     */
    protected getCss(): string[];
    /**
     * Returns true if the layout has changed in the PBI settings
     * @param updateType The current update type that caused this check
     * @param options The update options that caused this check
     */
    private hasLayoutChanged(updateType, options);
    /**
     * Handles all of the data loading required from power bi during an update call
     * @param oldSettings The settings before the update
     * @param updateType The type of update being performed
     */
    private loadDataFromPowerBI(oldSettings, updateType);
    /**
     * Loads the settings object from PBI during an update call
     * @param oldState The state before the update call
     * @param newState The state during the update call
     */
    private loadSettingsFromPowerBI(oldState, newState);
    /**
     * Creates a data provider with the given set of data
     * @param newData The data to load
     */
    private createDataProvider(newData, domainInfo);
    /**
     * Handles the sort from the data provider by emitting it to powerbi
     * * Note * Not currently used
     * @param rawSort The sort being performed
     */
    private handleSort(rawSort);
    /**
     * Builds a self filter for PBI from the list of filters
     * @param filters The set of filters that table sorter has applied
     */
    private buildSelfFilter(filters);
    /**
     * The cell formatter for TableSorter
     * @param selection The d3 selection for the cells being formatted.
     */
    private cellFormatter(selection);
}
