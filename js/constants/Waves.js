const waves = [
  {
    name: 'Basic Soliders',
    creeps: [
      {type: 'soldier_green', count: 20}
    ]
  },
  {
    name: 'Meaner Soliders',
    creeps: [
      {type: 'soldier_green', count: 10},
      {type: 'soldier_brown', count: 10},
    ]
  },
  {
    name: 'Hard Nuts',
    creeps: [
      {type: 'soldier_green', count: 5},
      {type: 'soldier_brown', count: 20},
      {type: 'soldier_silver', count: 5}
    ]
  },
  {
    name: 'The Bully Boss',
    creeps: [
      {type: 'soldier_ninja', count: 1}
    ]
  }
]

export {waves as default}
