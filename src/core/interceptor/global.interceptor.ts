import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class GlobalInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse<Response<T>>();
    const statusCode = response?.statusCode || 200;

    return next.handle().pipe(
      map((data: unknown) => {
        let message = 'Request processed successfully';
        let finalData = data;

        if (data !== null && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>;

          if (typeof dataObj.message === 'string') {
            message = dataObj.message;
          }

          if (dataObj.results !== undefined) {
            finalData = dataObj.results;
          } else if (dataObj.message !== undefined) {
            const rest = { ...dataObj } as Record<string, unknown>;
            delete rest.message;
            finalData = Object.keys(rest).length > 0 ? rest : null;
          }
        }

        return {
          success: true,
          statusCode,
          message,
          data: finalData as T,
        };
      }),
    );
  }
}
