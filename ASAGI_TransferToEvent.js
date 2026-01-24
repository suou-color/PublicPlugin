/*
 Version
 1.01 2026/01/24 convertObject修正
 1.00 2026/01/18 初版作成
 */
/*:ja
 * @target MZ MV
 * @plugindesc イベント基準の相対座標への場所移動
 * @orderAfter PluginCommonBase
 * @author あさぎすおう
 * @url https://note.com/suou_color
 *
 * @help ASAGI_TransferToEvent.js
 * Ver : 1.01
 * License : MIT license
 * 
 * 指定したイベント位置を基準とした相対座標へ場所移動できるプラグインです。
 * イベント基準で指定することでマップの編集で移動先の座標がずれても
 * イベントとの位置関係が同じであれば修正をしなくて済むようになります。
 * イベントの指定はIDのほか、イベント名も使用可能です。
 * 
 * 【プラグインコマンド説明】
 * MZ: 場所移動
 * MV: AS_TRANSFER [map_id] [event_id] [correct_x] [correct_y] [direction] [fadeType]
 * 指定したイベント位置を基準とした相対座標へ場所移動できます。
 * イベントの指定はIDのほか、イベント名も使用可能です。
 * 参照するイベントが見つからない場合は原点座標(0,0)に移動します。
 * 
 * map_id    : 移動先のマップID
 * event_id  : 参照するイベントのID(もしくは名称)
 * correct_x : 参照イベントからずらすX座標の値
 * correct_y : 参照イベントからずらすY座標の値
 * direction : 移動後のプレイヤーの向き　0:そのまま、2：下、4：左、6：右、8：上
 * fadeType  : フェードの種類　0:黒フェード、1:白フェード、2:フェードなし
 * 
 * MZ: 移動時マップリロード
 * MV: AS_NEED_MAPRELOAD
 * 本来、場所移動の移動先が現在と同じマップだった場合、マップのリロードが行われません。
 * このコマンドを実行すると、次の場所移動の移動先が現在と同じマップだとしてもリロードをします。
 * 
 * 【補足(MZのみ)】
 * トリアコンタン様のベースプラグイン『PluginCommonBase.js』があると"\V[1]"などの変数が使えます。
 * 
 * 【謝辞】
 * 作成にあたり、トリアコンタン様の『TemplateEvent.js』を参考にさせていただきました。
 * 
 * @command TransferToEvent
 * @text 場所移動
 * @desc マップID、参照イベントのIDを設定してください。『テキストとして編集』から\v[n]など制御文字も使用可能です。
 *
 * @arg map_id
 * @text 移動先のマップID
 * @desc なし(0)の場合、現在のマップが移動先になります。
 * @type map
 * @default 0
 *
 * @arg event_id
 * @text イベントID(もしくは名称)
 * @desc 参照するイベントのIDもしくはイベント名を記載してください。
 * @default 0
 * 
 * @arg correct_x
 * @text 位置補正X
 * @desc 参照イベントからずらすX座標の値を設定してください。
 * @default 0
 * @min -999
 * @type number
 * 
 * @arg correct_y
 * @text 位置補正Y
 * @desc 参照イベントからずらすY座標の値を設定してください。
 * @default 0
 * @min -999
 * @type number
 * 
 * @arg direction
 * @text 向き
 * @desc 移動後のプレイヤーの向きを設定してください。
 * @default 0
 * @type select
 * @option そのまま
 * @value 0
 * @option 下
 * @value 2
 * @option 左
 * @value 4
 * @option 右
 * @value 6
 * @option 上
 * @value 8
 * 
 * @arg fadeType
 * @text フェード種類
 * @desc フェードの種類を設定してください。
 * @default 0
 * @type select
 * @option 黒フェード
 * @value 0
 * @option 白フェード
 * @value 1
 * @option フェードなし
 * @value 2
 * 
 * @command NeedsMapReload
 * @text 移動時マップリロード
 * @desc 次に実行される場所移動の移動先が現在と同じマップだとしてもマップのリロードをします。
 */
