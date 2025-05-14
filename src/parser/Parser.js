import { TokenType } from "../lexer/lexer.js";
export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.currentToken = this.tokens[0];
        this.nodes = new Map();
    }
    consume(expectedType) {
        if (expectedType && this.currentToken.type !== expectedType) {
            throw new Error(`Unexpected token: ${this.currentToken.value}`);
        }
        this.tokens.shift();
        this.currentToken = this.tokens[0] || { type: TokenType.EOF, value: '', position: -1 };
    }
    parse() {
        this.parseRoot();
        while (this.currentToken.type !== TokenType.EOF) {
            this.parseNode();
        }
        this.validateReferences();
        return this.nodes;
    }
    parseRoot() {
        this.consume(TokenType.Identifier);
        this.consume(TokenType.Brace);
        const rootNode = {
            name: 'root',
            label: '',
            children: []
        };
        // En parseRoot()
        while (this.currentToken.type !== TokenType.Brace) {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            if (key === 'style') {
                rootNode.style = this.parseStyle();
            }
            else if (key === 'children') { // Nuevo caso para 'children'
                rootNode.children = this.parseChildren();
            }
            else {
                const value = this.parseValue();
                switch (key) {
                    case 'label':
                        rootNode.label = value;
                        break;
                    // Eliminar el caso 'child'
                    default:
                        throw new Error(`Invalid attribute: ${key}`);
                }
            }
            if (this.currentToken.type === TokenType.Comma) {
                this.consume();
            }
        }
        this.nodes.set('root', rootNode);
        this.consume(TokenType.Brace);
    }
    parseNode() {
        const nodeName = this.currentToken.value;
        if (this.nodes.has(nodeName))
            throw new Error(`Duplicate node: ${nodeName}`);
        this.consume(TokenType.Identifier);
        this.consume(TokenType.Brace);
        const node = {
            name: nodeName,
            label: '',
            children: []
        };
        // En parseNode()
        while (this.currentToken.type !== TokenType.Brace) {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            if (key === 'style') {
                node.style = this.parseStyle();
            }
            else if (key === 'children') { // Nuevo caso para 'children'
                node.children = this.parseChildren();
            }
            else {
                const value = this.parseValue();
                switch (key) {
                    case 'label':
                        node.label = value;
                        break;
                    // Eliminar el caso 'child'
                    default:
                        throw new Error(`Invalid attribute: ${key}`);
                }
            }
            if (this.currentToken.type === TokenType.Comma) {
                this.consume();
            }
        }
        this.nodes.set(nodeName, node);
        this.consume(TokenType.Brace); // '}'
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
                this.consume();
                return ref;
            default:
                throw new Error(`Invalid value type: ${this.currentToken.type}`);
        }
    }
    parseChildren() {
        const children = [];
        this.consume(TokenType.Bracket); // Consume '['
        while (this.currentToken.type !== TokenType.Bracket) {
            if (this.currentToken.type !== TokenType.Identifier) {
                throw new Error(`Expected identifier, got ${this.currentToken.type}`);
            }
            children.push(this.currentToken.value);
            this.consume(TokenType.Identifier); // Consume el identificador
            if (this.currentToken.type === TokenType.Comma) {
                this.consume(TokenType.Comma); // Consume la coma si existe
            }
        }
        this.consume(TokenType.Bracket); // Consume ']'
        return children;
    }
    parseStyle() {
        const style = {};
        this.consume(TokenType.Brace);
        while (this.currentToken.type !== TokenType.Brace) {
            const key = this.currentToken.value;
            this.consume();
            this.consume(TokenType.Operator);
            const value = this.parseValue();
            switch (key) {
                case 'color':
                    style.color = value;
                    break;
                case 'bgcolor':
                    style.bgcolor = value;
                    break;
                default:
                    throw new Error(`Invalid style attribute ${key}`);
            }
            if (this.currentToken.type === TokenType.Comma) {
                this.consume();
            }
        }
        this.consume(TokenType.Brace);
        return style;
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
}
