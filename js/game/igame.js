export var ChunkKind;
(function (ChunkKind) {
    ChunkKind[ChunkKind["dialog"] = 0] = "dialog";
    ChunkKind[ChunkKind["text"] = 1] = "text";
    ChunkKind[ChunkKind["background"] = 2] = "background";
    ChunkKind[ChunkKind["inline"] = 3] = "inline";
    ChunkKind[ChunkKind["heading"] = 4] = "heading";
    ChunkKind[ChunkKind["doo"] = 5] = "doo";
    ChunkKind[ChunkKind["minigame"] = 6] = "minigame";
    ChunkKind[ChunkKind["gameresult"] = 7] = "gameresult";
    ChunkKind[ChunkKind["waitclick"] = 8] = "waitclick";
    ChunkKind[ChunkKind["title"] = 9] = "title";
    ChunkKind[ChunkKind["style"] = 10] = "style";
})(ChunkKind || (ChunkKind = {}));
export var Op;
(function (Op) {
    Op[Op["START_BLURBING"] = 0] = "START_BLURBING";
    Op[Op["BLURB"] = 1] = "BLURB";
    Op[Op["BUILD_CHOICES"] = 2] = "BUILD_CHOICES";
})(Op || (Op = {}));
export var OpAction;
(function (OpAction) {
    OpAction[OpAction["SHOWING_CHOICES"] = 0] = "SHOWING_CHOICES";
    OpAction[OpAction["GAME_START"] = 1] = "GAME_START";
    OpAction[OpAction["SHOWING_MOMENT"] = 2] = "SHOWING_MOMENT";
})(OpAction || (OpAction = {}));
