# Parser de Kaze 🍁: Gramática y Análisis Sintáctico

Este componente forma parte del análisis sintáctico del lenguaje de diagramas Kaze, utilizado para construir estructuras jerárquicas definidas por nodos. Se basa en una gramática libre de contexto que permite representar relaciones de composición y atributos de forma estructurada.

## ¿Qué es un parser?

El parser es la segunda etapa del compilador. Su trabajo es recibir una secuencia de tokens generados por el lexer y:

* Verificar que cumplen la gramática del lenguaje
* Construir una representación interna (como un árbol sintáctico abstracto o un grafo de nodos)

En este caso, el parser construye una estructura de nodos a partir de definiciones jerárquicas en el código fuente.

## Gramática

### Clases y estructuras

``Parser``

Clase principal que se encarga del análisis sintáctico.

#### Propiedades

* ``tokens:`` lista de tokens recibidos desde el lexer

* ``currentToken:`` token actual

* ``nodes:`` Mapa de nodos construidos (clave: nombre del nodo)

#### Métodos

``parse()``

* Punto de entrada.
* Ejecuta parseRoot y luego parseNode hasta alcanzar EOF.

``parseRoot()``

* Analiza la definición del nodo principal root.
* Valida y guarda los atributos: label, child, color, bgcolor

``parseNode()``

* Analiza la definición de nodos secundarios.
* Permite definir etiquetas, hijos y estilos.

``parseValue()``

* Parsea el valor de un atributo.
* Retorna string, number o una referencia (identifier).

``validateReferences()``

* Verifica que todos los nodos referenciados como hijos existan previamente.
* Lanza error si encuentra una referencia no definida.

``consume(expectedType?)``

* Avanza al siguiente token.
* Si se pasa ``expectedType``, lanza error si no coincide con el token actual.

### Nodos

Cada nodo del programa tiene la siguiente forma:

````ts
interface Node {
  name: string;        // nombre del nodo
  label: string;       // texto que lo representa
  children: string[];  // hijos referenciados
  color?: string;      // color del borde
  bgcolor?: string;    // color de fondo
}
````

### Errores sintácticos comunes

* Token inesperado (por ejemplo, falta de llave)
* Valor inválido en un atributo
* Nodo hijo no definido en ninguna parte del programa
* Atributos no permitidos
