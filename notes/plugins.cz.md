# Pluginy a reference na externí hodnoty (plugins and external values)

## Komplexní ukázka

### Použité pluginy `plugins`

Pluginy slouží ke zpracování schématu před samotným renderováním formuláře.
S jejich pomocí lze rozšířit schéma o podmínky podle standardu nebo vytvořit vlastní.

**ukázka vlastních pluginů**:

```js
import { createSelector } from 'reselect';

const plugins = {
  default: path => {
    const selectStatus = translateJsoinPointer('1/default', path);
    return createSelector(
      selectStatus, // the value of schema.properties.default
      _default => _default && { $value: undefined } // "return false" doesn't extend schema
    );
  },
  extend: (path, options) => {
    const selectors = appendSelectors(options.selectors, path);
    return createSelector(selectors, resolve);
  }
};
```

### Schéma

Následuje velice obsáhlá ukázka praktického použití pluginů (`$plugin`) a referencí na externí hodnoty (`$value`).

```js
import {} from './constants'; // uppercased keys are from here

const initialSchema = {
  [DEMAND]: {
    title: 'křivka odběru',
    type: 'object',
    properties: {
      [BUILDING]: {
        title: 'typ budovy',
        type: 'string',
        enum: [RDC, BDC],
        enumNames: [
          'rodinný dům s centrálním ohřevem teplé vody',
          'bytový dům s centrální ohřevem teplé vody'
        ]
      },
      [COLD_WATER]: {
        title: 'teplota studené vody',
        type: 'number',
        minimum: 0,
        maximum: 100,
        default: 10
      },
      [HOT_WATER]: {
        title: 'teplota teplé vody',
        type: 'number',
        minimum: 0,
        maximum: 100,
        default: 50
      },
      // external value
      [UNIT]: {
        title: 'měrná jednotka',
        type: 'string',
        $value: 'unit'
      },
      [COUNT]: {
        title: 'počet měrných jednotek',
        type: 'number',
        minimum: 1
      },
      // external value and extended schema
      [HOT_WATER_PER_UNIT]: {
        title: 'denní potřeba TV na jednotku',
        type: 'object',
        properties: {
          default: {
            title: 'použít výchozí hodnotu?',
            type: 'boolean'
          },
          value: {
            type: 'number',
            $value: 'hotWaterPerUnit',
            $plugin: 'default'
          }
        }
      },
      // external value
      [HEAT_DEMAND]: {
        title: 'teoretická potřeba tepla',
        type: 'number',
        $value: 'heatDemand'
      },
      [DESIGN_DEMAND]: {
        title: 'popis křivky odběru tepla (bez tepelných ztrát)',
        type: 'object',
        properties: {
          // extended schema
          active: {
            title: 'aktivní profil křivky odběru tepla',
            type: 'integer',
            default: 1,
            minimum: 1,
            $plugin: [
              'extend',
              {
                selectors: ['1/profiles'],
                resolve: profiles => ({ maximum: profiles.length })
              }
            ]
          },
          profiles: {
            type: 'array',
            items: [
              {
                title: 'výchozí profil křivky odběru tepla',
                type: 'object',
                properties: {
                  color: {
                    title: 'barva křivky',
                    type: 'string'
                  },
                  // external value
                  sections: {
                    $value: 'defaultDemandSections',

                    title: 'úseky křivky',
                    type: 'array',
                    items: {
                      title: 'úsek křivky',
                      type: 'object',
                      properties: {
                        x: {
                          title: 'čas',
                          type: 'number'
                        },
                        y: {
                          title: 'energie',
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              }
            ],
            additionalItems: {
              title: 'profil křivky odběru tepla',
              type: 'object',
              properties: {
                color: {
                  title: 'barva křivky',
                  type: 'string'
                },
                points: {
                  title: 'body křivky',
                  type: 'array',
                  items: {
                    title: 'bod křivky',
                    type: 'object',
                    properties: {
                      x: {
                        title: 'čas',
                        type: 'number'
                      },
                      y: {
                        title: 'energie',
                        type: 'number'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  [SUPPLY]: {
    title: 'křivka dodávky',
    type: 'object',
    properties: {
      [LOSS_FACTOR]: {
        title: 'poměrný součinitel ztrát',
        type: 'object',
        properties: {
          default: {
            title: 'použít výchozí hodnotu',
            type: 'boolean'
          },
          // extended schema and external value
          value: {
            title: 'hodnota',
            type: 'number',
            $value: 'lossFactor',
            $plugin: 'default'
          }
        }
      },
      // external value
      [HEAT_LOSS]: {
        title: 'tepelné ztráty',
        type: 'number',
        $value: 'heatLoss'
      },
      // external value
      [HEAT_DEMAND_WITH_LOSS]: {
        title: 'celková potřeba tepla',
        description: 'potřebné teplo se ztrátami',
        type: 'number',
        $value: 'heatDemandWithLoss'
      },
      [DESIGN_SUPPLY]: {
        title: 'popis křivky dodávky tepla',
        type: 'object',
        properties: {
          // extended schema
          active: {
            title: 'aktivní profil křivky dodávky tepla',
            type: 'number',
            default: 1,
            minimum: 1,
            $plugin: [
              'extend',
              {
                selectors: ['1/profiles'],
                resolve: profiles => ({ maximum: profiles.length })
              }
            ]
          },
          demandProfile: {
            title: 'profil křivky odběru tepla',
            type: 'object',
            properties: {
              // external value
              color: {
                title: 'barva křivky',
                type: 'string',
                $value: 'demandProfileColor'
              },
              // external value
              points: {
                $value: 'demandWithLossProfilePoints',
                title: 'body křivky',
                type: 'array',
                items: {
                  title: 'bod křivky',
                  type: 'object',
                  properties: {
                    x: {
                      title: 'čas',
                      type: 'number'
                    },
                    y: {
                      title: 'energie',
                      type: 'number'
                    }
                  }
                }
              }
            }
          },
          profiles: {
            type: 'array',
            items: [
              {
                title: 'výchozí profil křivky dodávky tepla',
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    $value: 'id',
                    $hidden: true
                  },
                  color: {
                    title: 'barva křivky',
                    type: 'string'
                  },
                  offset: {
                    title: 'odsazení křivky',
                    type: 'number',
                    default: 0.15
                  },
                  // external value
                  points: {
                    $value: 'defaultSupplyProfilePoints',
                    title: 'body křivky',
                    type: 'array',
                    items: {
                      title: 'bod křivky',
                      type: 'object',
                      properties: {
                        x: {
                          title: 'čas',
                          type: 'number'
                        },
                        y: {
                          title: 'energie',
                          type: 'number'
                        }
                      }
                    }
                  },
                  // external value
                  [MAX_HEAT_DIFF]: {
                    title:
                      'maximální rozdíl tepla mezi křivkami odběru a dodávky',
                    type: 'number',
                    $value: 'maxHeatDiff'
                  },
                  // external value
                  [VOLUME]: {
                    title: 'požadovaný objem zásobníku',
                    type: 'number',
                    $value: 'volume'
                  },
                  // external value
                  [POWER]: {
                    title: 'požadovaný tepelný výkon zdroje tepla',
                    type: 'number',
                    $value: 'power'
                  }
                }
              }
            ],
            additionalItems: {
              title: 'profil křivky dodávky tepla',
              type: 'object',
              properties: {
                color: {
                  title: 'barva křivky',
                  type: 'string'
                },
                offset: {
                  title: 'odsazení křivky',
                  type: 'number',
                  default: 0.15
                },
                points: {
                  title: 'body křivky',
                  type: 'array',
                  items: {
                    title: 'bod křivky',
                    type: 'object',
                    properties: {
                      x: {
                        title: 'čas',
                        type: 'number'
                      },
                      y: {
                        title: 'energie',
                        type: 'number',
                        $plugin: [
                          'extend',
                          {
                            selectors: [selectHeatDemandWithLoss, selectOffset],
                            resolve: (heatDemandWithLoss, offset) => {
                              if (areDefined(heatDemandWithLoss, offset)) {
                                return {
                                  maximum: calcUpperBoundary(
                                    heatDemandWithLoss,
                                    offset
                                  )
                                };
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                },
                // external value
                [MAX_HEAT_DIFF]: {
                  title:
                    'maximální rozdíl tepla mezi křivkami odběru a dodávky',
                  type: 'number',
                  $value: 'maxHeatDiff'
                },
                // external value
                [VOLUME]: {
                  title: 'požadovaný objem zásobníku',
                  type: 'number',
                  $value: 'volume'
                },
                // external value
                [POWER]: {
                  title: 'požadovaný tepelný výkon zdroje tepla',
                  type: 'number',
                  $value: 'power'
                }
              }
            }
          }
        }
      }
    }
  }
};
```

