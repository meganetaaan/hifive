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
import async from '../async/index.js'
import u from '../util/index.js'
import res from '../res/index.js'
import log from '../log/index.js'

/* ------ h5.core.controller ------ */
    // =========================================================================
    //
    // Constants
    //
    // =========================================================================

    // =============================
    // Production
    // =============================

    /**
     * SVGの名前空間
     */
    var SVG_XMLNS = 'http://www.w3.org/2000/svg';

    /**
     * セレクタのタイプを表す定数 イベントコンテキストの中に格納する
     */
    var SELECTOR_TYPE_CONST = {
        SELECTOR_TYPE_LOCAL: 1,
        SELECTOR_TYPE_GLOBAL: 2,
        SELECTOR_TYPE_OBJECT: 3
    };

    var SUFFIX_CONTROLLER = 'Controller';
    var SUFFIX_LOGIC = 'Logic';
    var EVENT_NAME_H5_TRACKSTART = 'h5trackstart';
    var EVENT_NAME_H5_TRACKMOVE = 'h5trackmove';
    var EVENT_NAME_H5_TRACKEND = 'h5trackend';
    var ROOT_ELEMENT_NAME = 'rootElement';

    var EVENT_NAME_TRIGGER_INDICATOR = 'triggerIndicator';

    /** グローバルセレクタ指定かどうかの判定に使用する正規表現 */
    var GLOBAL_SELECTOR_REGEXP = /^\{.*\}$/;

    /** イベント名がバインドリクエスト指定かどうかの判定に使用する正規表現 */
    var BIND_REQUESTED_REGEXP = /^\[.*\]$/;

    /** インラインコメントテンプレートのコメントノードの開始文字列 */
    var COMMENT_BINDING_TARGET_MARKER = '{h5view ';

    // エラーコード
    /** エラーコード: テンプレートに渡すセレクタが不正（コントローラビューでテンプレートに渡せるセレクタはコントローラのイベントハンドラ記述と同じになりました(#349） */
    //var ERR_CODE_INVALID_TEMPLATE_SELECTOR = 6000;
    /** エラーコード: バインド対象が指定されていない */
    var ERR_CODE_BIND_TARGET_REQUIRED = 6001;
    /** エラーコード: bindControllerメソッドにコントローラではないオブジェクトが渡された（このエラーはver.1.1.3時点では通常発生しないので削除） */
    //var ERR_CODE_BIND_NOT_CONTROLLER = 6002;
    /** エラーコード: バインド対象となるDOMがない */
    var ERR_CODE_BIND_NO_TARGET = 6003;
    /** エラーコード: バインド対象となるDOMが複数存在する */
    var ERR_CODE_BIND_TOO_MANY_TARGET = 6004;
    /** エラーコード: 指定された引数の数が少ない */
    var ERR_CODE_TOO_FEW_ARGUMENTS = 6005;
    /** エラーコード: コントローラの名前が指定されていない */
    var ERR_CODE_INVALID_CONTROLLER_NAME = 6006;
    /** エラーコード: コントローラの初期化パラメータが不正 */
    var ERR_CODE_CONTROLLER_INVALID_INIT_PARAM = 6007;
    /** エラーコード: 既にコントローラ化されている */
    var ERR_CODE_CONTROLLER_ALREADY_CREATED = 6008;
    /** エラーコード: コントローラの参照が循環している */
    var ERR_CODE_CONTROLLER_CIRCULAR_REF = 6009;
    /** エラーコード: ロジックの参照が循環している */
    var ERR_CODE_LOGIC_CIRCULAR_REF = 6010;
    /** エラーコード: コントローラ化によって追加されるプロパティと名前が重複している */
    var ERR_CODE_CONTROLLER_SAME_PROPERTY = 6011;
    /** エラーコード: イベントハンドラのセレクタに{this}が指定されている */
    var ERR_CODE_EVENT_HANDLER_SELECTOR_THIS = 6012;
    /** エラーコード: あるセレクタに対して重複したイベントハンドラが設定されている */
    var ERR_CODE_SAME_EVENT_HANDLER = 6013;
    /** エラーコード: ロジックの名前に文字列が指定されていない */
    var ERR_CODE_INVALID_LOGIC_NAME = 6017;
    /** エラーコード: 既にロジック化されている */
    var ERR_CODE_LOGIC_ALREADY_CREATED = 6018;
    /** エラーコード: exposeする際にコントローラ、もしくはロジックの名前がない */
    var ERR_CODE_EXPOSE_NAME_REQUIRED = 6019;
    /** エラーコード: Viewモジュールが組み込まれていない */
    var ERR_CODE_NOT_VIEW = 6029;
    /** エラーコード：バインド対象を指定する引数に文字列、オブジェクト、配列以外が渡された */
    var ERR_CODE_BIND_TARGET_ILLEGAL = 6030;
    /** エラーコード：ルートコントローラ以外ではcontroller.bind()/unbind()/dispose()はできない */
    var ERR_CODE_BIND_UNBIND_DISPOSE_ROOT_ONLY = 6031;
    /** エラーコード：コントローラメソッドは最低2つの引数が必要 */
    var ERR_CODE_CONTROLLER_TOO_FEW_ARGS = 6032;
    /** エラーコード：コントローラの初期化処理がユーザーコードによって中断された(__initや__readyで返したプロミスがrejectした) */
    var ERR_CODE_CONTROLLER_INIT_REJECTED_BY_USER = 6033;
    /** エラーコード：コントローラのバインド対象がノードではない */
    var ERR_CODE_BIND_NOT_NODE = 6034;
    /** エラーコード：ルートエレメント未設定もしくはunbindされたコントローラで使用できないメソッドが呼ばれた */
    var ERR_CODE_METHOD_OF_NO_ROOTELEMENT_CONTROLLER = 6035;
    /** エラーコード：disposeされたコントローラで使用できないメソッドが呼ばれた */
    var ERR_CODE_METHOD_OF_DISPOSED_CONTROLLER = 6036;
    /** エラーコード：unbindは__constructでは呼べない */
    var ERR_CODE_CONSTRUCT_CANNOT_CALL_UNBIND = 6037;
    /** エラーコード：コントローラの終了処理がユーザーコードによって中断された(__disposeで返したプロミスがrejectした) */
    var ERR_CODE_CONTROLLER_DISPOSE_REJECTED_BY_USER = 6038;
    /** エラーコード：manageChildの引数にコントローラインスタンス以外が渡された */
    var ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_CONTROLLER = 6039;
    /** エラーコード：unbindされたコントローラをmanageChildしようとした */
    var ERR_CODE_CONTROLLER_MANAGE_CHILD_UNBINDED_CONTROLLER = 6040;
    /** エラーコード：unbindされたコントローラのmanageChildが呼ばれた */
    var ERR_CODE_CONTROLLER_MANAGE_CHILD_BY_UNBINDED_CONTROLLER = 6041;
    /** エラーコード：manageChildの引数のコントローラインスタンスがルートコントローラじゃない */
    var ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_ROOT_CONTROLLER = 6042;
    /** エラーコード：unbindされたコントローラのunmanageChildが呼ばれた */
    var ERR_CODE_CONTROLLER_UNMANAGE_CHILD_BY_UNBINDED_CONTROLLER = 6043;
    /** エラーコード：unmanageChildの引数のコントローラインスタンスが自分の子コントローラじゃない */
    var ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NOT_CHILD_CONTROLLER = 6044;
    /** エラーコード：unmanageChildの第1引数がルートエレメント未決定コントローラで、第2引数がfalse */
    var ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NO_ROOT_ELEMENT = 6045;
    /** エラーコード: コントローラのデフォルトパラメータが不正 */
    var ERR_CODE_CONTROLLER_INVALID_INIT_DEFAULT_PARAM = 6046;

    // =============================
    // Development Only
    // =============================

    const fwLogger = log.createLogger('h5.core');
    /* del begin */

    // ログメッセージ
    var FW_LOG_TEMPLATE_LOADED = 'コントローラ"{0}"のテンプレートの読み込みに成功しました。';
    var FW_LOG_TEMPLATE_LOAD_FAILED = 'コントローラ"{0}"のテンプレートの読み込みに失敗しました。URL：{1}';
    var FW_LOG_INIT_CONTROLLER_REJECTED = 'コントローラ"{0}"の{1}で返されたPromiseがfailしたため、コントローラの初期化を中断しdisposeしました。';
    var FW_LOG_INIT_CONTROLLER_ERROR = 'コントローラ"{0}"の初期化中にエラーが発生しました。{0}はdisposeされました。';
    var FW_LOG_INIT_CONTROLLER_BEGIN = 'コントローラ"{0}"の初期化を開始しました。';
    var FW_LOG_INIT_CONTROLLER_COMPLETE = 'コントローラ"{0}"の初期化が正常に完了しました。';
    var FW_LOG_INIT_CONTROLLER_THROWN_ERROR = 'コントローラ"{0}"の{1}内でエラーが発生したため、コントローラの初期化を中断しdisposeしました。';
    var FW_LOG_BIND_TARGET_NOT_FOUND = 'イベントのバインド対象が見つかりません。指定されたグローバルセレクタ：{0}';
    var FW_LOG_BIND_TARGET_INVALID = 'イベントハンドラのセットに失敗しました。指定されたオブジェクトがaddEventListenerメソッドを持っていません。対象のオブジェクト：{0}';

    // エラーコードマップ
    var errMsgMap = {};
    //errMsgMap[ERR_CODE_INVALID_TEMPLATE_SELECTOR] = 'update/append/prepend() の第1引数に"window", "navigator", または"window.", "navigator."で始まるセレクタは指定できません。';
    errMsgMap[ERR_CODE_BIND_TARGET_REQUIRED] = 'コントローラ"{0}"のバインド対象となる要素を指定して下さい。';
    //errMsgMap[ERR_CODE_BIND_NOT_CONTROLLER] = 'コントローラ化したオブジェクトを指定して下さい。';
    errMsgMap[ERR_CODE_BIND_NO_TARGET] = 'コントローラ"{0}"のバインド対象となる要素が存在しません。';
    errMsgMap[ERR_CODE_BIND_TOO_MANY_TARGET] = 'コントローラ"{0}"のバインド対象となる要素が2つ以上存在します。バインド対象は1つのみにしてください。';
    errMsgMap[ERR_CODE_TOO_FEW_ARGUMENTS] = '正しい数の引数を指定して下さい。';
    errMsgMap[ERR_CODE_INVALID_CONTROLLER_NAME] = 'コントローラの名前は必須です。コントローラの__nameにコントローラ名を空でない文字列で設定して下さい。';
    errMsgMap[ERR_CODE_CONTROLLER_INVALID_INIT_PARAM] = 'コントローラ"{0}"の初期化パラメータがプレーンオブジェクトではありません。初期化パラメータにはプレーンオブジェクトを設定してください。';
    errMsgMap[ERR_CODE_CONTROLLER_ALREADY_CREATED] = '指定されたオブジェクトは既にコントローラ化されています。';
    errMsgMap[ERR_CODE_CONTROLLER_CIRCULAR_REF] = 'コントローラ"{0}"で、参照が循環しているため、コントローラを生成できません。';
    errMsgMap[ERR_CODE_LOGIC_CIRCULAR_REF] = 'ロジック"{0}"で、参照が循環しているため、ロジックを生成できません。';
    errMsgMap[ERR_CODE_CONTROLLER_SAME_PROPERTY] = 'コントローラ"{0}"のプロパティ"{1}"はコントローラ化によって追加されるプロパティと名前が重複しています。';
    errMsgMap[ERR_CODE_EVENT_HANDLER_SELECTOR_THIS] = 'コントローラ"{0}"でセレクタ名にthisが指定されています。コントローラをバインドした要素自身を指定したい時はrootElementを指定してください。';
    errMsgMap[ERR_CODE_SAME_EVENT_HANDLER] = 'コントローラ"{0}"のセレクタ"{1}"に対して"{2}"というイベントハンドラが重複して設定されています。';
    errMsgMap[ERR_CODE_INVALID_LOGIC_NAME] = 'ロジック名は必須です。ロジックの__nameにロジック名を空でない文字列で設定して下さい。';
    errMsgMap[ERR_CODE_LOGIC_ALREADY_CREATED] = '指定されたオブジェクトは既にロジック化されています。';
    errMsgMap[ERR_CODE_EXPOSE_NAME_REQUIRED] = 'コントローラ、もしくはロジックの __name が設定されていません。';
    errMsgMap[ERR_CODE_NOT_VIEW] = 'テンプレートはViewモジュールがなければ使用できません。';
    errMsgMap[ERR_CODE_BIND_TARGET_ILLEGAL] = 'コントローラ"{0}"のバインド対象には、セレクタ文字列、または、オブジェクトを指定してください。';
    errMsgMap[ERR_CODE_BIND_UNBIND_DISPOSE_ROOT_ONLY] = 'コントローラのbind(), unbind()はルートコントローラでのみ使用可能です。';
    errMsgMap[ERR_CODE_CONTROLLER_TOO_FEW_ARGS] = 'h5.core.controller()メソッドは、バインドターゲットとコントローラ定義オブジェクトの2つが必須です。';
    errMsgMap[ERR_CODE_CONTROLLER_INIT_REJECTED_BY_USER] = 'コントローラ"{0}"の初期化処理がユーザによって中断されました。';
    errMsgMap[ERR_CODE_BIND_NOT_NODE] = 'コントローラ"{0}"のバインド対象がノードではありません。バインド対象に指定できるのはノードかdocumentオブジェクトのみです。';
    errMsgMap[ERR_CODE_METHOD_OF_NO_ROOTELEMENT_CONTROLLER] = 'ルートエレメントの設定されていないコントローラのメソッド{0}は実行できません。';
    errMsgMap[ERR_CODE_METHOD_OF_DISPOSED_CONTROLLER] = 'disposeされたコントローラのメソッド{0}は実行できません。';
    errMsgMap[ERR_CODE_CONSTRUCT_CANNOT_CALL_UNBIND] = 'unbind()メソッドは__constructから呼ぶことはできません。';
    errMsgMap[ERR_CODE_CONTROLLER_DISPOSE_REJECTED_BY_USER] = 'コントローラ"{0}"のdispose処理がユーザによって中断されました。';
    errMsgMap[ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_CONTROLLER] = 'manageChildの第1引数はコントローラインスタンスである必要があります。';
    errMsgMap[ERR_CODE_CONTROLLER_MANAGE_CHILD_UNBINDED_CONTROLLER] = 'アンバインドされたコントローラをmanageChildすることはできません';
    errMsgMap[ERR_CODE_CONTROLLER_MANAGE_CHILD_BY_UNBINDED_CONTROLLER] = 'アンバインドされたコントローラのmanageChildは呼び出せません';
    errMsgMap[ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_ROOT_CONTROLLER] = 'manageChildの第1引数はルートコントローラである必要があります。';
    errMsgMap[ERR_CODE_CONTROLLER_UNMANAGE_CHILD_BY_UNBINDED_CONTROLLER] = 'アンバインドされたコントローラのunmanageChildは呼び出せません';
    errMsgMap[ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NOT_CHILD_CONTROLLER] = 'unmanageChildの第1引数は呼び出し側の子コントローラである必要があります。';
    errMsgMap[ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NO_ROOT_ELEMENT] = 'ルートエレメントの決定していない子コントローラのunmanageChildは、第2引数にfalseを指定することはできません';
    errMsgMap[ERR_CODE_CONTROLLER_INVALID_INIT_DEFAULT_PARAM] = 'コントローラ"{0}"のデフォルトパラメータ(__defaultArgs)がプレーンオブジェクトではありません。デフォルトパラメータにはプレーンオブジェクトを設定してください。';
    addFwErrorCodeMap(errMsgMap);
    /* del end */

    // =========================================================================
    //
    // Cache
    //
    // =========================================================================
    var getDeferred = async.deferred;
    var isPromise = async.isPromise;
    var startsWith = u.str.startsWith;
    var endsWith = u.str.endsWith;
    var format = u.str.format;
    var argsToArray = u.obj.argsToArray;
    var isJQueryObject = u.obj.isJQueryObject;
    var isDependency = res.isDependency;

    // =========================================================================
    //
    // Privates
    //
    // =========================================================================
    // =============================
    // Variables
    // =============================
    /**
     * commonFailHandlerを発火させないために登録するdummyのfailハンドラ
     */
    var dummyFailHandler = function() {
    //
    };

    // コントローラマネージャ。作成した時に値をセットしている。
    var controllerManager;

    // キャッシュマネージャ。作成した時に値をセットしている。
    var definitionCacheManager;

    /**
     * マウス/タッチイベントについてh5track*イベントをトリガしたかどうかを管理するため、イベントを格納する配列
     */
    var storedEvents = [];

    /**
     * あるマウス/タッチイベントについてh5track*イベントをトリガ済みかのフラグを保持する配列<br>
     * storedEventsに格納されているイベントオブジェクトに対応して、<br>
     * [true, false, false] のように格納されている。
     */
    var h5trackTriggeredFlags = [];

    /**
     * touch-actionをサポートしているときの、そのプロパティ(touchActionまたはmsTouchAction)
     */
    var touchActionProp = '';

    /**
     * touch-action(または-ms-touch-action)プロパティがサポートされているか
     */
    var isTouchActionSupported = (function() {
        // divを作って、styleにtouchActionまたはmsTouchActionがあるか判定する
        // いずれかがあった場合にtouchActionPropを設定して、trueを返す
        var div = document.createElement('div');
        if (typeof div.style.touchAction !== TYPE_OF_UNDEFINED) {
            touchActionProp = 'touchAction';
            return true;
        } else if (typeof div.style.msTouchAction !== TYPE_OF_UNDEFINED) {
            touchActionProp = 'msTouchAction';
            return true;
        }
        return false;
    })();

    /**
     * コントローラ化時に呼ばれるフック関数の配列
     */
    var controllerInstantiationHooks = [];

    // =============================
    // Functions
    // =============================
    /**
     * 要素のtransformスタイルの指定を無効にする
     *
     * @private
     * @param {DOM} element
     */
    function clearTransformStyle(element) {
        if (element.style.transform != null) {
            element.style.transform = '';
        }
        if (element.style.mozTansform != null) {
            element.style.mozTansform = '';
        }
        if (element.style.webkitTansform != null) {
            element.style.webkitTansform = '';
        }
    }

    /**
     * svg要素のboundingClientRectを取得した時にsvg要素自体の位置を得できるブラウザかどうか
     * <p>
     * (Firefox32以下、iOS5以下、Android対応のため。 issue #393)
     * </p>
     *
     * @private
     * @returns {Boolean}
     */
    var isSVGOffsetCollect = (function() {
        var _isSVGOffsetCollect = null;
        return function() {
            if (_isSVGOffsetCollect != null) {
                // 判定済みなら判定済み結果を返す
                return _isSVGOffsetCollect;
            }
            // ダミーのsvg要素とrect要素を作って、正しく位置が取得できるかどうかの判定を行う
            var svg = document.createElementNS(SVG_XMLNS, 'svg');
            svg.setAttribute('width', 1);
            svg.setAttribute('height', 1);
            var rect = document.createElementNS(SVG_XMLNS, 'rect');
            rect.setAttribute('x', 1);
            rect.setAttribute('y', 1);
            rect.setAttribute('width', 1);
            rect.setAttribute('height', 1);
            // transformを空文字にして無効にする(cssで指定されていたとしても無効にして計算できるようにするため)
            clearTransformStyle(rect);

            $(function() {
                document.body.appendChild(svg);
                // svgのboudingClientRectのtopを取得
                var svgTop = svg.getBoundingClientRect().top;
                svg.appendChild(rect);
                // svg要素のboundingClientRectが正しく取得できていない場合、描画図形を包含する矩形を表している。
                // その場合、rectを追加するとsvgのboundingClientRectが変わるので、rect追加前とrect追加後の位置の差がある場合は
                // svg要素の位置が正しくとれないと判定する
                _isSVGOffsetCollect = svgTop === svg.getBoundingClientRect().top;
                // svg要素の削除
                document.body.removeChild(svg);
            });
            // document.ready前はnullを返す
            return _isSVGOffsetCollect;
        };
    })();

    // --------------------------------- コントローラ定義オブジェクトのvalidate関数 ---------------------------------
    /**
     * コントローラ定義、ターゲット、初期化パラメータのチェックを行います(コントローラ名のチェック(__name)はチェック済み)
     * <p>
     * チェックを通らなかった場合はエラーを投げます
     * </p>
     *
     * @param {Boolean} isRoot ルートコントローラかどうか
     * @param {DOM|jQuery|String} targetElement
     * @param {Object} controllerDefObj
     * @param {String} controllerName
     */
    function validateControllerDef(isRoot, targetElement, controllerDefObj, controllerName) {
        // コントローラ定義オブジェクトに、コントローラが追加するプロパティと重複するプロパティがあるかどうかチェック
        if (!controllerPropertyMap) {
            // 重複チェックが初めて呼ばれた時にコントローラプロパティマップを生成してチェックで使用する
            controllerPropertyMap = {};
            var tempInstance = new Controller(null, 'a');
            for ( var p in tempInstance) {
                if (tempInstance.hasOwnProperty(p) && p !== '__name' && p !== '__templates'
                        && p !== '__meta') {
                    controllerPropertyMap[p] = 1;
                }
            }
            tempInstance = null;
            var proto = Controller.prototype;
            for ( var p in proto) {
                if (proto.hasOwnProperty(p)) {
                    controllerPropertyMap[p] = null;
                }
            }
            proto = null;
        }
        for ( var prop in controllerDefObj) {
            if (prop in controllerPropertyMap) {
                // コントローラが追加するプロパティと同じプロパティ名のものがあればエラー
                throwFwError(ERR_CODE_CONTROLLER_SAME_PROPERTY, [controllerName, prop], {
                    controllerDefObj: controllerDefObj
                });
            }
        }
    }

    /**
     * コントローラ定義オブジェクトの子孫コントローラ定義が循環参照になっているかどうかをチェックします。
     *
     * @private
     * @param {Object} controllerDefObject コントローラ定義オブジェクト
     * @param {String} controllerName コントローラ名
     */
    function validateControllerCircularRef(controllerDefObject, controllerName) {
        function validateCircular(controllerDef, ancestors) {
            if ($.inArray(controllerDef, ancestors) !== -1) {
                // 循環参照エラー
                throwFwError(ERR_CODE_CONTROLLER_CIRCULAR_REF, [controllerName], {
                    controllerDefObj: controllerDefObject
                });
            }
            // 子コントローラをチェック
            doForEachChildControllers(controllerDef, function(controller) {
                validateCircular(controller, ancestors.concat([controllerDef]));
            }, true);
        }
        validateCircular(controllerDefObject, []);
    }

    /**
     * ロジック定義が循環参照になっているかどうかをチェックします。
     *
     * @private
     * @param {Object} rootLogicDef ロジック定義オブジェクト
     */
    function validateLogicCircularRef(rootLogicDef) {
        function validateCircular(logic, ancestors) {
            if ($.inArray(logic, ancestors) !== -1) {
                // 循環参照エラー
                throwFwError(ERR_CODE_LOGIC_CIRCULAR_REF, [rootLogicDef.__name], {
                    logicDefObj: rootLogicDef
                });
            }
            doForEachLogics(logic, function(child) {
                validateCircular(child, ancestors.concat(logic));
            });
        }
        validateCircular(rootLogicDef, []);
    }

    /**
     * ターゲットエレメントの指定が正しいかどうかチェックします。正しくない場合はthrowFwError
     *
     * @private
     * @param {DOM|jQuery|String} targetElement
     * @param {Object} controllerDefObj コントローラ定義オブジェクト
     * @param {String} controllerName コントローラ名
     */
    function validateTargetElement(targetElement, controllerDefObj, controllerName) {
        // null,undefinedならエラー
        if (targetElement == null) {
            throwFwError(ERR_CODE_BIND_TARGET_REQUIRED, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }
        // 文字列でもObjectでもないならエラー
        if (!isString(targetElement) && typeof targetElement !== 'object') {
            throwFwError(ERR_CODE_BIND_TARGET_ILLEGAL, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }

        var $bindTargetElement = $(targetElement);
        // 要素が1つでない場合はエラー
        if ($bindTargetElement.length === 0) {
            throwFwError(ERR_CODE_BIND_NO_TARGET, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }
        // 要素が複数ある場合はエラー
        if ($bindTargetElement.length > 1) {
            throwFwError(ERR_CODE_BIND_TOO_MANY_TARGET, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }
        // ノードエレメントでない場合はエラー
        if ($bindTargetElement[0].nodeType !== NODE_TYPE_DOCUMENT
                && $bindTargetElement[0].nodeType !== NODE_TYPE_ELEMENT) {
            throwFwError(ERR_CODE_BIND_NOT_NODE, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }
    }

    // ----------------------------- コントローラ定義オブジェクトのチェック関数ここまで -----------------------------
    /**
     * イベントコンテキストクラス イベントコンテキストの中に格納する
     *
     * @private
     * @class
     * @param {Controller} controller コントローラインスタンス
     * @param {Event} event イベントオブジェクト
     * @param {Array} evArg イベントハンドラに渡された引数(arguments)を配列にしたもの
     * @param {String} selector イベントハンドラのバインドに使用されたセレクタ
     * @param {Number} selectorType イベントハンドラのバインドに使用されたセレクタのタイプ(SELECTOR_TYPE_CONSTに定義されたもの)
     */
    function EventContext(controller, event, evArg, selector, selectorType) {
        this.controller = controller;
        this.event = event;
        this.evArg = evArg;
        this.selector = selector;
        this.selectorType = selectorType;
    }
    // prototypeにセレクタのタイプを表す定数を追加
    $.extend(EventContext.prototype, SELECTOR_TYPE_CONST);

    /**
     * コントローラがdisposeされていないことと、executeListenersを見てリスナーを実行するかどうかを決定するインターセプタ。
     *
     * @private
     * @param {Object} invocation インヴォケーション
     * @returns リスナーの戻り値
     */
    function executeListenersInterceptor(invocation) {
        // disposeされていたら何もしない
        // disposeされているのにイベントハンドラが起きることがあるのでチェックしている。
        // jQueryはイベント発生時に探索したハンドラを実行しようとするので、
        // 途中のイベントハンドラでunbindしたハンドラも実行される。
        // あるイベントについて、コントローラでバインドしたイベントハンドラより先に実行されるイベントハンドラの中で
        // コントローラがdisposeされた場合、unbindしたコントローラのハンドラも実行され、ここの関数が実行される。
        // そのため、コントローラがdisposeされているかどうかのチェックが必要。
        if (isDisposed(this) || !this.__controllerContext.executeListeners) {
            return;
        }
        return invocation.proceed();
    }

    /**
     * 指定されたオブジェクトの関数にアスペクトを織り込みます。
     *
     * @private
     * @param {Object} defObj コントローラまたはロジックの定義オブジェクト
     * @param {Object} prop プロパティ名.
     * @param {Boolean} isEventHandler イベントハンドラかどうか
     * @returns {Object} アスペクトを織り込んだ関数
     */
    function weaveAspect(defObj, prop, isEventHandler) {
        var interceptors = getInterceptors(defObj.__name, prop);
        // イベントハンドラの場合、 enable/disableListeners()のために一番外側に制御用インターセプタを織り込む
        if (isEventHandler) {
            interceptors.push(executeListenersInterceptor);
        }
        return createWeavedFunction(defObj[prop], prop, interceptors);
    }

    /**
     * 関数名とポイントカットを比べて、条件に合致すればインターセプタを返す.
     *
     * @private
     * @param {String} targetName バインドする必要のある関数名.
     * @param {Object} pcName ポイントカットで判別する対象名.
     * @returns {Function[]} AOP用関数配列.
     */
    function getInterceptors(targetName, pcName) {
        /** @type Any */
        var ret = [];
        var aspects = settings.aspects;
        // 織り込むべきアスペクトがない場合はそのまま空の配列を返す
        if (!aspects || aspects.length === 0) {
            return ret;
        }
        aspects = wrapInArray(aspects);
        for (var i = aspects.length - 1; -1 < i; i--) {
            var aspect = aspects[i];
            if (aspect.target && !aspect.compiledTarget.test(targetName)) {
                continue;
            }
            var interceptors = aspect.interceptors;
            if (aspect.pointCut && !aspect.compiledPointCut.test(pcName)) {
                continue;
            }
            if (!isArray(interceptors)) {
                ret.push(interceptors);
                continue;
            }
            for (var j = interceptors.length - 1; -1 < j; j--) {
                ret = ret.concat(interceptors[j]);
            }
        }
        return ret;
    }

    /**
     * 基本となる関数にアスペクトを織り込んだ関数を返します。
     *
     * @private
     * @param {Function} base 基本関数.
     * @param {String} funcName 基本関数名.
     * @param {Function[]} aspects AOP用関数配列.
     * @returns {Function} AOP用関数を織り込んだ関数.
     */
    function createWeavedFunction(base, funcName, aspects) {
        // 関数のウィービングを行う
        var weave = function(baseFunc, fName, aspect) {
            return function(/* var_args */) {
                var that = this;
                var invocation = {
                    target: that,
                    func: baseFunc,
                    funcName: fName,
                    args: arguments,
                    proceed: function() {
                        return baseFunc.apply(that, this.args);
                    }
                };
                return aspect.call(that, invocation);
            };
        };

        var f = base;
        for (var i = 0, l = aspects.length; i < l; i++) {
            f = weave(f, funcName, aspects[i]);
        }
        return f;
    }

    /**
     * セレクタがコントローラの外側の要素を指しているかどうかを返します。<br>
     * (外側の要素 = true)
     *
     * @private
     * @param {String} selector セレクタ
     * @returns {Boolean} コントローラの外側の要素を指しているかどうか
     */
    function isGlobalSelector(selector) {
        return GLOBAL_SELECTOR_REGEXP.test(selector);
    }

    /**
     * イベント名がjQuery.bindを使って要素にイベントをバインドするかどうかを返します。
     *
     * @private
     * @param {String} eventName イベント名
     * @returns {Boolean} jQuery.bindを使って要素にイベントをバインドするかどうか
     */
    function isBindRequestedEvent(eventName) {
        return BIND_REQUESTED_REGEXP.test(eventName);
    }

    /**
     * セレクタから{}を外した文字列を返します。
     *
     * @private
     * @param {String} selector セレクタ
     * @returns {String} セレクタから{}を外した文字列
     */
    function trimGlobalSelectorBracket(selector) {
        return $.trim(selector.substring(1, selector.length - 1));
    }

    /**
     * イベント名から[]を外した文字列を返す
     *
     * @param {String} eventName イベント名
     * @returns {String} イベント名から[]を外した文字列
     */
    function trimBindEventBracket(eventName) {
        return $.trim(eventName.substring(1, eventName.length - 1));
    }

    /**
     * 指定されたセレクタがwindow, window., document, document., navigator, navigator.
     * で始まっていればそのオブジェクトを、そうでなければそのまま文字列を返します。
     * window,document,navigatorは第2引数に指定されたdocumentが属するウィンドウのものを使用します。
     * また、第3引数にコントローラが指定されていてかつselectorが"this."で始まっている場合は、コントローラ内のオブジェクトを取得します。
     *
     * @private
     * @param {String} selector セレクタ
     * @param {Document} doc
     * @param {Controller} [controller] セレクタがthis.で始まっているときにコントローラの持つオブジェクトをターゲットにする
     * @returns {Object|String} パスで指定されたオブジェクト、もしくは未変換の文字列
     */
    function getGlobalSelectorTarget(selector, doc, controller) {
        if (controller && selector === ROOT_ELEMENT_NAME) {
            return controller.rootElement;
        }
        var specialObj = ['window', 'document', 'navigator'];
        for (var i = 0, len = specialObj.length; i < len; i++) {
            var s = specialObj[i];
            if (selector === s || startsWith(selector, s + '.')) {
                //特殊オブジェクトそのものを指定された場合またはwindow. などドット区切りで続いている場合
                return u.obj.getByPath(selector, getWindowOfDocument(doc));
            }
        }
        // selectorが'this.'で始まっていて、かつcontrollerが指定されている場合はコントローラから取得する
        var controllerObjectPrefix = 'this.';
        if (controller && startsWith(selector, controllerObjectPrefix)) {
            return u.obj.getByPath(selector.slice(controllerObjectPrefix.length), controller);
        }
        return selector;
    }

    /**
     * 指定されたプロパティがイベントハンドラかどうかを返します。
     *
     * @private
     * @param {Object} controllerDefObject コントローラ定義オブジェクト
     * @param {String} prop プロパティ名
     * @returns {Boolean} プロパティがイベントハンドラかどうか
     */
    function isEventHandler(controllerDefObject, prop) {
        return prop.indexOf(' ') !== -1 && isFunction(controllerDefObject[prop]);
    }

    /**
     * コントローラのプロパティが自分自身の子コントローラであるかどうかを返します。
     *
     * @private
     * @param {Object} controller コントローラ
     * @param {String} prop プロパティ名
     * @param {Boolean} isDefObj 定義オブジェクトについての判定かどうか。定義オブジェクトならparentControllerが一致するかどうかは見ない。
     * @returns {Boolean} コントローラのプロパティが第1引数のコントローラの子コントローラかどうか(true=子コントローラである)
     */
    function isChildController(controller, prop, isDefObj) {
        var target = controller[prop];
        // プロパティがrootControllerまたはparentControllerの場合はfalse
        // __controllerContextがない(コントローラインスタンスではないまたはdispose済みコントローラインスタンス)の場合はfalse
        // 子コントローラでない(isRootがtrue)の場合はfalse
        // parentControllerを見て、自分の子供ならtrueを返す。
        // ただし、parentController未設定(コントローラ化処理の途中)の場合はtrueを返す。
        return endsWith(prop, SUFFIX_CONTROLLER)
                && prop !== 'rootController'
                && prop !== 'parentController'
                && target
                && (isDefObj || (target.__controllerContext && !target.__controllerContext.isRoot && (!target.parentController || target.parentController === controller)));
    }

    /**
     * ロジックのプロパティが自分自身の子ロジックであるかどうかを返します。
     *
     * @private
     * @param {Object} logic ロジックまたはコントローラ(コントローラを指定した時は、そのコントローラが持つロジックかどうかを返す)
     * @param {String} prop プロパティ名
     * @returns {Boolean} ロジックのプロパティが第1引数のロジックの子ロジックかどうか(true=子ロジックである)
     */
    function isChildLogic(logic, prop) {
        // hasOwnPropertyがtrueで、"Logic"で終わっているプロパティ名のものは子ロジック。ロジック化の対象になる。
        return logic.hasOwnProperty(prop) && endsWith(prop, SUFFIX_LOGIC)
    }

    /**
     * 指定されたコントローラ直下の子コントローラについて、コールバックを実行します
     *
     * <pre>
     * function(controller, parentController, prop) {}
     * </pre>
     *
     * のような関数を指定してください。falseが返されたら中断します。
     *
     * @private
     * @param {Object} controller
     * @param {Function} callback 引数に各コントローラとプロパティ名が渡されます。
     * @param {Boolean} isDefObj
     *            定義オブジェクトについての実行かどうか。定義オブジェクトなら子コントローラを探索するときにparentControllerが一致するかどうかは見ない。
     * @returns 中断された場合はfalseを返します
     */
    function doForEachChildControllers(controller, callback, isDefObj) {
        // コントローラインスタンスなら__controllerContextから子コントローラを取得
        if (!isDefObj) {
            // disposeされていたら何もしない
            if (isDisposed(controller)) {
                return;
            }
            var childControllers = controller.__controllerContext.childControllers;
            for (var i = 0, l = childControllers.length; i < l; i++) {
                var childController = childControllers[i];
                var child = childController;
                if (false === callback(child, controller)) {
                    return false;
                }
            }
            return;
        }

        // 定義オブジェクトならdefinitionCacheManagerからキャッシュを取得(ない場合はnull)
        var cache = definitionCacheManager.get(controller.__name);
        // キャッシュがあるなら、キャッシュを使ってループ
        if (cache) {
            for (var i = 0, l = cache.childControllerProperties.length; i < l; i++) {
                var prop = cache.childControllerProperties[i];
                var child = controller[prop];
                // __construct時点では子コントローラがセットされていない場合があるので、
                // その場合はcallbackは実行しない
                if (child && false === callback(controller[prop], controller, prop)) {
                    return false;
                }
            }
            return;
        }
        // キャッシュがないなら探索しながらループ
        for ( var prop in controller) {
            if (isChildController(controller, prop, isDefObj)) {
                if (false === callback(controller[prop], controller, prop)) {
                    return false;
                }
            }
        }
    }

    /**
     * 指定されたロジック直下の子ロジックについて、コールバックを実行します
     *
     * <pre>
     * function(logic, parentLogic, prop) {}
     * </pre>
     *
     * のような関数を指定してください。falseが返されたら中断します。
     *
     * @private
     * @param {Logic|Object} logic ロジックまたは、まだインスタンス化されていないロジック定義オブジェクト
     * @param {Function} callback 引数に各ロジックとプロパティ名が渡されます。
     * @returns 中断された場合はfalseを返します
     */
    function doForEachLogics(logic, callback) {
        // キャッシュがあるなら、キャッシュを使ってループ
        var cache = definitionCacheManager.get(logic.__name);
        if (cache) {
            for (var i = 0, l = cache.logicProperties.length; i < l; i++) {
                var prop = cache.logicProperties[i];
                if (false === callback(logic[prop], logic, prop)) {
                    return false;
                }
            }
            return;
        }
        // キャッシュがないなら探索しながらループ
        for ( var prop in logic) {
            if (isChildLogic(logic, prop)) {
                if (false === callback(logic[prop], logic, prop)) {
                    return false;
                }
            }
        }
    }

    /**
     * 指定されたコントローラ以下のコントローラについて、コールバックを実行します
     *
     * <pre>
     * function(controller, parentController, prop) {}
     * </pre>
     *
     * のような関数を指定してください。falseが返されたら中断します。
     *
     * @private
     * @param {Object} controller
     * @param {Function} callback 引数に各コントローラとプロパティ名が渡されます。
     * @param {Controller} [_parent] 第1引数controllerの親コントローラ。再帰呼び出し時に受け取る変数です。
     * @param {String} [_prop] _parentがcontrollerを指すプロパティ名。再帰呼び出し時に受け取る変数です。
     * @returns コールバックがfalseを返して中断した場合はfalseを返します
     */
    function doForEachControllerGroups(controller, callback, _parent, _prop) {
        if (callback.call(this, controller, _parent, _prop) === false) {
            return false;
        }
        function callbackWrapper(c, parent, prop) {
            if (doForEachControllerGroups(c, callback, parent, prop) === false) {
                return false;
            }
        }
        return doForEachChildControllers(controller, callbackWrapper);
    }

    /**
     * 指定されたコントローラ以下のコントローラについて、深さ優先でコールバックを実行します
     *
     * <pre>
     * function(controller, parentController, prop) {}
     * </pre>
     *
     * のような関数を指定してください。falseが返されたら中断します。
     *
     * @private
     * @param {Object} controller
     * @param {Function} callback 引数に各コントローラとプロパティ名が渡されます。
     * @param {Controller} [_parent] 第1引数controllerの親コントローラ。再帰呼び出し時に受け取る変数です。
     * @param {String} [_prop] _parentがcontrollerを指すプロパティ名。再帰呼び出し時に受け取る変数です。
     * @returns コールバックがfalseを返して中断した場合はfalseを返します
     */
    function doForEachControllerGroupsDepthFirst(controller, callback, _parent, _prop) {
        function callbackWrapper(c, parent, prop) {
            if (!c || doForEachControllerGroupsDepthFirst(c, callback, parent, prop) === false) {
                return false;
            }
        }
        if (doForEachChildControllers(controller, callbackWrapper) === false) {
            return false;
        }
        if (callback.call(this, controller, _parent, _prop) === false) {
            return false;
        }
    }

    /**
     * 指定されたコントローラの子コントローラが持つ、指定されたプロミスを取得します。
     *
     * @private
     * @param {Object} controller コントローラ
     * @param {String} propertyName プロパティ名(initPromise,postInitPromise,readyPromise)
     * @returns {Promise[]} Promiseオブジェクト配列
     */
    function getChildControllerPromises(controller, propertyName) {
        var promises = [];
        doForEachChildControllers(controller, function(c) {
            var promise = c[propertyName];
            if (promise) {
                promises.push(promise);
            }
        });
        return promises;
    }

    /**
     * バインドマップに基づいてイベントハンドラをバインドします
     *
     * @private
     * @param {Controller} controller コントローラ
     */
    function bindByBindMap(controller) {
        var bindMap = controller.__controllerContext.cache.bindMap;
        var doc = getDocumentOf(controller.rootElement);
        for ( var p in bindMap) {
            var bindObjects = createBindObjects(controller, bindMap[p], controller[p]);
            for (var i = 0, l = bindObjects.length; i < l; i++) {
                bindByBindObject(bindObjects[i], doc);
            }
        }
    }

    /**
     * イベントハンドラのバインドを行います。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Object} eventHandlerInfo バインドマップに登録されているイベントハンドラの情報
     * @param {Function} func イベントハンドラ
     * @returns {Object[]} バインドオブジェクトの配列
     */
    function createBindObjects(controller, eventHandlerInfo, func) {
        var selector = eventHandlerInfo.selector;
        var eventName = eventHandlerInfo.eventName;
        var bindTarget = eventHandlerInfo.bindTarget;
        var isGlobal = eventHandlerInfo.isGlobal;
        var isBindRequested = eventHandlerInfo.isBindRequested;
        // ハンドラを取得(アスペクト適用済み)
        // この関数の戻り値になるバインドオブジェクトの配列
        // 結果は必ず配列になるようにする
        var bindObjects;
        switch (eventName) {
        case 'mousewheel':
            bindObjects = getNormalizeMouseWheelBindObj(controller, eventName, func);
            break;
        case EVENT_NAME_H5_TRACKSTART:
        case EVENT_NAME_H5_TRACKMOVE:
        case EVENT_NAME_H5_TRACKEND:
            bindObjects = getH5TrackBindObj(controller, eventName, func);
            // バインド対象要素またはセレクタについてトラックイベントの何れかのハンドラが初めてだった場合は、
            // h5trackxxxイベントハンドラについてのバインドオブジェクトに加えて、
            // トラックイベントをmousedown,touchstart時に有効にするためのイベントハンドラをバインド
            var context = controller.__controllerContext;
            var alreadyBound = false;
            context.h5trackEventHandlerInfos = context.h5trackEventHandlerInfos || [];
            var h5trackEventHandlerInfos = context.h5trackEventHandlerInfos;
            for (var i = 0, l = h5trackEventHandlerInfos.length; i < l; i++) {
                var info = h5trackEventHandlerInfos[i];
                if (bindTarget) {
                    // ターゲット指定の場合はbindTargetを比較
                    if (isSameBindTarget(bindTarget, info.bindTarget)) {
                        alreadyBound = true;
                        break;
                    }
                } else {
                    // セレクタを指定された場合は、セレクタと、グローバル指定かどうかと、isBindRequested指定を比較
                    if (selector === info.selector && isGlobal === info.isGlobal
                            && isBindRequested === info.isBindRequested) {
                        alreadyBound = true;
                        break;
                    }
                }
            }
            if (!alreadyBound) {
                bindObjects = getBindObjForEnableH5track(controller).concat(bindObjects);
                h5trackEventHandlerInfos.push(eventHandlerInfo);
            }
            break;
        default:
            bindObjects = getNormalBindObj(controller, eventName, func);
            break;
        }
        // 配列にする
        if (!isArray(bindObjects)) {
            bindObjects = [bindObjects];
        }

        // イベントコンテキストを作成してからハンドラを呼び出すようにhandlerをラップする
        // unbindListにラップしたものが登録されるように、このタイミングで行う必要がある
        function wrapHandler(bindObj) {
            var handler = bindObj.handler;
            var c = bindObj.controller;
            // h5track*のオフセット計算等のためにすでにhandlerにはFW側でラップ済みの関数を持っている場合がある
            // その場合は、bindObj.originalHandlerにすでにラップ前の関数を持たせてある
            if (!bindObj.originalHandler) {
                bindObj.originalHandler = handler;
            }
            bindObj.handler = function(/* var args */) {
                // isNativeBindがtrue(addEventListenerによるバインド)なら、イベントハンドラのthisをイベントハンドラの第2引数にする。
                // (DOM要素でないものはlistenerElementTypeに関わらずjQueryで包まない)
                // isNativeBindがfalse(jQueryのbindまたはdelegateによるバインド)なら
                // listenerElementTypeが1ならjQueryオブジェクト、そうでないならDOM要素(イベントハンドラのthis)を、イベントハンドラの第2引数にする
                // jQuery1.6.4の場合、currentTargetに正しく値が設定されていない場合があるため、
                // currentTargetではなくthisを使用している。(issue#338)
                var currentTargetShortcut = !bindObj.isNativeBind
                        && settings.listenerElementType === 1 ? $(this) : this;
                handler.call(c, createEventContext(bindObj, arguments), currentTargetShortcut);
            };
        }

        for (var i = 0, l = bindObjects.length; i < l; i++) {
            var bindObject = bindObjects[i];
            // handlerをラップ
            wrapHandler(bindObject);
            // eventHandlerInfoから、bindObjに必要なものを持たせる
            bindObject.isBindRequested = isBindRequested;
            bindObject.isGlobal = isGlobal;
            bindObject.bindTarget = bindTarget;
            bindObject.selector = selector;
            // コントローラを持たせる
            bindObject.controller = controller;
        }
        return bindObjects;
    }

    /**
     * バインドオブジェクトに基づいてイベントハンドラをバインドします。
     *
     * @private
     * @param {Object} bindObj バインドオブジェクト
     * @param {Document} doc documentオブジェクト
     */
    function bindByBindObject(bindObj, doc) {
        var controller = bindObj.controller;
        var rootElement = controller.rootElement;
        var selector = bindObj.selector;
        var eventName = bindObj.eventName;
        var handler = bindObj.handler;
        var useBind = bindObj.isBindRequested;
        var isGlobal = bindObj.isGlobal;
        var bindTarget = bindObj.bindTarget;

        if (bindTarget) {
            // bindTargetが指定されている場合は必ず直接バインド
            bindObj.evSelectorType = SELECTOR_TYPE_CONST.SELECTOR_TYPE_OBJECT;
            bindEvent(bindObj);
        } else if (isGlobal) {
            // グローバルなセレクタの場合
            var selectTarget = getGlobalSelectorTarget(selector, doc, controller);

            // バインド対象がオブジェクト、または直接バインド指定の場合、必ず直接バインドする
            if (useBind || !isString(selectTarget)) {
                // bindObjにselectorTypeを登録する
                bindObj.evSelectorType = SELECTOR_TYPE_CONST.SELECTOR_TYPE_OBJECT;

                bindObj.bindTarget = isString(selectTarget) ? $(selectTarget) : selectTarget;
                bindEvent(bindObj);
            } else {
                // bindObjにselectorTypeを登録する
                bindObj.evSelectorType = SELECTOR_TYPE_CONST.SELECTOR_TYPE_GLOBAL;

                $(doc).delegate(selectTarget, eventName, handler);
            }
            // selectorがグローバル指定の場合はcontext.selectorに{}を取り除いた文字列を格納する
            // selectorがオブジェクト指定(rootElement, window, document)の場合はオブジェクトを格納する
            bindObj.evSelector = selectTarget;
        } else {
            // selectorがグローバル指定でない場合
            // bindObjにselectorTypeを登録し、selectorは文字列を格納する
            bindObj.evSelectorType = SELECTOR_TYPE_CONST.SELECTOR_TYPE_LOCAL;
            bindObj.evSelector = selector;

            if (useBind) {
                bindObj.bindTarget = $(selector, rootElement);
                bindEvent(bindObj);
            } else {
                $(rootElement).delegate(selector, eventName, handler);
            }
        }

        // bindEventで、bindTargetが不正なためバインドできなかった場合は以降何もしない
        // (bindHandlersに不要なものを残さないようにするため)
        if (bindObj.isBindCanceled) {
            return;
        }

        // アンバインドマップにハンドラを追加
        // バインドした場合はバインドした要素・オブジェクトをbindTargetに覚えておく
        registerWithBoundHandlers(bindObj);

        // h5trackstartのバインド先のstyle.touchActionにh5.settings.trackstartTouchActionの値(デフォルト'none')を設定する
        // touchActionをサポートしていないなら何もしない
        // h5.settings.trackstartTouchActionがnullなら何もしない
        // TODO プラッガブル(どのイベントの時にどういう処理をするか)が設定できるようにする
        if (isTouchActionSupported && eventName === EVENT_NAME_H5_TRACKSTART
                && settings.trackstartTouchAction != null) {
            var $trackTarget = isGlobal ? $(bindObj.evSelector, doc) : $(bindObj.evSelector,
                    rootElement);
            $trackTarget.each(function() {
                this.style[touchActionProp] = settings.trackstartTouchAction;
            });
        }
    }

    /**
     * バインドオブジェクトに基づいてイベントハンドラをアンバインドします。
     *
     * @private
     * @param {Object} bindObj バインドオブジェクト
     * @param {Document} doc documentオブジェクト
     * @param {Boolean} shouldNotUnregister boundHandlersから指定されたバインドオブジェクトを削除しない時にtrueを指定する
     */
    function unbindByBindObject(bindObj, doc, shouldNotUnregister) {
        var controller = bindObj.controller;
        var rootElement = controller.rootElement;
        var selector = bindObj.selector;
        var handler = bindObj.handler;
        var eventName = bindObj.eventName;
        var isGlobal = bindObj.isGlobal;
        var bindTarget = bindObj.bindTarget;
        if (bindTarget) {
            // オブジェクトまたは直接バインド指定されていた場合(===バインド時にbindメソッドを使った場合)は直接unbind
            unbindEvent(bindObj);
        } else if (isGlobal) {
            if (getWindowOfDocument(doc) == null) {
                // アンバインドする対象のdocumentがもうすでに閉じられている場合は何もしない
                return;
            }
            $(doc).undelegate(selector, eventName, handler);
        } else {
            $(rootElement).undelegate(selector, eventName, handler);
        }
        if (!shouldNotUnregister) {
            // バインド中のハンドラリストから削除
            var boundHandlers = controller.__controllerContext.boundHandlers;
            boundHandlers.splice($.inArray(bindObj, boundHandlers), 1);
        }
    }

    /**
     * バインドマップに基づいてイベントハンドラをアンバインドします。
     *
     * @private
     * @param {Controller} controller コントローラ
     */
    function unbindEventHandlers(controller) {
        var rootElement = controller.rootElement;
        if (!rootElement) {
            // ルートエレメントが設定される前のunbind(=イベントハンドリング前)なら何もしない
            return;
        }

        // ドキュメントはrootElementのownerDocument。rootElement自体がdocumentノードならrootElement。
        var doc = getDocumentOf(rootElement);
        var boundHandlers = controller.__controllerContext.boundHandlers;

        for (var i = 0, l = boundHandlers.length; i < l; i++) {
            var bindObj = boundHandlers[i];
            unbindByBindObject(bindObj, doc, true);
        }
        // バインド中のハンドラリストを空にする
        controller.__controllerContext.boundHandlers = [];
    }

    /**
     * 指定されたフラグで子コントローラを含む全てのコントローラのexecuteListenersフラグを変更します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Boolean} flag フラグ
     */
    function setExecuteListenersFlag(controller, flag) {
        doForEachControllerGroups(controller, function(c) {
            c.__controllerContext.executeListeners = flag;
        });
    }

    /**
     * コントローラに定義されたライフサイクルイベントを呼び出す関数を作成する
     *
     * @param {Controller} controller
     * @param {String} funcName __init, __postInit, __ready のいずれか
     * @param {Function} callback ライフサイクルイベントの実行が終わった時(非同期ならresolveされた時)に実行する関数
     * @returns {Function}
     */
    function createLifecycleCaller(controller, funcName, callback) {
        return function() {
            var ret = null;
            var lifecycleFunc = controller[funcName];
            var controllerName = controller.__name;
            var isAlreadyExecuted = false;
            if (funcName === '__init') {
                isAlreadyExecuted = controller.isInit;
            } else if (funcName === '__postInit') {
                isAlreadyExecuted = controller.isPostInit;
            } else {
                isAlreadyExecuted = controller.isReady;
            }
            if (!isAlreadyExecuted && lifecycleFunc) {
                try {
                    ret = controller[funcName](createInitializationContext(controller));
                } catch (e) {
                    // ライフサイクルイベントの呼び出しで例外が投げられた
                    fwLogger.error(FW_LOG_INIT_CONTROLLER_THROWN_ERROR, controllerName, funcName);

                    // controllerをdispose
                    disposeController(controller, e);
                }
            }
            if (ret && isFunction(ret.done) && isFunction(ret.fail)) {
                // ライフサイクルイベントがpromiseを返している場合
                // resolveされたらcallbackを実行
                ret.done(callback).fail(
                        function(/* var_args */) {
                            // rejectされた場合は連鎖的にdisposeする
                            fwLogger.error(FW_LOG_INIT_CONTROLLER_REJECTED, controllerName,
                                    funcName);
                            fwLogger.error(FW_LOG_INIT_CONTROLLER_ERROR,
                                    controller.rootController.__name);

                            var rejectReason = createRejectReason(
                                    ERR_CODE_CONTROLLER_INIT_REJECTED_BY_USER, controllerName,
                                    argsToArray(arguments));

                            // controllerをdispose
                            disposeController(controller.rootController, null, rejectReason);
                        });
            } else {
                // callbackを実行
                callback();
            }
        };
    }

    /**
     * 非同期で実行するライフサイクル(__init, __postInit, __ready)イベントを実行する
     *
     * @private
     * @param {Controller} controller コントローラ(ルートコントローラ)
     * @returns {Promise[]} Promiseオブジェクト
     * @param {String} funcName 非同期で実行するライフサイクル関数名。__init, __postInit, __readyのいずれか。
     */
    function executeLifecycleEventChain(controller, funcName) {
        function execInner(c) {
            var callback, promises;

            // ライフサイクルイベント名で場合分けして、待機するプロミスの取得と実行するコールバックの作成を行う
            // __postInit, __readyは子から先に実行する
            if (funcName === '__init') {
                callback = createCallbackForInit(c);
                promises = getPromisesForInit(c);
            } else if (funcName === '__postInit') {
                callback = createCallbackForPostInit(c);
                promises = getPromisesForPostInit(c);
            } else {
                callback = createCallbackForReady(c);
                promises = getPromisesForReady(c);
            }

            // waitForPromisesで全てのプロミスが終わってからライフサイクルイベントの呼び出しを行う
            // promisesの中にpendingのpromiseが無い場合(空または全てのプロミスがresolve/reject済み)の場合、
            // ライフサイクルイベントの呼び出しは同期的に呼ばれる
            // ライフサイクルイベントの待機プロミスはコントローラに覚えさせておく
            // (unmanageChild時で待機プロミスが減った時に対応するため)
            var context = controller.__controllerContext;
            context.waitingPromisesManagerMap = context.waitingPromsiesManager || {};
            context.waitingPromisesManagerMap[funcName] = waitForPromises(promises,
                    createLifecycleCaller(c, funcName, callback));
        }
        // すでにpromisesのいずれかが失敗している場合は、失敗した時にdisposeされているはず
        // disopseされていたら何もしない
        if (isDisposing(controller)) {
            return;
        }
        doForEachControllerGroups(controller, execInner);
    }

    /**
     * __initイベントを実行するために必要なPromiseを返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Promise[]} Promiseオブジェクト
     */
    function getPromisesForInit(controller) {
        // 自身のテンプレート用Promiseオブジェクトと、親コントローラのinitPromiseオブジェクトを返す
        var promises = [controller.preInitPromise];
        if (controller.parentController) {
            promises.push(controller.parentController.initPromise);
        }
        return promises;
    }

    /**
     * __postInitイベントを実行するために必要なPromiseを返します
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Promise[]} Promiseオブジェクト
     */
    function getPromisesForPostInit(controller) {
        // 子コントローラのpostInitPromiseを取得
        var promises = getChildControllerPromises(controller, 'postInitPromise');
        promises.push(controller.initPromise);
        return promises;
    }

    /**
     * __readyイベントを実行するために必要なPromiseを返します
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Promise[]} Promiseオブジェクト
     */
    function getPromisesForReady(controller) {
        // 子コントローラのreadyPromiseを取得
        var promises = getChildControllerPromises(controller, 'readyPromise');
        promises.push(controller.postInitPromise);
        return promises;
    }

    /**
     * __init実行後に実行するコールバック関数を返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Function} 次に実行する__initを知らせるために、子コントローラの配列を返す関数を返します
     */
    function createCallbackForInit(controller) {
        return function() {
            // disopseまたはunbindされていたら何もしない
            if (isUnbinding(controller)) {
                return;
            }

            /**
             * 全コントローラのinitが終わっているかどうかチェックする関数
             *
             * @private
             * @returns {boolean}
             */
            function isAllInitExecuted() {
                // __initは親から順に実行しているので、コントローラがリーフノードの場合のみチェックすればよいが、
                // 動的に子コントローラが追加される場合もあるため、いずれのコントローラの__initが完了た場合もチェックする
                var ret = true;
                doForEachControllerGroups(controller.rootController, function(c) {
                    ret = c.isInit;
                    return ret;
                });
                return ret;
            }

            if (controller.isInit) {
                // このコントローラの__init後の処理がすでに実行済みであれば
                // 全コントローラの__initが終わっているかどうかチェックして__postInitを呼び出す
                if (isAllInitExecuted()) {
                    triggerPostInit(controller.rootController);
                }
                return;
            }
            // isInitフラグを立てる
            controller.isInit = true;
            var initDfd = controller.__controllerContext.initDfd;
            // FW、ユーザともに使用しないので削除
            delete controller.__controllerContext.templatePromise;
            delete controller.__controllerContext.preInitDfd;
            delete controller.__controllerContext.initDfd;

            // 子コントローラのrootElementとviewを設定
            var rootElement = controller.rootElement;

            // 子コントローラ
            try {
                var meta = controller.__meta;
                var childControllers = controller.__controllerContext.childControllers;
                // メタのルートエレメント定義とコントローラインスタンスの紐付け
                for ( var p in meta) {
                    if ($.inArray(controller[p], childControllers) !== -1) {
                        // 子コントローラに一時的にルートエレメントのメタ定義を持たせる
                        controller[p].__controllerContext.metaRootElement = meta[p]
                                && meta[p].rootElement;
                    }
                }
                // ルートコントローラはrootElement設定済み
                doForEachChildControllers(controller, function(c, parent) {
                    var metaRootElement = c.__controllerContext.metaRootElement;
                    delete c.__controllerContext.metaRootElement;

                    if (c.rootElement) {
                        // ルートエレメント設定済みなら何もしない
                        // (manageChildによる動的子コントローラの場合など、再設定しないようにする)
                        return;
                    }

                    // ルートエレメントが__metaで指定されている場合は指定箇所、
                    // そうでない場合は親と同じルートエレメントをターゲットにする
                    var target = metaRootElement ? getBindTarget(metaRootElement, c, controller)
                            : rootElement;
                    // バインド箇所決定後には不要なので削除
                    // ターゲット要素のチェック
                    validateTargetElement(target, c.__controllerContext.controllerDef, c.__name);
                    // ルートエレメントの設定
                    c.rootElement = target;
                    // コントローラのviewにコントローラを設定
                    c.view.__controller = c;
                });
            } catch (e) {
                // エラーが起きたらコントローラをdispose
                disposeController(controller, e);
                return;
            }

            // initDfdをresolveする前に、この時点でコントローラツリー上の__initが終わっているかどうかチェック
            var shouldTriggerPostInit = isAllInitExecuted();

            // resolveして、次のコールバックがあれば次を実行
            initDfd.resolveWith(controller);

            // initPromiseのdoneハンドラでunbindされているかどうかチェック
            // unbindされていなくて全コントローラの__initが終わっていたら__postInitを呼び出す
            if (!isUnbinding(controller) && shouldTriggerPostInit) {
                triggerPostInit(controller.rootController);
            }
        };
    }

    /**
     * __postInitイベントで実行するコールバック関数を返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Function} コールバック関数
     */
    function createCallbackForPostInit(controller) {
        return function() {
            // disopseまたはunbindされていたら何もしない。
            if (isUnbinding(controller)) {
                return;
            }
            controller.isPostInit = true;

            // 動的に追加された子コントローラに対応するため、
            // 再度子コントローラのpostInitプロミスを取得して、その完了を待ってからpostInitDfdをresolveする
            var context = controller.__controllerContext;
            context.waitingPromsiesManager = context.waitingPromsiesManager || {};
            context.waitingPromsiesManager['__postInit'] = waitForPromises(
                    getPromisesForPostInit(controller), function() {
                        // unbindまたはdisposeされたかチェック
                        if (isUnbinding(controller)) {
                            return;
                        }
                        var postInitDfd = context.postInitDfd;
                        if (!postInitDfd) {
                            // 既に削除済み(=resolve済み)の場合は、以降の処理は実行済みなので何もしない
                            return;
                        }
                        // FW、ユーザともに使用しないので削除してresolve
                        delete context.postInitDfd;
                        postInitDfd.resolveWith(controller);
                        // postInitPromiseのdoneハンドラでunbindまたはdisposeされている場合は何もしない
                        // また、すでにバインド実行済みなら何もしない
                        if (isUnbinding(controller) || context.isExecutedBind) {
                            return;
                        }
                        if (!context.isRoot) {
                            // 子コントローラの場合
                            if (!controller.rootController.isPostInit) {
                                // 通常、この時点ではルートのpostInitは未完了であり、
                                // 以降の処理(イベントハンドラのバインドとtriggerReady)は、
                                // ルートのpostInit後の処理で行うので何もしない
                                return;
                            }
                            // ただし、例えばrootの__readyのタイミングでこのコントローラがmanageChildで子コントローラになったなどの場合は、
                            // この時点でルートのpostInit後の処理が終わっている。
                            // その場合、このコントローラのイベントハンドラのバインドは自分で行い、
                            // かつこのコントローラの__readyを実行するためtriggerReadyを呼び出す必要がある
                            if (!controller.parentController.__meta
                                    || controller.parentController.__meta.userHandlers !== false) {
                                bindByBindMap(controller);
                            }
                            triggerReady(controller.rootController);
                            return;
                        }
                        // ルートコントローラなら次のフェーズへ
                        // イベントハンドラのバインド
                        // メタのuseHandlers定義とコントローラインスタンスの紐付け
                        var meta = controller.__meta;
                        var childControllers = context.childControllers;
                        for ( var p in meta) {
                            if ($.inArray(controller[p], childControllers) !== -1) {
                                // 子コントローラに一時的にルートエレメントのメタ定義を持たせる
                                controller[p].__controllerContext.metaUseHandlers = meta[p]
                                        && meta[p].useHandlers;
                            }
                        }
                        doForEachControllerGroups(controller, function(c, parent) {
                            var metaUseHandlers = c.__controllerContext.metaUseHandlers;
                            delete c.__controllerContext.metaUseHandlers;
                            // バインド処理をしたかどうか
                            // manageChildによる動的子コントローラについて２重にバインドしないためのフラグ
                            if (c.__controllerContext.isExecutedBind) {
                                return;
                            }
                            c.__controllerContext.isExecutedBind = true;

                            if (metaUseHandlers !== false) {
                                // 親のuseHandlersでfalseが指定されていなければバインドを実行する
                                bindByBindMap(c);
                            }
                        });
                        // managed!==falseの場合のみh5controllerboundをトリガ
                        // (managedがfalseならコントローラマネージャの管理対象ではないため、h5controllerboundイベントをトリガしない)
                        if (context.managed !== false) {
                            // h5controllerboundイベントをトリガ.
                            $(controller.rootElement).trigger('h5controllerbound', controller);
                            if (isUnbinding(controller)) {
                                // イベントハンドラでunbindされたら終了
                                return;
                            }
                        }
                        // __readyの実行
                        triggerReady(controller);
                    });
            return;
        };
    }

    /**
     * __readyイベントで実行するコールバック関数を返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Function} コールバック関数
     */
    function createCallbackForReady(controller) {
        return function() {
            // disopseまたはunbindされていたら何もしない。
            if (isUnbinding(controller)) {
                return;
            }
            controller.isReady = true;

            // 動的に追加された子コントローラに対応するため、
            // 再度子コントローラのreadyプロミスを取得して、その完了を待ってからreadyDfdをresolveする
            var context = controller.__controllerContext;
            context.waitingPromsiesManager = context.waitingPromsiesManager || {};
            context.waitingPromsiesManager['__ready'] = waitForPromises(
                    getPromisesForReady(controller), function() {
                        // unbind,disposeされた場合は何もしない
                        if (isUnbinding(controller)) {
                            return;
                        }

                        var readyDfd = context.readyDfd;
                        if (!readyDfd) {
                            // 既に削除済み(=resolve済み)の場合は、以降の処理は実行済みなので何もしない
                            return;
                        }
                        // FW、ユーザともに使用しないので削除してresolve
                        delete context.readyDfd;
                        readyDfd.resolveWith(controller);

                        // readyPromiseのdoneハンドラでunbindまたはdisposeされている場合は何もしない
                        // また、ルートコントローラでない場合も何もしない
                        if (isUnbinding(controller) || !context.isRoot) {
                            return;
                        }
                        // ルートコントローラであれば全ての処理が終了したことを表すイベント"h5controllerready"をトリガ
                        $(controller.rootElement).trigger('h5controllerready', controller);
                    });
        };
    }

    /**
     * 指定された要素が文字列があれば、ルートエレメント、{}記法を考慮した要素をjQueryオブジェクト化して返します。 DOM要素、jQueryオブジェクトであれば、
     * jQueryオブジェクト化して(指定要素がjQueryオブジェクトの場合、無駄な処理になるがコスト的には問題ない)返します。
     *
     * @private
     * @param {String|DOM|jQuery} element セレクタ、DOM要素、jQueryオブジェクト
     * @param {Controlelr} controller
     * @returns {jQuery} jQueryオブジェクト
     */
    function getTarget(element, controller) {
        if (!isString(element)) {
            return $(element);
        }
        var selector = $.trim(element);
        if (isGlobalSelector(selector)) {
            var s = trimGlobalSelectorBracket(selector);
            return $(getGlobalSelectorTarget(s, getDocumentOf(controller.rootElement), controller));
        }
        return $(controller.rootElement).find(element);
    }

    /**
     * ハンドラをバインド済みリストに登録します。
     *
     * @private
     * @param {Object} bindObj
     * @param {Object} eventHandlerInfo イベントハンドラ情報
     */
    function registerWithBoundHandlers(bindObj) {
        bindObj.controller.__controllerContext.boundHandlers.push(bindObj);
    }

    /**
     * バインドオブジェクトを返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {String} selector セレクタ
     * @param {String} eventName イベント名
     * @param {Function} func ハンドラとして登録したい関数
     * @returns {Object} バインドオブジェクト
     *          <ul>
     *          <li>bindObj.controller - コントローラ</li>
     *          <li>bindObj.selector - セレクタ</li>
     *          <li>bindObj.eventName - イベント名</li>
     *          <li>bindObj.handler - イベントハンドラ</li>
     *          </ul>
     */
    function getNormalBindObj(controller, eventName, func) {
        return {
            controller: controller,
            eventName: eventName,
            handler: func
        };
    }

    /**
     * クラスブラウザな"mousewheel"イベントのためのバインドオブジェクトを返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {String} eventName イベント名
     * @param {Function} func ハンドラとして登録したい関数
     * @returns {Object} バインドオブジェクト
     *          <ul>
     *          <li>bindObj.controller - コントローラ</li>
     *          <li>bindObj.eventName - イベント名</li>
     *          <li>bindObj.handler - イベントハンドラ</li>
     *          </ul>
     */
    function getNormalizeMouseWheelBindObj(controller, eventName, func) {
        return {
            controller: controller,
            // Firefoxには"mousewheel"イベントがない
            eventName: typeof document.onmousewheel === TYPE_OF_UNDEFINED ? 'DOMMouseScroll'
                    : eventName,
            handler: function(context) {
                var event = context.event;
                // jQuery1.7以降ではwheelDeltaとdetailがjQueryEventにコピーされない。
                // hifive側でoriginalEventから取った値をコピーする
                if (event.wheelDelta == null && event.originalEvent
                        && event.originalEvent.wheelDelta != null) {
                    event.wheelDelta = event.originalEvent.wheelDelta;
                }
                // Firefox用
                // wheelDeltaが無く、かつdetailに値がセットされているならwheelDeltaにdetailから計算した値を入れる
                if (event.wheelDelta == null && event.originalEvent
                        && event.originalEvent.detail != null) {
                    event.wheelDelta = -event.originalEvent.detail * 40;
                }
                func.call(controller, context);
            }
        };
    }

    /**
     * hifiveの独自イベント"h5trackstart", "h5trackmove", "h5trackend"のためのバインドオブジェクトを返します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {String} eventName イベント名 h5trackstart,h5trackmove,h5trackendのいずれか
     * @param {Function} func ハンドラとして登録したい関数
     * @returns {Object|Object[]} バインドオブジェクト
     *          <ul>
     *          <li>bindObj.controller - コントローラ</li>
     *          <li>bindObj.eventName - イベント名</li>
     *          <li>bindObj.handler - イベントハンドラ</li>
     *          </ul>
     */
    function getH5TrackBindObj(controller, eventName, func) {
        var normalBindObj = null;
        if (eventName === EVENT_NAME_H5_TRACKSTART) {
            // h5trackstartの場合
            return getNormalBindObj(controller, eventName, func);
        }
        // h5trackmove,h5trackendの場合は、ハンドラ呼び出し前にオフセット計算処理を行うようラップする
        normalBindObj = getNormalBindObj(controller, eventName, function(context) {
            var event = context.event;
            var h5DelegatingEvent = event.h5DelegatingEvent;
            if (!h5DelegatingEvent) {
                // マウスやタッチではなくtriggerで呼ばれた場合はオフセット正規化はしない
                return func.apply(this, arguments);
            }
            // マウスイベントによる発火なら場合はオフセットを正規化する
            var originalEventType = h5DelegatingEvent.type;
            if (originalEventType === 'mousemove' || originalEventType === 'mouseup') {
                var offset = $(event.currentTarget).offset() || {
                    left: 0,
                    top: 0
                };
                event.offsetX = event.pageX - offset.left;
                event.offsetY = event.pageY - offset.top;
            }
            func.apply(this, arguments);
        });
        // ラップした関数をhandlerに持たせるので、ラップ前をoriginalHandlerに覚えておく
        // ogirinalHandlerにはユーザが指定した関数と同じ関数(ラップ前)を持っていないとoff()でアンバインドできないため
        normalBindObj.originalHandler = func;
        return normalBindObj;
    }

    /**
     * hifiveの独自イベント"h5trackstart", "h5trackmove", "h5trackend"を対象のコントローラで有効にするためのハンドラを返します
     * <p>
     * h5trackハンドラは、mousedown,touchstartt時に動的にバインドし、mouseend,touchend時に動的にアンバインドしています。
     * </p>
     * <p>
     * この挙動を有効にするためのバインドオブジェクトを生成して返します。
     * </p>
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {string} selector セレクタ
     * @returns {Object[]} バインドオブジェクトの配列 mousedown,touchstartのバインドオブジェクト(touchが無い場合はmousedonwのみ)
     *          <ul>
     *          <li>bindObj.controller - コントローラ</li>
     *          <li>bindObj.selector - セレクタ</li>
     *          <li>bindObj.eventName - イベント名</li>
     *          <li>bindObj.handler - イベントハンドラ</li>
     *          </ul>
     */
    function getBindObjForEnableH5track(controller, selector) {
        // タッチイベントがあるかどうか
        var hasTouchEvent = typeof document.ontouchstart !== TYPE_OF_UNDEFINED;
        function getEventType(en) {
            switch (en) {
            case 'touchstart':
            case 'mousedown':
                return EVENT_NAME_H5_TRACKSTART;
            case 'touchmove':
            case 'mousemove':
                return EVENT_NAME_H5_TRACKMOVE;
            case 'touchend':
            case 'mouseup':
                return EVENT_NAME_H5_TRACKEND;
            }
        }

        // jQuery.Eventオブジェクトのプロパティをコピーする。
        // 1.6.xの場合, "liveFired"というプロパティがあるがこれをコピーしてしまうとtriggerしてもイベントが発火しない。
        function copyEventObject(src, dest) {
            for ( var prop in src) {
                if (src.hasOwnProperty(prop) && !dest[prop] && prop !== 'target'
                        && prop !== 'currentTarget' && prop !== 'originalEvent'
                        && prop !== 'liveFired') {
                    dest[prop] = src[prop];
                }
            }
            dest.h5DelegatingEvent = src;
        }

        var $document = $(getDocumentOf(controller.rootElement));

        // h5trackendイベントの最後でハンドラの除去を行う関数を格納するための変数
        var removeHandlers = null;
        var execute = false;
        function getHandler(en, eventTarget, setup) {
            return function(context) {
                var type = getEventType(en);
                var isStart = type === EVENT_NAME_H5_TRACKSTART;
                if (isStart && execute) {
                    // スタートイベントが起きた時に実行中 = マルチタッチされた時なので、何もしない
                    return;
                }

                // タッチイベントかどうか
                var isTouch = context.event.type.indexOf('touch') === 0;
                if (isTouch) {
                    // タッチイベントの場合、イベントオブジェクトに座標系のプロパティを付加
                    initTouchEventObject(context.event, en);
                }
                var newEvent = new $.Event(type);
                copyEventObject(context.event, newEvent);
                var target = context.event.target;
                if (eventTarget) {
                    target = eventTarget;
                }
                if (setup) {
                    setup(newEvent);
                }

                // ------------- h5track*のトリガ処理 -------------
                // originalEventがあればoriginalEvent、なければjQueryEventオブジェクトでh5track*をトリガしたかどうかのフラグを管理する
                var triggeredFlagEvent = context.event.originalEvent || context.event;

                if (isStart && $.inArray(triggeredFlagEvent, storedEvents) === -1) {
                    // スタート時で、かつこのスタートイベントがstoredEventsに入っていないなら
                    // トリガする前にトリガフラグ保管イベントのリセット(storedEventsに不要なイベントオブジェクトを残さないため)
                    storedEvents = [];
                    h5trackTriggeredFlags = [];
                }

                var index = $.inArray(triggeredFlagEvent, storedEvents);
                if (index === -1) {
                    // storedEventsにイベントが登録されていなければ追加し、トリガ済みフラグにfalseをセットする
                    index = storedEvents.push(triggeredFlagEvent) - 1;
                    h5trackTriggeredFlags[index] = false;
                }
                // sotredEventsにイベントが登録されていれば、そのindexからトリガ済みフラグを取得する
                var triggeredFlag = h5trackTriggeredFlags[index];

                if (!triggeredFlag && (!isTouch || execute || isStart)) {
                    // 親子コントローラで複数のイベントハンドラが同じイベントにバインドされているときに、
                    // それぞれがトリガしてイベントハンドラがループしないように制御している。
                    // マウス/タッチイベントがh5track*にトリガ済みではない時にトリガする。
                    // タッチイベントの場合、h5track中でないのにmoveやtouchendが起きた時は何もしない。
                    // タッチイベントの場合はターゲットにバインドしており(マウスの場合はdocument)、
                    // バブリングによって同じイベントが再度トリガされるのを防ぐためである。

                    // トリガ済みフラグを立てる
                    h5trackTriggeredFlags[index] = true;
                    // h5track*イベントをトリガ
                    $(target).trigger(newEvent, context.evArg);
                    execute = true;
                }

                // 不要なイベントオブジェクトを残さないため、
                // documentだったら現在のイベントとそのフラグをstoredEvents/h5trackTriggeredFlagsから外す
                // h5trackend時ならstoredEvents/h5trackTtriggeredFlagsをリセットする
                // (※ documentまでバブリングすればイベントオブジェクトを保管しておく必要がなくなるため)
                if (context.event.currentTarget === document) {
                    if (type === EVENT_NAME_H5_TRACKEND) {
                        storedEvents = [];
                        h5trackTriggeredFlags = [];
                    }
                    var storedIndex = $.inArray(triggeredFlagEvent, storedEvents);
                    if (storedIndex !== -1) {
                        storedEvents.splice(index, 1);
                        h5trackTriggeredFlags.splice(index, 1);
                    }
                }
                // ------------- h5track*のトリガ処理 ここまで -------------

                if (isStart && execute) {
                    // スタートイベント、かつ今h5trackstartをトリガしたところなら、
                    // h5trackmove,endを登録

                    // トラック操作で文字列選択やスクロールなどが起きないように元のイベントのpreventDefault()を呼ぶ
                    // ただし、h5trackstartがpreventDefault()されていたら、元のイベントのpreventDefault()は呼ばない
                    if (!newEvent.isDefaultPrevented()) {
                        newEvent.h5DelegatingEvent.preventDefault();
                    }
                    var nt = newEvent.target;

                    // 直前のh5track系イベントとの位置の差分を格納
                    var ox = newEvent.clientX;
                    var oy = newEvent.clientY;
                    var setupDPos = function(ev) {
                        var cx = ev.clientX;
                        var cy = ev.clientY;
                        ev.dx = cx - ox;
                        ev.dy = cy - oy;
                        ox = cx;
                        oy = cy;
                    };

                    // h5trackstart実行時に、move、upのハンドラを作成して登録する。
                    // コンテキストをとるように関数をラップして、bindする。
                    // touchstartで発火したならtouchstart,touchendにバインド、
                    // そうでない場合(mousedown)ならmousemove,mousenendにバインド
                    var moveEventType = isTouch ? 'touchmove' : 'mousemove';
                    var endEventType = isTouch ? 'touchend' : 'mouseup';
                    var moveHandler = getHandler(moveEventType, nt, setupDPos);
                    var upHandler = getHandler(endEventType, nt);
                    var moveHandlerWrapped = function(e) {
                        context.event = e;
                        context.evArg = handlerArgumentsToContextEvArg(arguments);
                        moveHandler(context);
                    };
                    var upHandlerWrapped = function(e) {
                        context.event = e;
                        context.evArg = handlerArgumentsToContextEvArg(arguments);
                        upHandler(context);
                    };

                    // タッチならイベントの起きた要素、マウスならdocumentにバインド
                    var $bindTarget = isTouch ? $(nt) : $document;
                    // moveとendのunbindをする関数
                    removeHandlers = function() {
                        storedEvents = [];
                        h5trackTriggeredFlags = [];
                        $bindTarget.unbind(moveEventType, moveHandlerWrapped);
                        $bindTarget.unbind(endEventType, upHandlerWrapped);
                        if (!isTouch && controller.rootElement !== document) {
                            $(controller.rootElement).unbind(moveEventType, moveHandlerWrapped);
                            $(controller.rootElement).unbind(endEventType, upHandlerWrapped);
                        }
                    };
                    // h5trackmoveとh5trackendのbindを行う
                    $bindTarget.bind(moveEventType, moveHandlerWrapped);
                    $bindTarget.bind(endEventType, upHandlerWrapped);

                    // タッチでなく、かつコントローラのルートエレメントがdocumentでなかったら、ルートエレメントにもバインドする
                    // タッチイベントでない場合、move,endをdocumentにバインドしているが、途中でmousemove,mouseupを
                    // stopPropagationされたときに、h5trackイベントを発火することができなくなる。
                    // コントローラのルートエレメント外でstopPropagationされていた場合を考慮して、
                    // ルートエレメントにもmove,endをバインドする。
                    // (ルートエレメントの内側でstopPropagationしている場合は考慮しない)
                    // (タッチの場合はターゲットはstart時の要素なので2重にバインドする必要はない)
                    if (!isTouch && controller.rootElement !== document) {
                        // h5trackmoveとh5trackendのbindを行う
                        $(controller.rootElement).bind(moveEventType, moveHandlerWrapped);
                        $(controller.rootElement).bind(endEventType, upHandlerWrapped);
                    }
                } else if (type === EVENT_NAME_H5_TRACKEND) {
                    // touchend,mousup時(=h5trackend時)にmoveとendのイベントをunbindする
                    removeHandlers();
                    execute = false;
                }
            };
        }
        function createBindObj(en) {
            return {
                controller: controller,
                selector: selector,
                eventName: en,
                handler: getHandler(en),
                // コントローラが内部で使用するハンドラ。ポイントカットなどのアスペクトの影響を受けない。
                isInnerBindObj: true
            };
        }
        var bindObjects = [createBindObj('mousedown')];
        if (hasTouchEvent) {
            // タッチがあるならタッチにもバインド
            bindObjects.push(createBindObj('touchstart'));
        }
        return bindObjects;
    }

    /**
     * 要素のオフセットを返す
     *
     * @private
     * @param {DOM} target
     * @returns {Object} offset
     */
    function getOffset(target) {
        if (target.tagName.toLowerCase() !== 'svg' || isSVGOffsetCollect()) {
            // オフセットを返す
            return $(target).offset();
        }

        // targetがSVG要素で、SVG要素のoffsetが正しくとれないブラウザの場合は自分で計算する issue #393
        var doc = getDocumentOf(target);
        var dummyRect = doc.createElementNS(SVG_XMLNS, 'rect');
        // viewBoxを考慮して、SVG要素の左上位置にrectを置くようにしている
        var viewBox = target.viewBox;
        var x = viewBox.baseVal.x;
        var y = viewBox.baseVal.y;
        dummyRect.setAttribute('x', x);
        dummyRect.setAttribute('y', y);
        dummyRect.setAttribute('width', 1);
        dummyRect.setAttribute('height', 1);
        // transformを空文字にして無効にする(cssで指定されていたとしても無効にして計算できるようにするため)
        clearTransformStyle(dummyRect);

        // ダミー要素を追加してオフセット位置を取得
        target.appendChild(dummyRect);
        var dummyRectOffset = $(dummyRect).offset();
        // ダミー要素を削除
        target.removeChild(dummyRect);

        // 取得したオフセット位置を返す
        return dummyRectOffset;
    }

    /**
     * タッチイベントのイベントオブジェクトにpageXやoffsetXといった座標系のプロパティを追加します。
     * <p>
     * touchstart/touchmove/touchendをjQuery.trigger()で発火させた場合、originalEventプロパティは存在しないので、座標系プロパティのコピーを行いません。
     * </p>
     *
     * @private
     * @param {Event} event jQuery.Eventオブジェクト
     * @param {String} eventName イベント名
     */
    function initTouchEventObject(event, eventName) {
        var originalEvent = event.originalEvent;

        if (!originalEvent) {
            return;
        }

        var touches = eventName === 'touchend' || eventName === 'touchcancel' ? originalEvent.changedTouches[0]
                : originalEvent.touches[0];
        var pageX = touches.pageX;
        var pageY = touches.pageY;
        event.pageX = originalEvent.pageX = pageX;
        event.pageY = originalEvent.pageY = pageY;
        event.screenX = originalEvent.screenX = touches.screenX;
        event.screenY = originalEvent.screenY = touches.screenY;
        event.clientX = originalEvent.clientX = touches.clientX;
        event.clientY = originalEvent.clientY = touches.clientY;

        var target = event.target;
        if (target.ownerSVGElement) {
            target = target.farthestViewportElement;
        } else if (target === window || target === document) {
            target = document.body;
        }
        var offset = getOffset(target);
        var offsetX = pageX - offset.left;
        var offsetY = pageY - offset.top;
        event.offsetX = originalEvent.offsetX = offsetX;
        event.offsetY = originalEvent.offsetY = offsetY;
    }
    /**
     * イベントオブジェクトを正規化します。
     *
     * @private
     * @param {Object} event jQuery.Eventオブジェクト
     */
    function normalizeEventObjext(event) {
        // ここはnull, undefinedの場合にtrueとしたいため、あえて厳密等価を使用していない
        if (event && event.offsetX == null && event.offsetY == null && event.pageX && event.pageY) {
            var target = event.target;
            if (target.ownerSVGElement) {
                // SVGに属する図形なら、外側のSVG要素をtargetとして扱う
                target = target.farthestViewportElement;
            } else if (target === window || target === document) {
                target = document.body;
            }
            var offset = getOffset(target);
            event.offsetX = event.pageX - offset.left;
            event.offsetY = event.pageY - offset.top;
        }
    }

    /**
     * イベントハンドラに渡された、イベントオブジェクト以降の引数を、context.evArgに格納する形に変換します
     *
     * <pre>
     * 例:
     * $elm.trigger('mouseup', [1, 2, 3]);
     * なら、イベントハンドラに渡されるイベントは、[event, 1, 2, 3]です。
     * この[1,2,3]の部分をcontext.evArgに格納してコントローラでバインドしたハンドラに渡す必要があるため、変換が必要になります。
     * </pre>
     *
     * 引数が複数(イベントオブジェクトは除く)ある場合は配列、1つしかない場合はそれをそのまま、無い場合はundefinedを返します。
     *
     * @private
     * @param {argumentsObject} args イベントハンドラに渡されたargumentsオブジェクト
     * @returns {Any} context.evArgに格納する形式のオブジェクト
     */
    function handlerArgumentsToContextEvArg(args) {
        // 1番目はイベントオブジェクトが入っているので無視して、2番目以降からをevArgに格納する形にする
        // 格納するものがないならundefined
        // 1つだけあるならそれ
        // 2つ以上あるなら配列を返す

        var evArg;
        if (args.length < 3) {
            // 引数部分が1つ以下ならargs[1]をevArgに格納（引数なしならevArgはundefined)
            evArg = args[1];
        } else {
            // 引数が2つ以上なら配列にしてevArgに格納
            evArg = argsToArray(args).slice(1);
        }
        return evArg;
    }

    /**
     * イベントコンテキストを作成します。
     *
     * @private
     * @param {Object} bindObj バインドオブジェクト
     * @param {Array} args 1番目にはjQuery.Eventオブジェクト、2番目はjQuery.triggerに渡した引数
     * @returns {EventContext}
     */
    function createEventContext(bindObj, args) {
        var event = null;
        var evArg = null;
        if (args) {
            event = args[0];
            evArg = handlerArgumentsToContextEvArg(args);
        }
        // イベントオブジェクトの正規化
        normalizeEventObjext(event);

        return new EventContext(bindObj.controller, event, evArg, bindObj.evSelector,
                bindObj.evSelectorType);
    }

    /**
     * 初期化イベントコンテキストをセットアップします。
     *
     * @private
     * @param {Controller} rootController ルートコントローラ
     * @returns {Object} argsを持つオブジェクト
     */
    function createInitializationContext(controller) {
        return {
            args: controller.__controllerContext.args
        };
    }

    /**
     * コントローラとその子孫コントローラのrootElementと、view.__controllerにnullをセットします。
     *
     * @private
     * @param {Controller} controller コントローラ
     */
    function unbindRootElement(controller) {
        doForEachControllerGroups(controller, function(c) {
            c.rootElement = null;
            c.view.__controller = null;
        });
    }

    /**
     * コントローラをバインドする対象となる要素を返します。
     *
     * @private
     * @param {String|DOM|jQuery} element セレクタ、DOM要素、もしくはjQueryオブジェクト
     * @param {Controller} controller バインドするコントローラ
     * @param {Controller} parentController 親コントローラ
     * @returns {DOM} コントローラのバインド対象である要素
     */
    function getBindTarget(element, controller, parentController) {
        if (element == null) {
            throwFwError(ERR_CODE_BIND_TARGET_REQUIRED, [controller.__name]);
        }
        var $targets;
        // elementが文字列でもオブジェクトでもないときはエラー
        if (!isString(element) && typeof element !== 'object') {
            throwFwError(ERR_CODE_BIND_TARGET_ILLEGAL, [controller.__name]);
        }
        if (parentController) {
            // 親コントローラが指定されている場合は、親のコントローラを起点に探索する
            $targets = getTarget(element, parentController);
        } else {
            $targets = $(element);
        }

        // 要素が存在しないときはエラー
        if ($targets.length === 0) {
            throwFwError(ERR_CODE_BIND_NO_TARGET, [controller.__name]);
        }
        // 要素が複数存在するときはエラー
        if ($targets.length > 1) {
            throwFwError(ERR_CODE_BIND_TOO_MANY_TARGET, [controller.__name]);
        }
        return $targets.get(0);
    }

    /**
     * __readyイベントを実行します
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Promose}
     */
    function triggerReady(controller) {
        // コントローラマネージャの管理対象に追加する
        // フレームワークオプションでコントローラマネージャの管理対象としない(managed:false)の場合、コントローラマネージャに登録しない
        var managed = controller.__controllerContext.managed;
        var controllers = controllerManager.controllers;
        if ($.inArray(controller, controllers) === -1 && managed !== false) {
            controllers.push(controller);
        }
        // __readyイベントの実行
        controller.__controllerContext.triggerReadyExecuted = true;
        executeLifecycleEventChain(controller, '__ready');
    }

    /**
     * __initイベントを実行します
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Boolean} async 同期で__initを呼ぶ場合はfalseを指定
     */
    function triggerInit(controller, async) {
        if (async === false) {
            // asyncがfalseなら同期
            executeLifecycleEventChain(controller, '__init');
            return;
        }

        // asyncにfalseが指定されていない場合は必ず非同期になるようにする
        setTimeout(
                function() {
                    // この時点でcontrollerがルートコントローラでなくなっている(__construct時などバインド後すぐにmanageChildされた)場合がある
                    // その場合はmanageChild()した側のルートコントローラのライフサイクルが完全に終わっている(===readyDfd削除まで終わっている)場合、
                    // 自分でtriggerInitする必要がある
                    // ルートのライフサイクルがまだ終わっていない場合は、親がライフサイクルを実行してくれるのでmanageChildされた側はtriggerInitしない
                    if (isUnbinding(controller)
                            || (!controller.__controllerContext.isRoot && controller.rootController.readyDfd)) {
                        return;
                    }
                    executeLifecycleEventChain(controller, '__init');
                }, 0);
    }

    /**
     * rootController, parentControllerのセットと__postInitイベントを実行します。
     *
     * @private
     * @param {Controller} controller コントローラ
     */
    function triggerPostInit(controller) {
        // __postInitイベントの実行
        controller.__controllerContext.triggerPostInitExecuted = true;
        executeLifecycleEventChain(controller, '__postInit');
    }

    /**
     * h5.core.bindController()のために必要なプロパティをコントローラに追加します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Object} param 初期化パラメータ
     */
    function initInternalProperty(controller, param) {
        doForEachControllerGroups(controller, function(c) {
            var templateDfd = getDeferred();
            templateDfd.resolve();
            var context = c.__controllerContext;
            context.templatePromise = templateDfd.promise();
            context.initDfd = getDeferred();
            context.postInitDfd = getDeferred();
            context.readyDfd = getDeferred();
            context.isUnbinding = false;
            context.isUnbinded = false;
            context.isExecutedBind = false;
            context.triggerPostInitExecuted = false;
            context.triggerReadyExecuted = false;
            context.args = param;
            c.initPromise = context.initDfd.promise();
            c.postInitPromise = context.postInitDfd.promise();
            c.readyPromise = context.readyDfd.promise();
            c.isInit = false;
            c.isPostInit = false;
            c.isReady = false;
        });
    }

    /**
     * インジケータを呼び出します。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Object} option インジケータのオプション
     * @returns {Indicator}
     */
    function callIndicator(controller, option) {
        var target = null;
        var opt = option;

        if ($.isPlainObject(opt)) {
            target = opt.target;
        } else {
            opt = {};
        }
        target = target ? getTarget(target, controller) : controller.rootElement;
        return ui.indicator.call(controller, target, opt);
    }

    /**
     * __unbind, __disposeイベントを実行します。 各コントローラの__unbind,__disposeが返すプロミスを成功かどうか変わらずに待つプロミス
     *
     * @private
     * @param {Controller} controller コントローラ(ルートコントローラ)
     * @param {String} funcName プロパティ名(__unbind | __dispose)
     * @returns {Promise[]} Promiseオブジェクト
     */
    function executeLifeEndChain(controller, funcName) {
        var promises = [];
        var error = null;
        // 深さ優先で__unbind,__disposeの実行
        doForEachControllerGroupsDepthFirst(controller, function(c) {
            if (c[funcName] && isFunction(c[funcName])) {
                try {
                    var ret = c[funcName]();
                } catch (e) {
                    // エラーが起きても__unbind,__disposeの実行のチェーンは継続させる
                    // 最初に起きたエラーを覚えておいて、それ以降に起きたエラーは無視
                    error = error || e;
                }
                if (isPromise(ret)) {
                    promises.push(ret);
                }
            }
        });
        if (error) {
            // __unbind,__disposeで例外が発生した場合はエラーを投げる
            // (executeLifeEndChainの呼び出し元で拾っている)
            throw error;
        }
        return promises;
    }

    /**
     * オブジェクトのhasOwnPropertyがtrueのプロパティ全てにnullを代入します。
     * <p>
     * ネストしたオブジェクトへのnull代入は行いません
     * </p>
     *
     * @private
     * @param {Object} obj
     */
    function nullify(obj) {
        for ( var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                obj[prop] = null;
            }
        }
    }

    /**
     * コントローラのリソース解放処理を行います。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Error} e エラーオブジェクト(正常時は無し)。エラーオブジェクトが指定されている場合は、dispose処理後にthrowする。
     * @param {Object} rejectReason プロミスのfailハンドラに渡すオブジェクト(正常時は無し)
     * @returns promise(ただしエラーがある場合はdispose処理が終わった後にエラーを投げて終了します)
     */
    function disposeController(controller, e, rejectReason) {
        // rootControllerの取得
        // rootControllerが設定される前(__construct内からdispose()を呼び出した場合)のことを考慮して、
        // rootControllerを取得する前にisRootを見てtrueならcontrollerをルートコントローラとみなす
        var rootController = controller.__controllerContext
                && (controller.__controllerContext.isRoot ? controller : controller.rootController);

        if (!rootController) {
            // rootControllerが無い場合、
            // エラーオブジェクトがあればエラーを投げて終了。エラーのない場合は何もしないで終了。
            if (e) {
                // ライフサイクルの中でdispose()して、__unbindや__disposeでエラーが出た時に、
                // ライフサイクル呼び出しを包んでいるtry-catchのcatch節から再度disposeControllerが呼ばれる。
                // その時に、dispose()の呼び出しで起きたエラーを飲まないようにするため、ここで再スローする。
                throw e;
            }
            return;
        }
        if (isDisposing(rootController)) {
            // コントローラのdispose中、dispose済みのコントローラについて呼ばれた場合は何もしない
            return;
        }

        rootController.__controllerContext.isDisposing = 1;

        // unbindの実行
        try {
            unbindController(rootController, rejectReason || e);
        } catch (unbindError) {
            // __unbindの実行でエラーが起きた場合
            // 既に投げるエラーがある場合はここで発生したエラーは飲む(初出のエラーを投げるため)
            // ここで発生したエラーが初出の場合は、ここで起きたエラーを最後に投げる
            // (一番最初に起きた例外のみスローする。変数eには初出のエラーを格納する)
            e = e || unbindError;
        }

        // __disposeを実行してからcleanupする
        // __disposeの実行
        var promises;
        var disposeError = null;
        try {
            promises = executeLifeEndChain(rootController, '__dispose');
        } catch (error) {
            // __disposeの実行でエラーが起きた場合
            // 既に投げるエラーがある場合はそのまま飲むが、そうでない場合はここでキャッチしたエラーを投げる
            // (一番最初に起きた例外のみスロー)
            e = e || error;
            // disposeのエラーがあるかどうか覚えておく
            disposeError = disposeError || error;
        }

        /** disposeメソッド(disposeControllerメソッド)が返すプロミスのdeferred */
        var dfd = rootController.deferred();

        /** __disposeが返すプロミスがrejectされた時のRejectReasonオブジェクト */
        var disposeRejectReason = null;

        /** コントローラのクリーンアップとエラー時の処理 */
        function cleanup() {
            var lifecycleerrorObject = e || rejectReason || disposeError || disposeRejectReason;
            // 子から順にview.clearとnullifyの実行
            doForEachControllerGroupsDepthFirst(rootController, function(c) {
                // viewのclearとnullify
                if (c.view && c.view.__view) {
                    // 内部から呼ぶviewのクリアは、アンバインド後に呼ぶので
                    // view.clearではなくview.__view.clearを使ってエラーチェックをしないようにする
                    c.view.__view.clear();
                }
                if (!lifecycleerrorObject) {
                    // エラーが起きていたらnullifyしない(nullifyをしないことでユーザがエラー時の原因を調べやすくなる)
                    nullify(c);
                } else {
                    // isDisposedフラグを立てる
                    // (nullifyされた場合は__controllerContextごと消えるので見えないが、nullifyされない場合にもdisposeが完了したことが分かるようにする)
                    c.__controllerContext.isDisposed = 1;
                }
            });

            if (disposeRejectReason) {
                // disposeの返すプロミスをrejectする。
                // 引数にはエラーオブジェクトまたはrejectReasonを渡す
                dfd.rejectWith(rootController, [disposeRejectReason]);
            } else {
                dfd.resolveWith(rootController);
            }
            if (!lifecycleerrorObject) {
                // 何もエラーが起きていなければここで終了
                return;
            }
            // cleanupが終わったタイミングで、エラーまたはrejectされてdisposeされた場合は、"lifecycleerror"イベントをあげる
            // イベントオブジェクトのdetailに(初出の)エラーオブジェクトまたはrejectReasonをいれる
            // __disposeで初めてエラーまたはrejectされた場合は__disposeのエラーまたはrejectReasonを入れる
            triggerLifecycleerror(rootController, lifecycleerrorObject);
            if (e || disposeError) {
                throw e || disposeError;
            }
        }
        function disposeFail() {
            // __disposeで投げられた例外または、promiseがrejectされた場合はそのrejectに渡された引数を、disposeの返すプロミスのfailハンドラに渡す
            disposeRejectReason = disposeError
                    || createRejectReason(ERR_CODE_CONTROLLER_DISPOSE_REJECTED_BY_USER,
                            rootController.__name, argsToArray(arguments));
            // コントローラの句リンアップ
            cleanup();
        }

        // __disposeでエラーが起きていたらプロミスを待たずに失敗時の処理を実行
        if (disposeError) {
            disposeFail();
        } else {
            // __disposeの返すプロミスを待機してから句リンアップ処理を実行
            waitForPromises(promises, cleanup, disposeFail, true);
        }
        return dfd.promise();
    }

    /**
     * コントローラのアンバインド処理を行います。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Object} rejectReason 各Dfdをrejectするときにfailハンドラに渡す引数
     */
    function unbindController(controller, rejectReason) {
        // 既にunbindされている何もしない
        if (isUnbinding(controller)) {
            return;
        }
        controller.__controllerContext.isUnbinding = 1;

        // rejectまたはfailされていないdeferredをreject()する
        // rejectReasonが指定されている場合はrejectReasonをfailハンドラの引数に渡す
        // rejectReasonは未指定で、エラーオブジェクトが渡されている場合はエラーオブジェクトをfailハンドラの引数に渡す
        // 正常時(rejectReasonもeもない場合)は、引数なし
        rejectControllerDfd(controller, rejectReason);

        // __unbindの実行
        var unbindError;
        try {
            executeLifeEndChain(controller, '__unbind');
        } catch (e) {
            // エラーが起きたら覚えておく
            unbindError = e;
        }

        doForEachControllerGroups(controller, function(c) {
            // unbind時は__metaのuseHandlersによらずunbind(onで動的に追加されるハンドラもあるため)
            unbindEventHandlers(c);
        });

        controller.__controllerContext.unbindList = {};

        // コントローラマネージャの管理対象から外す.
        var controllers = controllerManager.controllers;
        var that = controller;
        controllerManager.controllers = $.grep(controllers, function(controllerInstance) {
            return controllerInstance !== that;
        });
        // h5controllerunboundイベントをトリガ
        // (コントローラのpostInitまで終わっている、かつ、managedがfalseではない(===h5controllerboundをあげている)場合のみ)
        if (controller.isPostInit && controller.__controllerContext.managed !== false) {
            $(controller.rootElement).trigger('h5controllerunbound', controller);
        }

        // rootElementとview.__view.controllerにnullをセット
        unbindRootElement(controller);

        // unbind処理が終了したのでunbindedをtrueにする
        controller.__controllerContext.isUnbinded = 1;

        // __unbindでエラーが投げられていれば再スロー
        if (unbindError) {
            throw unbindError;
        }
    }

    /**
     * 指定されたIDを持つViewインスタンスを返します。 自身が持つViewインスタンスが指定されたIDを持っていない場合、parentControllerのViewインスタンスに対して
     * 持っているかどうか問い合わせ、持っていればそのインスタンスを、持っていなければ更に上に問い合わせます。
     * ルートコントローラのViewインスタンスも持っていない場合、h5.core.viewに格納された最上位のViewインスタンスを返します。
     *
     * @private
     * @param {String} templateId テンプレートID
     * @param {Controller} controller コントローラ
     * @returns {View}
     */
    function getView(templateId, controller) {
        if (controller.view.__view.isAvailable(templateId)) {
            return controller.view.__view;
        } else if (controller.parentController) {
            return getView(templateId, controller.parentController);
        }
        return core.view;
    }

    /**
     * 指定されたコントローラがdispose済みかどうかを返します
     * <p>
     * dispose処理の途中でまだdisposeが完了していない場合はfalseを返します
     * </p>
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Boolean}
     */
    function isDisposed(controller) {
        return !controller.__controllerContext || controller.__controllerContext.isDisposed;
    }

    /**
     * 指定されたコントローラがdispose処理中またはdispose済みかどうかを返します
     * <p>
     * isDisposedと違い、dispose処理の途中でまだdisposeが完了していない場合にtrueを返します
     * </p>
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Boolean}
     */
    function isDisposing(controller) {
        return isDisposed(controller) || controller.__controllerContext.isDisposing;
    }

    /**
     * 指定されたコントローラがunbind処理中またはunbind済みかどうかを返します
     * <p>
     * すでにdisposeされている場合はアンバインド済みなのでtrueを返します
     * </p>
     *
     * @private
     * @param {Controller} controller コントローラ
     * @returns {Boolean}
     */
    function isUnbinding(controller) {
        var rc = controller.__controllerContext && controller.__controllerContext.isRoot ? controller
                : controller.rootController;
        return !rc || isDisposed(rc) || rc.__controllerContext.isUnbinding
                || rc.__controllerContext.isUnbinded;
    }

    /**
     * 指定されたコントローラとその子供コントローラのresolve/rejectされていないdeferredをrejectします。
     *
     * @private
     * @param {Controller} controller コントローラ
     * @param {Any} [errorObj] rejectに渡すオブジェクト
     */
    function rejectControllerDfd(controller, errorObj) {
        // 指定されたコントローラのルートコントローラを取得
        // ルートからinitDfdをrejectしていく
        var propertyArray = ['postInitDfd', 'readyDfd'];

        // ルートからinitDfd.rejectしていく
        var controllers = [];
        doForEachControllerGroups(controller, function(c) {
            controllers.push(c);
            var dfd = c.__controllerContext['initDfd'];
            if (dfd && !isRejected(dfd) && !isResolved(dfd)) {
                // thisをDfdを持つコントローラにしてreject
                dfd.rejectWith(c, [errorObj]);
            }
        });

        // 子からpostInitDfd, readyDfdをrejectしていく
        for (var i = 0, l = propertyArray.length; i < l; i++) {
            var property = propertyArray[i];
            // initDfdと逆順
            for (var index = controllers.length - 1; index >= 0; index--) {
                var c = controllers[index];
                var dfd = c.__controllerContext[property];
                if (dfd && !isRejected(dfd) && !isResolved(dfd)) {
                    // thisをDfdを持つコントローラにしてreject
                    dfd.rejectWith(c, [errorObj]);
                }
            }
        }
    }

    /**
     * インラインコメントテンプレートノードを探す
     *
     * @private
     * @param {Node} rootNode 探索を開始するルートノード
     * @param {String} id テンプレートID
     * @returns {Node} 発見したコメントノード、見つからなかった場合はnull
     */
    function findCommentBindingTarget(rootNode, id) {
        var childNodes = rootNode.childNodes;
        for (var i = 0, len = childNodes.length; i < len; i++) {
            var n = childNodes[i];
            if (n.nodeType === 1) {
                //Magic number: 1はNode.ELEMENT_NODE
                var ret = findCommentBindingTarget(n, id);
                if (ret) {
                    //深さ優先で探索して見つかったらそこで探索終了
                    return ret;
                }
            } else if (n.nodeType === 8) {
                //Magic Number: 8はNode.COMMENT_NODE
                var nodeValue = n.nodeValue;
                if (nodeValue.indexOf(COMMENT_BINDING_TARGET_MARKER) !== 0) {
                    //コメントが開始マーカーで始まっていないので探索継続
                    continue;
                }

                var beginTagCloseBracketIdx = nodeValue.indexOf('}');
                if (beginTagCloseBracketIdx === -1) {
                    //マーカータグが正しく閉じられていない
                    continue;
                }

                var beginTag = nodeValue.slice(0, beginTagCloseBracketIdx);

                var matched = beginTag.match(/id="([A-Za-z][\w-:\.]*)"/);
                if (!matched) {
                    //idが正しく記述されていない
                    continue;
                } else if (matched[1] === id) {
                    //探しているidを持つインラインコメントテンプレートノードが見つかったのでリターン
                    return n;
                }
            }
        }
        return null;
    }

    /**
     * ロジック、コントローラが持つown
     *
     * @private
     * @param {Function} func
     * @returns funcの実行結果
     */
    function own(func) {
        var that = this;
        return function(/* var_args */) {
            return func.apply(that, arguments);
        };
    }

    /**
     * ロジック、コントローラが持つownWithOrg
     *
     * @private
     * @param {Function} func
     * @returns funcの実行結果
     */
    function ownWithOrg(func) {
        var that = this;
        return function(/* var_args */) {
            var args = u.obj.argsToArray(arguments);
            args.unshift(this);
            return func.apply(that, args);
        };
    }

    /**
     * templateDfdにテンプレートのロード待機処理を設定する
     *
     * @param {Controller} controller
     * @param {Deferred} templateDfd
     * @param {String|String[]|Depency} templates テンプレートのパス(またはその配列)または、Dependencyオブジェクト
     */
    function setTemlatesDeferred(controller, templateDfd, templates) {
        var controllerName = controller.__name;
        function viewLoad(count) {
            // Viewモジュールがない場合、この直後のloadでエラーが発生してしまうためここでエラーを投げる。
            if (!u.obj.getByPath('h5.core.view')) {
                throwFwError(ERR_CODE_NOT_VIEW);
            }

            templates = isArray(templates) ? templates : [templates];
            var promises = [];
            for (var i = 0, l = templates.length; i < l; i++) {
                // 文字列が指定されていたらDependencyに変換
                var dependency = isDependency(templates[i]) ? templates[i] : res
                        .dependsOn(templates[i]);
                promises.push(dependency.resolve('ejsfile'));
            }
            waitForPromises(promises, function(resources) {
                fwLogger.debug(FW_LOG_TEMPLATE_LOADED, controllerName);
                // viewにテンプレートを登録
                resources = isArray(resources) ? resources : [resources];
                for (var i = 0, l = resources.length; i < l; i++) {
                    var templates = resources[i].templates;
                    for (var j = 0, len = templates.length; j < len; j++) {
                        // 内部から呼ぶviewのロードは、ルートコントローラ設定前に呼ぶので、
                        // viewではなくview.__viewを使ってコントローラのルートエレメントが設定されているかのチェックをしないようにする
                        try {
                            controller.view.__view.register(templates[j].id, templates[j].content);
                        } catch (e) {
                            // registerで登録できない(=コンパイルエラー)ならreject
                            templateDfd.reject(e);
                        }
                    }
                }
                templateDfd.resolve();
            }, function(result) {
                // テンプレートのロードをリトライする条件は、リトライ回数が上限回数未満、かつ
                // jqXhr.statusが0、もしくは12029(ERROR_INTERNET_CANNOT_CONNECT)であること。
                // jqXhr.statusの値の根拠は、IE以外のブラウザだと通信エラーの時に0になっていること、
                // IEの場合は、コネクションが繋がらない時のコードが12029であること。
                // 12000番台すべてをリトライ対象としていないのは、何度リトライしても成功しないエラーが含まれていることが理由。
                // WinInet のエラーコード(12001 - 12156):
                // http://support.microsoft.com/kb/193625/ja
                var jqXhrStatus = result.detail.error.status;
                if (count === settings.dynamicLoading.retryCount || jqXhrStatus !== 0
                        && jqXhrStatus !== ERROR_INTERNET_CANNOT_CONNECT) {
                    fwLogger.error(FW_LOG_TEMPLATE_LOAD_FAILED, controllerName, result.detail.url);
                    setTimeout(function() {
                        templateDfd.reject(result);
                    }, 0);
                    return;
                }
                setTimeout(function() {
                    viewLoad(++count);
                }, settings.dynamicLoading.retryInterval);
            });
        }
        viewLoad(0);
    }

    /**
     * eventHandlerInfoオブジェクトを作成します
     * <p>
     * 第4引数propはコントローラ定義に書かれたイベントハンドラ(静的)ならそのプロパティ名を渡してください
     * </p>
     * <p>
     * 動的なイベントハンドラの場合はpropは指定しないでください
     * </p>
     *
     * @param {String|Object} selector
     * @param {String} eventName
     * @param {Controller|Object} controller コントローラまたはコントローラ定義オブジェクト
     * @param {String} prop コントローラ定義に記述された静的イベントハンドラの場合に、そのインベントハンドラのプロパティを指定
     * @returns {Object} eventHandlerInfo
     */
    function createEventHandlerInfo(selector, eventName, controller, prop) {
        // selectorが文字列じゃない場合はターゲットを直接指定している
        var isSelector = isString(selector);
        var bindTarget = isSelector ? null : selector;

        selector = isSelector ? $.trim(selector) : null;
        eventName = $.trim(eventName);

        // ターゲットが直接指定されているならisGlobalはtrue
        var isGlobal = !isSelector || isGlobalSelector(selector);
        var isBindRequested = isBindRequestedEvent(eventName);
        if (isBindRequested) {
            eventName = $.trim(trimBindEventBracket(eventName));
        }

        if (isSelector && isGlobal) {
            var selector = trimGlobalSelectorBracket(selector);
            // selectorに{this}が指定されていたらエラー
            if (selector === 'this') {
                throwFwError(ERR_CODE_EVENT_HANDLER_SELECTOR_THIS, [controller.__name], {
                    controllerDef: controller
                });
            }
        }

        return {
            selector: selector,
            bindTarget: bindTarget,
            isGlobal: isGlobal,
            isBindRequested: isBindRequested,
            eventName: eventName,
            propertyKey: prop
        };
    }

    /**
     * コントローラキャッシュエントリークラス
     *
     * @private
     * @name ControllerCacheEntry
     * @class
     */
    function ControllerCacheEntry() {
        // ロジックのプロパティ
        this.logicProperties = [];
        // イベントハンドランプロパティ
        this.eventHandlerProperties = [];
        // 関数のプロパティ
        this.functionProperties = [];
        // その他、コントローラインスタンスに持たせるプロパティ
        this.otherProperties = [];
        // バインドマップ
        this.bindMap = {};
        // 子コントローラのプロパティ
        this.childControllerProperties = [];
    }

    /**
     * コントローラのキャッシュを作成する
     *
     * @private
     * @param {Object} controllerDef コントローラ定義オブジェクト
     * @returns コントローラのキャッシュオブジェクト
     */
    function createControllerCache(controllerDef) {
        var cache = new ControllerCacheEntry();
        var logicProperties = cache.logicProperties;
        var eventHandlerProperties = cache.eventHandlerProperties;
        var functionProperties = cache.functionProperties;
        var otherProperties = cache.otherProperties;
        var bindMap = cache.bindMap;
        var childControllerProperties = cache.childControllerProperties;

        // 同じセレクタかつ同じイベントに複数のハンドラが指定されているかをチェックするためのマップ
        var checkBindMap = {};

        for ( var prop in controllerDef) {
            if (isEventHandler(controllerDef, prop)) {
                // イベントハンドラのキー
                eventHandlerProperties.push(prop);
                // イベントハンドラの場合
                // bindMapの作成
                var propTrimmed = $.trim(prop);
                var lastIndex = propTrimmed.lastIndexOf(' ');

                // イベントハンドラインフォの作成
                var info = createEventHandlerInfo(propTrimmed.substring(0, lastIndex), propTrimmed
                        .substring(lastIndex + 1, propTrimmed.length), controllerDef, prop);

                // 整形したものを取得
                var selector = info.selector;
                var eventName = info.eventName;
                var isGlobal = info.isGlobal;
                var isBindRequested = info.isBindRequested;

                // 同じセレクタ、同じイベントハンドラに同じ指定(isGlobal,isBindRequested)でイベントハンドラが指定されていたらエラー
                if (!checkBindMap[selector]) {
                    checkBindMap[selector] = {};
                }
                if (!checkBindMap[selector][eventName]) {
                    checkBindMap[selector][eventName] = {};
                }
                if (!checkBindMap[selector][eventName][isGlobal]) {
                    checkBindMap[selector][eventName][isGlobal] = {};
                }
                if (checkBindMap[selector][eventName][isGlobal][isBindRequested]) {
                    throwFwError(ERR_CODE_SAME_EVENT_HANDLER, [controllerDef.__name, selector,
                            eventName], {
                        controllerDef: controllerDef
                    });
                } else {
                    // フラグを立てる
                    checkBindMap[selector][eventName][isGlobal][isBindRequested] = 1;
                }

                bindMap[prop] = info;
            } else if (endsWith(prop, SUFFIX_CONTROLLER) && controllerDef[prop]
                    && !isFunction(controllerDef[prop])) {
                // 子コントローラ
                childControllerProperties.push(prop);
            } else if (endsWith(prop, SUFFIX_LOGIC) && controllerDef[prop]
                    && !isFunction(controllerDef[prop])) {
                // ロジック
                logicProperties.push(prop);
            } else if (isFunction(controllerDef[prop])) {
                // メソッド(ライフサイクル含む)
                functionProperties.push(prop);
            } else {
                // その他プロパティ
                otherProperties.push(prop);
            }
        }
        return cache;
    }

    /**
     * ロジックキャッシュエントリークラス
     *
     * @private
     * @name LogicCacheEntry
     * @class
     */
    function LogicCacheEntry() {
        // ロジックのプロパティ(子ロジック)
        this.logicProperties = [];
        // 関数のプロパティ
        this.functionProperties = [];
    }

    /**
     * ロジックのキャッシュを作成する
     *
     * @private
     * @param {Object} logicDef ロジック定義オブジェクト
     * @returns ロジックのキャッシュオブジェクト
     */
    function createLogicCache(logicDef) {
        var cache = new LogicCacheEntry();
        var functionProperties = cache.functionProperties;
        var logicProperties = cache.logicProperties;
        for ( var p in logicDef) {
            if (isChildLogic(logicDef, p)) {
                logicProperties.push(p);
            } else if (isFunction(logicDef[p])) {
                functionProperties.push(p);
            }
        }
        return cache;
    }

    /**
     * ロジックの__readyを実行する
     *
     * @private
     * @param {Logic} rootLogic ルートロジック
     * @param {Deferred} readyDfd rootLogicの__readyが終わったらresolveするdeferred
     */
    function triggerLogicReady(rootLogic, readyDfd) {
        // 待機中のプロミスを覚えておく
        // プロミスがresolveされたら取り除く
        var waitingPromises = [];

        /**
         * promiseにdoneハンドラを追加する関数
         * <p>
         * ただし、同一プロミスに同一ロジックについてのリスナを登録できないようにしています
         * </p>
         *
         * @param {Promise} promise
         * @param {Logic} targetLogic
         * @param {Function} listener
         */
        function addDoneListener(promise, targetLogic, listener) {
            var logicWaitingPromises = targetLogic.__logicContext.waitingPromises = targetLogic.__logicContext.waitingPromises
                    || [];
            if ($.inArray(promise, logicWaitingPromises) === -1) {
                logicWaitingPromises.push(promise);
                promise.done(listener);
            }
        }

        function execInner(logic, parent) {
            // isReadyは__ready終了(promiseならresolveした)タイミングでtrueになる
            logic.__logicContext.isReady = false;
            // isCalledReadyは__readyを呼んだ(promiseを返すかどうかは関係ない)タイミングでtrueになる
            logic.__logicContext.isCalledReady = false;
            // 深さ優先でexecInnerを実行
            doForEachLogics(logic, execInner);

            /**
             * 子が全てisReadyなら__readyを実行して自身をisReadyにする
             */
            function executeReady() {
                if (logic.__logicContext.isCalledReady) {
                    // 既に__ready呼び出し済みなら何もしない
                    return;
                }
                var isChildrenReady = true;
                doForEachLogics(logic, function(child) {
                    // isReadyがfalseなものが一つでもあればfalseを返して探索を終了
                    // 子がいない場合はisChidrenReadyはtrueのまま
                    isChildrenReady = child.__logicContext.isReady;
                    return isChildrenReady;
                });
                if (isChildrenReady) {
                    // __readyを実行
                    var ret = isFunction(logic.__ready) && logic.__ready();
                    logic.__logicContext.isCalledReady = true;
                    if (isPromise(ret)) {
                        // __readyが返したプロミスをwaitingPromisesに覚えておく
                        waitingPromises.push(ret);
                        ret.done(function() {
                            // __readyが返したプロミスがresolveされたらisReady=trueにする
                            logic.__logicContext.isReady = true;
                            // waitingPromisesから、resolveしたプロミスを取り除く
                            waitingPromises.splice($.inArray(ret, waitingPromises), 1);
                            // ロジックが覚えていた、待機しているプロミスはもう不要なので削除
                            logic.__logicContext.waitingPromises = null;
                            if (logic === rootLogic) {
                                // rootLogicのisReadyがtrueになったらreadyDfdをresolveして終了
                                readyDfd.resolveWith(logic);
                                return;
                            }
                        });
                    } else {
                        // __readyが同期または関数でないならすぐにisReadyをtrueにする
                        logic.__logicContext.isReady = true;
                        // ロジックが覚えていた、待機しているプロミスはもう不要なので削除
                        logic.__logicContext.waitingPromises = null;
                        if (logic === rootLogic) {
                            // rootLogicの__readyが終わったタイミングでreadyDfdをresolveする
                            readyDfd.resolveWith(logic);
                        }
                    }
                } else {
                    // 子のいずれかがisReadyじゃない===どこかで待機しているプロミスがある
                    // (待機するプロミスが無ければ子から順に実行しているため)
                    // この時点で待機しているプロミスのいずれかが完了したタイミングで、
                    // 再度自分の子が全てisReadyかどうかをチェックする
                    for (var i = 0, l = waitingPromises.length; i < l; i++) {
                        // addDoneListener(内部関数)を使って、同じプロミスに同じロジックについてのハンドラが重複しないようにしている
                        addDoneListener(waitingPromises[i], logic, executeReady);
                    }
                }
            }
            executeReady();
        }
        execInner(rootLogic);
    }

    /**
     * bindTargetターゲットが同じかどうか判定する
     * <p>
     * どちらかがjQueryオブジェクトならその中身を比較
     * </p>
     *
     * @private
     */
    function isSameBindTarget(target1, target2) {
        if (target1 === target2) {
            // 同一インスタンスならtrue
            return true;
        }
        var isT1Jquery = isJQueryObject(target1);
        var isT2Jquery = isJQueryObject(target2);
        if (!isT1Jquery && !isT2Jquery) {
            // どちらもjQueryオブジェクトでないならfalse;
            return false;
        }
        // どちらかがjQueryオブジェクトなら配列にして比較
        var t1Ary = isT1Jquery ? target1.toArray() : [target1];
        var t2Ary = isT2Jquery ? target2.toArray() : [target2];
        if (t1Ary.length !== t2Ary.length) {
            // 長さが違うならfalse
            return false;
        }
        for (var i = 0, l = t1Ary.length; i < l; i++) {
            if (t1Ary[i] !== t2Ary[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * コントローラをエラー終了状態にして、lifecycleerrorイベントをトリガする
     *
     * @param {Controller} rootController ルートコントローラ
     * @param {Error|rejectReason} detail 例外オブジェクト、またはRejectReason
     */
    function triggerLifecycleerror(rootController, detail) {
        controllerManager.dispatchEvent({
            type: 'lifecycleerror',
            detail: detail,
            rootController: rootController
        });
    }

    /**
     * 渡されたコントローラにルートエレメントが設定されていなかったらエラーを投げる
     * <p>
     * unbindされたコントローラ及び__construct時に呼べないメソッドの先頭で呼び出して使用する
     * </p>
     *
     * @param {Controller} controller
     * @param {String} method メソッド名
     */
    function throwErrorIfNoRootElement(controller, method) {
        if (!controller || !controller.rootElement) {
            throwFwError(ERR_CODE_METHOD_OF_NO_ROOTELEMENT_CONTROLLER, method);
        }
    }

    /**
     * 渡されたコントローラがdisposeされていたら、第２引数に指定されたメソッド名を含めたエラーを投げる
     * <p>
     * disposeされたコントローラで呼べないメソッドの先頭で呼び出して使用する
     * </p>
     *
     * @param {Controller} controller
     * @param {String} method メソッド名
     */
    function throwErrorIfDisposed(controller, method) {
        if (!controller || isDisposed(controller)) {
            throwFwError(ERR_CODE_METHOD_OF_DISPOSED_CONTROLLER, method);
        }
    }

    /**
     * イベントのバインドを行う
     * <p>
     * bindTargetがnodeならjQueryのbindで、そうでないならaddEventListenerを使ってバインドする。addEventListenerでバインドした場合はbindObj.isNativeBindをtrueにする。
     * </p>
     *
     * @private
     * @param bindObj バインドオブジェクト
     */
    function bindEvent(bindObj) {
        var bindTarget = bindObj.bindTarget;
        var eventName = bindObj.eventName;
        var handler = bindObj.handler;
        if (bindTarget && typeof bindTarget.nodeType !== TYPE_OF_UNDEFINED
                || isWindowObject(bindTarget) || isJQueryObject(bindTarget)) {
            // ノードタイプが定義されている(=ノード)またはwindowオブジェクトの場合またはjQueryオブジェクトの場合はjQueryのbindを使う
            $(bindTarget).bind(eventName, handler);
        } else {
            /* del begin */
            if (bindTarget == null) {
                fwLogger.warn(FW_LOG_BIND_TARGET_NOT_FOUND, bindObj.selector);
            } else if (!bindTarget.addEventListener) {
                fwLogger.warn(FW_LOG_BIND_TARGET_INVALID, bindObj.selector);
            }
            /* del end */
            if (!bindTarget || !bindTarget.addEventListener) {
                bindObj.isBindCanceled = true;
                return;
            }
            // ノードでない場合はaddEventListenerを使う
            bindTarget.addEventListener(eventName, handler);
            bindObj.isNativeBind = true;
        }
    }

    /**
     * イベントのアンバインドを行う
     * <p>
     * bindTargetがnodeならjQueryのunbindで、そうでないならremoveEventListenerを使ってアンバインドする
     * </p>
     *
     * @private
     * @param bindObj バインドオブジェクト
     */
    function unbindEvent(bindObj) {
        var bindTarget = bindObj.bindTarget;
        var eventName = bindObj.eventName;
        var handler = bindObj.handler;
        var isNativeBind = bindObj.isNativeBind;
        if (isNativeBind) {
            // addEventListenerでバインドした場合はremoveEventListenerを使う
            bindTarget.removeEventListener(eventName, handler);
        } else {
            $(bindTarget).unbind(eventName, handler);
        }
    }

    /**
     * コントローラインスタンスを子コントローラとして追加
     *
     * @param {Controller} parent
     * @param {Controller} child
     */
    function addChildController(parent, child) {
        child.parentController = parent;
        parent.__controllerContext.childControllers.push(child);
        child.__controllerContext.isRoot = false;
        if (parent.__controllerContext.isExecutedConstruct) {
            var rootController = parent.rootController;
            // __construct実行済みならrootControllerを設定
            // 子コントローラの持つ子コントローラも含めてルートコントローラを設定
            doForEachControllerGroups(child, function(c) {
                c.rootController = rootController;
            });
        }
    }

    /**
     * コントローラインスタンスを子コントローラから削除
     *
     * @param {Controller} parent
     * @param {Controller} child
     */
    function removeChildController(parent, child) {
        // 子コントローラをルートコントローラにする(親との関係を切る)
        child.parentController = null;
        child.rootController = child;
        child.__controllerContext.isRoot = true;

        var childControllers = parent.__controllerContext.childControllers;
        var index = $.inArray(child, childControllers);
        if (index !== -1) {
            childControllers.splice(index, 1);
        }
    }

    // =========================================================================
    //
    // Body
    //
    // =========================================================================
    function controllerFactory(controller, rootElement, controllerName, controllerDef, args, isRoot) {

        /**
         * コントローラ名.
         *
         * @type String
         * @name __name
         * @memberOf Controller
         */
        controller.__name = controllerName;

        /**
         * テンプレート.
         *
         * @type String|String[]
         * @name __templates
         * @memberOf Controller
         */
        controller.__templates = null;

        /**
         * コントローラがバインドされた要素.
         *
         * @type Element
         * @name rootElement
         * @memberOf Controller
         */
        controller.rootElement = rootElement;

        /**
         * コントローラコンテキスト.
         *
         * @private
         * @memberOf Controller
         * @name __controllerContext
         */
        controller.__controllerContext = {

            /**
             * リスナーを実行するかどうかのフラグ
             *
             * @type Boolean
             */
            executeListeners: true,

            /**
             * ルートコントローラかどうか
             *
             * @type Boolean
             */
            isRoot: isRoot,

            /**
             * アンバインド対象となるイベントハンドラのマップ.
             *
             * @type Object
             */
            boundHandlers: [],

            /**
             * コントローラ定義オブジェクト
             *
             * @type {Object}
             */
            controllerDef: controllerDef,

            /**
             * コントローラパラメータ
             */
            args: null
        };

        // 初期化パラメータをセット
        // パラメータもデフォルトパラメータも指定の無い場合はnull
        var defaultParam = controllerDef && controllerDef.__defaultArgs;
        if (defaultParam) {
            // デフォルトパラメーターとマージする (#474)
            controller.__controllerContext.args = $.extend({}, defaultParam, args);
        } else if (args) {
            // デフォルトパラメータの無い場合はクローンせずにparamをそのままセット（#163）
            controller.__controllerContext.args = args;
        }

        /**
         * コントローラのライフサイクルイベント__initが終了したかどうかを返します。
         *
         * @type Boolean
         * @memberOf Controller
         * @name isInit
         */
        controller.isInit = false;

        /**
         * コントローラのライフサイクルイベント__postInitが終了したかどうかを返します。
         *
         * @type Boolean
         * @memberOf Controller
         * @name isPostInit
         */
        controller.isPostInit = false;

        /**
         * コントローラのライフサイクルイベント__readyが終了したかどうかを返します。
         *
         * @type Boolean
         * @memberOf Controller
         * @name isReady
         */
        controller.isReady = false;

        /**
         * 親子関係を持つコントローラ群の一番祖先であるコントローラを返します。祖先がいない場合、自分自身を返します。
         *
         * @type Controller
         * @memberOf Controller
         * @name rootController
         */
        controller.rootController = null;

        /**
         * 親子関係を持つコントローラの親コントローラを返します。親コントローラがいない場合、nullを返します。
         *
         * @type Controller
         * @memberOf Controller
         * @name parentController
         */
        controller.parentController = null;

        /**
         * __templatesに指定したテンプレートファイルの読み込みに、成功または失敗したかの状態を持つPromiseオブジェクト。
         * このオブジェクトが持つ以下の関数で、状態をチェックすることができます。
         * <p>
         * <b>state()</b> <table border="1">
         * <tr>
         * <td>戻り値</td>
         * <td>結果</td>
         * </tr>
         * <tr>
         * <td>"resolved"</td>
         * <td>読み込みに成功</td>
         * </tr>
         * <tr>
         * <td>"rejected"</td>
         * <td>読み込みに失敗</td>
         * </tr>
         * <tr>
         * <td>"pending"</td>
         * <td>読み込みが開始されていないまたは読み込み中</td>
         * </tr>
         * </table> 注意: jQuery1.7.x未満の場合、この関数は使用できません。
         * <p>
         * <b>isResolved(), isRejected()</b> <table border="1">
         * <tr>
         * <td>isResolved()の戻り値</td>
         * <td>isRejected()の戻り値</td>
         * <td>結果</td>
         * </tr>
         * <tr>
         * <td>true</td>
         * <td>false</td>
         * <td>読み込みに成功</td>
         * </tr>
         * <tr>
         * <td>false</td>
         * <td>true</td>
         * <td>読み込みに失敗</td>
         * </tr>
         * <tr>
         * <td>false</td>
         * <td>false</td>
         * <td>読み込みが開始されていないまたは読み込み中</td>
         * </tr>
         * </table>
         * <p>
         * また、preInitPromise.done()に関数を設定すると読み込み成功時に、
         * preInitPromise.fail()に関数を設定すると読み込み失敗時に、設定した関数を実行します。
         *
         * @type Promise
         * @memberOf Controller
         * @name preInitPromise
         */
        controller.preInitPromise = null;

        /**
         * コントローラのライフサイクルイベント__initについてのPromiseオブジェクトを返します。
         *
         * @type Promise
         * @memberOf Controller
         * @name initPromise
         */
        controller.initPromise = null;

        /**
         * コントローラのライフサイクルイベント__postInitについてのPromiseオブジェクトを返します。
         *
         * @type Promise
         * @memberOf Controller
         * @name postInitPromise
         */
        controller.postInitPromise = null;

        /**
         * コントローラのライフサイクルイベント__readyについてのPromiseオブジェクトを返します。
         *
         * @type Promise
         * @memberOf Controller
         * @name readyPromise
         */
        controller.readyPromise = null;

        /**
         * コントローラのロガーを返します。
         * <p>
         * コントローラ内のメソッドで<code>this.log.debug('debug message');</code>のように記述して使用します。ロガーの使い方の詳細は<a
         * href="Log.html">Log</a>をご覧ください。
         * </p>
         *
         * @type Log
         * @memberOf Controller
         * @name log
         */
        controller.log = log.createLogger(controllerName);

        /**
         * ビュー操作に関するメソッドを格納しています。
         * <p>
         * <a href="View.html">View</a>クラスと同様にテンプレートを扱うクラスですが、Controllerの持つViewは以下の点でViewクラスとは異なります。
         * </p>
         * <ul>
         * <li>append/update/prependメソッドでのターゲット(出力先)について、
         * コントローラのイベントハンドラと同様にコントローラのルートエレメントを起点に選択します。 また、グローバルセレクタも使用可能です。 </li>
         *
         * <pre><code>
         * // 例
         * // thisはコントローラ
         * this.view.append('.target', 'tmpId'); // コントローラのルートエレメント内のtargetクラス要素
         * this.view.append('{.target}', 'tmpId'); // $('.target')と同じ
         * this.view.append('{rootElement}', 'tmpId'); // コントローラのルートエレメント(this.rootElementと同じ)
         * this.view.append('{document.body}', 'tmpId'); // body要素
         * </code></pre>
         *
         * <li>指定されたIDのテンプレートの探索を、親コントローラのView、h5.core.viewについても行います。</li>
         * <li>自分のコントローラ、親コントローラ、親コントローラの親コントローラ、…、ルートコントローラ、h5.core.view、の順番に探索して、
         * 最初に見つかったテンプレートを返します。</li>
         *
         * <pre><code>
         * // 例
         * // parentControllerは子コントローラを持つコントローラ
         * var parent = parentController.view;
         * var child = parentController.childController;
         * // viewにテンプレートを登録
         * h5.core.view.register('a', 'a_coreView');
         * h5.core.view.register('b', 'b_coreView');
         * parent.view.register('a', 'a_parent');
         * parent.view.register('d', 'd_parent');
         * child.view.register('c', 'c_child');
         * child.get('c'); // c_child
         * child.get('d'); // d_parent
         * child.get('a'); // a_parent
         * child.get('b'); // b_coreView
         * </code></pre>
         *
         * <li>bindメソッドはコメントビューを使用したバインドが可能です。</li>
         * <p>
         * コメントビューの詳細については、<a
         * href="http://www.htmlhifive.com/conts/web/view/reference/inline-comment-templating">リファレンス（仕様詳細)
         * &gt;&gt; コメントビュー</a>をご覧ください。
         * </p>
         * </ul>
         *
         * @name view
         * @memberOf Controller
         * @type View
         * @see View
         */
        controller.view = new View(controller);
    }

    function View(controller) {
        // 利便性のために循環参照になってしまうがコントローラの参照を持つ
        this.__controller = controller;
        // Viewモジュールがなければインスタンスを作成しない(できない)
        if (u.obj.getByPath('h5.core.view')) {
            this.__view = core.view.createView();
        }
    }

    /**
     * コメントビューへのバインドに対応したbind
     * <p>
     * コメントビューへのバインドはコントローラビューのbindのみでの機能です
     * </p>
     *
     * @private
     * @param element
     * @param context
     * @returns {Binding}
     */
    // JSDTのフォーマッタが過剰にインデントしてしまうので、独立した関数として記述している
    function View_bind(element, context) {
        throwErrorIfNoRootElement(this.__controller, 'view#bind');
        var target = element;

        if (isString(element) && element.indexOf('h5view#') === 0) {
            //先頭が"h5view#"で始まっている場合、インラインコメントテンプレートへのバインドとみなす
            //（「{h5view id="xxx"}」という記法なので、h5viewタグの特定idをセレクトしているようにみなせる）
            //Magic number: 7は"h5view#"の文字数
            var inlineCommentNode = findCommentBindingTarget(this.__controller.rootElement, element
                    .slice(7));

            var rawTmpl = inlineCommentNode.nodeValue;
            var tmpl = rawTmpl.slice(rawTmpl.indexOf('}') + 1);

            //jQueryによる"クリーンな"DOM生成のため、innerHTMLではなくappend()を使う
            var $dummyRoot = $('<div>').append(tmpl);

            target = [];
            var childNodes = $dummyRoot[0].childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                target.push(childNodes[i]);
            }

            //ダミールートから要素を外し、インラインテンプレートの直後に要素を挿入
            $dummyRoot.empty();
            var fragment = document.createDocumentFragment();
            for (var i = 0, len = target.length; i < len; i++) {
                fragment.appendChild(target[i]);
            }

            inlineCommentNode.parentNode.insertBefore(fragment, inlineCommentNode.nextSibling);
        }

        //詳細な引数チェックはView.bindで行う
        return this.__view.bind(target, context);
    }

    // オリジナルのviewを拡張
    // コントローラのルートエレメントが必須なものは、ルートエレメントがあるかどうかチェック(ないならエラー)
    // またコントローラがdisposeされている(this.__controllerがnullの場合も含む)ならエラー
    $.extend(View.prototype, {
        get: function(templateId, param) {
            throwErrorIfNoRootElement(this.__controller, 'view#get');
            return getView(templateId, this.__controller).get(templateId, param);
        },

        update: function(element, templateId, param) {
            throwErrorIfNoRootElement(this.__controller, 'view#update');
            var target = getTarget(element, this.__controller);
            return getView(templateId, this.__controller).update(target, templateId, param);
        },

        append: function(element, templateId, param) {
            throwErrorIfNoRootElement(this.__controller, 'view#append');
            var target = getTarget(element, this.__controller);
            return getView(templateId, this.__controller).append(target, templateId, param);
        },

        prepend: function(element, templateId, param) {
            throwErrorIfNoRootElement(this.__controller, 'view#prepend');
            var target = getTarget(element, this.__controller);
            return getView(templateId, this.__controller).prepend(target, templateId, param);
        },

        load: function(resourcePaths) {
            throwErrorIfNoRootElement(this.__controller, 'view#load');
            return this.__view.load(resourcePaths);
        },

        register: function(templateId, templateString) {
            throwErrorIfNoRootElement(this.__controller, 'view#register');
            this.__view.register(templateId, templateString);
        },

        isValid: function(templateString) {
            throwErrorIfNoRootElement(this.__controller, 'view#isValid');
            return this.__view.isValid(templateString);
        },

        isAvailable: function(templateId) {
            throwErrorIfNoRootElement(this.__controller, 'view#isAvailable');
            return getView(templateId, this.__controller).isAvailable(templateId);
        },

        clear: function(templateIds) {
            throwErrorIfNoRootElement(this.__controller, 'view#clear');
            this.__view.clear(templateIds);
        },

        getAvailableTemplates: function() {
            throwErrorIfNoRootElement(this.__controller, 'view#getAvailableTemplates');
            return this.__view.getAvailableTemplates();
        },

        bind: View_bind
    });

    /**
     * コントローラのコンストラクタ
     * <p>
     * このオブジェクトは自分でnewすることはありません。 コントローラ化して動作させる場合は<a
     * href="h5.core.html#controller">h5.core.controller()</a>を使用してください。
     * </p>
     *
     * @name Controller
     * @class
     */
    /**
     * @private
     * @param {Document} doc コントローラをバインドした要素が属するdocumentノード
     * @param {Element} rootElement コントローラをバインドした要素
     * @param {String} controllerName コントローラ名
     * @param {Object} controllerDef コントローラ定義オブジェクト
     * @param {Object} args 初期化パラメータ
     * @param {Boolean} isRoot ルートコントローラかどうか
     */
    function Controller(rootElement, controllerName, controllerDef, args, isRoot) {
        // フック関数を実行
        for (var i = 0, l = controllerInstantiationHooks.length; i < l; i++) {
            controllerInstantiationHooks[i](this);
        }
        return controllerFactory(this, rootElement, controllerName, controllerDef, args, isRoot);
    }
    $
            .extend(
                    Controller.prototype,
                    {
                        /**
                         * コントローラがバインドされた要素内から要素を選択します。
                         *
                         * @param {String} selector セレクタ
                         * @returns {jQuery} セレクタにマッチするjQueryオブジェクト
                         * @memberOf Controller
                         */
                        $find: function(selector) {
                            throwErrorIfDisposed(this, '$find');
                            throwErrorIfNoRootElement(this, '$find');
                            return $(this.rootElement).find(selector);
                        },

                        /**
                         * Deferredオブジェクトを返します。
                         *
                         * @returns {Deferred} Deferredオブジェクト
                         * @memberOf Controller
                         */
                        deferred: function() {
                            throwErrorIfDisposed(this, 'deferred');
                            return getDeferred();
                        },

                        /**
                         * ルート要素を起点に指定されたイベントを実行します。
                         * <p>
                         * 第2引数に指定したparameterオブジェクトは、コントローラのイベントハンドラで受け取るcontext.evArgに格納されます。
                         * </p>
                         * <p>
                         * parameterに配列を指定した場合は、context.evArgに渡した配列が格納されます。
                         * </p>
                         * <p>
                         * 戻り値は、jQueryEventオブジェクトを返します。
                         * </p>
                         * <h5>長さ1の配列をparameterに指定した場合について</h5>
                         * <p>
                         *
                         * <pre class="sh_javascript"><code>
                         * trigger('click', ['a']);
                         * </code></pre>
                         *
                         * のように、１要素だけの配列を渡した場合は、配列ではなくその中身がcontext.evArgに格納されます。(jQuery.triggerと同様です。)
                         * </p>
                         * <p>
                         * triggerで、渡した配列の長さに関わらず、渡したデータを配列としてハンドラで扱いたい場合は、以下のような方法を検討してください。。
                         * </p>
                         * <ul>
                         * <li> parameterをオブジェクトでラップする。
                         *
                         * <pre class="sh_javascript"><code>
                         * // trigger
                         * this.trigger('hoge', {data: ary});
                         * // イベントハンドラ
                         * '{rootElement} hoge': function(context){
                         *   var ary = context.evArg.data;
                         *   for(var i = 0, l = ary.length; i &lt; l; i++){
                         *     // 配列に対する処理
                         *   }
                         * }
                         * </code></pre>
                         *
                         * </li>
                         * <li>イベントハンドラ側で、受け取ったデータが配列でなかったら配列でラップしてから扱う
                         *
                         * <pre class="sh_javascript"><code>
                         * // trigger
                         * this.trigger('hoge', ary);
                         * // イベントハンドラ
                         * '{rootElement} hoge': function(context){
                         *   var ary = $.isArray(context.evArg) ? context.evArg: [context.evArg];
                         *   for(var i = 0, l = ary.length; i &lt; l; i++){
                         *     // 配列に対する処理
                         *   }
                         * }
                         * </code></pre>
                         *
                         * </li>
                         * </ul>
                         *
                         * @param {String|jQueryEvent} event イベント名またはjQueryEventオブジェクト
                         * @param {Object} [parameter] パラメータ
                         * @returns {jQueryEvent} event イベントオブジェクト
                         * @memberOf Controller
                         */
                        trigger: function(event, parameter) {
                            throwErrorIfDisposed(this, 'trigger');
                            throwErrorIfNoRootElement(this, 'trigger');
                            // eventNameが文字列ならイベントを作って投げる
                            // オブジェクトの場合はそのまま渡す。
                            var ev = isString(event) ? $.Event(event) : event;
                            $(this.rootElement).trigger(ev, parameter);
                            return ev;
                        },

                        /**
                         * 指定された関数に対して、コンテキスト(this)をコントローラに変更して実行する関数を返します。
                         *
                         * @param {Function} func 関数
                         * @return {Function} コンテキスト(this)をコントローラに変更した関数
                         * @memberOf Controller
                         */
                        own: function(/* var_args */) {
                            throwErrorIfDisposed(this, 'own');
                            return own.apply(this, argsToArray(arguments));
                        },

                        /**
                         * 指定された関数に対して、コンテキスト(this)をコントローラに変更し、元々のthisを第1引数に加えて実行する関数を返します。
                         *
                         * @param {Function} func 関数
                         * @return {Function} コンテキスト(this)をコントローラに変更し、元々のthisを第1引数に加えた関数
                         * @memberOf Controller
                         */
                        ownWithOrg: function(/* var_args */) {
                            throwErrorIfDisposed(this, 'ownWithOrg');
                            return ownWithOrg.apply(this, argsToArray(arguments));
                        },

                        /**
                         * コントローラを要素へ再度バインドします。子コントローラでは使用できません。
                         *
                         * @memberOf Controller
                         * @param {String|Element|jQuery} targetElement
                         *            バインド対象とする要素のセレクタ、DOMエレメント、もしくはjQueryオブジェクト.<br />
                         *            セレクタで指定したときにバインド対象となる要素が存在しない、もしくは2つ以上存在する場合、エラーとなります。
                         * @param {Object} [param] 初期化パラメータ.<br />
                         *            初期化パラメータは __init, __readyの引数として渡されるオブジェクトの argsプロパティとして格納されます。
                         * @returns {Controller} コントローラ.
                         */
                        bind: function(targetElement, param) {
                            throwErrorIfDisposed(this, 'bind');
                            if (!this.__controllerContext.isRoot) {
                                throwFwError(ERR_CODE_BIND_UNBIND_DISPOSE_ROOT_ONLY);
                            }

                            var target = getBindTarget(targetElement, this);
                            this.rootElement = target;
                            this.view.__controller = this;
                            var args = param ? param : null;
                            initInternalProperty(this, args);
                            triggerInit(this);
                            return this;
                        },

                        /**
                         * コントローラのバインドを解除します。子コントローラでは使用できません。
                         *
                         * @memberOf Controller
                         */
                        unbind: function() {
                            throwErrorIfDisposed(this, 'unbind');
                            throwErrorIfNoRootElement(this, 'unbind');
                            if (!this.__controllerContext.isRoot) {
                                throwFwError(ERR_CODE_BIND_UNBIND_DISPOSE_ROOT_ONLY);
                            }
                            if (!this.__controllerContext.isExecutedConstruct) {
                                throwFwError(ERR_CODE_CONSTRUCT_CANNOT_CALL_UNBIND);
                            }
                            try {
                                unbindController(this);
                            } catch (e) {
                                // __unbindの実行でエラーが出たらdisposeする
                                disposeController(this, e);
                            }
                        },

                        /**
                         * コントローラのリソースをすべて削除します。<br />
                         * <a href="#unbind">Controller#unbind()</a> の処理を包含しています。
                         *
                         * @returns {Promise} Promiseオブジェクト
                         * @memberOf Controller
                         */
                        dispose: function() {
                            throwErrorIfDisposed(this, 'dispose');
                            if (!this.__controllerContext.isRoot) {
                                throwFwError(ERR_CODE_BIND_UNBIND_DISPOSE_ROOT_ONLY);
                            }
                            return disposeController(this);
                        },

                        /**
                         * インジケータの生成を上位コントローラまたはフレームワークに移譲します。<br>
                         * 例えば、子コントローラにおいてインジケータのカバー範囲を親コントローラ全体（または画面全体）にしたい場合などに使用します。<br>
                         * このメソッドを実行すると、「triggerIndicator」という名前のイベントが発生します。また、イベント引数としてオプションパラメータを含んだオブジェクトが渡されます。<br>
                         * イベントがdocumentまで到達した場合、フレームワークが自動的にインジケータを生成します。<br>
                         * 途中のコントローラでインジケータを生成した場合はevent.stopPropagation()を呼んでイベントの伝搬を停止し、イベント引数で渡されたオブジェクトの
                         * <code>indicator</code>プロパティに生成したインジケータインスタンスを代入してください。<br>
                         * indicatorプロパティの値がこのメソッドの戻り値となります。<br>
                         *
                         * @param {Object} opt オプション
                         * @param {String} [opt.message] メッセージ
                         * @param {Number} [opt.percent] 進捗を0～100の値で指定する。
                         * @param {Boolean} [opt.block] 操作できないよう画面をブロックするか (true:する/false:しない)
                         * @returns {Indicator} インジケータオブジェクト
                         * @memberOf Controller
                         */
                        triggerIndicator: function(opt) {
                            throwErrorIfDisposed(this, 'triggerIndicator');
                            throwErrorIfNoRootElement(this, 'triggerIndicator');
                            var args = {
                                indicator: null
                            };
                            if (opt) {
                                $.extend(args, opt);
                            }

                            $(this.rootElement).trigger(EVENT_NAME_TRIGGER_INDICATOR, [args]);
                            return args.indicator;
                        },

                        /**
                         * 指定された要素に対して、インジケータ(メッセージ・画面ブロック・進捗)の表示や非表示を行うためのオブジェクトを取得します。
                         * <p>
                         * <a href="h5.ui.html#indicator">h5.ui.indicator</a>と同様にインジケータオブジェクトを取得する関数ですが、ターゲットの指定方法について以下の点で<a
                         * href="h5.ui.html#indicator">h5.ui.indicator</a>と異なります。
                         * <p>
                         * <ul>
                         * <li>第1引数にパラメータオブジェクトを渡してください。</li>
                         *
                         * <pre><code>
                         * // thisはコントローラ
                         * this.indicator({
                         * 	target: this.rootElement
                         * }); // OK
                         * this.indicator(this.rootElement, option); // NG
                         * </code></pre>
                         *
                         * <li>targetの指定は省略できます。省略した場合はコントローラのルートエレメントがインジケータの出力先になります。</li>
                         * <li>targetにセレクタが渡された場合、要素の選択はコントローラのルートエレメントを起点にします。また、グローバルセレクタを使用できます。
                         * (コントローラのイベントハンドラ記述と同様です。)</li>
                         *
                         * <pre><code>
                         * // thisはコントローラ
                         * this.indicator({target:'.target'}); // コントローラのルートエレメント内のtargetクラス要素
                         * this.indicator({target:'{.target}'}); // $('.target')と同じ
                         * this.indicator({target:'{rootElement}'); // コントローラのルートエレメント(this.rootElementと同じ)
                         * this.indicator({target:'{document.body}'); // body要素
                         * </code></pre>
                         *
                         * </ul>
                         *
                         * @returns {Indicator} インジケータオブジェクト
                         * @memberOf Controller
                         * @see h5.ui.indicator
                         * @see Indicator
                         */
                        indicator: function(opt) {
                            throwErrorIfDisposed(this, 'indicator');
                            throwErrorIfNoRootElement(this, 'indicator');
                            return callIndicator(this, opt);
                        },

                        /**
                         * コントローラに定義されているリスナーの実行を許可します。
                         *
                         * @memberOf Controller
                         */
                        enableListeners: function() {
                            throwErrorIfDisposed(this, 'enableListeners');
                            setExecuteListenersFlag(this, true);
                        },

                        /**
                         * コントローラに定義されているリスナーの実行を禁止します。
                         *
                         * @memberOf Controller
                         */
                        disableListeners: function() {
                            throwErrorIfDisposed(this, 'disableListeners');
                            setExecuteListenersFlag(this, false);
                        },

                        /**
                         * 指定された値をメッセージとして例外をスローします。
                         * <p>
                         * 第一引数がオブジェクトまたは文字列によって、出力される内容が異なります。
                         * <p>
                         * <b>文字列の場合</b><br>
                         * 文字列に含まれる{0}、{1}、{2}...{n} (nは数字)を、第二引数以降に指定した値で置換し、それをメッセージ文字列とします。
                         * <p>
                         * <b>オブジェクトの場合</b><br>
                         * Erorrオブジェクトのdetailプロパティに、このオブジェクトを設定します。
                         *
                         * @memberOf Controller
                         * @param {String|Object} msgOrErrObj メッセージ文字列またはオブジェクト
                         * @param {Any} [var_args] 置換パラメータ(第一引数が文字列の場合のみ使用します)
                         */
                        throwError: function(msgOrErrObj, var_args) {
                            throwErrorIfDisposed(this, 'throwError');
                            //引数の個数チェックはthrowCustomErrorで行う
                            var args = argsToArray(arguments);
                            args.unshift(null);
                            this.throwCustomError.apply(this, args);
                        },

                        /**
                         * 指定された値をメッセージとして例外をスローします。
                         * <p>
                         * このメソッドでスローされたErrorオブジェクトのcustomTypeプロパティには、第一引数で指定した型情報が格納されます。
                         * <p>
                         * 第二引数がオブジェクトまたは文字列によって、出力される内容が異なります。
                         * <p>
                         * <b>文字列の場合</b><br>
                         * 文字列に含まれる{0}、{1}、{2}...{n} (nは数字)を、第二引数以降に指定した値で置換し、それをメッセージ文字列とします。
                         * <p>
                         * <b>オブジェクトの場合</b><br>
                         * Erorrオブジェクトのdetailプロパティに、このオブジェクトを設定します。
                         *
                         * @memberOf Controller
                         * @param {String} customType 型情報
                         * @param {String|Object} msgOrErrObj メッセージ文字列またはオブジェクト
                         * @param {Any} [var_args] 置換パラメータ(第一引数が文字列の場合のみ使用します)
                         */
                        throwCustomError: function(customType, msgOrErrObj, var_args) {
                            throwErrorIfDisposed(this, 'throwCustomError');
                            if (arguments.length < 2) {
                                throwFwError(ERR_CODE_TOO_FEW_ARGUMENTS);
                            }

                            var error = null;

                            if (msgOrErrObj && isString(msgOrErrObj)) {
                                error = new Error(format.apply(null, argsToArray(arguments)
                                        .slice(1)));
                            } else {
                                // 引数を渡さないと、iOS4は"unknown error"、その他のブラウザは空文字が、デフォルトのエラーメッセージとして入る
                                error = new Error();
                                error.detail = msgOrErrObj;
                            }
                            error.customType = customType;
                            throw error;
                        },

                        /**
                         * イベントハンドラを動的にバインドします。
                         * <p>
                         * 第1引数targetの指定にはコントローラのイベントハンドラ記述と同様の記述ができます。
                         * つまりセレクタの場合はルートエレメントを起点に選択します。またグローバルセレクタで指定することもできます。、
                         * </p>
                         * <p>
                         * ここで追加したハンドラはコントローラのunbind時にアンバインドされます。
                         * </p>
                         *
                         * @memberOf Controller
                         * @param target {String|Object} イベントハンドラのターゲット
                         * @param eventName {String} イベント名
                         * @param listener {Function} ハンドラ
                         */
                        on: function(target, eventName, listener) {
                            throwErrorIfDisposed(this, 'on');
                            throwErrorIfNoRootElement(this, 'on');
                            // バインドオブジェクトの作成
                            var info = createEventHandlerInfo(target, eventName, this);

                            // アスペクトを掛ける
                            // onで動的に追加されたハンドラは、メソッド名は空文字扱とする
                            // アスペクトのpointCutの対象や、invocation.funcNameは空文字とする
                            var methodName = '';
                            // enable/disableListeners()のために制御用インターセプタも織り込む
                            var interceptors = getInterceptors(this.__name, methodName);
                            interceptors.push(executeListenersInterceptor);
                            var bindObjects = createBindObjects(this, info, createWeavedFunction(
                                    listener, methodName, interceptors));
                            for (var i = 0, l = bindObjects.length; i < l; i++) {
                                var bindObj = bindObjects[i];
                                if (!bindObj.isInnerBindObj) {
                                    // h5track*を有効にするハンドラを除いて、オリジナルハンドラを覚えて置き、off()できるようにする
                                    bindObj.originalHandler = listener;
                                }
                                bindByBindObject(bindObj, getDocumentOf(this.rootElement));
                            }
                        },

                        /**
                         * イベントハンドラを動的にアンバインドします。
                         * <p>
                         * 第1引数targetの指定にはコントローラのイベントハンドラ記述と同様の記述ができます。
                         * つまりセレクタの場合はルートエレメントを起点に選択します。またグローバルセレクタで指定することもできます。、
                         * </p>
                         *
                         * @memberOf Controller
                         * @param target {String|Object} イベントハンドラのターゲット
                         * @param eventName {String} イベント名
                         * @param listener {Function} ハンドラ
                         */
                        off: function(target, eventName, listener) {
                            throwErrorIfDisposed(this, 'off');
                            throwErrorIfNoRootElement(this, 'off');
                            // 指定された条件にマッチするbindObjをboundHandlersから探して取得する
                            var info = createEventHandlerInfo(target, eventName, this);
                            var boundHandlers = this.__controllerContext.boundHandlers;

                            var matchBindObj = null;
                            var bindTarget = info.bindTarget;
                            var eventName = info.eventName;
                            var selector = info.selector;
                            var isGlobal = info.isGlobal;
                            var isBindRequested = info.isBindRequested;

                            var index = 0;
                            for (var l = boundHandlers.length; index < l; index++) {
                                var bindObj = boundHandlers[index];
                                if (bindTarget) {
                                    // offでオブジェクトやDOMをターゲットに指定された場合はbindTarget、eventName、originalHandlerを比較
                                    if (isSameBindTarget(bindTarget, bindObj.bindTarget)
                                            && eventName === bindObj.eventName
                                            && bindObj.originalHandler === listener) {
                                        matchBindObj = bindObj;
                                        break;
                                    }
                                } else {
                                    // offでセレクタを指定された場合、セレクタと、グローバル指定かどうかと、isBindRequestedとoriginalHandlerを比較
                                    if (selector === bindObj.selector
                                            && isGlobal === bindObj.isGlobal
                                            && isBindRequested === bindObj.isBindRequested
                                            && listener === bindObj.originalHandler) {
                                        matchBindObj = bindObj;
                                        break;
                                    }
                                }
                            }
                            if (matchBindObj) {
                                unbindByBindObject(matchBindObj, getDocumentOf(this.rootElement));
                            }
                        },

                        /**
                         * コントローラを子コントローラとして動的に追加します
                         * <p>
                         * 追加されたコントローラは呼び出し元のコントローラの子コントローラとなります。
                         * </p>
                         *
                         * @memberOf Controller
                         * @param {Controller} コントローラインスタンス
                         */
                        manageChild: function(controller) {
                            throwErrorIfDisposed(this, 'manageChild');
                            // 自分自身がunbindされていたらエラー
                            if (isUnbinding(this)) {
                                throwFwError(ERR_CODE_CONTROLLER_MANAGE_CHILD_BY_UNBINDED_CONTROLLER);
                                return;
                            }
                            // コントローラインスタンスでない場合はエラー
                            if (!controller || !controller.__controllerContext) {
                                throwFwError(ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_CONTROLLER);
                                return;
                            }
                            // 対象のコントローラがdisopseまたはunbindされていたらエラー
                            if (isUnbinding(controller)) {
                                throwFwError(ERR_CODE_CONTROLLER_MANAGE_CHILD_UNBINDED_CONTROLLER);
                                return;
                            }
                            // ルートコントローラでない場合はエラー
                            if (controller.rootController !== controller) {
                                throwFwError(ERR_CODE_CONTROLLER_MANAGE_CHILD_NOT_ROOT_CONTROLLER);
                            }
                            // 必要なプロパティをセット
                            addChildController(this, controller);
                            // manageChildしたコントローラはルートコントローラで無くなるので、controllerManagerの管理下から外す
                            var controllers = controllerManager.controllers;
                            var index = $.inArray(controller, controllers);
                            if (index != -1) {
                                controllers.splice(index, 1);
                            }
                        },

                        /**
                         * 子コントローラを動的に削除
                         *
                         * @memberOf Controller
                         * @param {Controller} コントローラインスタンス
                         * @param {Boolean} [andDispose=true]
                         *            第1引数で指定されたコントローラをdisposeするかどうか。指定無しの場合はdisposeします。
                         * @returns {Promise}
                         */
                        unmanageChild: function(controller, andDispose) {
                            throwErrorIfDisposed(this, 'unmanageChild');
                            // 自分自身がunbindされていたらエラー
                            if (isUnbinding(this)) {
                                throwFwError(ERR_CODE_CONTROLLER_UNMANAGE_CHILD_BY_UNBINDED_CONTROLLER);
                                return;
                            }
                            // 対象のコントローラが自分の子コントローラでないならエラー
                            if (controller.parentController !== this) {
                                throwFwError(ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NOT_CHILD_CONTROLLER);
                                return;
                            }
                            // disposeするかどうか。デフォルトtrue(disposeする)
                            andDispose = andDispose === false ? false : true;
                            if (!andDispose && !controller.rootElement) {
                                // ルートエレメント未決定コントローラはdisposeせずにunmanageChildできない
                                throwFwError(ERR_CODE_CONTROLLER_UNMANAGE_CHILD_NO_ROOT_ELEMENT);
                                return;
                            }
                            removeChildController(this, controller, andDispose);
                            if (andDispose) {
                                controller.dispose();
                                return;
                            }
                            // disposeしない場合、unmanageChildしたコントローラはルートコントローラになるので、controllerManagerの管理下に追加
                            controllerManager.controllers.push(controller);
                            // 親子間に待機中のプロミスがあればそれを削除
                            var parentWaitingPromisesManagerMap = this.__controllerContext.waitingPromisesManagerMap;
                            var childWaitingPromisesManagerMap = controller.__controllerContext.waitingPromisesManagerMap;

                            if (parentWaitingPromisesManagerMap) {
                                if (parentWaitingPromisesManagerMap['__postInit']) {
                                    parentWaitingPromisesManagerMap['__postInit']
                                            .remove(controller.postInitPromise);
                                }
                                if (parentWaitingPromisesManagerMap['__ready']) {
                                    parentWaitingPromisesManagerMap['__ready']
                                            .remove(controller.readyPromise);
                                }
                            }
                            if (childWaitingPromisesManagerMap) {
                                if (childWaitingPromisesManagerMap['__init']) {
                                    childWaitingPromisesManagerMap['__init']
                                            .remove(this.initPromise);
                                }
                            }

                            // 元のルートコントローラによって、triggerPostInitやtriggerReadyが呼ばれていない状態ならここで呼ぶ
                            // (子コントローラが待機中のプロミスは無く、ルートがtriggerPostInitやtriggerReadyまで行っていない状態)
                            // initはコントローラバインド時に必ず呼ばれるのでここで呼ぶ必要はない
                            if (!this.rootController.__controllerContext.triggerPostInitExecuted) {
                                triggerPostInit(controller);
                            } else if (!this.rootController.__controllerContext.triggerReadyInitExecuted) {
                                triggerReady(controller);
                            }
                        },

                    // 以下JSDocコメントのみ
                    /**
                     * コントローラのライフサイクル __construct
                     * <p>
                     * コントローラ生成時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__constructに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ生成時のライフサイクルメソッドは{@link Controller.__construct},
                     * {@link Controller.__init}, {@link Controller.__postInit},
                     * {@link Controller.__ready}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __construct
                     */
                    /**
                     * コントローラのライフサイクル __init
                     * <p>
                     * コントローラ生成時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__initに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ生成時のライフサイクルメソッドは{@link Controller.__construct},
                     * {@link Controller.__init}, {@link Controller.__postInit},
                     * {@link Controller.__ready}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __init
                     */
                    /**
                     * コントローラのライフサイクル __postInit
                     * <p>
                     * コントローラ生成時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__postInitに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ生成時のライフサイクルメソッドは{@link Controller.__construct},
                     * {@link Controller.__init}, {@link Controller.__postInit},
                     * {@link Controller.__ready}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __postInit
                     */
                    /**
                     * コントローラのライフサイクル __ready
                     * <p>
                     * コントローラ生成時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__readyに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ生成時のライフサイクルメソッドは{@link Controller.__construct},
                     * {@link Controller.__init}, {@link Controller.__postInit},
                     * {@link Controller.__ready}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __ready
                     */
                    /**
                     * コントローラのライフサイクル __unbind
                     * <p>
                     * コントローラの破棄時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__unbindに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ破棄時のライフサイクルメソッドは{@link Controller.__unbind},{@link Controller.__dispose}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __unbind
                     */
                    /**
                     * コントローラのライフサイクル __dispose
                     * <p>
                     * コントローラの破棄時に実行されるライフサイクルメソッドの一つ。コントローラ定義オブジェクトの__disposeに関数を記述することで動作する。
                     * 指定はオプションであり、記述しなくてもよい。
                     * </p>
                     * <p>
                     * コントローラ破棄時のライフサイクルメソッドは{@link Controller.__unbind},{@link Controller.__dispose}の順序で動作する。
                     * </p>
                     *
                     * @see {@link http://www.htmlhifive.com/conts/web/view/reference/controller_lifecycle|リファレンス（仕様詳細） » コントローラのライフサイクルについて}
                     * @memberOf Controller
                     * @type {function}
                     * @name __dispose
                     */
                    });

    /**
     * コントローラマネージャクラス
     *
     * @name ControllerManager
     * @class
     */
    function ControllerManager() {
        this.rootElement = document;
        this.controllers = [];

        /**
         * triggerIndicatorイベントハンドラ
         *
         * @param {EventContext} context
         * @memberOf ControllerManager
         * @private
         */
        $(document).bind(EVENT_NAME_TRIGGER_INDICATOR, function(event, opt) {
            if (opt.target == null) {
                opt.target = document;
            }
            opt.indicator = callIndicator(this, opt);
            event.stopPropagation();
        });
    }
    // eventDispatcherをmixin
    mixin.eventDispatcher.mix(ControllerManager.prototype);
    $
            .extend(
                    ControllerManager.prototype,
                    {
                        /**
                         * 現在動作しているすべてのコントローラのインスタンスの配列を返します。<br>
                         * 子コントローラは含まれません。すなわち、ルートコントローラのみが含まれます。
                         *
                         * @returns {Controller[]} コントローラ配列
                         * @memberOf ControllerManager
                         */
                        getAllControllers: function() {
                            return this.controllers;
                        },

                        /**
                         * 指定した要素にバインドされているすべてのコントローラを返します。バインドされているコントローラがない場合は空の配列が返ります。<br>
                         * オプションを指定すると、子孫要素も検索対象に含めたり、特定の名前のコントローラだけを検索対象にしたりすることができます。<br>
                         * なお、戻り値に含まれるのはルートコントローラのみです。
                         *
                         * @param {String|Element|jQuery} rootElement 検索対象の要素
                         * @param {Object} [option] オプション（ver.1.1.7以降）
                         * @param {Boolean} [option.deep=false]
                         *            子孫要素にバインドされているコントローラも含めるかどうか(ver.1.1.7以降)
                         * @param {String|String[]} [option.name=null]
                         *            指定された場合、この名前のコントローラのみを戻り値に含めます。配列で複数指定することも可能です。(ver.1.1.7以降)
                         * @returns {Controller[]} バインドされているコントローラの配列
                         * @memberOf ControllerManager
                         */
                        getControllers: function(rootElement, option) {
                            var deep = option && option.deep;
                            var names = option && option.name ? wrapInArray(option.name) : null;

                            var seekRoot = $(rootElement)[0];
                            var controllers = this.controllers;
                            var ret = [];
                            for (var i = 0, len = controllers.length; i < len; i++) {
                                var controller = controllers[i];

                                if (names && $.inArray(controller.__name, names) === -1
                                        || !controller.rootElement) {
                                    continue;
                                }

                                if (seekRoot === controller.rootElement) {
                                    ret.push(controller);
                                } else if (deep
                                        && getDocumentOf(seekRoot) === getDocumentOf(controller.rootElement)
                                        && $.contains(seekRoot, controller.rootElement)) {
                                    // ownerDocumentが同じ場合に$.contais()の判定を行う
                                    // (IE8でwindow.open()で開いたポップアップウィンドウ内の要素と
                                    // 元ページ内の要素で$.contains()の判定を行うとエラーになるため。)
                                    // また、$.contains()は自分と比較した場合はfalse
                                    ret.push(controller);
                                }
                            }
                            return ret;
                        }
                    });

    /**
     * キャッシュマネージャクラス
     * <p>
     * マップを使ってキャッシュの登録、削除を行うクラス
     * </p>
     * <p>
     * このクラスは自分でnewすることはありません。<a
     * href="h5.core.html#definitionCacheManager">h5.core.definitionCacheManager</a>がこのクラスのメソッド(<a
     * href="#clear">clear()</a>,<a href="#clearAll">clearAll()</a>)を持ちます。
     * </p>
     *
     * @class CacheManager
     */
    function CacheManager() {
        this._init();
    }
    $.extend(CacheManager.prototype, {
        /**
         * コントローラの名前からキャッシュを取り出す。 無ければnullを返す。
         *
         * @private
         * @memberOf CacheManager
         * @param {String} name
         */
        get: function(name) {
            return this._cacheMap[name];
        },

        /**
         * キャッシュを登録する。
         *
         * @private
         * @memberOf CacheManager
         */
        register: function(name, cacheObj) {
            this._cacheMap[name] = cacheObj;
        },

        /**
         * 名前を指定してキャッシュをクリアする
         *
         * @param {String} name コントローラまたはロジックの名前(__nameの値)
         * @memberOf CacheManager
         */
        clear: function(name) {
            delete this._cacheMap[name];
        },

        /**
         * キャッシュを全てクリアする
         *
         * @memberOf CacheManager
         */
        clearAll: function() {
            this._cacheMap = {};
        },

        /**
         * 初期化処理
         *
         * @private
         * @memberOf CacheManager
         */
        _init: function() {
            this._cacheMap = {};
        }
    });

    // キャッシュ変数にコントローラマネージャ、キャッシュマネージャのインスタンスをそれぞれ格納
    definitionCacheManager = new CacheManager();
    controllerManager = new ControllerManager();

    u.obj.expose('h5.core', {
        /**
         * コントローラマネージャ
         *
         * @name controllerManager
         * @type ControllerManager
         * @memberOf h5.core
         */
        controllerManager: controllerManager,

        /**
         * 定義オブジェクトのキャッシュを管理するキャッシュマネージャ
         * <p>
         * コントローラとロジックのキャッシュを管理する<a href="CacheManager.html">CacheManager</a>のインスタンスです。<a
         * href="CacheManager.html#clear">clear</a>または<a
         * href="CacheManager.html#clearAll">clearAll</a>を使ってキャッシュを削除することができます。
         * </p>
         * <p>
         * コントローラ化、ロジック化の際に、コントローラ名及びロジック名で、インスタンス化に必要な情報をキャッシュしており、コントローラ及びロジックについて、同じ名前の定義オブジェクトは同じコントローラ、ロジックとして扱います。
         * </p>
         * <p>
         * 同じ名前で定義の異なるコントローラ、ロジックを使用したい場合は、<a href="CacheManager.html#clear">clear</a>または<a
         * href="CacheManager.html#clearAll">clearAll</a>でキャッシュを削除してください。
         * </p>
         *
         * @name definitionCacheManager
         * @type CacheManager
         * @memberOf h5.core
         */
        // clearとclearAllのみ公開
        definitionCacheManager: {
            clear: function(name) {
                definitionCacheManager.clear(name);
            },
            clearAll: function() {
                definitionCacheManager.clearAll();
            }
        }
    });

    // プロパティ重複チェック用のコントローラプロパティマップを作成
    var controllerPropertyMap = null;

    /**
     * コントローラのファクトリ
     *
     * @private
     * @param {String|Element|jQuery} targetElement バインド対象とする要素のセレクタ、DOMエレメント、もしくはjQueryオブジェクト
     * @param {Object} controllerDefObj コントローラ定義オブジェクト
     * @param {Object} [param] 初期化パラメータ
     * @returns {Controller}
     */
    // fwOptは内部的に使用している.
    function createAndBindController(targetElement, controllerDefObj, args, fwOpt) {
        // 内部から再帰的に呼び出された場合は、fwOpt.isInternalが指定されているはずなので、ルートコントローラかどうかはfwOpt.isInternalで判別できる
        var isRoot = !fwOpt || !fwOpt.isInternal;
        if (!isRoot && isDisposed(fwOpt.rootController)) {
            // ルートコントローラがdisposeされていたら何もしない
            return null;
        }

        // コントローラ名
        var controllerName = controllerDefObj.__name;
        if ((!isString(controllerName) || $.trim(controllerName).length === 0)
                && !isDependency(controllerDefObj)) {
            // Dependency指定の場合を除いて、文字列じゃない又は空文字、空白文字の場合はエラー
            throwFwError(ERR_CODE_INVALID_CONTROLLER_NAME, null, {
                controllerDefObj: controllerDefObj
            });
        }

        // 初期化開始のログ
        fwLogger.debug(FW_LOG_INIT_CONTROLLER_BEGIN, controllerName);

        // 初期化パラメータがオブジェクトかどうかチェック
        if (args && !$.isPlainObject(args)) {
            throwFwError(ERR_CODE_CONTROLLER_INVALID_INIT_PARAM, [controllerName], {
                controllerDefObj: controllerDefObj
            });
        }

        // 既にコントローラ化されているかどうかチェック
        if (controllerDefObj.__controllerContext) {
            throwFwError(ERR_CODE_CONTROLLER_ALREADY_CREATED, null, {
                controllerDefObj: controllerDefObj
            });
        }

        // デフォルトパラメータがオブジェクトかどうかチェック
        if (controllerDefObj.__defaultArgs) {
            if (!$.isPlainObject(controllerDefObj.__defaultArgs)) {
                throwFwError(ERR_CODE_CONTROLLER_INVALID_INIT_DEFAULT_PARAM, [controllerName], {
                    controllerDefObj: controllerDefObj
                });
            }
        }

        // キャッシュの取得(無かったらundefined)
        var cache = definitionCacheManager.get(controllerName);

        // コントローラ定義オブジェクトのチェック
        // キャッシュがある場合はコントローラ定義オブジェクトについてはチェック済みなのでチェックしない
        if (!cache) {
            validateControllerDef(isRoot, targetElement, controllerDefObj, controllerName);
        }

        // 循環参照チェックはキャッシュが残っていても行う
        // cache作成時にチェックしてOKだったとしても、子コントローラの中身が変わってしまっていることがあるため
        if (isRoot) {
            // コントローラの循環参照チェック(ルートコントローラで1度やればよい)
            validateControllerCircularRef(controllerDefObj, controllerName);
        }

        // キャッシュが無かった場合、キャッシュの作成と登録
        if (!cache) {
            cache = createControllerCache(controllerDefObj);
            definitionCacheManager.register(controllerName, cache);
        }

        if (isRoot) {
            // ルートコントローラの場合はバインド対象となる要素のチェックを同期で行う
            // (子コントローラの時は親の__init後にチェックしている)
            // 文字列、オブジェクト(配列含む)でない場合はエラー (それぞれ、セレクタ、DOMオブジェクト(またはjQueryオブジェクト)を想定している)
            validateTargetElement(targetElement, controllerDefObj, controllerName);
        }

        // new Controllerで渡すコントローラ定義オブジェクトはクローンしたものではなくオリジナルなものを渡す。
        // コントローラが持つコントローラ定義オブジェクトはオリジナルのものになる。
        var controller = new Controller(targetElement ? $(targetElement).get(0) : null,
                controllerName, controllerDefObj, args, isRoot);

        var rootController = isRoot ? controller : fwOpt.rootController;

        // ------ controllerContextの作成 ------//
        // Deferred,Promiseの作成
        // preInitPromise, initPromise, postInitPromiseが失敗してもcFHを発火させないようにするため、dummyのfailハンドラを登録する
        var preInitDfd = getDeferred();
        var preInitPromise = preInitDfd.promise().fail(dummyFailHandler);
        var initDfd = getDeferred();
        var initPromise = initDfd.promise().fail(dummyFailHandler);
        var postInitDfd = getDeferred();
        var postInitPromise = postInitDfd.promise().fail(dummyFailHandler);
        var readyDfd = getDeferred();
        var readyPromise = readyDfd.promise();
        // async:falseならresolve済みにしておいて同期でバインドされるようにする(内部で使用するオプション)
        var async = fwOpt && fwOpt.async;
        if (async === false) {
            preInitDfd.resolve();
            initDfd.resolve();
            postInitDfd.resolve();
            readyDfd.resolve();
        }

        if (!isRoot) {
            // ルートコントローラでないなら、readyPromiseの失敗でcommonFailHandlerを発火させないようにする
            // (ルートコントローラのreadyPromiseのみ、失敗したらcommonFailHandlerが発火する)
            readyPromise.fail(dummyFailHandler);
        }
        /* del begin */
        else {
            // ルートコントローラなら、readyPromise.doneのタイミングで、ログを出力する
            readyPromise.done(function() {
                fwLogger.info(FW_LOG_INIT_CONTROLLER_COMPLETE, controllerName);
            });
        }
        /* del end */

        // __controllerContextに必要な情報を持たせる
        var controllerContext = controller.__controllerContext;
        // cacheを持たせる
        controllerContext.cache = cache;
        // 各ライフサイクルのdeferredを持たせる
        controllerContext.preInitDfd = preInitDfd;
        controllerContext.initDfd = initDfd;
        controllerContext.postInitDfd = postInitDfd;
        controllerContext.readyDfd = readyDfd;

        // コントローラにpromiseを持たせる
        controller.preInitPromise = preInitPromise;
        controller.initPromise = initPromise;
        controller.postInitPromise = postInitPromise;
        controller.readyPromise = readyPromise;

        // 子コントローラを保持する配列を持たせる
        controllerContext.childControllers = [];

        // 子コントローラ、ロジック依存関係解決のプロミス
        var promisesForTriggerInit = isRoot ? [] : fwOpt.promisesForTriggerInit;

        // ロジック定義をロジック化
        // ロジック定義はクローンされたものではなく、定義時に記述されたものを使用する
        // ロジックが持つロジック定義オブジェクトはオリジナルの定義オブジェクトになる
        for (var i = 0, l = cache.logicProperties.length; i < l; i++) {
            var prop = cache.logicProperties[i];
            var logicDef = controllerDefObj[prop];
            if (isDependency(logicDef)) {
                // Dependencyオブジェクトが指定されていた場合は依存関係を解決する
                var promise = logicDef.resolve('namespace');
                promisesForTriggerInit.push(promise);
                promise.done((function(logicProp, logicPromise) {
                    return function(logic) {
                        var logicInstance = createLogic(logic);
                        controller[logicProp] = logicInstance;
                        // ロジック化が終わったらコントローラが待機するプロミスから取り除く
                        promisesForTriggerInit.splice($.inArray(logicPromise,
                                promisesForTriggerInit), 1);
                        // ロジックのreadyPromiseを追加
                        promisesForTriggerInit.push(logicInstance.readyPromise);
                        // ロジックのreadyPromiseがdoneになったらpromisesForTriggerInitから取り除く
                        logicInstance.readyPromise.done((function(logicReadyPromise) {
                            return function() {
                                promisesForTriggerInit.splice($.inArray(logicReadyPromise,
                                        promisesForTriggerInit), 1);
                            };
                        })(logicInstance.readyPromise));
                    };
                })(prop, promise));
            } else {
                controller[prop] = createLogic(logicDef);
            }
        }

        // templateDfdの設定
        var clonedControllerDef = $.extend(true, {}, controllerDefObj);
        var templates = controllerDefObj.__templates;
        var templateDfd = getDeferred();
        var templatePromise = templateDfd.promise();
        if (isDependency(templates) || templates && templates.length > 0) {
            // テンプレートファイルのロードを待機する処理を設定する
            setTemlatesDeferred(controller, templateDfd, templates);
        } else {
            // テンプレートの指定がない場合は、resolve()しておく
            templateDfd.resolve();
        }

        // テンプレートプロミスのハンドラ登録
        templatePromise.done(function() {
            if (!isDisposing(controller)) {
                // thisをコントローラにしてresolve
                preInitDfd.resolveWith(controller);
            }
        }).fail(function(e) {
            // eはview.load()のfailに渡されたエラーオブジェクト
            // thisをコントローラにしてreject
            preInitDfd.rejectWith(controller, [e]);

            /* del begin */
            // disposeされていなければルートコントローラの名前でログを出力
            if (controller.rootController && !isDisposing(controller.rootController)) {
                fwLogger.error(FW_LOG_INIT_CONTROLLER_ERROR, controller.rootController.__name);
            }
            /* del end */

            // disposeする
            // 同じrootControllerを持つ他の子コントローラにdisposeされているかどうか
            // (controller.rootControllerがnullになっていないか)をチェックをしてからdisposeする
            disposeController(controller, null, e);
        });

        // イベントハンドラにアスペクトを設定
        for (var i = 0, l = cache.eventHandlerProperties.length; i < l; i++) {
            var prop = cache.eventHandlerProperties[i];
            controller[prop] = weaveAspect(clonedControllerDef, prop, true);
        }

        // イベントハンドラではないメソッド(ライフサイクル含む)にアスペクトを設定
        for (var i = 0, l = cache.functionProperties.length; i < l; i++) {
            var prop = cache.functionProperties[i];
            // アスペクトを設定する
            controller[prop] = weaveAspect(clonedControllerDef, prop);
        }

        // その他プロパティをコピー
        for (var i = 0, l = cache.otherProperties.length; i < l; i++) {
            var prop = cache.otherProperties[i];
            controller[prop] = clonedControllerDef[prop];
        }

        // コントローラマネージャの管理対象とするか判定する(fwOpt.managed===falseなら管理対象外)
        controllerContext.managed = fwOpt && fwOpt.managed;

        // __constructを実行(子コントローラのコントローラ化より前)
        try {
            controller.__construct
                    && controller.__construct(createInitializationContext(controller));
            if (isDisposing(controller)) {
                // 途中(__constructの中)でdisposeされたら__constructの実行を中断
                return null;
            }
        } catch (e) {
            // ルートコントローラを渡してdisposeする
            disposeController(rootController, e);
            return null;
        }

        // __construct呼び出し後にparentControllerとrootControllerの設定
        if (isRoot) {
            // ルートコントローラの場合(parentが無い場合)、rootControllerは自分自身、parentControllerはnull
            controller.rootController = controller;
            controller.parentController = null;
        } else {
            // rootControllerはisRoot===trueのコントローラには設定済みなので、親から子に同じrootControllerを引き継ぐ
            controller.parentController = fwOpt.parentController;
            controller.rootController = fwOpt.rootController;
        }

        // 動的に追加されたコントローラ(__constructのタイミングで追加されたコントローラ)について、
        // ルートコントローラを設定する
        if (controller.__controllerContext.childControllers) {
            for (var i = 0, childs = controller.__controllerContext.childControllers, l = childs.length; i < l; i++) {
                childs[i].rootController = controller.rootController;
            }
        }

        // __construct実行フェーズが完了したかどうか
        // この時点でunbind()呼び出しが可能になる
        controller.__controllerContext.isExecutedConstruct = true;

        // 子コントローラをコントローラ化して持たせる
        // 子コントローラがDependencyオブジェクトなら依存関係を解決
        var meta = controller.__meta;
        for (var i = 0, l = cache.childControllerProperties.length; i < l; i++) {
            // createAndBindControllerの呼び出し時に、fwOpt.isInternalを指定して、内部からの呼び出し(=子コントローラ)であることが分かるようにする
            var prop = cache.childControllerProperties[i];
            var childController = clonedControllerDef[prop];
            // 子コントローラにパラメータを引き継ぐかどうか
            var childArgs = null;
            if (meta && meta[prop] && meta[prop].inheritArgs) {
                childArgs = args;
            }

            if (isDependency(childController)) {
                // Dependencyオブジェクトが指定されていた場合は依存関係を解決する
                var promise = childController.resolve('namespace');
                promisesForTriggerInit.push(promise);
                promise.done((function(childProp, childControllerPromise, cp) {
                    return function(c) {
                        var child = createAndBindController(null, $.extend(true, {}, c), cp, {
                            isInternal: true,
                            parentController: controller,
                            rootController: rootController,
                            promisesForTriggerInit: promisesForTriggerInit,
                            async: async
                        });
                        if (child == null) {
                            // __constructで失敗したりdisposeされた場合はnullが返ってくるので
                            // 子コントローラの__constructが正しく実行されなかった場合は以降何もしない
                            return null;
                        }
                        controller[childProp] = child;
                        controller.__controllerContext.childControllers.push(child);
                        // createAndBindControllerの呼び出しが終わったら、プロミスを取り除く
                        promisesForTriggerInit.splice($.inArray(childControllerPromise,
                                promisesForTriggerInit), 1);
                    };
                })(prop, promise, childArgs));
            } else {
                var child = createAndBindController(null, $.extend(true, {},
                        clonedControllerDef[prop]), childArgs, {
                    isInternal: true,
                    parentController: controller,
                    rootController: rootController
                });

                if (child == null) {
                    // __constructで失敗したりdisposeされた場合はnullが返ってくるので
                    // 子コントローラの__constructが正しく実行されなかった場合は以降何もしない
                    return null;
                }
                controller.__controllerContext.childControllers.push(child);
                controller[prop] = child;
            }
        }

        if (isRoot) {
            // ルートコントローラなら自分以下のinitを実行
            // promisesForTriggerInitは子コントローラの依存解決
            function constructPromiseCheck() {
                if (promisesForTriggerInit.length === 0) {
                    // 待機中のプロミスがもうないならinit開始
                    triggerInit(controller, async);
                    return;
                }
                // 子孫にpromiseを追加されていた場合(さらに待機するコンストラクタがあった場合)
                // 再度待機する
                waitAllConstructPromise();
            }
            function waitAllConstructPromise() {
                waitForPromises(promisesForTriggerInit, constructPromiseCheck);
            }
            waitAllConstructPromise();
        }
        return controller;
    }

    /**
     * オブジェクトのロジック化を行います。
     *
     * @param {Object} logicDefObj ロジック定義オブジェクト
     * @returns {Logic}
     * @name logic
     * @function
     * @memberOf h5.core
     */
    function createLogic(logicDefObj) {
        var readyDfd = async.deferred();
        var readyPromise = readyDfd.promise();
        var logicTreeDependencyPromises = [];

        function create(defObj, isRoot) {
            var logicName = defObj.__name;

            // エラーチェック
            if (!isString(logicName) || $.trim(logicName).length === 0) {
                // __nameが不正
                throwFwError(ERR_CODE_INVALID_LOGIC_NAME, null, {
                    logicDefObj: defObj
                });
            }

            if (defObj.__logicContext) {
                // すでにロジックがインスタンス化されている
                throwFwError(ERR_CODE_LOGIC_ALREADY_CREATED, null, {
                    logicDefObj: defObj
                });
            }

            // キャッシュの取得
            var cache = definitionCacheManager.get(logicName);
            if (!cache) {
                // キャッシュが無い場合で、ルートロジックなら循環参照チェック
                // ロジックの循環参照チェック(ルートで1度やればよい)
                if (isRoot) {
                    validateLogicCircularRef(defObj);
                }
                // キャッシュの作成
                cache = createLogicCache(defObj);
            }

            // クローンしたものをロジック化する
            var logic = $.extend(true, {}, defObj);
            // アスペクトの設定
            var functionProperties = cache.functionProperties;
            for (var i = 0, l = functionProperties.length; i < l; i++) {
                var prop = functionProperties[i];
                logic[prop] = weaveAspect(logic, prop);
            }
            logic.deferred = getDeferred;
            logic.log = log.createLogger(logicName);
            logic.__logicContext = {
                // ロジック定義オブジェクトはクローンしたものではなくオリジナルのものを持たせる
                logicDef: defObj
            };
            logic.own = own;
            logic.ownWithOrg = ownWithOrg;

            // キャッシュへ登録
            definitionCacheManager.register(logicName, cache);

            // __constructの実行
            // 親から実行する
            if (isFunction(logic.__construct)) {
                logic.__construct();
            }

            // ロジックが持っているロジック定義もロジック化
            var logicProperties = cache.logicProperties;
            for (var i = 0, l = logicProperties.length; i < l; i++) {
                var prop = logicProperties[i];
                var childLogicDef = logic[prop];
                if (isDependency(childLogicDef)) {
                    // 子ロジックがDependencyならresolveしてからロジック化する
                    var promise = childLogicDef.resolve();
                    // ロジックツリーの待機するプロミスに追加
                    logicTreeDependencyPromises.push(promise);
                    promise.done((function(childLogicProp, logicPromise) {
                        return function(resolvedLogicDef) {
                            // ロジック化
                            logic[childLogicProp] = create(resolvedLogicDef);
                            // ロジックツリーの待機するプロミスから取り除く
                            logicTreeDependencyPromises.splice($.inArray(logicPromise,
                                    logicTreeDependencyPromises), 1);
                        };
                    })(prop, promise));
                } else {
                    logic[prop] = create(childLogicDef);
                }
            }

            return logic;
        }
        var rootLogic = create(logicDefObj, true);
        rootLogic.readyPromise = readyPromise;

        // ロジックツリーの依存解決が終わったタイミングで__readyの実行を開始
        function logicTreePromiseCheck() {
            if (logicTreeDependencyPromises.length === 0) {
                // 待機中のプロミスがもうないなら__readyの開始
                triggerLogicReady(rootLogic, readyDfd);
                return;
            }
            // 子孫にpromiseを追加されていた場合(さらに待機するコンストラクタがあった場合)
            // 再度待機する
            waitAllConstructPromise();
        }
        function waitAllConstructPromise() {
            waitForPromises(logicTreeDependencyPromises, logicTreePromiseCheck);
        }
        waitAllConstructPromise();

        return rootLogic;
    }

    /**
     * コントローラ化時にコントローラに対して追加処理を行うフック関数を登録する関数
     * <p>
     * ここで登録したフック関数はコントローラインスタンス生成時(__construct呼び出し前)に呼ばれます
     * </p>
     *
     * @memberOf h5internal.core
     * @private
     * @param {Function} func フック関数。第1引数にコントローラインスタンスが渡される
     */
    function addControllerInstantiationHook(func) {
        controllerInstantiationHooks.push(func);
    }

    // =============================
    // Expose internally
    // =============================

    // fwOptを引数に取る、コントローラ化を行うメソッドを、h5internal.core.controllerInternalとして内部用に登録
    h5internal.core.controllerInternal = createAndBindController;

    // コントローラ化時にフック関数を登録する関数
    h5internal.core.addControllerInstantiationHook = addControllerInstantiationHook;

    h5internal.core.isDisposing = isDisposing;

    // =============================
    // Expose to window
    // =============================

    /**
     * Core MVCの名前空間
     *
     * @name core
     * @memberOf h5
     * @namespace
     */
    // h5.u.obj.expose('h5.core', {
    const core = {
        /**
         * オブジェクトのコントローラ化と、要素へのバインドを行います。
         *
         * @param {String|Element|jQuery} targetElement バインド対象とする要素のセレクタ、DOMエレメント、もしくはjQueryオブジェクト..<br />
         *            セレクタで指定したときにバインド対象となる要素が存在しない、もしくは2つ以上存在する場合、エラーとなります。
         * @param {Object} controllerDefObj コントローラ定義オブジェクト
         * @param {Object} [args] 初期化パラメータ.<br />
         *            初期化パラメータは __construct, __init, __readyの引数として渡されるオブジェクトの argsプロパティとして格納されます。
         * @returns {Controller} コントローラ
         * @name controller
         * @function
         * @memberOf h5.core
         */
        controller: function(targetElement, controllerDefObj, args) {
            if (arguments.length < 2) {
                throwFwError(ERR_CODE_CONTROLLER_TOO_FEW_ARGS);
            }

            return createAndBindController(targetElement, controllerDefObj, args);
        },

        logic: createLogic,

        /**
         * コントローラ、ロジックを__nameで公開します。<br />
         * 例：__nameが"sample.namespace.controller.TestController"の場合、window.sample.namespace.controller.TestController
         * で グローバルから辿れるようにします。
         *
         * @param {Controller|Logic} obj コントローラ、もしくはロジック
         * @name expose
         * @function
         * @memberOf h5.core
         */
        expose: function(obj) {
            var objName = obj.__name;
            if (!objName) {
                throwFwError(ERR_CODE_EXPOSE_NAME_REQUIRED, null, {
                    target: obj
                });
            }
            var lastIndex = objName.lastIndexOf('.');
            if (lastIndex === -1) {
                window[objName] = obj;
            } else {
                var ns = objName.substr(0, lastIndex);
                var key = objName.substr(lastIndex + 1, objName.length);
                var nsObj = {};
                nsObj[key] = obj;
                u.obj.expose(ns, nsObj);
            }
        }
    }

export default core
