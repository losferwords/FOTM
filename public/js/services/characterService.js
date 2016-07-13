//Сервис для создания персонажа
(function (module) {
    module.service('characterService', function(gettextCatalog, randomService) {
    var raceDescs = {
        nephilim:  function() {return gettextCatalog.getString("Nephilims are children of angels and humans. They revere the light and eradicate the evil of this world."+
        "Nephilims get random extra-abilities of Sentinel, Redeemer, Prophet and Cleric.")},
        human:    function() {return gettextCatalog.getString("Humans are free to choose their own path."+
        "They get random extra-abilities of all available roles.")},
        cambion:  function() {return gettextCatalog.getString("Cambions are children of demons and humans. They follow the path of chaos and destruction."+
        "Cambions get random extra-abilities of Slayer, Ripper, Malefic and Heretic.")}
    };
    var roleDescs = {
        sentinel:       function() {return gettextCatalog.getString("Sentinels are pain for all casters on the battlefield. " +
        "They use shields to protect themselves and other party members from damage.")},
        slayer:         function() {return gettextCatalog.getString("Slayers are weapon of Devil itself. " +
        "They destroy enemies in melee combat with huge sword and deals a lot of damage.")},
        redeemer:       function() {return gettextCatalog.getString("Redeemers judge all their enemies from long distance. " +
        "They use their range weapons to control situation on battlefield.")},
        ripper:         function() {return gettextCatalog.getString("Rippers are designed to shred the bodies of their victims when they do not expect it. " +
        "Craziness of rippers make them unpredictable.")},
        prophet:        function() {return gettextCatalog.getString("Prophets know a lot about the future. "+
        "They use this knowledge as a weapon to control the fate of their enemies.")},
        malefic:        function() {return gettextCatalog.getString("Malefics bring down fire and death on the battlefield. "+
        "The forces of hell are helping them to inflict enormous damage on their victims.")},
        cleric:         function() {return gettextCatalog.getString("Clerics are called to bring the light of healing into battlefield. "+
        "Their prayers and blessings protect allies from a terrible fate.")},
        heretic:        function() {return gettextCatalog.getString("Heretics sends diseases and curses on the heads of their enemies. "+
        "Their only faith is to drain all life and energy from enemy.")},
        random:         function() {return gettextCatalog.getString("You will get random role of available for chosen race.")}
    };

    return {
        //Описание расы персонажа
        getRaceinfo: function (race) {
            return raceDescs[race]();
        },
        //Описание роли персонажа
        getRoleinfo: function (role) {
            return roleDescs[role]();
        }
    }
});
})(angular.module("fotm"));