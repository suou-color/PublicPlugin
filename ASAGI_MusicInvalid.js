/*
 Version
 1.00 2026/01/20 初版作成
 */
/*:ja
 * @target MZ MV
 * @plugindesc 演奏無効
 * @orderAfter PluginCommonBase
 * @orderAfter ASAGI_playBgmNotLoop
 * @author あさぎすおう
 * @url https://note.com/suou_color
 *
 * @help ASAGI_MusicInvalid.js
 * Ver : 1.00
 * License : MIT license
 * 
 * BGM, BGS, ME, SE, システムサウンド(※1)の演奏を無効にするスイッチをそれぞれ作成できます。
 * あくまで演奏開始を無効にするものであり、すでに演奏中のものはそのまま流れ続けます。
 * プラグインコマンドを使用して無効中でも例外的に演奏したい音楽を演奏することもできます。
 * ※1:システムサウンドとは、決定音など『データベース』の『システム』で設定している効果音のこと
 * 
 * 【プラグインコマンド説明】
 * MZ: 一時的演奏許可
 * MV: AS_TEMP_MUSIC_LICENSE
 * このプラグインコマンド実行後の次に流れる音楽に限り、無効中だったとしても演奏されます。
 * 
 * 【補足(MZのみ)】
 * トリアコンタン様のベースプラグイン『PluginCommonBase.js』があると"\V[1]"などの変数が使えます。
 * 
 * @command TemporaryMusicLicense
 * @text 一時的演奏許可
 * @desc 次に実行する演奏に限り、無効中でも演奏されます。
 * 
 * @param Id_DontPlayBgm
 * @text BGM無効スイッチ
 * @desc ここで指定したスイッチがONのとき、BGM演奏は無効になります。
 * @type switch
 * @default 0
 * 
 * @param Id_DontPlayBgs
 * @text BGS無効スイッチ
 * @desc ここで指定したスイッチがONのとき、BGS演奏は無効になります。
 * @type switch
 * @default 0
 * 
 * @param Id_DontPlayMe
 * @text ME無効スイッチ
 * @desc ここで指定したスイッチがONのとき、ME演奏は無効になります。
 * @type switch
 * @default 0
 * 
 * @param Id_DontPlaySe
 * @text SE無効スイッチ
 * @desc ここで指定したスイッチがONのとき、システムサウンドを除いたSE演奏は無効になります。
 * @type switch
 * @default 0
 * 
 * @param Id_DontPlayStaticSe
 * @text システムサウンド無効スイッチ
 * @desc ここで指定したスイッチがONのとき、システムサウンドの演奏は無効になります。
 * @type switch
 * @default 0
 */
(() => {
    'use strict';
    const pluginName = "ASAGI_MusicInvalid";
    const includesBasePlugin = PluginManager._scripts.includes("PluginCommonBase");
    const script = document.currentScript;

    //=============================================================================
    // definition
    //=============================================================================
    const convertObject = function(obj){
        for(let key of Object.keys(obj)){
            const item = obj[key];
            if(item === String(item)){
                obj[key] = convertVariables(item);
            }else{
                convertObject(item);
            }
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
    pluginRegisterCommand('TemporaryMusicLicense', function(args) {
        AudioManager.setTemporaryMusicLicense();
    });    
    
    //MV
    const pluginCommandAdd = function(interpreter, command, args) {
        switch (command) {
            case 'AS_TEMP_MUSIC_LICENSE':
                AudioManager.setTemporaryMusicLicense();
                break;
        }
    };

    //=============================================================================
    // main
    //=============================================================================
    AudioManager.setTemporaryMusicLicense = function(license = true){
        AudioManager._temporaryMusicLicense = license;
    };

    //bgm
    const _AudioManager_playBgm = AudioManager.playBgm;
    AudioManager.playBgm = function(bgm, pos) {
        const id = param.Id_DontPlayBgm;
        if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
             _AudioManager_playBgm.apply(this, arguments);
        }
        AudioManager._temporaryMusicLicense = false;
    };

    //ASAGI_playBgmNotLoop.js
    const _AudioManager_playBgmNotLoop = AudioManager.playBgmNotLoop;
    AudioManager.playBgmNotLoop = function(bgm, pos) {
        if(_AudioManager_playBgmNotLoop){
            const id = param.Id_DontPlayBgm;
            if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
                _AudioManager_playBgmNotLoop.apply(this, arguments);
            }
            AudioManager._temporaryMusicLicense = false;
        }
    };

    //bgs
    const _AudioManager_playBgs = AudioManager.playBgs;
    AudioManager.playBgs = function(bgs, pos) {
        const id = param.Id_DontPlayBgs;
        if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
             _AudioManager_playBgs.apply(this, arguments);
        }
        AudioManager._temporaryMusicLicense = false;
    };

    //me
    const _AudioManager_playMe = AudioManager.playMe;
    AudioManager.playMe = function(me) {
        const id = param.Id_DontPlayMe;
        if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
             _AudioManager_playMe.apply(this, arguments);
        }
        AudioManager._temporaryMusicLicense = false;
    };

    //se
    const _AudioManager_playSe = AudioManager.playSe;
    AudioManager.playSe = function(se) {
        const id = param.Id_DontPlaySe;
        if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
             _AudioManager_playSe.apply(this, arguments);
        }
        AudioManager._temporaryMusicLicense = false;
    };

    //staticSe
    const _AudioManager_playStaticSe = AudioManager.playStaticSe;
    AudioManager.playStaticSe = function(se) {
        const id = param.Id_DontPlayStaticSe;
        if(!$gameSwitches.value(id) || AudioManager._temporaryMusicLicense){
             _AudioManager_playStaticSe.apply(this, arguments);
        }
        AudioManager._temporaryMusicLicense = false;
    };


})();