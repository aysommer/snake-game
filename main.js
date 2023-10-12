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
const MOVE_SPEED_MS = 500;
const SHIFT_SIZE = 5;
const SNAKE_BLOCK_SIZE = 5;

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
   direction = ACTIONS.LEFT;

   constructor() {
      this.canvas = document.getElementById('canvas');
      this.context = this.canvas.getContext("2d");
      this.gameModeButton = document.getElementById('gameModeButton');
      this.gameModeButton.innerText = 'Start';
      gameModeButton.onclick = this.handleGameModeButtonClick;

      this.inputController = new InputController({
         actions: {
            [ACTIONS.UP]: () => {
               this.direction = ACTIONS.UP
            },
            [ACTIONS.LEFT]: () => {
               this.direction = ACTIONS.LEFT
            },
            [ACTIONS.DOWN]: () => {
               this.direction = ACTIONS.DOWN
            },
            [ACTIONS.RIGHT]: () => {
               this.direction = ACTIONS.RIGHT
            }
         }
      });
      this.position = {
         x: this.canvas.clientWidth / 2,
         y: this.canvas.clientHeight / 2
      };
   }

   render = () => {
      this.clear();
      this.draw();
   }

   draw = () => {
      this.context.fillRect(
         this.position.x,
         this.position.y,
         SNAKE_BLOCK_SIZE,
         SNAKE_BLOCK_SIZE
      );
   }

   clear = () => {
      this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
   }

   move = () => {
      switch (this.direction) {
         case ACTIONS.UP: this.position.y -= SHIFT_SIZE; break;
         case ACTIONS.LEFT: this.position.x -= SHIFT_SIZE; break;
         case ACTIONS.DOWN: this.position.y += SHIFT_SIZE; break;
         case ACTIONS.RIGHT: this.position.x += SHIFT_SIZE; break;
      }
   }

   start = () => {
      this.gameMode = GAME_MODES.PLAYING;
      this.gameModeButton.innerText = 'Stop';
      this.renderInterval = setInterval(this.render, RENDER_MS);
      this.moveInterval = setInterval(this.move, MOVE_SPEED_MS);
      this.inputController.enable();
      this.canvas.focus();
   }

   stop = () => {
      this.gameMode = GAME_MODES.IDLE;
      this.gameModeButton.innerText = 'Start';
      this.inputController.disable();
      this.clear();
      clearInterval(this.renderInterval);
      clearInterval(this.moveInterval);
   }

   handleGameModeButtonClick = () => {
      const callback = {
         [GAME_MODES.IDLE]: this.start,
         [GAME_MODES.PLAYING]: this.stop
      }[this.gameMode];
      callback();
   }
}

const gameController = new GameController();
