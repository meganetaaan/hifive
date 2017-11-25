/*
 * Copyright (C) 2014-2016 NS Solutions Corporation
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
	// ----------- env ----------
	/**
	 * 読み込んでいるhifiveがdev版かどうか('src'はdev扱い)
	 *
	 * @memberOf
	 */
	var isDevMode = H5_TEST_ENV.buildType !== 'min';

	// ----------- log ----------
	/**
	 * outputEachLevelで出力するログメッセージ
	 */
	var LOG_MESSAGE_ERROR = 'ERRORレベルのログ';
	var LOG_MESSAGE_WARN = 'WARNレベルのログ';
	var LOG_MESSAGE_DEBUG = 'DEBUGレベルのログ';
	var LOG_MESSAGE_INFO = 'INFOレベルのログ';
	var LOG_MESSAGE_TRACE = 'TRACEレベルのログ';

	/**
	 * ログの設定を元に戻す
	 */
	var restoreDefault = (function() {
		// h5ロード時のログ設定を覚えておく
		var orgSettings = null;
		$(document).bind('h5preinit', function() {
			orgSettings = $.extend({}, h5.settings.log);
		});
		return function() {
			h5.settings.log = orgSettings;
			h5.log.configure();
		};
	})();

	/**
	 * 各レベルでログメッセージを出力する
	 *
	 * @param {Log} 指定しない場合は作成します
	 */
	function outputEachLevel(logger) {
		var logger = logger || h5.log.createLogger('LogTest');
		logger.error(LOG_MESSAGE_ERROR);
		logger.warn(LOG_MESSAGE_WARN);
		logger.info(LOG_MESSAGE_INFO);
		logger.debug(LOG_MESSAGE_DEBUG);
		logger.trace(LOG_MESSAGE_TRACE);
	}

	// ----------- controller ----------
	/**
	 * コントローラがdisposeされているかどうかチェックします
	 *
	 * @param controller
	 * @returns {Boolean}
	 */
	function isDisposed(controller) {
		var ret = true;
		for ( var p in controller) {
			if (controller.hasOwnProperty(p) && controller[p] !== null) {
				ret = false;
			}
		}
		return ret;
	}

	/**
	 * #qunit-fixtur内にバインドされているコントローラをdisposeして、コントローラキャッシュ、ロジックキャッシュをクリアする
	 */
	function clearController() {
		var controllers = h5.core.controllerManager.getControllers('#qunit-fixture', {
			deep: true
		});
		for (var i = controllers.length - 1; i >= 0; i--) {
			controllers[i].dispose();
		}
		h5.core.definitionCacheManager.clearAll();
	}

	/**
	 * アスペクトを削除する
	 */
	function cleanAllAspects() {
		h5.settings.aspects = null;
	}

	/**
	 * @name h5devtestutils
	 * @namespace
	 */
	window.h5devtestutils = {
		env: {
			isDevMode: isDevMode
		},
		log: {
			LOG_MESSAGE_ERROR: LOG_MESSAGE_ERROR,
			LOG_MESSAGE_WARN: LOG_MESSAGE_WARN,
			LOG_MESSAGE_DEBUG: LOG_MESSAGE_DEBUG,
			LOG_MESSAGE_INFO: LOG_MESSAGE_INFO,
			LOG_MESSAGE_TRACE: LOG_MESSAGE_TRACE,
			restoreDefault: restoreDefault,
			outputEachLevel: outputEachLevel
		},
		controller: {
			isDisposed: isDisposed,
			clearController: clearController,
			cleanAllAspects: cleanAllAspects
		}
	};
})();