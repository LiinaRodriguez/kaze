import { Tokenizer } from "./lexer/Tokenizer.js";
import { Parser } from "./parser/Parser.js";
import { ASTBuilder } from "./ast/ASTBuilder.js";
import { buildReactFlowGraph } from "./ast/builder.js";

export function parseToReactFlow(source: string) {
  // Tokenización
  const tokenizer = new Tokenizer(source);
  const tokens = tokenizer.tokenize();
  if (!tokens || tokens.length === 0) {
    throw new Error("Tokenization failed: No tokens generated.");
  }

  // Parsing
  const parser = new Parser(tokens);
  const astMap = parser.parse();
  if (!astMap || astMap.size === 0) {
    throw new Error("Parsing failed: No nodes generated.");
  }

  // Construcción del AST
  const builder = new ASTBuilder(astMap);
  const tree = builder.build();
  if (!tree) {
    throw new Error("AST building failed: Root node could not be constructed.");
  }

  // Generación del grafo para React Flow
  const graph = buildReactFlowGraph(tree);
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    throw new Error("Graph generation failed: No nodes in the graph.");
  }

  return graph;
}
