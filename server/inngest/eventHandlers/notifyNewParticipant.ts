import { inngest } from "~/server/inngest/client";
import { sendSMS } from "~/server/services/sms";
import {
  MAX_CLOSE_TO_CALL,
  setNotifiedCloseToCall,
} from "~/server/services/queueParticipants";

export interface NotifyNewParticipant {
  data: {
    _id: string;
    phone: string;
    name: string;
    position: number;
  };
}

export const eventName = "notify/participant.new";

const handleAndGenerateMessageBasedOnPosition = async (
  _id: string,
  name: string,
  position: number,
) => {
  if (position === 1) {
    await setNotifiedCloseToCall(_id);
    return `Olá ${name}! Sua posição na fila de doação está confirmada. Você é o próximo a doar! Por favor, mantenha-se próximo ao local de doação e aguarde a chamada.`;
  }
  if (position <= MAX_CLOSE_TO_CALL) {
    await setNotifiedCloseToCall(_id);
    return `Olá ${name}! Sua posição na fila de doação está confirmada. Você está na posição ${position} da fila. A sua vez de doar está próxima! Por favor, mantenha-se próximo ao local de doação e aguarde a chamada.`;
  }

  return `Olá ${name}! Sua posição na fila de doação está confirmada. Você está na posição ${position} da fila. Por favor, fique atento ao seu celular. Você receberá uma mensagem quando sua vez de doar estiver próxima.`;
};

export default inngest.createFunction(
  {
    name: "Notify New Participant Handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { _id, phone, name, position } = data;
    const text = await handleAndGenerateMessageBasedOnPosition(
      _id,
      name,
      position,
    );
    await sendSMS(phone, text);
  },
);
