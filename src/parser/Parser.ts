import { TokenType, Token } from "../lexer/lexer.js";
import {StackAutomaton } from './stackAutomaton'
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
  private automaton: StackAutomaton; 

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.currentToken = this.tokens[0];
    this.nodes = new Map();
    this.automaton = new StackAutomaton();
  }

  private consume(expectedType?: TokenType): void {
    if (expectedType && this.isDelimiter(expectedType)) {
      this.handleDelimiter(expectedType);
    }

    if (expectedType && this.currentToken.type !== expectedType) {
      throw new Error(`Unexpected token: ${this.currentToken.value}`);
    }
    this.tokens.shift();
    this.currentToken = this.tokens[0] || { type: TokenType.EOF, value: '', position: -1 };
  }

  private isDelimiter(type: TokenType): boolean {
    return [
      TokenType.BraceO, TokenType.BraceC,
      TokenType.BracketO, TokenType.BracketC,
      TokenType.ParenO, TokenType.ParenC
    ].includes(type);
  }
  
  private handleDelimiter(type: TokenType): void {
    const delimiterMap = {
      [TokenType.BraceO]: '{',
      [TokenType.BraceC]: '}',
      [TokenType.BracketO]: '[',
      [TokenType.BracketC]: ']',
      [TokenType.ParenO]: '(',
      [TokenType.ParenC]: ')',
    };
  
    const symbol = delimiterMap[type as keyof typeof delimiterMap];
    
    if (symbol === '{' || symbol === '[' || symbol === '(') {
      this.automaton.pushDelimiter(symbol);
    } else {
      this.automaton.popDelimiter(symbol);
    }
  }

  public parse(): Map<string, Node> {
    try { 
      this.parseRoot();
      while (this.currentToken.type !== TokenType.EOF) {
        this.parseNode();
      }
      this.validateReferences();
      this.automaton.validateEmptyStack();
      return this.nodes;
    } catch (error) {
      throw error;
    }
  }

  private parseRoot(): void {
    this.automaton.pushDelimiter('{');
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
    if (!rootNode.label) {
      throw new Error('Root node must have a label');
    }
    this.consume(TokenType.BraceC);
    this.automaton.popDelimiter('}');
  }

  private parseNode(): void {
    const nodeName = this.currentToken.value;
    if (this.nodes.has(nodeName)) throw new Error(`Duplicate node: ${nodeName}`);
    this.automaton.pushDelimiter('{');
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
    if (!node.label) {
      throw new Error(`Node '${nodeName}' must have a label`);
    }
    this.consume(TokenType.BraceC); // '}'
    this.automaton.popDelimiter('}');
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
    this.automaton.pushDelimiter('[');
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
    this.automaton.popDelimiter(']');
    return children;
  }

  private parseStyle(): { color?: string, bgcolor?: string }{
    const style: { color?: string, bgcolor?: string } = {}
    this.automaton.pushDelimiter('{');
    this.consume(TokenType.BraceO);
    
    while (this.currentToken.type !== TokenType.BraceC) {
      const key = this.currentToken.value
      this.consume()
      this.consume(TokenType.Operator)

      const value = this.parseValue();
      
      if (typeof value !== 'string') {
        throw new Error(`Style attribute '${key}' must be a string`);
      }

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
    this.automaton.popDelimiter('}');
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