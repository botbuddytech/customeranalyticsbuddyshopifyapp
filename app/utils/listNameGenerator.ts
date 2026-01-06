
/**
 * Generates a suggested list name based on active filters and a configuration object.
 * 
 * @param filters The active filters object (e.g., { location: ['USA'], products: ['T-Shirt'] })
 * @param config Configuration object defining priority and formatting for each filter key
 * @returns A string representing the suggested list name
 */
export function suggestListName(
    filters: Record<string, any>,
    config: Record<string, { priority: number, format: (value: any) => string }>
) {
    return Object.entries(filters)
        .sort(([keyA], [keyB]) => {
            // Use the passed 'config' object
            const priorityA = config[keyA]?.priority || 100;
            const priorityB = config[keyB]?.priority || 100;
            return priorityA - priorityB;
        })
        .map(([key, value]) => {
            // Use the format function if it exists in config
            // Also check if value is not empty/null
            if (!value || (Array.isArray(value) && value.length === 0)) return null;

            const meta = config[key];
            return meta ? meta.format(value) : null;
        })
        .filter(Boolean)
        .join(" - "); // Separator for readability, can be space or other char
}
