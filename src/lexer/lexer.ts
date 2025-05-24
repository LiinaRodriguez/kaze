export enum TokenType {
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Keyword = "Keyword",
  Operator = "Operator",
  ParenO = "ParenO",
  ParenC = "ParenC",
  BraceO = "BraceO",
  BraceC = "BraceC",
  BracketO = "BracketO",
  BracketC = "BracketC",
  Comma = "Comma",
  Dot = "Dot",
  EOF = "EOF"
}

export type Token = {
  type: TokenType;
  value: string;
  position: number;
};

export enum State {
  Start,
  Identifier,
  Number,
  String,
  Operator,
  Comment,
  Error
}