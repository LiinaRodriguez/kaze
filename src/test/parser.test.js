import { Tokenizer } from '../lexer/Tokenizer.js';
import { Parser } from '../parser/Parser.js';
import { describe, expect, test } from '@jest/globals';
describe('Diagram Parser', () => {
    test('debe parsear nodo root válido', () => {
        const code = `root{
        label: "Raiz",
        children: [node1]
      }
      node1{ label: "Nodo 1" };
    `;
        const tokenizer = new Tokenizer(code);
        const tokens = tokenizer.tokenize();
        const parser = new Parser(tokens);
        const result = parser.parse();
        expect(result.has('root')).toBe(true);
        expect(result.get('root')).toEqual({
            name: 'root',
            label: 'Raiz',
            children: ['node1']
        });
    });
    test('debe parsear estructura jerárquica completa', () => {
        const code = `
      root{
        label: "Main",
        children: [child1,child2]
      }
      
      child1{
        label: "First Child",
        children: [subchild]
      }
      
      child2{
        label: "Second Child"
      }
      
      subchild{
        label: "Nested"
      }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        const nodes = parser.parse();
        expect(nodes.size).toBe(4);
        expect(nodes.get('root')?.children).toEqual(['child1', 'child2']);
        expect(nodes.get('child1')?.children).toEqual(['subchild']);
        expect(nodes.get('subchild')?.label).toBe('Nested');
    });
    test('debe lanzar error por definición duplicada', () => {
        const code = `root{
        label: "Raiz",
        children: [node1]
      }
      node1{ label: "Test" }
      node1{ label: "Duplicate" }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        expect(() => parser.parse()).toThrowError('Duplicate node: node1');
    });
    test('debe detectar referencias indefinidas', () => {
        const code = `
      root{
        label: "Test",
        children: [missingNode]
      }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        expect(() => parser.parse()).toThrowError('Undefined node reference: missingNode in node root');
    });
    test('siempre debe tener un atributo label', () => {
        const code = `
      root{
         style:{
          color: ffff,
         },
      }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        const nodes = parser.parse();
        expect(nodes.get('root')).toEqual({
            name: 'root',
            label: '',
            children: [],
            style: {
                color: 'ffff'
            }
        });
    });
    test('debe rechazar atributos inválidos', () => {
        const code = `
      root{ 
        label: "Test",
        invalidAttr: "value"
      }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        expect(() => parser.parse()).toThrowError('Invalid attribute: invalidAttr');
    });
    test('debe manejar sintaxis inválida', () => {
        const code = `
      root{
        label: "Test"
      // Falta cerrar llave
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        expect(() => parser.parse()).toThrowError(/Unexpected token/);
    });
    test('debe manejar atributos opcionales correctamente', () => {
        const code = `
      root{
        label: "Test",
        style:{
          bgcolor: abcdef
        },
      }
    `;
        const tokenizer = new Tokenizer(code);
        const parser = new Parser(tokenizer.tokenize());
        const nodes = parser.parse();
        expect(nodes.get('root')).toEqual({
            name: 'root',
            label: 'Test',
            children: [],
            style: {
                bgcolor: 'abcdef'
            }
        });
    });
});
