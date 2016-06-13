//Сервис звуков в игре
(function (module) {
    module.service('soundService', function(ngAudio, $timeout, randomService) {
        var loadedSounds = [];
        var musicObj = {};
        var soundObj = {};
        var soundEnabled = true;
        var musicEnabled = true;
        var musicIndexArrays = {
            city: [],
            battle: []
        };

        //Музыка
        musicObj.winMusic = ngAudio.load("sounds/music/win.mp3");
        musicObj.winMusic.volume=0.1;

        musicObj.loseMusic = ngAudio.load("sounds/music/lose.mp3");
        musicObj.loseMusic.volume=0.1;

        //Звуки
        soundObj.newMessage = ngAudio.load("sounds/fx/chat.mp3");
        soundObj.newMessage.volume=0.1;

        soundObj.joinArena = ngAudio.load("sounds/fx/join-arena.mp3");
        soundObj.joinArena.volume=0.1;

        return {
            playSound: function(name){
                if(!this.soundEnabled) return;
                var newSound = ngAudio.load(loadedSounds[name]);
                newSound.volume=0.1;
                newSound.play();
                $timeout(function(){
                    newSound.destroy();
                },500);
            },
            loadSounds: function(){
                var fxNames = [
                    'block',
                    'death',
                    'dodge',
                    'initiative',
                    'luck',
                    'miss',
                    'move'
                ];

                var spellNames = [
                    'Strong Arm Of The Law',
                    'Defender Of The Faith',
                    'Disarm',
                    'Walk Away',
                    'Sanctuary',
                    'The Punishment Due',
                    'Come And Get It',
                    'New Faith',

                    'Die By The Sword',
                    'Reign In Blood',
                    'Grinder',
                    'Follow The Tears',
                    'Made In Hell',
                    'Spill The Blood',
                    'Dyers Eve',
                    'I Dont Wanna Stop',

                    'Shot Down In Flames',
                    'Electric Eye',
                    'Lights In The Sky',
                    'Thunderstruck',
                    'You Aint No Angel',
                    'State Of Grace',
                    'My Last Words',
                    'Come Cover Me',

                    'Inject The Venom',
                    'Invisible',
                    'Jawbreaker',
                    'Hog Tied',
                    'Running Free',
                    'Fast As The Shark',
                    'Prowler',
                    'Fade To Black',

                    'Stargazer',
                    'Speed Of Light',
                    'Never A Word',
                    'Prophecy',
                    'Lets Me Take It',
                    'Brain Damage',
                    'Infinite Dreams',
                    'Caught Somewhere In Time',

                    'Family Tree',
                    'Fireball',
                    'Burning Ambition',
                    'Thank God For The Bomb',
                    'Thank God For The Bomb (explode)',
                    'Powerslave',
                    'Cauterization',
                    'Down In Flames',
                    'Fight Fire With Fire',

                    'Hammer Of The Gods',
                    'Mercyful Fate',
                    'Holy Smoke',
                    'Laying On Hands',
                    'Cleanse The Soul',
                    'Hallowed Be Thy Name',
                    'Hit The Lights',
                    'Heaven Can Wait',

                    'Bloodsucker',
                    'Fear Of The Dark',
                    'Creeping Death',
                    'Spreading The Disease',
                    'Purgatory',
                    'Children Of The Damned',
                    'Locked And Loaded',
                    'A Touch Of Evil'
                ];

                 for(var i=0;i<fxNames.length;i++){
                    loadedSounds[fxNames[i]]="sounds/fx/"+fxNames[i]+".mp3";
                 }
                 for(i=0;i<spellNames.length;i++){
                    loadedSounds[spellNames[i]]="sounds/fx/spells/"+spellNames[i]+".mp3";
                 }

            },
            chooseAmbient: function(type) {
                if(musicObj.battleAmbience){
                    musicObj.battleAmbience.destroy();
                }
                switch(type){
                    case 0: musicObj.battleAmbience = ngAudio.load("sounds/music/ambience/grass.mp3"); break;
                    case 1: musicObj.battleAmbience = ngAudio.load("sounds/music/ambience/desert.mp3"); break;
                    case 2: musicObj.battleAmbience = ngAudio.load("sounds/music/ambience/snow.mp3"); break;
                }
                musicObj.battleAmbience.loop=true;
                musicObj.battleAmbience.volume=0.04;
                musicObj.battleAmbience.play();
                musicObj.battleAmbience.setMuting(!this.musicEnabled);
            },
            initMusic: function(area) {
                if(area=="city"){
                    init.call(this, "cityMusic", 4, area);
                }
                else if(area=="battle"){
                    init.call(this, "battleMusic", 3, area);
                }

                function init(obj, length, area){
                    var progression = [];
                    for(var i=0;i<length;i++){
                        progression.push(i);
                    }
                    musicIndexArrays[area] = randomService.shuffle(progression);
                    this.playTrack.call(this, area, musicIndexArrays[area][0]);
                }
            },
            nextTrack: function(area) {
                if(area=="city"){
                    next.call(this, 'cityMusic', area);
                }
                else if(area=="battle"){
                    next.call(this, 'battleMusic', area);
                }

                function next(obj, area){
                    var next=musicIndexArrays[area].indexOf(musicObj[obj].index);
                    if(next==(musicIndexArrays[area].length-1)){
                        next=0;
                    }
                    else {
                        next++;
                    }
                    this.playTrack.call(this, area, musicIndexArrays[area][next]);
                }

            },
            playTrack: function(area, index) {
                if(area=="city"){
                    play.call(this, 'cityMusic', index);
                }
                else if(area=="battle"){
                    play.call(this, 'battleMusic', index);
                }

                function play(obj, index) {
                    if(musicObj[obj]) {
                        musicObj[obj] = undefined;
                    }
                    musicObj[obj] = ngAudio.load("sounds/music/"+area+"/"+area+index+".mp3");
                    musicObj[obj].index = index;
                    musicObj[obj].loop=false;
                    musicObj[obj].volume=0.05;
                    musicObj[obj].play();
                    musicObj[obj].setMuting(!this.musicEnabled);
                }

            },
            getMusicObj: function () {
                return musicObj;
            },
            getSoundObj: function() {
                return soundObj;
            },
            get soundEnabled() {
                return soundEnabled;
            },
            set soundEnabled(val){
                for(var sound in soundObj){
                    if(soundObj.hasOwnProperty(sound)){
                        soundObj[sound].setMuting(!val);
                    }
                }
                soundEnabled = val;
            },
            get musicEnabled() {
                return musicEnabled;
            },
            set musicEnabled(val){
                for(var music in musicObj){
                    if(musicObj.hasOwnProperty(music)){
                        musicObj[music].setMuting(!val);
                    }
                }
                musicEnabled = val;
            }
        }
    });
})(angular.module("fotm"));