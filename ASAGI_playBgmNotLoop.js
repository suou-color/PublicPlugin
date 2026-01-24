/*
 Version
 1.03 2026/01/24 convertObject修正
 1.02 2026/01/21 BGMの再開時、ループありなしはスイッチではなく保存内容に依存するように変更
 1.01 2026/01/18 単独で動作するよう改修
 1.00 2026/01/17 初版作成
 */
/*:ja
 * @target MZ
 * @plugindesc ループなしBGM演奏プラグイン
 * @orderAfter PluginCommonBase
 * @author あさぎすおう
 * @url https://note.com/suou_color
 *
 * @help ASAGI_playBgmNotLoop.js
 * Ver : 1.03
 * License : MIT license
 * 
 * BGMをループなし指定で演奏できるプラグインです。
 * 方法は以下の２つです。
 * ・プラグインコマンドから『ループなしBGM演奏』を選択する。
 * ・『ループなしBGMスイッチ』を設定し、そのスイッチをONにしてからBGMを演奏する。
 * 
 * また、プラグインコマンドの『演奏中BGMのループ仕様変更』では、現在流れているBGMの
 * ループ仕様を途中で変更することができます。
 * 
 * 【注意１】
 * 『ループありBGM』と『ループなしBGM』は別の曲として判定します。そのため、
 * 『ループあり』の演奏途中で『ループなし』の演奏を実行すると、同じ曲でも最初からBGMが流れます。
 * 演奏中にループ仕様を変更したい場合は『演奏中BGMのループ仕様変更』を使用してください。
 * 
 * 【注意２】
 * 『演奏中BGMのループ仕様変更』は演奏開始直後では反映されないことがあります。
 * 目安として演奏開始から10フレーム以上たってから使用するようにしてください。
 * 
 * 【補足】
 * トリアコンタン様のベースプラグイン『PluginCommonBase.js』があると"\V[1]"などの変数が使えます。
 * 
 * @command PlayBgmNotLoop
 * @text ループなしBGM演奏
 * @desc 指定したBGMをループ仕様なしで演奏します。
 *
 * @arg FilePath
 * @text ファイルパス
 * @desc BGMファイルを指定してください。
 * @default
 * @require 1
 * @dir audio/bgm/
 * @type file
 * 
 * @arg Volume
 * @text 音量
 * @desc 演奏するオーディオの音量です。
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @arg Pitch
 * @text ピッチ
 * @desc 演奏するオーディオのピッチです。
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @arg Pan
 * @text 位相
 * @desc 演奏するオーディオの位相です。
 * @default 0
 * @type number
 * @min -100
 * @max 100
 * 
 * @command SetBgmLoop
 * @text 演奏中BGMのループ仕様変更
 * @desc 現在演奏中のBGMのループ仕様を変更します。※演奏開始直後は変更できないため、10フレーム以上たってから設定してください。
 * 
 * @arg Loop
 * @text ループ仕様変更内容
 * @desc 注意：現在の演奏位置がループ範囲よりも後ろの場合は設定変更できません。
 * @type boolean
 * @default true
 * @on ループあり
 * @off ループなし
 * 
 * @param NotLoopSwitch
 * @text ループなしBGMスイッチ
 * @desc このスイッチがONのときにBGMを演奏すると、そのBGMはループしません。
 * @type switch
 * @default 0
 * 
 * @param SettingToResetNotLoopSwitch
 * @text スイッチのリセット設定
 * @desc この設定をONにすると、BGM演奏実行後に『ループなしBGMスイッチ』を自動でOFFにします。
 * @type boolean
 * @default false
 */
/*:
 * @target MZ
 * @plugindesc No-Loop BGM Plugin
 * @orderAfter PluginCommonBase
 * @author Asagi Suou
 * @url https://note.com/suou_color
 *
 * @help ASAGI_playBgmNotLoop.js
 * Ver : 1.03
 * License : MIT license
 * 
 * This plugin allows you to play BGM without looping.
 * There are two methods:
 * ・Select ‘No-Loop BGM Play’ from the plugin commands.
 * ・Set up ‘No-Loop BGM Switch’, turn it ON, then play the BGM.
 * 
 * The plugin command “Change Loop Setting” allows you to modify the loop settings of the currently playing BGM.
 * 
 * 【Caution.1】
 * “Loop BGM” and “No-Loop BGM” are treated as separate songs.
 * Therefore, if you start playing a “No-Loop BGM”  song while a “Loop BGM” song is playing,
 * the BGM will start over from the beginning even if it's the same song.
 * In such cases, please use the plugin command “Change Loop Setting”.
 * 
 * 【Caution.2】
 * The plugin command “Change Loop Setting” may not take effect immediately after starting playback.
 * We recommend using this after at least 10 frames have passed since starting playback.
 * 
 * 【Memo】
 * If you have triacontane's base plugin "PluginCommonBase.js", variables like '\V[1]' can be used.
 * 
 * @command PlayBgmNotLoop
 * @text No-Loop BGM Play
 * @desc Plays the specified BGM without looping.
 *
 * @arg FilePath
 * @desc Specify the BGM file.
 * @default
 * @require 1
 * @dir audio/bgm/
 * @type file
 * 
 * @arg Volume
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @arg Pitch
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @arg Pan
 * @default 0
 * @type number
 * @min -100
 * @max 100
 * 
 * @command SetBgmLoop
 * @text Change Loop Setting
 * @desc Change the loop settings for the currently playing BGM.
 * 
 * @arg Loop
 * @desc If the current position is behind the loop range, you cannot change the settings.
 * @type boolean
 * @default true
 * @on Loop
 * @off No-Loop
 * 
 * @param NotLoopSwitch
 * @text No-Loop BGM Switch
 * @desc After turning this switch ON, the BGM will not loop when played.
 * @type switch
 * @default 0
 * 
 * @param SettingToResetNotLoopSwitch
 * @text No-Loop Switch Reset Setting
 * @desc ‘No-Loop BGM Switch’ will automatically turn OFF after BGM starting playback.
 * @type boolean
 * @default false
 */
