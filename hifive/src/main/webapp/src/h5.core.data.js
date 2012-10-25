/*
 * Copyright (C) 2012 NS Solutions Corporation
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

/* ------ h5.core.data ------ */
(function() {
	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	//=============================
	// Production
	//=============================


	/**
	 * <a href="#createSequence">createSequence()</a>で使用するための、型指定定数。
	 * <p>
	 * 文字列型を表します。
	 * </p>
	 *
	 * @memberOf h5.core.data
	 * @type {Integer}
	 */
	var SEQUENCE_RETURN_TYPE_STRING = 1;

	/**
	 * <a href="#createSequence">createSequence()</a>で使用するための、型指定定数
	 * <p>
	 * 数値型を表します。
	 * </p>
	 *
	 * @memberOf h5.core.data
	 * @type {Integer}
	 */
	var SEQUENCE_RETURN_TYPE_INT = 2;

	var ID_TYPE_STRING = 'string';
	var ID_TYPE_INT = 'number';


	/** マネージャ名が不正 */
	var ERR_CODE_INVALID_MANAGER_NAME = 15000;

	/** DataItemのsetterに渡された値、またはcreateで渡された値がDescriptorで指定された型・制約に違反している */
	var ERR_CODE_INVALID_ITEM_VALUE = 15001;

	/** dependが設定されたプロパティのセッターを呼び出した */
	var ERR_CODE_DEPEND_PROPERTY = 15002;

	/** イベントのターゲットが指定されていない */
	var ERR_CODE_NO_EVENT_TARGET = 15003;

	/** ディスプリプタが不正 */
	var ERR_CODE_INVALID_DESCRIPTOR = 15004;

	/** createDataModelManagerのnamespaceが不正 */
	var ERR_CODE_INVALID_MANAGER_NAMESPACE = 15005;

	/** データモデル名が不正 */
	var ERR_CODE_INVALID_DATAMODEL_NAME = 15006;

	/** createItemでIDが必要なのに指定されていない */
	var ERR_CODE_NO_ID = 15007;

	/** マネージャの登録先に指定されたnamespaceにはすでにその名前のプロパティが存在する */
	var ERR_CODE_REGISTER_TARGET_ALREADY_EXIST = 15008;

	/** 内部エラー：更新ログタイプ不正（通常起こらないはず） */
	var ERR_CODE_INVALID_UPDATE_LOG_TYPE = 15009;

	/** IDは文字列でなければならない */
	var ERR_CODE_ID_MUST_BE_STRING = 15010;

	/** typeが配列に指定されているプロパティには別のインスタンスを代入できない（空にしたい場合はclear()メソッド、別の配列と同じ状態にしたい場合はcopyFrom()を使う） */
	var ERR_CODE_CANNOT_SET_OBSARRAY = 15011;

	/** DataItem.set()でidをセットすることはできない */
	var ERR_CODE_CANNOT_SET_ID = 15012;

	/** depend.calcが制約を満たさない値を返している */
	var ERR_CODE_CALC_RETURNED_INVALID_VALUE = 15013;

	/** createModelに渡された配列内のディスクリプタ同士でtypeやbaseによる依存関係が循環参照している */
	var ERR_CODE_DESCRIPTOR_CIRCULAR_REF = 15014;

	/** DataModelに属していないDataItem、またはDataManagerに属していないDataModelのDataItemは変更できない */
	var ERR_CODE_CANNOT_CHANGE_REMOVED_ITEM = 15015;

	/** DataManagerに属していないDataModelで、create/remove/変更できない */
	var ERR_CODE_CANNOT_CHANGE_DROPPED_MODEL = 15016;

	/** schemaに定義されていないプロパティにセットしようとした */
	var ERR_CODE_CANNOT_SET_NOT_DEFINED_PROPERTY = 15017;

	var ERROR_MESSAGES = [];
	ERROR_MESSAGES[ERR_CODE_INVALID_MANAGER_NAME] = 'マネージャ名が不正';
	ERROR_MESSAGES[ERR_CODE_INVALID_ITEM_VALUE] = 'DataItemのsetterに渡された値がDescriptorで指定された型・制約に違反しています。 違反したプロパティ={0}';
	ERROR_MESSAGES[ERR_CODE_DEPEND_PROPERTY] = 'dependが設定されたプロパティに値をセットすることはできません。違反したプロパティ={0}';
	ERROR_MESSAGES[ERR_CODE_NO_EVENT_TARGET] = 'イベントのターゲットが指定されていない';
	ERROR_MESSAGES[ERR_CODE_INVALID_MANAGER_NAMESPACE] = 'createDataModelManagerのnamespaceが不正';
	ERROR_MESSAGES[ERR_CODE_INVALID_DATAMODEL_NAME] = 'データモデル名が不正';
	ERROR_MESSAGES[ERR_CODE_NO_ID] = 'createItemでIDが必要なのに指定されていない';
	ERROR_MESSAGES[ERR_CODE_REGISTER_TARGET_ALREADY_EXIST] = 'マネージャの登録先に指定されたnamespaceにはすでにその名前のプロパティが存在する';
	ERROR_MESSAGES[ERR_CODE_INVALID_UPDATE_LOG_TYPE] = '内部エラー：更新ログタイプ不正';
	ERROR_MESSAGES[ERR_CODE_ID_MUST_BE_STRING] = 'IDは文字列でなければならない';
	ERROR_MESSAGES[ERR_CODE_INVALID_DESCRIPTOR] = 'データモデルディスクリプタにエラーがあります。';
	ERROR_MESSAGES[ERR_CODE_CANNOT_SET_OBSARRAY] = 'typeが配列に指定されているプロパティには別のインスタンスを代入できない（空にしたい場合はclear()メソッド、別の配列と同じ状態にしたい場合はcopyFrom()を使う）。 プロパティ名 = {0}';
	ERROR_MESSAGES[ERR_CODE_CANNOT_SET_ID] = 'DataItem.set()でidをセットすることはできない';
	ERROR_MESSAGES[ERR_CODE_CALC_RETURNED_INVALID_VALUE] = 'depend.calcが返した値がプロパティの型・制約に違反しています。違反したプロパティ={0}, 違反した値={1}';
	ERROR_MESSAGES[ERR_CODE_DESCRIPTOR_CIRCULAR_REF] = 'Datamaneger.createModelに渡された配列内のディスクリプタについて、baseやtypeによる依存関係が循環参照しています。';
	ERROR_MESSAGES[ERR_CODE_CANNOT_CHANGE_REMOVED_ITEM] = 'DataModelに属していないDataItem、またはDataManagerに属していないDataModelのDataItemの中身は変更できません。データアイテムID={0}, メソッド={1}';
	ERROR_MESSAGES[ERR_CODE_CANNOT_CHANGE_DROPPED_MODEL] = 'DataManagerに属していないDataModelの中身は変更できません。モデル名={0}, メソッド={1}';
	ERROR_MESSAGES[ERR_CODE_CANNOT_SET_NOT_DEFINED_PROPERTY] = 'スキーマに定義されていないプロパティに値をセットすることはできません。モデル"{0}"のスキーマに"{1}"は定義されていません。';

	//	ERROR_MESSAGES[] = '';
	addFwErrorCodeMap(ERROR_MESSAGES);


	// ---------------------------
	//ディスクリプタのエラーコード
	// ---------------------------
	/**
	 * ディスクリプタがオブジェクトでない
	 */
	var DESCRIPTOR_ERR_CODE_NOT_OBJECT = 1;

	/**
	 * nameが正しく設定されていない
	 */
	var DESCRIPTOR_ERR_CODE_INVALID_NAME = 2;


	/**
	 * baseの指定が不正
	 */
	var DESCRIPTOR_ERR_CODE_INVALID_BASE = 3;

	/**
	 * baseに指定されたデータモデルが存在しない
	 */
	var DESCRIPTOR_ERR_CODE_NO_EXIST_BASE = 4;

	/**
	 * schemaもbaseも指定されていない
	 */
	var DESCRIPTOR_ERR_CODE_NO_SCHEMA = 5;

	/**
	 * schemaがオブジェクトでない
	 */
	var DESCRIPTOR_SCHEMA_ERR_CODE_NOT_OBJECT = 6;

	/**
	 * ディスクリプタのエラーメッセージ
	 */
	var DESCRIPTOR_VALIDATION_ERROR_MSGS = [];
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_ERR_CODE_NOT_OBJECT] = 'DataModelのディスクリプタにはオブジェクトを指定してください';
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_ERR_CODE_INVALID_NAME] = 'データモデル名が不正です。使用できる文字は、半角英数字、_、$、のみで、先頭は数字以外である必要があります。';
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_ERR_CODE_INVALID_BASE] = 'baseの指定が不正です。指定する場合は、継承したいデータモデル名の先頭に"@"を付けた文字列を指定してください。';
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_ERR_CODE_NO_EXIST_BASE] = 'baseの指定が不正です。指定されたデータモデル{0}は存在しません。';
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_ERR_CODE_NO_SCHEMA] = 'schemaの指定が不正です。baseの指定がない場合はschemaの指定は必須です';
	DESCRIPTOR_VALIDATION_ERROR_MSGS[DESCRIPTOR_SCHEMA_ERR_CODE_NOT_OBJECT] = 'schemaの指定が不正です。schemaはオブジェクトで指定してください。';


	var EVENT_ITEMS_CHANGE = 'itemsChange';


	var PROP_CONSTRAINT_REQUIRED = 'required';


	var UPDATE_LOG_TYPE_CREATE = 1;
	var UPDATE_LOG_TYPE_CHANGE = 2;
	var UPDATE_LOG_TYPE_REMOVE = 3;



	//=============================
	// Development Only
	//=============================

	var fwLogger = h5.log.createLogger('h5.core.data');

	/* del begin */

	var MSG_ERROR_DUP_REGISTER = '同じ名前のデータモデルを登録しようとしました。同名のデータモデルの2度目以降の登録は無視されます。マネージャ名は {0}, 登録しようとしたデータモデル名は {1} です。';

	/* del end */


	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	var argsToArray = h5.u.obj.argsToArray;


	// =========================================================================
	//
	// Privates
	//
	// =========================================================================
	//=============================
	// Variables
	//=============================
	//=============================
	// Functions
	//=============================
	function createDataModelItemsChangeEvent(created, recreated, removed, changed) {
		return {
			type: EVENT_ITEMS_CHANGE,
			created: created,
			recreated: recreated,
			removed: removed,
			changed: changed
		};
	}

	//========================================================
	//
	// バリデーション関係コードここから
	//
	//========================================================

	/**
	 * データモデルのディスクリプタとして正しいオブジェクトかどうかチェックする。 schema以外をチェックしたあと、validateSchemaを呼び出して結果をマージして返す。
	 *
	 * @private
	 * @param {Object} descriptor オブジェクト
	 * @param {Object} DataManagerオブジェクト
	 * @param {Boolean} stopOnErro エラーが発生した時に、即座にreturnするかどうか
	 * @returns {Array} schemaのチェック結果。validateSchemaの戻り値をそのまま返す
	 */
	function validateDescriptor(descriptor, manager, stopOnError) {
		var errorReason = [];
		// descriptorがオブジェクトかどうか
		if (!$.isPlainObject(descriptor)) {
			// descriptorがオブジェクトじゃなかったら、これ以上チェックしようがないので、stopOnErrorの値に関わらずreturnする
			errorReason.push(createErrorReason(DESCRIPTOR_ERR_CODE_NOT_OBJECT));
			return errorReason;
		}

		// nameのチェック
		if (!isValidNamespaceIdentifier(descriptor.name)) {
			// 識別子として不適切な文字列が指定されていたらエラー
			errorReason.push(DESCRIPTOR_ERR_CODE_INVALID_NAME);
			if (stopOnError) {
				return errorReason;
			}
		}

		// baseのチェック
		var base = descriptor.base;
		var baseSchema = null;
		if (base != null) {
			// nullまたはundefinedならチェックしない
			if (!isString(base) || base.indexOf('@') !== 0) {
				// @で始まる文字列（base.indexOf('@')が0）でないならエラー
				errorReason.push(createErrorReason(DESCRIPTOR_ERR_CODE_INVALID_BASE));
				if (stopOnError) {
					return errorReason;
				}
			} else {
				var baseName = base.substring(1);
				var baseModel = manager.models[baseName];
				if (!baseModel) {
					// 指定されたモデルが存在しないならエラー
					errorReason
							.push(createErrorReason(DESCRIPTOR_ERR_CODE_NO_EXIST_BASE, baseName));
					if (stopOnError) {
						return errorReason;
					}
				} else {
					baseSchema = manager.models[baseName].schema;
				}
			}
		}

		// schemaのチェック
		// baseSchemaがないのに、schemaが指定されていなかったらエラー
		var schema = descriptor.schema;
		if (!baseSchema && schema == null) {
			errorReason.push(createErrorReason(DESCRIPTOR_ERR_CODE_NO_SCHEMA));
			if (stopOnError) {
				return errorReason;
			}
		}

		// schemaが指定されていて、オブジェクトでないならエラー
		if (!baseSchema && !$.isPlainObject(schema)) {
			errorReason.push(createErrorReason(DESCRIPTOR_SCHEMA_ERR_CODE_NOT_OBJECT));
			// schemaがオブジェクトでなかったら、schemaのチェックのしようがないので、stopOnErrorの値に関わらずreturnする
			return errorReason;
		}

		// base指定されていた場合は、後勝ちでextendする
		schema = $.extend(baseSchema, schema);

		// errorReasonにschemaのチェック結果を追加して返す
		return errorReason.concat(validateSchema(schema, manager, stopOnError));
	}

	//========================================================
	//
	// バリデーション関係コードここまで
	//
	//========================================================



	function isTypeArray(typeStr) {
		if (!typeStr) {
			return false;
		}
		return typeStr.indexOf('[]') !== -1;
	}

	function getValue(item, prop) {
		return item._values[prop];
	}

	function setValue(item, prop, value) {
		item._values[prop] = value;
	}


	function itemSetter(model, item, valueObj, noValidationProps, ignoreProps, isCreate) {
		// valueObjから整合性チェックに通ったものを整形して格納する配列
		var readyProps = [];

		//先に、すべてのプロパティの整合性チェックを行う
		for ( var prop in valueObj) {
			if (!(prop in model.schema)) {
				// schemaに定義されていないプロパティ名が入っていたらエラー
				throwFwError(ERR_CODE_CANNOT_SET_NOT_DEFINED_PROPERTY, [model.name, prop]);
			}
			if (ignoreProps && ($.inArray(prop, ignoreProps) !== -1)) {
				//無視すべきプロパティはエラーにする
				continue;
			}

			// depend指定されている項目はset禁止
			if (model.schema[prop] && model.schema[prop].depend) {
				throwFwError(ERR_CODE_DEPEND_PROPERTY, prop);
			}

			var oldValue = getValue(item, prop);
			var newValue = valueObj[prop];

			var type = model.schema[prop] && model.schema[prop].type;
			// typeがstring,number,integer,boolean、またはその配列なら、値がラッパークラスの場合にunboxする
			if (type && type.match(/string|number|integer|boolean/)) {
				newValue = unbox(newValue);
			}

			//このプロパティをバリデーションしなくてよいと明示されているならバリデーションを行わない
			//型が配列（type:[]）の場合に、フラグが立っていたら、値がnull/undefinedでもよいとする
			if ($.inArray(prop, noValidationProps) === -1) {
				//型・制約チェック
				//配列が渡された場合、その配列の要素が制約を満たすかをチェックしている
				var validateResult = model._validateItemValue(prop, newValue);
				if (validateResult.length > 0) {
					throwFwError(ERR_CODE_INVALID_ITEM_VALUE, prop, validateResult);
				}
			}

			//値がnull以外なら中身の型変換行う
			//typeがnumber,integerで、newValueが文字列(もしくは配列)なら型変換を行う
			//型のチェックは終わっているので、typeがnumber・integerならnewValueは数値・数値変換可能文字列・null またはそれらを要素に持つ配列のいずれかである
			if (newValue != null && type && type.match(/number|integer/)
					&& typeof newValue !== 'number') {
				if ($.isArray(newValue) || h5.u.obj.isObservableArray(newValue)) {
					for ( var i = 0, l = newValue.length; i < l; i++) {
						// スパースな配列の場合、undefinedが入っている可能性があるので、!= で比較
						// parseFloatできる値(isNumberValueに渡してtrueになる値)ならparseFloatする
						if (newValue[i] != null && isNumberValue(newValue[i])) {
							newValue[i] = parseFloat(newValue[i]);
						}
					}
				} else if (newValue != null) {
					newValue = parseFloat(newValue);
				}
			}

			// 配列なら、配列の中身も変更されていないかチェックする(type:anyならチェックしない)
			// type:[]の場合、oldValueは必ずObsArrayまたはundefined。
			// newValue,oldValueともに配列(oldValueの場合はObsArray)かつ、長さが同じ場合にのみチェックする
			if (isTypeArray(type) && oldValue && oldValue.equals(newValue, oldValue)) {
				continue;
			}

			// 値の型変更を行った後に、値が変更されていないかチェックする
			if (oldValue === newValue) {
				//同じ値がセットされた場合は何もしない
				continue;
			}

			// ObservableArrayの場合、oldValueはスナップしたただの配列にする
			// ただし、typeが未指定またはanyにObservableArrayが入っていた場合はそのまま
			if (type && type.indexOf('[]') !== -1 && h5.u.obj.isObservableArray(oldValue)) {
				//TODO sliceを何度もしないようにする
				oldValue = oldValue.slice(0);
			}

			//ここでpushしたプロパティのみ、後段で値をセットする
			readyProps.push({
				p: prop,
				o: oldValue,
				n: newValue
			});
		}
		//更新する値のない場合は何も返さないで終了
		if (!readyProps.length) {
			return;
		}

		var changedProps = {};
		var changedPropNameArray = [];

		//値の変更が起こる全てのプロパティについて整合性チェックが通ったら、実際に値を代入する
		for ( var i = 0, len = readyProps.length; i < len; i++) {
			var readyProp = readyProps[i];

			//TODO 判定文改良
			if (model.schema[readyProp.p] && isTypeArray(model.schema[readyProp.p].type)) {
				//配列の場合は値のコピーを行う。ただし、コピー元がnullの場合があり得る（create()でdefaultValueがnull）ので
				//その場合はコピーしない
				if (readyProp.n) {
					getValue(item, readyProp.p).copyFrom(readyProp.n);
				}
			} else {
				//新しい値を代入
				setValue(item, readyProp.p, readyProp.n);
			}

			// newValueにはgetして持ってきた値（type:[]ならnewValueはObservableArrayになるようにする）
			changedProps[readyProp.p] = {
				oldValue: readyProp.o,
				newValue: item.get(readyProp.p)
			};

			changedPropNameArray.push(readyProp.p);
		}

		//最初にアイテムを生成した時だけ、depend.calcに渡すイベントのtypeはcreateにする
		var eventType = isCreate === true ? 'create' : 'change';

		//今回変更されたプロパティと依存プロパティを含めてイベント送出
		var event = {
			type: eventType,
			target: item,
			props: changedProps
		};

		//依存プロパティを再計算する
		var changedDependProps = calcDependencies(model, item, event, changedPropNameArray,
				isCreate);

		//依存プロパティの変更をchangeイベントに含める
		$.extend(changedProps, changedDependProps);

		return event;
	}

	/**
	 * 依存プロパティの再計算を行います。再計算後の値はitemの各依存プロパティに代入されます。
	 *
	 * @param {DataModel} model データモデル
	 * @param {DataItem} item データアイテム
	 * @param {Object} event プロパティ変更イベント
	 * @param {String|String[]} changedProps 今回変更されたプロパティ
	 * @param {Boolean} isCreate create時に呼ばれたものかどうか。createなら値の変更を見ずに無条件でcalcを実行する
	 * @returns {Object} { dependProp1: { oldValue, newValue }, ... } という構造のオブジェクト
	 */
	function calcDependencies(model, item, event, changedProps, isCreate) {
		// 今回の変更に依存する、未計算のプロパティ
		var targets = [];

		var dependsMap = model._dependencyMap;

		/**
		 * この依存プロパティが計算可能（依存するすべてのプロパティの再計算が完了している）かどうかを返します。
		 * 依存しているプロパティが依存プロパティでない場合は常にtrue(計算済み)を返します
		 * 依存しているプロパティが依存プロパティが今回の変更されたプロパティに依存していないならtrue(計算済み)を返します
		 */
		function isReady(dependProp) {
			var deps = wrapInArray(model.schema[dependProp].depend.on);
			for ( var i = 0, len = deps.length; i < len; i++) {
				if ($.inArray(deps[i], model._realProperty) === -1
						&& $.inArray(deps[i], targets) !== -1) {
					// 依存先が実プロパティでなく、未計算のプロパティであればfalseを返す
					return false;
				}
			}
			return true;
		}

		/**
		 * changedPropsで指定されたプロパティに依存するプロパティをtargetArrayに追加する
		 */
		function addDependencies(targetArray, srcProps) {
			for ( var i = 0, len = srcProps.length; i < len; i++) {
				var depends = dependsMap[srcProps[i]];

				if (!depends) {
					continue;
				}

				for ( var j = 0, jlen = depends.length; j < jlen; j++) {
					var dprop = depends[j];
					if ($.inArray(dprop, targetArray) === -1) {
						targetArray.push(dprop);
					}
				}
			}
		}

		var ret = {};

		if (isCreate) {
			// createならすべての実プロパティに依存するプロパティを列挙する
			// create時にundefinedがセットされた場合、変更なしなのでchangedPropsに入らないが、calcは計算させる
			targets = model._dependProps.slice();
		} else {
			//今回変更された実プロパティに依存するプロパティを列挙
			addDependencies(targets, wrapInArray(changedProps));
		}

		while (targets.length !== 0) {
			var restTargets = [];

			//各依存プロパティについて、計算可能（依存するすべてのプロパティが計算済み）なら計算する
			for ( var i = 0, len = targets.length; i < len; i++) {
				var dp = targets[i];

				if (isReady(dp)) {
					var newValue = model.schema[dp].depend.calc.call(item, event);

					// 型変換を行わない厳密チェックで、戻り値をチェックする
					var errReason = model._itemValueCheckFuncs[dp](newValue, true);
					if (errReason.length !== 0) {
						// calcの返した値が型・制約違反ならエラー
						throwFwError(ERR_CODE_CALC_RETURNED_INVALID_VALUE, [dp, newValue]);
					}
					ret[dp] = {
						oldValue: getValue(item, dp),
						newValue: newValue
					};

					setValue(item, dp, newValue);
				} else {
					restTargets.push(dp);
				}
			}

			//今回計算対象となったプロパティに（再帰的に）依存するプロパティをrestに追加
			//restTargetsは「今回計算できなかったプロパティ＋新たに依存関係が発見されたプロパティ」が含まれる
			addDependencies(restTargets, targets);

			targets = restTargets;
		}

		return ret;
	}

	/**
	 * propで指定されたプロパティのプロパティソースを作成します。
	 *
	 * @private
	 */
	function createDataItemConstructor(model, descriptor) {
		//model.schemaは継承関係を展開した後のスキーマ
		var schema = model.schema;

		function setObservableArrayListeners(model, item, propName, observableArray) {
			//TODO 現状だとインスタンスごとにfunctionを作っているが、
			//DataItem&&property名ごとに作るようにして数を減らしたい(DataItemのprototypeとして持たせればよい？)

			// 配列操作前と操作後で使う共通の変数
			// 配列操作が同期のため、必ずobserveBeforeListener→配列操作→observeListenerになるので、ここのクロージャ変数を両関数で共通して使用できる

			// アップデートセッション中かどうか
			var isAlreadyInUpdate = false;

			// 破壊的メソッドだが、追加しないメソッド。validateする必要がない。
			var noAddMethods = ['sort', 'reverse', 'pop'];

			function observeBeforeListener(event) {
				// 追加も削除もソートもしないメソッド(非破壊的メソッド)なら何もしない
				if (!event.isDestructive) {
					return;
				}

				// itemがmodelに属していない又は、itemが属しているmodelがmanagerに属していないならエラー
				if (item._model !== model || !model._manager) {
					throwFwError(ERR_CODE_CANNOT_CHANGE_REMOVED_ITEM, [item._values[model.idKey],
							event.method]);
				}

				var args = argsToArray(event.args);

				var checkFlag = $.inArray(event.method, noAddMethods) === -1;

				if (event.method === 'splice') {
					if (args.length <= 2) {
						// spliceに引数が2つなら要素追加はないので、validateチェックはしない
						checkFlag = false;
					}
					checkFlag = false;
					args.shift();
					args.shift();
				}

				if (checkFlag) {
					var validateResult = model._validateItemValue(propName, args);
					if (validateResult.length > 0) {
						throwFwError(ERR_CODE_INVALID_ITEM_VALUE, propName, validateResult);
					}
				}

				// oldValueが登録されていなければ登録
				addObsArrayOldValue(model, item, propName);

				// 配列操作前にbeginUpdateして、配列操作後にendUpdateする
				isAlreadyInUpdate = model._manager ? model._manager.isInUpdate() : false;
				if (!isAlreadyInUpdate) {
					model._manager.beginUpdate();
				}
			}

			function observeListener(event) {
				// 追加も削除もソートもしないメソッド(非破壊的メソッド)なら何もしない
				if (!event.isDestructive) {
					return;
				}

				// 配列の値が変化していたらitemのイベントを上げる
				// は、endUpdateのなかでやる

				//				// isAlreadyInUpdateでないならsnapShotと比較して、同じならreturn
				//				if (!isAlreadyInUpdate && (observableArray.length === snapArray.length)) {
				//					for ( var i = 0, l = observableArray.length; i < l; i++) {
				//						if (observableArray[i] !== snapArray[i]) {
				//							break;
				//						}
				//					}
				//					if (i === l) {
				//						// 中身が全て同じなら何もしない
				//						return;
				//					}
				//				}


				// changeイベントオブジェクトの作成
				var ev = {
					type: 'change',
					target: item,
					props: {}
				};

				// newValueは現在の値、oldValueはmanager._oldValueLogsの中なので、ここでpropsを入れる必要ない
				ev.props[propName] = {};

				addUpdateChangeLog(model, ev);
				// アップデートセッション中じゃなければendUpdate()
				if (!isAlreadyInUpdate) {
					model._manager.endUpdate();
				}
			}

			observableArray.addEventListener('observeBefore', observeBeforeListener);
			observableArray.addEventListener('observe', observeListener);
		}

		/**
		 * データアイテムクラス
		 * <p>
		 * データアイテムは<a href="DataModel.html#create">DataModel#create()</a>で作成します。
		 * </p>
		 * <p>
		 * このクラスは<a href="EventDispatcher.html">EventDispatcherクラス</a>のメソッドを持ちます。イベント関連のメソッドについては<a
		 * href="EventDispatcher.html">EventDispatcherクラス</a>を参照してください。<br>
		 * データアイテムは、アイテムが持つ値に変更があった場合に'change'イベントが発火します。
		 * </p>
		 *
		 * @class
		 * @constructor
		 * @name DataItem
		 * @param {Object} userInitialValue ユーザー指定の初期値
		 */
		function DataItem(userInitialValue) {
			/**
			 * データアイテムが属しているデータモデル
			 *
			 * @private
			 * @memberOf DataItem
			 */
			this._model = model;

			// このアイテムが持つ値を格納するオブジェクト
			this._values = {};

			var actualInitialValue = {};

			var noValidationProps = [];

			//TODO モデルに持たせる
			var arrayProps = [];

			// userInitailValueの中に、schemaで定義されていないプロパティへの値のセットが含まれていたらエラー
			for ( var p in userInitialValue) {
				if (!schema.hasOwnProperty(p)) {
					throwFwError(ERR_CODE_CANNOT_SET_NOT_DEFINED_PROPERTY, [model.name, p]);
				}
			}

			//デフォルト値を代入する
			for ( var plainProp in schema) {
				var propDesc = schema[plainProp];

				if (propDesc && propDesc.depend) {
					//依存プロパティにはデフォルト値はない（最後にrefresh()で計算される）
					if (plainProp in userInitialValue) {
						// 依存プロパティが与えられていた場合はエラー
						throwFwError(ERR_CODE_DEPEND_PROPERTY, plainProp);
					}
					continue;
				}

				if (propDesc && isTypeArray(propDesc.type)) {
					//配列の場合は最初にObservableArrayのインスタンスを入れる
					var obsArray = h5.u.obj.createObservableArray(); //TODO cache
					setValue(this, plainProp, obsArray);
					arrayProps.push(plainProp);
				}

				var initValue = null;

				if (plainProp in userInitialValue) {
					//create時に初期値が与えられていた場合

					// depend指定プロパティにはdefaultValueを指定できないが、validateSchemaでチェック済みなので
					// ここでチェックは行わない

					// 与えられた初期値を代入
					initValue = userInitialValue[plainProp];
				} else if (propDesc && propDesc.defaultValue !== undefined) {
					//DescriptorのdefaultValueがあれば代入
					initValue = propDesc.defaultValue;

					//TODO else節と共通化
					if (propDesc && isTypeArray(propDesc.type)) {
						//type:[]の場合、、defaultValueは事前に制約チェック済みなので改めてvalidationしなくてよい
						noValidationProps.push(plainProp);
					}
				} else {
					//どちらでもない場合はnull
					//ただし、notNull制約などがついている場合はセッターで例外が発生する
					initValue = null;

					if (propDesc && isTypeArray(propDesc.type)) {
						//type:[]で、userInitValueもdefaultValueも与えられなかった場合はvalidationを行わない
						noValidationProps.push(plainProp);
					}
				}

				actualInitialValue[plainProp] = initValue;
			}

			itemSetter(model, this, actualInitialValue, noValidationProps, null, true);

			for ( var i = 0, l = arrayProps.length; i < l; i++) {
				setObservableArrayListeners(model, this, arrayProps[i], this.get(arrayProps[i]));
			}
		}
		$.extend(DataItem.prototype, EventDispatcher.prototype, {
			/**
			 * 指定されたキーのプロパティの値を取得します。
			 * <p>
			 * 引数にプロパティ名を指定すると、アイテムが持つそのプロパティの値を返します。
			 * </p>
			 * <p>
			 * 引数の指定がない場合は、{id: '001', value: 'hoge'} のような、そのデータアイテムが持つ値を格納したオブジェクトを返します。
			 * </p>
			 *
			 * @memberOf DataItem
			 * @param {String} [key] プロパティキー。指定のない場合は、アイテムの持つプロパティ名をキーに、そのプロパティの値を持つオブジェクトを返します。
			 * @returns Any 指定されたプロパティの値。引数なしの場合はプロパティキーと値を持つオブジェクト。
			 */
			get: function(key) {
				if (arguments.length === 0) {
					return $.extend({}, this._values);
				}
				return getValue(this, key);
			},

			/**
			 * 指定されたキーのプロパティに値をセットします。
			 * <p>
			 * 複数のプロパティに対して値を一度にセットしたい場合は、{ キー1: 値1, キー2: 値2, ... }という構造をもつオブジェクトを1つだけ渡してください。
			 * </p>
			 * <p>
			 * 1つのプロパティに対して値をセットする場合は、 item.set(key, value); のように2つの引数でキーと値を個別に渡すこともできます。
			 * </p>
			 * <p>
			 * このメソッドを呼ぶと、再計算が必要と判断された依存プロパティは自動的に再計算されます。
			 * 再計算によるパフォーマンス劣化を最小限にするには、1つのアイテムへのset()の呼び出しはできるだけ少なくする
			 * （引数をオブジェクト形式にして一度に複数のプロパティをセットし、呼び出し回数を最小限にする）ようにしてください。
			 * </p>
			 *
			 * @memberOf DataItem
			 * @param {Any} var_args 複数のキー・値のペアからなるオブジェクト、または1組の(キー, 値)を2つの引数で取ります。
			 */
			set: function(var_args) {
				// アイテムがモデルに属していない又は、アイテムが属しているモデルがマネージャに属していないならエラー
				if (this._model !== model || !this._model._manager) {
					throwFwError(ERR_CODE_CANNOT_CHANGE_REMOVED_ITEM, [this._values[model.idKey],
							'set'], this);
				}
				//引数はオブジェクト1つ、または(key, value)で呼び出せる
				var valueObj = var_args;
				if (arguments.length === 2) {
					valueObj = {};
					valueObj[arguments[0]] = arguments[1];
				}

				if (model.idKey in valueObj) {
					//IDの上書きは禁止
					throwFwError(ERR_CODE_CANNOT_SET_ID, null, this);
				}

				// updateセッション中かどうか。updateセッション中ならこのsetの中ではbeginUpdateもendUpdateしない
				// updateセッション中でなければ、begin-endで囲って、最後にイベントが発火するようにする
				// このbegin-endの間にObsArrayでイベントが上がっても(内部でcopyFromを使ったりなど)、itemにイベントは上がらない
				var isAlreadyInUpdate = model._manager ? model._manager.isInUpdate() : false;
				if (!isAlreadyInUpdate) {
					model._manager.beginUpdate();
				}

				var event = itemSetter(model, this, valueObj, null);

				if (event) {
					// 更新した値があればChangeLogを追記
					addUpdateChangeLog(model, event);
				}
				// endUpdateを呼んでイベントを発火
				if (!isAlreadyInUpdate) {
					model._manager.endUpdate();
				}
			},

			/**
			 * DataItemが属しているDataModelインスタンスを返します。
			 * <p>
			 * DataModelに属していないDataItem(removeされたDataItem)から呼ばれた場合はnullを返します。
			 * </p>
			 *
			 * @memberOf DataItem
			 * @returns DataModel
			 */
			getModel: function() {
				return this._model;
			}
		});
		return DataItem;
	}


	/**
	 * 指定されたIDのデータアイテムを生成します。
	 *
	 * @param {DataModel} model データモデル
	 * @param {Object} data 初期値
	 * @param {Function} itemChangeListener modelに対応する、データアイテムチェンジイベントリスナー
	 * @returns {DataItem} データアイテムオブジェクト
	 */
	//	function createItem(model, data, itemChangeListener) {
	//		//キーが文字列かつ空でない、かどうかのチェックはDataModel.create()で行われている
	//
	//		var id = data[model.idKey];
	//
	//		var item = new model._itemConstructor(data);
	//
	//		model.items[id] = item;
	//		model.size++;
	//
	//		item.addEventListener('change', itemChangeListener);
	//
	//		return item;
	//	}
	/**
	 * スキーマの継承関係を展開し、フラットなスキーマを生成します。 同じ名前のプロパティは「後勝ち」です。
	 *
	 * @param {Object} schema スキーマオブジェクト(このオブジェクトに展開後のスキーマが格納される)
	 * @param {Object} manager データモデルマネージャ
	 * @param {Object} desc データモデルディスクリプタ
	 */
	function extendSchema(schema, manager, desc) {
		var base = desc.base;
		var baseSchema = desc.schema;

		if (base) {
			if (!manager) {
				//baseが設定されている場合、このデータモデルがマネージャに属していなければ継承元を探せないのでエラー
				//TODO マネージャーに属さないモデルを作成できる仕様用のチェック。
				// そもそもマネージャーに属さないモデルならbase指定している時点でエラーでは...？なのでここのチェックは不要？
				throwFwError(ERR_CODE_NO_MANAGER);
			}

			// base指定がある場合はそのモデルを取得
			var baseModel = manager.models[base.slice(1)];

			// base指定されたモデルのschemaを取得
			baseSchema = baseModel.schema;
		}
		// extendした結果を返す。base指定されていない場合は渡されたdesc.schemaをシャローコピーしたもの。
		$.extend(schema, baseSchema);
	}


	/**
	 * 当該モデルに対応するアップデートログ保持オブジェクトを取得する。 オブジェクトがない場合は生成する。
	 */
	function getModelUpdateLogObj(model) {
		var manager = model._manager;
		var modelName = model.name;

		if (!manager._updateLogs) {
			manager._updateLogs = {};
		}

		if (!manager._updateLogs[modelName]) {
			manager._updateLogs[modelName] = {};
		}

		return manager._updateLogs[modelName];
	}


	/**
	 * 当該モデルが属しているマネージャにUpdateLogを追加する
	 */
	function addUpdateLog(model, type, items) {
		if (!model._manager) {
			return;
		}

		var modelLogs = getModelUpdateLogObj(model);

		for ( var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			var itemId = item._values[model.idKey];

			if (!modelLogs[itemId]) {
				modelLogs[itemId] = [];
			}
			modelLogs[itemId].push({
				type: type,
				item: item
			});
		}
	}

	/**
	 * 当該モデルが属しているマネージャにUpdateChangeLogを追加する
	 */
	function addUpdateChangeLog(model, ev) {
		if (!model._manager) {
			return;
		}

		var modelLogs = getModelUpdateLogObj(model);

		var itemId = ev.target._values[model.idKey];

		if (!modelLogs[itemId]) {
			modelLogs[itemId] = [];
		}
		modelLogs[itemId].push({
			type: UPDATE_LOG_TYPE_CHANGE,
			ev: ev
		});
	}

	/**
	 * ObsArrayのスナップショットをmanager._oldValueLogsに保存しておく アップデートセッション中に複数回変更しても、保存しておくoldValueは1つでいいので、
	 * すでに保存済みなら配列のsliceはしない。
	 */
	function addObsArrayOldValue(model, item, prop) {
		if (!model._manager) {
			return;
		}

		var modelLogs = getModelOldValueLogObj(model);

		var itemId = item._values[model.idKey];

		if (!modelLogs[itemId]) {
			modelLogs[itemId] = {};
		}

		if (!modelLogs[itemId][prop]) {
			// sliceして保存
			modelLogs[itemId][prop] = item.get(prop).slice(0);
			return;
		}

		// すでに存在していれば、oldValue保存済みなので、何もしない
		return;
	}

	/**
	 * 当該モデルに対応するアップデートログ保持オブジェクトを取得する。 オブジェクトがない場合は生成する。
	 */
	function getModelOldValueLogObj(model) {
		var manager = model._manager;
		var modelName = model.name;

		if (!manager._oldValueLogs) {
			manager._oldValueLogs = {};
		}

		if (!manager._oldValueLogs[modelName]) {
			manager._oldValueLogs[modelName] = {};
		}

		return manager._oldValueLogs[modelName];
	}

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	/**
	 * 採番を行う<a href="Sequence.html">Sequence</a>インスタンスを作成します。
	 * <p>
	 * 自動でデータアイテムのナンバリングを行いたい場合などに使用します。
	 * </p>
	 * <p>
	 * 第一引数に開始番号(デフォルト1)、第二引数にステップ数(デフォルト1)、を指定します。
	 * </p>
	 * <p>
	 * 第三引数には戻り値の型を指定します。
	 * <ul>
	 * <li><a href="#SEQUENCE_RETURN_TYPE_STRING">h5.core.data.SEQUENCE_RETURN_TYPE_STRING</a>
	 * <li><a href="#SEQUENCE_RETURN_TYPE_INT">h5.core.data.SEQUENCE_RETURN_TYPE_INT</a>
	 * </ul>
	 * のいずれかを指定し、それぞれ文字列型、数値型で返します。デフォルトは数値型です。
	 * </p>
	 *
	 * @memberOf h5.core.data
	 * @param {Number} [start=1] 開始番号
	 * @param {Number} [step=1] ステップ数
	 * @param {Integer} [returnType=2] 戻り値の型(デフォルト number)
	 */
	function createSequence(start, step, returnType) {
		// start,stepをdefault値で、returnTypeだけ指定したい場合、createSequence(null,null,returnType)で呼べるように、==nullで比較している
		var current = start != null ? start : 1;
		var theStep = step != null ? step : 1;

		function currentInt() {
			return current;
		}

		function nextInt() {
			var val = current;
			current += theStep;
			return val;
		}

		function currentString() {
			return current.toString();
		}

		function nextString() {
			var val = current;
			current += theStep;
			return val.toString();
		}

		var methods;
		if (returnType === SEQUENCE_RETURN_TYPE_STRING) {
			methods = {
				current: currentString,
				next: nextString,
				returnType: SEQUENCE_RETURN_TYPE_STRING
			};
		} else {
			methods = {
				current: currentInt,
				next: nextInt,
				returnType: SEQUENCE_RETURN_TYPE_INT
			};
		}
		methods.setCurrent = function(value) {
			current = value;
		};

		/**
		 * 採番を行うためのクラス。
		 * <p>
		 * 自動でデータアイテムのナンバリングを行いたい場合などに使用します。このクラスは<a
		 * href="h5.core.data.html#createSequence">h5.core.data.createSequence()</a>で作成します。
		 * </p>
		 *
		 * @class Sequence
		 */
		function Sequence() {}
		$.extend(Sequence.prototype, methods);

		return new Sequence();
	}




	/**
	 * データモデル。 このクラスは直接newすることはできません。
	 * <p>
	 * <a href="DataModelManager.html#createModel">DataModelManager#createModel()</a>を呼ぶと、DataModelクラスを生成して返します。
	 * </p>
	 * <p>
	 * このクラスは<a href="EventDispatcher.html">EventDispatcherクラス</a>のメソッドを持ちます。イベント関連のメソッドについては<a
	 * href="EventDispatcher.html">EventDispatcherクラス</a>を参照してください。<br>
	 * データモデルは、データモデルが管理するデータアイテムに変更があった場合に'itemsChange'イベントが発火します。
	 * </p>
	 *
	 * @class
	 * @name DataModel
	 */
	function DataModel(descriptor, manager, itemValueCheckFuncs) {
		/**
		 * データモデルが持つデータアイテムを持つオブジェクト。
		 * <p>
		 * データアイテムのidをキー、データアイテムインスタンスを値、として保持します。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @type Object
		 * @name items
		 */
		this.items = {};

		/**
		 * データモデルが持つデータアイテムの数
		 *
		 * @memberOf DataModel
		 * @type Integer
		 * @name size
		 */
		this.size = 0;

		/**
		 * データモデル名
		 *
		 * @memberOf DataModel
		 * @type String
		 * @name name
		 */
		this.name = descriptor.name;

		/**
		 * このデータモデルが属しているデータマネージャインスタンス。<br>
		 *
		 * @private
		 * @memberOf DataModel
		 * @type Object
		 * @name _manager
		 */
		this._manager = manager;

		//TODO sequence対応は後日
		//this.idSequence = 0;

		//継承元がある場合はそのプロパティディスクリプタを先にコピーする。
		//継承元と同名のプロパティを自分で定義している場合は
		//自分が持っている定義を優先するため。
		var schema = {};


		//継承を考慮してスキーマを作成
		extendSchema(schema, manager, descriptor);

		/**
		 * このデータモデルが持つスキーマのキーを格納した配列
		 * <p>
		 * スキーマが持つキーを配列で保持します。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @type Array
		 * @name schemaKeys
		 */
		this.schemaKeys = [];

		for ( var prop in schema) {
			if (schema[prop] && schema[prop].id === true) {
				//ディスクリプタは事前検証済みなので、IDフィールドは必ず存在する

				/**
				 * このデータモデルが持つアイテムのIDフィールド名。<br>
				 * <p>
				 * createModel時に自動的に設定されます。書き換えないでください。
				 * </p>
				 *
				 * @memberOf DataModel
				 * @type String
				 * @name idKey
				 */
				this.idKey = prop;
			}
			this.schemaKeys.push(prop);
		}

		//DataModelのschemaプロパティには、継承関係を展開した後のスキーマを格納する
		/**
		 * データモデルのスキーマ。
		 * <p>
		 * 継承関係を展開した後のスキーマを保持します。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @type Object
		 * @name schema
		 */
		this.schema = schema;

		var schemaIdType = schema[this.idKey].type;
		if (schemaIdType) {
			if (schemaIdType === 'string') {
				this._idType = ID_TYPE_STRING;
			} else {
				this._idType = ID_TYPE_INT;
			}
		} else {
			this._idType = ID_TYPE_STRING;
		}

		// 実プロパティと依存プロパティを列挙
		var realProps = [];
		var dependProps = [];
		for ( var p in schema) {
			if (schema[p] && schema[p].depend) {
				dependProps.push(p);
			} else {
				realProps.push(p);
			}
		}

		/**
		 * プロパティの依存関係マップ
		 *
		 * @private
		 * @type Object
		 * @memberOf DataModel
		 */
		this._dependencyMap = createDependencyMap(schema);

		/**
		 * モデルが持つ依存プロパティ
		 *
		 * @private
		 * @type Array
		 * @memberOf DataModel
		 */
		this._dependProps = dependProps;

		/**
		 * モデルが持つ実プロパティ(依存しないプロパティ)
		 *
		 * @private
		 * @type Array
		 * @memberOf DataModel
		 */
		this._realProps = realProps;

		/**
		 * プロパティの型・制約チェック関数<br>
		 * プロパティ名をキー、値としてチェック関数を持つ
		 *
		 * @private
		 * @type Object
		 * @memberOf DataModel
		 */
		this._itemValueCheckFuncs = itemValueCheckFuncs;

		/**
		 * このデータモデルに対応するデータアイテムのコンストラクタ関数
		 *
		 * @private
		 * @type function
		 * @memberOf DataModel
		 */
		this._itemConstructor = createDataItemConstructor(this, descriptor);

		//TODO this.fullname -> managerの名前までを含めた完全修飾名
	}

	//EventDispatcherの機能を持たせるため、prototypeをコピーし、そのうえでDataModel独自のプロパティを追加する
	$.extend(DataModel.prototype, EventDispatcher.prototype, {
		/**
		 * 指定されたIDと初期値がセットされたデータアイテムを生成します。
		 * <p>
		 * データアイテムはこのデータモデルに紐づけられた状態になっています。
		 * </p>
		 * <p>
		 * 指定されたIDのデータアイテムがすでにこのデータモデルに存在した場合は、 既に存在するデータアイテムを返します（新しいインスタンスは生成されません）。
		 * </p>
		 * <p>
		 * 従って、1つのデータモデルは、1IDにつき必ず1つのインスタンスだけを保持します。
		 * なお、ここでIDの他に初期値も渡された場合は、既存のインスタンスに初期値をセットしてから返します。
		 * このとき、当該インスタンスにイベントハンドラが設定されていれば、changeイベントが（通常の値更新と同様に）発生します。
		 * </p>
		 * <p>
		 * 引数にはディスクリプタオブジェクトまたはその配列を指定します。ディスクリプタオブジェクトについては<a
		 * href="/conts/web/view/tutorial-data-model/descriptor">チュートリアル(データモデル編)&gt;&gt;ディスクリプタの書き方</a>をご覧ください。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @param {Object|Object[]} objOrArray ディスクリプタオブジェクト、またはその配列
		 * @returns {DataItem|DataItem[]} データアイテム、またはその配列
		 */
		create: function(objOrArray) {
			// modelがmanagerを持たない(dropModelされた)ならエラー
			if (!this._manager) {
				throwFwError(ERR_CODE_CANNOT_CHANGE_DROPPED_MODEL, [this.name, 'create']);
			}

			// objOrArrayがobjでもArrayでもなかったらエラー
			if (typeof objOrArray !== 'object' && !$.isArray(objOrArray)) {
				throwFwError(ERR_CODE_INVALID_CREATE_ARGS);
			}

			var ret = [];
			var idKey = this.idKey;

			//removeで同時に複数のアイテムが指定された場合、イベントは一度だけ送出する。
			//そのため、事前にアップデートセッションに入っている場合はそのセッションを引き継ぎ、
			//入っていない場合は一時的にセッションを作成する。
			var isAlreadyInUpdate = this._manager ? this._manager.isInUpdate() : false;

			if (!isAlreadyInUpdate) {
				this._manager.beginUpdate();
			}

			var actualNewItems = [];

			var items = wrapInArray(objOrArray);
			for ( var i = 0, len = items.length; i < len; i++) {
				var valueObj = items[i];

				var itemId = valueObj[idKey];
				//idが空文字、null、undefined、はid指定エラー
				if (itemId === '' || itemId == null) {
					throwFwError(ERR_CODE_NO_ID);
				}
				//idがstringでもintegerでもない場合は制約違反エラー
				if (!isIntegerValue(itemId, true) && !isString(itemId)) {
					throwFwError(ERR_CODE_INVALID_ITEM_VALUE);
				}

				var storedItem = this._findById(itemId);
				if (storedItem) {
					//返す値にstoredItemを追加
					ret.push(storedItem);

					// 既に存在するオブジェクトの場合は値を更新。ただし、valueObjのIDフィールドは無視（上書きなので問題はない）
					var event = itemSetter(this, storedItem, valueObj, null, [idKey]);
					if (!event) {
						//itemSetterが何も返さなかった = 更新する値が何もない
						continue;
					}

					addUpdateChangeLog(this, event);
				} else {
					var newItem = new this._itemConstructor(valueObj);

					this.items[itemId] = newItem;
					this.size++;

					actualNewItems.push(newItem);
					ret.push(newItem);
				}
			}

			if (actualNewItems.length > 0) {
				addUpdateLog(this, UPDATE_LOG_TYPE_CREATE, actualNewItems);
			}

			if (!isAlreadyInUpdate) {
				//既存のアイテムが変更されていればアイテムのイベントを上げる
				this._manager.endUpdate();
			}

			if ($.isArray(objOrArray)) {
				return ret;
			}
			return ret[0];
		},

		/**
		 * 指定されたIDのデータアイテムを返します。
		 * <p>
		 * 当該IDを持つアイテムをこのデータモデルが保持していない場合はnullを返します。 引数にIDの配列を渡した場合に一部のIDのデータアイテムが存在しなかった場合、
		 * 戻り値の配列の対応位置にnullが入ります。
		 * </p>
		 * <p>
		 * （例：get(['id1', 'id2', 'id3']) でid2のアイテムがない場合、戻り値は [item1, null, item3] のようになる ）
		 * </p>
		 *
		 * @memberOf DataModel
		 * @param {String|String[]} ID、またはその配列
		 * @returns {DataItem|DataItem[]} データアイテム、またはその配列
		 */
		get: function(idOrArray) {
			if ($.isArray(idOrArray) || h5.u.obj.isObservableArray(idOrArray)) {
				var ret = [];
				for ( var i = 0, len = idOrArray.length; i < len; i++) {
					ret.push(this._findById(idOrArray[i]));
				}
				return ret;
			}
			//引数の型チェックはfindById内で行われる
			return this._findById(idOrArray);
		},

		/**
		 * 指定されたIDのデータアイテムをこのデータモデルから削除します。
		 * <p>
		 * 当該IDを持つアイテムをこのデータモデルが保持していない場合はnullを返します。 引数にIDの配列を渡した場合に一部のIDのデータアイテムが存在しなかった場合、
		 * 戻り値の配列の対応位置にnullが入ります。 （例：remove(['id1', 'id2', 'id3']) でid2のアイテムがない場合、 戻り値は [item1,
		 * null, item3]のようになります。） 引数にID(文字列)またはデータアイテム以外を渡した場合はnullを返します。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @param {String|DataItem|String[]|DataItem[]} 削除するデータアイテム
		 * @returns {DataItem|DataItem[]} 削除したデータアイテム
		 */
		remove: function(objOrItemIdOrArray) {
			// modelがmanagerを持たない(dropModelされた)ならエラー
			if (!this._manager) {
				throwFwError(ERR_CODE_CANNOT_CHANGE_DROPPED_MODEL, [this.name, 'remove']);
			}

			//removeで同時に複数のアイテムが指定された場合、イベントは一度だけ送出する。
			//そのため、事前にアップデートセッションに入っている場合はそのセッションを引き継ぎ、
			//入っていない場合は一時的にセッションを作成する。
			var isAlreadyInUpdate = this._manager ? this._manager.isInUpdate() : false;
			if (!isAlreadyInUpdate) {
				this._manager.beginUpdate();
			}

			var idKey = this.idKey;
			var ids = wrapInArray(objOrItemIdOrArray);

			var actualRemovedItems = [];
			var ret = [];

			for ( var i = 0, len = ids.length; i < len; i++) {
				if (!this.has(ids[i])) {
					//指定されたアイテムが存在しない場合はnull
					ret.push(null);
					continue;
				}

				var id = (isString(ids[i]) || isIntegerValue(ids[i], true)) ? ids[i]
						: ids[i]._values[idKey];

				var item = this.items[id];

				delete this.items[id];

				this.size--;

				ret.push(item);
				item._model = null;
				actualRemovedItems.push(item);
			}

			if (actualRemovedItems.length > 0) {
				addUpdateLog(this, UPDATE_LOG_TYPE_REMOVE, actualRemovedItems);
			}

			if (!isAlreadyInUpdate) {
				this._manager.endUpdate();
			}

			if ($.isArray(objOrItemIdOrArray)) {
				return ret;
			}
			return ret[0];
		},

		/**
		 * 指定されたデータアイテムを保持しているかどうかを返します。
		 * <p>
		 * 文字列または整数値が渡された場合はIDとみなし、 オブジェクトが渡された場合はデータアイテムとみなします。
		 * オブジェクトが渡された場合、自分が保持しているデータアイテムインスタンスかどうかをチェックします。
		 * </p>
		 * <p>
		 * 従って、同じ構造を持つ別のインスタンスを引数に渡した場合はfalseが返ります。
		 * データアイテムインスタンスを引数に渡した場合に限り（そのインスタンスをこのデータモデルが保持していれば）trueが返ります。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @param {String|Object} idOrObj ID文字列またはデータアイテムオブジェクト
		 * @returns {Boolean} 指定されたIDのデータアイテムをこのデータモデルが保持しているかどうか
		 */
		has: function(idOrObj) {
			if (isString(idOrObj) || isIntegerValue(idOrObj, true)) {
				return !!this._findById(idOrObj);
			} else if (typeof idOrObj === 'object') {
				//型の厳密性はitemsとの厳密等価比較によってチェックできるので、if文ではtypeofで充分
				return idOrObj != null && $.isFunction(idOrObj.get)
						&& idOrObj === this.items[idOrObj.get(this.idKey)];
			} else {
				return false;
			}
		},

		/**
		 * このモデルが属しているマネージャを返します。
		 * <p>
		 * dropModelされたモデルの場合はnullを返します。
		 * </p>
		 *
		 * @memberOf DataModel
		 * @returns {DataManager} このモデルが属しているマネージャ
		 */
		getManager: function() {
			return this._manager
		},

		/**
		 * 引数にプロパティ名と値を指定し、 値がそのプロパティの制約条件を満たすかどうかをチェックします。
		 *
		 * @private
		 * @memberOf DataModel
		 * @param {String} プロパティ名
		 * @value {Any} 値
		 * @returns {Boolean} 値がプロパティの制約条件を満たすならtrue
		 */
		_validateItemValue: function(prop, value) {
			return this._itemValueCheckFuncs[prop](value);
		},

		/**
		 * 指定されたIDのデータアイテムを返します。 アイテムがない場合はnullを返します。
		 *
		 * @private
		 * @memberOf DataModel
		 * @param {String} id データアイテムのID
		 * @returns {DataItem} データアイテム、存在しない場合はnull
		 */
		_findById: function(id) {
			var item = this.items[id];
			return item === undefined ? null : item;
		},

		/**
		 * 引数で指定されたchangeイベントに基づいて、itemsChangeイベントを即座に発火させます。
		 *
		 * @private
		 * @memberOf DataModel
		 * @param {Object} event DataItemのchangeイベント
		 */
		_dispatchItemsChangeEvent: function(event) {
			var modelEvent = createDataModelItemsChangeEvent([], [], [], [event]);
			this.dispatchEvent(modelEvent);

			// managerがあれば(dropされたモデルでなければ)managerのイベントを発火
			if (this._manager) {
				modelEvent.target = this;
				this._manager._dataModelItemsChangeListener(modelEvent);
			}
		},

		/**
		 * データモデルが持つデータアイテムを配列に詰めて返します。 配列中のデータアイテムの順番は不定です。
		 *
		 * @memberOf DataModel
		 * @returns {Array} モデルが持つデータアイテムが格納された配列
		 */
		toArray: function() {
			var ret = [];
			var items = this.items;
			for ( var id in items) {
				ret.push(items[id]);
			}
			return ret;
		}
	});

	/**
	 * データモデルマネージャ
	 * <p>
	 * データモデルを管理するデータモデルマネージャクラスです。このインスタンスは<a
	 * href="h5.core.data.html#createManager">h5.core.data.createManager()</a>で作成します。
	 * </p>
	 * <p>
	 * このクラスは<a href="EventDispatcher.html">EventDispatcherクラス</a>のメソッドを持ちます。イベント関連のメソッドについては<a
	 * href="EventDispatcher.html">EventDispatcherクラス</a>を参照してください。<br>
	 * データモデルマネージャは、データモデルマネージャが管理するデータモデルに変更があった場合に'itemsChange'イベントが発火します。
	 * </p>
	 *
	 * @class
	 * @name DataModelManager
	 */
	function DataModelManager(managerName) {
		if (!isValidNamespaceIdentifier(managerName)) {
			throwFwError(ERR_CODE_INVALID_MANAGER_NAME);
		}

		/**
		 * このデータモデルマネージャが管理するDataModelインスタンス。
		 * <p>
		 * <a href="#createModel">createmodel()</a>で作成したモデルは、データモデルマネージャの管理下に置かれ、modelsから参照できます。
		 * </p>
		 * <p>
		 * {モデル名: データモデルインスタンス, ...} の構造を持つオブジェクトです。
		 * </p>
		 *
		 * @name models
		 * @type {Object}
		 * @memberOf DataModelManager
		 */
		this.models = {};

		/**
		 * データモデルマネージャ名
		 * <p>
		 * <a href="h5.core.data.html#createManager">h5.core.data.createManager()</a>の第一引数に指定した値が格納されます。
		 * </p>
		 *
		 * @name name
		 * @type {String}
		 * @memberOf DataModelManager
		 */
		this.name = managerName;


		/**
		 * アップデートログ
		 * <p>
		 * マネージャの管理下にあるデータモデル、アイテムのイベントをストアしておくためのオブジェクトです。内部で使用します。
		 * </p>
		 *
		 * @private
		 * @name _updateLogs
		 * @type {Object}
		 * @memberOf DataModelManager
		 */
		this._updateLogs = null;
	}
	DataModelManager.prototype = new EventDispatcher();
	$.extend(DataModelManager.prototype, {
		/**
		 * データモデルを作成します。
		 * <p>
		 * 引数にはデータモデルディスクリプタを渡します。
		 * </p>
		 *
		 * @param {Object} descriptor データモデルディスクリプタ
		 * @param {String} descriptor.name データモデル名。必須。
		 * @param {String} descriptor.base
		 *            マネージャに属する別のデータモデルのschemaを継承する場合に指定します。『'@'+継承先データモデル名』で指定してください。
		 * @param {Object} descriptor.schema スキーマを定義したオブジェクトを指定します。必須。
		 * @memberOf DataModelManager
		 */
		createModel: function(descriptor) {
			if ($.isArray(descriptor)) {
				var l = descriptor.length;
				if (!l) {
					//空配列
					throwFwError(ERR_CODE_INVALID_DESCRIPTOR, null,
							[createErrorReason(DESCRIPTOR_ERR_CODE_NOT_OBJECT)]);
				}
				var dependMap = {};
				var namesInDescriptors = [];
				// 依存関係のチェック
				// 要素がオブジェクトであり、name、schemaプロパティを持っていない場合はcatch節で、ディスクリプタのエラーを投げる
				for ( var i = 0; i < l; i++) {
					try {
						namesInDescriptors.push(descriptor[i].name);
						var depends = [];
						if (descriptor[i].base) {
							depends.push(descriptor[i].base.substring(1));
						}
						for ( var p in descriptor[i].schema) {
							var propObj = descriptor[i].schema[p];
							if (!propObj) {
								continue;
							}
							var type = propObj.type;
							if (type && type.substring(0, 1) === '@') {
								type = (type.indexOf('[]') === -1) ? type.substring(1) : type
										.substring(1, type.length - 2);
								depends.push(type);
							}
						}
						dependMap[i] = {
							depends: depends
						};
					} catch (e) {
						//descriptorがオブジェクトでない、またはnameとschemaが設定されていない。またはname,baseが文字列でない、schemaがオブジェクトでない
						throwFwError(ERR_CODE_INVALID_DESCRIPTOR);
					}
				}
				// dependMapを元に、循環参照チェック
				var retObj = {
					size: 0
				};
				while (retObj.size < l) {
					// 見つからなかったモデルを覚えておく
					// 循環参照のエラーなのか、単に存在しないモデル名指定によるエラーなのかを区別するため
					var noExistModels = {};

					// このwhileループ内で1つでも登録されたか
					var registed = false;

					// descriptorでループさせて、依存関係が解決された居たらデータモデルを登録
					for ( var i = 0; i < l; i++) {
						if (!dependMap[i].registed) {
							var depends = dependMap[i].depends;
							for ( var j = 0, len = depends.length; j < len; j++) {
								if (!this.models[depends[j]]) {
									noExistModels[depends[j]] = true;
									break;
								}
							}
							if (j === len) {
								// 依存しているものはすべて登録済みなら登録
								retObj[i] = registerDataModel(descriptor[i], this);
								retObj.size++;
								registed = true;
								dependMap[i].registed = true;
							}
						}
					}
					if (!registed) {
						// whileループの中で一つも登録されなかった場合は、存在しないデータモデル名を依存指定、または循環参照
						// 存在しなかったデータモデル名が全てディスクリプタに渡されたモデル名のいずれかだったら、それは循環参照エラー
						var isCircular = true;
						for ( var modelName in noExistModels) {
							if ($.inArray(modelName, namesInDescriptors) === -1) {
								isCircular = false;
								break;
							}
						}
						if (isCircular) {
							// 循環参照エラー
							throwFwError(ERR_CODE_DESCRIPTOR_CIRCULAR_REF);
						}
						throwFwError(ERR_CODE_INVALID_DESCRIPTOR, null, [createErrorReason(
								DESCRIPTOR_ERR_CODE_NO_EXIST_BASE, modelName)]);
					}
				}
				var retAry = [];
				for ( var i = 0; i < l; i++) {
					retAry.push(retObj[i]);
				}
				return retAry;
			}
			//registerDataModelは初めにDescriptorの検証を行う。
			//検証エラーがある場合は例外を送出する。
			//エラーがない場合はデータモデルを返す（登録済みの場合は、すでにマネージャが持っているインスタンスを返す）。
			return registerDataModel(descriptor, this);
		},

		/**
		 * 指定されたデータモデルを削除します。
		 * <p>
		 * データアイテムを保持している場合、アイテムをこのデータモデルからすべて削除した後 データモデル自体をマネージャから削除します。
		 * </p>
		 *
		 * @param {String|DataModel} nameOrModel データモデル名またはデータモデルインスタンス
		 * @memberOf DataModelManager
		 */
		dropModel: function(nameOrModel) {
			//TODO dropModelするときに依存していたらどうするか？
			//エラーにしてしまうか。
			var name = isString(nameOrModel) ? nameOrModel
					: (typeof nameOrModel === 'object' ? nameOrModel.name : null);

			if (!name || !this.models[name]) {
				return;
			}
			var model = this.models[name];
			model._manager = null;
			delete this.models[name];
			return model;
		},

		/**
		 * アップデートセッション中かどうかを返します。
		 * <p>
		 * beginUpdate()が呼ばれてからendUpdate()が呼ばれるまでの間はアップデートセッション中です。
		 * </p>
		 *
		 * @returns {Boolean} アップデートセッション中かどうか
		 * @memberOf DataModelManager
		 */
		isInUpdate: function() {
			return this._updateLogs !== null;
		},

		/**
		 * アップデートセッションを開始します。
		 * <p>
		 * beginUpdate()が呼ばれると、アップデートセッションを開始します。<a href="#endUpdate">endUpdate()</a>を呼ぶとアップデートセッションを解除します。
		 * </p>
		 * <p>
		 * 既にアップデートセッション中であれば何もしません。
		 * </p>
		 * <p>
		 * アップデートセッション中は、このDataModelManager、及びこのの管理下にあるDataModel、DataItemのイベントは発火しません。
		 * endUpdate()が呼ばれた時点で、イベントが発火します。
		 * </p>
		 * <p>
		 * アップデートセッション中の変更イベントはすべてマージされてendUpdate()時に発火します。
		 * </p>
		 *
		 * <pre>
		 * 例：
		 *
		 * // managerの管理下にあるDataItem
		 * item.set('value', 'a');
		 *
		 * item.addEventListener('change', function(e){
		 *     // oldValueとnewValueをalertで表示するイベントリスナ
		 *     alert('oldValue:' + e.prop.value.oldValue + ', newValue:' + e.prop.value.newValue);
		 * });
		 *
		 * // アップデートセッション
		 * manager.beginUpdate();
		 * item.set('value', 'b');
		 * item.set('value', 'c');
		 * manager.endUpdate();
		 *
		 * // &quot;oldValue: a, newValue: c&quot; とアラートが出る
		 * </pre>
		 *
		 * @returns {Boolean} アップデートセッション中かどうか
		 * @memberOf DataModelManager
		 */
		beginUpdate: function() {
			if (this.isInUpdate()) {
				return;
			}

			this._updateLogs = {};
		},

		/**
		 * アップデートセッションを終了します。
		 * <p>
		 * アップデートセッション中でなければ何もしません。イベントの発火など詳細は<a href="#beginUpdate">beginUpdate()</a>の説明を参照してください。
		 * </p>
		 *
		 * @memberOf DataModelManager
		 */
		endUpdate: function() {
			if (!this.isInUpdate()) {
				return;
			}

			var updateLogs = this._updateLogs;
			var oldValueLogs = this._oldValueLogs;
			//_updateLog, _oldValueLogsをまず削除する。イベントハンドラ内で、値を変更された時に_updateLogをきちんと残せるようにするため。
			this._updateLogs = null;
			this._oldValueLogs = null;

			function getFirstCRLog(itemLogs, lastPos) {
				for ( var i = 0; i < lastPos; i++) {
					var type = itemLogs[i].type;
					if ((type === UPDATE_LOG_TYPE_CREATE || type === UPDATE_LOG_TYPE_REMOVE)) {
						return itemLogs[i];
					}
				}
				return null;
			}


			/**
			 * 内部でDataItemごとのイベントを発火させます。 変更が1つでもあればモデルイベントオブジェクト(のひな形)を返しますが、変更がない場合はfalseを返します
			 */
			function createDataModelChanges(model, modelUpdateLogs) {
				var recreated = [];
				var created = [];
				var changed = [];
				var removed = [];

				for ( var itemId in modelUpdateLogs) {
					var itemLogs = modelUpdateLogs[itemId];
					var isChangeOnly = true;

					var changeEventStack = [];

					//新しい変更が後ろに入っているので、降順で履歴をチェックする
					for ( var i = itemLogs.length - 1; i >= 0; i--) {
						var log = itemLogs[i]; //あるitemについてのログ
						var logType = log.type; //当該ログの種類

						if (logType === UPDATE_LOG_TYPE_CHANGE) {
							changeEventStack.push(log.ev);
						} else {
							//あるアイテムについての今回の変更のうち、最初に存在するCREATEまたはREMOVEのログ
							//(従って、changeのみの場合存在しない場合もある)
							var firstCRLog = getFirstCRLog(itemLogs, i);

							if (logType === UPDATE_LOG_TYPE_CREATE) {
								//begin->remove->create->end のような操作が行われた場合、
								//begin-endの前後でアイテムのインスタンスが変わってしまう。
								//これをイベントで判別可能にするため、remove->createだった場合はcreatedではなくrecreatedに入れる。
								//なお、begin->remove->create->remove->create->endのような場合、
								//途中のcreate->removeは（begin-endの外から見ると）無視してよいので、
								//oldItemには「最初のremoveのときのインスタンス」、newItemには「最後のcreateのときのインスタンス」が入る。
								//また、begin->create->remove->create->endの場合は、begin-endの外から見ると"create"扱いにすればよい。

								//なお、createイベントはDataItemからは発火しない。(createはdependプロパティ内でのみ起こる)

								if (firstCRLog && firstCRLog.type === UPDATE_LOG_TYPE_REMOVE) {
									recreated.push({
										id: itemId,
										oldItem: firstCRLog.item,
										newItem: log.item
									});
								} else {
									created.push(log.item);
								}
							} else {
								//ここに来たら必ずUPDATE_LOG_TYPE_REMOVE

								var removedItem;

								if (firstCRLog && firstCRLog.type === UPDATE_LOG_TYPE_REMOVE) {
									//begin->remove->create->remove->endの場合、begin-endの外から見ると
									//「最初のremoveで取り除かれた」という扱いにすればよい。
									removedItem = firstCRLog.item;
								} else if (!firstCRLog) {
									//createまたはremoveのログが最後のremoveより前にない
									//＝beginより前からアイテムが存在し、始めてremoveされた
									//＝通常のremoveとして扱う
									removedItem = log.item;
								} else {
									//begin->create-> ( remove->create-> ) remove -> end つまり
									//beginより前にアイテムがなく、セッション中に作られたが最終的には
									//またremoveされた場合、begin-endの外から見ると「何もなかった」と扱えばよい。
									removedItem = null;
								}

								if (removedItem) {
									removed.push(removedItem);

									var removeEvent = {
										type: 'remove',
										model: model
									};
									removedItem.dispatchEvent(removeEvent);
								}
							}

							isChangeOnly = false;

							//CREATEまたはREMOVEを見つけたら、そこで走査を終了
							break;
						}
					}

					//新規追加or削除の場合はcreated, removedに当該オブジェクトが入ればよい。
					//あるアイテムのcreate,removeどちらのログもなかったということは
					//そのオブジェクトはbeginの時点から存在しendのタイミングまで残っていた、ということになる。
					//従って、あとはchangeのイベントオブジェクトをマージすればよい。
					if (isChangeOnly && changeEventStack.length > 0) {
						var mergedProps = {};
						for ( var i = changeEventStack.length - 1; i >= 0; i--) {
							for ( var p in changeEventStack[i].props) {
								if (!mergedProps[p]) {
									// oldValueのセット
									// type:[]ならmanager._oldValueLogsから持ってくる
									if (h5.u.obj.isObservableArray(model.get(itemId).get(p))) {
										var oldValue = oldValueLogs && oldValueLogs[model.name]
												&& oldValueLogs[model.name][itemId]
												&& oldValueLogs[model.name][itemId][p];
										if (!model.get(itemId).get(p).equals(oldValue)) {
											mergedProps[p] = {
												oldValue: oldValue
											}
										}
									} else {
										mergedProps[p] = {
											oldValue: changeEventStack[i].props[p].oldValue
										};
									}
								}
							}
						}
						// 今のアイテムがoldValueと違う値を持っていたらmergedPropsにnewValueをセット
						// 最終的に値が変わっているかどうかも同時にチェックする
						//TODO oldValueは配列ならmanager._oldValueLogsにある
						var changedProps = false;
						for ( var p in mergedProps) {
							if (mergedProps[p].oldValue !== model.get(itemId).get(p)) {
								mergedProps[p].newValue = model.get(itemId).get(p);
								changedProps = true;
							} else {
								delete mergedProps[p];
							}
						}
						if (changedProps) {
							var mergedChange = {
								type: 'change',
								target: changeEventStack[0].target,
								props: mergedProps
							};

							changed.push(mergedChange);

							mergedChange.target.dispatchEvent(mergedChange);
						}
					}
				}

				// 何も変更がなかった場合は、falseを返す
				if (created.length === 0 && recreated.length === 0 && removed.length === 0
						&& changed.length === 0) {
					return false;
				}
				return {
					created: created,
					recreated: recreated,
					removed: removed,
					changed: changed
				};
			}

			//endUpdateの処理フローここから

			var modelChanges = {};
			for ( var modelName in updateLogs) {
				if (!updateLogs.hasOwnProperty(modelName)) {
					continue;
				}
				var mc = createDataModelChanges(this.models[modelName], updateLogs[modelName]);
				if (mc) {
					modelChanges[modelName] = mc;
				}
			}

			//高速化のため、createDataModelChanges()の中で各DataItemからのイベントを発火させている

			//各DataModelからイベントを発火。
			//全てのモデルの変更が完了してから各モデルの変更イベントを出すため、同じループをもう一度行う
			var modelChanged = false;
			for ( var modelName in modelChanges) {
				modelChanged = true;
				var mc = modelChanges[modelName];
				this.models[modelName].dispatchEvent(createDataModelItemsChangeEvent(mc.created,
						mc.recreated, mc.removed, mc.changed));
			}

			var event = {
				type: EVENT_ITEMS_CHANGE,
				models: modelChanges
			};

			//最後に、マネージャから全ての変更イベントをあげる。変更がない場合は何もしない
			if (modelChanged) {
				this.dispatchEvent(event);
			}
		},

		_dataModelItemsChangeListener: function(event) {
			var manager = event.target.manager;

			var modelsChange = {};
			modelsChange[event.target.name] = event;

			var managerEvent = {
				type: EVENT_ITEMS_CHANGE,
				models: modelsChange
			};

			manager.dispatchEvent(managerEvent);
		}
	});

	/**
	 * データモデルを作成します。最初にdescriptorの検証を行い、エラーがある場合は例外を送出します。
	 *
	 * @param {Object} descriptor データモデルディスクリプタ（事前検証済み）
	 * @param {DataModelManager} manager データモデルマネージャ
	 * @returns {DataModel} 登録されたデータモデル
	 */
	function registerDataModel(descriptor, manager) {

		//ディスクリプタの検証を最初に行い、以降はValidなディスクリプタが渡されていることを前提とする
		//ここでは1つでもエラーがあればすぐにエラーを出す
		var errorReason = validateDescriptor(descriptor, manager, true);
		if (errorReason.length > 0) {
			throwFwError(ERR_CODE_INVALID_DESCRIPTOR, null, errorReason);
		}

		var extendedSchema = {};
		extendSchema(extendedSchema, manager, descriptor);

		var itemValueCheckFuncs = createCheckValueByDescriptor(extendedSchema, manager);

		var defaultValueErrorReason = validateDefaultValue(extendedSchema, itemValueCheckFuncs,
				true);
		if (defaultValueErrorReason.length > 0) {
			throwFwError(ERR_CODE_INVALID_DESCRIPTOR, null, defaultValueErrorReason);
		}

		//ここに到達したら、ディスクリプタにはエラーがなかったということ

		var modelName = descriptor.name;

		if (manager.models[modelName]) {
			//既に登録済みのモデルの場合は今持っているインスタンスを返す
			fwLogger.info(MSG_ERROR_DUP_REGISTER, this.name, modelName);
			return manager.models[modelName];
		}

		//新しくモデルを作ってマネージャに登録
		var model = new DataModel(descriptor, manager, itemValueCheckFuncs);

		manager.models[modelName] = model;

		return model;
	}

	/**
	 * 第一引数に指定された名前のデータモデルマネージャを作成します。
	 * <p>
	 * 第2引数が渡された場合、その名前空間に<a href="DataModelManager.html">DataModelManager</a>インスタンスを公開します。
	 * </p>
	 *
	 * @memberOf h5.core.data
	 * @param {String} name マネージャ名
	 * @param {String} [namespace] 公開先名前空間
	 * @returns {DataModelManager} データモデルマネージャ
	 */
	function createManager(managerName, namespace) {
		if (!isValidNamespaceIdentifier(managerName)) {
			throwFwError(ERR_CODE_INVALID_MANAGER_NAME);
		}

		//データモデルマネージャインスタンスを生成
		var manager = new DataModelManager(managerName);

		//第2引数が省略される場合もあるので、厳密等価でなく通常の等価比較を行う
		if (namespace != null) {
			//指定された名前空間に、managerNameでマネージャを公開する
			// 空文字指定ならグローバルに公開する
			if (namespace === '') {
				namespace = 'window';
			}
			var o = {};
			o[managerName] = manager;
			h5.u.obj.expose(namespace, o);
		}

		return manager;
	}




	/* -------- validateForm関係ここから -------- */

	/**
	 * form要素と、managerを引数にとって、validateのチェックを行う関数。 form要素のdata-model="xxx"にmanagerが持つデータモデル名を指定する。
	 * 各input要素にname="xxx"でプロパティ名を指定する
	 */
	function validateForm(form) {
		//TODO エラーチェック

		var $form = $(form);
		var matched = $form.attr('data-h5-model').match('^@(.*)$');
		var modelPath = matched[1];
		var split = modelPath.split('.');
		var modelName = split.splice(split.length - 1, 1);
		var managerName = split.splice(split.length - 1, 1);
		var manager = (split.length ? h5.u.obj.ns(split.join('.')) : window)[managerName];

		var model = manager.models[modelName];
		if (!model) {
			//TODO data-modelに指定されたデータモデル名がないエラー
			throwFwError();
			return;
		}

		var errorReason = [];
		$form.find('input').each(
				function() {
					var $input = $(this);
					var prop = $input.attr('name');
					// nameが指定されているinputについてチェック
					if (!prop) {
						return;
					}
					if (model.itemPropDesc[prop]) {
						var v = $input.val();
						if (!model._itemValueCheckFuncs[prop](v)) {
							errorReason.push(h5.u.str.format(
									'データモデル"{0}のプロパティ"{1}"に、"{2}"をセットすることはできません', modelName, prop,
									v));
						}
					}
				});

		return {
			model: model,
			properties: [{
				prop: '',
				value: '',
				reasons: errorReason
			}]
		};
	}

	/**
	 * input要素とモデルから、値のチェック。 modelの指定がない場合は、親のformタグのdata-model指定から求める
	 */
	function validateInput(input, model) {
		//TODO エラーチェック


		var resultObj = {
			reasons: []
		};
		var $input = $(input);
		// とりあえずinput属性の親のform要素を、データモデルのvalidateチェック対象としている
		if (!model) {
			var $form = $(input.form);
			if (!$form.length) {
				// formがない場合は終了
				return resultObj;
			}

			var formModelName = $form.attr('data-h5-model');
			if (!formModelName) {
				return resultObj;
			}

			var matched = $form.attr('data-h5-model').match('^@(.*)$');
			if (!matched) {
				return resultObj;
			}

			var modelPath = matched[1];
			var split = modelPath.split('.');
			var modelName = split.splice(split.length - 1, 1);
			var managerName = split.splice(split.length - 1, 1);
			var manager = (split.length ? h5.u.obj.ns(split.join('.')) : window)[managerName];
			model = manager.models[modelName];
		}

		var v = $input.val();
		var prop = $input.attr('name');
		// nameが指定されていない、またはデータ定義にないプロパティ名が指定されていればチェックしない
		if (!prop || !model.itemPropDesc[prop]) {
			return resultObj;
		}
		var errorReasons = model._itemValueCheckFuncs[prop](v);
		if (errorReasons === true) {
			// function(){return true}でチェックしている項目用
			//TODO チェック関数の戻り値を全て統一する必要がある
			errorReasons = [];
		}
		return {
			prop: prop,
			value: v,
			reasons: errorReasons
		};
	}

	/* -------- validateForm関係ここまで -------- */


	//TODO Localの場合は、テンポラリなManagerを渡す実装にする予定
	//	function createLocalDataModel(descriptor) {
	//		return createDataModel(descriptor);
	//	}
	//=============================
	// Expose to window
	//=============================
	/**
	 * DataModelの名前空間
	 *
	 * @name data
	 * @memberOf h5.core
	 * @namespace
	 */
	h5.u.obj.expose('h5.core.data', {
		createManager: createManager,

		createSequence: createSequence,

		//TODO validateForm,validateInputは、動作確認のためにとりあえず公開しているだけ
		validateForm: validateForm,
		validateInput: validateInput,

		SEQUENCE_RETURN_TYPE_STRING: SEQUENCE_RETURN_TYPE_STRING,

		SEQUENCE_RETURN_TYPE_INT: SEQUENCE_RETURN_TYPE_INT

	//		createLocalDataModel: createLocalDataModel,
	});
})();