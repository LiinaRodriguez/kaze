# ASTBuilder 🍁 (construcción del árbol)

Una vez que el `Parser` ha validado y organizado los nodos, se puede construir un árbol sintáctico o estructura jerárquica mediante el `ASTBuilder`.

## ¿Qué hace el ASTBuilder?

Transforma el `Map<string, Node>` generado por el parser en una estructura navegable de objetos enlazados, donde cada nodo contiene referencias directas a sus hijos.

## Estructura del nodo expandido

```ts
interface ASTNode {
  name: string;
  label: string;
  color?: string;
  bgcolor?: string;
  children: ASTNode[];
}
```

## Funcionalidades clave

- Crea un nodo ráiz a partir de `root`
- Recorre recursivamente los nombres en `children`
- Genera una estructura de árbol real enlazando objetos

## Ejemplo de uso

```ts
const parser = new Parser(tokens);
const nodes = parser.parse();
const builder = new ASTBuilder(nodes);
const tree = builder.build();
```

## Resultado esperado

```ts
{
  name: "root",
  label: "Inicio",
  color: "blue",
  children: [
    {
      name: "A",
      label: "Nodo A",
      color: "red",
      children: [
        {
          name: "B",
          label: "Nodo B",
          children: []
        }
      ]
    }
  ]
}
```

Este árbol puede utilizarse para renderizar visualizaciones, exportar estructuras, o transformarlas en otros formatos (como DOT, JSON o SVG).

---

## Visualización del árbol generado

Una representación gráfica del árbol generado podría lucir así:

```s
root (Inicio)
└── A (Nodo A)
    └── B (Nodo B)
```

Cada nivel representa la jerarquía definida por los atributos `child`. Este tipo de visualización facilita entender la estructura del programa y puede ser extendida a herramientas como Graphviz para renderizados más elaborados.
