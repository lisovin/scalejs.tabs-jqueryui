param($installPath, $toolsPath, $package, $project)

$project |
	Add-Paths "{
		'scalejs.tabs-jqueryui' : 'Scripts/scalejs.tabs-jqueryui-$($package.Version)',
		'bPopup': 'Scripts/jquery.bpopup.min',
		'jquery-ui' : 'Scripts/jquery-ui-1.10.3',
		'knockout-sortable': 'Scripts/knockout-sortable'
	}" |
	Add-Shims "{
		'bPopup' : {
			'deps': ['jQuery']
		},
		'jquery-ui': {
			'deps': ['jQuery']
		}
	}" |
	Add-ScalejsExtension 'scalejs.tabs-jqueryui' |
	Out-Null