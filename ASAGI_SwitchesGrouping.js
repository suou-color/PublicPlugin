/*
 Version
 1.00 2026/01/24 初版作成
 */
/*:ja
 * @target MZ MV
 * @plugindesc グループスイッチ
 * @orderAfter PluginCommonBase
 * @author あさぎすおう
 * @url https://note.com/suou_color
 *
 * @help ASAGI_SwitchesGrouping.js
 * Ver : 1.00
 * License : MIT license
 * 
 * スイッチをONにしたとき、グループ内の他のスイッチをすべてOFFにします。
 * また、グループ内のスイッチのうち先頭のものをゲームスタート時にONにする設定ができます。
 * スイッチによる設定の切り替えなどにご活用ください
 * 
 * 【プラグインコマンド説明】
 * MZ: スイッチ強制ON
 * MV: AS_SET_COMPULSORY_SWITCH_ON [switchId]
 * グループ内の他のスイッチをOFFにせず、指定のスイッチをONにする
 * switchId : スイッチID
 * 
 * MZ: セルフスイッチ強制ON
 * MV: AS_SET_COMPULSORY_SS_ON [map] [event] [selfSwitch]
 * グループ内の他のスイッチをOFFにせず、指定のセルフスイッチをONにする
 * map : マップID
 * event : イベントID
 * selfSwitch : セルフスイッチ（A,B,C,D）
 * 
 * MZ: グループ内スイッチ全OFF
 * MV: AS_ALL_OFF_IN_GROUP [groupName]
 * グループ内の全てのスイッチ、セルフスイッチをOFFにする
 * groupName : グループ名
 * 
 * 【補足(MZのみ)】
 * トリアコンタン様のベースプラグイン『PluginCommonBase.js』があると"\V[1]"などの変数が使えます。
 * 
 * @command setCompulsorySwitchON
 * @text スイッチ強制ON
 * @desc このコマンドでONにした場合、グループに属していても他のスイッチをOFFにしません
 *
 * @arg switchId
 * @text スイッチID
 * @type switch
 * @default 0
 * 
 * @command setCompulsorySelfSwitchON
 * @text セルフスイッチ強制ON
 * @desc このコマンドでONにした場合、グループに属していても他のセルフスイッチをOFFにしません
 *
 * @arg map
 * @text マップID
 * @desc セルフスイッチのマップID。0の場合現在のマップになります。
 * @default
 * @type map
 * 
 * @arg event
 * @text イベントID
 * @desc セルフスイッチのイベントID。0の場合このイベント自身になります。
 * @default
 * @type number
 * 
 * @arg selfSwitch
 * @text セルフスイッチ
 * @default A
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 * 
 * @command allOffInGroup
 * @text グループ内スイッチ全OFF
 * @desc 指定のグループ内にあるすべてのスイッチ、セルフスイッチをOFFにする。
 * 
 * @arg groupName
 * @text グループ名
 * 
 * @param SingleONGroup
 * @text 単独ＯＮスイッチグループ
 * @desc グループ内でＯＮ状態が１つだけであるスイッチグループ
 * @default []
 * @type struct<SingleONGroupArray>[]
 * 
 * @param SingleONSSGroup
 * @text 単独ＯＮセルフスイッチグループ
 * @desc グループ内でＯＮ状態が１つだけであるセルフスイッチグループ
 * @default []
 * @type struct<SingleONSSGroupArray>[]
 */
/*~struct~SingleONGroupArray:
 * @param groupName
 * @text グループ名
 * @desc スイッチグループの名称。省略可
 * @default
 * @type string
 * 
 * @param startON
 * @text 先頭スイッチ開始時ON
 * @desc リスト先頭のスイッチをゲーム開始時にON状態にする
 * @default false
 * @type boolean
 * 
 * @param switches
 * @text スイッチリスト
 * @default []
 * @type switch[]
 */
