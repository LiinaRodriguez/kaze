import { TokenType, Token } from "../lexer/lexer.js";

export interface Node {
  name: string;
  label: string;
  children: string[];
  style?: {
    color?: string,
    bgcolor?: string,
  }
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
    this.consume(TokenType.BraceO);
  
    const rootNode: Node = {
      name: 'root',
      label: '',
      children: []
    };
  
    // En parseRoot()
    while (this.currentToken.type !== TokenType.BraceC) {
      const key = this.currentToken.value;
      this.consume();
      this.consume(TokenType.Operator);

      if (key === 'style') {
        rootNode.style = this.parseStyle();
      } else if (key === 'children') { // Nuevo caso para 'children'
        rootNode.children = this.parseChildren();
      } else {
        const value = this.parseValue();
        switch (key) {
          case 'label':
            rootNode.label = value as string;
            break;
          // Eliminar el caso 'child'
          default:
            throw new Error(`Invalid attribute: ${key}`);
        }
      }

      if (this.currentToken.type === TokenType.Comma as TokenType) {
        this.consume();
      }
    }
  
    this.nodes.set('root', rootNode);
    this.consume(TokenType.BraceC);
  }

  private parseNode(): void {
    const nodeName = this.currentToken.value;
    if (this.nodes.has(nodeName)) throw new Error(`Duplicate node: ${nodeName}`);
    this.consume(TokenType.Identifier);
    this.consume(TokenType.BraceO); 
  
    const node: Node = {
      name: nodeName,
      label: '',
      children: []
    };
  
    // En parseNode()
    while (this.currentToken.type !== TokenType.BraceC) {
      const key = this.currentToken.value;
      this.consume();
      this.consume(TokenType.Operator);

      if (key === 'style') {
        node.style = this.parseStyle();
      } else if (key === 'children') { // Nuevo caso para 'children'
        node.children = this.parseChildren();
      } else {
        const value = this.parseValue();
        switch (key) {
          case 'label':
            node.label = value as string;
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
    this.consume(TokenType.BraceC); // '}'
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

  private parseChildren(): string[] {
    const children: string[] = [];
    this.consume(TokenType.BracketO); // Consume '['
    
    while (this.currentToken.type !== TokenType.BracketC) {
      if (this.currentToken.type !== TokenType.Identifier) {
        throw new Error(`Expected identifier, got ${this.currentToken.type}`);
      }
      children.push(this.currentToken.value);
      this.consume(TokenType.Identifier); // Consume el identificador
      
      if (this.currentToken.type === TokenType.Comma as TokenType) {
        this.consume(TokenType.Comma); // Consume la coma si existe
      }
    }
    
    this.consume(TokenType.BracketC); // Consume ']'
    return children;
  }

  private parseStyle(): { color?: string, bgcolor?: string }{
    const style: { color?: string, bgcolor?: string } = {}
    this.consume(TokenType.BraceO);
    
    while (this.currentToken.type !== TokenType.BraceC) {
      const key = this.currentToken.value
      this.consume()
      this.consume(TokenType.Operator)

      const value = this.parseValue();

      switch (key) {
        case 'color':
          style.color = value as string
          break;
        case 'bgcolor':
          style.bgcolor = value as string
          break; 
        default:
          throw new Error(`Invalid style attribute ${key}`)
          
      }
      if (this.currentToken.type === TokenType.Comma) {
        this.consume();
      }
    }
    this.consume(TokenType.BraceC)
    return style;
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