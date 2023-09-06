interface IdentifiableObj {
    id: string,
    name: string,
    desc: string
}

export interface Group extends IdentifiableObj {
    channels: Channel[]
    requests: string[]
}

interface Channel extends IdentifiableObj{
    messages: Message[]
}

interface Message {
    userId: string,
    content: string,
    timestamp: Date
}