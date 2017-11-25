/*
 * Copyright (C) 2015-2016 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * hifive
 */
(function() {
	h5.core.expose({
		__name: 'h5resdata.controller.ChildController',
		childController: h5.res.dependsOn('h5resdata.controller.GrandChildController'),
		__construct: function() {
			this.isExecutedConstruct = true;
		},
		__init: function() {
			this.isExecutedInit = true;
		},
		__postInit: function() {
			this.isExecutedPostInit = true;
		},
		__ready: function() {
			this.isExecutedReady = true;
		}
	});
})();