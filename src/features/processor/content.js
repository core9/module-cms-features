angular.module( 'core9Dashboard.feature.processor.content', [
  'core9Dashboard.config',
  'core9Dashboard.config.content',
  'core9Dashboard.content'
])

.controller('FeatureProcessorContentCtrl', function($scope, $modal) {

  $scope.deselect = function(index) {
    $scope.$parent.selected.splice(index, 1);
  };

  $scope.add = function () {

    var modalInstance = $modal.open({
      templateUrl: 'features/processor/content.modal.tpl.html',
      controller: 'FeatureProcessorContentModalCtrl',
      resolve: {
        selected: function() {
            return $scope.$parent.selected;
        }
      }
    });
  };
})

.controller('FeatureProcessorContentModalCtrl', function($scope, $modalInstance, ConfigFactory, ContentFactory, selected) {
  $scope.contenttypes = ConfigFactory.query({configtype: 'content'});
  $scope.$watch('contenttype', function() {
    if($scope.contenttype !== undefined && $scope.contenttype.name !== undefined) {
      $scope.contentlist = ContentFactory.query({contenttype: $scope.contenttype.name});
    }
  });

  $scope.isSelected = function(contentid) {
    var id = $scope.contenttype.name + "-" + contentid;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === id) {
            return true;
        }
    }
    return false;
  };

  $scope.select = function(content) {
    var deleted = false;
    var id = $scope.contenttype.name + "-" + content._id;
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].id === id) {
            deleted = true;
            selected.splice(i, 1);
        }
    }
    if(!deleted) {
        selected.push({id: id, entry: content});
    }
  };

  $scope.ok = function() {
    $modalInstance.close();
  };
})
;