### Externí hodnoty získané vlastním výpočtem (external values = derived values)

```js
import { createSelector } from 'reselect';

import {} from './schema'; // values selectors are from here

const initDerive = steps => {
  const keys = Object.keys(steps);

  return {
    calc,
    get
  };

  function calc(values) {
    return keys.reduce(
      (acc, key) => {
        const step = steps[key];
        const maybeDerived = step(acc.values, acc.derived);
        let derived;

        if (typeof maybeDerived === 'function') {
          steps[key] = maybeDerived;
          derived = maybeDerived(acc.values, acc.derived);
        } else {
          derived = maybeDerived;
        }

        return {
          ...acc,
          [key]: derived
        };
      },
      { values, derived: {} }
    );
  }

  function get(key, id, values) {
    if (id) {
      return values[key][id];
    }
    return values[key];
  }
};

const stepsDemand = {
  unit: createSelector(selectBuilding, getUnit),

  heatDemand: createSelector(
    selectCount,
    selectHotWaterPerUnit,
    selectColdWater,
    selectHotWater,
    (count, hotWaterPerUnit, coldWater, hotWater) => {
      if (areDefined(count, hotWaterPerUnit, coldWater, hotWater)) {
        return calc('(V * n * 1000 * 4186 * (tTV - tSV)) / (3600 * 1000)', {
          V: hotWaterPerUnit,
          n: count,
          tTV: hotWater,
          tSV: coldWater
        });
      }
    }
  ),

  hotWaterPerUnit: createSelector(
    selectBuilding,
    selectCount,
    getHotWaterPerUnit
  ),

  defaultDemandSections: createSelector(
    selectBuilding,
    selectCount,
    selectHeatDemand,
    (building, count, heatDemand) => {
      if (areDefined(building, count, heatDemand)) {
        const profile = getProfile(building, count);
        const sections = calcSections(profile, heatDemand);
        return sections;
      }
    }
  )
};

const stepsSupply = demand => {
  const fromDemand = [demand.values, demand.derived];
  const building = selectBuilding(...fromDemand);
  const count = selectCount(...fromDemand);
  const coldWater = selectColdWater(...fromDemand);
  const hotWater = selectHotWater(...fromDemand);
  const heatDemand = selectHeatDemand(...fromDemand);
  const demandProfileColor = getDemandProfileColor(...fromDemand);
  const demandProfilePoints = getDemandProfilePoints(...fromDemand);
  const lossFactor = getLossFactor(building, count);

  return {
    lossFactor,

    heatLoss: createSelector(selectLossFactor, lossFactor =>
      calcHeatLoss(heatDemand, lossFactor)
    ),

    heatDemandWithLoss: createSelector(selectHeatLoss, heatLoss =>
      calcHeatDemandWithLoss(heatDemand, heatLoss)
    ),

    demandProfileColor,

    demandWithLossProfilePoints: createSelector(
      selectHeatDemandWithLoss,
      heatDemandWithLoss =>
        calcDemandWithLossProfilePoints(demandProfilePoints, heatDemandWithLoss)
    ),

    defaultSupplyProfilePoints: createSelector(
      selectDemandWithLossProfilePoints,
      selectOffset,
      calcDefaultSupplyProfilePoints
    ),

    maxHeatDiff: createInstanceSelector(selectProfiles, () =>
      createSelector(
        selectDemandWithLossProfilePoints,
        selectSupplyPoints,
        calcMaxHeatDiff
      )
    ),

    volume: createInstanceSelector(selectProfiles, () =>
      createSelector(selectMaxHeatDiff, maxHeatDiff =>
        calcVolume(coldWater, hotWater, maxHeatDiff)
      )
    ),

    power: createInstanceSelector(selectProfiles, () =>
      createSelector(selectSupplyPoints, calcPower)
    )
  };
};

export const deriveDemand = initDerive(stepsDemand);
export const deriveSupply = demand => initDerive(stepsSupply(demand));

function createInstanceSelector(selectArray, makeSelector) {
  return values => {
    const initArray = selectArray(values, derived);
    let cache = initArray.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: makeSelector()
      }),
      {}
    );

    return (values, derived) => {
      const array = selectArray(values, derived);
      const output = {};

      array.forEach((item, index) => {
        if (!cache[item.id]) {
          cache[item.id] = makeSelector();
        }

        output[item.id] = cache[item.id](values, derived, index, item.id);
      });

      return output;
    };
  };
}

function createCache(array, makeSelector, oldCache = {}) {
  return array.reduce((acc, item) => {
    let selector;

    if (oldCache[item.id]) {
      selector = oldCache[item.id];
    } else {
      selector = makeSelector();
    }

    return {
      ...acc,
      [item.id]: selector
    };
  }, {});
}
```