(() => {
    'use strict';
    const pluginName = "ASAGI_playBgmNotLoop";
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

    const param = includesBasePlugin ? PluginManagerEx.createParameter(script) : convertObject(PluginManager.parameters(pluginName));

    const pluginRegisterCommand = function(commandName, func){
        if(includesBasePlugin){
            PluginManagerEx.registerCommand(script, commandName, func);
        }else if(PluginManager.registerCommand){
            PluginManager.registerCommand(pluginName, commandName, function(args) {
                func.call(this, convertObject(args));
            });
        }
    };

    //=============================================================================
    // pluginCommand
    //=============================================================================
    pluginRegisterCommand('PlayBgmNotLoop', function(args) {
        const setting = {name: args.FilePath, volume: args.Volume, pitch: args.Pitch, pan: args.Pan};
        AudioManager.playBgmNotLoop(setting);
    });

    pluginRegisterCommand('SetBgmLoop', function(args) {
        AudioManager.setBgmLoop(args.Loop);
    });

    //=============================================================================
    // playBgmNotLoop
    //=============================================================================
    const _AudioManager_playBgm = AudioManager.playBgm;
    AudioManager.playBgm = function(bgm, pos) {
        let playNotLoop;
        if(bgm.replayNotLoop != null){
            playNotLoop = bgm.replayNotLoop;
        }else{
            playNotLoop = $gameSwitches.value(param.NotLoopSwitch);
        }

        if(!playNotLoop){
            _AudioManager_playBgm.apply(this, arguments);
        }else{
            this.playBgmNotLoop(bgm, pos);
        }
    };

    AudioManager.playBgmNotLoop = function(bgm, pos) {
        bgm.notloop = true;
        if (this.isCurrentBgm(bgm)) {
            this.updateBgmParameters(bgm);
        } else {
            this.stopBgm();
            if (bgm.name) {
                this._bgmBuffer = this.createBuffer("bgm/", bgm.name);
                this.updateBgmParameters(bgm);
                if (!this._meBuffer) {
                    this._bgmBuffer.play(false, pos || 0);
                }
            }
        }
        this.updateCurrentBgm(bgm, pos);
        if(this._bgmBuffer){
            this._bgmBuffer.addStopListener(this.stopBgm.bind(this));
        }
        if(param.SettingToResetNotLoopSwitch){
            $gameSwitches.setValue(param.NotLoopSwitch, false);
        }
    };
    
    const _AudioManager_isCurrentBgm = AudioManager.isCurrentBgm;
    AudioManager.isCurrentBgm = function(bgm) {
        return (
            _AudioManager_isCurrentBgm.apply(this, arguments) &&
            !!this._currentBgm.notloop === !!bgm.notloop
        );
    };

    const _AudioManager_updateCurrentBgm = AudioManager.updateCurrentBgm;
    AudioManager.updateCurrentBgm = function(bgm, pos) {
        _AudioManager_updateCurrentBgm.apply(this, arguments);
        this._currentBgm.notloop = !!bgm.notloop;
    };
    
    //=============================================================================
    // replayBgm
    //=============================================================================
    const _AudioManager_replayBgm = AudioManager.replayBgm;
    AudioManager.replayBgm = function(bgm) {
        if (!this.isCurrentBgm(bgm)) {
            bgm.replayNotLoop = bgm.notloop;
        }
        _AudioManager_replayBgm.call(this, bgm);
        delete bgm.replayNotLoop;
    };

    const _AudioManager_saveBgm = AudioManager.saveBgm;
    AudioManager.saveBgm = function() {
        const bgm = _AudioManager_saveBgm.apply(this, arguments);
        if (this._currentBgm) {
            bgm.notloop = this._currentBgm.notloop;
        }
        return bgm;
    };
    
    //=============================================================================
    // setBgmLoop
    //=============================================================================
    AudioManager.setBgmLoop = function(loop) {
        const bgm = this._bgmBuffer;
        if(bgm && bgm._loop != loop){
            const pos = bgm.seek_loopConsideration();
            if(pos < bgm._loopStartTime + bgm._loopLengthTime){
                bgm.play(loop, pos);
                this._currentBgm.notloop = !loop;
                if(loop){
                    //bgm.clearStopListener();
                } else{
                    bgm.addStopListener(this.stopBgm.bind(this));
                }
            }
        }
    };

    WebAudio.prototype.seek_loopConsideration = function() {
        if (WebAudio._context) {
            let pos = (WebAudio._currentTime() - this._startTime) * this._pitch;
            if (this._loop && this._loopLengthTime > 0) {
                while (pos >= this._loopStartTime + this._loopLengthTime) {
                    pos -= this._loopLengthTime;
                }
            }
            return pos;
        } else {
            return 0;
        }
    };

    // WebAudio.prototype.clearStopListener = function() {
    //     this._stopListeners = [];
    // };
})();