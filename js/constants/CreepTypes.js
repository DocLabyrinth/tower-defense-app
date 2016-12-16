const creepSettings = {
  'soldier_green': {
    creepFrame: 32,
    health: 100,
    speed: 1,
    reward: 20,
    collisionBody: [16,28,24,20]
  },
  'soldier_silver': {
    creepFrame: 33,
    health: 150,
    speed: 2,
    reward: 75,
    collisionBody: [16,28,24,20]
  },
  'soldier_brown': {
    creepFrame: 34,
    health: 250,
    speed: 3,
    reward: 100,
    collisionBody: [16,28,24,20]
  },
  'soldier_ninja': {
    creepFrame: 35,
    health: 500,
    speed: 5,
    reward: 200,
    collisionBody: [16,28,24,20]
  }
}

export {creepSettings as default}
