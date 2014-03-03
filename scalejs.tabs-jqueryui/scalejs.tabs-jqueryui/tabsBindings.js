/*global define*/
define({
    'tabs-header': function (ctx) {
        return {
            click: function (data, e) {
                e.preventDefault();
            }
        };
    },
    'tabs-header-text': function () {
        return {
            text: this.header
        };
    },
    'tabs-items-source': function () {
        return {
            foreach: this.itemsSource
        };
    },
    'tabs-header-edit': function () {
        return {
            value: this.header,
            valueUpdate: 'afterkeydown'
        };
    },
    'tabs-content-template': function (ctx) {
        var contentTemplate = this.contentTemplate || ctx.$parent.contentTemplate || "tabs_content_default_template";

        return {
            template: {
                name: contentTemplate,
                data: this.content
            }
        };
    },
    'tabs-header-right': function () {
        if (this.headerTemplate) {
            return {
                template: {
                    name: this.headerTemplate,
                    data: this.content
                }
            };
        }
        return {};
    },
    'tab-more-close': function (ctx) {
        var itemsSource = ctx.$parent.itemsSource,
            refreshTabs = ctx.$parent.refreshTabs;

        return {
            click: function () {
                itemsSource.remove(ctx.$data);
                refreshTabs();
            },
            visible: !ctx.$parent.more()
        };
    },
    'tab-close': function (ctx) {
        var itemsSource = ctx.$parent.itemsSource,
            refreshTabs = ctx.$parent.refreshTabs;

        return {
            click: function () {
                itemsSource.remove(ctx.$data);
                refreshTabs();
            }
        };
    },
    'tab-max': function () {
        return {
            click: function (data) {
                console.log("maximixing", data);
            }
        };
    },
    'tabs-sortable': function () {
        return {
            sortable: {
                template: "tabs_header_item_template",
                data: this.itemsSource,
                options: this.sortOptions,
                afterMove: this.afterMove
            }
        };
    },
    'tab-more': function (ctx) {
        return {
            visible: ctx.$parent.more,
            click: ctx.$parent.openMore
        }
    },
    'tabs-more-item': function (ctx) {
        return {
            style: {
                color: ctx.$parent.active() === ctx.$index() ? 'red' : 'white'
            },
            text: this.header
        };
    }
});

