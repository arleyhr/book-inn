import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../users/entities/user.entity';
import { MessagesService } from '../services/messages.service';
import { SendMessageDto } from '../dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @GetUser() user: User,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(sendMessageDto, user.id);
  }

  @Get('reservation/:reservationId')
  async getMessages(
    @GetUser() user: User,
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ) {
    return this.messagesService.getMessages(reservationId, user.id);
  }
}
