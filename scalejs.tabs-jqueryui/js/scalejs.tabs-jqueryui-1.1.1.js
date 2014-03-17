
define('text!scalejs.tabs-jqueryui/tabs.html',[],function () { return '<div id="tabs_template">\r\n    <div class="tabs" style="height:100%">\r\n        <div data-class="tabs-header-right" style="position:absolute;right:0px;"></div>\r\n            <ul class="tab-headers" data-class="tabs-sortable"></ul>\r\n                <!-- ko class: tabs-items-source -->\r\n                <div class="tabs-content-container">\r\n                        <!-- ko class:tabs-content-template -->\r\n                        <!-- /ko -->\r\n                </div>\r\n                <!-- /ko -->\r\n    </div>\r\n    <div class="tabs-more tabs-menu">\r\n    <!-- ko foreach: itemsSource -->\r\n        <div class="tabs-menu-item">\r\n            <span data-class="tabs-more-item"></span>\r\n            <div class="iconClose" data-class="tab-close"></div>\r\n        </div>\r\n    <!-- /ko -->       \r\n    </div> \r\n        <div class="tabs-add tabs-menu">\r\n            <!-- ko foreach: menuItems -->\r\n                <div class="tabs-menu-item" data-bind="text: header, click: addTab"></div>\r\n            <!-- /ko -->\r\n    </div>\r\n</div>\r\n\r\n <div id="tabs_content_default_template">\r\n         <p data-bind="text: $data"></p>\r\n</div>\r\n \r\n <div id="tabs_more_item_template">\r\n    <li class="tabs-menu-item">\r\n     <div class="tabs-header-text" data-class="tabs-header-text"></div>\r\n     <div class="iconClose" data-class="tab-close"></div></li>\r\n</div>\r\n\r\n <div id="tabs_header_item_template">\r\n    <li>\r\n        <a data-class="tabs-header">\r\n            <div class="tabs-header-text" data-class="tabs-header-text"></div>\r\n        </a>\r\n        <div class="iconClose" data-class="tab-more-close"></div>\r\n        <div class="iconMore" data-class="tab-more"></div>\r\n        <!--<div class="iconMax" data-class="tab-max"></div>-->\r\n    </li>\r\n</div>\r\n\r\n <div id="tabs_menu_temp_template">\r\n    <div class="tabs-menu">\r\n        <!-- ko foreach: menuItems -->\r\n            <div class="tabs-menu-item" data-bind="text: header, click: addTab"></div>\r\n        <!-- /ko -->\r\n    </div> \r\n</div>';});

