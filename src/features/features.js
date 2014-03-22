angular.module( 'core9Dashboard.feature', [
    'ui.router',
    'core9Dashboard.menu',
    'core9Dashboard.config',
    'core9Dashboard.content',
    'core9Dashboard.feature.config',
    'core9Dashboard.feature.processor.content',
    'core9Dashboard.feature.processor.config'
])

.config(function ($stateProvider) {
    $stateProvider.state('features',  {
        url: '/config/features',
        views: {
            "main": {
                controller: 'ConfigFeaturesListCtrl',
                templateUrl: 'features/features.tpl.html'
            }
        },
        data:{ pageTitle: 'Features' }
    })
    .state('editfeature', {
        url: '/config/features/:repo/{feature:.*}',
        views: {
            "main": {
                controller: "ConfigFeaturesFeatureCtrl",
                templateUrl: 'features/feature.tpl.html'
            }
        },
        data:{ pageTitle: 'Feature' }
    });
})

.controller("ConfigFeaturesListCtrl", function ($scope, $state, ConfigFactory, $http) {
    ConfigFactory.query({configtype: 'featuresrepo_int'}, function (data) {
        if(data.length === 0) {
            $scope.internal = new ConfigFactory();
            $scope.internal.$save({configtype: 'featuresrepo_int', current: {}});
        } else {
            $scope.internal = data[0];
        }
    });

    $scope.apply = function (repo, feature, version) {
        var obj = {
            repo: repo,
            feature: feature.name,
            version: version
        };
        $http.post("/admin/features/apply", obj)
        .success(function (data) {
            $scope.internal.$get();
        });
    };

    $scope.edit = function (repo, feature) {
        $state.go("editfeature", {repo: repo, feature: feature});
    };

    $scope.deactivate = function (repo, feature) {
        var obj = {
            repo: repo,
            feature: feature.name
        };
        $http.post("/admin/features/disable", obj)
        .success(function (data) {
            $scope.internal.$get();
        });
    };
})

.controller("ConfigFeaturesInternalCtrl", function ($scope, $http, ConfigFactory) {
    $scope.$watch('internal', function () {
        if($scope.internal !== undefined) {
            $http.get("/admin/featurerepository/" + $scope.internal._id)
            .success(function (data) {
                $scope.features = data;
            })
            .error (function (data) {
                $scope.$emit("$error", data);
            });
        }
    });

    $scope.add = function (feature) {
        $scope.edit($scope.internal._id, feature);
    };

})

.controller("ConfigFeaturesExternalCtrl", function ($scope, $http, ConfigFactory) {
    ConfigFactory.query({configtype: 'featuresrepo_ext'}, function (data) {
        $scope.repos = data;
    });

    $scope.openRepo = function(repoid) {
        if(repoid === $scope.activeRepo) {
            $scope.activeRepo = null;
        } else {
            $scope.activeRepo = repoid;
            $http.get("/admin/featurerepository/" + repoid)
            .success(function(data) {
                $scope.features = data;
            });
        }
    };
})

.controller("ConfigFeaturesFeatureCtrl", function ($scope, $http, $state, $stateParams) {
    $http.get("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature))
    .success(function (data) {
        if(data === "") {
            $scope.feature = {name: $stateParams.feature};
        } else {
            $scope.feature = data;
        }
    })
    .error(function (data) {
        $scope.$emit("$error", data);
    });

    $http.get("/admin/features?getTypes")
    .success(function (data) {
        $scope.featureTypes = data;
    });

    $scope.save = function () {
        $http.put("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature), $scope.feature)
        .success(function (data) {
            $scope.feature = data;
            alert("Saved");
        });
    };

    $scope.removeFeature = function () {
        var certain = confirm("Do you really want to delete the entire feature? Click OK if you are sure.");
        if(certain) {
            $http["delete"]("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature))
            .success(function () {
                $state.go('features');
            });
        }
    };

    $scope.removeVersion = function () {
        var certain = confirm("Do you really want to delete this version? Click OK if you are sure.");
        if(certain) {
            $http["delete"]("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature) + "-v" + $scope.selectedVersion)
            .success(function (data) {
                $scope.feature = data;
                $scope.selectedVersion = false;
            });
        }
    };

    $scope.addVersion = function (version) {
        if($scope.feature.versions === undefined) {
            $scope.feature.versions = [];
        }
        if(version !== undefined && version !== null && version !== "") {
            $scope.feature.versions.push(version);
            $scope.save();
        } else {
            alert("Enter a version name/number.");
        }
        
    };

    $scope.saveVersion = function () {
        $http.put("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature) + "-v" + $scope.selectedVersion, $scope.version)
        .success(function (data) {
            $scope.version = data;
            alert("Saved");
            $scope.selectedVersion = false;
        });
    };

    $scope.updateVersion = function () {
        $http.post("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature) + "-v" + $scope.selectedVersion)
        .success(function (data) {
            $scope.version = data;
            alert("Your contents are updated.");
        });
    };

    $scope.selectedVersion = false;
    $scope.select = function (version) {
        var change = true;
        if($scope.selectedVersion !== false) {
            change = confirm("Do you really want to change versions? Your changes will be lost, click save to persist them.");
        }
        if(change) {
            if(version === $scope.selectedVersion) {
                $scope.selectedVersion = false;
            } else {
                $scope.selectedVersion = version;
            }
        }
    };

    $scope.$watch('selectedType', function (newValue, oldValue) {
        if(newValue !== oldValue && newValue !== undefined) {
            if($scope.version[newValue] === undefined) {
                $scope.version[newValue] = [];
            }
        }
    });

    $scope.$watch('selectedVersion', function (newValue, oldValue) {
        if(newValue !== oldValue && newValue !== undefined && newValue !== false) {
            $http.get("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature) + "-v" + $scope.selectedVersion)
            .success(function (data) {
                $scope.version = data;
            });
        } else {
            delete($scope.selectedType);
        }
    });
})

.directive('cnFeatureProcessor', function ($compile, $templateCache) {
    return {
        replace: true,
        scope: {
            template: '=cnProcessorTemplate',
            selected: '=cnSelectedItems'
        },
        link: function (scope, element, attrs) {
            element.html("<div><i class=\"fa fa-spinner fa-spin\"></i> Loading</div>");
            $compile(element.contents())(scope);
            scope.$watch('template', function (newValue, oldValue) {
                if(newValue !== oldValue && newValue !== undefined) {
                    element.html($templateCache.get(newValue));
                    $compile(element.contents())(scope);
                }
            });
        }
    };
})

.run(function (MenuService) {
    MenuService.add('config', {title: "Features", weight: 300, link: "/config/features"});
})
;