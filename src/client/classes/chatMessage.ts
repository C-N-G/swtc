export default class ChatMessage { 

  constructor(
    public value: string,
    public author: string,
    public status: "sent" | "received" | "failed",
    public readonly id: string = crypto.randomUUID(),
    public timeStamp: Date = new Date(),
  ) {

  }

}

