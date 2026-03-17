// recien lo movi a esto blotver\public\js\core\registry.js

window.WidgetRegistry = {};

function registerWidget(widgetObject) {
    window.WidgetRegistry[widgetObject.type] = widgetObject;
}