import { TokenType } from "../lexer/lexer.js";
import { StackAutomaton } from './stackAutomaton';
export class Parser {
    constructor(tokens) {
        this.tokens = [...tokens];
        this.currentToken = this.tokens[0];
        this.nodes = new Map();
        this.automaton = new StackAutomaton();
    }
    consume(expectedType) {
        if (expectedType && this.isDelimiter(expectedType)) {
            this.handleDelimiter(expectedType);
        }
        if (expectedType && this.currentToken.type !== expectedType) {
            throw new Error(`Unexpected token: ${this.currentToken.value} (expected ${expectedType})`);
        }
        this.tokens.shift();
        this.currentToken = this.tokens[0] || { type: TokenType.EOF, value: '', position: -1 };
    }
    isDelimiter(type) {
        return [
            TokenType.BraceO, TokenType.BraceC,
            TokenType.BracketO, TokenType.BracketC,
            TokenType.ParenO, TokenType.ParenC
        ].includes(type);
    }
    handleDelimiter(type) {
        const delimiterMap = {
            [TokenType.BraceO]: '{',
            [TokenType.BraceC]: '}',
            [TokenType.BracketO]: '[',
            [TokenType.BracketC]: ']',
            [TokenType.ParenO]: '(',
            [TokenType.ParenC]: ')',
        };
        const symbol = delimiterMap[type];
        if (symbol === '{' || symbol === '[' || symbol === '(') {
            this.automaton.pushDelimiter(symbol);
        }
        else {
            this.automaton.popDelimiter(symbol);
        }
    }
    parseRoot() {
        this.consume(TokenType.Identifier);
        this.consume(TokenType.BraceO);
        this.automaton.pushDelimiter('{');
        const rootNode = {
            name: 'root',
            label: '',
            children: []
        };
        this.parseAttributes(() => {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            if (key === 'style') {
                rootNode.style = this.parseStyle();
            }
            else if (key === 'children') {
                rootNode.children = this.parseChildren();
            }
            else {
                const value = this.parseValue();
                switch (key) {
                    case 'label':
                        rootNode.label = value;
                        break;
                    default:
                        throw new Error(`Invalid attribute: ${key}`);
                }
            }
        });
        this.nodes.set('root', rootNode);
        if (!rootNode.label) {
            throw new Error('Root node must have a label');
        }
        this.consume(TokenType.BraceC);
        this.automaton.popDelimiter('}');
    }
    parseNode() {
        const nodeName = this.currentToken.value;
        if (this.nodes.has(nodeName))
            throw new Error(`Duplicate node: ${nodeName}`);
        this.consume(TokenType.Identifier);
        this.consume(TokenType.BraceO);
        this.automaton.pushDelimiter('{');
        const node = {
            name: nodeName,
            label: '',
            children: []
        };
        this.parseAttributes(() => {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            if (key === 'style') {
                node.style = this.parseStyle();
            }
            else if (key === 'children') {
                node.children = this.parseChildren();
            }
            else {
                const value = this.parseValue();
                switch (key) {
                    case 'label':
                        node.label = value;
                        break;
                    default:
                        throw new Error(`Invalid attribute: ${key}`);
                }
            }
        });
        this.nodes.set(nodeName, node);
        if (!node.label) {
            throw new Error(`Node '${nodeName}' must have a label`);
        }
        this.consume(TokenType.BraceC); // '}'
        this.automaton.popDelimiter('}');
    }
    parseValue() {
        switch (this.currentToken.type) {
            case TokenType.String:
                const str = this.currentToken.value;
                this.consume();
                return str;
            case TokenType.Number:
                const num = parseFloat(this.currentToken.value);
                this.consume();
                return num;
            case TokenType.Identifier:
                const ref = this.currentToken.value;
                // Si es un color hexadecimal (comienza con #), lo procesamos como está
                if (ref.startsWith('#')) {
                    this.consume();
                    return ref;
                }
                // Si es un color hexadecimal sin #, le añadimos el #
                if (/^[0-9a-fA-F]{6}$/.test(ref)) {
                    this.consume();
                    return `#${ref}`;
                }
                this.consume();
                return ref;
            default:
                throw new Error(`Invalid value type: ${this.currentToken.type}`);
        }
    }
    parseChildren() {
        const children = [];
        this.automaton.pushDelimiter('[');
        this.consume(TokenType.BracketO);
        let expectElement = true;
        while (this.currentToken.type !== TokenType.BracketC) {
            if (expectElement) {
                if (this.currentToken.type !== TokenType.Identifier) {
                    throw new Error(`Expected identifier, got ${this.currentToken.type}`);
                }
                children.push(this.currentToken.value);
                this.consume(TokenType.Identifier);
                expectElement = false;
            }
            else {
                if (this.currentToken.type === TokenType.Comma) {
                    this.consume(TokenType.Comma);
                    expectElement = true;
                }
                else {
                    throw new Error(`Expected comma between children`);
                }
            }
        }
        this.consume(TokenType.BracketC);
        this.automaton.popDelimiter(']');
        return children;
    }
    parseStyle() {
        const style = {};
        this.consume(TokenType.BraceO);
        this.automaton.pushDelimiter('{');
        this.parseAttributes(() => {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            const value = this.parseValue();
            switch (key) {
                case 'color':
                    if (!/^#?[0-9a-fA-F]{6}$/.test(value)) {
                        throw new Error(`Invalid hex color format for '${key}': ${value}`);
                    }
                    style.color = value;
                    break;
                case 'bgcolor':
                    if (!/^#?[0-9a-fA-F]{6}$/.test(value)) {
                        throw new Error(`Invalid hex color format for '${key}': ${value}`);
                    }
                    style.bgcolor = value;
                    break;
                default:
                    throw new Error(`Invalid style attribute ${key}`);
            }
        });
        this.consume(TokenType.BraceC);
        this.automaton.popDelimiter('}');
        return style;
    }
    parseAttributes(callback) {
        let firstAttributeParsed = false;
        while (this.currentToken.type !== TokenType.BraceC) {
            // Validar que no haya tokens inesperados
            if (this.currentToken.type === TokenType.EOF) {
                throw new Error(`Unexpected end of input while parsing attributes`);
            }
            if (firstAttributeParsed) {
                if (this.currentToken.type === TokenType.Comma) {
                    this.consume(TokenType.Comma);
                }
                else {
                    const foundToken = this.currentToken.value;
                    throw new Error(`Missing comma between attributes. Found '${foundToken}' at position ${this.currentToken.position}`);
                }
            }
            if (this.currentToken.type !== TokenType.Identifier) {
                throw new Error(`Expected attribute name, found: ${this.currentToken.value}`);
            }
            callback();
            firstAttributeParsed = true;
        }
    }
    validateReferences() {
        for (const [name, node] of this.nodes) {
            for (const child of node.children) {
                if (!this.nodes.has(child)) {
                    throw new Error(`Undefined node reference: ${child} in node ${name}`);
                }
            }
        }
    }
    parse() {
        try {
            // Validar que el primer token sea 'root' y el segundo sea '{'
            if (this.tokens[0]?.type !== TokenType.Identifier || this.tokens[0]?.value !== 'root') {
                throw new Error('Document must start with root node');
            }
            if (this.tokens[1]?.type === TokenType.BraceC) {
                throw new Error('Unexpected token: } (expected {)');
            }
            this.parseRoot();
            while (this.currentToken.type !== TokenType.EOF) {
                this.parseNode();
            }
            this.validateReferences();
            this.automaton.validateEmptyStack();
            return this.nodes;
        }
        catch (error) {
            throw error;
        }
    }
}
