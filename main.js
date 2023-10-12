const ACTIONS = {
   UP: 'up',
   LEFT: 'left',
   DOWN: 'down',
   RIGHT: 'right'
};

const KEY_CODES = {
   W: 'KeyW',
   A: 'KeyA',
   S: 'KeyS',
   D: 'KeyD',
   ARROW_UP: 'ArrowUp',
   ARROW_LEFT: 'ArrowLeft',
   ARROW_DOWN: 'ArrowDown',
   ARROW_RIGHT: 'ArrowRight'
};

const GAME_MODES = {
   IDLE: 'idle',
   PLAYING: 'playing',
   PAUSE: 'pause'
};

const RENDER_MS = 60;
const MOVE_SPEED_MS = 50;
const SHIFT_SIZE = 5;
const SNAKE_BLOCK_SIZE = 5;
const APPLE_BLOCK_SIZE = SNAKE_BLOCK_SIZE;
const SNAKE_SIZE = 4;

class InputController {
   actions = {};

   constructor({ actions = [] }) {
      Object.entries(actions).forEach(([name, action]) => {
         this.actions[name] = action;
      });
   }

   enable = () => {
      document.addEventListener('keydown', this.handleKeyDown);
   }

   disable = () => {
      document.removeEventListener('keydown', this.handleKeyDown);
   }

   handleKeyDown = ({ code }) => {
      const actionName = this.getActionNameByCode(code);
      const callback = this.actions[actionName];
      if (callback) {
         callback();
      }
   }

   getActionNameByCode = (code) => {
      switch (code) {
         case KEY_CODES.W:
         case KEY_CODES.ARROW_UP: return ACTIONS.UP;
         case KEY_CODES.A:
         case KEY_CODES.ARROW_LEFT: return ACTIONS.LEFT;
         case KEY_CODES.S:
         case KEY_CODES.ARROW_DOWN: return ACTIONS.DOWN;
         case KEY_CODES.D:
         case KEY_CODES.ARROW_RIGHT: return ACTIONS.RIGHT;
      }
   }
}

class GameController {
   gameMode = GAME_MODES.IDLE;

   constructor() {
      this.canvas = document.getElementById('canvas');
      this.context = this.canvas.getContext("2d");
      this.scoreTitle = document.getElementById('scoreTitle');
      this.gameModeButton = document.getElementById('gameModeButton');
      this.gameModeButton.innerText = 'Start';
      gameModeButton.onclick = this.handleGameModeButtonClick;

      this.inputController = new InputController({
         actions: {
            [ACTIONS.UP]: () => {
               if (this.direction !== ACTIONS.DOWN) {
                  this.direction = ACTIONS.UP;
               }
            },
            [ACTIONS.LEFT]: () => {
               if (this.direction !== ACTIONS.RIGHT) {
                  this.direction = ACTIONS.LEFT;
               }
            },
            [ACTIONS.DOWN]: () => {
               if (this.direction !== ACTIONS.UP) {
                  this.direction = ACTIONS.DOWN;
               }
            },
            [ACTIONS.RIGHT]: () => {
               if (this.direction !== ACTIONS.LEFT) {
                  this.direction = ACTIONS.RIGHT;
               }
            }
         }
      });
   }

   render = () => {
      this.clear();
      this.draw();
   }

   draw = () => {
      // Snake.
      this.context.fillStyle = "green";
      this.snake.forEach((block) => {
         this.context.fillRect(
            block.x,
            block.y,
            SNAKE_BLOCK_SIZE,
            SNAKE_BLOCK_SIZE
         );
      });

      // Apple.
      this.context.fillStyle = "red";
      this.context.fillRect(
         this.apple.x,
         this.apple.y,
         APPLE_BLOCK_SIZE,
         APPLE_BLOCK_SIZE
      );
   }

   clear = () => {
      this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
   }

   move = () => {
      this.checkPositiveCollision();
      if (this.hasNegativeCollision) {
         this.stop();
      }

      let pastBlock;

      this.snake.forEach((block, index) => {
         if (index === 0) {
            // Head logic.
            pastBlock = { ...block };
            switch (this.direction) {
               case ACTIONS.UP: this.snake[index].y -= SHIFT_SIZE; break;
               case ACTIONS.LEFT: this.snake[index].x -= SHIFT_SIZE; break;
               case ACTIONS.DOWN: this.snake[index].y += SHIFT_SIZE; break;
               case ACTIONS.RIGHT: this.snake[index].x += SHIFT_SIZE; break;
            }
         } else {
            // Body logic
            this.snake[index] = pastBlock;
            pastBlock = { ...block };
         }
      });
   }

   checkPositiveCollision = () => {
      if (this.canEatApple) {
         this.apple = this.getApple();
         this.increaseSnake();
         this.scoreTitle.innerText = `Score: ${this.snake.length - SNAKE_SIZE}`;
      }
   }


   increaseSnake = () => {
      const lastBlock = { ...this.snake[this.snake.length - 1] };
      this.snake.push(lastBlock);
   }

   start = () => {
      this.snake = this.getDefaultSnake();
      this.apple = this.getApple();
      this.gameMode = GAME_MODES.PLAYING;
      this.direction = ACTIONS.LEFT;
      this.gameModeButton.innerText = 'Stop';
      this.scoreTitle.innerText = 'Score: 0';
      this.renderInterval = setInterval(this.render, RENDER_MS);
      this.moveInterval = setInterval(this.move, MOVE_SPEED_MS);
      this.inputController.enable();
      this.canvas.focus();
   }

   stop = () => {
      this.gameMode = GAME_MODES.IDLE;
      this.gameModeButton.innerText = 'Start';
      this.scoreTitle.innerText = '';
      this.inputController.disable();
      this.clear();
      clearInterval(this.renderInterval);
      clearInterval(this.moveInterval);
   }

   getApple = () => {
      let isValidPos = false;
      let randomApple;

      while (!isValidPos) {
         randomApple = {
            x: this.getRandomInt(this.canvas.clientWidth),
            y: this.getRandomInt(this.canvas.clientHeight)
         };
         const isMultiplePos = (
            randomApple.x % APPLE_BLOCK_SIZE === 0 &&
            randomApple.y % APPLE_BLOCK_SIZE === 0
         );
         if (isMultiplePos) {
            isValidPos = !this.snake.some((block) => {
               return (
                  block.x === randomApple.x &&
                  block.y === randomApple.y
               )
            })
         }
      }

      return randomApple;
   }

   getDefaultSnake = () => {
      return new Array(SNAKE_SIZE).fill(null).map((_, index) => {
         return {
            x: this.canvas.clientWidth / 2 + (SNAKE_BLOCK_SIZE * index),
            y: this.canvas.clientHeight / 2
         }
      })
   }

   getRandomInt = (max) => {
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - 0) + 0);
   }

   handleGameModeButtonClick = () => {
      const callback = {
         [GAME_MODES.IDLE]: this.start,
         [GAME_MODES.PLAYING]: this.stop
      }[this.gameMode];
      callback();
   }

   get hasNegativeCollision() {
      const [head, ...body] = this.snake;

      // Walls
      if (
         head.x < 0 ||
         head.x > this.canvas.clientWidth ||
         head.y < 0 ||
         head.y > this.canvas.clientHeight
      ) {
         return true;
      }

      // Self
      if (body.some((block) => {
         return (
            head.x === block.x &&
            head.y === block.y
         )
      })) {
         return true;
      }

      return false;
   }

   get canEatApple() {
      const head = this.snake[0];

      return (
         this.apple.x === head.x &&
         this.apple.y === head.y
      )
   }
}

const gameController = new GameController();
