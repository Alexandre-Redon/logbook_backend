import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRequestBody } from './types/PaymentRequestBody';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('/create-checkout-session')
  createPayment(
    @Body() paymentRequestBody: PaymentRequestBody,
    @Res() res: Response,
  ) {
    this.paymentsService
      .createPayment(paymentRequestBody)
      .then((payment) => {
        res.status(HttpStatus.CREATED).json(payment);
      })
      .catch((err) => {
        res.status(HttpStatus.BAD_REQUEST).json(err);
      });
  }
}
