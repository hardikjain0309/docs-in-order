import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function validationPipeExceptionFactory(
  validationErrors: ValidationError[],
) {
  return new BadRequestException({
    message: 'Bad request',
    validationErrors: validationErrors.reduce<{ [key: string]: string[] }>(
      (agg, error) => {
        const { property, constraints } = error;
        const errorMessages = constraints ? Object.values(constraints) : [];
        agg[property] = errorMessages;
        return agg;
      },
      {},
    ),
    statusCode: HttpStatus.BAD_REQUEST,
  });
}
