import { HasSettings } from "@essex/pbi-base";
import { default as RankSettings } from "./rank";
import PresentationSettings from "./presentation";
import SelectionSettings from "./selection";
/**
 * Represents the TableSorterVisual settings
 */
export default class TableSorterVisualSettings extends HasSettings {
    /**
     * The settings related to ranking
     */
    rankSettings: RankSettings;
    /**
     * The presentation settings
     */
    presentation: PresentationSettings;
    /**
     * The selection settings
     */
    selection: SelectionSettings;
}
