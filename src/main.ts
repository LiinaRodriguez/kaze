import * as fs from 'fs';
import { Tokenizer } from '../src/lexer/Tokenizer.js';
import { Parser } from '../src/parser/Parser.js'
import { ASTBuilder } from "./ast/ASTBuilder.js";
import { ASTPrinter } from "./ast/ASTPrinter.js";

const test_filepath = 'test.kaze';
const test2_filepath = 'test2.kaze';

[test_filepath, test2_filepath].forEach((test) => {
  const sourceCode = fs.readFileSync(test, 'utf-8')
  const tokenizer = new Tokenizer(sourceCode);
  const parser = new Parser(tokenizer.tokenize());
  const astMap = parser.parse();
  
  const builder = new ASTBuilder(astMap);
  const tree = builder.build();
  
  ASTPrinter.print(tree);
})
  
