/*
 Version
 1.00 2026/01/10 初版作成（テスト中）
 */
/*:ja
 * @target MZ
 * @base PluginCommonBase
 * @plugindesc ループなしBGM再生プラグイン
 * @author あさぎすおう
 *
 * @help ASAGI_playBgmNotLoop.js
 * Ver : 1.00
 * License : MIT license
 * 
 * BGMをループなし指定で再生できるプラグインです。
 * 方法は以下の２つです。
 * ・プラグインコマンドから『ループなしBGM再生』を選択する。
 * ・『ループなしBGMスイッチ』を設定し、そのスイッチをONにしてからBGMを再生する。
 * 
 * また、プラグインコマンドの『演奏中BGMのループ仕様変更』では、現在流れているBGMの
 * ループ仕様を途中で変更することができます。
 * 
 * 【注意１】
 * 『ループありBGM』と『ループなしBGM』は別の曲として判定します。そのため、
 * 『ループあり』の演奏途中で『ループなし』の再生を実行すると、同じ曲でも最初からBGMが流れます。
 * 演奏中にループ仕様を変更したい場合は『演奏中BGMのループ仕様変更』を使用してください。
 * 
 * 【注意２】
 * このプラグインの利用にはトリアコンタン様のベースプラグイン『PluginCommonBase.js』が必要です。
 * 
 * @param NotLoopSwitch
 * @text ループなしBGMスイッチ
 * @desc このスイッチがONのときにBGMを再生すると、そのBGMはループしません。
 * @type switch
 * @default 0
 * 
 * @param SettingToResetNotLoopSwitch
 * @text スイッチのリセット設定
 * @desc この設定をONにすると、BGM再生実行後に『ループなしBGMスイッチ』を自動でOFFにします。
 * @type boolean
 * @default false
 * 
 * @command PlayBgmNotLoop
 * @text ループなしBGM再生
 * @desc 指定したBGMをループ仕様なしで再生します。
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
 */
(() => {
    'use strict';
    const script = document.currentScript;
    console.log(PluginManager.parameters("ASAGI_playBgmNotLoop"));
    const param  = PluginManagerEx.createParameter(script);
    //const paramText = PluginManager.parameters(this.findPluginName(script));
    //console.log(paramText);
    //=============================================================================
    // プラグインコマンド
    //=============================================================================
    PluginManagerEx.registerCommand(script, 'PlayBgmNotLoop', function(args) {
        const param = {name: args.FilePath, volume: args.Volume, pitch: args.Pitch, pan: args.Pan};
        AudioManager.playBgmNotLoop(param);
    });
    PluginManagerEx.registerCommand(script, 'SetBgmLoop', function(args) {
        AudioManager.setBgmLoop(args.Loop);
    });
    //=============================================================================
    // ループなしBGM再生
    //=============================================================================
    const _AudioManager_playBgm = AudioManager.playBgm;
    AudioManager.playBgm = function(bgm, pos) {
        if(!$gameSwitches.value(param.NotLoopSwitch)){
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
        this._bgmBuffer.addStopListener(this.stopBgm.bind(this));
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
    // 現在のBGMのループ仕様を変更する（BGM鳴らしてすぐだと反映されない）
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

    //シーク（ループ有無考慮）
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