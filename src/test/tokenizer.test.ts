import { TokenType } from '../lexer/lexer.js'
import { Tokenizer } from '../lexer/Tokenizer.js';
import { describe, expect, test } from '@jest/globals';

describe('Tokenizer', () => {
  test('debe tokenizar identificadores y keywords', () => {
    const input = 'root { label:"Main" }';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'root', position: 0 },
      { type: TokenType.Brace, value: '{', position: 5 },
      { type: TokenType.Identifier, value: 'label', position: 7 },
      { type: TokenType.Operator, value: ':', position: 12 },
      { type: TokenType.String, value: 'Main', position: 13 },
      { type: TokenType.Brace, value: '}', position: 20 },
      { type: TokenType.EOF, value: 'EOF', position: 21 }
    ]);
  });

  test('debe tokenizar números enteros y decimales', () => {
    const input = '123 45.67 89.';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Number, value: '123', position: 0 },
      { type: TokenType.Number, value: '45.67', position: 4 },
      { type: TokenType.Number, value: '89', position: 10 },
      { type: TokenType.Dot, value: '.', position: 12 },
      { type: TokenType.EOF, value: 'EOF', position: 13 }
    ]);
  });

  test('debe tokenizar strings', () => {
    const input = '"Hola mundo" ""';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.String, value: 'Hola mundo', position: 0 },
      { type: TokenType.String, value: '', position: 13 }, 
      { type: TokenType.EOF, value: 'EOF', position: 15 }
    ]);
  });

  test('debe tokenizar operadores', () => {
    const input = '+= == !=';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Operator, value: '+=', position: 0 },
      { type: TokenType.Operator, value: '==', position: 3 },
      { type: TokenType.Operator, value: '!=', position: 6 },
      { type: TokenType.EOF, value: 'EOF', position: 8 }
    ]);
  });

  test('debe ignorar comentarios', () => {
    const input = '// Esto es un comentario\nvalor';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'valor', position: 25 },
      { type: TokenType.EOF, value: 'EOF', position: 30 }
    ]);
  });

  test('debe manejar paréntesis y llaves', () => {
    const input = '( ) { }';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Paren, value: '(', position: 0 },
      { type: TokenType.Paren, value: ')', position: 2 },
      { type: TokenType.Brace, value: '{', position: 4 },
      { type: TokenType.Brace, value: '}', position: 6 },
      { type: TokenType.EOF, value: 'EOF', position: 7 }
    ]);
  });

  test('debe manejar posición correcta con espacios', () => {
    const input = '  hola\n\tmundo';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'hola', position: 2 },
      { type: TokenType.Identifier, value: 'mundo', position: 8 },
      { type: TokenType.EOF, value: 'EOF', position: 13 }
    ]);
  });

  test('debe manejar casos complejos combinados', () => {
    const input = 'func sum(a: number, b: number) { return a + b }';
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: TokenType.Identifier, value: 'func', position: 0 },
      { type: TokenType.Identifier, value: 'sum', position: 5 },
      { type: TokenType.Paren, value: '(', position: 8 },
      { type: TokenType.Identifier, value: 'a', position: 9 },
      { type: TokenType.Operator, value: ':', position: 10 },
      { type: TokenType.Identifier, value: 'number', position: 12 },
      { type: TokenType.Comma, value: ',', position: 18 },
      { type: TokenType.Identifier, value: 'b', position: 20 },
      { type: TokenType.Operator, value: ':', position: 21 },
      { type: TokenType.Identifier, value: 'number', position: 23 },
      { type: TokenType.Paren, value: ')', position: 29 },
      { type: TokenType.Brace, value: '{', position: 31 },
      { type: TokenType.Keyword, value: 'return', position: 33 },
      { type: TokenType.Identifier, value: 'a', position: 40 },
      { type: TokenType.Operator, value: '+', position: 42 },
      { type: TokenType.Identifier, value: 'b', position: 44 },
      { type: TokenType.Brace, value: '}', position: 46 },
      { type: TokenType.EOF, value: 'EOF', position: 47 }
    ]);
  });
});