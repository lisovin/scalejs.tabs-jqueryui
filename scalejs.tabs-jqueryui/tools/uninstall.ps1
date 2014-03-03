param($installPath, $toolsPath, $package, $project)

$project |
	Remove-Paths 'scalejs.tabs-jqueryui' |
	Remove-ScalejsExtension 'scalejs.tabs-jqueryui' |
	Out-Null
