/*global define*/
define([
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
                el,
                active,
                $tabs,
                $menu = {};

            /*
             * setupTabs: creates tabs control with edittable headers
             */
            function setupTabs() {
                el = $(ko.virtualElements.firstChild(element)).parent();

                /* finds and hides add and more menu */
                $menu.add = $($(el).find('.tabs-add')).hide();
                $menu.more = $($(el).find('.tabs-more')).hide();

                /* initializes jquery tabs */
                $tabs = $($(el).find('.tabs')).tabs();

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

                /* binds width calculation on resize */
                $(window).resize(calculateWidth);
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
                $tabs.find('div[data-class="tabs-content-container"]').each(function (i, el) {
                    $(el).attr('id', 'tabs-' + i);
                });

                // need to destroy tabs and re-initalize
                $tabs.tabs('destroy');
                $tabs = $($(el).find('.tabs')).tabs();

                //may or may not be neccessary
                setTimeout(function () {
                    $tabs.find('.tab-headers').sortable('refresh');
                });

                /* activates the appropriate tab */
                $tabs.tabs("option", "active", active || $tabs.tabs("option", "active"));
                data.active($tabs.tabs("option", "active"));

                /* fixes the height of the tabs content */
                $tabs.find('.ui-tabs-panel').each(function () {
                    var tabsHeight = $tabs.height(),
                        headersHeight = $tabs.find('.tab-headers').height();
                    $(this).height(tabsHeight - headersHeight);
                });

                /* binds click handler to more menu item */
                $menu.more.find('.tabs-menu-item').each(function (i, el) {
                    $(el).unbind().click(function () {
                        //$tabs.tabs("option", "active", i);
                        $menu.more.bPopup({ opacity: 0 }).close();
                        refreshTabs(i);
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
                    //remove add tab
                    //$tabs.find('li.unsortable').remove();
                },
                stop: function (args) {
                    active = args.targetIndex;
                }
            };

            data.menuItems = observableArray(toEnumerable(unwrap(data.defaultItems)).select(function (item) {
                var menuItem = merge(item, {
                    addTab: function () {
                        $menu.add.bPopup({ opacity: 0 }).close();
                        data.itemsSource.push(item.create());
                        refreshTabs(data.itemsSource().length - 1);
                    }
                });
                return menuItem;
            }).toArray());

            data.afterMove = function () {
                console.log('sort complete');
                refreshTabs();
            }
            data.refreshTabs = refreshTabs;

            data.more = ko.observable(false);

            data.active = ko.observable(1);

            data.openMore = function () {
                var $tab = $($tabs.find('li').get(1));
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
                    setupTabs();
                    refreshTabs();
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

