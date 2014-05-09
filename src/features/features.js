angular.module( 'core9Dashboard.feature', [
    'ui.router',
    'core9Dashboard.menu',
    'core9Dashboard.config',
    'core9Dashboard.content',
    'core9Dashboard.feature.public',
    'core9Dashboard.feature.private',
    'core9Dashboard.feature.config',
    'core9Dashboard.feature.processor.content',
    'core9Dashboard.feature.processor.config'
])

.config(function ($stateProvider) {
    $stateProvider.state('features',  {
        abstract: true,
        views: {
          "main": {
            template: '<div ui-view></div>'
          }
        },
        data:{ 
          pageTitle: 'Feature',
          context: 'features',
          sidebar: 'config'
        }
    })
    .state('features.list', {
        url: '/config/features',
        controller: 'ConfigFeaturesListCtrl',
        templateUrl: 'features/features.tpl.html'
    })
    .state('features.edit', {
        url: '/config/features/:repo/{feature:.*}',
        controller: "ConfigFeaturesFeatureCtrl",
        templateUrl: 'features/feature.tpl.html'
    });
})

.controller("ConfigFeaturesListCtrl", function ($scope, $state, ConfigFactory, $http) {
  $scope.loading = "";

  $scope.download = function (repository) {
    $http.post("/admin/featurerepository/" + repository._id + "?pull")
    .success(function(data) {
      repository.$get();
      alert("Repository downloaded");
    })
    .error(function(data) {
      $scope.$emit("$error", data);
    });
  };

  $scope.deactivate = function (repo, feature) {
    $scope.loading = feature.name;
    var obj = {
      repo: repo._id,
      feature: feature.name
    };
    $http.post("/admin/features/disable", obj)
    .success(function (data) {
      repo.$get();
      $scope.loading = "";
    })
    .error(function (error) {
      $scope.$emit("$error", error);
      $scope.loading = "";
    });
  };

  $scope.apply = function (repo, feature, version) {
    $scope.loading = feature.name;
    var obj = {
      repo: repo._id,
      feature: feature.name,
      version: version
    };
    $http.post("/admin/features/apply", obj)
    .success(function (data) {
      $scope.loading = "";
    })
    .error(function (error) {
      $scope.$emit("$error", error);
      $scope.loading = "";
    });
  };
})

.controller("ConfigFeaturesFeatureCtrl", function ($scope, $http, $state, $stateParams) {
    $http.get("/admin/featurerepository/" + $stateParams.repo + "/" + encodeURIComponent($stateParams.feature))
    .success(function (data) {
        if(typeof data === 'object') {
            $scope.feature = data;
        } else {
            $scope.feature = {name: $stateParams.feature};
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
    MenuService.add('features', {title: "Settings", weight: 1, link: "features.settings"});
    MenuService.add('config', {title: "Features", weight: 300, link: "features.list"});
})
;