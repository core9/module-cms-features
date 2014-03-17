angular.module( 'core9Dashboard.feature.processor.config', [
	'ui.bootstrap',
	'core9Dashboard.config'
])

.controller('FeatureProcessorConfigCtrl', function($scope, $modal) {

  $scope.deselect = function(index) {
    $scope.$parent.selected.splice(index, 1);
  };

  $scope.add = function () {

    var modalInstance = $modal.open({
      templateUrl: 'features/processor/config.modal.tpl.html',
      controller: 'FeatureProcessorConfigModalCtrl',
      resolve: {
        selected: function() {
            return $scope.$parent.selected;
        }
      }
    });
  };
})

.controller('FeatureProcessorConfigModalCtrl', function($scope, $http, $modalInstance, ConfigFactory, selected) {
  $http.get("/admin/config?listtypes")
  .success(function (data) {
    $scope.configtypes = data;
  });
  
  $scope.contenttypes = ConfigFactory.query({configtype: 'content'});
  $scope.$watch('configtype', function() {
    if($scope.configtype !== undefined) {
      $scope.configlist = ConfigFactory.query({configtype: $scope.configtype});
    }
  });

  $scope.isSelected = function(configid) {
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === configid) {
            return true;
        }
    }
    return false;
  };

  $scope.select = function(config) {
    var deleted = false;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === config._id) {
            deleted = true;
            selected.splice(i, 1);
        }
    }
    if(!deleted) {
        selected.push({id: config._id, entry: config});
    }
  };

  $scope.ok = function() {
    $modalInstance.close();
  };
})
;