/*
 * Copyright (C) 2012-2016 NS Solutions Corporation
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

/* ------ h5.core.view ------ */
(function() {
	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	// =============================
	// Production
	// =============================

	/**
	 * EJSにスクリプトレットの区切りとして認識させる文字
	 */
	var DELIMITER = '[';

	// エラーコード
	/**
	 * コンパイルしようとしたテンプレートが文字列でない
	 */
	var ERR_CODE_TEMPLATE_COMPILE_NOT_STRING = 7000;

	/**
	 * テンプレートIDが不正である時に発生するエラー
	 */
	var ERR_CODE_TEMPLATE_INVALID_ID = 7002;

	/**
	 * load()呼び出し時に引数にファイル名またはファイル名の配列が渡されなかった時に発生するエラー
	 */
	var ERR_CODE_INVALID_FILE_PATH = 7004;

	/**
	 * 登録されていないテンプレートIDを指定したときに発生するエラー
	 */
	var ERR_CODE_TEMPLATE_ID_UNAVAILABLE = 7005;

	/**
	 * テンプレートに渡すパラメータに必要なプロパティが設定されていない時に発生するエラー
	 */
	var ERR_CODE_TEMPLATE_PROPATY_UNDEFINED = 7006;

	/**
	 * bindに指定されたターゲットが不正(非DOM要素またはセレクタで指定された要素が存在しない)な場合に発生するエラー
	 */
	var ERR_CODE_BIND_INVALID_TARGET = 7007;

	/**
	 * bindに指定したtargetが表すDOM要素が複数あるならエラー
	 */
	var ERR_CODE_TOO_MANY_TARGETS = 7008;

	/**
	 * bindに指定したcontextがオブジェクトでない
	 */
	var ERR_CODE_BIND_CONTEXT_INVALID = 7009;

	/**
	 * テンプレートのコンパイルエラー
	 */
	var ERR_CODE_TEMPLATE_COMPILE_SYNTAX_ERR = 7010;

	// =============================
	// Development Only
	// =============================

	var fwLogger = h5.log.createLogger('h5.core.view');

	/* del begin */
	var FW_LOG_TEMPLATE_NOT_REGISTERED = '指定されたIDのテンプレートは登録されていません。"{0}"';
	var FW_LOG_TEMPLATE_OVERWRITE = 'テンプレートID:{0} は上書きされました。';

	/**
	 * 各エラーコードに対応するメッセージ
	 */
	var errMsgMap = {};
	errMsgMap[ERR_CODE_TEMPLATE_COMPILE_NOT_STRING] = 'テンプレートのコンパイルでエラーが発生しました。テンプレートには文字列を指定してください。';
	// ERR_CODE_INVALID_IDのエラーのメッセージはh5.resで登録済みなのでここで再度登録はしない
	// (ejsファイル解析時のid不正と、get()の引数のid不正が同じエラーであるため、res,viewで両方使用している)
	//	errMsgMap[ERR_CODE_TEMPLATE_INVALID_ID] = 'テンプレートIDが指定されていません。空や空白でない文字列で指定してください。';
	errMsgMap[ERR_CODE_INVALID_FILE_PATH] = 'テンプレートファイルの指定が不正です。空や空白でない文字列、または文字列の配列で指定してください。';
	errMsgMap[ERR_CODE_TEMPLATE_ID_UNAVAILABLE] = 'テンプレートID:{0} テンプレートがありません。';
	errMsgMap[ERR_CODE_TEMPLATE_PROPATY_UNDEFINED] = '{0} テンプレートにパラメータが設定されていません。';
	errMsgMap[ERR_CODE_BIND_INVALID_TARGET] = 'bindの引数に指定されたターゲットが存在しないかまたは不正です。';
	errMsgMap[ERR_CODE_TOO_MANY_TARGETS] = 'bindの引数に指定されたバインド先の要素が2つ以上存在します。バインド対象は1つのみにしてください。';
	errMsgMap[ERR_CODE_BIND_CONTEXT_INVALID] = 'bindの引数に指定されたルートコンテキストが不正です。オブジェクト、データアイテム、またはObservableItemを指定してください。';
	errMsgMap[ERR_CODE_TEMPLATE_COMPILE_SYNTAX_ERR] = 'テンプレートのコンパイルでエラーが発生しました。構文エラー：{0} {1}';

	// メッセージの登録
	addFwErrorCodeMap(errMsgMap);
	/* del end */

	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	var getDeferred = h5.async.deferred;

	// =========================================================================
	//
	// Privates
	//
	// =========================================================================

	// =============================
	// Variables
	// =============================

	/**
	 * EJSテンプレート内で使用可能なヘルパー関数を格納するオブジェクト
	 */
	var helperExtras = {

		/**
		 * HTML文字列をエスケープします。
		 *
		 * @param {String} str エスケープ対象文字列
		 * @returns {String} エスケープされた文字列
		 */
		escapeHtml: function(str) {
			return h5.u.str.escapeHtml(str);
		}
	};

	// =============================
	// Functions
	// =============================

	/**
	 * jQueryオブジェクトか判定し、jQueryオブジェクトならそのまま、そうでないならjQueryオブジェクトに変換して返します。
	 *
	 * @function
	 * @param {Object} obj DOM要素
	 * @returns {Object} jQueryObject
	 */
	function getJQueryObj(obj) {
		return h5.u.obj.isJQueryObject(obj) ? obj : $(obj);
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	/**
	 * テンプレートを扱うクラス
	 * <p>
	 * <a href="h5.core.view.html">h5.core.view</a>がこのクラスを実装しています。また、<a
	 * href="h5.core.view.html#createView">h5.core.view.createView()</a>でこのクラスのインスタンスを生成できます。
	 * </p>
	 * <p>
	 * また、コントローラは内部にController.viewインスタンスを持ち、コントローラ内であればthis.viewで参照することができます。
	 * </p>
	 * <p>
	 * コントローラの持つViewについての詳細は、<a href="Controller.view.html">Controller.view</a>を参照してください。
	 * </p>
	 *
	 * @class
	 * @name View
	 */
	function View() {
		/**
		 * キャッシュしたテンプレートを保持するオブジェクト
		 *
		 * @private
		 * @name __cachedTemplates
		 * @memberOf View
		 */
		this.__cachedTemplates = {};
	}

	$.extend(View.prototype, {
		/**
		 * 指定されたパスのテンプレートファイルを非同期で読み込みキャッシュします。<br>
		 * このメソッドでは、通信エラー発生時に自動リトライは行いません（ver.1.1.4現在。将来この動作は変更される可能性があります）。
		 *
		 * @memberOf View
		 * @name load
		 * @function
		 * @param {String|String[]} resourcePaths テンプレートファイル(.ejs)のパス (配列で複数指定可能)
		 * @returns {Promise} promiseオブジェクト
		 */
		load: function(resourcePaths) {
			var dfd = getDeferred();
			var paths = null;

			// resourcePathsが文字列か配列でなかったらエラーを投げます。
			switch ($.type(resourcePaths)) {
			case 'string':
				if (!$.trim(resourcePaths)) {
					throwFwError(ERR_CODE_INVALID_FILE_PATH);
				}
				paths = [resourcePaths];
				break;
			case 'array':
				paths = resourcePaths;
				if (paths.length === 0) {
					throwFwError(ERR_CODE_INVALID_FILE_PATH);
				}
				for (var i = 0, len = paths.length; i < len; i++) {
					if (!isString(paths[i])) {
						throwFwError(ERR_CODE_INVALID_FILE_PATH);
					} else if (!$.trim(paths[i])) {
						throwFwError(ERR_CODE_INVALID_FILE_PATH);
					}
				}
				break;
			default:
				throwFwError(ERR_CODE_INVALID_FILE_PATH);
			}

			var promises = [];
			for (var i = 0, l = paths.length; i < l; i++) {
				promises.push(h5.res.get(paths[i]));
			}
			var view = this;
			waitForPromises(promises, function(resources) {
				// viewにテンプレートを登録
				resources = isArray(resources) ? resources : [resources];
				// 先に全てのテンプレートが登録できるかどうかをチェック
				// チェックしながら登録するテンプレートを列挙する
				var validTemplates = [];
				var invalidTemplate;
				for (var i = 0, l = resources.length; i < l; i++) {
					var templates = resources[i].templates;
					for (var j = 0, len = templates.length; j < len; j++) {
						if (!view.isValid(templates[j].content)) {
							invalidTemplate = templates[j];
							break;
						}
						validTemplates.push(templates[j]);
					}
					if (invalidTemplate) {
						break;
					}
				}
				if (invalidTemplate) {
					try {
						// invalidなテンプレートがあったらエラーオブジェクトを取得してreject
						view.register(invalidTemplate.id, invalidTemplate.content);
					} catch (e) {
						// 登録でエラーが発生したらrejectする
						// detailにエラーが発生した時のリソースのurlとpathを追加する
						e.detail.url = resources[i].url;
						e.detail.path = resources[i].path;
						return dfd.reject(e);
					}
				}

				// 全てvalidならすべてのテンプレートを登録
				for (var i = 0, l = validTemplates.length; i < l; i++) {
					view.register(validTemplates[i].id, validTemplates[i].content);
				}
				// TODO doneハンドラに渡す引数を作成
				dfd.resolve();
			}, function(e) {
				fwLogger.error(e.message);
				dfd.reject(e);
			});
			return dfd.promise();
		},

		/**
		 * Viewインスタンスに登録されている、利用可能なテンプレートのIDの配列を返します。
		 *
		 * @memberOf View
		 * @name getAvailableTemplates
		 * @function
		 * @returns {String[]} テンプレートIDの配列
		 */
		getAvailableTemplates: function() {
			var ids = [];
			for ( var id in this.__cachedTemplates) {
				ids.push(id);
			}
			return ids;
		},
		/**
		 * Viewインスタンスに、指定されたIDとテンプレート文字列からテンプレートを1件登録します。
		 * <p>
		 * 指定されたIDのテンプレートがすでに存在する場合は上書きします。 templateStringが不正な場合はエラーを投げます。
		 * </p>
		 *
		 * @memberOf View
		 * @name register
		 * @function
		 * @param {String} templateId テンプレートID
		 * @param {String} templateString テンプレート文字列
		 */
		register: function(templateId, templateString) {
			if ($.type(templateString) !== 'string') {
				throwFwError(ERR_CODE_TEMPLATE_COMPILE_NOT_STRING, null, {
					id: templateId
				});
			} else if (!isString(templateId) || !$.trim(templateId)) {
				throwFwError(ERR_CODE_TEMPLATE_INVALID_ID, []);
			}
			/* del begin */
			if (this.__cachedTemplates[templateId]) {
				fwLogger.info(FW_LOG_TEMPLATE_OVERWRITE, templateId);
			}
			/* del end */
			try {
				var compiledTemplate = new EJS.Compiler(templateString, DELIMITER);
				compiledTemplate.compile();
				this.__cachedTemplates[templateId] = compiledTemplate.process;
			} catch (e) {
				var lineNo = e.lineNumber;
				var msg = lineNo ? ' line:' + lineNo : '';
				throwFwError(ERR_CODE_TEMPLATE_COMPILE_SYNTAX_ERR, [msg, e.message], {
					id: templateId
				});
			}
		},

		/**
		 * テンプレート文字列が、コンパイルできるかどうかを返します。
		 *
		 * @memberOf View
		 * @name isValid
		 * @function
		 * @returns {Boolean} 第一引数に渡されたテンプレート文字列がコンパイル可能かどうか。
		 */
		isValid: function(templateString) {
			try {
				var compiledTemplate = new EJS.Compiler(templateString, DELIMITER);
				compiledTemplate.compile();
				return true;
			} catch (e) {
				return false;
			}
		},

		/**
		 * パラメータで置換された、指定されたテンプレートIDのテンプレートを取得します。
		 * <p>
		 * 取得するテンプレート内に置換要素([%= %])が存在する場合、パラメータを全て指定してください。
		 * </p>
		 * <p>
		 * templateIdがこのViewインスタンスで利用可能でなければエラーを投げます。
		 * </p>
		 * <p> ※ ただし、コントローラが持つviewインスタンスから呼ばれた場合、templateIdが利用可能でない場合は再帰的に親コントローラをたどり、
		 * 親コントローラが持つViewインスタンスで利用可能かどうか確認します。 利用可能であれば、そのインスタンスのview.get()を実行します。
		 * </p>
		 * <p>
		 * 一番上の親のViewインスタンスまで辿ってもtemplateId利用可能でなければ場合はh5.core.view.get()を実行します。
		 * h5.core.viewでtemplateIdが利用可能でなければエラーを投げます。
		 * </p>
		 * <p>
		 * <a href="#update">update()</a>, <a href="#append">append()</a>, <a
		 * href="#prepend">prepend()</a>についても同様です。
		 * </p>
		 *
		 * @memberOf View
		 * @name get
		 * @function
		 * @param {String} templateId テンプレートID
		 * @param {Object} [param] パラメータ(オブジェクトリテラルで指定)
		 * @returns {String} テンプレート文字列
		 */
		get: function(templateId, param) {
			var cache = this.__cachedTemplates;

			if (!isString(templateId) || !$.trim(templateId)) {
				throwFwError(ERR_CODE_TEMPLATE_INVALID_ID);
			}

			var template = cache[templateId];

			if (!template) {
				throwFwError(ERR_CODE_TEMPLATE_ID_UNAVAILABLE, templateId);
			}

			var p = (param) ? $.extend(true, {}, param) : {};
			var helper = p.hasOwnProperty('_h') ? new EJS.Helpers(p) : new EJS.Helpers(p, {
				_h: helperExtras
			});
			var ret = null;

			try {
				ret = template.call(p, p, helper);
			} catch (e) {
				throwFwError(ERR_CODE_TEMPLATE_PROPATY_UNDEFINED, e.toString(), e);
			}

			return ret;
		},

		/**
		 * 要素を指定されたIDのテンプレートで書き換えます。
		 * <p>
		 * templateIdがこのViewインスタンスで利用可能でなければエラーを投げますが、
		 * コントローラが持つviewインスタンスから呼ばれた場合は親コントローラのviewを再帰的にたどります。詳細は<a href="#get">get()</a>をご覧ください。
		 * </p>
		 *
		 * @memberOf View
		 * @name update
		 * @function
		 * @param {String|Element|jQuery} element DOM要素(セレクタ文字列, DOM要素, jQueryオブジェクト)
		 * @param {String} templateId テンプレートID
		 * @param {Object} [param] パラメータ
		 * @returns {jQuery} テンプレートが適用されたDOM要素(jQueryオブジェクト)
		 */
		update: function(element, templateId, param) {
			return getJQueryObj(element).html(this.get(templateId, param));
		},

		/**
		 * 要素の末尾に指定されたIDのテンプレートを挿入します。
		 * <p>
		 * templateIdがこのViewインスタンスで利用可能でなければエラーを投げますが、
		 * コントローラが持つviewインスタンスから呼ばれた場合は親コントローラのviewを再帰的にたどります。詳細は<a href="#get">get()</a>をご覧ください。
		 * </p>
		 *
		 * @memberOf View
		 * @name append
		 * @function
		 * @param {Element|jQuery} element DOM要素(セレクタ文字列, DOM要素, jQueryオブジェクト)
		 * @param {String} templateId テンプレートID
		 * @param {Object} [param] パラメータ
		 * @returns {jQuery} テンプレートが適用されたDOM要素(jQueryオブジェクト)
		 */
		append: function(element, templateId, param) {
			return getJQueryObj(element).append(this.get(templateId, param));
		},

		/**
		 * 要素の先頭に指定されたIDのテンプレートを挿入します。
		 * <p>
		 * templateIdがこのViewインスタンスで利用可能でなければエラーを投げますが、
		 * コントローラが持つviewインスタンスから呼ばれた場合は親コントローラのviewを再帰的にたどります。詳細は<a href="#get">get()</a>をご覧ください。
		 * </p>
		 *
		 * @memberOf View
		 * @name prepend
		 * @function
		 * @param {String|Element|jQuery} element DOM要素(セレクタ文字列, DOM要素, jQueryオブジェクト)
		 * @param {String} templateId テンプレートID
		 * @param {Object} [param] パラメータ
		 * @returns {jQuery} テンプレートが適用されたDOM要素(jQueryオブジェクト)
		 */
		prepend: function(element, templateId, param) {
			return getJQueryObj(element).prepend(this.get(templateId, param));
		},

		/**
		 * 指定されたテンプレートIDのテンプレートが存在するか判定します。
		 *
		 * @memberOf View
		 * @name isAvailable
		 * @function
		 * @param {String} templateId テンプレートID
		 * @returns {Boolean} 判定結果(存在する: true / 存在しない: false)
		 */
		isAvailable: function(templateId) {
			return !!this.__cachedTemplates[templateId];
		},

		/**
		 * 引数に指定されたテンプレートIDをもつテンプレートをキャッシュから削除します。 引数を指定しない場合はキャッシュされている全てのテンプレートを削除します。
		 *
		 * @memberOf View
		 * @name clear
		 * @param {String|String[]} templateIds テンプレートID
		 * @function
		 */
		clear: function(templateIds) {
			if (typeof templateIds === TYPE_OF_UNDEFINED) {
				this.__cachedTemplates = {};
				return;
			}

			var templateIdsArray = null;
			switch ($.type(templateIds)) {
			case 'string':
				templateIdsArray = [templateIds];
				break;
			case 'array':
				if (!templateIds.length) {
					throwFwError(ERR_CODE_TEMPLATE_INVALID_ID);
				}
				templateIdsArray = templateIds;
				break;
			default:
				throwFwError(ERR_CODE_TEMPLATE_INVALID_ID);
			}

			for (var i = 0, len = templateIdsArray.length; i < len; i++) {
				var id = templateIdsArray[i];
				if (!isString(id) || !$.trim(id)) {
					throwFwError(ERR_CODE_TEMPLATE_INVALID_ID);
				}
				/* del begin */
				if (!this.__cachedTemplates[id]) {
					fwLogger.warn(FW_LOG_TEMPLATE_NOT_REGISTERED, id);
				}
				/* del end */
			}

			for (var i = 0, len = templateIdsArray.length; i < len; i++) {
				delete this.__cachedTemplates[templateIdsArray[i]];
			}
		},

		/**
		 * データバインドを開始します。
		 * <p>
		 * 注意:<br>
		 * このメソッドではバインド対象にコメントビューを指定できません。<br>
		 * コメントビューを使用したデータバインドは、コントローラが持つViewインスタンス(<a href="Controller.html#view">Controller.view</a>)から実行して下さい。
		 *
		 * @since 1.1.0
		 * @param {String|Element|Element[]|jQuery} element コメントビュー疑似セレクタ、またはDOM要素(セレクタ文字列, DOM要素,
		 *            DOM要素の配列, jQueryオブジェクト)。 DOM要素の配列を指定する場合、全ての要素ノードの親ノードが同じでなければいけません。
		 * @param {Object} context データコンテキストオブジェクト
		 * @memberOf View
		 * @name bind
		 * @function
		 * @returns {Binding}
		 */
		bind: function(element, context) {
			var targetNodes = null;

			if (element == null) {
				throwFwError(ERR_CODE_BIND_INVALID_TARGET);
			}

			// targetのチェック
			if (isArray(element)) {
				//配列はDOMノードの配列であることを仮定
				targetNodes = element;
			} else {
				//targetがDOM、セレクタ文字列の場合をまとめて扱う
				//インラインテンプレートが指定された場合はコントローラ側のview.bindが予めノード化しているので
				//ここに到達した時にはノードになっている
				var $element = $(element);

				if ($element.length === 0) {
					// 要素がない、もしくは見つからない場合はエラー
					throwFwError(ERR_CODE_BIND_INVALID_TARGET);
				}

				//bind()はルートノードが複数であることをサポートするので、lengthは1には限定しない
				//ただし、これはappend, prepend等の動作を考慮したものである。
				//つまり、全ての要素は同じノードを親として持っていることを前提としている。
				//厳密にはチェックすべきだが、実際に問題になることはほとんどないだろうと考え行っていない。
				targetNodes = $element.toArray();
			}

			// contextのチェック
			if (context == null || typeof context !== 'object' || isArray(context)
					|| h5.core.data.isObservableArray(context)) {
				throwFwError(ERR_CODE_BIND_CONTEXT_INVALID);
			}

			return h5internal.view.createBinding(targetNodes, context);
		}
	});

	var view = new View();

	/**
	 * <a href="./View.html">View</a>クラスのインスタンスを生成します。
	 * <p>
	 * この関数はh5.core.viewに公開されたViewインスタンスのみが持ちます。この関数で作られたViewインスタンスはcreateView()を持ちません。
	 * </p>
	 *
	 * @name createView
	 * @memberOf h5.core.view
	 * @function
	 */
	view.createView = function() {
		return new View();
	};

	/**
	 * HTMLに記述されたテンプレートを読み込む
	 * <p>
	 * HTMLにあるテンプレートが構文エラーの場合は、例外をそのままスローする。
	 */
	$(function() {
		$('script[type="text/ejs"]').each(function() {
			var templateId = $.trim(this.id);
			var templateText = $.trim(this.innerHTML);

			if (templateText.length === 0 || !templateId) {
				return;
			}

			var compiledTemplate = new EJS.Compiler(templateText, DELIMITER);
			compiledTemplate.compile();
			view.__cachedTemplates[templateId] = compiledTemplate.process;
		});
	});

	// =============================
	// Expose to window
	// =============================

	/**
	 * <p>
	 * グローバルに公開されているViewクラスのインスタンスです。
	 * </p>
	 * <p>
	 * h5.core.viewは、<a href="View.html">View</a>クラスであり、<a href="View.html">View</a>クラスのメソッドを持ちます。<br>
	 * ただし、h5.core.viewはViewクラスを生成するためのcreateViewメソッドを持ち、生成されたViewクラスはcreateViewメソッドを持ちません。
	 * </p>
	 *
	 * @name view
	 * @memberOf h5.core
	 * @see View
	 * @namespace
	 */
	h5.u.obj.expose('h5.core', {
		view: view
	});
})();
