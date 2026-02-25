window.WidgetRegistry = {};

function registerWidget(widgetObject) {
    window.WidgetRegistry[widgetObject.type] = widgetObject;
}