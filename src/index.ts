import { Tokenizer } from './lexer/Tokenizer.js';
import { Parser } from './parser/Parser.js';
import { ASTBuilder } from './ast/ASTBuilder.js';
import { buildReactFlowGraph } from './ast/builder.js';

export function parseToReactFlow(source: string) {
  const tokenizer = new Tokenizer(source);
  const tokens = tokenizer.tokenize();

  const parser = new Parser(tokens);
  const astMap = parser.parse();

  const builder = new ASTBuilder(astMap);
  const tree = builder.build();

  return buildReactFlowGraph(tree);
}
