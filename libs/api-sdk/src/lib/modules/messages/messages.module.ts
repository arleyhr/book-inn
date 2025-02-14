import { HttpClient } from '../../client'
import { Message } from './types'

export interface SendMessageDto {
  reservationId: number
  message: string
}

export class MessagesModule {
  constructor(private readonly http: HttpClient) {}

  async getReservationMessages(reservationId: string): Promise<Message[]> {
    const response = await this.http.get<Message[]>(`/messages/reservation/${reservationId}`)
    return response.data
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const response = await this.http.post<Message>('/messages', data)
    return response.data
  }
}
