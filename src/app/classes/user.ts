type Role = Record<string, number>
export interface User {
    _id: string,
    username: string,
    email: string,
    password?: string,
    roles: Roles,
    groups: string[]
    img?: string
}

export interface Roles {
    global: string
}