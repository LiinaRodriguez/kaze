export var TokenType;
(function (TokenType) {
    TokenType["Identifier"] = "Identifier";
    TokenType["Number"] = "Number";
    TokenType["String"] = "String";
    TokenType["Keyword"] = "Keyword";
    TokenType["Operator"] = "Operator";
    TokenType["Paren"] = "Paren";
    TokenType["Brace"] = "Brace";
    TokenType["Bracket"] = "Bracket";
    TokenType["Comma"] = "Comma";
    TokenType["Dot"] = "Dot";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
export var State;
(function (State) {
    State[State["Start"] = 0] = "Start";
    State[State["Identifier"] = 1] = "Identifier";
    State[State["Number"] = 2] = "Number";
    State[State["String"] = 3] = "String";
    State[State["Operator"] = 4] = "Operator";
    State[State["Comment"] = 5] = "Comment";
    State[State["Error"] = 6] = "Error";
})(State || (State = {}));
