import { TokenType, Token } from "../lexer/lexer.js";

export interface Node {
  name: string;
  label: string;
  children: string[];
  color?: string;
  bgcolor?: string;
}

export class Parser {
  private nodes: Map<string, Node>;
  private currentToken: Token;  
  private tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.currentToken = this.tokens[0];
    this.nodes = new Map();
  }

  private consume(expectedType?: TokenType): void {
    if (expectedType && this.currentToken.type !== expectedType) {
      throw new Error(`Unexpected token: ${this.currentToken.value}`);
    }
    this.tokens.shift();
    this.currentToken = this.tokens[0] || { type: TokenType.EOF, value: '', position: -1 };
  }

  public parse(): Map<string, Node> {
    this.parseRoot();
    while (this.currentToken.type !== TokenType.EOF) {
      this.parseNode();
    }
    this.validateReferences();
    return this.nodes;
  }

  private parseRoot(): void {
    this.consume(TokenType.Identifier);
    this.consume(TokenType.Brace);

    const rootNode: Node = {
      name: 'root',
      label: '',
      children: []
    };

    while (this.currentToken.type !== TokenType.Brace) {
      const key = this.currentToken.value;
      this.consume();
      this.consume(TokenType.Operator);

      const value = this.parseValue();

      switch (key) {
        case 'label':
          rootNode.label = value as string;
          break;
        case 'child':
          rootNode.children.push(value as string);
          break;
        case 'color':
          rootNode.color = value as string;
          break;
        case 'bgcolor':
          rootNode.bgcolor = value as string;
          break;
        default:
          throw new Error(`Invalid attribute: ${key}`);
          
      }
      
      if (this.currentToken.type === TokenType.Comma) this.consume();
    }
    
    this.nodes.set('root', rootNode);
    this.consume(TokenType.Brace); // '}'
  }

  private parseNode(): void {
    const nodeName = this.currentToken.value;
    if (this.nodes.has(nodeName)) throw new Error(`Duplicate node: ${nodeName}`);
    this.consume(TokenType.Identifier);
    this.consume(TokenType.Brace); 
    
    const node: Node = {
      name: nodeName,
      label: '',
      children: []
    };

    while (this.currentToken.type !== TokenType.Brace) {
      const key = this.currentToken.value;
      this.consume();
      this.consume(TokenType.Operator); // :
      
      const value = this.parseValue();

      switch (key) {
        case 'label':
          node.label = value as string;

          break;
        case 'child':
          node.children.push(value as string);
          break;
        case 'color':
          node.color = value as string;
          break;
        case 'bgcolor':
          node.bgcolor = value as string;
          break;
        default:
          throw new Error(`Invalid attribute: ${key}`);
      }
      
      if (this.currentToken.type === TokenType.Comma) this.consume();
    }
    
    this.nodes.set(nodeName, node);
    this.consume(TokenType.Brace); // '}'
  }

  private parseValue(): string | number | boolean{
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

  private validateReferences(): void {
    for (const [name, node] of this.nodes) {
      for (const child of node.children) {
        if (!this.nodes.has(child)) {
          throw new Error(`Undefined node reference: ${child} in node ${name}`);
        }
      }
    }
  }
}