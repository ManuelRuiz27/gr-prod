import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActorContext } from './actor-context.interface';

interface RequestWithActor {
  actor?: ActorContext;
  user?: { actor?: ActorContext } & Partial<ActorContext>;
}

export const CurrentActor = createParamDecorator(
  (data: keyof ActorContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithActor>();
    const actor = request.actor || request.user?.actor || (request.user as unknown as ActorContext);
    if (!actor) return null;
    return data ? actor[data] : actor;
  },
);