(() => {
    'use strict';
    const pluginName = "ASAGI_TransferToEvent";
    const includesBasePlugin = PluginManager._scripts.includes("PluginCommonBase");
    const script = document.currentScript;

    //=============================================================================
    // definition
    //=============================================================================
    const convertObject = function(obj){
        for(let key of Object.keys(obj)){
            const item = obj[key];
            obj[key] = convertVariables(item);
        };
        return obj;
    };

    const convertVariables = function(text) {
        if (text === 'true') {
            return true;
        } else if (text === 'false') {
            return false;
        } else if (Number(text) === parseFloat(text)) {
            return parseFloat(text);
        } else {
            return text;
        }
    }

    //const param = includesBasePlugin ? PluginManagerEx.createParameter(script) : convertObject(PluginManager.parameters(pluginName));

    const pluginRegisterCommand = function(commandName, func){
        if(includesBasePlugin){
            PluginManagerEx.registerCommand(script, commandName, func);
        }else if(PluginManager.registerCommand){
            PluginManager.registerCommand(pluginName, commandName, function(args) {
                func.call(this, convertObject(args));
            });
        }
    };

    //MV
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        pluginCommandAdd(this, (command || '').toUpperCase(), convertObject(args));
    };

    //=============================================================================
    // pluginCommand
    //=============================================================================
    pluginRegisterCommand('TransferToEvent', function(args) {
        if ($gameParty.inBattle() || $gameMessage.isBusy()) {
            return false;
        }
        $gamePlayer.reserveTransferToEvent(args.map_id, args.event_id, args.correct_x, args.correct_y, args.direction, args.fadeType);
        this.setWaitMode("transfer");
        return true;
    });

    pluginRegisterCommand('NeedsMapReload', function(args) {
        $gamePlayer.requestMapReload();
    });    
    
    //MV
    const pluginCommandAdd = function(interpreter, command, args) {
        switch (command) {
            case 'AS_TRANSFER':
                if ($gameParty.inBattle() || $gameMessage.isBusy()) {
                    break;
                }
                //map_id, event_id, correct_x, correct_y, direction, fadeType
                $gamePlayer.reserveTransferToEvent(args[0], args[1], args[2], args[3], args[4], args[5]);
                interpreter.setWaitMode("transfer");
                break;
            case 'AS_NEED_MAPRELOAD':
                $gamePlayer.requestMapReload();
                break;
        }
    };

    //=============================================================================
    // TransferToEvent
    //=============================================================================
    Game_Player.prototype.reserveTransferToEvent = function(mapId, eventId, correct_x, correct_y, d, fadeType){
        if(mapId === 0){
            mapId = $gameMap.mapId();
        }
        this._transferEventID = eventId;
        this.reserveTransfer(mapId, correct_x, correct_y, d, fadeType);
    };

    const _Game_Player_locate    = Game_Player.prototype.locate;
    Game_Player.prototype.locate = function(x, y) {
        if(this._transferEventID){
            const event = searchEvent(this._transferEventID);
            if(!!event){
                x += event.x;
                y += event.y;
            }else{
                x = 0;
                y = 0;
            }
            delete this._transferEventID;
        }
        _Game_Player_locate.call(this, x, y);
    }
    
    const searchEvent = function(eventID) {
        const event = $gameMap.event(eventID);
        if (!!event) {
            return event;
        } else{
            return searchDataItem($dataMap.events, 'name', eventID);
        }
    };

    //TemplateEvent.js参考
    const searchDataItem = function(dataArray, columnName, columnValue) {
        let result = 0;
        dataArray.some(dataItem => {
            if (dataItem && dataItem[columnName] === columnValue) {
                result = dataItem;
                return true;
            }
            return false;
        });
        return result;
    };
    
})();