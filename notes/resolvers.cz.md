# Řešitelé (resolvers)

Standard [JSON Schema](http://json-schema.org/understanding-json-schema/index.html) v základu počítá s tím, že celé schéma bude v JSONu a proto podmíněné entity schématu je potřeba popsat, defacto, novým způsobem, který je značně omezen (oneOf, anyOf, ...), protože nemůžeme používat vlastní JS funkce.

Nicméně v případě `react-schema-form` se nemusíme omezovat na samotné JSON s primitivními hodnotami (`string`, `number`, `boolean`), ale můžeme využít pro podmíněné entity přímo JS funkce.

## Ukázky použití

Rigidní schéma formuláře je popsáno stejně jako v JSON Schema:

```js
const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
};
```

### Podmíněné schéma

Pouze část, která je závislá na aktuálních hodnotách entit je popsána klíčovým slovem `$modify`:

```js
import produce from 'immer';

const initialSchema = {
  type: 'object',
  properties: {
    showList: {
      title: 'ukázat seznam?',
      type: 'boolean'
    }
  },
  $modify: {
    selectors: [values => values.showList],
    resolve: showList => {
      if (showList) {
        return produce(draftSchema => {
          draftSchema.properties.list = {
            title: 'seznam',
            type: 'string',
            enum: ['foo', 'bar']
          };
        });
      }
    }
  }
};
```

Klíčové slovo `$modify` je objekt obsahující selektory z aktuálních hodnot (`$modify.selectors`), které se v daném pořadí vloží jako argumenty do řešitele (`$modify.resolve`). Výstup z řešitele se poté sloučí s existujícím schématem entity.

```js
const resolve = initResolve({ initialSchema });
const actualValues = {
  showList: false
};

expect(resolve(actualValues)).toEqual({
  schema: {
    type: 'object',
    properties: {
      showList: {
        title: 'ukázat seznam?',
        type: 'boolean'
      }
    }
  },
  values: {
    showList: false
  }
});
```

Klíčové slovo `$modify` může být název řešitele (`string`). V takovém případě je zapotřebí dodat objekt obsahující řešitele s daným názvem.

```js
const initialSchema = {
  type: 'object',
  $modify: 'resolveSchemaList'
};

const resolvers = {
  resolveSchemaList: {
    selectors: [values => values.showList],
    resolve: showList => {
      if (showList) {
        return produce(draftSchema => {
          draftSchema.properties.list = {
            title: 'seznam',
            type: 'string',
            enum: ['foo', 'bar']
          };
        });
      }
    }
  }
};

const resolve = initResolve({ resolvers, initialSchema });

resolve(actualValues);
```

### Odvozené hodnoty (derived values)

Pokud potřebujeme zobrazit hodnoty vypočtené z aktuálních hodnot ve formuláři, tak použijeme klíčové slovo `$resolver`:

```js
const initialSchema = {
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
    sum: {
      type: 'number',
      $resolver: {
        selectors: [values => values.a, values => values.b],
        resolve: (a, b) => (isNumber(a) && isNumber(b) ? a + b : undefined)
      }
    }
  }
};

const resolve = initResolve({ initialSchema });
const actualValues = { a: 1, b: 2 };

expect(resolve(actualValues)).toEqual({
  schema: initialSchema,
  values: {
    a: 1,
    b: 2,
    sum: 3
  }
});
```

### Kombinace podmíněného schématu s odvozenými hodnotami

V praxi můžeme narazit na formuláře, kde uživatel může využít výchozí hodnotu (odvozenou) nebo může zadat vlastní. V takovém případě bychom mohli napsat schéma v tomto tvaru:

```js
import produce from 'immer';

const initialSchema = {
  type: 'object',
  properties: {
    foo: {
      title: 'hodnota Foo',
      type: 'number'
    },
    bar: {
      title: 'hodnota Bar',
      type: 'object',
      properties: {
        isDefault: {
          title: 'použít výchozí hodnotu?',
          type: 'boolean'
        },
        value: {
          type: 'number',
          $modify: {
            selectors: [values => values.bar.isDefault],
            resolve: isDefault => {
              if (isDefault) {
                return schema => ({
                  ...schema,
                  $resolver: 'calcBar'
                });
              }
            }
          }
        }
      }
    }
  }
};

const resolvers = {
  calcBar: {
    selectors: [values => values.foo],
    resolve: foo => (isNumber(foo) ? foo + 2 : undefined)
  }
};

const resolve = initResolve({ resolvers, initialSchema });
const actualValues = {
  foo: 1,
  bar: { isDefault: true }
};

expect(resolve(actualValues)).toEqual({
  schema: {
    type: 'object',
    properties: {
      foo: {
        title: 'hodnota Foo',
        type: 'number'
      },
      bar: {
        title: 'hodnota Bar',
        type: 'object',
        properties: {
          isDefault: {
            title: 'použít výchozí hodnotu?',
            type: 'boolean'
          },
          value: {
            type: 'number',
            $resolver: 'calcFoo'
          }
        }
      }
    }
  },
  values: {
    foo: 1,
    bar: {
      isDefault: true,
      value: 3 // <= derived value!
    }
  }
});
```

## Pod pokličkou (the core and the API)

Při inicializaci se nacachují všichni _přímo_ zjistitelní řešitelé a následně se při každé aktualizaci hodnot zavolají popořadě s tím, že hodnoty aktualizované z předchozího řešitele se použijí jako vstupní hodnoty pro následujícího řešitele.

_Přímo zjistitelní_ proto, protože podmíněné schéma může být rozšířeno o řešitele hodnoty (`$resolver`).

### Selektory (`resolver.selectors`)

Selektor je funkce, která dostane vstupní argumenty: `values` a `external` (? zatím nevím, jestli je to vhodné řešení závislosti na externích hodnotách).

Selektor může být ale i [relativní JSON pointer](http://json-schema.org/latest/relative-json-pointer.html). V takovém případě je možné připojit hodnoty nezávisle na znalosti celého schématu (výhodné obzvlášť u komplexních polí).

**Relativní JSON pointer**:

```js
const initialSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      userDefinedValue: {
        type: 'number'
      },
      derivedValue: {
        type: 'number',
        $resolver: {
          selectors: ['1/userDefinedValue'],
          resolve: value => (isNumber(value) ? value * 2 : undefined)
        }
      }
    }
  }
};
```

### Funkce řešitel (`resolver.resolve`)

V případě řešitele pro odvozenou hodnotu jsou vstupní argumenty dány selektory (ve stejném pořadí).

```js
// $resolver
const resolver = {
  selectors: [getValueA, getValueB],
  resolve: (valueA, valueB) => {}
};
```

Pokud jde ale o řešitele rozšiřující samotné schéma, tak zde je nejdříve provedeno první volání s původním schématem a teprve při druhém volání obdrží vstupní argumenty stanovené selektory. Je to z důvodu, že vývojář může provést i specifičtější úpravy ve schématu (např. změnu původních vlastností schématu apod.).

```js
// $modify
const resolver = {
  selectors: [getValueA, getValueB],
  resolve: relatedOriginalSchema => (valueA, valueB) => {}
};
```

### Optimalizace

Protože jsou všichni řešitelé voláni s každou změnu hodnoty ve formuláři a to i s absolutně nesouvisející, tak může dojít ke zpomalení procedury. V takovém případě je vhodné provést memoizaci funkcí. Tzn. že jakmile bude řešitel volán se stejnými hodnotami argumentů, tak se rovnou vrátí předchozí nacachovaný výstup z funkce.

```js
import { createSelector } from 'reselect';

const resolver = {
  selectors: [values => values.a, values => values.b],
  resolve: (a, b) => ({
    sum: a + b,
    max: Math.max(a, b)
  })
};
const resolve = createSelector(resolver.selectors, resolver.resolve);

const firstOutput = resolve({ a: 1, b: 2 });

expect(firstOutput).toEqual({
  sum: 3,
  max: 2
});

const secondOutput = resolve({ a: 1, b: 2 });

// expect(..).toBe(..) proceeds strict/reference equality (===)
expect(secondOutput).toBe(firstOutput);
// => TRUE - because it uses the previous output
```

A protože memoizací docílíme navrácení předchozího výsledku, tak můžeme s výhodou využít i memoizace podmíněných řešitelů pro odvozené hodnoty (tzn. podmíněné schéma po úpravě rozšíří schéma o řešitele (`$resolver`) odvozené hodnoty).

```js
const initialSchema = {
  type: 'object',
  properties: {
    foo: {
      type: 'object',
      properties: {
        isDefault: {
          type: 'boolean'
        },
        value: {
          type: 'number',
          $modify: {
            selectors: ['1/isDefault'],
            resolve: isDefault => {
              if (isDefault) {
                return schema => ({
                  ...schema,
                  $resolver: 'calcBar'
                });
              }
            }
          }
        }
      }
    }
  }
};

// TODO
```

_TODO_