/*~struct~SingleONSSGroupArray:
 * @param groupName
 * @text グループ名
 * @desc スイッチグループの名称。省略可
 * @default
 * @type string
 * 
 * @param startON
 * @text 先頭スイッチ開始時ON
 * @desc リスト先頭のスイッチをゲーム開始時にON状態にする
 * @default false
 * @type boolean
 * 
 * @param keys
 * @text セルフスイッチリスト
 * @default []
 * @type struct<SelfSwitchKey>[]
 */
/*~struct~SelfSwitchKey:
 * @param map
 * @text マップID
 * @desc セルフスイッチのマップID
 * @default
 * @type map
 * 
 * @param event
 * @text イベントID
 * @desc セルフスイッチのイベントID
 * @default
 * @type number
 * 
 * @param selfSwitch
 * @text セルフスイッチ
 * @default A
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D 
*/
(() => {
    'use strict';
    const pluginName = "ASAGI_SwitchesGrouping";
    const includesBasePlugin = PluginManager._scripts.includes("PluginCommonBase");
    const script = document.currentScript;

    //=============================================================================
    // definition
    //=============================================================================
    const convertObject = function(obj){
        for(let key of Object.keys(obj)){
            const item = obj[key];
            try{
                obj[key] = convertObject(JSON.parse(item));
            } catch (e)  {
                obj[key] = convertVariables(item);
            };
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

    const param = includesBasePlugin ? PluginManagerEx.createParameter(script) : convertObject(PluginManager.parameters(pluginName));

    //MZ
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
    //MZ
    pluginRegisterCommand('setCompulsorySwitchON', function(args) {
        $gameSwitches.setValueWithoutRegardToGroup(args.switchId, true);
    });    
    pluginRegisterCommand('setCompulsorySelfSwitchON', function(args) {
        const _map = args.map > 0 ? args.map : $gameMap.mapId();
        const _event = args.event > 0 ? args.event : this.eventId();
        if(_map > 0 && _event > 0){
            $gameSelfSwitches.setValueWithoutRegardToGroup([_map, _event, args.selfSwitch], true);
        }
    });    
    pluginRegisterCommand('allOffInGroup', function(args) {
        $gameSwitches.allOffInGroup(args.groupName);
        $gameSelfSwitches.allOffInGroup(args.groupName);
    });    
    
    //MV
    const pluginCommandAdd = function(interpreter, command, args) {
        switch (command) {
            case 'AS_SET_COMPULSORY_SWITCH_ON':
                $gameSwitches.setValueWithoutRegardToGroup(args[0], true);
                break;
            case 'AS_SET_COMPULSORY_SS_ON':
                if(args.length >= 3){
                    const _map = args[0] > 0 ? args[0] : $gameMap.mapId();
                    const _event = args[1] > 0 ? args[1] : this.eventId();
                    if(_map > 0 && _event > 0){
                        $gameSelfSwitches.setValueWithoutRegardToGroup([_map, _event, args[2]], true);
                    }
                }
                break;
            case 'AS_ALL_OFF_IN_GROUP':
                $gameSwitches.allOffInGroup(args[0]);
                $gameSelfSwitches.allOffInGroup(args[0]);
                break;
        }
    };

    //=============================================================================
    // singleONGroup
    //=============================================================================
    const singleONGroup = param.SingleONGroup || [];
    const singleONSSGroup = [];
    for(const group of param.SingleONSSGroup){
        const keys = [];
        if(group.keys){
            for(const key of group.keys){
                keys.push([key.map, key.event, key.selfSwitch]);
            }
        }
        singleONSSGroup.push({
            groupName   : group.groupName,
            startON     : group.startON,
            keys        : keys
        });
    }
    
    //=============================================================================
    // initialize
    //=============================================================================
    const _Game_Switches_initialize    = Game_Switches.prototype.initialize;
    Game_Switches.prototype.initialize = function() {
        _Game_Switches_initialize.apply(this, arguments);
        this.setStartONSwitches();
    };

    Game_Switches.prototype.setStartONSwitches = function() {
        for(let group of singleONGroup){
            if(group.startON && group.switches.length > 0){
                const switchId = group.switches[0];
                if (switchId > 0 && switchId < $dataSystem.switches.length) {
                    this._data[switchId] = true;
                }
            }
        };
    };

    const _Game_SelfSwitches_initialize    = Game_SelfSwitches.prototype.initialize;
    Game_SelfSwitches.prototype.initialize = function() {
        _Game_SelfSwitches_initialize.apply(this, arguments);
        this.setStartONSwitches();
    };

    Game_SelfSwitches.prototype.setStartONSwitches = function() {
        for(let group of singleONSSGroup){
            if(group.startON && group.keys.length > 0){
                const key = group.keys[0];
                this._data[key] = true;
            }
        };
    };

    //=============================================================================
    // setValue
    //=============================================================================
    let _withoutRegardToGroup = false;
    Game_Switches.prototype.setValueWithoutRegardToGroup = function(switchId, value) {
        _withoutRegardToGroup = true;
        this.setValue(switchId, value);
        _withoutRegardToGroup = false;
    };

    const _Game_Switches_setValue    = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(switchId, value) {
        _Game_Switches_setValue.apply(this, arguments);
        if(value && !_withoutRegardToGroup){
            for(let group of singleONGroup){
                if(group.switches.includes(switchId)){
                    for(let otherId of group.switches){
                        if(otherId !== switchId){
                            _Game_Switches_setValue.call(this, otherId, false);
                        }
                    }
                }
            };
        }
        
    };

    Game_SelfSwitches.prototype.setValueWithoutRegardToGroup = function(key, value) {
        _withoutRegardToGroup = true;
        this.setValue(key, value);
        _withoutRegardToGroup = false;
    };

    const _Game_SelfSwitches_setValue    = Game_SelfSwitches.prototype.setValue;
    Game_SelfSwitches.prototype.setValue = function(key, value) {
        _Game_SelfSwitches_setValue.apply(this, arguments);
        if(value && !_withoutRegardToGroup){
            for(let group of singleONSSGroup){
                let inGroupKey = -1;
                if(!group.keys){
                    continue;
                }
                for(let i = 0; i < group.keys.length; i++){
                    const k = group.keys[i];
                    if(k[0] === key[0] && k[1] === key[1] && k[2] === key[2]){
                        inGroupKey = i;
                        break;
                    }
                }

                if(inGroupKey >= 0){
                    for(let i = 0; i < group.keys.length; i++){
                        if(i !== inGroupKey){
                            _Game_SelfSwitches_setValue.call(this, group.keys[i], false);
                        }
                    }
                }
            };
        }
        
    };
    //=============================================================================
    // allOffInGroup
    //=============================================================================
    Game_Switches.prototype.allOffInGroup = function(groupName) {
        if(groupName !== ""){
            for(let group of singleONGroup){
                if(group.groupName === groupName){
                    for(let id of group.switches){
                        this.setValue(id, false);
                    }
                }
            }
        }
    };

    Game_SelfSwitches.prototype.allOffInGroup = function(groupName) {
        if(groupName !== ""){
            for(let group of singleONSSGroup){
                if(group.groupName === groupName){
                    for(let key of group.keys){
                        this.setValue(key, false);
                    }
                }
            }
        }
    };
    //=============================================================================
    // getSingleONGroups
    //=============================================================================
    Game_Switches.prototype.getSingleONGroup = function(groupName) {
        if(groupName !== ""){
            return singleONGroup.filter(group => group.groupName === groupName);
        }
        return [];
    };
    Game_SelfSwitches.prototype.getSingleONSSGroup = function(groupName) {
        if(groupName !== ""){
            return singleONSSGroup.filter(group => group.groupName === groupName);
        }
        return [];
    };

})();