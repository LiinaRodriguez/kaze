import { TokenType, State } from './lexer';
export class Tokenizer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.currentState = State.Start;
    }
    isAlpha(char) {
        return /^[a-zA-Z_]$/.test(char);
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || /^\d$/.test(char);
    }
    isDigit(char) {
        return /^[0-9]$/.test(char);
    }
    isOperator(char) {
        return /^[+\-*/%=<>!&|^~:]$/.test(char);
    }
    isWhitespace(char) {
        return /^\s$/.test(char);
    }
    nextChar() {
        return this.input[this.position + 1] || '';
    }
    tokenize() {
        const tokens = [];
        let buffer = '';
        let startPos = 0;
        while (this.position < this.input.length) {
            const char = this.input[this.position];
            switch (this.currentState) {
                case State.Start:
                    startPos = this.position;
                    if (this.isAlpha(char)) {
                        this.currentState = State.Identifier;
                        buffer = char;
                    }
                    else if (this.isDigit(char)) {
                        this.currentState = State.Number;
                        buffer = char;
                    }
                    else if (char === '"') {
                        this.currentState = State.String;
                        buffer = '';
                    }
                    else if (char === '/' && this.nextChar() === '/') {
                        this.currentState = State.Comment;
                        this.position++;
                    }
                    else if (this.isOperator(char)) {
                        this.currentState = State.Operator;
                        buffer = char;
                    }
                    else {
                        switch (char) {
                            case '(':
                                tokens.push({ type: TokenType.ParenO, value: char, position: this.position });
                                break;
                            case ')':
                                tokens.push({ type: TokenType.ParenC, value: char, position: this.position });
                                break;
                            case '{':
                                tokens.push({ type: TokenType.BraceO, value: char, position: this.position });
                                break;
                            case '}':
                                tokens.push({ type: TokenType.BraceC, value: char, position: this.position });
                                break;
                            case ',':
                                tokens.push({ type: TokenType.Comma, value: char, position: this.position });
                                break;
                            case '.':
                                tokens.push({ type: TokenType.Dot, value: char, position: this.position });
                                break;
                            case '[':
                                tokens.push({ type: TokenType.BracketO, value: char, position: this.position });
                                break;
                            case ']':
                                tokens.push({ type: TokenType.BracketC, value: char, position: this.position });
                        }
                        if (!this.isWhitespace(char)) {
                            // Manejar errores aquí si es necesario
                        }
                    }
                    break;
                case State.Identifier:
                    if (this.isAlphaNumeric(char)) {
                        buffer += char;
                    }
                    else {
                        tokens.push({
                            type: this.isKeyword(buffer) ? TokenType.Keyword : TokenType.Identifier,
                            value: buffer,
                            position: startPos
                        });
                        this.currentState = State.Start;
                        this.position--; // Revisitar el carácter actual
                    }
                    break;
                case State.Number:
                    if (this.isDigit(char) || (char === '.' && this.isDigit(this.nextChar()))) {
                        buffer += char;
                    }
                    else {
                        tokens.push({
                            type: TokenType.Number,
                            value: buffer,
                            position: startPos
                        });
                        this.currentState = State.Start;
                        this.position--;
                    }
                    break;
                case State.String:
                    if (char === '"') {
                        tokens.push({
                            type: TokenType.String,
                            value: buffer,
                            position: startPos
                        });
                        this.currentState = State.Start;
                    }
                    else {
                        buffer += char;
                    }
                    break;
                case State.Operator:
                    if (this.isOperator(char)) {
                        buffer += char;
                    }
                    else {
                        tokens.push({
                            type: TokenType.Operator,
                            value: buffer,
                            position: startPos
                        });
                        this.currentState = State.Start;
                        this.position--;
                    }
                    break;
                case State.Comment:
                    if (char === '\n') {
                        this.currentState = State.Start;
                    }
                    break;
            }
            this.position++;
        }
        if (this.currentState !== State.Start) {
            switch (this.currentState) {
                case State.Identifier:
                    tokens.push({
                        type: this.isKeyword(buffer) ? TokenType.Keyword : TokenType.Identifier,
                        value: buffer,
                        position: startPos
                    });
                    break;
                case State.Number:
                    tokens.push({
                        type: TokenType.Number,
                        value: buffer,
                        position: startPos
                    });
                    break;
                case State.Operator:
                    tokens.push({
                        type: TokenType.Operator,
                        value: buffer,
                        position: startPos
                    });
                    break;
                case State.String:
                    // Manejar strings no cerrados (error)
                    tokens.push({
                        type: TokenType.String,
                        value: buffer,
                        position: startPos
                    });
                    break;
                case State.Comment:
                    // Los comentarios no generan tokens
                    break;
                default:
                    // Manejar estado de error
                    break;
            }
        }
        tokens.push({ type: TokenType.EOF, value: 'EOF', position: this.position });
        return tokens;
    }
    isKeyword(value) {
        const keywords = ['if', 'else', 'while', 'for', 'function', 'return', 'true', 'false'];
        return keywords.includes(value);
    }
}
