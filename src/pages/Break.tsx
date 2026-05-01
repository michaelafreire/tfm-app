import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ColorButton from '../components/ColorButton';
import ExperimentHeader from '../components/ExperimentHeader';
import type { ExperimentRouteState } from '../experiment/routeState';
import { writeLocalSession } from '../hooks/useLocalDraft';

const BREAK_DURATION_SECONDS = 5 * 60;
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 86;
const BALL_SIZE = 12;
const PLAYER_X = 34;
const COMPUTER_X = CANVAS_WIDTH - PLAYER_X - PADDLE_WIDTH;
const PONG_COLORS = {
  background: '#f0fafa',
  border: '#3ba195',
  divider: 'rgba(59, 161, 149, 0.42)',
  paddle: '#3ba195',
  ball: '#262a2c',
  score: '#262a2c',
  overlay: 'rgba(222, 228, 228, 0.88)',
  overlayText: '#262a2c',
};

type PongState = {
  ballX: number;
  ballY: number;
  velocityX: number;
  velocityY: number;
  playerY: number;
  computerY: number;
  playerScore: number;
  computerScore: number;
};

const createPongState = (direction: 1 | -1 = 1): PongState => ({
  ballX: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
  ballY: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
  velocityX: direction * 4.2,
  velocityY: 3.1,
  playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  playerScore: 0,
  computerScore: 0,
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

function drawPong(context: CanvasRenderingContext2D, state: PongState, isRunning: boolean) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = PONG_COLORS.background;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = PONG_COLORS.divider;
  for (let y = 8; y < CANVAS_HEIGHT; y += 28) {
    context.fillRect(CANVAS_WIDTH / 2 - 4, y, 8, 15);
  }

  context.fillStyle = PONG_COLORS.score;
  context.font = '700 46px Roboto, Helvetica, Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(String(state.playerScore), CANVAS_WIDTH / 2 - 78, 52);
  context.fillText(String(state.computerScore), CANVAS_WIDTH / 2 + 78, 52);

  context.fillStyle = PONG_COLORS.paddle;
  context.fillRect(PLAYER_X, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  context.fillRect(COMPUTER_X, state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  context.fillStyle = PONG_COLORS.ball;
  context.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);

  if (!isRunning) {
    context.fillStyle = PONG_COLORS.overlay;
    context.fillRect(CANVAS_WIDTH / 2 - 74, CANVAS_HEIGHT / 2 - 43, 148, 86);
    context.fillStyle = PONG_COLORS.overlayText;
    context.font = '500 12px Roboto, Helvetica, Arial, sans-serif';
    context.fillText('Move with mouse or keys', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 6);
  }
}

function Break() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = useMemo(
    () => (location.state as ExperimentRouteState | null) ?? {},
    [location.state],
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef<PongState>(createPongState());
  const keysRef = useRef({ up: false, down: false });
  const animationRef = useRef<number | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(BREAK_DURATION_SECONDS);
  const [isBreakOver, setIsBreakOver] = useState(false);

  const participantCode = routeState.participantCode;
  const groupNumber = routeState.groupNumber;

  useEffect(() => {
    if (!participantCode || !groupNumber) return;
    writeLocalSession({
      participantCode,
      groupNumber,
      phase: 'break',
    });
  }, [groupNumber, participantCode]);

  const goToExperienceB = useCallback(() => {
    if (participantCode && groupNumber) {
      writeLocalSession({
        participantCode,
        groupNumber,
        phase: 'calibrationb',
      });
    }

    navigate('/calibration', {
      state: {
        ...routeState,
        nextPath: '/experienceb',
      },
    });
  }, [groupNumber, navigate, participantCode, routeState]);

  const resetBall = useCallback((direction: 1 | -1) => {
    gameStateRef.current = {
      ...gameStateRef.current,
      ballX: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      ballY: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
      velocityX: direction * 4.2,
      velocityY: (Math.random() > 0.5 ? 1 : -1) * 3.1,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;

    drawPong(context, gameStateRef.current, isGameRunning);
  }, [isGameRunning]);

  useEffect(() => {
    if (isBreakOver) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timerId);
          setIsGameRunning(false);
          setIsBreakOver(true);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isBreakOver]);

  useEffect(() => {
    if (!isGameRunning) return;

    const loop = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!context) return;

      const nextState = { ...gameStateRef.current };
      if (keysRef.current.up) {
        nextState.playerY -= 7;
      }
      if (keysRef.current.down) {
        nextState.playerY += 7;
      }

      nextState.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, nextState.playerY));

      const computerCenter = nextState.computerY + PADDLE_HEIGHT / 2;
      const ballCenter = nextState.ballY + BALL_SIZE / 2;
      nextState.computerY += (ballCenter - computerCenter) * 0.075;
      nextState.computerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, nextState.computerY));

      nextState.ballX += nextState.velocityX;
      nextState.ballY += nextState.velocityY;

      if (nextState.ballY <= 0 || nextState.ballY + BALL_SIZE >= CANVAS_HEIGHT) {
        nextState.velocityY *= -1;
        nextState.ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, nextState.ballY));
      }

      const ballHitsPlayer =
        nextState.ballX <= PLAYER_X + PADDLE_WIDTH &&
        nextState.ballX + BALL_SIZE >= PLAYER_X &&
        nextState.ballY + BALL_SIZE >= nextState.playerY &&
        nextState.ballY <= nextState.playerY + PADDLE_HEIGHT;

      const ballHitsComputer =
        nextState.ballX + BALL_SIZE >= COMPUTER_X &&
        nextState.ballX <= COMPUTER_X + PADDLE_WIDTH &&
        nextState.ballY + BALL_SIZE >= nextState.computerY &&
        nextState.ballY <= nextState.computerY + PADDLE_HEIGHT;

      if (ballHitsPlayer || ballHitsComputer) {
        const paddleY = ballHitsPlayer ? nextState.playerY : nextState.computerY;
        const hitPosition = (ballCenter - (paddleY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        nextState.velocityX = Math.sign(nextState.velocityX) * -Math.min(Math.abs(nextState.velocityX) + 0.2, 7);
        nextState.velocityY = hitPosition * 5;
      }

      if (nextState.ballX < -BALL_SIZE) {
        nextState.computerScore += 1;
        gameStateRef.current = nextState;
        resetBall(-1);
      } else if (nextState.ballX > CANVAS_WIDTH + BALL_SIZE) {
        nextState.playerScore += 1;
        gameStateRef.current = nextState;
        resetBall(1);
      } else {
        gameStateRef.current = nextState;
      }

      drawPong(context, gameStateRef.current, true);
      animationRef.current = window.requestAnimationFrame(loop);
    };

    animationRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameRunning, resetBall]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        keysRef.current.up = true;
      }
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
        keysRef.current.down = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        keysRef.current.up = false;
      }
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
        keysRef.current.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_HEIGHT / rect.height;
    const pointerY = (event.clientY - rect.top) * scaleY;
    gameStateRef.current = {
      ...gameStateRef.current,
      playerY: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, pointerY - PADDLE_HEIGHT / 2)),
    };
  };

  const handleStartGame = () => {
    if (!isBreakOver) {
      setIsGameRunning(true);
    }
  };

  const handleResetGame = () => {
    gameStateRef.current = createPongState();
    setIsGameRunning(false);
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      drawPong(context, gameStateRef.current, false);
    }
  };

  if (!participantCode) {
    return <div>Invalid access. Please restart the experiment.</div>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1,
        color: 'text.primary',
      }}
    >
      <ExperimentHeader
        title="5-minute break"
        action={
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'text.disabled',
            borderRadius: 2,
            px: 2,
            py: 1,
            minWidth: 86,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Break timer
          </Typography>
          <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
            {formatTime(secondsLeft)}
          </Typography>
        </Box>
        }
      >
        <Typography variant="body2" sx={{ maxWidth: 900, mt: 1 }}>
          Time for a 5-minute break. Feel free to play PONG in the screen, go to the bathroom, have some water or just
          take some time to yourself. If you do not want a break, just click "Skip break".
        </Typography>
      </ExperimentHeader>

      <Box
        sx={{
          bgcolor: 'secondary.paper',
          borderRadius: 3,
          p: 3,
          flex: 3,
          height: { xs: 'auto', md: '100%' },
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 0, md: 3 },
            py: 2,
          }}
        >
          <Box
            sx={{
              width: 'min(100%, 500px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 1.5,
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onPointerMove={handlePointerMove}
              onClick={handleStartGame}
              aria-label="Pong game"
              style={{
                width: '100%',
                aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                border: `4px solid ${PONG_COLORS.border}`,
                background: PONG_COLORS.background,
                display: 'block',
                cursor: 'none',
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ColorButton name="Start game" onClick={handleStartGame} disabled={isGameRunning || isBreakOver} />
              <Button variant="outlined" color="primary" onClick={handleResetGame} disabled={isBreakOver}>
                Reset Pong
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            pt: 1,
          }}
        >
          <ColorButton name="Skip break" onClick={goToExperienceB} disabled={false} />
        </Box>
      </Box>

      <Dialog open={isBreakOver} maxWidth="xs" fullWidth>
        <DialogContent
          sx={{
            bgcolor: 'text.disabled',
            color: 'text.primary',
            textAlign: 'center',
            px: 4,
            py: 4,
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.35 }}>
            Break is over. Click next to start Experience B.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'text.disabled', justifyContent: 'center', pb: 3 }}>
          <ColorButton name="Next" onClick={goToExperienceB} disabled={false} />
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Break;
