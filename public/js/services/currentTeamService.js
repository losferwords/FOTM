//������ ��� �������� �������� ��������� ������� ��� ����������
(function (module) {
    module.service('currentTeam', function() {
        var _team = {};
        var _currentCharIndex = {};
        return {
            get: function() { return _team },
            set: function(newTeam) { _team = newTeam },
            getChar: function(id) {
                for(var i=0; i<_team.characters.length;i++){
                    if(_team.characters[i].id == id) return _team.characters[i];
                }
            },
            setChar: function(char) {
                for(var i=0; i<_team.characters.length;i++){
                    if(_team.characters[i].id == char.id) {
                        _team.characters[i]=char;
                    }
                }
            },
            getCurrentCharIndex: function() { return _currentCharIndex },
            setCurrentCharIndex: function(index) { _currentCharIndex = index },
            selectPrevChar: function() {
                var prevCharIndex;
                switch(_currentCharIndex){
                    case 0:
                        if(!_team.characters[2].lose) {
                            prevCharIndex=2;
                        }
                        else {
                            prevCharIndex=1;
                        }
                        break;
                    case 1:
                        if(!_team.characters[0].lose) {
                            prevCharIndex=0;
                        }
                        else {
                            prevCharIndex=2;
                        }
                        break;
                    case 2:
                        if(!_team.characters[1].lose) {
                            prevCharIndex=1;
                        }
                        else {
                            prevCharIndex=0;
                        }
                        break;
                }
                if(_team.characters[prevCharIndex])
                    _currentCharIndex = prevCharIndex;
            },
            selectNextChar: function() {
                var nextCharIndex;
                switch(_currentCharIndex){
                    case 0:
                        if(!_team.characters[1].lose) {
                            nextCharIndex=1;
                        }
                        else {
                            nextCharIndex=2;
                        }
                        break;
                    case 1:
                        if(!_team.characters[2].lose) {
                            nextCharIndex=2;
                        }
                        else {
                            nextCharIndex=0;
                        }
                        break;
                    case 2:
                        if(!_team.characters[0].lose) {
                            nextCharIndex=0;
                        }
                        else {
                            nextCharIndex=1;
                        }
                        break;
                }
                if(_team.characters[nextCharIndex])
                    _currentCharIndex = nextCharIndex;
            }
        }
    });
})(angular.module("fotm"));
