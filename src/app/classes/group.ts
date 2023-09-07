interface IdentifiableObj {
    id: string,
    name: string,
    desc: string
}

export interface Group extends IdentifiableObj {
    channels: Channel[]
    requests: string[]
}

export interface Channel extends IdentifiableObj{
    messages: Message[]
}

export interface Message {
    userId: string,
    content: string,
    timestamp: Date
}