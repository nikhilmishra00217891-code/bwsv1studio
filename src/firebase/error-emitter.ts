
import { createNanoEvents } from 'nanoevents';

interface Events {
  'permission-error': (error: any) => void
}

export const errorEmitter = createNanoEvents<Events>();
