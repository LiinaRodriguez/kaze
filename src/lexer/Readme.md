# Lexer de Kaze 🍁: Autómata finito Determinista

Este componente pertenece al analisis léxico del lenguaje de diagramas *kaze* , desarrollado como parte de un compilador. El lexer fue implementado usando **Autómata finito determinista (AFD)**

## ¿Qué es un lexer?

El **lexer** o analizador de léxico es la primera etapa de un compilador o intérprete. Su función principal es **leer el código fuente caracter por caracter y convertirlo en una secuencia de *tokens**.

Un token es una unidad mínima del lenguaje: por ejemplo, un identificador, un número,  una cadena, un parentésis, etc.

---

## ¿Por qué usar un AFD?

Desde el punto de vista de la teoría de autómatas, el análisis léxico se puede modelar con un **AFD**, ya que los tokens corresponden a **lenguajes regulares**. El **AFD** nos permite de forma formal y determinista reconocer patrones válidos en el texto de entrada.

## Alfabeto del **AFD**

$$
  \Sigma = \{ \}
$$

## Estados del **AFD** (Q)

* Start: Estado inicial
* Identifier: Reconociendo un identificador
* Number: Reconociendo un número
* String: Reconociendo un string
* Done: Token Completo
* Error: Error léxico

## Transiciones ($\delta$)

|Estado | Entrada | Estado siguiente | Descripción |
|-------|---------|------------------|-------------|
| | | | |
| | | | |
| | | | |

## Tokens que reconoce el lexer

* **Identifiers (identificadores)** : ``root, color, label``
* **Strings** : `"texto"`
* **Simbolos especiales**: `(, ), :, ;, [, ]`
* **EOF**: fin del archivo

## Descripción del archivo Tokenizer.ts

Esta clase implementa un autómata finito determinista para generar tokens a partir de una cadena de entrada.

### Métodos principales

``tokenize():`` método principal, recorre el texto de entrada y aplica las transiciones del AFD para generar la lista de tokens.

### Métodos auxiliares

``isAlpha, isAlphaNumeric, isDigit:`` validan caracteres.

``isOperator, isWhitespace:`` verifican símbolos válidos.

``nextChar():`` inspecciona el siguiente carácter.

``isKeyword():`` detecta si un identificador es una palabra clave.

### Estados implementados

Los estados se definen en un enum State importado, y se gestionan mediante un switch en tokenize() que refleja directamente las transiciones del AFD.
