export enum TokenType {
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Keyword = "Keyword",
  Operator = "Operator",
  Paren = "Paren",
  Brace = "Brace",
  Bracket = "Bracket",
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