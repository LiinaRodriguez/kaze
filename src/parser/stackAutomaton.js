export class StackAutomaton {
    constructor() {
        this.stack = [];
        this.delimiterPairs = new Map([
            ['{', '}'], ['[', ']'], ['(', ')']
        ]);
    }
    pushDelimiter(opening) {
        if (!this.delimiterPairs.has(opening)) {
            throw new Error(`Invalid opening delimiter: ${opening}`);
        }
        this.stack.push(opening);
    }
    popDelimiter(closing) {
        const lastOpening = this.stack.pop();
        if (!lastOpening || this.delimiterPairs.get(lastOpening) !== closing) {
            throw new Error(`Mismatched delimiters: Expected ${this.delimiterPairs.get(lastOpening)} but found ${closing}`);
        }
    }
    validateEmptyStack() {
        if (this.stack.length > 0) {
            throw new Error(`Unclosed delimiters: ${this.stack.join(', ')}`);
        }
    }
}
