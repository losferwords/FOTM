//Сервис звуков в игре
angular.module('fotm').register.service('soundService', ["ngAudio", function(ngAudio) {
    var loadedSounds = [];
    return {
        playSound: function(name){
            loadedSounds[name].play();
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
                loadedSounds[fxNames[i]]=ngAudio.load("sounds/fx/"+fxNames[i]+".mp3");
            }
            for(i=0;i<spellNames.length;i++){
                loadedSounds[spellNames[i]]=ngAudio.load("sounds/fx/spells/"+spellNames[i]+".mp3");
            }
        },
        unbindSounds: function() {
            for(var sound in loadedSounds) {
                if (loadedSounds.hasOwnProperty(sound)) {
                    loadedSounds[sound].unbind();
                }
            }
        }
    }
}]);