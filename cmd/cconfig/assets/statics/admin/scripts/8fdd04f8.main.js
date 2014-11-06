var codisControllers=angular.module("codisControllers",["ui.bootstrap","ngResource"]);codisControllers.config(["$interpolateProvider",function(a){a.startSymbol("[["),a.endSymbol("]]")}]),codisControllers.config(["$httpProvider",function(a){a.defaults.useXDomain=!0,delete a.defaults.headers.common["X-Requested-With"]}]),codisControllers.factory("ServerGroupsFactory",["$resource",function(a){return a("/api/server_groups",{},{query:{method:"GET",isArray:!0},create:{method:"PUT"}})}]),codisControllers.factory("ProxyStatusFactory",["$resource",function(a){return a("/api/proxy",{},{query:{method:"GET",url:"/api/proxy/list",isArray:!0},setStatus:{method:"POST"}})}]),codisControllers.factory("RedisStatusFactory",["$resource",function(a){return a("/api/redis",{},{stat:{method:"GET",url:"/api/redis/:addr/stat"},slotInfoByGroupId:{method:"GET",url:"/api/redis/group/:group_id/:slot_id/slotinfo"}})}]),codisControllers.factory("MigrateStatusFactory",["$resource",function(a){return a("/api/migrate/status",{},{query:{method:"GET"},tasks:{method:"GET",url:"/api/migrate/tasks",isArray:!0},doMigrate:{method:"POST",url:"/api/migrate"},removePendingTask:{method:"DELETE",url:"/api/migrate/pending_task/:id/remove",params:{id:"@id"}},stopRunningTask:{method:"DELETE",url:"/api/migrate/task/:id/stop",params:{id:"@id"}}})}]),codisControllers.factory("SlotFactory",["$resource",function(a){return a("/api/slot",{},{rangeSet:{method:"POST"}})}]),codisControllers.factory("ServerGroupFactory",["$resource",function(a){return a("/api/server_group/:id",{},{show:{method:"GET",isArray:!0},"delete":{method:"DELETE",params:{id:"@id"}},addServer:{method:"PUT",url:"/api/server_group/:id/addServer",params:{id:"@group_id"}},deleteServer:{method:"PUT",url:"/api/server_group/:id/removeServer",params:{id:"@group_id"}},promote:{method:"POST",url:"/api/server_group/:id/promote",params:{id:"@group_id"}}})}]),codisControllers.controller("codisProxyCtl",["$scope","$http","ProxyStatusFactory",function(a,b,c){a.proxies=c.query(),a.setStatus=function(b,d){var e=confirm("are u sure?");e&&(b.state=d,c.setStatus(b,function(){a.proxies=c.query()}))},a.refresh=function(){console.log("reload proxy"),a.proxies=c.query()}}]),codisControllers.controller("codisOverviewCtl",["$scope","$http","$timeout",function(a,b,c){a.refresh=function(){b.get("/api/overview").success(function(b){var c=0,d=0,e=b.redis_infos;for(var f in e){var g=e[f];for(var h in g)0==h.indexOf("db")&&(c+=parseInt(g[h].match(/keys=(\d+)/)[1])),"used_memory"==h&&(d+=parseInt(g[h]))}a.memUsed=(d/1048576).toFixed(2),a.keys=c,a.product=b.product,a.ops=b.ops})},a.refresh(),function d(){c(d,1e3),a.refresh()}()}]),codisControllers.controller("codisSlotCtl",["$scope","$http","$modal","SlotFactory",function(a,b,c,d){a.rangeSet=function(){var a=c.open({templateUrl:"slotRangeSetModal",controller:["$scope","$modalInstance",function(a,b){a.task={from:"-1",to:"-1",new_group:"-1"},a.ok=function(a){b.close(a)},a.cancel=function(){b.close(null)}}],size:"sm"});a.result.then(function(a){a&&(console.log(a),d.rangeSet(a,function(){alert("success")},function(a){alert(a.data)}))})}}]),codisControllers.controller("codisMigrateCtl",["$scope","$http","$modal","MigrateStatusFactory",function(a,b,c,d){a.migrate_status=d.query(),a.migrate_tasks=d.tasks(),a.migrate=function(){var b=c.open({templateUrl:"migrateModal",controller:["$scope","$modalInstance",function(a,b){a.task={from:"-1",to:"-1",new_group:"-1",delay:1},a.ok=function(a){b.close(a)},a.cancel=function(){b.close(null)}}],size:"sm"});b.result.then(function(b){b&&(console.log(b),d.doMigrate(b,function(){a.refresh()},function(a){alert(a.data)}))})},a.removePendingTask=function(b){d.removePendingTask(b,function(){a.refresh()},function(a){alert(a.data)})},a.stopRunningTask=function(b){d.stopRunningTask(b,function(){a.refresh()},function(a){alert(a.data)})},a.refresh=function(){a.migrate_status=d.query(),a.migrate_tasks=d.tasks()}}]),codisControllers.controller("redisCtl",["$scope","RedisStatusFactory",function(a,b){a.serverInfo=b.stat(a.server)}]),codisControllers.controller("slotInfoCtl",["$scope","RedisStatusFactory",function(a,b){a.slotInfo=b.slotInfoByGroupId({slot_id:a.slot.id,group_id:a.slot.state.migrate_status.from})}]),codisControllers.controller("codisServerGroupMainCtl",["$scope","$http","$modal","$log","ServerGroupsFactory","ServerGroupFactory",function(a,b,c,d,e,f){a.removeServer=function(b){console.log(b.group_id);var c=confirm("are you sure?");c&&f.deleteServer(b,function(){a.server_groups=e.query()},function(a){console.log(a.data),alert(a.data)})},a.promoteServer=function(b){f.promote(b,function(){a.server_groups=e.query()},function(a){alert(a.data)})},a.removeServerGroup=function(b){var c=confirm("are you sure?");c&&f.delete({id:b},function(){a.server_groups=e.query()},function(){console.log(failedData),alert(failedData.data)})},a.addServer=function(b){var d=c.open({templateUrl:"addServerToGroupModal",controller:["$scope","$modalInstance",function(a,c){a.server={addr:"",type:"slave",group_id:b},a.ok=function(a){c.close(a)},a.cancel=function(){c.close(null)}}],size:"sm"});d.result.then(function(b){b&&(console.log(b),f.addServer(b,function(){a.server_groups=e.query()},function(a){console.log(a.data),alert(a.data)}))})},a.addServerGroup=function(){var b=c.open({templateUrl:"newServerGroupModal",controller:["$scope","$modalInstance",function(a,b){a.ok=function(a){b.close(a)},a.cancel=function(){b.close(null)}}],size:"sm"});b.result.then(function(b){b&&e.create(b,function(){a.server_groups=e.query()},function(a){console.log(a),alert(a.data)})})},a.refresh=function(){a.server_groups=e.query()},a.server_groups=e.query()}]);