/*global define*/
define('scalejs.tabs-jqueryui/tabsBindings',{
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
                    data: this.content,
                }
            };
        }
        return {};
    },
    'tab-more-close': function (ctx) {
        var itemsSource = ctx.$parent.itemsSource,
            refreshTabs = ctx.$parent.refreshTabs,
            active = ctx.$parent.active;

        return {
            click: function () {
                ctx.$data.onRemove && ctx.$data.onRemove();
                if (active() === ctx.$index()) {
                    active(0);
                } else if (active() > ctx.$index()) {
                    active(active() - 1);
                }
                itemsSource.remove(ctx.$data);
            },
            visible: !ctx.$parent.more()
        };
    },
    'tab-close': function (ctx) {
        var itemsSource = ctx.$parent.itemsSource,
            refreshTabs = ctx.$parent.refreshTabs,
            active = ctx.$parent.active;

        return {
            click: function () {
                ctx.$data.onRemove && ctx.$data.onRemove();
                itemsSource.remove(ctx.$data);
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


/*global define*/
define('scalejs.tabs-jqueryui',[
	'scalejs!core',
	'knockout',
	'jQuery',
	'text!./scalejs.tabs-jqueryui/tabs.html',
	'./scalejs.tabs-jqueryui/tabsBindings',
	'scalejs.mvvm',
    'bPopup',
    'knockout-sortable'
], function (
	core,
    ko,
    $,
	tabsTemplates,
	tabsBindings
) {


    var registerTemplates = core.mvvm.registerTemplates,
           registerBindings = core.mvvm.registerBindings,
           isObservable = ko.isObservable,
           observableArray = ko.observableArray,
           toEnumerable = core.linq.enumerable.from,
           unwrap = ko.unwrap,
           merge = core.object.merge;

    //TODO: update this
    registerTemplates(tabsTemplates);
    registerBindings(tabsBindings);

    function wrapValueAccessor(valueAccessor, element) {
        return function () {
            var data = valueAccessor(),
                activeItem,
                backupItems,
                el,
                active,
                $tabs,
                $menu = {};

            options = {
                activate: function () {
                    data.active($tabs.tabs("option", "active"));
                }
            }
            /*
             * setupTabs: creates tabs control with edittable headers
             */
            function setupTabs() {
                el = $(ko.virtualElements.firstChild(element)).parent();

                /* finds and hides add and more menu */
                $menu.add = $($(el).find('.tabs-add')).hide();
                $menu.more = $($(el).find('.tabs-more')).hide();

                /* initializes jquery tabs */
                $tabs = $($(el).find('.tabs')).tabs(options);

                /* enables editable headers */
                $.widget("ui.tabs", $.ui.tabs, {
                    options: { keyboard: true },
                    _tabKeydown: function (e) {
                        if (this.options.keyboard) { this._super('_tabKeydown'); }
                        else { return false; }
                    }
                });
                $tabs.delegate("a.ui-tabs-anchor", "dblclick", function () {
                    var header = ko.dataFor(this).header,
					    $input,
					    el = this;

                    if (isObservable(header)) {

                        $(el).find("[data-class='tabs-header-text']").replaceWith("<input data-class='tabs-header-edit' />");
                        $input = $(el).find("input");

                        ko.applyBindings(ko.dataFor(this), $input.get(0));
                        $input.focus();
                        $input.bind('keyup', function (e) {
                            var code = e.keyCode || e.which;
                            if (code == 13) {
                                $input.replaceWith("<div class='tabs-header-text' data-class='tabs-header-text'></div>");
                                ko.applyBindings(ko.dataFor(el), $(el).find("[data-class='tabs-header-text']").get(0));
                            }
                        });

                        $input.bind('blur', function () {
                            $input.replaceWith("<div class='tabs-header-text' data-class='tabs-header-text'></div>");
                            ko.applyBindings(ko.dataFor(el), $(el).find("[data-class='tabs-header-text']").get(0));
                        });
                    }
                });

                /* layout */
                //for bottom scrollbar
                if (core.layout && core.layout.onLayoutDone) {
                    core.layout.onLayoutDone(function () {
                        $tabs.find('.ui-tabs-panel').each(function () {
                            var tabsHeight = $tabs.height(),
                                headersHeight = $tabs.find('.tab-headers').height();

                            $(this).height(tabsHeight - headersHeight);
                        });
                    });
                }



                /* binds width calculation on resize */
                $(window).resize(calculateWidth);

                data.itemsSource.subscribe(function () {
                    refreshTabs();
                });
            }

            /*
             * refreshTabs: updates tabs whenever a significant change is made
             */
            function refreshTabs(active) {
                /* refreshes jqueryui tabs */

                //knockout binding to index just does not work.
                //luckily this does.
                $tabs.find('a[data-class="tabs-header"]').each(function (i, el) {
                    $(el).attr('href', '#tabs-' + i);
                });
                $tabs.find('.tabs-content-container').each(function (i, el) {
                    $(el).attr('id', 'tabs-' + i);
                });

                // need to destroy tabs and re-initalize
                $tabs.tabs('destroy');
                $tabs = $($(el).find('.tabs')).tabs(options);

                //may or may not be neccessary
                /*setTimeout(function () {
                    $tabs.find('.tab-headers').sortable('refresh');
                }, 50);*/

                /* activates the appropriate tab */
                $tabs.tabs("option", "active", data.active());
                data.active.valueHasMutated();

                /* binds click handler to more menu item */
                $menu.more.find('.tabs-menu-item').each(function (i, el) {
                    $(el).unbind().click(function () {
                        //$tabs.tabs("option", "active", i);
                        $menu.more.bPopup({ opacity: 0 }).close();
                        data.active(i);
                        refreshTabs();
                    });
                });

                createAddTab();
                calculateWidth();
            }

            /*
             * calculateWidth: determines if tabs fit within window
             */
            function calculateWidth() {
                var tabsContainerWidth = $tabs.outerWidth(),
                    $headers = $tabs.find('ul.tab-headers'),
                    $tabItems = $headers.find('li').show(),
                    tabsWidth = $tabItems.get().reduce(function (acc, el) {
                        acc += $(el).outerWidth();
                        return acc;
                    }, 0) + 20;

                data.more(false);
                if (tabsWidth > tabsContainerWidth) {
                    $tabItems.hide();
                    data.more(true);
                    $headers.find('.ui-state-active').show();
                }
                createAddTab();
            }

            /*
             * createAddTab: creates the tab which opens the add tab menu
             */
            function createAddTab() {
                var $tab;
                $tabs.find('li.add').remove();
                $headers = $tabs.find('ul.tab-headers');
                $headers.append('<li class="unsortable add"><a href="#tabs-add">+</a></li>');
                $tab = $tabs.find('[href="#tabs-add"]');
                $tab.unbind().click(function (e) {
                    e.preventDefault();
                    $menu.add.bPopup({
                        follow: [false, false],
                        position: [$tab.offset().left + $tabs.find('li.add').width(), $tab.offset().top],
                        opacity: 0,
                        speed: 0
                    });
                });
            }


            data.sortOptions = {
                items: "li:not(.unsortable)",
                axis: "x",
                start: function () {
                    backupItems = data.itemsSource();
                    activeItem = data.itemsSource()[data.active()];
                    $tabs.find('li.unsortable').remove();
                },
                stop: function (args) {
                    if (backupItems.length !== data.itemsSource.length) {
                        data.itemsSource(backupItems);
                    } else {

                    }
                }
            };

            data.menuItems = observableArray(toEnumerable(unwrap(data.defaultItems)).select(function (item) {
                var menuItem = merge(item, {
                    addTab: function () {
                        $menu.add.bPopup({ opacity: 0 }).close();
                        data.active(data.itemsSource().length);
                        data.itemsSource.push(item.create());
                    }
                });
                return menuItem;
            }).toArray());

            data.afterMove = function () {
                data.active(data.itemsSource.indexOf(activeItem));
                $tabs.tabs("option", "active", data.active());
            }

            data.refreshTabs = refreshTabs;

            data.more = ko.observable(false);

            data.active = data.active || ko.observable(1);

            data.active.subscribe(function (x) {
                setTimeout(function () {
                    console.log('invalidate');
                    core.layout.invalidate({ reparse: false });
                }, 0);
            });

            data.openMore = function () {
                var $tab = $($tabs.find('li').get(data.active()));
                $menu.more.bPopup({
                    follow: [false, false],
                    position: [$tab.offset().left + 10, $tab.offset().top + $tab.outerHeight() + 10],
                    opacity: 0,
                    speed: 0
                });
            }

            return {
                data: data,
                name: "tabs_template",
                afterRender: function () {
                    if (data.itemsSource.length > 0) {
                        setupTabs();
                        refreshTabs();
                    } else {
                        var sub = data.itemsSource.subscribe(function (v) {
                            setupTabs();
                            refreshTabs();
                            sub.dispose();
                        });
                    }
                }
            };
        };
    }

    function init(
		element,
		valueAccessor,
		allBindingsAccessor,
		viewModel,
		bindingContext
	) {
        ko.bindingHandlers.template.update(
            element,
            wrapValueAccessor(valueAccessor, element),
            allBindingsAccessor,
            viewModel,
            bindingContext
        );

        return { 'controlsDescendantBindings': true };
    }

    ko.bindingHandlers.tabs = {
        init: init
    };

    ko.virtualElements.allowedBindings.tabs = true;
    ko.virtualElements.allowedBindings.sortable = true;
});

