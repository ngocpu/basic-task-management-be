import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // determine if this is an HttpException
    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    // type guard for objects that include a message
    const hasMessage = (obj: unknown): obj is { message: string | string[] } =>
      typeof obj === 'object' &&
      obj !== null &&
      'message' in obj &&
      (typeof (obj as { message: unknown }).message === 'string' ||
        Array.isArray((obj as { message: unknown }).message));

    let message: string | string[];
    if (hasMessage(exceptionResponse)) {
      message = exceptionResponse.message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = 'Internal server error';
    }
    // log error message
    this.logger.error(
      `[${request.method}] ${request.url} - Error: ${JSON.stringify(exception)}`,
    );

    const errorName =
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      typeof (exception as { name: unknown }).name === 'string'
        ? (exception as { name: string }).name
        : 'HttpException';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: Array.isArray(message) ? message : [message],
      path: request.url,
      error: errorName,
    });
  }
}
