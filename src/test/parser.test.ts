import { Tokenizer } from '../lexer/Tokenizer.js';
import { Parser } from '../parser/Parser.js';
import { describe, expect, test } from '@jest/globals';

describe('Diagram Parser', () => {
  test('parses valid root node', () => {
    const code = `root {
        label: "Root",
        children: [node1]
      }
      node1 { label: "Node 1" };
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    const result = parser.parse();

    expect(result.has('root')).toBe(true);
    expect(result.get('root')).toEqual({
      name: 'root',
      label: 'Root',
      children: ['node1']
    });
  });

  test('parses complete hierarchical structure', () => {
    const code = `
      root {
        label: "Main",
        children: [child1, child2]
      }
      
      child1 {
        label: "First Child",
        children: [subchild]
      }
      
      child2 {
        label: "Second Child"
      }
      
      subchild {
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

  test('throws error on duplicate node definition', () => {
    const code = `root {
        label: "Root",
        children: [node1]
      }
      node1 { label: "Test" }
      node1 { label: "Duplicate" }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError('Duplicate node: node1');
  });

  test('detects undefined node references', () => {
    const code = `
      root {
        label: "Test",
        children: [missingNode]
      }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError('Undefined node reference: missingNode in node root');
  });

  test('throws error if root node misses label', () => {
    const code = `
      root {
        style: { color: "ffff" }
      }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError('Root node must have a label');
  });

  test('rejects invalid attributes', () => {
    const code = `
      root { 
        label: "Test",
        invalidAttr: "value"
      }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError('Invalid attribute: invalidAttr');
  });

  test('handles unbalanced braces', () => {
    const code = `
      root {
        label: "Test"
      // Missing closing brace
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError(/Unexpected token/);
  });

  test('handles nested delimiters correctly', () => {
    const code = `
      root {
        label: "Test",
        children: [child1, child2],
        style: { 
          color: "red", 
          bgcolor: "blue" 
        }
      }
      child1 { label: "Child1" }
      child2 { label: "Child2" }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).not.toThrow();
  });

  test('accepts empty children array', () => {
    const code = `
      root { 
        label: "Test",
        children: [] 
      }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    const nodes = parser.parse();
    
    expect(nodes.get('root')?.children).toEqual([]);
  });

  test('throws error on non-string style values', () => {
    const code = `
      root { 
        label: "Test",
        style: { color: 123 } 
      }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError("Style attribute 'color' must be a string");
  });

  test('throws error on unbalanced brackets', () => {
    const code = `
      root { 
        label: "Test",
        children: [node1 
      }
      node1 { label: "Node1" }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError('Expected identifier, got BraceC');
  });

  test('throws error if non-root node misses label', () => {
    const code = `
      root { label: "Root" }
      nodeWithoutLabel { }
    `;

    const tokenizer = new Tokenizer(code);
    const parser = new Parser(tokenizer.tokenize());
    
    expect(() => parser.parse()).toThrowError("Node 'nodeWithoutLabel' must have a label");
  });
});